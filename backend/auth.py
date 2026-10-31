"""Local demo authentication and role enforcement for the road monitor."""

from functools import wraps
from threading import Lock
from time import time

from flask import Blueprint, jsonify, request, session

from database.database import (
    get_activity,
    get_user_by_username,
    record_activity,
)

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")
_attempts = {}
_attempts_lock = Lock()
LOGIN_WINDOW_SECONDS = 15 * 60
MAX_LOGIN_ATTEMPTS = 10


def current_user():
    if not session.get("user_id"):
        return None
    return {
        "id": session["user_id"],
        "username": session["username"],
        "name": session["name"],
        "role": session["role"],
    }


def require_roles(*roles):
    """Protect an API route and optionally restrict it to selected roles."""

    def decorate(view):
        @wraps(view)
        def wrapped(*args, **kwargs):
            user = current_user()
            if user is None:
                return jsonify({"success": False, "message": "Please sign in to continue."}), 401
            if roles and user["role"] not in roles:
                return jsonify({"success": False, "message": "You do not have access to this feature."}), 403
            return view(*args, **kwargs)

        return wrapped

    return decorate


def _rate_limited(ip_address):
    now = time()
    with _attempts_lock:
        attempts = [stamp for stamp in _attempts.get(ip_address, []) if now - stamp < LOGIN_WINDOW_SECONDS]
        _attempts[ip_address] = attempts
        return len(attempts) >= MAX_LOGIN_ATTEMPTS


def _record_attempt(ip_address):
    now = time()
    with _attempts_lock:
        attempts = [stamp for stamp in _attempts.get(ip_address, []) if now - stamp < LOGIN_WINDOW_SECONDS]
        attempts.append(now)
        _attempts[ip_address] = attempts


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip().lower()[:80]
    password = str(data.get("password", ""))[:256]
    requested_role = str(data.get("role", "")).strip()
    ip_address = request.remote_addr or "unknown"

    if not username or not password or requested_role not in {"Reporter", "Maintenance Supervisor", "Admin"}:
        return jsonify({"success": False, "message": "Enter your username, password, and account role."}), 400

    if _rate_limited(ip_address):
        return jsonify({"success": False, "message": "Too many sign-in attempts. Please try again in 15 minutes."}), 429

    user = get_user_by_username(username)
    if not user or user["role"] != requested_role or not user["password_hash"]:
        _record_attempt(ip_address)
        record_activity(username or "Unknown", requested_role, "Sign-in failed", "Invalid credentials or role", ip_address)
        return jsonify({"success": False, "message": "Those sign-in details do not match an account."}), 401

    from werkzeug.security import check_password_hash

    if not check_password_hash(user["password_hash"], password):
        _record_attempt(ip_address)
        record_activity(username, requested_role, "Sign-in failed", "Invalid credentials or role", ip_address)
        return jsonify({"success": False, "message": "Those sign-in details do not match an account."}), 401

    session.clear()
    session.permanent = True
    session["user_id"] = user["id"]
    session["username"] = user["username"]
    session["name"] = user["display_name"]
    session["role"] = user["role"]
    record_activity(user["username"], user["role"], "Signed in", "Successful sign-in", ip_address)
    return jsonify({"success": True, "user": current_user()})


@auth_bp.route("/me", methods=["GET"])
def me():
    user = current_user()
    if user is None:
        return jsonify({"success": False, "message": "Not signed in."}), 401
    return jsonify({"success": True, "user": user})


@auth_bp.route("/logout", methods=["POST"])
@require_roles()
def logout():
    user = current_user()
    record_activity(user["username"], user["role"], "Signed out", "User signed out", request.remote_addr or "unknown")
    session.clear()
    return jsonify({"success": True})


@auth_bp.route("/activity", methods=["GET"])
@require_roles("Admin")
def activity():
    return jsonify({"success": True, "activity": get_activity(limit=250)})

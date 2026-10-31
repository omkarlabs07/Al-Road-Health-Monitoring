from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import secrets

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))
except ImportError:
    pass

from database.database import init_db

from routes.upload_routes import upload_bp
from routes.report_routes import report_bp
from routes.dashboard_routes import dashboard_bp
from routes.worker_routes import worker_bp
from auth import auth_bp, current_user
from database.database import report_belongs_to_image
from security import audit_api_activity


# =====================================
# App Setup
# =====================================

app = Flask(__name__)

CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
])
app.config.update(
    SECRET_KEY=os.environ.get("FLASK_SECRET_KEY") or secrets.token_hex(32),
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=os.environ.get("SESSION_COOKIE_SECURE", "false").lower() == "true",
    SESSION_COOKIE_SAMESITE="Lax",
    PERMANENT_SESSION_LIFETIME=8 * 60 * 60,
    MAX_CONTENT_LENGTH=16 * 1024 * 1024,
)


@app.before_request
def protect_session_routes():
    """Use same-origin Vite proxy in development; deny cross-site state changes."""
    if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        origin = request.headers.get("Origin")
        allowed_origins = {"http://localhost:5173", "http://127.0.0.1:5173"}
        if origin and origin not in allowed_origins:
            return jsonify({"success": False, "message": "Request origin is not allowed."}), 403


@app.after_request
def add_security_headers(response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "same-origin")
    return audit_api_activity(response)


# =====================================
# Base Paths
# =====================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads"
)

RESULT_FOLDER = os.path.join(
    BASE_DIR,
    "results"
)


os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

os.makedirs(
    RESULT_FOLDER,
    exist_ok=True
)


# =====================================
# Initialize Database
# =====================================

init_db()


# =====================================
# Register Blueprints
# =====================================

app.register_blueprint(upload_bp)

app.register_blueprint(report_bp)

app.register_blueprint(dashboard_bp)

app.register_blueprint(worker_bp)
app.register_blueprint(auth_bp)


# =====================================
# Home Route
# =====================================

@app.route("/")
def home():

    return {
        "success": True,
        "message": "AI Road Health Monitoring Backend Running"
    }


# =====================================
# Result Images
# =====================================

@app.route("/results/<filename>")
def result_image(filename):
    user = current_user()
    if not user:
        return jsonify({"success": False, "message": "Please sign in to continue."}), 401
    if user["role"] == "Reporter" and not report_belongs_to_image(filename, user["username"]):
        return jsonify({"success": False, "message": "You do not have access to this image."}), 403

    return send_from_directory(
        RESULT_FOLDER,
        filename
    )


# =====================================
# Uploaded Images
# =====================================

@app.route("/uploads/<filename>")
def uploaded_image(filename):
    user = current_user()
    if not user:
        return jsonify({"success": False, "message": "Please sign in to continue."}), 401
    if user["role"] == "Reporter" and not report_belongs_to_image(filename, user["username"]):
        return jsonify({"success": False, "message": "You do not have access to this image."}), 403

    return send_from_directory(
        UPLOAD_FOLDER,
        filename
    )


# =====================================
# Run Server
# =====================================

print("\n========== REGISTERED ROUTES ==========")

for rule in app.url_map.iter_rules():

    print(rule)

print("=======================================\n")


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
    

"""Shared role checks and activity logging for API routes."""

from flask import request, session

from auth import require_roles
from database.database import record_activity


def audit_api_activity(response):
    """Record successful authenticated API usage with a readable action name."""
    endpoint = request.endpoint or ""
    user = session.get("username")
    role = session.get("role")
    if not user or endpoint.startswith("auth.") or response.status_code >= 400:
        return response

    actions = {
        "dashboard.dashboard": "Viewed dashboard",
        "reports.get_reports": "Viewed road reports",
        "reports.set_report_location": "Updated a report location",
        "upload.upload_image": "Submitted a road report",
        "worker.get_workers": "Viewed maintenance team",
        "worker.get_single_worker": "Viewed a worker",
        "worker.create_worker": "Added a worker",
        "worker.edit_worker": "Updated a worker",
        "worker.change_worker_status": "Changed worker status",
        "worker.remove_worker": "Removed a worker",
    }
    action = actions.get(endpoint)
    if action:
        details = request.method
        if endpoint == "upload.upload_image":
            road_name = request.form.get("roadName", "").strip()[:100]
            details = f"Road: {road_name}" if road_name else "Road report submitted"
        elif endpoint in {"worker.get_single_worker", "worker.edit_worker", "worker.change_worker_status", "worker.remove_worker"}:
            details = f"Worker #{request.view_args.get('worker_id', '')}"
        elif endpoint == "reports.set_report_location":
            details = f"Report #{request.view_args.get('report_id', '')}"
        record_activity(user, role, action, details, request.remote_addr or "unknown")
    return response

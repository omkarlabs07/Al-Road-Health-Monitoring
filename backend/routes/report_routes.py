from flask import Blueprint, jsonify, request, session
from database.database import get_all_reports, update_report_location
from auth import require_roles

report_bp = Blueprint("reports", __name__)


@report_bp.route("/reports", methods=["GET"])
@require_roles("Reporter", "Maintenance Supervisor", "Admin")
def get_reports():

    reports = get_all_reports(owner_username=session.get("username") if session.get("role") == "Reporter" else None)

    report_list = []

    for report in reports:

        report_list.append({

            "id": report["id"],
            "road_name": report["road_name"],
            "area": report["area"],
            "latitude": report["latitude"],
            "longitude": report["longitude"],
            "potholes": report["potholes"],
            "score": report["score"],
            "condition": report["condition"],
            "severity": report["severity"],
            "confidence": report["confidence"],
            "recommendation": report["recommendation"],
            "analysis_time": report["analysis_time"],
            "image": report["image"],
            "submitted_by": report["owner_username"]

        })

    return jsonify({
        "success": True,
        "reports": report_list
    })


@report_bp.route("/reports/<int:report_id>/location", methods=["PUT"])
@require_roles("Maintenance Supervisor", "Admin")
def set_report_location(report_id):

    data = request.get_json(silent=True) or {}

    try:
        latitude = float(data.get("latitude"))
        longitude = float(data.get("longitude"))
    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "message": "Valid latitude and longitude are required."
        }), 400

    if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
        return jsonify({
            "success": False,
            "message": "The selected coordinates are outside the valid range."
        }), 400

    updated = update_report_location(report_id, latitude, longitude)
    if not updated:
        return jsonify({
            "success": False,
            "message": "Report not found."
        }), 404

    return jsonify({
        "success": True,
        "latitude": latitude,
        "longitude": longitude
    })

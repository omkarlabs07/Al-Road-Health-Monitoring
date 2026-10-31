from flask import Blueprint, jsonify
from database.database import get_all_reports
from auth import require_roles


dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/dashboard", methods=["GET"])
@require_roles("Maintenance Supervisor", "Admin")
def dashboard():

    reports = get_all_reports()

    # ==============================
    # BASIC STATISTICS
    # ==============================

    total_reports = len(reports)

    total_potholes = sum(
        report["potholes"] or 0
        for report in reports
    )

    critical_roads = sum(
        1
        for report in reports
        if report["severity"] == "High"
    )

    average_score = 0

    if total_reports > 0:

        average_score = round(
            sum(
                report["score"] or 0
                for report in reports
            ) / total_reports,
            2
        )

    # ==============================
    # RECENT REPORTS
    # ==============================

    recent_reports = []

    for report in reports[:10]:

        recent_reports.append({

            "id": report["id"],

            "road_name": report["road_name"],

            "area": report["area"],

            "latitude": report["latitude"],

            "longitude": report["longitude"],

            # IMPORTANT:
            # Potholes was missing earlier.
            "potholes": report["potholes"] or 0,

            "score": report["score"] or 0,

            "condition": report["condition"],

            "severity": report["severity"],

            "confidence": report["confidence"],

            "recommendation": report["recommendation"],

            "analysis_time": report["analysis_time"],

            "image": report["image"]

        })

    # ==============================
    # RESPONSE
    # ==============================

    return jsonify({

        "success": True,

        "total_reports": total_reports,

        "total_potholes": total_potholes,

        "critical_roads": critical_roads,

        "average_score": average_score,

        "recent_reports": recent_reports

    })

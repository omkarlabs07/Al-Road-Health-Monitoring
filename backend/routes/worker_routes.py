from flask import Blueprint, request, jsonify

from database.database import (
    add_worker,
    get_all_workers,
    get_worker,
    update_worker,
    update_worker_status,
    delete_worker
)
from auth import require_roles


# =========================================
# WORKER BLUEPRINT
# =========================================

worker_bp = Blueprint(
    "worker",
    __name__,
    url_prefix="/workers"
)


# =========================================
# GET ALL WORKERS
# =========================================

@worker_bp.route("/", methods=["GET"])
@require_roles("Maintenance Supervisor", "Admin")
def get_workers():

    workers = get_all_workers()

    workers_list = []

    for worker in workers:

        workers_list.append({
            "id": worker["id"],
            "name": worker["name"],
            "phone": worker["phone"],
            "area": worker["area"],
            "road": worker["road"],
            "task": worker["task"],
            "status": worker["status"],
            "created_at": worker["created_at"]
        })

    return jsonify(workers_list), 200


# =========================================
# GET SINGLE WORKER
# =========================================

@worker_bp.route("/<int:worker_id>", methods=["GET"])
@require_roles("Maintenance Supervisor", "Admin")
def get_single_worker(worker_id):

    worker = get_worker(worker_id)

    if worker is None:
        return jsonify({
            "error": "Worker not found"
        }), 404

    return jsonify({
        "id": worker["id"],
        "name": worker["name"],
        "phone": worker["phone"],
        "area": worker["area"],
        "road": worker["road"],
        "task": worker["task"],
        "status": worker["status"],
        "created_at": worker["created_at"]
    }), 200


# =========================================
# ADD NEW WORKER
# =========================================

@worker_bp.route("/", methods=["POST"])
@require_roles("Maintenance Supervisor", "Admin")
def create_worker():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No data provided"
        }), 400

    name = data.get("name")
    phone = data.get("phone", "")
    area = data.get("area", "")
    road = data.get("road", "")
    task = data.get("task", "")
    status = data.get("status", "Available")

    if not name:
        return jsonify({
            "error": "Worker name is required"
        }), 400

    worker_id = add_worker(
        name=name,
        phone=phone,
        area=area,
        road=road,
        task=task,
        status=status
    )

    return jsonify({
        "message": "Worker added successfully",
        "worker_id": worker_id
    }), 201


# =========================================
# UPDATE WORKER
# =========================================

@worker_bp.route("/<int:worker_id>", methods=["PUT"])
@require_roles("Maintenance Supervisor", "Admin")
def edit_worker(worker_id):

    worker = get_worker(worker_id)

    if worker is None:
        return jsonify({
            "error": "Worker not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No data provided"
        }), 400

    name = data.get("name", worker["name"])
    phone = data.get("phone", worker["phone"])
    area = data.get("area", worker["area"])
    road = data.get("road", worker["road"])
    task = data.get("task", worker["task"])
    status = data.get("status", worker["status"])

    update_worker(
        worker_id,
        name,
        phone,
        area,
        road,
        task,
        status
    )

    return jsonify({
        "message": "Worker updated successfully"
    }), 200


# =========================================
# UPDATE WORKER STATUS
# =========================================

@worker_bp.route("/<int:worker_id>/status", methods=["PUT"])
@require_roles("Maintenance Supervisor", "Admin")
def change_worker_status(worker_id):

    worker = get_worker(worker_id)

    if worker is None:
        return jsonify({
            "error": "Worker not found"
        }), 404

    data = request.get_json()

    if not data or "status" not in data:
        return jsonify({
            "error": "Status is required"
        }), 400

    status = data["status"]

    allowed_statuses = [
        "Available",
        "Assigned",
        "Busy"
    ]

    if status not in allowed_statuses:
        return jsonify({
            "error": "Invalid status",
            "allowed_statuses": allowed_statuses
        }), 400

    update_worker_status(
        worker_id,
        status
    )

    return jsonify({
        "message": "Worker status updated successfully",
        "status": status
    }), 200


# =========================================
# DELETE WORKER
# =========================================

@worker_bp.route("/<int:worker_id>", methods=["DELETE"])
@require_roles("Maintenance Supervisor", "Admin")
def remove_worker(worker_id):

    worker = get_worker(worker_id)

    if worker is None:
        return jsonify({
            "error": "Worker not found"
        }), 404

    delete_worker(worker_id)

    return jsonify({
        "message": "Worker deleted successfully"
    }), 200

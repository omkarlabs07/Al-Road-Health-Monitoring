from flask import Blueprint, request, jsonify, session
import os
import json
import time
from threading import Lock
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import uuid
from werkzeug.utils import secure_filename
from PIL import Image

from services.detection_service import detect_potholes
from database.database import save_report
from auth import require_roles


# =====================================
# BLUEPRINT
# =====================================

upload_bp = Blueprint("upload", __name__)

GEOCODING_SEARCH_URL = os.environ.get(
    "GEOCODING_SEARCH_URL",
    "https://nominatim.openstreetmap.org/search",
)
GEOCODING_CACHE_TTL = 24 * 60 * 60
_geocoding_cache = {}
_geocoding_lock = Lock()
_last_geocoding_request = 0.0


# =====================================
# BASE DIRECTORY
# =====================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)


# =====================================
# UPLOAD FOLDER
# =====================================

UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads"
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# =====================================
# ALLOWED IMAGE TYPES
# =====================================

ALLOWED_EXTENSIONS = {
    "jpg",
    "jpeg",
    "png",
    "webp",
    "jfif",
    "bmp",
    "tif",
    "tiff",
    "heic",
    "heif"
}


@upload_bp.route("/geocode", methods=["GET"])
@require_roles("Reporter", "Maintenance Supervisor", "Admin")
def search_place():
    """Find a user-requested place and return coordinates for the road map."""
    query = " ".join(request.args.get("q", "").split())

    if len(query) < 3 or len(query) > 200:
        return jsonify({
            "success": False,
            "message": "Enter a place or address between 3 and 200 characters.",
        }), 400

    cache_key = query.casefold()
    now = time.time()
    cached = _geocoding_cache.get(cache_key)
    if cached and now - cached["time"] < GEOCODING_CACHE_TTL:
        return jsonify({"success": True, "results": cached["results"]})

    global _last_geocoding_request

    try:
        with _geocoding_lock:
            cached = _geocoding_cache.get(cache_key)
            if cached and time.time() - cached["time"] < GEOCODING_CACHE_TTL:
                return jsonify({"success": True, "results": cached["results"]})

            # Keep user-triggered searches below the public provider's limit.
            wait = 1.0 - (time.monotonic() - _last_geocoding_request)
            if wait > 0:
                time.sleep(wait)

            _last_geocoding_request = time.monotonic()
            params = urlencode({
                "q": query,
                "format": "jsonv2",
                "limit": 5,
                "addressdetails": 1,
            })
            provider_request = Request(
                f"{GEOCODING_SEARCH_URL}?{params}",
                headers={
                    "User-Agent": "AI-Road-Health-Monitoring/1.0",
                    "Accept": "application/json",
                },
            )

            with urlopen(provider_request, timeout=12) as response:
                places = json.loads(response.read().decode("utf-8"))

            results = [
                {
                    "latitude": place.get("lat"),
                    "longitude": place.get("lon"),
                    "displayName": place.get("display_name", ""),
                }
                for place in places
                if place.get("lat") is not None and place.get("lon") is not None
            ]

            if len(_geocoding_cache) >= 200:
                _geocoding_cache.pop(next(iter(_geocoding_cache)))
            _geocoding_cache[cache_key] = {
                "time": time.time(),
                "results": results,
            }

        return jsonify({"success": True, "results": results})
    except (URLError, TimeoutError, json.JSONDecodeError) as error:
        print(f"Place search failed: {error}")
        return jsonify({
            "success": False,
            "message": "Place search is temporarily unavailable. Try again later.",
        }), 502


# =====================================
# UPLOAD ROUTE
# =====================================

@upload_bp.route("/upload", methods=["POST"])
@require_roles("Reporter", "Maintenance Supervisor", "Admin")
def upload_image():

    try:

        # =====================================
        # CHECK IMAGE
        # =====================================

        if "image" not in request.files:

            return jsonify({
                "success": False,
                "message": "No image uploaded."
            }), 400


        image = request.files["image"]


        if image.filename == "":

            return jsonify({
                "success": False,
                "message": "No file selected."
            }), 400


        # =====================================
        # ORIGINAL FILENAME
        # =====================================

        original_filename = secure_filename(
            image.filename
        )


        # =====================================
        # CHECK EXTENSION
        # =====================================

        if "." not in original_filename:

            return jsonify({
                "success": False,
                "message": "Invalid image file."
            }), 400


        extension = original_filename.rsplit(
            ".",
            1
        )[1].lower()


        if extension not in ALLOWED_EXTENSIONS:

            return jsonify({
                "success": False,
                "message": (
                    "Please upload a valid road image "
                    "(JPG, JPEG, PNG, WEBP, JFIF, BMP, TIFF)."
                )
            }), 400


        # =====================================
        # RECEIVE FORM DATA
        # =====================================

        road_name = request.form.get(
            "roadName",
            ""
        )

        area = request.form.get(
            "area",
            ""
        )

        latitude = request.form.get(
            "latitude",
            ""
        )

        longitude = request.form.get(
            "longitude",
            ""
        )


        # =====================================
        # CREATE UNIQUE FILENAME
        # =====================================

        unique_id = uuid.uuid4().hex[:8]


        # =====================================
        # CONVERT ALL IMAGES TO JPG
        # =====================================

        final_filename = (
            "road_"
            + unique_id
            + ".jpg"
        )


        final_path = os.path.join(
            UPLOAD_FOLDER,
            final_filename
        )


        # =====================================
        # OPEN IMAGE
        # =====================================

        try:

            img = Image.open(image)

            # Convert image to RGB
            if img.mode != "RGB":
                img = img.convert("RGB")

            # Resize big images to save server memory
            img.thumbnail((1024, 1024))

            # Save as JPG
            img.save(
                final_path,
                "JPEG",
                quality=85
            )

        except Exception as e:

            print("IMAGE CONVERSION ERROR:", str(e))

            return jsonify({
                "success": False,
                "error_type": "IMAGE_ERROR",
                "message": (
                    "Unable to process this image. "
                    "Please upload a valid road image."
                )
            }), 400


        print("====================================")
        print("IMAGE SAVED")
        print("Original:", original_filename)
        print("Saved:", final_filename)
        print("Path:", final_path)
        print("====================================")


        # =====================================
        # AI DETECTION
        # =====================================

        try:

            detection = detect_potholes(
                final_path
            )

        except Exception as e:

            print("====================================")
            print("AI DETECTION ERROR")
            print("====================================")
            print(str(e))
            print("====================================")


            return jsonify({

                "success": False,

                "error_type": "AI_DETECTION_ERROR",

                "message": (
                    "Unable to analyze this road image. "
                    "Please try another image."
                )

            }), 500


        # =====================================
        # SAVE REPORT
        # =====================================

        try:

            save_report(

                road_name=road_name,

                area=area,

                latitude=latitude,

                longitude=longitude,

                potholes=detection["count"],

                score=detection["score"],

                condition=detection["condition"],

                severity=detection["severity"],

                confidence=detection["confidence"],

                recommendation=detection["recommendation"],

                image=detection["result_image"],
                owner_username=session.get("username"),
                source_image=final_filename,

            )

        except Exception as e:

            print("====================================")
            print("DATABASE ERROR")
            print("====================================")
            print(str(e))
            print("====================================")


            return jsonify({

                "success": False,

                "error_type": "DATABASE_ERROR",

                "message": (
                    "Road analysis completed, "
                    "but report could not be saved."
                )

            }), 500


        # =====================================
        # SUCCESS RESPONSE
        # =====================================

        return jsonify({

            "success": True,

            "message": (
                "Road Analysis Completed Successfully"
            ),

            "road_name": road_name,

            "area": area,

            "latitude": latitude,

            "longitude": longitude,

            "filename": final_filename,

            "original_filename": original_filename,

            "potholes": detection["count"],

            "score": detection["score"],

            "condition": detection["condition"],

            "severity": detection["severity"],

            "confidence": detection["confidence"],

            "recommendation": detection["recommendation"],

            "analysis_time": detection["analysis_time"],

            "detected_image": detection["result_image"]

        })


    # =====================================
    # UNEXPECTED SERVER ERROR
    # =====================================

    except Exception as e:

        print("====================================")
        print("UPLOAD SERVER ERROR")
        print("====================================")
        print(str(e))
        print("====================================")


        return jsonify({

            "success": False,

            "error_type": "SERVER_ERROR",

            "message": (
                "Something went wrong while "
                "processing the road image."
            )

        }), 500
    
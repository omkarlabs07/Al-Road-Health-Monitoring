from utils.road_health import calculate_health
from ultralytics import YOLO
import os
import cv2
from datetime import datetime

# =====================================
# BASE DIRECTORY
# =====================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# =====================================
# YOLO MODEL
# =====================================

WEIGHT_PATH = os.path.join(BASE_DIR, "weights", "best.pt")

model = YOLO(WEIGHT_PATH)

# =====================================
# RESULT FOLDER
# =====================================

RESULT_FOLDER = os.path.join(BASE_DIR, "results")
os.makedirs(RESULT_FOLDER, exist_ok=True)


# =====================================
# DETECT POTHOLES
# =====================================

def detect_potholes(image_path):

    try:

        # ---------------------------------
        # Check image exists
        # ---------------------------------

        if not os.path.exists(image_path):
            raise Exception("Uploaded image not found.")

        # ---------------------------------
        # Read image
        # ---------------------------------

        image = cv2.imread(image_path)

        if image is None:
            raise Exception("Unable to read uploaded image.")

        # ---------------------------------
        # YOLO Detection
        # ---------------------------------

        results = model.predict(
            source=image,
            conf=0.25,
            verbose=False
        )

        result = results[0]

        # ---------------------------------
        # Pothole Count
        # ---------------------------------

        pothole_count = 0

        if result.boxes is not None:
            pothole_count = len(result.boxes)

        # ---------------------------------
        # Confidence
        # ---------------------------------

        confidence = 0

        if result.boxes is not None and len(result.boxes) > 0:

            confidence = round(
                float(result.boxes.conf.mean()) * 100,
                2
            )

        # ---------------------------------
        # Output Image
        # ---------------------------------

        output_filename = "detected_" + os.path.basename(image_path)

        output_path = os.path.join(
            RESULT_FOLDER,
            output_filename
        )

        plotted = result.plot()

        success = cv2.imwrite(
            output_path,
            plotted
        )

        if not success:
            raise Exception("Unable to save detected image.")

        # ---------------------------------
        # Road Health
        # ---------------------------------

        health = calculate_health(pothole_count)

        score = health["score"]
        condition = health["condition"]

        # ---------------------------------
        # Severity
        # ---------------------------------

        if pothole_count == 0:

            severity = "Excellent"

        elif pothole_count <= 2:

            severity = "Low"

        elif pothole_count <= 5:

            severity = "Medium"

        else:

            severity = "High"

        # ---------------------------------
        # Recommendation
        # ---------------------------------

        if pothole_count == 0:

            recommendation = (
                "No potholes detected. "
                "Road is in excellent condition."
            )

        elif pothole_count <= 2:

            recommendation = (
                "Minor potholes detected. "
                "Routine maintenance is recommended."
            )

        elif pothole_count <= 5:

            recommendation = (
                "Multiple potholes detected. "
                "Repair is recommended within 30 days."
            )

        else:

            recommendation = (
                "Several potholes detected. "
                "Immediate road maintenance is required."
            )

        # ---------------------------------
        # Return Result
        # ---------------------------------

        return {

            "count": pothole_count,

            "score": score,

            "condition": condition,

            "severity": severity,

            "confidence": confidence,

            "recommendation": recommendation,

            "analysis_time": datetime.now().strftime(
                "%d-%m-%Y %I:%M %p"
            ),

            "result_image": output_filename

        }

    except Exception as e:

        print("====================================")
        print("AI DETECTION ERROR")
        print("====================================")
        print(str(e))
        print("====================================")

        raise
    
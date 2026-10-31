def calculate_health(pothole_count):

    if pothole_count == 0:

        return {
            "score": 100,
            "condition": "Excellent"
        }

    elif pothole_count <= 2:

        return {
            "score": 90,
            "condition": "Good"
        }

    elif pothole_count <= 5:

        return {
            "score": 70,
            "condition": "Fair"
        }

    elif pothole_count <= 8:

        return {
            "score": 50,
            "condition": "Poor"
        }

    else:

        return {
            "score": 20,
            "condition": "Critical"
        }
    
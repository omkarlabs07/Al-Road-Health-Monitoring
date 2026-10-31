import { useState } from "react";
import axios from "axios";

import {
  FaCloudUploadAlt,
  FaRoad,
  FaMapMarkerAlt,
  FaGlobe,
  FaSearch,
  FaCheckCircle,
  FaTimes,
  FaImage,
  FaLocationArrow,
} from "react-icons/fa";

import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/Upload.css";


export default function Upload() {

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [roadName, setRoadName] = useState("");
  const [area, setArea] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState(null);
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeResults, setPlaceResults] = useState([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [placeSearchMessage, setPlaceSearchMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage({
        type: "error",
        text: "Location is not supported by this browser. Enter the coordinates manually.",
      });
      return;
    }

    setLocating(true);
    setLocationMessage(null);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLatitude(coords.latitude.toFixed(6));
        setLongitude(coords.longitude.toFixed(6));
        setLocationMessage({
          type: "success",
          text: "Location added. Use this while you are at or near the road being reported.",
        });
        setLocating(false);
      },
      (error) => {
        const message = {
          1: "Location permission was denied. Allow location access for localhost in your browser settings, then try again.",
          2: "Your device could not determine its location. Turn on device location and try again.",
          3: "Location took too long. Try again outdoors or near a window.",
        }[error.code] || "Could not get your location. Please try again or enter it manually.";

        setLocationMessage({ type: "error", text: message });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 30000 }
    );
  };

  const searchPlace = async (event) => {
    event.preventDefault();

    if (placeQuery.trim().length < 3) {
      setPlaceSearchMessage("Enter a road, area, or city name to search.");
      return;
    }

    setSearchingPlaces(true);
    setPlaceSearchMessage("");
    setPlaceResults([]);

    try {
      const response = await axios.get("/api/geocode", {
        params: { q: placeQuery.trim() },
      });
      const results = Array.isArray(response.data?.results)
        ? response.data.results
        : [];

      setPlaceResults(results);
      if (results.length === 0) {
        setPlaceSearchMessage("No matches found. Try adding the city or area name.");
      }
    } catch (error) {
      setPlaceSearchMessage(
        error.response?.data?.message ||
          "Place search failed. Check that the backend is running and try again."
      );
    } finally {
      setSearchingPlaces(false);
    }
  };

  const selectPlace = (place) => {
    setLatitude(Number(place.latitude).toFixed(6));
    setLongitude(Number(place.longitude).toFixed(6));
    setLocationMessage({
      type: "success",
      text: "Coordinates added from the selected place. Check that you chose the right road before submitting.",
    });
    setPlaceResults([]);
  };


  // =====================================
  // IMAGE VALIDATION
  // =====================================

  const isValidImage = (file) => {

    if (!file) return false;

    const allowedExtensions = [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "jfif",
      "bmp",
      "tif",
      "tiff",
      "heic",
      "heif",
    ];

    const fileName = file.name.toLowerCase();

    const extension = fileName.includes(".")
      ? fileName.split(".").pop()
      : "";

    return allowedExtensions.includes(extension);
  };


  // =====================================
  // SET IMAGE
  // =====================================

  const selectImage = (file) => {

    if (!file) return;


    if (!isValidImage(file)) {

      alert(
        "Please select a valid road image.\n\n" +
        "Supported formats:\n" +
        "JPG, JPEG, PNG, WEBP, JFIF, BMP, TIFF"
      );

      return;
    }


    setImage(file);

    setPreview(
      URL.createObjectURL(file)
    );

    setResult(null);
  };


  // =====================================
  // FILE INPUT
  // =====================================

  const handleImage = (e) => {

    const file = e.target.files?.[0];

    selectImage(file);
  };


  // =====================================
  // DRAG & DROP
  // =====================================

  const handleDrop = (e) => {

    e.preventDefault();

    const file =
      e.dataTransfer.files?.[0];

    selectImage(file);
  };


  // =====================================
  // UPLOAD IMAGE
  // =====================================

  const uploadImage = async () => {

    if (!image) {

      alert(
        "Please select a road image."
      );

      return;
    }


    if (!roadName.trim()) {

      alert(
        "Please enter road name."
      );

      return;
    }


    if (!area.trim()) {

      alert(
        "Please enter area."
      );

      return;
    }

    const latitudeValue = Number(latitude);
    const longitudeValue = Number(longitude);
    if (
      !latitude.trim() ||
      !longitude.trim() ||
      !Number.isFinite(latitudeValue) ||
      !Number.isFinite(longitudeValue) ||
      latitudeValue < -90 ||
      latitudeValue > 90 ||
      longitudeValue < -180 ||
      longitudeValue > 180
    ) {
      alert(
        "Choose the road's location using current location or place search before submitting."
      );
      return;
    }


    const formData = new FormData();

    formData.append(
      "image",
      image
    );

    formData.append(
      "roadName",
      roadName
    );

    formData.append(
      "area",
      area
    );

    formData.append(
      "latitude",
      latitude
    );

    formData.append(
      "longitude",
      longitude
    );


    try {

      setLoading(true);
      setResult(null);


      const response = await axios.post(
        "/api/upload",
        formData
      );


      console.log(
        "Backend Response:",
        response.data
      );


      if (
        response.data &&
        response.data.success
      ) {

        setResult(
          response.data
        );

      } else {

        alert(
          response.data?.message ||
          "Road analysis failed."
        );
      }


    } catch (error) {

      console.error(
        "UPLOAD ERROR:",
        error
      );


      // =====================================
      // BACKEND ERROR
      // =====================================

      if (error.response) {

        const message =
          error.response.data?.message ||
          "Backend could not process this image.";

        alert(message);

      }


      // =====================================
      // BACKEND NOT RUNNING
      // =====================================

      else if (error.request) {

        alert(
          "Backend server is not responding.\n\n" +
          "Please make sure Flask is running on:\n" +
          "http://127.0.0.1:5000"
        );

      }


      // =====================================
      // OTHER ERROR
      // =====================================

      else {

        alert(
          "Something went wrong while uploading the image."
        );
      }

    } finally {

      setLoading(false);
    }
  };


  // =====================================
  // CLEAR IMAGE
  // =====================================

  const clearImage = () => {

    setImage(null);
    setPreview(null);
    setResult(null);
  };


  // =====================================
  // CONDITION CLASS
  // =====================================

  const getConditionClass = (
    condition
  ) => {

    if (!condition) return "";

    const value =
      condition.toLowerCase();


    if (value === "excellent")
      return "excellent";

    if (value === "good")
      return "good";

    if (value === "fair")
      return "fair";

    if (value === "poor")
      return "poor";

    if (value === "critical")
      return "critical";


    return "";
  };


  // =====================================
  // UI
  // =====================================

  return (

    <DashboardLayout>

      <div className="upload-page">


        {/* =====================================
            HEADER
        ===================================== */}

        <div className="upload-header">

          <div>

            <div className="upload-title">

              <div className="upload-title-icon">
                <FaRoad />
              </div>

              <div>

                <h1>
                  AI Road Health Analysis
                </h1>

                <p>
                  Upload a road image and let AI
                  analyze its health condition.
                </p>

              </div>

            </div>

          </div>


          <div className="ai-status">

            <span></span>

            AI System Ready

          </div>

        </div>


        {/* =====================================
            MAIN CARD
        ===================================== */}

        <div className="upload-card">


          {/* ROAD INFORMATION */}

          <div className="section-heading">

            <div className="section-number">
              01
            </div>

            <div>

              <h2>
                Road Information
              </h2>

              <p>
                Enter the location details of the road.
              </p>

            </div>

          </div>

          <div className="location-tool">
            <button
              type="button"
              className="location-detect-btn"
              onClick={useCurrentLocation}
              disabled={locating}
            >
              <FaLocationArrow />
              {locating ? "Getting location..." : "Use My Current Location"}
            </button>
            <p>
              Allow the browser location request while you are at the road.
              Coordinates will fill in automatically.
            </p>
            {locationMessage && (
              <p
                className={`location-message ${locationMessage.type}`}
                role={locationMessage.type === "error" ? "alert" : "status"}
              >
                {locationMessage.text}
              </p>
            )}

            <form className="place-search" onSubmit={searchPlace}>
              <label htmlFor="place-search-input">
                Or search for a different road or place
              </label>
              <div className="place-search-controls">
                <input
                  id="place-search-input"
                  type="search"
                  value={placeQuery}
                  onChange={(event) => setPlaceQuery(event.target.value)}
                  placeholder="Road, area, city (e.g. Marine Drive, Mumbai)"
                  maxLength={200}
                />
                <button
                  type="submit"
                  className="location-detect-btn"
                  disabled={searchingPlaces}
                >
                  {searchingPlaces ? "Searching..." : "Search Place"}
                </button>
              </div>
              <p className="place-search-attribution">
                Your search text is sent to OpenStreetMap to find a match.
                Search manually, then choose the correct result. Results by{" "}
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noreferrer"
                >
                  OpenStreetMap contributors
                </a>.
              </p>
              {placeSearchMessage && (
                <p className="location-message error" role="status">
                  {placeSearchMessage}
                </p>
              )}
              {placeResults.length > 0 && (
                <ul className="place-results" aria-label="Place search results">
                  {placeResults.map((place) => (
                    <li key={`${place.latitude},${place.longitude}`}>
                      <button
                        type="button"
                        onClick={() => selectPlace(place)}
                      >
                        <FaMapMarkerAlt aria-hidden="true" />
                        <span>{place.displayName}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </form>
          </div>


          <div className="form-grid">


            {/* ROAD NAME */}

            <div className="form-group">

              <label>

                <FaRoad />

                Road Name

              </label>

              <input
                type="text"
                placeholder="e.g. LBS Marg"
                value={roadName}
                onChange={(e) =>
                  setRoadName(e.target.value)
                }
              />

            </div>


            {/* AREA */}

            <div className="form-group">

              <label>

                <FaMapMarkerAlt />

                Area

              </label>

              <input
                type="text"
                placeholder="e.g. Powai, Mumbai"
                value={area}
                onChange={(e) =>
                  setArea(e.target.value)
                }
              />

            </div>


            {/* LATITUDE */}

            <div className="form-group">

              <label>

                <FaGlobe />

                Latitude

              </label>

              <input
                type="text"
                placeholder="e.g. 19.1176"
                value={latitude}
                onChange={(e) =>
                  setLatitude(e.target.value)
                }
              />

            </div>


            {/* LONGITUDE */}

            <div className="form-group">

              <label>

                <FaGlobe />

                Longitude

              </label>

              <input
                type="text"
                placeholder="e.g. 72.9060"
                value={longitude}
                onChange={(e) =>
                  setLongitude(e.target.value)
                }
              />

            </div>

          </div>


          <div className="section-divider"></div>


          {/* =====================================
              IMAGE SECTION
          ===================================== */}

          <div className="section-heading">

            <div className="section-number">
              02
            </div>

            <div>

              <h2>
                Road Image
              </h2>

              <p>
                Upload a clear image of the road.
              </p>

            </div>

          </div>


          {!preview ? (

            <label
              className="upload-dropzone"

              onDragOver={(e) =>
                e.preventDefault()
              }

              onDrop={handleDrop}
            >

              <input
                type="file"

                accept="
                  .jpg,
                  .jpeg,
                  .png,
                  .webp,
                  .jfif,
                  .bmp,
                  .tif,
                  .tiff,
                  .heic,
                  .heif,
                  image/*
                "

                onChange={handleImage}
              />


              <div className="upload-cloud-icon">

                <FaCloudUploadAlt />

              </div>


              <h3>
                Upload Road Image
              </h3>


              <p>
                Drag & drop your image here
              </p>


              <span>
                or click to browse from your computer
              </span>


              <small>
                Supported formats: JPG, JPEG, PNG,
                WEBP, JFIF, BMP, TIFF
              </small>

            </label>

          ) : (

            <div className="image-preview-container">


              <div className="preview-header">

                <div>

                  <h3>
                    Selected Image
                  </h3>

                  <p>
                    {image?.name}
                  </p>

                </div>


                <button
                  className="remove-image"
                  onClick={clearImage}
                >

                  <FaTimes />

                </button>

              </div>


              <div className="preview-image-wrapper">

                <img
                  src={preview}
                  alt="Road Preview"
                />

              </div>

            </div>

          )}


          {/* =====================================
              ANALYZE BUTTON
          ===================================== */}

          <button
            className="analyze-btn"

            onClick={uploadImage}

            disabled={loading}
          >

            {loading ? (

              <>

                <span className="button-spinner"></span>

                AI Analyzing Road...

              </>

            ) : (

              <>

                <FaSearch />

                Analyze Road

              </>

            )}

          </button>


          {/* =====================================
              LOADING
          ===================================== */}

          {loading && (

            <div className="analysis-progress">

              <div className="progress-loader"></div>

              <div>

                <strong>
                  AI is analyzing your road...
                </strong>

                <p>
                  Detecting potholes and calculating
                  road health score.
                </p>

              </div>

            </div>

          )}

        </div>


        {/* =====================================
            RESULT
        ===================================== */}

        {result && (

          <div className="result-card">


            <div className="result-header">

              <div>

                <div className="result-title">

                  <FaCheckCircle />

                  <h2>
                    Road Analysis Completed
                  </h2>

                </div>


                <p>
                  AI analysis has successfully
                  processed your road image.
                </p>

              </div>


              <span className="completed-badge">
                Completed
              </span>

            </div>


            <div className="result-grid">


              {/* RESULT IMAGE */}

              <div className="result-image-section">

                <div className="result-section-title">

                  <FaImage />

                  <span>
                    AI Detection Result
                  </span>

                </div>


                {result.detected_image ? (

                  <img
                    src={`/api/results/${result.detected_image}`}
                    alt="Detected Road"
                    className="result-image"
                  />

                ) : (

                  <div className="no-result-image">

                    Detected image not available.

                  </div>

                )}

              </div>


              {/* RESULT DETAILS */}

              <div className="result-details">


                <div className="result-section-title">

                  <FaRoad />

                  <span>
                    Analysis Summary
                  </span>

                </div>


                <div className="result-stat-grid">


                  <div className="result-stat">

                    <span>
                      Potholes
                    </span>

                    <strong>
                      {result.potholes ?? 0}
                    </strong>

                  </div>


                  <div className="result-stat">

                    <span>
                      Health Score
                    </span>

                    <strong>

                      {result.score ?? 0}

                      <small>
                        /100
                      </small>

                    </strong>

                  </div>

                </div>


                <div className="result-info">


                  <div>

                    <span>
                      Road
                    </span>

                    <strong>
                      {result.road_name ||
                        roadName ||
                        "N/A"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Area
                    </span>

                    <strong>
                      {result.area ||
                        area ||
                        "N/A"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Latitude
                    </span>

                    <strong>
                      {result.latitude ||
                        latitude ||
                        "N/A"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Longitude
                    </span>

                    <strong>
                      {result.longitude ||
                        longitude ||
                        "N/A"}
                    </strong>

                  </div>

                </div>


                {/* CONDITION */}

                <div className="condition-result">

                  <span>
                    Road Condition
                  </span>


                  <div
                    className={`result-condition ${getConditionClass(
                      result.condition
                    )}`}
                  >

                    {result.condition ||
                      "Unknown"}

                  </div>

                </div>


                {/* MESSAGE */}

                <div className="result-message">

                  <FaCheckCircle />

                  <p>

                    {result.message ||
                      "Road analysis completed successfully."}

                  </p>

                </div>


              </div>

            </div>

          </div>

        )}

      </div>

    </DashboardLayout>
  );
}

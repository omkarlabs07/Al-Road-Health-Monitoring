import { useEffect, useState } from "react";
import axios from "axios";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/map.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function getMarkerColor(condition) {
  const value = String(condition || "").toLowerCase();

  if (value.includes("critical")) return "red";
  if (value.includes("poor")) return "orange";
  if (value.includes("fair")) return "yellow";
  if (value.includes("good") || value.includes("excellent"))
    return "green";

  return "blue";
}

function createCustomIcon(condition) {
  const color = getMarkerColor(condition);

  return L.divIcon({
    className: "custom-road-marker",
    html: `<div class="road-marker ${color}"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
}

export default function Map() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReportId, setEditingReportId] = useState(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [savingLocationId, setSavingLocationId] = useState(null);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchReports = async () => {
      try {
        const response = await axios.get(
          "/api/reports"
        );

        // The backend returns { success, reports }, while older versions may
        // return the report array directly. Normalize both response shapes.
        const reportList = Array.isArray(response.data)
          ? response.data
          : response.data?.reports;

        if (isMounted) {
          setReports(Array.isArray(reportList) ? reportList : []);
        }
      } catch (error) {
        console.error("Error loading map reports:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchReports();

    return () => {
      isMounted = false;
    };
  }, []);

  const openLocationEditor = (report) => {
    setEditingReportId(report.id);
    setLocationQuery([report.road_name, report.area].filter(Boolean).join(", "));
    setLocationResults([]);
    setLocationError("");
  };

  const searchReportLocation = async (event) => {
    event.preventDefault();
    if (locationQuery.trim().length < 3) {
      setLocationError("Enter a road, area, and city to search.");
      return;
    }

    setSearchingLocation(true);
    setLocationError("");
    setLocationResults([]);
    try {
      const response = await axios.get("/api/geocode", {
        params: { q: locationQuery.trim() },
      });
      const results = Array.isArray(response.data?.results)
        ? response.data.results
        : [];
      setLocationResults(results);
      if (results.length === 0) {
        setLocationError("No matches found. Add the city or a nearby area.");
      }
    } catch (error) {
      setLocationError(
        error.response?.data?.message || "Place search failed. Try again."
      );
    } finally {
      setSearchingLocation(false);
    }
  };

  const saveReportLocation = async (reportId, place) => {
    setSavingLocationId(reportId);
    setLocationError("");
    try {
      const latitude = Number(place.latitude);
      const longitude = Number(place.longitude);
      await axios.put(
        `/api/reports/${reportId}/location`,
        { latitude, longitude }
      );
      setReports((currentReports) =>
        currentReports.map((report) =>
          report.id === reportId
            ? { ...report, latitude, longitude }
            : report
        )
      );
      setEditingReportId(null);
      setLocationResults([]);
    } catch (error) {
      setLocationError(
        error.response?.data?.message ||
          "Could not save this location. Check that the backend is running."
      );
    } finally {
      setSavingLocationId(null);
    }
  };

  const validReports = reports.filter((report) => {
    const latitude = Number(report.latitude);
    const longitude = Number(report.longitude);

    return (
      report.latitude !== null &&
      report.longitude !== null &&
      report.latitude !== "" &&
      report.longitude !== "" &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  });

  return (
    <DashboardLayout>
      <div className="map-page">

        <div className="map-header">
          <div>
            <h1>Road Health Map</h1>
            <p>
              Monitor road conditions and pothole locations
              across the area.
            </p>
          </div>

          <div className="map-count">
            📍 {reports.length} Reports · {validReports.length} on map
          </div>
        </div>

        <div className="map-card">

          {loading ? (
            <div className="map-loading">
              Loading road locations...
            </div>
          ) : validReports.length === 0 ? (
            <div className="map-empty">
              <div className="empty-icon">📍</div>
              <h2>No Reports Pinned Yet</h2>
              <p>
                All report statuses are listed below. Add a location to a
                report to place its status marker on the map.
              </p>
            </div>
          ) : (
            <MapContainer
              center={[
                Number(validReports[0].latitude),
                Number(validReports[0].longitude),
              ]}
              zoom={13}
              scrollWheelZoom={true}
              className="road-map"
            >

              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {validReports.map((report) => (
                <Marker
                  key={report.id}
                  position={[
                    Number(report.latitude),
                    Number(report.longitude),
                  ]}
                  icon={createCustomIcon(report.condition)}
                >
                  <Popup>
                    <div className="road-popup">

                      <h3>
                        {report.road_name || "Unknown Road"}
                      </h3>

                      <p>
                        <strong>Area:</strong>{" "}
                        {report.area || "Not available"}
                      </p>

                      <p>
                        <strong>Potholes:</strong>{" "}
                        {report.potholes ?? 0}
                      </p>

                      <p>
                        <strong>Health Score:</strong>{" "}
                        {report.score ?? "N/A"}
                      </p>

                      <p>
                        <strong>Condition:</strong>{" "}
                        {report.condition || "N/A"}
                      </p>

                      <p>
                        <strong>Severity:</strong>{" "}
                        {report.severity || "N/A"}
                      </p>

                    </div>
                  </Popup>
                </Marker>
              ))}

            </MapContainer>
          )}

        </div>

        <section className="map-reports" aria-labelledby="map-reports-title">
          <div className="map-reports-header">
            <div>
              <h2 id="map-reports-title">All Road Report Statuses</h2>
              <p>Every report is listed here; markers use each report's road condition.</p>
            </div>
            <span>{reports.length} reports</span>
          </div>

          {reports.length === 0 ? (
            <p className="map-reports-empty">No road reports have been submitted yet.</p>
          ) : (
            <div className="map-report-list">
              {reports.map((report) => {
                const hasLocation = validReports.some(
                  (locatedReport) => locatedReport.id === report.id
                );

                return (
                  <article className="map-report-item" key={report.id}>
                    <div className="map-report-main">
                      <div className="map-report-title-row">
                        <h3>{report.road_name || "Unknown Road"}</h3>
                        <span className={`map-status-badge ${getMarkerColor(report.condition)}`}>
                          {report.condition || "Status unavailable"}
                        </span>
                      </div>
                      <p className="map-report-area">{report.area || "Area not provided"}</p>
                      <div className="map-report-details">
                        <span>Score: {report.score ?? "N/A"}</span>
                        <span>Severity: {report.severity || "N/A"}</span>
                        <span>Potholes: {report.potholes ?? 0}</span>
                        {report.analysis_time && <span>{report.analysis_time}</span>}
                      </div>
                    </div>

                    <div className="map-report-location">
                      {hasLocation ? (
                        <span className="location-state located">📍 On map</span>
                      ) : (
                        <>
                          <span className="location-state missing">Location needed</span>
                          <button
                            type="button"
                            className="set-report-location-btn"
                            onClick={() => openLocationEditor(report)}
                          >
                            Set location
                          </button>
                        </>
                      )}
                    </div>

                    {editingReportId === report.id && (
                      <div className="report-location-editor">
                        <form onSubmit={searchReportLocation}>
                          <label htmlFor={`report-location-${report.id}`}>
                            Search this road and choose the right match
                          </label>
                          <div className="report-location-search">
                            <input
                              id={`report-location-${report.id}`}
                              value={locationQuery}
                              onChange={(event) => setLocationQuery(event.target.value)}
                              placeholder="Road, area, city"
                              maxLength={200}
                            />
                            <button type="submit" disabled={searchingLocation}>
                              {searchingLocation ? "Searching..." : "Search"}
                            </button>
                          </div>
                        </form>
                        <p className="location-attribution">
                          Results by <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>.
                        </p>
                        {locationError && <p className="location-error" role="status">{locationError}</p>}
                        {locationResults.length > 0 && (
                          <ul className="report-location-results">
                            {locationResults.map((place) => (
                              <li key={`${place.latitude},${place.longitude}`}>
                                <button
                                  type="button"
                                  onClick={() => saveReportLocation(report.id, place)}
                                  disabled={savingLocationId === report.id}
                                >
                                  {savingLocationId === report.id ? "Saving..." : place.displayName}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <div className="map-legend">

          <div className="legend-title">
            Road Condition
          </div>

          <div className="legend-items">

            <div className="legend-item">
              <span className="legend-dot green"></span>
              Excellent / Good
            </div>

            <div className="legend-item">
              <span className="legend-dot yellow"></span>
              Fair
            </div>

            <div className="legend-item">
              <span className="legend-dot orange"></span>
              Poor
            </div>

            <div className="legend-item">
              <span className="legend-dot red"></span>
              Critical
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

import React, { useEffect, useState } from "react";
import {
  FaRoad,
  FaExclamationTriangle,
  FaChartLine,
  FaCheckCircle,
  FaUpload,
  FaFileAlt,
  FaMapMarkedAlt,
  FaArrowUp,
  FaChartPie,
} from "react-icons/fa";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line, Doughnut } from "react-chartjs-2";

import "../styles/Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

function Dashboard() {
  const [dashboard, setDashboard] = useState({
    total_reports: 0,
    total_potholes: 0,
    critical_roads: 0,
    average_score: 0,
    recent_reports: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => response.json())
      .then((data) => {
        setDashboard(data);
        setLoading(false);
      })
      .catch((error) => {
        console.log("Dashboard API Error:", error);
        setLoading(false);
      });
  }, []);

  const getHealthStatus = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    if (score >= 30) return "Poor";
    return "Critical";
  };

  const getHealthClass = (score) => {
    if (score >= 90) return "excellent";
    if (score >= 70) return "good";
    if (score >= 50) return "fair";
    if (score >= 30) return "poor";
    return "critical";
  };

  const healthStatus = getHealthStatus(dashboard.average_score);
  const healthClass = getHealthClass(dashboard.average_score);

  /* -----------------------------
     REPORT DATA
  ----------------------------- */

  const reports = dashboard.recent_reports || [];

  const reportScores = reports.slice(0, 7).map((report) => {
    return (
      report.score ??
      report.road_score ??
      report.health_score ??
      0
    );
  });

  const reportLabels = reports.slice(0, 7).map((report, index) => {
    return `Report ${index + 1}`;
  });

  /* -----------------------------
     LINE CHART
  ----------------------------- */

  const healthChartData = {
    labels:
      reportLabels.length > 0
        ? reportLabels
        : ["No Data"],

    datasets: [
      {
        label: "Road Health Score",
        data:
          reportScores.length > 0
            ? reportScores
            : [0],

        borderWidth: 3,
        tension: 0.4,
        fill: false,

        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const healthChartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: true,
        position: "top",
      },

      tooltip: {
        callbacks: {
          label: function (context) {
            return ` Health Score: ${context.raw}/100`;
          },
        },
      },
    },

    scales: {
      y: {
        beginAtZero: true,
        max: 100,

        ticks: {
          stepSize: 20,
        },
      },
    },
  };

  /* -----------------------------
     CONDITION DISTRIBUTION
  ----------------------------- */

  let excellent = 0;
  let good = 0;
  let fair = 0;
  let poor = 0;
  let critical = 0;

  reports.forEach((report) => {
    const score =
      report.score ??
      report.road_score ??
      report.health_score ??
      0;

    if (score >= 90) {
      excellent++;
    } else if (score >= 70) {
      good++;
    } else if (score >= 50) {
      fair++;
    } else if (score >= 30) {
      poor++;
    } else {
      critical++;
    }
  });

  const conditionChartData = {
    labels: [
      "Excellent",
      "Good",
      "Fair",
      "Poor",
      "Critical",
    ],

    datasets: [
      {
        data: [
          excellent,
          good,
          fair,
          poor,
          critical,
        ],

        borderWidth: 2,
      },
    ],
  };

  const conditionChartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "bottom",

        labels: {
          padding: 15,
          usePointStyle: true,
        },
      },
    },

    cutout: "68%",
  };

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <div className="dashboard-header">

        <div>
          <h1>Dashboard</h1>

          <p>
            AI-powered overview of road health and
            pothole analysis
          </p>
        </div>

        <div className="dashboard-status">

          <span className="status-dot"></span>

          System Active

        </div>

      </div>


      {/* STATISTICS */}

      <div className="stats-grid">

        {/* TOTAL REPORTS */}

        <div className="stat-card blue">

          <div className="stat-top">

            <div className="stat-icon">
              <FaRoad />
            </div>

            <span className="stat-label">
              Road Reports
            </span>

          </div>

          <h2>
            {loading
              ? "..."
              : dashboard.total_reports}
          </h2>

          <p>
            Total road analyses
          </p>

          <div className="stat-bottom">

            <FaArrowUp />

            <span>
              AI analysis completed
            </span>

          </div>

        </div>


        {/* POTHOLES */}

        <div className="stat-card orange">

          <div className="stat-top">

            <div className="stat-icon">
              <FaExclamationTriangle />
            </div>

            <span className="stat-label">
              Potholes
            </span>

          </div>

          <h2>
            {loading
              ? "..."
              : dashboard.total_potholes}
          </h2>

          <p>
            Total potholes detected
          </p>

          <div className="stat-bottom">

            <FaExclamationTriangle />

            <span>
              Detected by AI
            </span>

          </div>

        </div>


        {/* CRITICAL ROADS */}

        <div className="stat-card red">

          <div className="stat-top">

            <div className="stat-icon">
              <FaExclamationTriangle />
            </div>

            <span className="stat-label">
              Critical Roads
            </span>

          </div>

          <h2>
            {loading
              ? "..."
              : dashboard.critical_roads}
          </h2>

          <p>
            Roads needing attention
          </p>

          <div className="stat-bottom">

            <span>
              Priority monitoring
            </span>

          </div>

        </div>


        {/* AVERAGE SCORE */}

        <div className="stat-card green">

          <div className="stat-top">

            <div className="stat-icon">
              <FaChartLine />
            </div>

            <span className="stat-label">
              Average Score
            </span>

          </div>

          <h2>

            {loading
              ? "..."
              : dashboard.average_score}

            <small>
              /100
            </small>

          </h2>

          <p>
            Overall road health
          </p>

          <div className="stat-bottom">

            <FaCheckCircle />

            <span>
              {healthStatus} condition
            </span>

          </div>

        </div>

      </div>


      {/* ANALYTICS CHARTS */}

      <div className="analytics-grid">

        {/* HEALTH TREND */}

        <div className="dashboard-box chart-box">

          <div className="box-header">

            <div>

              <h2>
                Road Health Trend
              </h2>

              <p>
                Health score of recent road reports
              </p>

            </div>

            <FaChartLine className="box-header-icon" />

          </div>

          <div className="chart-container">

            {reports.length > 0 ? (

              <Line
                data={healthChartData}
                options={healthChartOptions}
              />

            ) : (

              <div className="chart-empty">

                <FaChartLine />

                <p>
                  Upload road reports to see
                  health trends.
                </p>

              </div>

            )}

          </div>

        </div>


        {/* CONDITION DISTRIBUTION */}

        <div className="dashboard-box chart-box">

          <div className="box-header">

            <div>

              <h2>
                Road Conditions
              </h2>

              <p>
                Distribution of analyzed roads
              </p>

            </div>

            <FaChartPie className="box-header-icon" />

          </div>

          <div className="doughnut-container">

            {reports.length > 0 ? (

              <Doughnut
                data={conditionChartData}
                options={conditionChartOptions}
              />

            ) : (

              <div className="chart-empty">

                <FaChartPie />

                <p>
                  No condition data available.
                </p>

              </div>

            )}

          </div>

        </div>

      </div>


      {/* MAIN GRID */}

      <div className="dashboard-main-grid">


        {/* RECENT REPORTS */}

        <div className="dashboard-box reports-box">

          <div className="box-header">

            <div>

              <h2>
                Recent Road Reports
              </h2>

              <p>
                Latest analyzed roads
              </p>

            </div>

            <FaFileAlt className="box-header-icon" />

          </div>


          <div className="reports-list">

            {loading ? (

              <div className="empty-state">
                Loading reports...
              </div>

            ) : dashboard.recent_reports &&
              dashboard.recent_reports.length > 0 ? (

              dashboard.recent_reports
                .slice(0, 5)
                .map((report, index) => {

                  const score =
                    report.score ??
                    report.road_score ??
                    report.health_score ??
                    0;

                  const potholes =
                    report.potholes ??
                    report.pothole_count ??
                    0;

                  const roadName =
                    report.road_name ??
                    report.roadName ??
                    "Unknown Road";

                  const condition =
                    report.condition ??
                    getHealthStatus(score);

                  return (

                    <div
                      className="report-item"
                      key={index}
                    >

                      <div className="report-left">

                        <div className="road-icon">
                          <FaRoad />
                        </div>

                        <div>

                          <h3>
                            {roadName}
                          </h3>

                          <div className="report-details">

                            <span>
                              {potholes} pothole
                              {potholes !== 1
                                ? "s"
                                : ""}
                            </span>

                            <span>
                              •
                            </span>

                            <span>
                              {condition}
                            </span>

                          </div>

                        </div>

                      </div>


                      <div className="report-right">

                        <strong>
                          {score}/100
                        </strong>

                        <span
                          className={`condition-badge ${getHealthClass(
                            score
                          )}`}
                        >
                          {getHealthStatus(score)}
                        </span>

                      </div>

                    </div>

                  );

                })

            ) : (

              <div className="empty-state">

                <FaRoad />

                <h3>
                  No reports available
                </h3>

                <p>
                  Upload a road image to start
                  analysis.
                </p>

              </div>

            )}

          </div>

        </div>


        {/* HEALTH OVERVIEW */}

        <div className="dashboard-box health-box">

          <div className="box-header">

            <div>

              <h2>
                Road Health
              </h2>

              <p>
                Overall system score
              </p>

            </div>

            <FaChartLine
              className="box-header-icon"
            />

          </div>


          <div className="health-circle">

            <div
              className={`health-ring ${healthClass}`}
              style={{
                "--score": `${Math.min(
                  dashboard.average_score,
                  100
                ) * 3.6}deg`,
              }}
            >

              <div className="health-inner">

                <strong>

                  {loading
                    ? "..."
                    : dashboard.average_score}

                </strong>

                <span>
                  / 100
                </span>

              </div>

            </div>

          </div>


          <div
            className={`health-status ${healthClass}`}
          >

            <FaCheckCircle />

            {healthStatus}

          </div>


          <p className="health-description">

            Overall condition of analyzed roads
            in the system.

          </p>

        </div>

      </div>


      {/* QUICK ACTIONS */}

      <div className="dashboard-box quick-actions-box">

        <div className="box-header">

          <div>

            <h2>
              Quick Actions
            </h2>

            <p>
              Manage your road monitoring system
            </p>

          </div>

        </div>


        <div className="quick-actions">


          <a
            href="/upload"
            className="quick-action"
          >

            <div className="quick-icon blue-bg">
              <FaUpload />
            </div>

            <div>

              <h3>
                Upload Road
              </h3>

              <p>
                Analyze a new road image
              </p>

            </div>

          </a>


          <a
            href="/reports"
            className="quick-action"
          >

            <div className="quick-icon purple-bg">
              <FaFileAlt />
            </div>

            <div>

              <h3>
                View Reports
              </h3>

              <p>
                Check previous road reports
              </p>

            </div>

          </a>


          <a
            href="/analytics"
            className="quick-action"
          >

            <div className="quick-icon orange-bg">
              <FaChartLine />
            </div>

            <div>

              <h3>
                Analytics
              </h3>

              <p>
                View road health statistics
              </p>

            </div>

          </a>


          <a
            href="/map"
            className="quick-action"
          >

            <div className="quick-icon green-bg">
              <FaMapMarkedAlt />
            </div>

            <div>

              <h3>
                Road Map
              </h3>

              <p>
                View analyzed road locations
              </p>

            </div>

          </a>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;

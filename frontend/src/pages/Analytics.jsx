import React, { useEffect, useState } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Doughnut } from "react-chartjs-2";

import {
  FaChartBar,
  FaRoad,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

import "../styles/Analytics.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);


// =====================================================
// CONDITION HELPERS
// =====================================================

const getCondition = (score) => {
  const value = Number(score) || 0;

  if (value >= 90) return "Excellent";
  if (value >= 70) return "Good";
  if (value >= 50) return "Fair";
  if (value >= 30) return "Poor";
  return "Critical";
};


const getConditionColor = (score) => {
  const value = Number(score) || 0;

  if (value >= 90) return "#00c853"; // Green
  if (value >= 70) return "#08b5d1"; // Cyan
  if (value >= 50) return "#ffc107"; // Yellow
  if (value >= 30) return "#ff7900"; // Orange
  return "#ff334b"; // Red
};


const getHoverColor = (score) => {
  const value = Number(score) || 0;

  if (value >= 90) return "#00a846";
  if (value >= 70) return "#0099b5";
  if (value >= 50) return "#e0a900";
  if (value >= 30) return "#e56700";
  return "#e51f38";
};


// =====================================================
// ANALYTICS
// =====================================================

function Analytics() {

  const [data, setData] = useState({
    total_reports: 0,
    total_potholes: 0,
    critical_roads: 0,
    average_score: 0,
    recent_reports: [],
  });

  const [loading, setLoading] = useState(true);


  // =====================================================
  // FETCH REPORT DATA
  // =====================================================

  useEffect(() => {

    fetch("/api/dashboard")

      .then((response) => {

        if (!response.ok) {
          throw new Error("Dashboard API failed");
        }

        return response.json();

      })

      .then((result) => {

        setData({
          total_reports: result.total_reports ?? 0,
          total_potholes: result.total_potholes ?? 0,
          critical_roads: result.critical_roads ?? 0,
          average_score: result.average_score ?? 0,
          recent_reports: result.recent_reports ?? [],
        });

        setLoading(false);

      })

      .catch((error) => {

        console.log("Analytics API Error:", error);

        setLoading(false);

      });

  }, []);


  // =====================================================
  // REPORTS
  // =====================================================

  const reports = data.recent_reports || [];


  // =====================================================
  // ROAD NAMES
  // =====================================================

  const roadNames = reports.map(
    (report, index) =>
      report.road_name ||
      report.roadName ||
      `Road ${index + 1}`
  );


  // =====================================================
  // POTHOLE DATA
  // =====================================================

  const potholeData = reports.map((report) =>
    Number(
      report.potholes ??
      report.pothole_count ??
      report.potholeCount ??
      0
    )
  );


  // =====================================================
  // SCORE DATA
  // =====================================================

  const scoreData = reports.map((report) =>
    Number(
      report.score ??
      report.road_score ??
      report.health_score ??
      0
    )
  );


  // =====================================================
  // ACTUAL CONDITION DATA
  // =====================================================

  const conditions = reports.map((report, index) => {

    const score = Number(
      report.score ??
      report.road_score ??
      report.health_score ??
      0
    );

    return (
      report.condition ||
      getCondition(score)
    );

  });


  // =====================================================
  // DYNAMIC COLORS BASED ON ACTUAL SCORE
  // =====================================================

  const barColors = reports.map((report) => {

    const score = Number(
      report.score ??
      report.road_score ??
      report.health_score ??
      0
    );

    return getConditionColor(score);

  });


  const hoverColors = reports.map((report) => {

    const score = Number(
      report.score ??
      report.road_score ??
      report.health_score ??
      0
    );

    return getHoverColor(score);

  });


  // =====================================================
  // POTHOLE BAR CHART
  // =====================================================

  const barData = {

    labels: roadNames.length
      ? roadNames
      : ["No Data"],

    datasets: [

      {

        label: "Potholes Detected",

        data: potholeData.length
          ? potholeData
          : [0],

        backgroundColor: potholeData.length
          ? barColors
          : ["#d9dee8"],

        borderColor: potholeData.length
          ? barColors
          : ["#d9dee8"],

        borderWidth: 1,

        borderRadius: 10,

        borderSkipped: false,

        hoverBackgroundColor: potholeData.length
          ? hoverColors
          : ["#c5ccd8"],

        maxBarThickness: 55,

      },

    ],

  };


  // =====================================================
  // ROAD SCORE BAR CHART
  // =====================================================

  const scoreChartData = {

    labels: roadNames.length
      ? roadNames
      : ["No Data"],

    datasets: [

      {

        label: "Road Health Score",

        data: scoreData.length
          ? scoreData
          : [0],

        backgroundColor: scoreData.length
          ? barColors
          : ["#d9dee8"],

        borderColor: scoreData.length
          ? barColors
          : ["#d9dee8"],

        borderWidth: 1,

        borderRadius: 10,

        borderSkipped: false,

        hoverBackgroundColor: scoreData.length
          ? hoverColors
          : ["#c5ccd8"],

        maxBarThickness: 55,

      },

    ],

  };


  // =====================================================
  // HEALTH DISTRIBUTION
  // =====================================================

  const excellent = reports.filter((report) => {

    const score = Number(
      report.score ??
      report.road_score ??
      report.health_score ??
      0
    );

    return score >= 90;

  }).length;


  const good = reports.filter((report) => {

    const score = Number(
      report.score ??
      report.road_score ??
      report.health_score ??
      0
    );

    return score >= 70 && score < 90;

  }).length;


  const fair = reports.filter((report) => {

    const score = Number(
      report.score ??
      report.road_score ??
      report.health_score ??
      0
    );

    return score >= 50 && score < 70;

  }).length;


  const poor = reports.filter((report) => {

    const score = Number(
      report.score ??
      report.road_score ??
      report.health_score ??
      0
    );

    return score >= 30 && score < 50;

  }).length;


  const critical = reports.filter((report) => {

    const score = Number(
      report.score ??
      report.road_score ??
      report.health_score ??
      0
    );

    return score < 30;

  }).length;


  // =====================================================
  // DOUGHNUT
  // =====================================================

  const healthChartData = {

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

        backgroundColor: [
          "#00c853",
          "#08b5d1",
          "#ffc107",
          "#ff7900",
          "#ff334b",
        ],

        hoverBackgroundColor: [
          "#00a846",
          "#0099b5",
          "#e0a900",
          "#e56700",
          "#e51f38",
        ],

        borderColor: "#ffffff",

        borderWidth: 3,

        hoverOffset: 10,

      },

    ],

  };


  // =====================================================
  // COMMON COLORS
  // =====================================================

  const chartTextColor = "#718096";

  const chartGridColor = "#edf0f5";


  // =====================================================
  // POTHOLE BAR OPTIONS
  // =====================================================

  const barOptions = {

    responsive: true,

    maintainAspectRatio: false,

    animation: {
      duration: 900,
      easing: "easeOutQuart",
    },

    plugins: {

      legend: {
        display: false,
      },

      tooltip: {

        backgroundColor: "#14213d",

        titleColor: "#ffffff",

        bodyColor: "#ffffff",

        padding: 12,

        cornerRadius: 10,

        displayColors: true,

        callbacks: {

          title: function (context) {

            return `Road: ${context[0].label}`;

          },

          label: function (context) {

            const index = context.dataIndex;

            return ` Potholes: ${potholeData[index] ?? 0}`;

          },

          afterLabel: function (context) {

            const index = context.dataIndex;

            return ` Condition: ${conditions[index] ?? "Unknown"}`;

          },

        },

      },

    },

    scales: {

      x: {

        grid: {
          display: false,
        },

        ticks: {

          color: chartTextColor,

          font: {
            size: 12,
            weight: "500",
          },

          maxRotation: 0,

          minRotation: 0,

          autoSkip: true,

          maxTicksLimit: 8,

        },

        border: {
          display: false,
        },

      },

      y: {

        beginAtZero: true,

        ticks: {

          precision: 0,

          color: chartTextColor,

          font: {
            size: 11,
          },

        },

        grid: {

          color: chartGridColor,

          drawBorder: false,

        },

        border: {
          display: false,
        },

      },

    },

  };


  // =====================================================
  // SCORE OPTIONS
  // =====================================================

  const scoreOptions = {

    responsive: true,

    maintainAspectRatio: false,

    animation: {

      duration: 900,

      easing: "easeOutQuart",

    },

    plugins: {

      legend: {
        display: false,
      },

      tooltip: {

        backgroundColor: "#14213d",

        titleColor: "#ffffff",

        bodyColor: "#ffffff",

        padding: 12,

        cornerRadius: 10,

        callbacks: {

          title: function (context) {

            return `Road: ${context[0].label}`;

          },

          label: function (context) {

            const index = context.dataIndex;

            return ` Score: ${scoreData[index] ?? 0}/100`;

          },

          afterLabel: function (context) {

            const index = context.dataIndex;

            return ` Condition: ${conditions[index] ?? "Unknown"}`;

          },

        },

      },

    },

    scales: {

      x: {

        grid: {
          display: false,
        },

        ticks: {

          color: chartTextColor,

          font: {

            size: 12,

            weight: "500",

          },

          maxRotation: 0,

          minRotation: 0,

          autoSkip: true,

          maxTicksLimit: 10,

        },

        border: {
          display: false,
        },

      },

      y: {

        beginAtZero: true,

        max: 100,

        ticks: {

          stepSize: 20,

          color: chartTextColor,

          font: {
            size: 11,
          },

        },

        grid: {

          color: chartGridColor,

          drawBorder: false,

        },

        border: {
          display: false,
        },

      },

    },

  };


  // =====================================================
  // DOUGHNUT OPTIONS
  // =====================================================

  const doughnutOptions = {

    responsive: true,

    maintainAspectRatio: false,

    animation: {

      animateRotate: true,

      duration: 1000,

    },

    plugins: {

      legend: {

        position: "bottom",

        labels: {

          padding: 18,

          usePointStyle: true,

          pointStyle: "circle",

          color: "#596579",

          font: {

            size: 12,

            weight: "500",

          },

        },

      },

      tooltip: {

        backgroundColor: "#14213d",

        titleColor: "#ffffff",

        bodyColor: "#ffffff",

        padding: 12,

        cornerRadius: 10,

        callbacks: {

          label: function (context) {

            const value = context.raw || 0;

            return ` ${context.label}: ${value} roads`;

          },

        },

      },

    },

    cutout: "65%",

  };


  // =====================================================
  // RETURN
  // =====================================================

  return (

    <div className="analytics-page">


      {/* HEADER */}

      <div className="analytics-header">

        <div>

          <h1>Analytics</h1>

          <p>
            Analyze road health and pothole detection statistics
          </p>

        </div>

        <div className="analytics-icon">

          <FaChartBar />

        </div>

      </div>


      {/* STATISTICS */}

      <div className="analytics-stats">


        <div className="analytics-stat blue">

          <div className="analytics-stat-icon">

            <FaRoad />

          </div>

          <div>

            <span>Total Reports</span>

            <h2>
              {loading ? "..." : data.total_reports}
            </h2>

          </div>

        </div>


        <div className="analytics-stat orange">

          <div className="analytics-stat-icon">

            <FaExclamationTriangle />

          </div>

          <div>

            <span>Total Potholes</span>

            <h2>
              {loading ? "..." : data.total_potholes}
            </h2>

          </div>

        </div>


        <div className="analytics-stat red">

          <div className="analytics-stat-icon">

            <FaExclamationTriangle />

          </div>

          <div>

            <span>Critical Roads</span>

            <h2>
              {loading ? "..." : data.critical_roads}
            </h2>

          </div>

        </div>


        <div className="analytics-stat green">

          <div className="analytics-stat-icon">

            <FaCheckCircle />

          </div>

          <div>

            <span>Average Score</span>

            <h2>

              {loading ? "..." : data.average_score}

              <small>/100</small>

            </h2>

          </div>

        </div>


      </div>


      {/* MAIN CHARTS */}

      <div className="analytics-grid">


        {/* POTHOLE DETECTION */}

        <div className="analytics-card">

          <div className="analytics-card-header">

            <div>

              <h2>Pothole Detection</h2>

              <p>
                Potholes detected on analyzed roads
              </p>

            </div>

            <FaExclamationTriangle />

          </div>


          <div className="chart-container">

            {reports.length > 0 ? (

              <Bar
                data={barData}
                options={barOptions}
              />

            ) : (

              <div className="analytics-empty">

                No road analysis data available yet.

              </div>

            )}

          </div>

        </div>


        {/* ROAD HEALTH DISTRIBUTION */}

        <div className="analytics-card">

          <div className="analytics-card-header">

            <div>

              <h2>Road Health Distribution</h2>

              <p>
                Condition of analyzed roads
              </p>

            </div>

            <FaChartBar />

          </div>


          <div className="doughnut-container">

            {reports.length > 0 ? (

              <Doughnut
                data={healthChartData}
                options={doughnutOptions}
              />

            ) : (

              <div className="analytics-empty">

                No health data available yet.

              </div>

            )}

          </div>

        </div>


      </div>


      {/* ROAD HEALTH SCORE */}

      <div className="analytics-card score-card">

        <div className="analytics-card-header">

          <div>

            <h2>Road Health Score</h2>

            <p>
              Health score comparison between analyzed roads
            </p>

          </div>

          <FaCheckCircle />

        </div>


        <div className="score-chart-container">

          {reports.length > 0 ? (

            <Bar
              data={scoreChartData}
              options={scoreOptions}
            />

          ) : (

            <div className="analytics-empty">

              No score data available yet.

            </div>

          )}

        </div>

      </div>


      {/* SCORE INFORMATION */}

      <div className="analytics-info">

        <div>

          <strong>90–100</strong>

          <span>Excellent</span>

        </div>


        <div>

          <strong>70–89</strong>

          <span>Good</span>

        </div>


        <div>

          <strong>50–69</strong>

          <span>Fair</span>

        </div>


        <div>

          <strong>30–49</strong>

          <span>Poor</span>

        </div>


        <div>

          <strong>0–29</strong>

          <span>Critical</span>

        </div>

      </div>


    </div>

  );

}


export default Analytics;

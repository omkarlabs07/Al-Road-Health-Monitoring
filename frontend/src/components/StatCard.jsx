import { useEffect, useState } from "react";
import axios from "axios";

import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";

export default function Home() {

  const [reports, setReports] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {

    try {

      const res = await axios.get("/api/reports");

      setReports(res.data.reports);

    } catch (err) {

      console.log(err);

    }

  };

  const totalReports = reports.length;

  const totalPotholes = reports.reduce(
    (sum, item) => sum + item.potholes,
    0
  );

  const averageScore =
    totalReports > 0
      ? (
          reports.reduce((sum, item) => sum + item.score, 0) /
          totalReports
        ).toFixed(1)
      : 0;

  const criticalRoads = reports.filter(
    (item) =>
      item.severity === "High" ||
      item.condition === "Critical"
  ).length;

  return (

    <DashboardLayout>

      <div className="mb-8">

        <h1 className="text-4xl font-bold text-green-700">
          AI Road Health Dashboard
        </h1>

        <p className="text-gray-600 mt-2">
          Real-Time Road Health Monitoring System
        </p>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <StatCard
          title="Total Reports"
          value={totalReports}
          color="text-blue-600"
        />

        <StatCard
          title="Total Potholes"
          value={totalPotholes}
          color="text-red-600"
        />

        <StatCard
          title="Average Score"
          value={averageScore}
          color="text-green-600"
        />

        <StatCard
          title="Critical Roads"
          value={criticalRoads}
          color="text-yellow-500"
        />

      </div>

      <div className="bg-white rounded-xl shadow-lg mt-8 p-6">

        <h2 className="text-2xl font-bold mb-5">

          Recent Road Reports

        </h2>

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead>

              <tr className="border-b font-semibold">

                <th className="text-left p-3">Road</th>

                <th className="text-left p-3">Area</th>

                <th className="text-left p-3">Potholes</th>

                <th className="text-left p-3">Score</th>

                <th className="text-left p-3">Condition</th>

                <th className="text-left p-3">Severity</th>

              </tr>

            </thead>

            <tbody>

              {reports.map((report) => (

                <tr
                  key={report.id}
                  className="border-b hover:bg-gray-100"
                >

                  <td className="p-3">

                    {report.road_name}

                  </td>

                  <td className="p-3">

                    {report.area}

                  </td>

                  <td className="p-3">

                    {report.potholes}

                  </td>

                  <td className="p-3">

                    {report.score}/100

                  </td>

                  <td className="p-3">

                    {report.condition}

                  </td>

                  <td className="p-3">

                    <span
                      className={`px-3 py-1 rounded-full text-white ${
                        report.severity === "Low"
                          ? "bg-green-600"
                          : report.severity === "Medium"
                          ? "bg-yellow-500"
                          : "bg-red-600"
                      }`}
                    >
                      {report.severity}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </DashboardLayout>

  );

}

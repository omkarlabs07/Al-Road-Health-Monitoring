import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";

export default function Reports() {
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get("/api/reports");
      setReports(res.data.reports);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-2 text-green-700">
        {user?.role === "Reporter" ? "My Road Reports" : "Road Analysis Reports"}
      </h1>
      <p className="mb-6 text-sm text-slate-500">{user?.role === "Reporter" ? "Review the road reports you have submitted." : "Review analyzed roads submitted across the network."}</p>

      {loading ? (
        <h2 className="text-xl">Loading...</h2>
      ) : reports.length === 0 ? (
        <h2 className="text-xl text-gray-500">No Reports Found</h2>
      ) : (

        <div className="overflow-x-auto">

          <table className="min-w-full bg-white rounded-xl shadow-lg">

            <thead className="bg-green-600 text-white">

              <tr>

                <th className="p-3">Road</th>
                <th className="p-3">Area</th>
                <th className="p-3">Potholes</th>
                <th className="p-3">Score</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Recommendation</th>
                <th className="p-3">Date</th>
                <th className="p-3">Image</th>

              </tr>

            </thead>

            <tbody>

              {reports.map((report) => (

                <tr
                  key={report.id}
                  className="border-b hover:bg-gray-100"
                >

                  <td className="p-3">{report.road_name}</td>

                  <td className="p-3">{report.area}</td>

                  <td className="p-3 text-center">
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
                      className={`px-3 py-1 rounded-full text-white

                      ${
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

                  <td className="p-3">
                    {report.confidence}%
                  </td>

                  <td className="p-3">
                    {report.recommendation}
                  </td>

                  <td className="p-3">
                    {report.analysis_time}
                  </td>

                  <td className="p-3">

                    <img
                      src={`/api/results/${report.image}`}
                      alt=""
                      className="w-32 rounded-lg border"
                    />

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </DashboardLayout>
  );
}

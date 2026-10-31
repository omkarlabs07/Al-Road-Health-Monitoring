import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";

export default function Home() {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("/api/dashboard");
      setData(res.data);
    } catch (error) {
      console.log("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold">
            Loading Dashboard...
          </h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      {/* Header */}

      <div className="mb-8">

        <h1 className="text-4xl font-bold text-slate-800">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          AI-powered overview of road health and pothole analysis
        </p>

      </div>


      {/* Statistics Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* Total Reports */}

        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-cyan-500">

          <p className="text-gray-500 font-medium">
            Total Reports
          </p>

          <h2 className="text-4xl font-bold text-slate-800 mt-3">
            {data?.total_reports || 0}
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Road analyses completed
          </p>

        </div>


        {/* Potholes */}

        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-orange-500">

          <p className="text-gray-500 font-medium">
            Total Potholes
          </p>

          <h2 className="text-4xl font-bold text-slate-800 mt-3">
            {data?.total_potholes || 0}
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Detected by AI
          </p>

        </div>


        {/* Critical Roads */}

        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-red-500">

          <p className="text-gray-500 font-medium">
            Critical Roads
          </p>

          <h2 className="text-4xl font-bold text-red-600 mt-3">
            {data?.critical_roads || 0}
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Need attention
          </p>

        </div>


        {/* Average Score */}

        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-green-500">

          <p className="text-gray-500 font-medium">
            Average Road Score
          </p>

          <h2 className="text-4xl font-bold text-green-600 mt-3">
            {data?.average_score || 0}
            <span className="text-xl text-gray-400">
              /100
            </span>
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Overall road health
          </p>

        </div>

      </div>


      {/* Lower Section */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">


        {/* Recent Reports */}

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold text-slate-800">
                Recent Road Reports
              </h2>

              <p className="text-gray-500 text-sm">
                Latest analyzed roads
              </p>

            </div>

          </div>


          {data?.recent_reports?.length === 0 ? (

            <div className="text-center py-10 text-gray-400">
              No reports available
            </div>

          ) : (

            <div className="space-y-4">

              {data?.recent_reports?.map((report, index) => (

                <div
                  key={index}
                  className="flex items-center justify-between border rounded-xl p-4 hover:bg-gray-50"
                >

                  <div>

                    <h3 className="font-semibold text-slate-800">
                      {report.road_name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Condition: {report.condition}
                    </p>

                  </div>


                  <div className="text-right">

                    <p className="font-bold text-slate-800">
                      {report.score}/100
                    </p>

                    <span
                      className={`text-xs px-3 py-1 rounded-full text-white ${
                        report.severity === "Low"
                          ? "bg-green-500"
                          : report.severity === "Medium"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    >
                      {report.severity}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>


        {/* Road Health */}

        <div className="bg-white rounded-2xl shadow-md p-6">

          <h2 className="text-2xl font-bold text-slate-800">
            Road Health
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Overall system score
          </p>


          <div className="flex justify-center my-8">

            <div className="w-40 h-40 rounded-full border-[14px] border-green-500 flex items-center justify-center">

              <div className="text-center">

                <h2 className="text-3xl font-bold text-green-600">
                  {data?.average_score || 0}
                </h2>

                <p className="text-gray-400 text-sm">
                  / 100
                </p>

              </div>

            </div>

          </div>


          <div className="text-center">

            <h3 className="text-xl font-bold text-green-600">
              {data?.average_score >= 80
                ? "Good"
                : data?.average_score >= 60
                ? "Fair"
                : "Needs Attention"}
            </h3>

            <p className="text-gray-500 text-sm mt-2">
              Based on analyzed road reports
            </p>

          </div>

        </div>

      </div>


      {/* Quick Actions */}

      <div className="bg-white rounded-2xl shadow-md p-6 mt-8">

        <h2 className="text-2xl font-bold text-slate-800 mb-5">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-4">

          <a
            href="/upload"
            className="bg-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-700"
          >
            + Analyze New Road
          </a>

          <a
            href="/reports"
            className="bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-900"
          >
            View Reports
          </a>

          <a
            href="/analytics"
            className="border border-slate-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100"
          >
            View Analytics
          </a>

        </div>

      </div>

    </DashboardLayout>
  );
}
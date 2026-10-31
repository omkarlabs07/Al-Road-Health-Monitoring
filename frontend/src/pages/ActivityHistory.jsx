import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";

export default function ActivityHistory() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/api/auth/activity")
      .then(({ data }) => setEntries(data.activity || []))
      .catch((requestError) => setError(requestError.response?.data?.message || "Could not load activity history."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.16em] text-cyan-700">Administration</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-800">Login &amp; Activity History</h1>
          <p className="mt-2 text-slate-500">Review sign-ins and key actions across the road monitoring system.</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div><h2 className="font-semibold text-slate-800">Recent activity</h2><p className="mt-1 text-xs text-slate-500">Showing the latest {entries.length} entries</p></div>
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">Admin only</span>
          </div>
          {loading ? <p className="p-8 text-center text-slate-500">Loading activity…</p> : error ? <p className="p-8 text-center text-red-600">{error}</p> : entries.length === 0 ? <p className="p-8 text-center text-slate-500">No activity has been recorded yet.</p> : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-3 font-semibold">Account</th><th className="px-6 py-3 font-semibold">Action</th><th className="px-6 py-3 font-semibold">Details</th><th className="px-6 py-3 font-semibold">Date &amp; time</th></tr></thead>
                <tbody className="divide-y divide-slate-100">{entries.map((entry) => <tr key={entry.id} className="hover:bg-slate-50/70"><td className="px-6 py-4"><strong className="block text-slate-800">{entry.username}</strong><span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{entry.role}</span></td><td className="px-6 py-4 font-medium text-slate-700">{entry.action}</td><td className="px-6 py-4 text-slate-500">{entry.details || "—"}</td><td className="whitespace-nowrap px-6 py-4 text-slate-500">{new Date(entry.created_at).toLocaleString()}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

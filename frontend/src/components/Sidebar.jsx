import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const fullMenu = [
  { name: "Dashboard", path: "/" },
  { name: "Upload Road", path: "/upload" },
  { name: "Reports", path: "/reports" },
  { name: "Analytics", path: "/analytics" },
  { name: "Map", path: "/map" },
  { name: "Workers", path: "/workers" },
];

export default function Sidebar() {
  const { user } = useAuth();
  const menuItems = user?.role === "Reporter"
    ? [{ name: "Submit a Report", path: "/upload" }, { name: "My Reports", path: "/reports" }]
    : [...fullMenu, ...(user?.role === "Admin" ? [{ name: "Login & Activity", path: "/activity" }] : [])];

  return (
    <aside className="relative min-h-screen w-64 shrink-0 bg-slate-950 p-5 text-white">
      <div className="mb-10 px-3"><h2 className="text-2xl font-bold text-cyan-400">AI Road</h2><p className="mt-1 text-xs text-gray-400">Health Monitoring System</p></div>
      <nav className="space-y-2" aria-label="Main navigation">
        {menuItems.map((item) => <NavLink key={item.path} to={item.path} end={item.path === "/"} className={({ isActive }) => `block rounded-xl px-4 py-3 transition-all ${isActive ? "bg-cyan-500 text-white shadow-lg" : "text-gray-300 hover:bg-slate-800 hover:text-white"}`}>{item.name}</NavLink>)}
      </nav>
      <div className="absolute bottom-6 px-3"><p className="text-xs text-gray-500">AI Road Health Monitoring</p><p className="mt-1 text-xs text-gray-600">{user?.role || "Workspace"}</p></div>
    </aside>
  );
}

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
      <div><h1 className="text-xl font-bold text-slate-800">AI Road Health Monitoring</h1><p className="text-xs text-gray-500">Smart Road Analysis Dashboard</p></div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100"><span className="font-bold text-cyan-700">{user?.name?.charAt(0) || "U"}</span></div>
        <div className="hidden sm:block"><p className="font-semibold text-slate-800">{user?.name}</p><p className="text-xs text-gray-500">{user?.role}</p></div>
        <button onClick={signOut} className="ml-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50" type="button">Sign out</button>
      </div>
    </header>
  );
}

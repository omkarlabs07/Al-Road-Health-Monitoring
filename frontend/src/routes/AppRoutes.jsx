import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Home from "../pages/Home";
import Upload from "../pages/Upload";
import Reports from "../pages/Reports";
import Analytics from "../pages/Analytics";
import Map from "../pages/Map";
import Workers from "../pages/Workers";
import Login from "../pages/Login";
import ActivityHistory from "../pages/ActivityHistory";
import DashboardLayout from "../layouts/DashboardLayout";

function landingFor(user) {
  return user?.role === "Reporter" ? "/reports" : "/";
}

function RequireAuth({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-loading">Checking your session…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={landingFor(user)} replace />;
  return children;
}

function SignInRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-loading">Checking your session…</div>;
  return user ? <Navigate to={landingFor(user)} replace /> : <Login />;
}

const fullAccess = ["Maintenance Supervisor", "Admin"];

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<SignInRoute />} />
      <Route path="/" element={<RequireAuth roles={fullAccess}><Home /></RequireAuth>} />
      <Route path="/upload" element={<RequireAuth><Upload /></RequireAuth>} />
      <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
      <Route path="/analytics" element={<RequireAuth roles={fullAccess}><DashboardLayout><Analytics /></DashboardLayout></RequireAuth>} />
      <Route path="/map" element={<RequireAuth roles={fullAccess}><Map /></RequireAuth>} />
      <Route path="/workers" element={<RequireAuth roles={fullAccess}><Workers /></RequireAuth>} />
      <Route path="/activity" element={<RequireAuth roles={["Admin"]}><ActivityHistory /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

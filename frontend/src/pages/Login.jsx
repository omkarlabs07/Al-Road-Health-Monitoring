import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaEye, FaEyeSlash, FaLock, FaRoad, FaShieldAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

const roles = ["Reporter", "Maintenance Supervisor", "Admin"];
const roleDescriptions = {
  Reporter: "Submit road reports and follow your submissions.",
  "Maintenance Supervisor": "Review the network and coordinate maintenance.",
  Admin: "Manage the system and review account activity.",
};
const demoAccounts = {
  Reporter: { username: "reporter", password: "Reporter@123" },
  "Maintenance Supervisor": { username: "supervisor", password: "Supervisor@123" },
  Admin: { username: "admin", password: "Admin@123" },
};

export default function Login() {
  const [role, setRole] = useState(roles[0]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const selectRole = (nextRole) => {
    setRole(nextRole);
    setUsername("");
    setPassword("");
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login({ username, password, role });
      navigate(user.role === "Reporter" ? "/reports" : "/", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not connect to the sign-in service. Start the backend and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-shell">
      <section className="login-story" aria-label="AI Road Health Monitoring">
          <div className="login-brand"><span className="login-brand-icon"><FaRoad /></span><span>AI Road Health Monitoring System</span></div>
        <div className="login-story-copy">
          <div className="login-eyebrow"><span /> SMARTER ROADS, SAFER JOURNEYS</div>
          <h1>See the road.<br /><span>Improve the way forward.</span></h1>
          <p>One place to report road conditions, understand network health, and coordinate maintenance.</p>
        </div>
        <div className="login-road-visual" aria-hidden="true">
          <div className="road-glow" /><div className="road-line road-line-one" /><div className="road-line road-line-two" />
          <div className="road-pin pin-a"><span /><b>Report received</b></div>
          <div className="road-pin pin-b"><span /><b>Inspection route</b></div>
          <div className="road-pin pin-c"><span /><b>Maintenance update</b></div>
        </div>
        <div className="login-story-footer"><FaShieldAlt /> Built for accountable road care <span>•</span> Role-based access</div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-mobile-brand"><FaRoad /> AI Road Health Monitoring System</div>
          <div className="login-kicker">WELCOME BACK</div>
          <h2>Sign in to your workspace</h2>
          <p className="login-intro">Choose your account type to continue.</p>

          <div className="role-picker" role="tablist" aria-label="Account type">
            {roles.map((item) => (
              <button key={item} type="button" role="tab" aria-selected={role === item} className={role === item ? "selected" : ""} onClick={() => selectRole(item)}>
                {item === "Maintenance Supervisor" ? "Supervisor" : item}
              </button>
            ))}
          </div>
          <div className="role-description"><span className="role-shield"><FaShieldAlt /></span><span><strong>{role}</strong><small>{roleDescriptions[role]}</small></span></div>

          <form className="login-form" onSubmit={submit}>
            <label htmlFor="username">Username</label>
            <input id="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter your username" required />
            <div className="password-label"><label htmlFor="password">Password</label><span><FaLock /> Secure sign in</span></div>
            <div className="password-field">
              <input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />
              <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
            </div>
            {error && <div className="login-error" role="alert">{error}</div>}
            <button className="login-submit" type="submit" disabled={submitting}>{submitting ? "Signing in…" : "Sign in securely"}<FaArrowRight /></button>
          </form>
          <details className="demo-access">
            <summary>Demo access details</summary>
            <div><span>Username</span><code>{demoAccounts[role].username}</code></div>
            <div><span>Password</span><code>{demoAccounts[role].password}</code></div>
            <button type="button" onClick={() => { setUsername(demoAccounts[role].username); setPassword(demoAccounts[role].password); }}>Fill {role} demo account</button>
          </details>
          <p className="login-note">Your access is limited to the tools assigned to your role.</p>
        </div>
        <div className="login-copyright">© 2026 AI Road Health Monitoring <span>•</span> Secure workspace</div>
      </section>
    </main>
  );
}

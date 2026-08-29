import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

function LockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon({ open, ...props }) {
  return open ? (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

function AlertIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((fe) => ({ ...fe, [name]: undefined }));
  };

  function validate() {
    const errs = {};
    if (mode === "register" && !form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!EMAIL_RE.test(form.email)) errs.email = "Enter a valid email address";
    if (!form.password) errs.password = "Password is required";
    else if (mode === "register" && form.password.length < 8) errs.password = "Must be at least 8 characters";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password, remember);
      } else {
        await register(form.name, form.email, form.password, remember);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6 font-sans relative overflow-hidden"
      style={{
        background: "#F1F5F9",
        backgroundImage: "radial-gradient(rgba(15,23,42,0.05) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .syncboard-card { animation: cardIn 0.45s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>

      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "560px", height: "560px", top: "-140px", left: "-100px",
          background: "radial-gradient(circle, rgba(16,185,129,0.22) 0%, rgba(16,185,129,0) 70%)",
        }}
      ></div>
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "520px", height: "520px", bottom: "-160px", right: "-80px",
          background: "radial-gradient(circle, rgba(79,70,229,0.16) 0%, rgba(79,70,229,0) 70%)",
        }}
      ></div>

      <div
        className="syncboard-card w-full max-w-[900px] bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row relative"
        style={{ boxShadow: "0 24px 48px -12px rgba(6,78,59,0.28)" }}
      >

        {/* LEFT — emerald→teal brand panel */}
        <div
          className="md:w-[42%] p-9 md:p-12 flex flex-col justify-between"
          style={{
            background: "linear-gradient(160deg, #064E3B 0%, #0D6E5C 55%, #0E7C8C 100%)",
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(160deg, #064E3B 0%, #0D6E5C 55%, #0E7C8C 100%)",
            backgroundSize: "20px 20px, cover",
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-10">
              <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                <span className="bg-orange-400 rounded-sm"></span>
                <span className="bg-blue-400 rounded-sm"></span>
                <span className="bg-purple-400 rounded-sm"></span>
                <span className="bg-emerald-300 rounded-sm"></span>
              </div>
              <span className="text-white font-medium text-sm tracking-wide">SYNC BOARD</span>
            </div>

            <p className="text-white text-[28px] font-medium leading-tight tracking-tight mb-3 max-w-[240px]">
              Where your team's work finds its rhythm.
            </p>
            <p className="text-emerald-100/80 text-sm leading-relaxed mb-12 max-w-[240px]">
              Plan, track, and move tasks together in real time.
            </p>

            <div className="flex items-end gap-1.5 h-14">
              <div className="w-2.5 rounded-sm bg-emerald-200" style={{ height: "55%" }}></div>
              <div className="w-2.5 rounded-sm bg-emerald-200/50" style={{ height: "30%" }}></div>
              <div className="w-2.5 rounded-sm bg-emerald-300" style={{ height: "100%" }}></div>
              <div className="w-2.5 rounded-sm bg-emerald-300/50" style={{ height: "65%" }}></div>
              <div className="w-2.5 rounded-sm bg-teal-200" style={{ height: "80%" }}></div>
              <div className="w-2.5 rounded-sm bg-teal-200/50" style={{ height: "40%" }}></div>
            </div>
          </div>

          <p className="text-emerald-100/40 text-xs">© 2026 Sync Board</p>
        </div>

        {/* RIGHT — the form */}
        <div className="flex-1 bg-white p-9 md:p-12 flex flex-col justify-center">
          <div className="w-full max-w-[300px] mx-auto">
            <h1 className="text-2xl font-medium tracking-tight text-[#1E293B] mb-1">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-[#64748B] mb-6">
              {mode === "login" ? "Log in to your board" : "Get started with Sync Board"}
            </p>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 rounded-lg px-3 py-2.5 mb-4">
                <AlertIcon className="mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {mode === "register" && (
                <div>
                  <label className="text-[13px] font-medium text-[#1E293B] mb-1.5 block">Full name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Alex Kim"
                    autoComplete="name"
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none bg-white transition-shadow ${
                      fieldErrors.name
                        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-[#CBD5E1] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    }`}
                  />
                  {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
                </div>
              )}

              <div>
                <label className="text-[13px] font-medium text-[#1E293B] mb-1.5 block">Email</label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    autoComplete="email"
                    className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none bg-white transition-shadow ${
                      fieldErrors.email
                        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-[#CBD5E1] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    }`}
                  />
                </div>
                {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="text-[13px] font-medium text-[#1E293B] mb-1.5 block">Password</label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    className={`w-full border rounded-lg pl-9 pr-9 py-2.5 text-sm outline-none bg-white transition-shadow ${
                      fieldErrors.password
                        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-[#CBD5E1] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
              </div>

              {mode === "login" && (
                <label className="flex items-center gap-2 text-[13px] text-[#475569] select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-indigo-600 focus:ring-indigo-400"
                  />
                  Remember me on this device
                </label>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm py-2.5 rounded-lg font-medium mt-1 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {submitting && <Spinner />}
                {submitting ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
              </button>
            </form>

            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
                setFieldErrors({});
              }}
              className="text-xs text-[#4F46E5] hover:underline mt-4 block mx-auto"
            >
              {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
            </button>

            {mode === "login" && (
              <p className="text-[11px] text-[#94A3B8] mt-5 border-t border-[#E2E8F0] pt-3">
                Demo account: demo@syncboard.dev / password123
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
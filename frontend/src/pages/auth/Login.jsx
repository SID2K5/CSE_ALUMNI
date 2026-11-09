import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, LogIn } from "lucide-react";

import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "../../components/auth/AuthShell";
import { Button } from "../../components/ui";

/* =====================================================
   LOGIN — POST /api/auth/login
   Backend returns 403 "Account pending admin approval"
   until an admin approves; we route those users to /pending.
   JWT handling is unchanged (AuthContext.login stores it).
===================================================== */

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", form);

      if (!data?.token) {
        toast.error("Login failed — no session token returned");
        return;
      }

      login(data);
      toast.success(`Welcome back, ${data.name?.split(" ")[0] || "there"}`);
      navigate("/feed");
    } catch (err) {
      const message = err?.response?.data?.message || "Login failed";
      if (message === "Account pending admin approval") {
        navigate("/pending");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your NEXUS account."
      footer={
        <p className="text-sm text-muted text-center">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-brand hover:underline"
          >
            Create one
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@college.edu"
            className="input"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              required
              autoComplete="current-password"
              value={form.password}
              onChange={set("password")}
              placeholder="••••••••"
              className="input pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 icon-btn !w-8 !h-8 text-muted"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          iconLeft={LogIn}
        >
          Sign in
        </Button>
      </form>

      {/* Demo accounts — kept for evaluation/demo use. Remove this block
          to hide them in a real deployment. */}
      <details className="mt-6 rounded-xl border border-line bg-surface-2 overflow-hidden">
        <summary className="px-4 py-2.5 text-xs font-semibold text-muted uppercase tracking-wide cursor-pointer select-none">
          Demo accounts
        </summary>
        <div className="px-4 pb-3 space-y-1 text-xs text-muted">
          <p>Admin · sid@example.com</p>
          <p>Student · student@example.com</p>
          <p>Alumni · alumni@example.com</p>
        </div>
      </details>
    </AuthShell>
  );
};

const Label = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5"
  >
    {children}
  </label>
);

export default Login;

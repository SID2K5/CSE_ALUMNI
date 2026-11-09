import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, UserPlus, GraduationCap, Building2 } from "lucide-react";

import API from "../../services/api";
import AuthShell from "../../components/auth/AuthShell";
import { Button } from "../../components/ui";

/* =====================================================
   REGISTER — POST /api/auth/register
   Backend accepts role only as "student" | "alumni";
   anything else (including "admin") falls back to student,
   so administrator rights can never be self-assigned.
   Accounts are created with isApproved:false and receive
   NO token until an admin approves them.
===================================================== */

const ROLES = [
  {
    value: "student",
    label: "Student",
    hint: "Currently studying",
    icon: GraduationCap,
  },
  {
    value: "alumni",
    label: "Alumni",
    hint: "Already graduated",
    icon: Building2,
  },
];

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    passOutYear: "",
    rollNumber: "",
    password: "",
    role: "student",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      await API.post("/auth/register", form);
      toast.success("Registration submitted for admin approval");
      navigate("/pending");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="An admin reviews every registration before access is granted."
      footer={
        <p className="text-sm text-muted text-center">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ROLE */}
        <div>
          <Label>I am a</Label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = form.role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, role: r.value }))}
                  aria-pressed={active}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-colors ${
                    active
                      ? "border-brand bg-brand-soft"
                      : "border-line bg-surface-2 hover:border-brand/50"
                  }`}
                >
                  <Icon
                    size={16}
                    className={`mt-0.5 shrink-0 ${
                      active ? "text-brand" : "text-muted"
                    }`}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">
                      {r.label}
                    </span>
                    <span className="block text-[11px] text-muted">
                      {r.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label htmlFor="name">Full name</Label>
          <input
            id="name"
            required
            autoComplete="name"
            value={form.name}
            onChange={set("name")}
            placeholder="Your full name"
            className="input"
          />
        </div>

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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="department">Department</Label>
            <input
              id="department"
              required
              value={form.department}
              onChange={set("department")}
              placeholder="e.g. CSE"
              className="input"
            />
          </div>
          <div>
            <Label htmlFor="passOutYear">
              {form.role === "alumni" ? "Pass-out year" : "Expected year"}
            </Label>
            <input
              id="passOutYear"
              type="number"
              required
              min="1950"
              max="2100"
              value={form.passOutYear}
              onChange={set("passOutYear")}
              placeholder="e.g. 2026"
              className="input"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="rollNumber">Roll number</Label>
          <input
            id="rollNumber"
            required
            value={form.rollNumber}
            onChange={set("rollNumber")}
            placeholder="Your college roll number"
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
              minLength={6}
              autoComplete="new-password"
              value={form.password}
              onChange={set("password")}
              placeholder="At least 6 characters"
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
          iconLeft={UserPlus}
        >
          Request access
        </Button>
      </form>
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

export default Register;

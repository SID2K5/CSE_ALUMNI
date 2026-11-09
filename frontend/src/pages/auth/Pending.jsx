import { Link, useNavigate } from "react-router-dom";
import { Clock, CheckCircle2, Mail, ArrowLeft } from "lucide-react";

import AuthShell from "../../components/auth/AuthShell";
import { Button } from "../../components/ui";

/* =====================================================
   PENDING APPROVAL — /pending
   Shown after registration and whenever login returns
   403 "Account pending admin approval".
   No session exists at this point, so there is nothing
   to log out of — we just offer a route back to sign-in.
===================================================== */

const STEPS = [
  { label: "Registration submitted", done: true },
  { label: "Admin review", done: false, active: true },
  { label: "Access granted", done: false },
];

const Pending = () => {
  const navigate = useNavigate();

  return (
    <AuthShell
      title="Your account is awaiting approval"
      subtitle="An administrator reviews every new registration. You'll be able to sign in as soon as yours is approved."
      footer={
        <p className="text-sm text-muted text-center">
          Approved already?{" "}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Try signing in
          </Link>
        </p>
      }
    >
      <div className="space-y-5">
        <div className="card p-5">
          <ol className="space-y-4">
            {STEPS.map((s, i) => (
              <li key={s.label} className="flex items-start gap-3">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    s.done
                      ? "bg-success/15 text-success"
                      : s.active
                      ? "bg-brand-soft text-brand"
                      : "bg-surface-2 text-muted"
                  }`}
                >
                  {s.done ? <CheckCircle2 size={15} /> : i + 1}
                </span>
                <div className="pt-0.5">
                  <p
                    className={`text-sm font-medium ${
                      s.done || s.active ? "text-ink" : "text-muted"
                    }`}
                  >
                    {s.label}
                  </p>
                  {s.active && (
                    <p className="text-xs text-muted mt-0.5 inline-flex items-center gap-1">
                      <Clock size={11} />
                      In progress
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-2 p-4">
          <Mail size={16} className="text-muted shrink-0 mt-0.5" />
          <p className="text-xs text-muted leading-relaxed">
            Approvals are handled manually by the department admin. If it has
            been a while, reach out to them directly — there is nothing further
            you need to do here.
          </p>
        </div>

        <Button
          variant="secondary"
          fullWidth
          iconLeft={ArrowLeft}
          onClick={() => navigate("/login")}
        >
          Back to sign in
        </Button>
      </div>
    </AuthShell>
  );
};

export default Pending;

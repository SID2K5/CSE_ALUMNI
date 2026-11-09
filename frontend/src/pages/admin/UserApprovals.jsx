import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { UsersPanel } from "./AdminDashboard";

/* =====================================================
   /admin/users — standalone registration queue.
   Reuses the exact panel rendered on the dashboard tab,
   so the two can never drift apart.
===================================================== */

const UserApprovals = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-10">
      <div className="pt-4 pb-5">
        <button
          onClick={() => navigate("/admin")}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-3"
        >
          <ArrowLeft size={14} />
          Admin
        </button>
        <h1 className="font-display font-extrabold text-2xl sm:text-[28px] text-ink tracking-tight">
          Registration approvals
        </h1>
        <p className="text-sm text-muted mt-1">
          Review new sign-ups and assign their role.
        </p>
      </div>

      <UsersPanel />
    </div>
  );
};

export default UserApprovals;

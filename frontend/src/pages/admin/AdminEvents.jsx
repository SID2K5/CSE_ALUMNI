import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { EventsPanel } from "./AdminDashboard";

/* =====================================================
   /admin/events — standalone event approval queue.
===================================================== */

const AdminEvents = () => {
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
          Event approvals
        </h1>
        <p className="text-sm text-muted mt-1">
          Events submitted by the community, pending review.
        </p>
      </div>

      <EventsPanel />
    </div>
  );
};

export default AdminEvents;

import { ReportsPanel } from "../../pages/admin/AdminDashboard";

/* =====================================================
   Content moderation queue.
   Thin wrapper so the dashboard tab and any standalone
   usage render the identical panel.
===================================================== */

const ReportedPosts = ({ onChanged }) => <ReportsPanel onChanged={onChanged} />;

export default ReportedPosts;

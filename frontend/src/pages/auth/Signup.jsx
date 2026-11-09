import { Navigate } from "react-router-dom";

/* =====================================================
   LEGACY /signup ROUTE
   The original signup screen has been superseded by
   /register, which collects the same fields plus the
   student/alumni role request.

   The route is kept so existing links and bookmarks keep
   working — it simply forwards to /register.
===================================================== */

const Signup = () => <Navigate to="/register" replace />;

export default Signup;

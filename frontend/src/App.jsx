import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// ================= AUTH =================
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Register from "./pages/auth/Register";
import Pending from "./pages/auth/Pending";

// ================= CORE =================
import Feed from "./pages/feed/Feed";
import Profile from "./pages/profile/Profile";
import UserProfile from "./pages/profile/UserProfile";

// ================= RESOURCES =================
import Resources from "./pages/resources/Resources";
import ResourcesBySemester from "./pages/resources/ResourcesBySemester";

// ================= CHAT & NOTIFICATIONS =================
import Chat from "./pages/chat/Chat";
import Notifications from "./pages/notifications/Notifications";

// ================= EVENTS =================
import Events from "./pages/events/Events";
import EventDetails from "./pages/events/EventDetails";

// ================= JOBS =================
import Jobs from "./pages/jobs/Jobs";

// ================= ALUMNI =================
import Alumni from "./pages/alumni/Alumni";
import CompanyPage from "./pages/alumni/CompanyPage";

// ================= CONNECTIONS =================
import Connections from "./pages/connections/Connections";

// ================= SEARCH =================
import Search from "./pages/search/Search";

// ================= TEACHERS =================
import Teachers from "./pages/teachers/Teachers";
import TeacherProfile from "./pages/teachers/TeacherProfile";
import TeacherDashboard from "./pages/teachers/TeacherDashboard";

// ================= ADMIN =================
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminJobs from "./components/admin/AdminJobs";

// ✅ NEW USER APPROVAL PAGE
import UserApprovals from "./pages/admin/UserApprovals";

function App() {
  return (
    <Router>

      <Routes>

        {/* ================================================= */}
        {/* AUTH ROUTES */}
        {/* ================================================= */}

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* OLD SIGNUP ROUTE (KEEPING SAFE) */}
        <Route path="/signup" element={<Signup />} />

        {/* NEW PREMIUM REGISTER PAGE */}
        <Route path="/register" element={<Register />} />

        {/* PENDING APPROVAL */}
        <Route path="/pending" element={<Pending />} />

        {/* ================================================= */}
        {/* MAIN APP ROUTES */}
        {/* ================================================= */}

        {/* ================= FEED ================= */}

        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Layout>
                <Feed />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ================= PROFILE ================= */}

        {/* MY PROFILE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* DYNAMIC USER PROFILE */}
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <UserProfile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* RESOURCES */}
        {/* ================================================= */}

        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <Layout>
                <Resources />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/resources/:semester"
          element={
            <ProtectedRoute>
              <Layout>
                <ResourcesBySemester />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* EVENTS */}
        {/* ================================================= */}

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Layout>
                <Events />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EventDetails />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* JOBS */}
        {/* ================================================= */}

        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <Layout>
                <Jobs />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* ALUMNI */}
        {/* ================================================= */}

        <Route
          path="/alumni"
          element={
            <ProtectedRoute>
              <Layout>
                <Alumni />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumni/company/:company"
          element={
            <ProtectedRoute>
              <Layout>
                <CompanyPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* CONNECTIONS */}
        {/* ================================================= */}

        <Route
          path="/connections"
          element={
            <ProtectedRoute>
              <Layout>
                <Connections />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* TEACHERS */}
        {/* ================================================= */}

        <Route
          path="/teachers"
          element={
            <ProtectedRoute>
              <Layout>
                <Teachers />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teachers/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <TeacherProfile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* TEACHER DASHBOARD */}
        {/* ================================================= */}

        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <TeacherDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* CHAT */}
        {/* ================================================= */}

        {/* MAIN CHAT */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Layout>
                <Chat />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* DYNAMIC CHAT */}
        <Route
          path="/chat/:conversationId"
          element={
            <ProtectedRoute>
              <Layout>
                <Chat />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* NOTIFICATIONS */}
        {/* ================================================= */}

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* SEARCH */}
        {/* ================================================= */}

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Layout>
                <Search />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* ADMIN */}
        {/* ================================================= */}

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ADMIN EVENTS */}
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminEvents />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* JOB APPROVALS */}
        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminJobs />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ✅ USER APPROVALS */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <Layout>
                <UserApprovals />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* FALLBACK */}
        {/* ================================================= */}

        <Route path="*" element={<Login />} />

      </Routes>

    </Router>
  );
}

export default App;
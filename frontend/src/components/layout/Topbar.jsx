import { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  MessageCircle,
  Sun,
  Moon,
  ShieldCheck,
  ChevronDown,
  BriefcaseBusiness,
  UserCheck,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

const Topbar = () => {
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const [showProfile, setShowProfile] = useState(false);
  const [showApproval, setShowApproval] = useState(false);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const notifRef = useRef();
  const profileRef = useRef();
  const searchRef = useRef();
  const approvalRef = useRef();

  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  /* ================= FETCH NOTIFICATIONS ================= */

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get("/notifications");

      setNotifications(data);

      const unreadCount = data.filter((n) => !n.isRead).length;

      setUnread(unreadCount);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  /* ================= MARK AS READ ================= */

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await Promise.all(
        notifications.map((n) =>
          !n.isRead ? API.put(`/notifications/${n._id}`) : null
        )
      );

      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= SEARCH ================= */

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!search.trim()) {
        setShowSearch(false);
        return;
      }

      try {
        const { data } = await API.get(`/search?query=${search}`);

        setResults(data);
        setShowSearch(true);
      } catch (err) {
        console.error(err);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  /* ================= OUTSIDE CLICK ================= */

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }

      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }

      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }

      if (approvalRef.current && !approvalRef.current.contains(e.target)) {
        setShowApproval(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div
        className="
        fixed top-0 left-0 w-full h-16 z-50
        backdrop-blur-2xl
        bg-white/70 dark:bg-[#020617]/85
        border-b border-white/20 dark:border-gray-800
        shadow-[0_8px_32px_rgba(0,0,0,0.08)]
        flex items-center justify-between
        px-4 md:px-8
      "
      >
        {/* ================= LOGO ================= */}
        <motion.h1
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/feed")}
          className="
            font-black text-2xl
            bg-gradient-to-r from-purple-500 via-cyan-400 to-pink-500
            bg-clip-text text-transparent
            cursor-pointer tracking-wide
          "
        >
          NEXUS 🚀
        </motion.h1>

        {/* ================= SEARCH ================= */}
        <div
          className="relative hidden md:flex w-[38%]"
          ref={searchRef}
        >
          <Search
            className="absolute left-4 top-3.5 text-gray-500"
            size={18}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users, posts, resources..."
            className="
              w-full pl-11 pr-4 py-3
              rounded-2xl
              bg-white/80 dark:bg-[#111827]
              border border-gray-200 dark:border-gray-700
              text-black dark:text-white
              placeholder:text-gray-500
              focus:outline-none
              focus:ring-2 focus:ring-purple-500
              shadow-md
            "
          />

          {/* SEARCH RESULTS */}
          <AnimatePresence>
            {showSearch && results && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="
                  absolute top-16 w-full
                  bg-white dark:bg-[#111827]
                  border border-gray-200 dark:border-gray-700
                  rounded-2xl
                  shadow-2xl
                  overflow-hidden
                  z-[999]
                "
              >
                {/* USERS */}
                {results.users?.length > 0 && (
                  <div className="p-2">
                    <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Users
                    </p>

                    {results.users.map((u) => (
                      <div
                        key={u._id}
                        onClick={() => navigate(`/profile/${u._id}`)}
                        className="
                          flex items-center gap-3
                          px-3 py-3 rounded-xl
                          hover:bg-gray-100 dark:hover:bg-gray-800
                          cursor-pointer transition
                        "
                      >
                        <img
                          src={
                            u.profilePic ||
                            "https://via.placeholder.com/40"
                          }
                          className="w-9 h-9 rounded-full object-cover"
                        />

                        <div>
                          <p className="font-medium text-black dark:text-white">
                            {u.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {u.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* POSTS */}
                {results.posts?.length > 0 && (
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Posts
                    </p>

                    {results.posts.map((p) => (
                      <div
                        key={p._id}
                        className="
                          px-3 py-3 rounded-xl
                          hover:bg-gray-100 dark:hover:bg-gray-800
                          cursor-pointer transition
                        "
                      >
                        <p className="text-black dark:text-white text-sm">
                          {p.content?.slice(0, 80)}...
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex items-center gap-3 md:gap-5 relative">

          {/* ================= APPROVALS ================= */}
          {user?.role === "admin" && (
            <div className="relative" ref={approvalRef}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowApproval(!showApproval)}
                className="
                  hidden md:flex items-center gap-2
                  px-4 py-2 rounded-2xl
                  bg-gradient-to-r from-yellow-400 to-orange-400
                  text-black font-semibold
                  shadow-lg
                "
              >
                <ShieldCheck size={17} />
                Approvals
                <ChevronDown size={15} />
              </motion.button>

              <AnimatePresence>
                {showApproval && (
                  <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="
                      absolute right-0 mt-3 w-56
                      bg-white dark:bg-[#111827]
                      border border-gray-200 dark:border-gray-700
                      rounded-2xl shadow-2xl
                      p-2 z-[999]
                    "
                  >
                    {/* JOB APPROVALS */}
                    <div
                      onClick={() => navigate("/admin/jobs")}
                      className="
                        flex items-center gap-3
                        p-3 rounded-xl
                        hover:bg-gray-100 dark:hover:bg-gray-800
                        cursor-pointer transition
                        text-black dark:text-white
                      "
                    >
                      <BriefcaseBusiness size={18} />
                      Job Approvals
                    </div>

                    {/* USER APPROVALS */}
                    <div
                      onClick={() => navigate("/admin/users")}
                      className="
                        flex items-center gap-3
                        p-3 rounded-xl
                        hover:bg-gray-100 dark:hover:bg-gray-800
                        cursor-pointer transition
                        text-black dark:text-white
                      "
                    >
                      <UserCheck size={18} />
                      User Approvals
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ================= NOTIFICATIONS ================= */}
          <div className="relative" ref={notifRef}>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowNotif(!showNotif)}
              className="
                relative p-2 rounded-xl
                hover:bg-gray-200 dark:hover:bg-gray-800
                transition
              "
            >
              <Bell className="text-black dark:text-white" />

              {unread > 0 && (
                <span
                  className="
                    absolute -top-1 -right-1
                    min-w-[18px] h-[18px]
                    flex items-center justify-center
                    bg-red-500 text-white text-[10px]
                    rounded-full font-semibold
                  "
                >
                  {unread}
                </span>
              )}
            </motion.button>
          </div>

          {/* ================= CHAT ================= */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate("/chat")}
            className="
              p-2 rounded-xl
              hover:bg-gray-200 dark:hover:bg-gray-800
              transition
            "
          >
            <MessageCircle className="text-black dark:text-white" />
          </motion.button>

          {/* ================= THEME ================= */}
          <motion.button
            whileHover={{ rotate: 15, scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            className="
              p-2 rounded-xl
              hover:bg-gray-200 dark:hover:bg-gray-800
              transition
            "
          >
            {theme === "dark" ? (
              <Sun className="text-yellow-400" />
            ) : (
              <Moon className="text-black" />
            )}
          </motion.button>

          {/* ================= PROFILE ================= */}
          <div className="relative" ref={profileRef}>
            <motion.img
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              src={
                user?.profilePic
                  ? user.profilePic
                  : "https://via.placeholder.com/40"
              }
              alt="profile"
              onClick={() => setShowProfile(!showProfile)}
              className="
                w-11 h-11 rounded-full
                cursor-pointer object-cover
                border-2 border-purple-500
                shadow-lg
              "
            />

            {/* PROFILE DROPDOWN */}
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="
                    absolute right-0 mt-3 w-44
                    bg-white dark:bg-[#111827]
                    border border-gray-200 dark:border-gray-700
                    rounded-2xl shadow-2xl
                    p-2 z-[999]
                  "
                >
                  <div
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="
                      flex items-center gap-2
                      p-3 rounded-xl
                      hover:bg-red-100 dark:hover:bg-red-900/40
                      cursor-pointer transition
                      text-red-500 font-medium
                    "
                  >
                    🚪 Logout
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ================= NOTIFICATIONS DROPDOWN ================= */}
      <AnimatePresence>
        {showNotif && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="
              fixed top-20 right-3 md:right-8
              w-[340px]
              bg-white dark:bg-[#111827]
              border border-gray-200 dark:border-gray-700
              rounded-3xl shadow-2xl
              p-4 z-[999]
            "
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-black dark:text-white">
                Notifications
              </h3>

              <button
                onClick={markAllRead}
                className="
                  text-sm font-medium
                  text-purple-500 hover:text-purple-600
                "
              >
                Mark all read
              </button>
            </div>

            {/* LIST */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">

              {notifications.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No notifications 🔔
                </div>
              )}

              {notifications.map((n) => (
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  key={n._id}
                  onClick={() => markAsRead(n._id)}
                  className={`
                    flex items-start gap-3
                    p-3 rounded-2xl
                    cursor-pointer transition
                    hover:bg-gray-100 dark:hover:bg-gray-800
                    ${
                      !n.isRead
                        ? "bg-purple-500/10 border border-purple-500/20"
                        : ""
                    }
                  `}
                >
                  <img
                    src={
                      user?.profilePic
                        ? user.profilePic
                        : "https://via.placeholder.com/40"
                    }
                    className="w-10 h-10 rounded-full object-cover"
                  />

                  <div className="flex-1">
                    <p className="text-sm text-black dark:text-white">
                      {n.message}
                    </p>

                    <span className="text-xs text-gray-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {!n.isRead && (
                    <span className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Topbar;
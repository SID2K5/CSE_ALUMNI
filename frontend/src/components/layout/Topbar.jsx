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
  LogOut,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { avatarUrl } from "../../utils/avatar";

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
      setUnread(data.filter((n) => !n.isRead).length);
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
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
      if (approvalRef.current && !approvalRef.current.contains(e.target)) setShowApproval(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header
        className="
          fixed top-0 left-0 w-full h-[72px] z-50
          backdrop-blur-xl
          bg-surface/80
          border-b border-line
          flex items-center justify-between gap-3
          px-4 md:px-6
        "
      >
        {/* ================= LOGO ================= */}
        <motion.h1
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/feed")}
          className="
            font-display font-extrabold text-2xl shrink-0
            gradient-text cursor-pointer tracking-tight select-none
          "
        >
          NEXUS
        </motion.h1>

        {/* ================= SEARCH (desktop) ================= */}
        <div className="relative hidden md:flex flex-1 max-w-[460px]" ref={searchRef}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people, posts, resources…"
            className="input pl-11 py-2.5 rounded-2xl"
          />

          <AnimatePresence>
            {showSearch && results && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-14 w-full card rounded-2xl overflow-hidden z-[999]"
              >
                {results.users?.length > 0 && (
                  <div className="p-2">
                    <p className="px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wide">
                      People
                    </p>
                    {results.users.map((u) => (
                      <div
                        key={u._id}
                        onClick={() => {
                          setShowSearch(false);
                          navigate(`/profile/${u._id}`);
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-2 cursor-pointer"
                      >
                        <img
                          src={avatarUrl(u, 40)}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-ink">{u.name}</p>
                          <p className="text-xs text-muted capitalize">{u.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {results.posts?.length > 0 && (
                  <div className="p-2 border-t border-line">
                    <p className="px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wide">
                      Posts
                    </p>
                    {results.posts.map((p) => (
                      <div
                        key={p._id}
                        className="px-3 py-2.5 rounded-xl hover:bg-surface-2 cursor-pointer"
                      >
                        <p className="text-ink text-sm line-clamp-1">
                          {p.content?.slice(0, 80)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {!results.users?.length && !results.posts?.length && (
                  <p className="p-4 text-sm text-muted text-center">No results found.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex items-center gap-1 md:gap-2 relative">

          {/* MOBILE SEARCH */}
          <button
            onClick={() => navigate("/search")}
            className="icon-btn md:hidden"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          {/* APPROVALS (admin) */}
          {user?.role === "admin" && (
            <div className="relative" ref={approvalRef}>
              <button
                onClick={() => setShowApproval(!showApproval)}
                className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-2 border border-line text-ink font-semibold text-sm"
              >
                <ShieldCheck size={17} className="text-brand" />
                Approvals
                <ChevronDown size={15} className="text-muted" />
              </button>

              <AnimatePresence>
                {showApproval && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-3 w-56 card rounded-2xl p-2 z-[999]"
                  >
                    <div
                      onClick={() => {
                        setShowApproval(false);
                        navigate("/admin/jobs");
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-2 cursor-pointer text-ink"
                    >
                      <BriefcaseBusiness size={18} className="text-muted" />
                      Job Approvals
                    </div>
                    <div
                      onClick={() => {
                        setShowApproval(false);
                        navigate("/admin/users");
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-2 cursor-pointer text-ink"
                    >
                      <UserCheck size={18} className="text-muted" />
                      User Approvals
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* NOTIFICATIONS */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => setShowNotif(!showNotif)} className="icon-btn relative" aria-label="Notifications">
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] rounded-full font-bold">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
          </div>

          {/* CHAT */}
          <button onClick={() => navigate("/chat")} className="icon-btn" aria-label="Chat">
            <MessageCircle size={20} />
          </button>

          {/* THEME */}
          <button onClick={toggleTheme} className="icon-btn" aria-label="Toggle theme">
            {theme === "dark" ? (
              <Sun size={20} className="text-amber-400" />
            ) : (
              <Moon size={20} />
            )}
          </button>

          {/* PROFILE */}
          <div className="relative ml-1" ref={profileRef}>
            <motion.img
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              src={avatarUrl(user, 44)}
              alt="profile"
              onClick={() => setShowProfile(!showProfile)}
              className="w-10 h-10 rounded-full cursor-pointer object-cover ring-2 ring-brand/50"
            />

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-3 w-52 card rounded-2xl p-2 z-[999]"
                >
                  <div className="flex items-center gap-3 p-3">
                    <img src={avatarUrl(user, 40)} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="font-semibold text-ink truncate">{user?.name || "User"}</p>
                      <p className="text-xs text-muted capitalize truncate">{user?.role}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfile(false);
                      navigate("/profile");
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-surface-2 text-ink text-sm font-medium"
                  >
                    View profile
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-500 text-sm font-medium"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ================= NOTIFICATIONS DROPDOWN ================= */}
      <AnimatePresence>
        {showNotif && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-[76px] right-3 md:right-6 w-[min(360px,calc(100vw-24px))] card rounded-2xl p-4 z-[999]"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-display font-bold text-lg text-ink">Notifications</h3>
              <button onClick={markAllRead} className="text-sm font-semibold text-brand hover:underline">
                Mark all read
              </button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {notifications.length === 0 && (
                <div className="text-center py-8 text-muted text-sm">You're all caught up 🔔</div>
              )}

              {notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => markAsRead(n._id)}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:bg-surface-2 ${
                    !n.isRead ? "bg-brand-soft" : ""
                  }`}
                >
                  <img src={avatarUrl(user, 40)} alt="" className="w-9 h-9 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink">{n.message}</p>
                    <span className="text-xs text-muted">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {!n.isRead && <span className="w-2 h-2 mt-2 bg-brand rounded-full shrink-0" />}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Topbar;

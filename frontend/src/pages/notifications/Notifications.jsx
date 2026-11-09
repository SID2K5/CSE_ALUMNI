import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  UserCheck,
  Info,
  CheckCheck,
  Trash2,
} from "lucide-react";

import API from "../../services/api";
import socket from "../../socket";

import { Avatar, Button, EmptyState, Skeleton } from "../../components/ui";

/* =====================================================
   NOTIFICATIONS — /notifications
   Types come from the backend enum:
   like | comment | connection | connection_request |
   connection_accepted | system
===================================================== */

const TYPE_META = {
  like: { icon: Heart, tint: "text-rose-500", bg: "bg-rose-500/10", label: "Likes" },
  comment: {
    icon: MessageSquare,
    tint: "text-cyan-500",
    bg: "bg-cyan-500/10",
    label: "Comments",
  },
  connection: {
    icon: UserPlus,
    tint: "text-violet-500",
    bg: "bg-violet-500/10",
    label: "Connections",
  },
  connection_request: {
    icon: UserPlus,
    tint: "text-violet-500",
    bg: "bg-violet-500/10",
    label: "Connections",
  },
  connection_accepted: {
    icon: UserCheck,
    tint: "text-emerald-500",
    bg: "bg-emerald-500/10",
    label: "Connections",
  },
  system: { icon: Info, tint: "text-muted", bg: "bg-surface-2", label: "System" },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "connection", label: "Connections" },
  { key: "like", label: "Likes" },
  { key: "comment", label: "Comments" },
];

const Notifications = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get("/notifications");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  /* Live updates — the server emits "notification" to the user's room */
  useEffect(() => {
    socket.on("notification", (n) => {
      if (!n) return;
      setItems((prev) => [n, ...prev]);
    });
    return () => socket.off("notification");
  }, []);

  const markRead = async (n) => {
    if (n.isRead) return;
    setItems((prev) =>
      prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x))
    );
    try {
      await API.put(`/notifications/${n._id}`);
    } catch {
      /* revert silently — non-critical */
      setItems((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, isRead: false } : x))
      );
    }
  };

  const markAllRead = async () => {
    setBusy(true);
    const snapshot = items;
    setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
    try {
      await API.put("/notifications/read-all");
      toast.success("All marked as read");
    } catch (err) {
      setItems(snapshot);
      toast.error("Could not mark all as read");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (n) => {
    const snapshot = items;
    setItems((prev) => prev.filter((x) => x._id !== n._id));
    try {
      await API.delete(`/notifications/${n._id}`);
    } catch {
      setItems(snapshot);
      toast.error("Could not delete");
    }
  };

  const open = (n) => {
    markRead(n);
    if (n.link) navigate(n.link);
  };

  /* ---------- derived ---------- */
  const unreadCount = useMemo(
    () => items.filter((n) => !n.isRead).length,
    [items]
  );

  const visible = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "unread") return items.filter((n) => !n.isRead);
    if (filter === "connection")
      return items.filter((n) =>
        ["connection", "connection_request", "connection_accepted"].includes(
          n.type
        )
      );
    return items.filter((n) => n.type === filter);
  }, [items, filter]);

  return (
    <div className="pb-10 max-w-3xl">
      {/* HEADER */}
      <div className="pt-4 pb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-[28px] text-ink tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-muted mt-1">
            {loading
              ? "Loading…"
              : unreadCount > 0
              ? `${unreadCount} unread`
              : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            iconLeft={CheckCheck}
            onClick={markAllRead}
            loading={busy}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 flex-wrap mb-5">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count =
            f.key === "unread"
              ? unreadCount
              : f.key === "all"
              ? items.length
              : null;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold transition-colors ${
                active
                  ? "bg-brand text-white"
                  : "bg-surface-2 text-ink border border-line hover:bg-surface"
              }`}
            >
              {f.label}
              {count > 0 && (
                <span className={active ? "text-white/80" : "text-muted"}>
                  · {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* LIST */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={
            filter === "unread" ? "Nothing unread" : "No notifications yet"
          }
          description={
            filter === "all"
              ? "Activity on your posts and connections will show up here."
              : "Try a different filter."
          }
        />
      ) : (
        <ul className="space-y-2">
          {visible.map((n) => {
            const meta = TYPE_META[n.type] || TYPE_META.system;
            const Icon = meta.icon;
            return (
              <li
                key={n._id}
                className={`card p-3 flex items-start gap-3 group transition-colors ${
                  !n.isRead ? "border-brand/35 bg-brand-soft/40" : ""
                } ${n.link ? "cursor-pointer hover:border-brand/40" : ""}`}
                onClick={() => open(n)}
              >
                {/* actor avatar, else type icon */}
                {n.sender ? (
                  <div className="relative shrink-0">
                    <Avatar user={n.sender} size={38} />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full ${meta.bg} border-2 border-surface flex items-center justify-center`}
                    >
                      <Icon size={10} className={meta.tint} />
                    </span>
                  </div>
                ) : (
                  <div
                    className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`}
                  >
                    <Icon size={16} className={meta.tint} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink leading-snug">
                    {n.sender?.name && (
                      <span className="font-semibold">{n.sender.name} </span>
                    )}
                    {n.message}
                  </p>
                  {n.createdAt && (
                    <span className="text-xs text-muted">
                      {dayjs(n.createdAt).format("MMM D, h:mm A")}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!n.isRead && (
                    <span
                      className="w-2 h-2 rounded-full bg-brand mt-1"
                      aria-label="Unread"
                    />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(n);
                    }}
                    className="icon-btn !w-8 !h-8 text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete notification"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Notifications;

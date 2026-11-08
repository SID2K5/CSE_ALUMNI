import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import {
  CalendarDays,
  MapPin,
  Users,
  Sparkles,
  Plus,
  Search,
  Trash2,
  Image as ImageIcon,
  Clock3,
} from "lucide-react";

import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useDebounce } from "../../hooks/useDebounce";

import {
  Badge,
  Button,
  EmptyState,
  Skeleton,
} from "../../components/ui";
import CreateEventModal from "../../components/events/CreateEventModal";

/* =====================================================
   EVENTS — poster-first discovery
   Tabs: Upcoming / Featured / Past / My RSVPs
===================================================== */

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "featured", label: "Featured" },
  { key: "past", label: "Past" },
  { key: "mine", label: "My RSVPs" },
];

const Events = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canCreate =
    user?.role === "alumni" ||
    user?.role === "teacher" ||
    user?.role === "admin";

  const [tab, setTab] = useState("upcoming");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [open, setOpen] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/events");
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /* ---------- derived ---------- */
  const filtered = useMemo(() => {
    const now = Date.now();
    const q = debouncedSearch.trim().toLowerCase();

    const bucket = events.filter((e) => {
      const end = e.endDate ? new Date(e.endDate).getTime() : 0;
      const start = e.startDate ? new Date(e.startDate).getTime() : 0;

      if (tab === "upcoming") return end >= now;
      if (tab === "past") return end < now;
      if (tab === "featured") return e.featured && end >= now;
      if (tab === "mine")
        return (e.attendees || []).some(
          (a) => (a?._id || a) === user?._id
        );
      return true;
    });

    if (!q) return bucket;
    return bucket.filter((e) =>
      [e.title, e.description, e.location, e.category]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q))
    );
  }, [events, tab, debouncedSearch, user?._id]);

  /* ---------- actions ---------- */
  const handleRSVP = async (e, event) => {
    e.stopPropagation();
    if (!user?._id) return;
    const joined = (event.attendees || []).some(
      (a) => (a?._id || a) === user._id
    );
    // Optimistic
    setEvents((prev) =>
      prev.map((x) => {
        if (x._id !== event._id) return x;
        const attendees = joined
          ? (x.attendees || []).filter(
              (a) => (a?._id || a) !== user._id
            )
          : [...(x.attendees || []), { _id: user._id, name: user.name }];
        return { ...x, attendees };
      })
    );
    try {
      await API.put(`/events/rsvp/${event._id}`);
    } catch (err) {
      console.error(err);
      toast.error("Could not update RSVP");
      fetchEvents();
    }
  };

  const handleDelete = async (e, event) => {
    e.stopPropagation();
    if (!confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/events/${event._id}`);
      setEvents((prev) => prev.filter((x) => x._id !== event._id));
      toast.success("Event deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  /* ---------- render ---------- */
  return (
    <div className="pb-10">
      {/* HEADER */}
      <div className="pt-4 pb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-[28px] text-ink tracking-tight">
            Events
          </h1>
          <p className="text-sm text-muted mt-1">
            Workshops, meetups and alumni gatherings.
          </p>
        </div>

        {canCreate && (
          <Button variant="primary" iconLeft={Plus} onClick={() => setOpen(true)}>
            New event
          </Button>
        )}
      </div>

      {/* TABS + SEARCH */}
      <div className="mb-5 flex flex-wrap gap-3 items-center">
        <div className="inline-flex p-1 rounded-xl bg-surface-2 border border-line">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center h-8 px-3 sm:px-4 rounded-lg text-sm font-semibold transition-colors ${
                  active
                    ? "bg-surface text-ink shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, venue, category…"
            className="input pl-9"
          />
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <Skeleton className="h-44 w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={
            tab === "mine"
              ? "You haven't RSVP'd to anything yet"
              : tab === "past"
              ? "No past events in your view"
              : tab === "featured"
              ? "No featured events right now"
              : "Nothing coming up"
          }
          description={
            debouncedSearch
              ? "Try widening your search."
              : canCreate
              ? "Be the first to post one for the community."
              : "Check back soon."
          }
          action={
            canCreate && !debouncedSearch ? (
              <Button variant="primary" iconLeft={Plus} onClick={() => setOpen(true)}>
                Create event
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((ev) => (
            <EventCard
              key={ev._id}
              event={ev}
              user={user}
              onOpen={() => navigate(`/events/${ev._id}`)}
              onRSVP={handleRSVP}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {canCreate && (
        <CreateEventModal
          open={open}
          onClose={() => setOpen(false)}
          onCreated={() => {
            setOpen(false);
            fetchEvents();
            toast.success("Event posted");
          }}
        />
      )}
    </div>
  );
};

/* ==================== EVENT CARD ==================== */
const EventCard = ({ event: ev, user, onOpen, onRSVP, onDelete }) => {
  const start = ev.startDate ? dayjs(ev.startDate) : null;
  const end = ev.endDate ? dayjs(ev.endDate) : null;
  const isPast = end && end.valueOf() < Date.now();
  const joined = (ev.attendees || []).some(
    (a) => (a?._id || a) === user?._id
  );
  const canDelete =
    user?.role === "admin" ||
    (ev.createdBy?._id && ev.createdBy._id === user?._id);

  return (
    <article
      onClick={onOpen}
      className="card overflow-hidden cursor-pointer group hover:border-brand/40 hover:shadow-md transition-all"
    >
      {/* POSTER */}
      <div className="relative aspect-[16/9] bg-surface-2 overflow-hidden">
        {ev.poster ? (
          <img
            src={ev.poster}
            alt={ev.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={40} className="text-muted" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {ev.featured && (
            <Badge variant="accent">
              <Sparkles size={10} />
              Featured
            </Badge>
          )}
          {isPast && <Badge variant="neutral">Past</Badge>}
        </div>
        {start && (
          <div className="absolute top-3 right-3 bg-surface/95 backdrop-blur text-ink rounded-lg px-2.5 py-1.5 text-center border border-line shadow-sm">
            <div className="text-[10px] font-semibold uppercase text-muted">
              {start.format("MMM")}
            </div>
            <div className="text-lg font-bold leading-none">
              {start.format("D")}
            </div>
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-ink line-clamp-2 leading-snug">
            {ev.title}
          </h3>
          {ev.description && (
            <p className="text-sm text-muted line-clamp-2 mt-1">
              {ev.description}
            </p>
          )}
        </div>

        <div className="space-y-1.5 text-xs text-muted">
          {start && (
            <div className="flex items-center gap-1.5">
              <Clock3 size={12} />
              {start.format("MMM D, h:mm A")}
              {end && !end.isSame(start, "day") && (
                <> → {end.format("MMM D")}</>
              )}
            </div>
          )}
          {ev.location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={12} />
              <span className="truncate">{ev.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Users size={12} />
            {(ev.attendees || []).length}{" "}
            {(ev.attendees || []).length === 1 ? "going" : "going"}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {!isPast ? (
            <Button
              variant={joined ? "secondary" : "primary"}
              size="sm"
              onClick={(e) => onRSVP(e, ev)}
              fullWidth
            >
              {joined ? "Going ✓" : "RSVP"}
            </Button>
          ) : (
            <div className="flex-1 text-xs text-muted text-center py-1.5">
              Event has ended
            </div>
          )}
          {canDelete && (
            <button
              onClick={(e) => onDelete(e, ev)}
              className="icon-btn !w-9 !h-9 border border-line text-red-500 hover:text-red-600"
              aria-label="Delete"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default Events;

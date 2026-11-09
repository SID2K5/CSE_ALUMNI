import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Sparkles,
  Clock3,
  Share2,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Skeleton,
} from "../../components/ui";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/events/${id}`);
      setEvent(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const joined =
    event?.attendees?.some((a) => (a?._id || a) === user?._id) || false;

  const start = event?.startDate ? dayjs(event.startDate) : null;
  const end = event?.endDate ? dayjs(event.endDate) : null;
  const isPast = end && end.valueOf() < Date.now();
  const canDelete =
    user?.role === "admin" ||
    (event?.createdBy?._id && event.createdBy._id === user?._id);

  const handleRSVP = async () => {
    if (!event?._id) return;
    setRsvpLoading(true);
    try {
      await API.put(`/events/rsvp/${event._id}`);
      await fetchEvent();
    } catch (err) {
      toast.error("Could not update RSVP");
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/events/${event._id}`);
      toast.success("Event deleted");
      navigate("/events");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* user dismissed share */
    }
  };

  if (loading) {
    return (
      <div className="pt-4 pb-10 space-y-5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (!event) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Event not found"
        description="This event may have been removed or does not exist."
        action={
          <Button variant="secondary" onClick={() => navigate("/events")}>
            Back to events
          </Button>
        }
      />
    );
  }

  const attendees = event.attendees || [];

  return (
    <div className="pb-10">
      <div className="pt-4">
        <button
          onClick={() => navigate("/events")}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4"
        >
          <ArrowLeft size={14} />
          Events
        </button>
      </div>

      {/* POSTER */}
      <div className="card overflow-hidden mb-5">
        <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-surface-2 overflow-hidden">
          {event.poster ? (
            <img
              src={event.poster}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={48} className="text-muted" />
            </div>
          )}

          <div className="absolute top-4 left-4 flex gap-2">
            {event.featured && (
              <Badge variant="accent">
                <Sparkles size={10} />
                Featured
              </Badge>
            )}
            {isPast && <Badge variant="neutral">Past</Badge>}
            {event.category && event.category !== "General" && (
              <Badge variant="info">{event.category}</Badge>
            )}
          </div>
        </div>

        {/* INFO BLOCK */}
        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
              {event.title}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="icon-btn !w-10 !h-10 border border-line"
                aria-label="Share"
                title="Share"
              >
                <Share2 size={16} />
              </button>
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="icon-btn !w-10 !h-10 border border-line text-danger hover:text-danger"
                  aria-label="Delete"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-5 text-sm">
            {start && (
              <InfoRow
                icon={CalendarDays}
                title="When"
                value={
                  start.isSame(end, "day") || !end
                    ? `${start.format("ddd, MMM D, YYYY")} · ${start.format(
                        "h:mm A"
                      )}${end ? ` – ${end.format("h:mm A")}` : ""}`
                    : `${start.format("MMM D")} → ${end.format("MMM D, YYYY")}`
                }
              />
            )}
            {event.location && (
              <InfoRow icon={MapPin} title="Where" value={event.location} />
            )}
            {event.createdBy?.name && (
              <InfoRow
                icon={Users}
                title="Organizer"
                value={event.createdBy.name}
              />
            )}
            <InfoRow
              icon={Clock3}
              title="Going"
              value={`${attendees.length} ${
                attendees.length === 1 ? "person" : "people"
              }`}
            />
          </div>

          <div className="mt-6">
            {!isPast ? (
              <Button
                variant={joined ? "secondary" : "primary"}
                size="lg"
                loading={rsvpLoading}
                onClick={handleRSVP}
              >
                {joined ? "Going ✓ · Cancel RSVP" : "RSVP to this event"}
              </Button>
            ) : (
              <p className="text-sm text-muted">This event has ended.</p>
            )}
          </div>
        </div>
      </div>

      {/* DESCRIPTION */}
      {event.description && (
        <div className="card p-5 sm:p-7 mb-5">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            About this event
          </h2>
          <p className="text-ink whitespace-pre-wrap leading-relaxed">
            {event.description}
          </p>
        </div>
      )}

      {/* ATTENDEES */}
      {attendees.length > 0 && (
        <div className="card p-5 sm:p-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">
              Who's going
            </h2>
            <Badge variant="neutral">{attendees.length}</Badge>
          </div>
          <div className="flex flex-wrap gap-3">
            {attendees.slice(0, 16).map((a) => (
              <div
                key={a._id || a}
                className="flex items-center gap-2 bg-surface-2 rounded-full pr-3 border border-line"
              >
                <Avatar user={a} size={28} />
                <span className="text-sm text-ink truncate max-w-[140px]">
                  {a.name || "Guest"}
                </span>
              </div>
            ))}
            {attendees.length > 16 && (
              <div className="flex items-center justify-center bg-surface-2 rounded-full px-3 border border-line text-sm text-muted">
                +{attendees.length - 16} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ icon: Icon, title, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={15} className="text-muted" />
    </div>
    <div className="min-w-0">
      <div className="text-xs font-semibold text-muted uppercase tracking-wide">
        {title}
      </div>
      <div className="text-ink text-sm mt-0.5 break-words">{value}</div>
    </div>
  </div>
);

export default EventDetails;

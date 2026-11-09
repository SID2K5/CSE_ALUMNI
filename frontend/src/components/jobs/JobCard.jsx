import dayjs from "dayjs";
import {
  Briefcase,
  MapPin,
  Clock,
  Bookmark,
  BookmarkCheck,
  Building2,
  Trash2,
  ArrowUpRight,
} from "lucide-react";

import { Badge, Avatar } from "../ui";

/* =====================================================
   JobCard — stateless list item.
   Surfaces title, company, location, type, experience, tags,
   posted date; exposes Open, Save and (optional) Delete.
===================================================== */

const TYPE_VARIANT = {
  "Full-time": "accent",
  Internship: "info",
  "Part-time": "warning",
  Contract: "neutral",
};

const EXPERIENCE_VARIANT = {
  Fresher: "success",
  Junior: "info",
  Mid: "warning",
  Senior: "accent",
};

const JobCard = ({
  job,
  saved = false,
  canDelete = false,
  onOpen,
  onSave,
  onDelete,
}) => {
  const posted = job.createdAt ? dayjs(job.createdAt) : null;
  const posterUser = job.postedBy;

  return (
    <article
      onClick={onOpen}
      className="card p-5 cursor-pointer group hover:border-brand/40 hover:shadow-md transition-all flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-brand-soft flex items-center justify-center shrink-0">
            <Building2 size={20} className="text-brand" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-ink truncate">{job.title}</h3>
            <p className="text-sm text-muted truncate">{job.company}</p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave?.();
          }}
          className={`icon-btn !w-9 !h-9 border border-line shrink-0 ${
            saved ? "text-brand" : ""
          }`}
          aria-label={saved ? "Unsave" : "Save"}
          title={saved ? "Unsave" : "Save"}
        >
          {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {job.type && (
          <Badge variant={TYPE_VARIANT[job.type] || "neutral"}>{job.type}</Badge>
        )}
        {job.experienceLevel && (
          <Badge variant={EXPERIENCE_VARIANT[job.experienceLevel] || "neutral"}>
            {job.experienceLevel}
          </Badge>
        )}
        {job.salary && <Badge variant="neutral">{job.salary}</Badge>}
      </div>

      <div className="space-y-1.5 text-sm text-muted">
        {job.location && (
          <div className="flex items-center gap-2">
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
        )}
        {posted && (
          <div className="flex items-center gap-2">
            <Clock size={14} className="shrink-0" />
            <span>Posted {posted.fromNow?.() || posted.format("MMM D")}</span>
          </div>
        )}
      </div>

      {Array.isArray(job.tags) && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="text-[11px] font-medium text-ink bg-surface-2 border border-line rounded-md px-2 py-0.5"
            >
              {t}
            </span>
          ))}
          {job.tags.length > 4 && (
            <span className="text-[11px] text-muted">
              +{job.tags.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-line">
        <div className="flex items-center gap-2 min-w-0">
          {posterUser && (
            <>
              <Avatar user={posterUser} size={22} />
              <span className="text-xs text-muted truncate">
                {posterUser.name}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="icon-btn !w-8 !h-8 border border-line text-red-500 hover:text-red-600"
              aria-label="Delete"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand opacity-0 group-hover:opacity-100 transition-opacity"
            aria-hidden
          >
            Open <ArrowUpRight size={12} />
          </span>
        </div>
      </div>
    </article>
  );
};

export default JobCard;

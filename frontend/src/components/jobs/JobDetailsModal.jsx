import { useState } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import {
  Briefcase,
  MapPin,
  Clock,
  Building2,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  CheckCircle2,
  Trash2,
} from "lucide-react";

import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import { Avatar, Badge, Button, Modal } from "../ui";

/* =====================================================
   JobDetailsModal — full view + Apply + Save.
   Apply opens the applyLink in a new tab AND notifies the
   backend tracker (optional).
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

const JobDetailsModal = ({
  job,
  open,
  onClose,
  saved,
  onSave,
  canDelete,
  onDelete,
}) => {
  const { user } = useAuth();
  const [applying, setApplying] = useState(false);

  if (!job) return null;

  const alreadyApplied =
    user?._id &&
    (job.applicants || []).some((a) => (a?._id || a) === user._id);

  const handleApply = async () => {
    if (!job.applyLink) {
      toast.error("No application link provided");
      return;
    }
    setApplying(true);
    try {
      // Open the external link first (user-gesture preserved)
      window.open(job.applyLink, "_blank", "noopener,noreferrer");
      // Fire-and-forget apply tracker
      API.put(`/jobs/apply/${job._id}`).catch(() => {});
      toast.success("Opened application in a new tab");
    } finally {
      setTimeout(() => setApplying(false), 400);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={null} size="lg">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-brand-soft flex items-center justify-center shrink-0">
            <Building2 size={26} className="text-brand" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display font-extrabold text-xl text-ink tracking-tight">
              {job.title}
            </h2>
            <p className="text-sm text-muted mt-0.5">{job.company}</p>
            <div className="flex items-center gap-2 flex-wrap mt-3">
              {job.type && (
                <Badge variant={TYPE_VARIANT[job.type] || "neutral"}>
                  {job.type}
                </Badge>
              )}
              {job.experienceLevel && (
                <Badge
                  variant={EXPERIENCE_VARIANT[job.experienceLevel] || "neutral"}
                >
                  {job.experienceLevel}
                </Badge>
              )}
              {job.salary && <Badge variant="neutral">{job.salary}</Badge>}
            </div>
          </div>
        </div>

        {/* META GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {job.location && (
            <MetaRow icon={MapPin} label="Location" value={job.location} />
          )}
          {job.type && (
            <MetaRow icon={Briefcase} label="Type" value={job.type} />
          )}
          {job.createdAt && (
            <MetaRow
              icon={Clock}
              label="Posted"
              value={dayjs(job.createdAt).format("MMM D, YYYY")}
            />
          )}
          {job.postedBy?.name && (
            <MetaRow
              icon={Building2}
              label="By"
              value={job.postedBy.name}
            />
          )}
        </div>

        {/* DESCRIPTION */}
        {job.description && (
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              About this role
            </h3>
            <p className="text-ink whitespace-pre-wrap text-sm leading-relaxed">
              {job.description}
            </p>
          </div>
        )}

        {/* TAGS */}
        {Array.isArray(job.tags) && job.tags.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {job.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs font-medium text-ink bg-surface-2 border border-line rounded-md px-2 py-1"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* APPLICANTS */}
        <div className="flex items-center gap-2 text-sm text-muted">
          <Avatar user={{ name: "?" }} size={22} />
          <span>
            {(job.applicants || []).length}{" "}
            {(job.applicants || []).length === 1 ? "applicant" : "applicants"}
            {alreadyApplied && (
              <span className="text-brand ml-1 font-medium">· you applied</span>
            )}
          </span>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 pt-2 border-t border-line">
          <Button
            variant="primary"
            size="lg"
            loading={applying}
            iconLeft={alreadyApplied ? CheckCircle2 : ExternalLink}
            onClick={handleApply}
          >
            {alreadyApplied ? "Apply again" : "Apply now"}
          </Button>
          <button
            onClick={onSave}
            className={`icon-btn !w-11 !h-11 border border-line ${
              saved ? "text-brand" : ""
            }`}
            aria-label={saved ? "Unsave" : "Save"}
            title={saved ? "Unsave" : "Save"}
          >
            {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
          {canDelete && (
            <button
              onClick={onDelete}
              className="icon-btn !w-11 !h-11 border border-line text-red-500 hover:text-red-600"
              aria-label="Delete"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

const MetaRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={15} className="text-muted" />
    </div>
    <div className="min-w-0">
      <div className="text-xs font-semibold text-muted uppercase tracking-wide">
        {label}
      </div>
      <div className="text-ink text-sm mt-0.5 break-words">{value}</div>
    </div>
  </div>
);

export default JobDetailsModal;

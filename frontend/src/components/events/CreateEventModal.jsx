import { useState } from "react";
import toast from "react-hot-toast";
import {
  Image as ImageIcon,
  X,
  CalendarPlus,
} from "lucide-react";

import API from "../../services/api";
import { Button, Modal } from "../ui";

/* =====================================================
   CREATE EVENT — modal form.
   Preserves POST /api/events multipart contract (poster file field).
===================================================== */

const emptyForm = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  location: "",
  category: "General",
  autoDelete: false,
};

const toLocalInput = (d) => {
  // yyyy-MM-ddThh:mm for <input type="datetime-local">
  const pad = (n) => String(n).padStart(2, "0");
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(
    dt.getDate()
  )}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const CreateEventModal = ({ open, onClose, onCreated }) => {
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const set = (k) => (e) =>
    setForm((p) => ({
      ...p,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const resetAll = () => {
    setForm(emptyForm);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
  };

  const pickFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      return toast.error("Poster must be an image");
    }
    if (f.size > 5 * 1024 * 1024) {
      return toast.error("Poster must be under 5 MB");
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.startDate ||
      !form.endDate ||
      !form.location.trim()
    ) {
      return toast.error("Please fill in all required fields");
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      return toast.error("End date cannot be before start date");
    }

    const fd = new FormData();
    Object.keys(form).forEach((k) => fd.append(k, form[k]));
    if (file) fd.append("poster", file);

    try {
      setLoading(true);
      await API.post("/events", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      resetAll();
      onCreated?.();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Could not create event");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    resetAll();
    onClose?.();
  };

  // Default starts in 1 hour; end in 2 hours
  const seedDefaults = () => {
    if (form.startDate && form.endDate) return;
    const now = new Date();
    const startAt = new Date(now.getTime() + 60 * 60 * 1000);
    const endAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    setForm((p) => ({
      ...p,
      startDate: p.startDate || toLocalInput(startAt),
      endDate: p.endDate || toLocalInput(endAt),
    }));
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create event"
      size="lg"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            iconLeft={CalendarPlus}
          >
            Create event
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" onFocus={seedDefaults}>
        {/* POSTER */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            pickFile(e.dataTransfer?.files?.[0]);
          }}
          className={`relative block border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-colors ${
            dragOver
              ? "border-brand bg-brand-soft"
              : "border-line hover:border-brand/60 bg-surface-2"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
          {preview ? (
            <>
              <img
                src={preview}
                alt="Poster preview"
                className="w-full aspect-[16/9] object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (preview) URL.revokeObjectURL(preview);
                  setPreview(null);
                  setFile(null);
                }}
                className="absolute top-2 right-2 icon-btn !w-9 !h-9 bg-surface border border-line"
                aria-label="Remove poster"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center">
                <ImageIcon size={18} className="text-brand" />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-ink">
                  Add a poster (optional)
                </div>
                <div className="text-xs text-muted mt-0.5">
                  Image up to 5 MB · 16:9 looks best
                </div>
              </div>
            </div>
          )}
        </label>

        {/* FIELDS */}
        <div>
          <Label>Title *</Label>
          <input
            className="input"
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. Alumni × Student Mixer"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Start *</Label>
            <input
              type="datetime-local"
              className="input"
              value={form.startDate}
              onChange={set("startDate")}
            />
          </div>
          <div>
            <Label>End *</Label>
            <input
              type="datetime-local"
              className="input"
              value={form.endDate}
              onChange={set("endDate")}
            />
          </div>
        </div>

        <div>
          <Label>Location *</Label>
          <input
            className="input"
            value={form.location}
            onChange={set("location")}
            placeholder="Venue or meeting link"
          />
        </div>

        <div>
          <Label>Category</Label>
          <select
            className="input"
            value={form.category}
            onChange={set("category")}
          >
            {[
              "General",
              "Workshop",
              "Hackathon",
              "Alumni Meetup",
              "Networking",
              "Talk",
              "Social",
            ].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Description *</Label>
          <textarea
            className="input"
            rows={4}
            value={form.description}
            onChange={set("description")}
            placeholder="What is this event about? Who is it for?"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.autoDelete}
            onChange={set("autoDelete")}
            className="w-4 h-4 accent-brand"
          />
          Remove this event automatically after it ends
        </label>
      </form>
    </Modal>
  );
};

const Label = ({ children }) => (
  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
    {children}
  </label>
);

export default CreateEventModal;

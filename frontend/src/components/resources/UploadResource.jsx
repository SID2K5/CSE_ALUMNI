import { useState } from "react";
import toast from "react-hot-toast";
import { UploadCloud, FileText, X } from "lucide-react";

import API from "../../services/api";
import { Button, Modal } from "../ui";

/* =====================================================
   UPLOAD RESOURCE — modal form (admin + teacher)
   Preserves existing POST /api/resources contract (multipart).
===================================================== */

const CATEGORIES = [
  { value: "notes", label: "Notes" },
  { value: "pyq", label: "Previous Year Questions" },
  { value: "assignment", label: "Assignment" },
  { value: "study-material", label: "Study Material" },
  { value: "other", label: "Other" },
];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const MAX_MB = 30;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const emptyForm = {
  title: "",
  description: "",
  semester: "",
  type: "notes",
  subject: "",
  tags: "",
};

const UploadResource = ({ open, onClose, onUploaded }) => {
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const set = (k) => (e) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const resetAll = () => {
    setForm(emptyForm);
    setFile(null);
  };

  const pickFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      return toast.error("Only PDF files are allowed");
    }
    if (f.size > MAX_BYTES) {
      return toast.error(`File must be under ${MAX_MB} MB`);
    }
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer?.files?.[0]);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!file) return toast.error("Please select a PDF file");
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.semester) return toast.error("Semester is required");
    if (!form.subject.trim()) return toast.error("Subject is required");

    const fd = new FormData();
    fd.append("title", form.title.trim());
    fd.append("description", form.description.trim());
    fd.append("semester", Number(form.semester));
    fd.append("type", form.type);
    fd.append("subject", form.subject.trim());
    fd.append("tags", form.tags.trim());
    fd.append("file", file);

    try {
      setLoading(true);
      await API.post("/resources", fd);
      toast.success("Resource uploaded");
      resetAll();
      onUploaded?.();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    resetAll();
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Upload resource"
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
            iconLeft={UploadCloud}
          >
            Upload
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* FILE */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${
            dragOver
              ? "border-brand bg-brand-soft"
              : "border-line hover:border-brand/60 bg-surface-2"
          }`}
        >
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
          {file ? (
            <div className="flex items-center gap-3 w-full">
              <FileText size={20} className="text-brand shrink-0" />
              <div className="min-w-0 flex-1 text-left">
                <div className="font-medium text-ink truncate">{file.name}</div>
                <div className="text-xs text-muted">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setFile(null);
                }}
                className="icon-btn !w-8 !h-8 border border-line"
                aria-label="Remove file"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center">
                <UploadCloud size={18} className="text-brand" />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-ink">
                  Drop a PDF or click to browse
                </div>
                <div className="text-xs text-muted mt-0.5">
                  Max {MAX_MB} MB · PDF only
                </div>
              </div>
            </>
          )}
        </label>

        {/* FIELDS */}
        <div>
          <Label>Title *</Label>
          <input
            className="input"
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. Unit 3 — Trees and Graphs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Semester *</Label>
            <select
              className="input"
              value={form.semester}
              onChange={set("semester")}
            >
              <option value="">Choose semester…</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Category</Label>
            <select
              className="input"
              value={form.type}
              onChange={set("type")}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label>Subject *</Label>
          <input
            className="input"
            value={form.subject}
            onChange={set("subject")}
            placeholder="e.g. Data Structures"
          />
        </div>

        <div>
          <Label>Description</Label>
          <textarea
            className="input"
            rows={3}
            value={form.description}
            onChange={set("description")}
            placeholder="Short description (optional)"
          />
        </div>

        <div>
          <Label>Tags</Label>
          <input
            className="input"
            value={form.tags}
            onChange={set("tags")}
            placeholder="Comma-separated, e.g. trees, bfs, dfs"
          />
          <p className="text-xs text-muted mt-1">
            Help students find this resource by topic.
          </p>
        </div>
      </form>
    </Modal>
  );
};

const Label = ({ children }) => (
  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
    {children}
  </label>
);

export default UploadResource;

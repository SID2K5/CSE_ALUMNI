import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Eye,
  Bookmark,
  BookmarkCheck,
  Trash2,
  FileText,
  Search,
  User as UserIcon,
  Calendar,
  BookOpen,
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
import PDFViewer from "../../components/resources/PDFViewer";

const CATEGORIES = [
  { key: "", label: "All" },
  { key: "notes", label: "Notes" },
  { key: "pyq", label: "Previous Papers" },
  { key: "assignment", label: "Assignments" },
  { key: "study-material", label: "Study Material" },
  { key: "other", label: "Other" },
];

const CAT_VARIANT = {
  notes: "info",
  pyq: "warning",
  assignment: "accent",
  "study-material": "success",
  other: "neutral",
};

const CAT_LABEL = {
  notes: "Notes",
  pyq: "PYQ",
  assignment: "Assignment",
  "study-material": "Study Material",
  other: "Other",
};

const ResourcesBySemester = () => {
  const { semester } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const typeFromUrl = searchParams.get("type") || "";

  const [category, setCategory] = useState(typeFromUrl);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [resources, setResources] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Keep category in URL for shareable links
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (category) next.set("type", category);
    else next.delete("type");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("semester", semester);
      if (category) params.set("type", category);
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      const { data } = await API.get(`/resources?${params.toString()}`);
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load resources");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const { data } = await API.get("/bookmarks");
      setBookmarks((data || []).map((b) => b._id));
    } catch {
      /* non-fatal */
    }
  };

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semester, category, debouncedSearch]);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  /* ----------- actions ----------- */

  const handleDownload = async (r) => {
    try {
      // Fire the backend view+counter endpoint, then stream from Cloudinary.
      await API.get(`/resources/download/${r._id}`).catch(() => {});
      const res = await fetch(r.fileUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const name =
        (r.title || "resource").replace(/[^\w\s.-]/g, "").replace(/\s+/g, "_") +
        ".pdf";
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Download failed");
    }
  };

  const handlePreview = async (r) => {
    setPreviewFile(r.fileUrl);
    // Fire-and-forget: increment view counter
    API.put(`/resources/view/${r._id}`).catch(() => {});
  };

  const handleDelete = async (r) => {
    if (!confirm(`Delete "${r.title}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/resources/${r._id}`);
      setResources((prev) => prev.filter((x) => x._id !== r._id));
      toast.success("Resource deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const toggleBookmark = async (r) => {
    setTogglingId(r._id);
    try {
      await API.put(`/bookmarks/${r._id}`);
      setBookmarks((prev) =>
        prev.includes(r._id)
          ? prev.filter((id) => id !== r._id)
          : [...prev, r._id]
      );
    } catch (err) {
      toast.error("Could not toggle bookmark");
    } finally {
      setTogglingId(null);
    }
  };

  /* ----------- derived ----------- */

  const canDelete = (r) =>
    user?.role === "admin" || user?._id === r.uploadedBy?._id;

  const counts = useMemo(() => {
    const m = { total: resources.length };
    CATEGORIES.slice(1).forEach(
      (c) => (m[c.key] = resources.filter((r) => r.type === c.key).length)
    );
    return m;
  }, [resources]);

  /* ----------- render ----------- */

  return (
    <div className="pb-10">
      {/* HEADER */}
      <div className="pt-4 pb-5">
        <button
          onClick={() => navigate("/resources")}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-3"
        >
          <ArrowLeft size={14} />
          Resources
        </button>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-xl bg-brand-soft flex items-center justify-center shrink-0">
            <BookOpen size={26} className="text-brand" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-extrabold text-2xl sm:text-[28px] text-ink tracking-tight">
              Semester {semester}
            </h1>
            <p className="text-sm text-muted mt-1">
              {loading
                ? "Loading…"
                : `${resources.length} resource${
                    resources.length === 1 ? "" : "s"
                  }${category ? ` in ${CAT_LABEL[category] || category}` : ""}`}
            </p>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card p-3 sm:p-4 mb-5">
        <div className="relative mb-3">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, subject, tag…"
            className="input pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => {
            const active = category === c.key;
            const count = c.key ? counts[c.key] || 0 : counts.total || 0;
            return (
              <button
                key={c.key || "all"}
                onClick={() => setCategory(c.key)}
                className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold transition-colors ${
                  active
                    ? "bg-brand text-brand-ink"
                    : "bg-surface-2 text-ink hover:bg-surface border border-line"
                }`}
              >
                {c.label}
                {count > 0 && (
                  <span
                    className={`text-[10px] ${
                      active ? "text-brand-ink/80" : "text-muted"
                    }`}
                  >
                    · {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resources here yet"
          description={
            category || debouncedSearch
              ? "Try a different category or search term."
              : "Nothing has been uploaded for this semester."
          }
          action={
            category || debouncedSearch ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setCategory("");
                  setSearch("");
                }}
              >
                Clear filters
              </Button>
            ) : null
          }
        />
      ) : (
        <ul className="space-y-3">
          {resources.map((r) => (
            <ResourceRow
              key={r._id}
              r={r}
              bookmarked={bookmarks.includes(r._id)}
              toggling={togglingId === r._id}
              onDownload={() => handleDownload(r)}
              onPreview={() => handlePreview(r)}
              onDelete={() => handleDelete(r)}
              onBookmark={() => toggleBookmark(r)}
              canDelete={canDelete(r)}
            />
          ))}
        </ul>
      )}

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {previewFile && (
          <PDFViewer
            file={previewFile}
            onClose={() => setPreviewFile(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ResourceRow = ({
  r,
  bookmarked,
  toggling,
  onDownload,
  onPreview,
  onDelete,
  onBookmark,
  canDelete,
}) => (
  <li className="card p-4 flex items-start gap-4">
    <div className="w-11 h-11 rounded-lg bg-brand-soft flex items-center justify-center shrink-0">
      <FileText size={18} className="text-brand" />
    </div>

    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="font-semibold text-ink truncate">{r.title}</h3>
        <Badge variant={CAT_VARIANT[r.type] || "neutral"}>
          {CAT_LABEL[r.type] || r.type}
        </Badge>
      </div>

      {r.description && (
        <p className="text-sm text-muted mt-1 line-clamp-2">{r.description}</p>
      )}

      <div className="flex items-center gap-3 text-xs text-muted mt-2 flex-wrap">
        {r.subject && (
          <span className="inline-flex items-center gap-1">
            <BookOpen size={12} />
            {r.subject}
          </span>
        )}
        {r.uploadedBy?.name && (
          <span className="inline-flex items-center gap-1">
            <UserIcon size={12} />
            {r.uploadedBy.name}
          </span>
        )}
        {r.createdAt && (
          <span className="inline-flex items-center gap-1">
            <Calendar size={12} />
            {new Date(r.createdAt).toLocaleDateString()}
          </span>
        )}
        {typeof r.downloads === "number" && (
          <span className="inline-flex items-center gap-1">
            <Download size={12} />
            {r.downloads}
          </span>
        )}
      </div>

      {Array.isArray(r.tags) && r.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {r.tags.slice(0, 4).map((t) => (
            <Badge key={t} variant="neutral">
              #{t}
            </Badge>
          ))}
        </div>
      )}
    </div>

    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={onPreview}
        className="icon-btn !w-9 !h-9 border border-line"
        aria-label="Preview"
        title="Preview"
      >
        <Eye size={16} />
      </button>
      <button
        onClick={onDownload}
        className="icon-btn !w-9 !h-9 border border-line"
        aria-label="Download"
        title="Download"
      >
        <Download size={16} />
      </button>
      <button
        onClick={onBookmark}
        disabled={toggling}
        className={`icon-btn !w-9 !h-9 border border-line ${
          bookmarked ? "text-brand" : ""
        }`}
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
        title={bookmarked ? "Remove bookmark" : "Bookmark"}
      >
        {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
      </button>
      {canDelete && (
        <button
          onClick={onDelete}
          className="icon-btn !w-9 !h-9 border border-line text-red-500 hover:text-red-600"
          aria-label="Delete"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  </li>
);

export default ResourcesBySemester;

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import {
  Upload,
  FileText,
  Download,
  Eye,
  Trash2,
  BookOpen,
  Search,
  LayoutDashboard,
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
import UploadResource from "../../components/resources/UploadResource";

/* =====================================================
   TEACHER DASHBOARD — /teacher-dashboard
   Teacher's own uploads + usage stats. Route is already
   gated to role "teacher" in App.jsx.
===================================================== */

const CAT_LABEL = {
  notes: "Notes",
  pyq: "PYQ",
  assignment: "Assignment",
  "study-material": "Study Material",
  other: "Other",
};

const CAT_VARIANT = {
  notes: "info",
  pyq: "warning",
  assignment: "accent",
  "study-material": "success",
  other: "neutral",
};

const TeacherDashboard = () => {
  const { user } = useAuth();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);

  const fetchMine = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/resources/my");
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load your uploads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMine();
  }, []);

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

  /* ---------- derived stats (all from real data) ---------- */
  const stats = useMemo(() => {
    const downloads = resources.reduce(
      (n, r) => n + (Number(r.downloads) || 0),
      0
    );
    const views = resources.reduce((n, r) => n + (Number(r.views) || 0), 0);
    const semesters = new Set(resources.map((r) => r.semester).filter(Boolean));
    return {
      total: resources.length,
      downloads,
      views,
      semesters: semesters.size,
    };
  }, [resources]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return resources;
    return resources.filter((r) =>
      [r.title, r.subject, r.description, ...(r.tags || [])]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q))
    );
  }, [resources, debouncedSearch]);

  return (
    <div className="pb-10">
      {/* HEADER */}
      <div className="pt-4 pb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-[28px] text-ink tracking-tight">
            Teaching dashboard
          </h1>
          <p className="text-sm text-muted mt-1">
            {user?.name ? `${user.name} · ` : ""}Your uploaded study material.
          </p>
        </div>
        <Button variant="primary" iconLeft={Upload} onClick={() => setUploadOpen(true)}>
          Upload resource
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatTile
          label="Resources"
          value={loading ? "—" : stats.total}
          icon={FileText}
        />
        <StatTile
          label="Total downloads"
          value={loading ? "—" : stats.downloads}
          icon={Download}
        />
        <StatTile label="Total views" value={loading ? "—" : stats.views} icon={Eye} />
        <StatTile
          label="Semesters covered"
          value={loading ? "—" : stats.semesters}
          icon={BookOpen}
        />
      </div>

      {/* SEARCH */}
      {resources.length > 0 && (
        <div className="card p-3 sm:p-4 mb-5">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your uploads…"
              className="input pl-9"
            />
          </div>
        </div>
      )}

      {/* LIST */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={resources.length === 0 ? LayoutDashboard : Search}
          title={
            resources.length === 0
              ? "No uploads yet"
              : "Nothing matches that search"
          }
          description={
            resources.length === 0
              ? "Upload notes, past papers or assignments for your students."
              : "Try a different title, subject or tag."
          }
          action={
            resources.length === 0 ? (
              <Button
                variant="primary"
                iconLeft={Upload}
                onClick={() => setUploadOpen(true)}
              >
                Upload your first resource
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => setSearch("")}>
                Clear search
              </Button>
            )
          }
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => (
            <li key={r._id} className="card p-4 flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-brand-soft flex items-center justify-center shrink-0">
                <FileText size={18} className="text-brand" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-ink truncate">{r.title}</h3>
                  {r.type && (
                    <Badge variant={CAT_VARIANT[r.type] || "neutral"}>
                      {CAT_LABEL[r.type] || r.type}
                    </Badge>
                  )}
                </div>
                {r.description && (
                  <p className="text-sm text-muted line-clamp-1 mt-1">
                    {r.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <BookOpen size={12} />
                    Sem {r.semester}
                  </span>
                  {r.subject && <span>· {r.subject}</span>}
                  <span className="inline-flex items-center gap-1">
                    <Download size={12} />
                    {r.downloads || 0}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Eye size={12} />
                    {r.views || 0}
                  </span>
                  {r.createdAt && (
                    <span>· {dayjs(r.createdAt).format("MMM D, YYYY")}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {r.fileUrl && (
                  <a
                    href={r.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="icon-btn !w-9 !h-9 border border-line"
                    aria-label="Open"
                    title="Open"
                  >
                    <Eye size={16} />
                  </a>
                )}
                <button
                  onClick={() => handleDelete(r)}
                  className="icon-btn !w-9 !h-9 border border-line text-red-500 hover:text-red-600"
                  aria-label="Delete"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* UPLOAD MODAL */}
      <UploadResource
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => {
          setUploadOpen(false);
          fetchMine();
        }}
      />
    </div>
  );
};

const StatTile = ({ label, value, icon: Icon }) => (
  <div className="card px-4 py-3 flex items-center gap-3">
    <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
      <Icon size={16} className="text-muted" />
    </div>
    <div className="min-w-0">
      <div className="text-lg font-semibold text-ink leading-tight">{value}</div>
      <div className="text-xs text-muted truncate">{label}</div>
    </div>
  </div>
);

export default TeacherDashboard;

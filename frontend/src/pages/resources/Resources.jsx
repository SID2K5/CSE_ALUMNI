import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FolderOpen,
  BookOpen,
  Upload,
  FileText,
} from "lucide-react";

import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useDebounce } from "../../hooks/useDebounce";

import {
  Button,
  Badge,
  EmptyState,
  Skeleton,
} from "../../components/ui";
import UploadResource from "../../components/resources/UploadResource";

/* =====================================================
   RESOURCES LANDING
   - Semester tiles with real counts
   - Category filter chips (all/notes/pyq/assignment/study-material/other)
   - Global search across all resources
   - Admin + Teacher: upload CTA (opens modal)
===================================================== */

// Schema allows 1–8 semesters; UI renders a 2×4 / 4×2 grid.
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const CATEGORIES = [
  { key: "", label: "All" },
  { key: "notes", label: "Notes" },
  { key: "pyq", label: "Previous Papers" },
  { key: "assignment", label: "Assignments" },
  { key: "study-material", label: "Study Material" },
  { key: "other", label: "Other" },
];

const Resources = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canUpload = user?.role === "admin" || user?.role === "teacher";

  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("type", category);
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

      const { data } = await API.get(`/resources?${params.toString()}`);
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Resources fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, debouncedSearch]);

  const countsBySem = useMemo(() => {
    const m = {};
    resources.forEach((r) => {
      m[r.semester] = (m[r.semester] || 0) + 1;
    });
    return m;
  }, [resources]);

  const total = resources.length;

  return (
    <div className="pb-10">
      {/* HEADER */}
      <div className="pt-4 pb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-[28px] text-ink tracking-tight">
            Academic Resources
          </h1>
          <p className="text-sm text-muted mt-1">
            Notes, previous papers, assignments and study material for your
            semester.
          </p>
        </div>

        {canUpload && (
          <Button
            variant="primary"
            iconLeft={Upload}
            onClick={() => setUploadOpen(true)}
          >
            Upload resource
          </Button>
        )}
      </div>

      {/* SEARCH + CATEGORY CHIPS */}
      <div className="card p-3 sm:p-4 mb-6">
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
            return (
              <button
                key={c.key || "all"}
                onClick={() => setCategory(c.key)}
                className={`inline-flex items-center h-8 px-3 rounded-full text-xs font-semibold transition-colors ${
                  active
                    ? "bg-brand text-brand-ink"
                    : "bg-surface-2 text-ink hover:bg-surface border border-line"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SEMESTER TILES */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : total === 0 && (category || debouncedSearch) ? (
        <EmptyState
          icon={BookOpen}
          title="Nothing matches"
          description="Try a different category or search term."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setCategory("");
                setSearch("");
              }}
            >
              Reset filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SEMESTERS.map((sem) => {
            const count = countsBySem[sem] || 0;
            const empty = count === 0;
            return (
              <button
                key={sem}
                onClick={() => {
                  const q = category ? `?type=${category}` : "";
                  navigate(`/resources/${sem}${q}`);
                }}
                className={`card p-5 text-left group relative overflow-hidden ${
                  empty
                    ? "opacity-70 hover:opacity-100"
                    : "hover:border-brand/40 hover:shadow-md"
                } transition-all`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      empty ? "bg-surface-2" : "bg-brand-soft"
                    }`}
                  >
                    <FolderOpen
                      size={20}
                      className={empty ? "text-muted" : "text-brand"}
                    />
                  </div>
                  {!empty && (
                    <Badge variant="accent">
                      {count} {count === 1 ? "file" : "files"}
                    </Badge>
                  )}
                </div>
                <div className="font-semibold text-ink">Semester {sem}</div>
                <div className="text-xs text-muted mt-0.5">
                  {empty ? "No resources yet" : "Tap to open"}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* RECENT UPLOADS (last 5) */}
      {!loading && resources.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            Recently added
          </h2>
          <div className="card divide-y divide-line overflow-hidden">
            {resources.slice(0, 5).map((r) => (
              <button
                key={r._id}
                onClick={() => navigate(`/resources/${r.semester}`)}
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-surface-2 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-muted" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-ink truncate">
                    {r.title}
                  </div>
                  <div className="text-xs text-muted truncate">
                    Sem {r.semester} · {r.subject || "—"}
                    {r.uploadedBy?.name ? ` · by ${r.uploadedBy.name}` : ""}
                  </div>
                </div>
                <Badge variant="neutral">{r.type}</Badge>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* UPLOAD MODAL */}
      {canUpload && (
        <UploadResource
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploaded={() => {
            setUploadOpen(false);
            fetchResources();
          }}
        />
      )}
    </div>
  );
};

export default Resources;

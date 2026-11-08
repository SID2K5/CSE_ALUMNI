import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  Filter,
  X,
  Briefcase,
  Bookmark,
} from "lucide-react";

import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useDebounce } from "../../hooks/useDebounce";

import {
  Button,
  EmptyState,
  Skeleton,
} from "../../components/ui";
import JobCard from "../../components/jobs/JobCard";
import JobDetailsModal from "../../components/jobs/JobDetailsModal";
import CreateJobModal from "../../components/jobs/CreateJobModal";

/* =====================================================
   JOBS & INTERNSHIPS
   - Real server-side filters: search, type, location, experience, skill
   - Saved jobs persisted to localStorage per user
   - Create flow for alumni/teacher/admin → admin approval queue
===================================================== */

const TYPES = ["Full-time", "Internship", "Part-time", "Contract"];
const EXPERIENCE = ["Fresher", "Junior", "Mid", "Senior"];

const Jobs = () => {
  const { user } = useAuth();
  const canCreate =
    user?.role === "alumni" ||
    user?.role === "teacher" ||
    user?.role === "admin";

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const debouncedLocation = useDebounce(location, 300);

  const [selected, setSelected] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  /* ---------- saved (localStorage per user) ---------- */
  const storageKey = `savedJobs_${user?._id || "guest"}`;
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  });

  const persistSaved = (next) => {
    setSaved(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
  };

  const toggleSave = (job) => {
    const already = saved.includes(job._id);
    persistSaved(already ? saved.filter((id) => id !== job._id) : [...saved, job._id]);
  };

  /* ---------- fetch ---------- */
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (type) params.set("type", type);
      if (debouncedLocation.trim()) params.set("location", debouncedLocation.trim());
      if (experienceLevel) params.set("experienceLevel", experienceLevel);
      const { data } = await API.get(`/jobs?${params.toString()}`);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, type, debouncedLocation, experienceLevel]);

  /* ---------- actions ---------- */
  const handleDelete = async (job) => {
    if (!confirm(`Delete "${job.title}" at ${job.company}?`)) return;
    try {
      await API.delete(`/jobs/${job._id}`);
      setJobs((prev) => prev.filter((j) => j._id !== job._id));
      if (selected?._id === job._id) setSelected(null);
      toast.success("Job deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  /* ---------- derived ---------- */
  const visible = useMemo(() => {
    if (!savedOnly) return jobs;
    return jobs.filter((j) => saved.includes(j._id));
  }, [jobs, savedOnly, saved]);

  const hasAnyFilter =
    search || type || location || experienceLevel || savedOnly;

  const clearFilters = () => {
    setSearch("");
    setType("");
    setLocation("");
    setExperienceLevel("");
    setSavedOnly(false);
  };

  const canDelete = (job) =>
    user?.role === "admin" ||
    (job.postedBy?._id && job.postedBy._id === user?._id);

  /* ---------- render ---------- */
  return (
    <div className="pb-10">
      {/* HEADER */}
      <div className="pt-4 pb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-[28px] text-ink tracking-tight">
            Jobs &amp; Internships
          </h1>
          <p className="text-sm text-muted mt-1">
            Opportunities posted and reviewed by the community.
          </p>
        </div>

        {canCreate && (
          <Button variant="primary" iconLeft={Plus} onClick={() => setCreateOpen(true)}>
            Post a job
          </Button>
        )}
      </div>

      {/* SEARCH + FILTER BAR */}
      <div className="card p-3 sm:p-4 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, company, skill…"
              className="input pl-9"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl bg-surface-2 border border-line text-ink text-sm font-semibold hover:bg-surface transition-colors"
          >
            <Filter size={15} />
            Filters
            {hasAnyFilter && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand" aria-hidden />
            )}
          </button>
          <button
            type="button"
            onClick={() => setSavedOnly((s) => !s)}
            className={`inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border text-sm font-semibold transition-colors ${
              savedOnly
                ? "bg-brand text-white border-transparent"
                : "bg-surface-2 border-line text-ink hover:bg-surface"
            }`}
          >
            <Bookmark size={15} />
            Saved
            <span className="text-[11px] opacity-80">({saved.length})</span>
          </button>
          {hasAnyFilter && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 h-10 px-3 rounded-xl text-sm text-muted hover:text-ink"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <SelectInput
              label="Type"
              value={type}
              onChange={setType}
              options={[
                { value: "", label: "Any type" },
                ...TYPES.map((t) => ({ value: t, label: t })),
              ]}
            />
            <TextInput
              label="Location"
              value={location}
              onChange={setLocation}
              placeholder="e.g. Bangalore"
            />
            <SelectInput
              label="Experience"
              value={experienceLevel}
              onChange={setExperienceLevel}
              options={[
                { value: "", label: "Any level" },
                ...EXPERIENCE.map((e) => ({ value: e, label: e })),
              ]}
            />
          </div>
        )}
      </div>

      {/* RESULTS COUNT */}
      {!loading && (
        <div className="text-xs text-muted mb-3">
          {visible.length} {visible.length === 1 ? "opening" : "openings"}
          {savedOnly && " · saved only"}
        </div>
      )}

      {/* GRID */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-11 h-11 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={
            savedOnly
              ? "You haven't saved any jobs yet"
              : hasAnyFilter
              ? "Nothing matches"
              : "No openings yet"
          }
          description={
            savedOnly
              ? "Tap the bookmark icon on any job to save it for later."
              : hasAnyFilter
              ? "Try widening your filters."
              : canCreate
              ? "Be the first to post a role for the community."
              : "Check back soon."
          }
          action={
            hasAnyFilter ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : canCreate && !savedOnly ? (
              <Button variant="primary" iconLeft={Plus} onClick={() => setCreateOpen(true)}>
                Post a job
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visible.map((j) => (
            <JobCard
              key={j._id}
              job={j}
              saved={saved.includes(j._id)}
              canDelete={canDelete(j)}
              onOpen={() => setSelected(j)}
              onSave={() => toggleSave(j)}
              onDelete={() => handleDelete(j)}
            />
          ))}
        </div>
      )}

      {/* DETAILS MODAL */}
      <JobDetailsModal
        job={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        saved={selected ? saved.includes(selected._id) : false}
        onSave={() => selected && toggleSave(selected)}
        canDelete={selected ? canDelete(selected) : false}
        onDelete={() => selected && handleDelete(selected)}
      />

      {/* CREATE MODAL */}
      {canCreate && (
        <CreateJobModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false);
            toast.success("Submitted for admin review");
          }}
        />
      )}
    </div>
  );
};

const TextInput = ({ label, value, onChange, placeholder }) => (
  <label className="block">
    <span className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
      {label}
    </span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input"
    />
  </label>
);

const SelectInput = ({ label, value, onChange, options }) => (
  <label className="block">
    <span className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
      {label}
    </span>
    <select
      className="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </label>
);

export default Jobs;

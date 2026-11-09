import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  BriefcaseBusiness,
  MapPin,
  GraduationCap,
  ShieldCheck,
  Users,
  LayoutGrid,
  Building2,
  BarChart3,
  MessageCircle,
  X,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

import API from "../../services/api";
import { useOnline } from "../../context/OnlineContext";
import { useDebounce } from "../../hooks/useDebounce";

import { Avatar, Badge, Button, EmptyState, Skeleton } from "../../components/ui";
import ConnectionButton from "../../components/ConnectionButton";

/* =====================================================
   SIGNATURE PAGE — ALUMNI NETWORK
   - Three views: Directory / By Company / Insights
   - Real server-side filters (name, year, company, location, domain, skills)
   - No fake geo map; real top-company + year distribution charts
===================================================== */

const VIEWS = [
  { key: "grid", label: "Directory", icon: LayoutGrid },
  { key: "company", label: "By Company", icon: Building2 },
  { key: "insights", label: "Insights", icon: BarChart3 },
];

const Alumni = () => {
  const navigate = useNavigate();
  const { onlineUsers = [] } = useOnline();

  const [view, setView] = useState("grid");

  // Filter state
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [domain, setDomain] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const debouncedCompany = useDebounce(company, 300);
  const debouncedLocation = useDebounce(location, 300);
  const debouncedDomain = useDebounce(domain, 300);

  // Data
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyStats, setCompanyStats] = useState([]);
  const [yearStats, setYearStats] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  /* ---------- fetch directory (filters change) ---------- */
  useEffect(() => {
    const ctrl = new AbortController();

    const run = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch.trim()) params.set("name", debouncedSearch.trim());
        if (year) params.set("year", year);
        if (debouncedCompany.trim()) params.set("company", debouncedCompany.trim());
        if (debouncedLocation.trim()) params.set("location", debouncedLocation.trim());
        if (debouncedDomain.trim()) params.set("domain", debouncedDomain.trim());

        const { data } = await API.get(`/alumni?${params.toString()}`, {
          signal: ctrl.signal,
        });
        setAlumni(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err?.code !== "ERR_CANCELED" && err?.name !== "CanceledError") {
          console.error("Alumni fetch failed:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => ctrl.abort();
  }, [debouncedSearch, year, debouncedCompany, debouncedLocation, debouncedDomain]);

  /* ---------- fetch insights lazily when tab opens ---------- */
  useEffect(() => {
    if (view !== "insights" && view !== "company") return;
    if (companyStats.length > 0 && (view !== "insights" || yearStats.length > 0)) return;

    const run = async () => {
      setInsightsLoading(true);
      try {
        const calls = [API.get("/alumni/stats")];
        if (view === "insights") calls.push(API.get("/alumni/year-stats"));
        const results = await Promise.all(calls);
        setCompanyStats(results[0].data || []);
        if (results[1]) setYearStats(results[1].data || []);
      } catch (err) {
        console.error("Alumni stats failed:", err);
      } finally {
        setInsightsLoading(false);
      }
    };
    run();
  }, [view, companyStats.length, yearStats.length]);

  /* ---------- derived: unique values for dropdowns ---------- */
  const years = useMemo(() => {
    const s = new Set();
    alumni.forEach((u) => u.graduationYear && s.add(u.graduationYear));
    return [...s].sort((a, b) => b - a);
  }, [alumni]);

  const companies = useMemo(() => {
    const s = new Set();
    alumni.forEach((u) => u.company && s.add(u.company.trim()));
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [alumni]);

  const locations = useMemo(() => {
    const s = new Set();
    alumni.forEach((u) => u.location && s.add(u.location.trim()));
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [alumni]);

  const domains = useMemo(() => {
    const s = new Set();
    alumni.forEach((u) => {
      if (u.domain) s.add(u.domain.trim());
      if (u.position) s.add(u.position.trim());
    });
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [alumni]);

  const hasAnyFilter =
    search || year || company || location || domain;

  const clearFilters = () => {
    setSearch("");
    setYear("");
    setCompany("");
    setLocation("");
    setDomain("");
  };

  /* ===================== RENDER ===================== */

  return (
    <div className="pb-10">
      {/* Header */}
      <header className="pt-4 pb-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-[28px] text-ink tracking-tight">
              Alumni Network
            </h1>
            <p className="text-sm text-muted mt-1">
              {loading ? "Loading…" : `${alumni.length} alumni`}
              {hasAnyFilter && !loading && " matching your filters"}
            </p>
          </div>
        </div>

        {/* View tabs */}
        <div className="mt-5 inline-flex p-1 rounded-xl bg-surface-2 border border-line">
          {VIEWS.map((v) => {
            const Icon = v.icon;
            const active = view === v.key;
            return (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={`inline-flex items-center gap-2 px-3 sm:px-4 h-9 rounded-lg text-sm font-semibold transition-colors ${
                  active
                    ? "bg-surface text-ink shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Filter bar (only for grid view) */}
      {view === "grid" && (
        <FilterBar
          search={search}
          setSearch={setSearch}
          year={year}
          setYear={setYear}
          company={company}
          setCompany={setCompany}
          location={location}
          setLocation={setLocation}
          domain={domain}
          setDomain={setDomain}
          years={years}
          companies={companies}
          locations={locations}
          domains={domains}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasAnyFilter={hasAnyFilter}
          clearFilters={clearFilters}
        />
      )}

      {/* Views */}
      {view === "grid" && (
        <GridView
          loading={loading}
          alumni={alumni}
          onlineUsers={onlineUsers}
          onOpen={(u) => navigate(`/profile/${u._id}`)}
          hasAnyFilter={hasAnyFilter}
          clearFilters={clearFilters}
        />
      )}
      {view === "company" && (
        <CompanyView
          loading={insightsLoading}
          companyStats={companyStats}
          onOpen={(c) => navigate(`/alumni/company/${c._id}`)}
        />
      )}
      {view === "insights" && (
        <InsightsView
          loading={insightsLoading}
          companyStats={companyStats}
          yearStats={yearStats}
        />
      )}
    </div>
  );
};

/* ==================== FILTER BAR ==================== */
const FilterBar = ({
  search,
  setSearch,
  year,
  setYear,
  company,
  setCompany,
  location,
  setLocation,
  domain,
  setDomain,
  years,
  companies,
  locations,
  domains,
  showFilters,
  setShowFilters,
  hasAnyFilter,
  clearFilters,
}) => (
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
          placeholder="Search alumni by name…"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <SelectInput
          label="Graduation year"
          value={year}
          onChange={setYear}
          options={[
            { value: "", label: "Any year" },
            ...years.map((y) => ({ value: String(y), label: String(y) })),
          ]}
        />
        <SelectInput
          label="Company"
          value={company}
          onChange={setCompany}
          options={[
            { value: "", label: "Any company" },
            ...companies.map((c) => ({ value: c, label: c })),
          ]}
        />
        <SelectInput
          label="Location"
          value={location}
          onChange={setLocation}
          options={[
            { value: "", label: "Any location" },
            ...locations.map((l) => ({ value: l, label: l })),
          ]}
        />
        <SelectInput
          label="Domain / role"
          value={domain}
          onChange={setDomain}
          options={[
            { value: "", label: "Any role" },
            ...domains.map((d) => ({ value: d, label: d })),
          ]}
        />
      </div>
    )}
  </div>
);

const SelectInput = ({ label, value, onChange, options }) => (
  <label className="block">
    <span className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
      {label}
    </span>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input appearance-none pr-10 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  </label>
);

/* ==================== GRID VIEW ==================== */
const GridView = ({
  loading,
  alumni,
  onlineUsers,
  onOpen,
  hasAnyFilter,
  clearFilters,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton circle className="w-12 h-12" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (alumni.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No alumni found"
        description={
          hasAnyFilter
            ? "Try widening your filters — different year, company, or location."
            : "No alumni accounts have been approved yet."
        }
        action={
          hasAnyFilter ? (
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {alumni.map((u) => (
        <AlumniCard
          key={u._id}
          user={u}
          online={onlineUsers.includes(u._id)}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
};

const AlumniCard = ({ user: u, online, onOpen }) => (
  <div className="card p-5 flex flex-col gap-4 hover:border-brand/40 transition-colors">
    <div className="flex items-start gap-3">
      <div
        className="relative cursor-pointer shrink-0"
        onClick={() => onOpen(u)}
      >
        <Avatar user={u} size={48} />
        {online && (
          <span
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success ring-2 ring-surface"
            aria-label="online"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div
          className="flex items-center gap-1.5 cursor-pointer"
          onClick={() => onOpen(u)}
        >
          <h3 className="font-semibold text-ink truncate">{u.name}</h3>
          {(u.verifiedBadge || u.isVerified) && (
            <ShieldCheck
              size={14}
              className="text-verified shrink-0"
              aria-label="Verified"
            />
          )}
        </div>
        <p className="text-xs text-muted mt-0.5">
          {u.position || u.designation || "Alumni"}
        </p>
      </div>
    </div>

    <div className="space-y-1.5 text-sm">
      {u.company && (
        <div className="flex items-center gap-2 text-ink">
          <BriefcaseBusiness size={14} className="text-muted shrink-0" />
          <span className="truncate">{u.company}</span>
        </div>
      )}
      {u.graduationYear && (
        <div className="flex items-center gap-2 text-ink">
          <GraduationCap size={14} className="text-muted shrink-0" />
          <span>Batch of {u.graduationYear}</span>
        </div>
      )}
      {u.location && (
        <div className="flex items-center gap-2 text-ink">
          <MapPin size={14} className="text-muted shrink-0" />
          <span className="truncate">{u.location}</span>
        </div>
      )}
    </div>

    {Array.isArray(u.skills) && u.skills.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
        {u.skills.slice(0, 3).map((s) => (
          <Badge key={s} variant="neutral">
            {s}
          </Badge>
        ))}
        {u.skills.length > 3 && (
          <Badge variant="neutral">+{u.skills.length - 3}</Badge>
        )}
      </div>
    )}

    <div className="flex gap-2 mt-auto pt-1">
      <div className="flex-1">
        <ConnectionButton userId={u._id} />
      </div>
      <button
        className="icon-btn border border-line"
        aria-label="Message"
        title="Message"
        onClick={() => (window.location.href = `/chat`)}
      >
        <MessageCircle size={16} />
      </button>
    </div>
  </div>
);

/* ==================== BY-COMPANY VIEW ==================== */
const CompanyView = ({ loading, companyStats, onOpen }) => {
  if (loading && companyStats.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (!companyStats.length) {
    return (
      <EmptyState
        icon={Building2}
        title="No company data yet"
        description="Alumni need to add their current company to their profile for this view to populate."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {companyStats.map((c) => (
        <button
          key={c._id}
          onClick={() => onOpen(c)}
          className="card p-5 text-left hover:border-brand/40 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-ink truncate capitalize">
                {c.label || c._id}
              </h3>
              <p className="text-xs text-muted mt-0.5">
                {c.count} {c.count === 1 ? "alumnus" : "alumni"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-soft flex items-center justify-center shrink-0">
              <Building2 size={20} className="text-brand" />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

/* ==================== INSIGHTS VIEW ==================== */
const BAR_COLORS = [
  "var(--brand)",
  "var(--brand-2)",
  "#F472B6",
  "#F59E0B",
  "#10B981",
  "#6366F1",
  "#EC4899",
  "#06B6D4",
  "#F97316",
  "#8B5CF6",
];

const InsightsView = ({ loading, companyStats, yearStats }) => {
  if (loading && companyStats.length === 0 && yearStats.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (!companyStats.length && !yearStats.length) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Not enough data yet"
        description="Charts will populate once alumni add their company and graduation year."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="card p-5">
        <h3 className="font-semibold text-ink mb-1">Top companies</h3>
        <p className="text-xs text-muted mb-4">
          Number of approved alumni per company (top 10).
        </p>
        {companyStats.length === 0 ? (
          <p className="text-sm text-muted">No company data yet.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={companyStats.map((s) => ({
                  name: s.label || s._id,
                  count: s.count,
                }))}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
              >
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--line)" }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "var(--ink)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--line)" }}
                  tickLine={false}
                  width={120}
                />
                <Tooltip
                  cursor={{ fill: "var(--surface-2)" }}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--line)",
                    borderRadius: 10,
                    fontSize: 12,
                    color: "var(--ink)",
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {companyStats.map((_, i) => (
                    <Cell
                      key={i}
                      fill={BAR_COLORS[i % BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-ink mb-1">
          Graduation year distribution
        </h3>
        <p className="text-xs text-muted mb-4">
          Approved alumni by graduation year.
        </p>
        {yearStats.length === 0 ? (
          <p className="text-sm text-muted">No year data yet.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={yearStats}
                margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
              >
                <XAxis
                  dataKey="year"
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--line)" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--line)" }}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--surface-2)" }}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--line)",
                    borderRadius: 10,
                    fontSize: 12,
                    color: "var(--ink)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--brand)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alumni;

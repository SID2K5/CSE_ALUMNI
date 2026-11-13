import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import {
  Users,
  FileText,
  CalendarDays,
  Briefcase,
  ShieldAlert,
  GraduationCap,
  UserCheck,
  Check,
  X,
  Trash2,
  BarChart3,
  Clock,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import API from "../../services/api";
import ReportBuilder from "../../components/admin/ReportBuilder";

import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Skeleton,
} from "../../components/ui";

/* =====================================================
   ADMIN DASHBOARD — /admin
   Every number and chart below comes from a live endpoint.
   Nothing is estimated or hard-coded.

   GET  /admin/stats            counts
   GET  /admin/pending-users    approval queue
   PUT  /admin/approve/:id      { role } → approve (+ assign role)
   DEL  /admin/reject/:id       reject
   GET  /admin/pending-events   event queue
   PUT  /admin/approve-event/:id
   DEL  /admin/reject-event/:id
   GET  /jobs/pending           job queue
   PUT  /jobs/approve/:id  |  PUT /jobs/reject/:id
   GET  /admin/reported-posts   moderation
   PUT  /admin/ignore-report/:id
   DEL  /admin/post/:id
   GET  /alumni/stats           top companies
   GET  /alumni/year-stats      graduation-year distribution
   GET  /admin/report/meta      export datasets + filters
   GET  /admin/report           filtered/sorted CSV (or JSON preview)
===================================================== */

const TABS = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "users", label: "Registrations", icon: UserCheck },
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "reports", label: "Reports", icon: ShieldAlert },
  { key: "export", label: "Export", icon: FileSpreadsheet },
];

const ROLES = ["student", "alumni", "teacher"];

const AdminDashboard = () => {

  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await API.get("/admin/stats");
      setStats(data);
    } catch (err) {
      console.error(err);
      toast.error("Could not load dashboard stats");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const cards = [
    { label: "Total users", value: stats?.users, icon: Users, to: null },
    {
      label: "Pending approvals",
      value: stats?.pendingUsers,
      icon: UserCheck,
      highlight: (stats?.pendingUsers || 0) > 0,
      onClick: () => setTab("users"),
    },
    { label: "Posts", value: stats?.posts, icon: FileText },
    {
      label: "Events",
      value: stats?.events,
      icon: CalendarDays,
      sub:
        stats?.pendingEvents > 0 ? `${stats.pendingEvents} pending` : undefined,
      onClick: stats?.pendingEvents ? () => setTab("events") : undefined,
    },
    {
      label: "Jobs",
      value: stats?.jobs,
      icon: Briefcase,
      sub: stats?.pendingJobs > 0 ? `${stats.pendingJobs} pending` : undefined,
      onClick: stats?.pendingJobs ? () => setTab("jobs") : undefined,
    },
    {
      label: "Reported posts",
      value: stats?.reportedPosts,
      icon: ShieldAlert,
      highlight: (stats?.reportedPosts || 0) > 0,
      onClick: () => setTab("reports"),
    },
  ];

  return (
    <div className="pb-10">
      {/* HEADER */}
      <div className="pt-4 pb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-[28px] text-ink tracking-tight">
            Admin
          </h1>
          <p className="text-sm text-muted mt-1">
            Approvals, moderation and community analytics.
          </p>
        </div>
        <Button variant="secondary" iconLeft={RefreshCw} onClick={fetchStats}>
          Refresh
        </Button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} loading={statsLoading} />
        ))}
      </div>

      {/* TABS */}
      <div className="inline-flex p-1 rounded-xl bg-surface-2 border border-line mb-5 flex-wrap">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          const badge =
            t.key === "users"
              ? stats?.pendingUsers
              : t.key === "events"
              ? stats?.pendingEvents
              : t.key === "jobs"
              ? stats?.pendingJobs
              : t.key === "reports"
              ? stats?.reportedPosts
              : 0;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 h-9 px-3 sm:px-4 rounded-lg text-sm font-semibold transition-colors ${
                active
                  ? "bg-surface text-ink shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{t.label}</span>
              {badge > 0 && (
                <span className="min-w-[17px] h-[17px] px-1 rounded-full bg-brand text-brand-ink text-[10px] font-bold flex items-center justify-center">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* PANELS */}
      {tab === "overview" && <OverviewPanel stats={stats} />}
      {tab === "users" && <UsersPanel onChanged={fetchStats} />}
      {tab === "events" && <EventsPanel onChanged={fetchStats} />}
      {tab === "jobs" && <JobsPanel onChanged={fetchStats} />}
      {tab === "reports" && (
        <ReportsPanel onChanged={fetchStats} />
      )}
      {tab === "export" && <ReportBuilder />}
    </div>
  );
};

/* ==================== STAT CARD ==================== */
const StatCard = ({ label, value, icon: Icon, sub, highlight, onClick, loading }) => {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`card px-4 py-3.5 text-left transition-all ${
        onClick ? "hover:border-brand/40 hover:shadow-md cursor-pointer" : ""
      } ${highlight ? "border-brand/40" : ""}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            highlight ? "bg-brand-soft" : "bg-surface-2"
          }`}
        >
          <Icon size={15} className={highlight ? "text-brand" : "text-muted"} />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-7 w-12" />
      ) : (
        <div className="text-2xl font-bold text-ink leading-none">
          {value ?? "—"}
        </div>
      )}
      <div className="text-xs text-muted mt-1.5">{label}</div>
      {sub && <div className="text-[11px] text-brand font-semibold mt-0.5">{sub}</div>}
    </Tag>
  );
};

/* ==================== OVERVIEW ==================== */
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

const chartTooltip = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 10,
  fontSize: 12,
  color: "var(--ink)",
};

const OverviewPanel = ({ stats }) => {
  const [companies, setCompanies] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const [c, y] = await Promise.all([
          API.get("/alumni/stats"),
          API.get("/alumni/year-stats"),
        ]);
        setCompanies(c.data || []);
        setYears(y.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const composition = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Students", count: stats.students || 0 },
      { name: "Alumni", count: stats.alumni || 0 },
      { name: "Teachers", count: stats.teachers || 0 },
    ].filter((d) => d.count > 0);
  }, [stats]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  const nothing =
    companies.length === 0 && years.length === 0 && composition.length === 0;

  if (nothing) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Not enough data for analytics yet"
        description="Charts appear once members add their company and graduation year."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {composition.length > 0 && (
        <ChartCard
          title="Community composition"
          subtitle="Approved accounts by role."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={composition} margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
              <XAxis
                dataKey="name"
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
              <Tooltip cursor={{ fill: "var(--surface-2)" }} contentStyle={chartTooltip} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {composition.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {companies.length > 0 && (
        <ChartCard title="Top companies" subtitle="Where alumni work (top 10).">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={companies.map((s) => ({ name: s.label || s._id, count: s.count }))}
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
                width={110}
                tick={{ fill: "var(--ink)", fontSize: 11 }}
                axisLine={{ stroke: "var(--line)" }}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: "var(--surface-2)" }} contentStyle={chartTooltip} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {companies.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {years.length > 0 && (
        <ChartCard
          title="Graduation years"
          subtitle="Alumni by graduating batch."
          wide={companies.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={years} margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
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
              <Tooltip cursor={{ fill: "var(--surface-2)" }} contentStyle={chartTooltip} />
              <Bar dataKey="count" fill="var(--brand)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
};

const ChartCard = ({ title, subtitle, children, wide }) => (
  <div className={`card p-5 ${wide ? "lg:col-span-2" : ""}`}>
    <h3 className="font-semibold text-ink">{title}</h3>
    {subtitle && <p className="text-xs text-muted mt-0.5 mb-4">{subtitle}</p>}
    <div className="h-60">{children}</div>
  </div>
);

/* ==================== USERS (REGISTRATIONS) ==================== */
export const UsersPanel = ({ onChanged }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [roleFor, setRoleFor] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/admin/pending-users");
      const list = Array.isArray(data) ? data : [];
      setRows(list);
      setRoleFor(
        Object.fromEntries(list.map((u) => [u._id, u.role || "student"]))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (u) => {
    const role = roleFor[u._id] || u.role || "student";
    if (!confirm(`Approve ${u.name} as "${role}"?`)) return;
    setBusyId(u._id);
    try {
      await API.put(`/admin/approve/${u._id}`, { role });
      setRows((p) => p.filter((x) => x._id !== u._id));
      toast.success(`${u.name} approved as ${role}`);
      onChanged?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Approve failed");
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (u) => {
    if (
      !confirm(
        `Reject and permanently delete ${u.name}'s registration? This cannot be undone.`
      )
    )
      return;
    setBusyId(u._id);
    try {
      await API.delete(`/admin/reject/${u._id}`);
      setRows((p) => p.filter((x) => x._id !== u._id));
      toast.success("Registration rejected");
      onChanged?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Reject failed");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <TableSkeleton />;

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={UserCheck}
        title="No pending registrations"
        description="New sign-ups awaiting approval will appear here."
      />
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-2 border-b border-line text-left">
              <Th>Applicant</Th>
              <Th className="hidden md:table-cell">Department</Th>
              <Th className="hidden lg:table-cell">Roll no.</Th>
              <Th className="hidden lg:table-cell">Applied</Th>
              <Th>Assign role</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr
                key={u._id}
                className="border-b border-line last:border-0 hover:bg-surface-2/50"
              >
                <Td>
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar user={u} size={34} />
                    <div className="min-w-0">
                      <div className="font-medium text-ink truncate">{u.name}</div>
                      <div className="text-xs text-muted truncate">{u.email}</div>
                    </div>
                  </div>
                </Td>
                <Td className="hidden md:table-cell text-muted">
                  {u.department || "—"}
                </Td>
                <Td className="hidden lg:table-cell text-muted">
                  {u.rollNumber || "—"}
                </Td>
                <Td className="hidden lg:table-cell text-muted">
                  {u.createdAt ? dayjs(u.createdAt).format("MMM D, YYYY") : "—"}
                </Td>
                <Td>
                  <select
                    value={roleFor[u._id] || "student"}
                    onChange={(e) =>
                      setRoleFor((p) => ({ ...p, [u._id]: e.target.value }))
                    }
                    className="input !h-9 !py-0 text-sm w-[120px]"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5 justify-end">
                    <Button
                      size="sm"
                      variant="primary"
                      iconLeft={Check}
                      loading={busyId === u._id}
                      onClick={() => approve(u)}
                    >
                      Approve
                    </Button>
                    <button
                      onClick={() => reject(u)}
                      disabled={busyId === u._id}
                      className="icon-btn !w-8 !h-8 border border-line text-danger hover:text-danger"
                      aria-label="Reject"
                      title="Reject"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ==================== EVENTS ==================== */
export const EventsPanel = ({ onChanged }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/admin/pending-events");
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (ev, approveIt) => {
    const verb = approveIt ? "Approve" : "Reject and delete";
    if (!confirm(`${verb} "${ev.title}"?`)) return;
    setBusyId(ev._id);
    try {
      if (approveIt) await API.put(`/admin/approve-event/${ev._id}`);
      else await API.delete(`/admin/reject-event/${ev._id}`);
      setRows((p) => p.filter((x) => x._id !== ev._id));
      toast.success(approveIt ? "Event approved" : "Event rejected");
      onChanged?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <TableSkeleton />;

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No events awaiting approval"
        description="Submitted events that need review will appear here."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((ev) => (
        <li key={ev._id} className="card p-4 flex items-start gap-4">
          <div className="w-24 h-16 rounded-lg bg-surface-2 overflow-hidden shrink-0">
            {ev.poster ? (
              <img src={ev.poster} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <CalendarDays size={18} className="text-muted" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-ink truncate">{ev.title}</h3>
            <p className="text-sm text-muted line-clamp-2 mt-0.5">
              {ev.description}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted mt-2 flex-wrap">
              {ev.startDate && (
                <span className="inline-flex items-center gap-1">
                  <Clock size={11} />
                  {dayjs(ev.startDate).format("MMM D, YYYY h:mm A")}
                </span>
              )}
              {ev.location && <span>· {ev.location}</span>}
              {ev.createdBy?.name && <span>· by {ev.createdBy.name}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="primary"
              iconLeft={Check}
              loading={busyId === ev._id}
              onClick={() => act(ev, true)}
            >
              Approve
            </Button>
            <button
              onClick={() => act(ev, false)}
              disabled={busyId === ev._id}
              className="icon-btn !w-8 !h-8 border border-line text-danger hover:text-danger"
              aria-label="Reject"
              title="Reject"
            >
              <X size={15} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

/* ==================== JOBS ==================== */
export const JobsPanel = ({ onChanged }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/jobs/pending");
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (job, approveIt) => {
    if (!confirm(`${approveIt ? "Approve" : "Reject"} "${job.title}"?`)) return;
    setBusyId(job._id);
    try {
      await API.put(`/jobs/${approveIt ? "approve" : "reject"}/${job._id}`);
      setRows((p) => p.filter((x) => x._id !== job._id));
      toast.success(approveIt ? "Job approved" : "Job rejected");
      onChanged?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <TableSkeleton />;

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No jobs awaiting approval"
        description="Submitted roles that need review will appear here."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((job) => (
        <li key={job._id} className="card p-4 flex items-start gap-4">
          <div className="w-11 h-11 rounded-lg bg-brand-soft flex items-center justify-center shrink-0">
            <Briefcase size={18} className="text-brand" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-ink truncate">{job.title}</h3>
              {job.type && <Badge variant="info">{job.type}</Badge>}
            </div>
            <p className="text-sm text-muted truncate mt-0.5">
              {job.company}
              {job.location ? ` · ${job.location}` : ""}
            </p>
            {job.postedBy?.name && (
              <p className="text-xs text-muted mt-1">
                Submitted by {job.postedBy.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="primary"
              iconLeft={Check}
              loading={busyId === job._id}
              onClick={() => act(job, true)}
            >
              Approve
            </Button>
            <button
              onClick={() => act(job, false)}
              disabled={busyId === job._id}
              className="icon-btn !w-8 !h-8 border border-line text-danger hover:text-danger"
              aria-label="Reject"
              title="Reject"
            >
              <X size={15} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

/* ==================== REPORTS ==================== */
export const ReportsPanel = ({ onChanged }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/admin/reported-posts");
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const ignore = async (post) => {
    setBusyId(post._id);
    try {
      await API.put(`/admin/ignore-report/${post._id}`);
      setRows((p) => p.filter((x) => x._id !== post._id));
      toast.success("Reports dismissed");
      onChanged?.();
    } catch (err) {
      toast.error("Could not dismiss reports");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (post) => {
    if (!confirm("Delete this post permanently? This cannot be undone.")) return;
    setBusyId(post._id);
    try {
      await API.delete(`/admin/post/${post._id}`);
      setRows((p) => p.filter((x) => x._id !== post._id));
      toast.success("Post deleted");
      onChanged?.();
    } catch (err) {
      toast.error("Could not delete post");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <TableSkeleton />;

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Nothing reported"
        description="Posts flagged by the community will appear here for review."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((p) => (
        <li key={p._id} className="card p-4">
          <div className="flex items-start gap-3">
            <Avatar user={p.user} size={38} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-ink truncate">
                  {p.user?.name || "Unknown"}
                </span>
                <Badge variant="danger">
                  {(p.reports || []).length} report
                  {(p.reports || []).length === 1 ? "" : "s"}
                </Badge>
              </div>
              <p className="text-sm text-ink mt-1.5 line-clamp-3 whitespace-pre-wrap">
                {p.content}
              </p>
              {p.createdAt && (
                <span className="text-xs text-muted">
                  {dayjs(p.createdAt).format("MMM D, YYYY h:mm A")}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end mt-3 pt-3 border-t border-line">
            <Button
              size="sm"
              variant="secondary"
              loading={busyId === p._id}
              onClick={() => ignore(p)}
            >
              Dismiss reports
            </Button>
            <Button
              size="sm"
              variant="danger"
              iconLeft={Trash2}
              loading={busyId === p._id}
              onClick={() => remove(p)}
            >
              Delete post
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
};

/* ==================== shared bits ==================== */
const Th = ({ children, className = "" }) => (
  <th
    className={`px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide ${className}`}
  >
    {children}
  </th>
);

const Td = ({ children, className = "" }) => (
  <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>
);

const TableSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton key={i} className="h-16" />
    ))}
  </div>
);

export default AdminDashboard;

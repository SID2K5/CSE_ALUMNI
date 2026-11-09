import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Users,
  Building2,
  MapPin,
  GraduationCap,
  MessageCircle,
  UserMinus,
  UserCheck,
  Filter,
  X,
  Search,
} from "lucide-react";

import API from "../../services/api";

import { Avatar, Badge, Button, EmptyState, Skeleton } from "../../components/ui";

/* =====================================================
   CONNECTIONS — Your Network
   Shows accepted connections + pending requests.
   Filter by company, location, graduation year.
===================================================== */

const Connections = () => {
  const navigate = useNavigate();

  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const [connRes, reqRes] = await Promise.all([
        API.get("/connections"),
        API.get("/connections/pending"),
      ]);
      setConnections(Array.isArray(connRes.data) ? connRes.data : []);
      setRequests(Array.isArray(reqRes.data) ? reqRes.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load connections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const respondRequest = async (id, status) => {
    try {
      await API.put(`/connections/respond/${id}`, { status });
      fetchConnections();
      toast.success(status === "accepted" ? "Connection accepted" : "Request declined");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not respond");
    }
  };

  const removeConnection = async (id) => {
    if (!confirm("Remove this connection?")) return;
    try {
      await API.delete(`/connections/remove/${id}`);
      setConnections((prev) => prev.filter((u) => u._id !== id));
      toast.success("Connection removed");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not remove");
    }
  };

  const openChat = async (userId) => {
    try {
      const { data } = await API.get(`/chat/conversation/${userId}`);
      navigate(`/chat/${data._id}`);
    } catch {
      navigate("/chat");
    }
  };

  /* ---------- derived ---------- */
  const companies = useMemo(() => {
    const s = new Set();
    connections.forEach((u) => u.company && s.add(u.company.trim()));
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [connections]);

  const locations = useMemo(() => {
    const s = new Set();
    connections.forEach((u) => u.location && s.add(u.location.trim()));
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [connections]);

  const visible = useMemo(() => {
    let list = connections;
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((u) => u.name?.toLowerCase().includes(q));
    if (companyFilter) list = list.filter((u) => u.company === companyFilter);
    if (locationFilter) list = list.filter((u) => u.location === locationFilter);
    return list;
  }, [connections, search, companyFilter, locationFilter]);

  const hasFilter = search || companyFilter || locationFilter;

  const clearFilters = () => {
    setSearch("");
    setCompanyFilter("");
    setLocationFilter("");
  };

  /* ---------- render ---------- */
  return (
    <div className="pb-10">
      {/* HEADER */}
      <div className="pt-4 pb-5">
        <h1 className="font-display font-extrabold text-2xl sm:text-[28px] text-ink tracking-tight">
          Connections
        </h1>
        <p className="text-sm text-muted mt-1">
          {loading ? "Loading…" : `${connections.length} connections`}
        </p>
      </div>

      {/* PENDING REQUESTS */}
      {requests.length > 0 && (
        <div className="card p-4 sm:p-5 mb-5">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
            Pending requests · {requests.length}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {requests.map((r) => (
              <div
                key={r._id}
                className="flex items-center gap-3 p-3 rounded-xl border border-line bg-surface-2"
              >
                <Avatar user={r.sender} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink truncate text-sm">
                    {r.sender?.name}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {r.sender?.company || r.sender?.role || ""}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => respondRequest(r._id, "accepted")}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => respondRequest(r._id, "rejected")}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH + FILTERS */}
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
              placeholder="Search connections…"
              className="input pl-9"
            />
          </div>
          {(companies.length > 0 || locations.length > 0) && (
            <button
              type="button"
              onClick={() => setShowFilters((s) => !s)}
              className="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl bg-surface-2 border border-line text-ink text-sm font-semibold hover:bg-surface transition-colors"
            >
              <Filter size={15} />
              Filters
              {hasFilter && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand" aria-hidden />
              )}
            </button>
          )}
          {hasFilter && (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {companies.length > 0 && (
              <label className="block">
                <span className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
                  Company
                </span>
                <select
                  className="input cursor-pointer"
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                >
                  <option value="">Any company</option>
                  {companies.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            )}
            {locations.length > 0 && (
              <label className="block">
                <span className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
                  Location
                </span>
                <select
                  className="input cursor-pointer"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="">Any location</option>
                  {locations.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}
      </div>

      {/* RESULTS COUNT */}
      {!loading && (
        <div className="text-xs text-muted mb-3">
          {visible.length} {visible.length === 1 ? "connection" : "connections"}
          {hasFilter && " matching"}
        </div>
      )}

      {/* GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton circle className="w-14 h-14" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Users}
          title={hasFilter ? "No matches" : "No connections yet"}
          description={
            hasFilter
              ? "Try widening your filters."
              : "Connect with alumni and classmates to grow your network."
          }
          action={
            hasFilter ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((u) => (
            <article
              key={u._id}
              onClick={() => navigate(`/profile/${u._id}`)}
              className="card p-5 cursor-pointer hover:border-brand/40 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <Avatar user={u} size={52} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-ink truncate">{u.name}</h3>
                    {u.isVerified && (
                      <UserCheck size={14} className="text-verified shrink-0" />
                    )}
                  </div>
                  {u.role && (
                    <Badge variant="neutral" className="mt-1">
                      {u.role}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-sm text-muted mb-4">
                {u.company && (
                  <div className="flex items-center gap-2">
                    <Building2 size={13} className="shrink-0" />
                    <span className="truncate">{u.company}</span>
                  </div>
                )}
                {u.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="shrink-0" />
                    <span className="truncate">{u.location}</span>
                  </div>
                )}
                {u.graduationYear && (
                  <div className="flex items-center gap-2">
                    <GraduationCap size={13} className="shrink-0" />
                    <span>Batch of {u.graduationYear}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  iconLeft={MessageCircle}
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    openChat(u._id);
                  }}
                >
                  Message
                </Button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeConnection(u._id);
                  }}
                  className="icon-btn !w-9 !h-9 border border-line text-danger hover:text-danger shrink-0"
                  aria-label="Remove connection"
                  title="Remove"
                >
                  <UserMinus size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Connections;

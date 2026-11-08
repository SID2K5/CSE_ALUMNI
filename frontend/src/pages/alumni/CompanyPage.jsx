import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Users,
  MapPin,
  GraduationCap,
  ShieldCheck,
  BriefcaseBusiness,
  MessageCircle,
} from "lucide-react";

import API from "../../services/api";
import { useOnline } from "../../context/OnlineContext";

import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Skeleton,
} from "../../components/ui";
import ConnectionButton from "../../components/ConnectionButton";

const CompanyPage = () => {
  const { company } = useParams();
  const navigate = useNavigate();
  const { onlineUsers = [] } = useOnline();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await API.get(
          `/alumni/company/${encodeURIComponent(company)}`
        );
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Could not load alumni for this company.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [company]);

  const stats = useMemo(() => {
    const locations = new Set();
    const batches = new Set();
    let verified = 0;
    users.forEach((u) => {
      if (u.location) locations.add(u.location.trim());
      if (u.graduationYear) batches.add(u.graduationYear);
      if (u.verifiedBadge || u.isVerified) verified++;
    });
    return {
      total: users.length,
      locations: locations.size,
      batches: batches.size,
      verified,
    };
  }, [users]);

  const displayName = decodeURIComponent(company || "").replace(/-/g, " ");

  return (
    <div className="pb-10">
      {/* Back + title */}
      <div className="pt-4 pb-5">
        <button
          onClick={() => navigate("/alumni")}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-3"
        >
          <ArrowLeft size={14} />
          Alumni network
        </button>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-brand-soft flex items-center justify-center shrink-0">
            <Building2 size={26} className="text-brand" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display font-extrabold text-2xl sm:text-[28px] text-ink capitalize tracking-tight">
              {displayName}
            </h1>
            <p className="text-sm text-muted mt-1">
              {loading
                ? "Loading…"
                : `${stats.total} ${
                    stats.total === 1 ? "alumnus" : "alumni"
                  } from your network`}
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      {!loading && users.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatTile label="Total" value={stats.total} icon={Users} />
          <StatTile label="Locations" value={stats.locations} icon={MapPin} />
          <StatTile label="Batches" value={stats.batches} icon={GraduationCap} />
          <StatTile
            label="Verified"
            value={stats.verified}
            icon={ShieldCheck}
          />
        </div>
      )}

      {/* Body */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton circle className="w-12 h-12" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={Building2}
          title="Something went wrong"
          description={error}
        />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No alumni listed here yet"
          description="Nobody has recorded this as their current company."
          action={
            <Button variant="secondary" onClick={() => navigate("/alumni")}>
              Browse all alumni
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map((u) => (
            <CompanyAlumniCard
              key={u._id}
              user={u}
              online={onlineUsers.includes(u._id)}
              onOpen={() => navigate(`/profile/${u._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const StatTile = ({ label, value, icon: Icon }) => (
  <div className="card px-4 py-3 flex items-center gap-3">
    <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
      <Icon size={16} className="text-muted" />
    </div>
    <div>
      <div className="text-lg font-semibold text-ink leading-tight">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  </div>
);

const CompanyAlumniCard = ({ user: u, online, onOpen }) => (
  <div className="card p-5 flex flex-col gap-4">
    <div className="flex items-start gap-3">
      <div className="relative cursor-pointer shrink-0" onClick={onOpen}>
        <Avatar user={u} size={48} />
        {online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-surface" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div
          className="flex items-center gap-1.5 cursor-pointer"
          onClick={onOpen}
        >
          <h3 className="font-semibold text-ink truncate">{u.name}</h3>
          {(u.verifiedBadge || u.isVerified) && (
            <ShieldCheck size={14} className="text-brand shrink-0" />
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

export default CompanyPage;

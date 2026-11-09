import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Search,
  GraduationCap,
  Plus,
  Trash2,
  ShieldCheck,
  BookOpen,
  Filter,
  X,
} from "lucide-react";

import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useDebounce } from "../../hooks/useDebounce";

import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Modal,
  Skeleton,
} from "../../components/ui";

/* =====================================================
   FACULTY DIRECTORY
   Search spans name / department / specialization / designation.
   Admin can add and remove teacher accounts.
===================================================== */

const Teachers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const [addOpen, setAddOpen] = useState(false);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (department) params.set("department", department);
      const { data } = await API.get(`/teachers?${params.toString()}`);
      setTeachers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load faculty");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, department]);

  const departments = useMemo(() => {
    const s = new Set();
    teachers.forEach((t) => t.department && s.add(t.department));
    return [...s].sort();
  }, [teachers]);

  const handleDelete = async (t) => {
    if (!confirm(`Remove ${t.name} from the faculty directory?`)) return;
    try {
      await API.delete(`/admin/teacher/${t._id}`);
      setTeachers((prev) => prev.filter((x) => x._id !== t._id));
      toast.success("Teacher removed");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not remove teacher");
    }
  };

  const hasFilter = search || department;

  return (
    <div className="pb-10">
      {/* HEADER */}
      <div className="pt-4 pb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-[28px] text-ink tracking-tight">
            Faculty
          </h1>
          <p className="text-sm text-muted mt-1">
            {loading ? "Loading…" : `${teachers.length} teaching staff`}
          </p>
        </div>

        {isAdmin && (
          <Button variant="primary" iconLeft={Plus} onClick={() => setAddOpen(true)}>
            Add teacher
          </Button>
        )}
      </div>

      {/* SEARCH */}
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
              placeholder="Search by name, department or specialization…"
              className="input pl-9"
            />
          </div>
          {departments.length > 0 && (
            <button
              type="button"
              onClick={() => setShowFilters((s) => !s)}
              className="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl bg-surface-2 border border-line text-ink text-sm font-semibold hover:bg-surface transition-colors"
            >
              <Filter size={15} />
              Department
              {department && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand" aria-hidden />
              )}
            </button>
          )}
          {hasFilter && (
            <button
              onClick={() => {
                setSearch("");
                setDepartment("");
              }}
              className="inline-flex items-center gap-1 h-10 px-3 rounded-xl text-sm text-muted hover:text-ink"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        {showFilters && departments.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-4">
            <button
              onClick={() => setDepartment("")}
              className={`h-8 px-3 rounded-full text-xs font-semibold transition-colors ${
                !department
                  ? "bg-brand text-brand-ink"
                  : "bg-surface-2 text-ink border border-line hover:bg-surface"
              }`}
            >
              All
            </button>
            {departments.map((d) => (
              <button
                key={d}
                onClick={() => setDepartment(d)}
                className={`h-8 px-3 rounded-full text-xs font-semibold transition-colors ${
                  department === d
                    ? "bg-brand text-brand-ink"
                    : "bg-surface-2 text-ink border border-line hover:bg-surface"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

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
      ) : teachers.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No faculty found"
          description={
            hasFilter
              ? "Try a different search or department."
              : "No teacher accounts have been added yet."
          }
          action={
            hasFilter ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setDepartment("");
                }}
              >
                Clear filters
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {teachers.map((t) => (
            <TeacherCard
              key={t._id}
              teacher={t}
              isAdmin={isAdmin}
              onOpen={() => navigate(`/teachers/${t._id}`)}
              onDelete={() => handleDelete(t)}
            />
          ))}
        </div>
      )}

      {/* ADD TEACHER MODAL */}
      {isAdmin && (
        <AddTeacherModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onCreated={() => {
            setAddOpen(false);
            fetchTeachers();
            toast.success("Teacher account created");
          }}
        />
      )}
    </div>
  );
};

/* ==================== CARD ==================== */
const TeacherCard = ({ teacher: t, isAdmin, onOpen, onDelete }) => (
  <article
    onClick={onOpen}
    className="card p-5 cursor-pointer hover:border-brand/40 hover:shadow-md transition-all flex flex-col gap-3"
  >
    <div className="flex items-start gap-3">
      <Avatar user={t} size={56} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-ink truncate">{t.name}</h3>
          {t.teacherVerified && (
            <ShieldCheck size={14} className="text-brand shrink-0" />
          )}
        </div>
        {t.designation && (
          <p className="text-sm text-muted truncate mt-0.5">{t.designation}</p>
        )}
      </div>
      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="icon-btn !w-8 !h-8 border border-line text-red-500 hover:text-red-600 shrink-0"
          aria-label="Remove"
          title="Remove"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>

    <div className="flex flex-wrap gap-1.5">
      {t.department && <Badge variant="info">{t.department}</Badge>}
      {t.specialization && <Badge variant="neutral">{t.specialization}</Badge>}
    </div>

    {t.experience && (
      <p className="text-xs text-muted flex items-center gap-1.5">
        <BookOpen size={12} />
        {t.experience}
      </p>
    )}
  </article>
);

/* ==================== ADD TEACHER ==================== */
const emptyTeacher = {
  name: "",
  email: "",
  password: "",
  designation: "",
  specialization: "",
  experience: "",
  department: "",
};

const AddTeacherModal = ({ open, onClose, onCreated }) => {
  const [form, setForm] = useState(emptyTeacher);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      return toast.error("Name, email and a temporary password are required");
    }
    try {
      setLoading(true);
      await API.post("/admin/create-teacher", form);
      setForm(emptyTeacher);
      onCreated?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not create teacher");
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    if (loading) return;
    setForm(emptyTeacher);
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add teacher"
      size="md"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} loading={loading} iconLeft={Plus}>
            Create account
          </Button>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Full name *</Label>
          <input className="input" value={form.name} onChange={set("name")} />
        </div>
        <div>
          <Label>Email *</Label>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={set("email")}
          />
        </div>
        <div>
          <Label>Temporary password *</Label>
          <input
            className="input"
            type="password"
            value={form.password}
            onChange={set("password")}
            autoComplete="new-password"
          />
          <p className="text-xs text-muted mt-1">
            Share this with the teacher and ask them to change it after signing in.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Department</Label>
            <input
              className="input"
              value={form.department}
              onChange={set("department")}
              placeholder="e.g. CSE"
            />
          </div>
          <div>
            <Label>Designation</Label>
            <input
              className="input"
              value={form.designation}
              onChange={set("designation")}
              placeholder="e.g. Assistant Professor"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Specialization</Label>
            <input
              className="input"
              value={form.specialization}
              onChange={set("specialization")}
              placeholder="e.g. Machine Learning"
            />
          </div>
          <div>
            <Label>Experience</Label>
            <input
              className="input"
              value={form.experience}
              onChange={set("experience")}
              placeholder="e.g. 8 years"
            />
          </div>
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

export default Teachers;

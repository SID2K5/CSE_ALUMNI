import {
  MapPin,
  Building2,
  GraduationCap,
  Mail,
  ShieldCheck,
  Link as LinkIcon,
  FileText,
  Briefcase,
} from "lucide-react";

import { Avatar, Badge } from "../ui";

/* =====================================================
   Shared profile presentation used by both
   /profile (own) and /profile/:id (someone else).
   `actions` is a slot for the right-hand buttons.
===================================================== */

const ROLE_VARIANT = {
  admin: "danger",
  teacher: "warning",
  alumni: "accent",
  student: "info",
};

export const ProfileHeader = ({ user, actions }) => {
  if (!user) return null;

  const verified = user.verifiedBadge || user.isVerified || user.teacherVerified;

  return (
    <div className="card overflow-hidden mb-5">
      {/* COVER */}
      <div className="h-32 sm:h-44 bg-surface-2 relative">
        {user.coverPic ? (
          <img
            src={user.coverPic}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand/20 via-brand-2/10 to-transparent" />
        )}
      </div>

      {/* IDENTITY */}
      <div className="px-5 sm:px-7 pb-6">
        <div className="flex items-end justify-between gap-4 flex-wrap -mt-10 sm:-mt-12">
          <div className="flex items-end gap-4 min-w-0">
            <div className="ring-4 ring-surface rounded-full">
              <Avatar user={user} size={88} />
            </div>
            <div className="min-w-0 pb-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-xl sm:text-2xl text-ink tracking-tight truncate">
                  {user.name}
                </h1>
                {verified && (
                  <ShieldCheck
                    size={17}
                    className="text-verified shrink-0"
                    aria-label="Verified"
                  />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {user.role && (
                  <Badge variant={ROLE_VARIANT[user.role] || "neutral"}>
                    {user.role}
                  </Badge>
                )}
                {user.position && (
                  <span className="text-sm text-muted truncate">
                    {user.position}
                    {user.company ? ` · ${user.company}` : ""}
                  </span>
                )}
              </div>
            </div>
          </div>

          {actions && <div className="flex items-center gap-2 pb-1">{actions}</div>}
        </div>

        {/* BIO */}
        {user.bio && (
          <p className="text-ink text-sm leading-relaxed mt-5 max-w-3xl whitespace-pre-wrap">
            {user.bio}
          </p>
        )}

        {/* QUICK FACTS */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 text-sm text-muted">
          {user.department && (
            <Fact icon={GraduationCap} text={user.department} />
          )}
          {user.graduationYear && (
            <Fact icon={GraduationCap} text={`Batch of ${user.graduationYear}`} />
          )}
          {user.company && <Fact icon={Building2} text={user.company} />}
          {user.location && <Fact icon={MapPin} text={user.location} />}
          {user.designation && <Fact icon={Briefcase} text={user.designation} />}
        </div>
      </div>
    </div>
  );
};

const Fact = ({ icon: Icon, text }) => (
  <span className="inline-flex items-center gap-1.5">
    <Icon size={14} className="shrink-0" />
    {text}
  </span>
);

/* ---------------- Section wrapper ---------------- */
export const Section = ({ title, children, action }) => (
  <section className="card p-5 sm:p-6">
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className="text-xs font-semibold text-muted uppercase tracking-wide">
        {title}
      </h2>
      {action}
    </div>
    {children}
  </section>
);

/* ---------------- Reusable blocks ---------------- */

export const SkillsBlock = ({ skills }) => {
  if (!Array.isArray(skills) || skills.length === 0) return null;
  return (
    <Section title="Skills">
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <span
            key={s}
            className="text-sm font-medium text-ink bg-surface-2 border border-line rounded-lg px-2.5 py-1"
          >
            {s}
          </span>
        ))}
      </div>
    </Section>
  );
};

export const DetailsBlock = ({ user, showPrivate = false }) => {
  const rows = [
    user.education && { icon: GraduationCap, label: "Education", value: user.education },
    user.department && { icon: GraduationCap, label: "Department", value: user.department },
    user.specialization && { icon: Briefcase, label: "Specialization", value: user.specialization },
    user.experience && { icon: Briefcase, label: "Experience", value: user.experience },
    user.domain && { icon: Briefcase, label: "Domain", value: user.domain },
    showPrivate && user.email && { icon: Mail, label: "Email", value: user.email },
    showPrivate && user.rollNumber && {
      icon: FileText,
      label: "Roll number",
      value: user.rollNumber,
    },
  ].filter(Boolean);

  if (rows.length === 0) return null;

  return (
    <Section title="Details">
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center shrink-0 mt-0.5">
              <r.icon size={15} className="text-muted" />
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-semibold text-muted uppercase tracking-wide">
                {r.label}
              </dt>
              <dd className="text-ink text-sm mt-0.5 break-words">{r.value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </Section>
  );
};

export const LinksBlock = ({ user }) => {
  const links = Array.isArray(user.portfolioLinks)
    ? user.portfolioLinks.filter((l) => l?.url)
    : [];
  const hasResume = !!user.resume;

  if (links.length === 0 && !hasResume) return null;

  return (
    <Section title="Links">
      <div className="flex flex-wrap gap-2">
        {hasResume && (
          <a
            href={user.resume}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink bg-surface-2 border border-line rounded-lg px-3 py-2 hover:border-brand/50 transition-colors"
          >
            <FileText size={14} className="text-muted" />
            Resume
          </a>
        )}
        {links.map((l, i) => (
          <a
            key={`${l.url}-${i}`}
            href={l.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink bg-surface-2 border border-line rounded-lg px-3 py-2 hover:border-brand/50 transition-colors"
          >
            <LinkIcon size={14} className="text-muted" />
            {l.label || new URL(l.url).hostname.replace("www.", "")}
          </a>
        ))}
      </div>
    </Section>
  );
};

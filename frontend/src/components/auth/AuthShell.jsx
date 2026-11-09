import { motion } from "framer-motion";
import { GraduationCap, Users, Briefcase, BookOpen } from "lucide-react";

/* =====================================================
   AuthShell — split-screen frame for Login / Register /
   Pending.

   Desktop : brand panel (left) + form card (right)
   Mobile  : form only. The background video is desktop-only
             so phones don't download ~2.5 MB to see a login box.
===================================================== */

const HIGHLIGHTS = [
  { icon: Users, label: "Find alumni by company, batch and city" },
  { icon: Briefcase, label: "Jobs and internships shared by the network" },
  { icon: BookOpen, label: "Notes, papers and study material by semester" },
];

const AuthShell = ({ title, subtitle, children, footer }) => (
  <div className="min-h-screen grid lg:grid-cols-[minmax(0,45%)_minmax(0,55%)] bg-bg">
    {/* ---------- BRAND PANEL (desktop only) ---------- */}
    <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 text-white">
      {/* Fallback gradient sits under the video */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#0b1120] to-[#083344]" />

      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      >
        <source src="/videos/login.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/45" />

      {/* content */}
      <div className="relative z-10">
        <span className="font-display font-extrabold text-2xl tracking-tight">
          NEXUS
        </span>
      </div>

      <div className="relative z-10 max-w-md">
        <h2 className="font-display font-extrabold text-3xl leading-tight tracking-tight">
          The CSE network, in one place.
        </h2>
        <p className="text-white/70 mt-3 text-sm leading-relaxed">
          Students, alumni and faculty — connected around the work that
          actually matters.
        </p>

        <ul className="mt-8 space-y-3">
          {HIGHLIGHTS.map((h) => {
            const Icon = h.icon;
            return (
              <li key={h.label} className="flex items-center gap-3 text-sm">
                <span className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
                  <Icon size={15} />
                </span>
                <span className="text-white/85">{h.label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="relative z-10 flex items-center gap-2 text-xs text-white/50">
        <GraduationCap size={14} />
        CSE Alumni &amp; Student Network
      </div>
    </aside>

    {/* ---------- FORM PANEL ---------- */}
    <main className="flex items-center justify-center p-5 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-[420px]"
      >
        {/* Mobile wordmark */}
        <div className="lg:hidden mb-7 text-center">
          <span className="font-display font-extrabold text-2xl tracking-tight text-ink">
            NEXUS
          </span>
        </div>

        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-[28px] text-ink tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted mt-1.5">{subtitle}</p>
          )}
        </div>

        {children}

        {footer && <div className="mt-6">{footer}</div>}
      </motion.div>
    </main>
  </div>
);

export default AuthShell;

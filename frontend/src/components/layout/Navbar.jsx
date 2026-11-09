import { Link, useLocation } from "react-router-dom";
import { getNavItems, isActivePath } from "./navItems";

/* =====================================================
   SIDEBAR
   Fixed, full-height, and intentionally DARK IN BOTH
   THEMES (sidebar-* tokens never flip). Desktop only —
   mobile uses MobileNav.
===================================================== */

const Navbar = () => {
  const location = useLocation();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const items = getNavItems(user?.role);

  return (
    <aside
      className="
        hidden md:flex flex-col
        fixed inset-y-0 left-0 z-50
        w-[260px]
        bg-sidebar-bg border-r border-sidebar-border
      "
    >
      {/* BRAND */}
      <div className="h-[72px] flex items-center gap-2.5 px-5 shrink-0">
        <span className="w-8 h-8 rounded-lg bg-gradient-lavender flex items-center justify-center shrink-0">
          <span className="font-display font-extrabold text-[15px] text-[#101A2B]">
            N
          </span>
        </span>
        <span className="font-display font-extrabold text-[19px] tracking-tight text-sidebar-text">
          NEXUS
        </span>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-2 space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(location.pathname, item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? "page" : undefined}
              className={`
                nav-item group relative flex items-center gap-3
                px-3 py-2.5 rounded-md text-[14.5px] font-medium
                outline-none
                focus-visible:ring-2 focus-visible:ring-sidebar-icon-active
                ${
                  active
                    ? "bg-sidebar-active text-sidebar-text font-semibold"
                    : "text-sidebar-text-secondary hover:bg-sidebar-hover hover:text-sidebar-text"
                }
              `}
            >
              {/* active rail */}
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-sidebar-icon-active transition-opacity ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />

              <Icon
                size={19}
                className={
                  active
                    ? "text-sidebar-icon-active"
                    : "text-sidebar-icon group-hover:text-sidebar-text"
                }
              />

              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="shrink-0 px-5 py-4 border-t border-sidebar-border">
        <p className="text-[11px] text-sidebar-text-secondary/70 leading-relaxed">
          CSE Student &amp; Alumni Network
        </p>
      </div>
    </aside>
  );
};

export default Navbar;

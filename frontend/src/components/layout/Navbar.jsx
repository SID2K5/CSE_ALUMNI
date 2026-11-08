import { Link, useLocation } from "react-router-dom";
import { getNavItems, isActivePath } from "./navItems";

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
    <nav
      className="
        sticky top-[88px] z-40
        hidden md:flex flex-col gap-1
        w-full pl-2 pr-3 py-2
        max-h-[calc(100vh-104px)]
        overflow-y-auto
        scrollbar-hide
      "
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActivePath(location.pathname, item.path);

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`
              nav-item group relative flex items-center gap-3
              px-3.5 py-2.5 rounded-xl text-[15px] font-semibold
              ${
                active
                  ? "bg-brand-soft text-brand"
                  : "text-muted hover:text-ink hover:bg-surface-2"
              }
            `}
          >
            {/* Active indicator bar */}
            <span
              className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-brand transition-opacity ${
                active ? "opacity-100" : "opacity-0"
              }`}
            />

            <Icon
              size={20}
              className={active ? "text-brand" : "text-muted group-hover:text-ink"}
            />

            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default Navbar;

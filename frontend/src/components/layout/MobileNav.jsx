import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, LogOut } from "lucide-react";

import { getNavItems, isActivePath } from "./navItems";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [open, setOpen] = useState(false);

  const items = getNavItems(user?.role);
  const primary = items.filter((i) => i.primary).slice(0, 4);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* ===== BOTTOM TAB BAR ===== */}
      <nav
        className="
          md:hidden fixed bottom-0 inset-x-0 z-50
          bg-surface/90 backdrop-blur-xl
          border-t border-line
          pb-[env(safe-area-inset-bottom)]
        "
      >
        <div className="grid grid-cols-5 h-16">
          {primary.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(location.pathname, item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 text-[11px] font-semibold ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                <Icon size={21} />
                {item.name}
              </Link>
            );
          })}

          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-muted"
          >
            <Menu size={21} />
            More
          </button>
        </div>
      </nav>

      {/* ===== FULL MENU SHEET ===== */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="
                md:hidden fixed bottom-0 inset-x-0 z-[70]
                rounded-t-3xl bg-surface border-t border-line
                p-5 pb-[calc(20px+env(safe-area-inset-bottom))]
                max-h-[82vh] overflow-y-auto
              "
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-ink">Menu</h3>
                <button onClick={() => setOpen(false)} className="icon-btn">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = isActivePath(location.pathname, item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => go(item.path)}
                      className={`flex flex-col items-center gap-2 py-4 rounded-2xl border text-[13px] font-semibold ${
                        active
                          ? "bg-brand-soft border-transparent text-brand"
                          : "bg-surface-2 border-line text-ink"
                      }`}
                    >
                      <Icon size={22} />
                      {item.name}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-line flex items-center gap-2.5">
                <button onClick={toggleTheme} className="btn-ghost flex-1">
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                    navigate("/login");
                  }}
                  className="btn-ghost flex-1 text-red-500"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNav;

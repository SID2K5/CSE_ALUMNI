import {
  User,
  BookOpen,
  MessageCircle,
  Users,
  Shield,
  CalendarDays,
  Briefcase,
  GraduationCap,
  LayoutDashboard,
  UserPlus,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  let items = [];

  /* ================= NAV ITEMS ================= */

  // 👤 PROFILE
  items.push({
    name: "Profile",
    icon: <User />,
    path: "/profile",
    color: "from-purple-500 to-indigo-500",
    shadow: "shadow-purple-300/40",
  });

  // 📚 RESOURCES
  if (
    role === "student" ||
    role === "teacher" ||
    role === "admin"
  ) {
    items.push({
      name: "Resources",
      icon: <BookOpen />,
      path: "/resources",
      color: "from-cyan-400 to-blue-500",
      shadow: "shadow-cyan-300/40",
    });
  }

  // 👨‍🏫 TEACHER DASHBOARD
  if (role === "teacher") {
    items.push({
      name: "Dashboard",
      icon: <LayoutDashboard />,
      path: "/teacher-dashboard",
      color: "from-fuchsia-500 to-violet-600",
      shadow: "shadow-fuchsia-300/40",
    });
  }

  // 📅 EVENTS
  items.push({
    name: "Events",
    icon: <CalendarDays />,
    path: "/events",
    color: "from-orange-400 to-pink-500",
    shadow: "shadow-orange-300/40",
  });

  // 💼 JOBS
  items.push({
    name: "Jobs",
    icon: <Briefcase />,
    path: "/jobs",
    color: "from-indigo-500 to-purple-600",
    shadow: "shadow-indigo-300/40",
  });

  // 🎓 ALUMNI
  items.push({
    name: "Alumni",
    icon: <Users />,
    path: "/alumni",
    color: "from-emerald-400 to-green-500",
    shadow: "shadow-green-300/40",
  });

  // 🤝 CONNECTIONS
  items.push({
    name: "Connections",
    icon: <UserPlus />,
    path: "/connections",
    color: "from-sky-400 to-cyan-500",
    shadow: "shadow-sky-300/40",
  });

  // 👨‍🏫 TEACHERS
  if (
    role === "student" ||
    role === "alumni" ||
    role === "teacher" ||
    role === "admin"
  ) {
    items.push({
      name: "Teachers",
      icon: <GraduationCap />,
      path: "/teachers",
      color: "from-yellow-400 to-amber-500",
      shadow: "shadow-yellow-300/40",
    });
  }

  // 💬 CHAT
  items.push({
    name: "Chat",
    icon: <MessageCircle />,
    path: "/chat",
    color: "from-pink-400 to-rose-500",
    shadow: "shadow-pink-300/40",
  });

  // 🛡️ ADMIN PANEL
  if (role === "admin") {
    items.push({
      name: "Admin",
      icon: <Shield />,
      path: "/admin",
      color: "from-red-400 to-orange-500",
      shadow: "shadow-red-300/40",
    });
  }

  return (
    <div
      className="
        fixed left-4 top-24 hidden md:flex flex-col gap-5 z-40

        h-[calc(100vh-7rem)]
        overflow-y-auto
        pr-2

        scrollbar-hide
      "
    >

      {items.map((item, i) => {
        const active =
          location.pathname === item.path ||
          location.pathname.startsWith(item.path + "/");

        return (
          <Link key={i} to={item.path}>
            <div
              className={`
                relative flex items-center gap-3 px-6 py-4 rounded-2xl cursor-pointer
                transition-all duration-300 overflow-hidden

                bg-gradient-to-br ${item.color} text-white
                shadow-lg ${item.shadow}

                ${
                  active
                    ? "scale-105 ring-2 ring-white/40"
                    : ""
                }

                hover:scale-110 hover:shadow-2xl
              `}
            >

              {/* GLOW EFFECT */}
              <div className="absolute inset-0 opacity-20 bg-white blur-2xl" />

              {/* 3D EFFECT */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  boxShadow:
                    "inset 0 2px 6px rgba(255,255,255,0.3), inset 0 -3px 8px rgba(0,0,0,0.3)",
                }}
              />

              {/* ICON */}
              <div className="z-10">
                {item.icon}
              </div>

              {/* TEXT */}
              <span className="z-10 font-semibold tracking-wide text-sm md:text-base">
                {item.name}
              </span>

            </div>
          </Link>
        );
      })}

    </div>
  );
};

export default Navbar;
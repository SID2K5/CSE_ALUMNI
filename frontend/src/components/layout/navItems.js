import {
  Home,
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

/**
 * Single source of truth for primary navigation.
 * `primary: true` items also appear in the mobile bottom bar.
 */
export const getNavItems = (role) => {
  const items = [
    { name: "Feed", icon: Home, path: "/feed", primary: true },
    { name: "Profile", icon: User, path: "/profile", primary: true },
  ];

  if (role === "student" || role === "teacher" || role === "admin") {
    items.push({ name: "Resources", icon: BookOpen, path: "/resources" });
  }

  if (role === "teacher") {
    items.push({ name: "Dashboard", icon: LayoutDashboard, path: "/teacher-dashboard" });
  }

  items.push({ name: "Events", icon: CalendarDays, path: "/events", primary: true });
  items.push({ name: "Jobs", icon: Briefcase, path: "/jobs", primary: true });
  items.push({ name: "Alumni", icon: Users, path: "/alumni" });
  items.push({ name: "Connections", icon: UserPlus, path: "/connections" });

  if (role === "student" || role === "alumni" || role === "teacher" || role === "admin") {
    items.push({ name: "Teachers", icon: GraduationCap, path: "/teachers" });
  }

  items.push({ name: "Chat", icon: MessageCircle, path: "/chat" });

  if (role === "admin") {
    items.push({ name: "Admin", icon: Shield, path: "/admin" });
  }

  return items;
};

export const isActivePath = (pathname, path) =>
  pathname === path || pathname.startsWith(path + "/");

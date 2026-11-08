import { useState } from "react";
import { avatarUrl } from "../../utils/avatar";

/**
 * Avatar — image with graceful initials fallback.
 * Replaces every `via.placeholder.com` usage across the app.
 *
 *   user: { profilePic?, name? } — standard user object
 *   size: pixels (default 40)
 *   ring: optional tailwind color class, e.g. "ring-brand"
 */
const initialsOf = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

const bgFromName = (name = "") => {
  // Deterministic pick from a small palette so people keep their colour.
  const colors = [
    "bg-violet-500",
    "bg-cyan-500",
    "bg-rose-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-sky-500",
    "bg-fuchsia-500",
    "bg-teal-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) | 0;
  return colors[Math.abs(hash) % colors.length];
};

const Avatar = ({ user, size = 40, ring = "", className = "", onClick }) => {
  const src = user?.profilePic ? avatarUrl(user, size) : null;
  const [broken, setBroken] = useState(false);
  const px = `${size}px`;
  const fontPx = Math.max(10, Math.round(size * 0.4));

  const common = {
    onClick,
    style: { width: px, height: px, fontSize: `${fontPx}px` },
    className: `rounded-full shrink-0 flex items-center justify-center overflow-hidden ${
      onClick ? "cursor-pointer" : ""
    } ${ring} ${className}`,
  };

  if (src && !broken) {
    return (
      <img
        {...common}
        src={src}
        alt={user?.name || "user"}
        loading="lazy"
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <div
      {...common}
      className={`${common.className} ${bgFromName(user?.name || "")} text-white font-semibold`}
      aria-label={user?.name || "user"}
    >
      {initialsOf(user?.name)}
    </div>
  );
};

export default Avatar;

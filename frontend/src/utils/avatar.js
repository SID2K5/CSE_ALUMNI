// Reliable avatar fallback — replaces the dead via.placeholder.com service.
// Returns the user's uploaded picture, or a clean generated initials avatar.

export const avatarUrl = (user, size = 96) => {
  if (user?.profilePic) return user.profilePic;

  const name = encodeURIComponent((user?.name || "User").trim() || "User");

  return `https://ui-avatars.com/api/?name=${name}&background=7c3aed&color=ffffff&bold=true&size=${size}`;
};

export default avatarUrl;

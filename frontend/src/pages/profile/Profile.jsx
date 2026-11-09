import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, FileText, Users, Sparkles } from "lucide-react";

import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import { Button, EmptyState, Skeleton } from "../../components/ui";
import {
  ProfileHeader,
  Section,
  SkillsBlock,
  DetailsBlock,
  LinksBlock,
} from "../../components/profile/ProfileLayout";
import PostCard from "../../components/ui/PostCard";
import EditProfileModal from "./EditProfileModal";

/* =====================================================
   MY PROFILE — /profile
===================================================== */

const Profile = () => {
  const { user: authUser, login } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await API.get("/users/me");
      setProfile(data);
    } catch (err) {
      console.error(err);
      toast.error("Could not load your profile");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const { data } = await API.get("/posts/mine");
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [fetchProfile, fetchPosts]);

  const updatePost = (updated) =>
    setPosts((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p))
    );

  const handleSaved = (updated) => {
    setProfile(updated);
    setEditOpen(false);
    // Keep the cached auth user (name / avatar in topbar) in sync.
    if (authUser) {
      login({
        ...authUser,
        name: updated.name ?? authUser.name,
        profilePic: updated.profilePic ?? authUser.profilePic,
      });
    }
    toast.success("Profile updated");
  };

  if (loading) {
    return (
      <div className="pt-4 pb-10 space-y-5">
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <EmptyState
        icon={Users}
        title="Profile unavailable"
        description="We couldn't load your profile. Try refreshing the page."
      />
    );
  }

  const completion = Number(profile.profileCompletion) || 0;

  return (
    <div className="pt-4 pb-10">
      <ProfileHeader
        user={profile}
        actions={
          <Button
            variant="secondary"
            iconLeft={Pencil}
            onClick={() => setEditOpen(true)}
          >
            Edit profile
          </Button>
        }
      />

      {/* PROFILE COMPLETION — only when the backend reports it */}
      {completion > 0 && completion < 100 && (
        <div className="card p-4 mb-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-brand-soft flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-brand" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="text-sm font-medium text-ink">
                Profile {completion}% complete
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <div
                className="h-full bg-brand rounded-full transition-all"
                style={{ width: `${Math.min(completion, 100)}%` }}
              />
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setEditOpen(true)}>
            Complete
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 space-y-5">
          <DetailsBlock user={profile} showPrivate />
          <SkillsBlock skills={profile.skills} />
          <LinksBlock user={profile} />
        </div>

        <div className="lg:col-span-2">
          <Section title={`Your posts${posts.length ? ` · ${posts.length}` : ""}`}>
            {postsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : posts.length === 0 ? (
              <EmptyState
                compact
                icon={FileText}
                title="No posts yet"
                description="Share something with the community from your feed."
              />
            ) : (
              <div className="space-y-4">
                {posts.map((p) => (
                  <PostCard key={p._id} post={p} updatePost={updatePost} />
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>

      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
        onSaved={handleSaved}
      />
    </div>
  );
};

export default Profile;

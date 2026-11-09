import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, MessageCircle, Users, FileText } from "lucide-react";

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
import ConnectionButton from "../../components/ConnectionButton";

/* =====================================================
   PUBLIC PROFILE — /profile/:id
   Private fields (email, roll number) are intentionally
   NOT shown here; only the owner sees them on /profile.
===================================================== */

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Viewing your own id → use the richer own-profile page.
    if (me?._id && id === me._id) {
      navigate("/profile", { replace: true });
      return;
    }

    const run = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/users/${id}`);
        setProfile(data);
      } catch (err) {
        console.error(err);
        toast.error("Could not load this profile");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, me?._id, navigate]);

  if (loading) {
    return (
      <div className="pt-4 pb-10 space-y-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <EmptyState
        icon={Users}
        title="Profile not found"
        description="This user may have been removed or the link is invalid."
        action={
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Go back
          </Button>
        }
      />
    );
  }

  return (
    <div className="pt-4 pb-10">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <ProfileHeader
        user={profile}
        actions={
          <>
            <div className="min-w-[150px]">
              <ConnectionButton userId={profile._id} />
            </div>
            <Button
              variant="secondary"
              iconLeft={MessageCircle}
              onClick={() => navigate("/chat")}
            >
              Message
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 space-y-5">
          {/* showPrivate omitted — email / roll number stay hidden */}
          <DetailsBlock user={profile} />
          <SkillsBlock skills={profile.skills} />
          <LinksBlock user={profile} />
        </div>

        <div className="lg:col-span-2">
          <Section title="About">
            {profile.bio ? (
              <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            ) : (
              <EmptyState
                compact
                icon={FileText}
                title="No bio yet"
                description={`${profile.name} hasn't written an introduction.`}
              />
            )}
          </Section>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

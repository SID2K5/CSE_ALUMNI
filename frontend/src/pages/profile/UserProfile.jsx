import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import API from "../../services/api";
import toast from "react-hot-toast";

import {
  BadgeCheck,
  MapPin,
  Users,
  Briefcase,
  GraduationCap,
  Share2,
  MessageCircle,
} from "lucide-react";

import { motion } from "framer-motion";

import PostCard from "../../components/ui/PostCard";
import SkeletonPost from "../../components/ui/SkeletonPost";

// 🔥 SKILL ICONS
const getSkillIcon = (skill) => {
  const map = {
    react: "⚛️",
    node: "🟢",
    python: "🐍",
    java: "☕",
    javascript: "🟨",
    mongodb: "🍃",
    express: "🚀",
    html: "🌐",
    css: "🎨",
    git: "🔧",
  };

  return map[skill.toLowerCase()] || "✨";
};

const UserProfile = () => {
  const { id } = useParams();

  const [user, setUser] = useState(null);

  const [posts, setPosts] = useState([]);

  const [loadingPosts, setLoadingPosts] = useState(false);

  const [tab, setTab] = useState("about");

  // =====================================================
  // 🔥 FETCH USER
  // =====================================================

  const fetchUser = async () => {
    try {

      const { data } = await API.get(`/users/${id}`);

      if (
        data.portfolioLinks &&
        typeof data.portfolioLinks === "string"
      ) {
        try {
          data.portfolioLinks =
            JSON.parse(data.portfolioLinks);
        } catch {
          data.portfolioLinks = [];
        }
      }

      setUser(data);

    } catch (error) {
      console.log(error);
    }
  };

  // =====================================================
  // 🔥 FETCH POSTS
  // =====================================================

  const fetchPosts = async () => {
    try {

      setLoadingPosts(true);

      const { data } = await API.get(
        `/posts/user/${id}`
      );

      setPosts(data);

    } catch (error) {
      console.log(error);

    } finally {
      setLoadingPosts(false);
    }
  };

  // =====================================================
  // 🔥 SHARE PROFILE
  // =====================================================

  const handleShareProfile = async () => {
    try {

      const profileUrl =
        window.location.href;

      if (navigator.share) {

        await navigator.share({
          title: `${user.name}'s Profile`,
          text: `Check out ${user.name}'s profile on ALU 🚀`,
          url: profileUrl,
        });

        toast.success("Profile shared 🚀");

      } else {

        await navigator.clipboard.writeText(
          profileUrl
        );

        toast.success(
          "Profile link copied 🔗"
        );
      }

    } catch (error) {
      toast.error("Unable to share profile");
    }
  };

  // =====================================================
  // 💬 MESSAGE USER
  // =====================================================

  const handleMessage = async () => {
    try {

      const { data } = await API.get(
        `/chat/conversation/${user._id}`
      );

      window.location.href = `/chat/${data._id}`;

    } catch (error) {
      console.log(error);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchUser();
    fetchPosts();
  }, [id]);

  if (!user)
    return (
      <div className="text-center mt-10 text-white">
        Loading...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto pb-20 px-2 md:px-4 space-y-8">

      {/* HERO */}
      <div className="relative">

        {/* COVER */}
        <div
          className="relative h-[330px]
          rounded-[32px] overflow-hidden
          shadow-[0_0_60px_rgba(0,255,255,0.08)]
          border border-white/10"
        >

          {user.coverPic ? (
            <img
              src={user.coverPic}
              className="absolute inset-0
              w-full h-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0
              bg-gradient-to-br
              from-[#1e1b4b]
              via-[#0f172a]
              to-[#0c4a6e]"
            />
          )}

          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />

        </div>

        {/* PROFILE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative -mt-28 mx-auto
          glass rounded-[32px]
          border border-white/10
          shadow-[0_0_50px_rgba(139,92,246,0.12)]
          p-6 md:p-8"
        >

          <div className="flex flex-col lg:flex-row gap-8">

            {/* LEFT */}
            <div className="flex flex-col md:flex-row gap-6 flex-1">

              {/* IMAGE */}
              <div className="relative">

                <div
                  className="absolute inset-0
                  rounded-full blur-2xl
                  bg-purple-500/40"
                />

                <div className="relative">

                  <img
                    src={
                      user.profilePic ||
                      "https://via.placeholder.com/150"
                    }
                    className="w-40 h-40 rounded-full
                    border-[5px] border-white
                    object-cover shadow-2xl"
                  />

                  <div
                    className="absolute bottom-3 right-3
                    w-5 h-5 rounded-full
                    bg-green-400 border-2 border-white"
                  />

                </div>

              </div>

              {/* USER INFO */}
              <div className="flex-1 space-y-5">

                <div>

                  <div className="flex items-center gap-3 flex-wrap">

                    <h1
                      className="text-4xl md:text-5xl
                      font-bold tracking-tight text-white"
                    >
                      {user.name}
                    </h1>

                    <BadgeCheck
                      size={26}
                      className="text-blue-400"
                    />

                  </div>

                  <p
                    className="text-lg mt-3
                    text-gray-300 leading-relaxed"
                  >
                    {user.bio || "No bio added"}
                  </p>

                </div>

                {/* META */}
                <div
                  className="flex flex-wrap gap-5
                  text-sm text-gray-400"
                >

                  <div className="flex items-center gap-2">
                    <MapPin size={15} />
                    {user.location || "Unknown"}
                  </div>

                  <div className="flex items-center gap-2">
                    <GraduationCap size={15} />
                    {user.education || "N/A"}
                  </div>

                  <div className="flex items-center gap-2">
                    <Briefcase size={15} />
                    {user.company || "No company"}
                  </div>

                  <div className="flex items-center gap-2">
                    🎓 {user.graduationYear || "N/A"}
                  </div>

                </div>

                {/* ACTIONS */}
                <div className="flex flex-wrap gap-3 pt-2">

                  {/* MESSAGE */}
                  <button
                    onClick={handleMessage}
                    className="px-6 py-3 rounded-2xl
                    bg-gradient-to-r
                    from-purple-500 to-cyan-400
                    text-white font-semibold
                    hover:scale-105 transition
                    shadow-lg flex items-center gap-2"
                  >
                    <MessageCircle size={18} />
                    Message
                  </button>

                  {/* SHARE */}
                  <button
                    onClick={handleShareProfile}
                    className="px-6 py-3 rounded-2xl
                    border border-white/10
                    bg-white/5 backdrop-blur-md
                    text-white hover:bg-white/10
                    transition flex items-center gap-2"
                  >
                    <Share2 size={18} />
                    Share Profile
                  </button>

                </div>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

        {[
          {
            label: "Connections",
            value: user.connections?.length || 0,
            icon: <Users />,
          },
          {
            label: "Posts",
            value: posts.length,
            icon: "📝",
          },
          {
            label: "Skills",
            value: user.skills?.length || 0,
            icon: "⚡",
          },
          {
            label: "Role",
            value: user.role || "student",
            icon: "🚀",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -6 }}
            className="glass rounded-[24px]
            p-6 text-center border border-white/10 shadow-xl"
          >

            <div className="flex justify-center text-purple-400 mb-3">
              {item.icon}
            </div>

            <h2 className="text-4xl font-bold text-white">
              {item.value}
            </h2>

            <p className="text-gray-400 mt-2">
              {item.label}
            </p>

          </motion.div>
        ))}

      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-3">

        {["about", "posts", "activity"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-3 rounded-2xl capitalize transition-all duration-300
            ${
              tab === t
                ? "bg-gradient-to-r from-purple-500 to-cyan-400 text-white shadow-lg scale-105"
                : "glass text-gray-300 hover:scale-105"
            }`}
          >
            {t}
          </button>
        ))}

      </div>

      {/* ABOUT */}
      {tab === "about" && (
        <div className="grid lg:grid-cols-2 gap-6">

          {/* SKILLS */}
          <div className="glass rounded-[28px] p-7 border border-white/10">

            <h2 className="text-2xl font-bold text-white mb-6">
              Skills ⚡
            </h2>

            <div className="flex flex-wrap gap-3">

              {user.skills?.map((skill, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="px-5 py-3 rounded-2xl
                  bg-gradient-to-r
                  from-purple-500/20 to-cyan-400/20
                  border border-white/10
                  text-white backdrop-blur-md"
                >
                  {getSkillIcon(skill)} {skill}
                </motion.div>
              ))}

            </div>

          </div>

          {/* PORTFOLIO */}
          <div className="glass rounded-[28px] p-7 border border-white/10">

            <h2 className="text-2xl font-bold text-white mb-6">
              Portfolio 🔗
            </h2>

            <div className="space-y-4">

              {user.portfolioLinks?.length > 0 ? (
                user.portfolioLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between
                    p-4 rounded-2xl
                    bg-white/5 hover:bg-white/10
                    border border-white/10
                    transition"
                  >

                    <span className="text-white">
                      {link.label || "Portfolio"}
                    </span>

                    <span className="text-cyan-400">
                      ↗
                    </span>

                  </a>
                ))
              ) : (
                <p className="text-gray-400">
                  No portfolio links added
                </p>
              )}

            </div>

          </div>

        </div>
      )}

      {/* POSTS */}
      {tab === "posts" && (
        <div className="space-y-6">

          {loadingPosts && (
            <>
              <SkeletonPost />
              <SkeletonPost />
            </>
          )}

          {!loadingPosts &&
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                refresh={fetchPosts}
              />
            ))}

        </div>
      )}

      {/* ACTIVITY */}
      {tab === "activity" && (
        <div className="glass rounded-[28px] p-8 text-gray-400">
          Activity system coming soon 🚀
        </div>
      )}

    </div>
  );
};

export default UserProfile;
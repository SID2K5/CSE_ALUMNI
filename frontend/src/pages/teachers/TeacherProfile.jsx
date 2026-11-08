import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import {
  BadgeCheck,
  MessageCircle,
  UserPlus,
  Briefcase,
  Star,
} from "lucide-react";

const TeacherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState(null);
  const [posts, setPosts] = useState([]);

  const fetchTeacher = async () => {
    try {
      const { data } = await API.get(`/teachers/${id}`);

      setTeacher(data.teacher);
      setPosts(data.posts);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTeacher();
  }, []);

  // ✅ SEND CONNECTION REQUEST
  const sendConnectionRequest = async () => {
    try {
      await API.put(`/connections/send/${teacher._id}`);

      toast.success("Connection request sent 🚀");

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Connection failed"
      );
    }
  };

  if (!teacher) return null;

  return (
    <div className="max-w-6xl mx-auto pb-10">

      {/* HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] shadow-2xl"
      >

        {/* BACKGROUND */}
        <div className="h-[320px] bg-gradient-to-br from-fuchsia-500 via-purple-500 to-cyan-400 relative">

          {/* GLOW */}
          <div className="absolute top-10 left-10 w-52 h-52 bg-pink-400/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl" />

        </div>

        {/* CONTENT */}
        <div className="glass backdrop-blur-xl bg-black/40 px-8 py-8 md:px-12 -mt-24 relative z-10 rounded-t-[40px]">

          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">

            {/* PROFILE IMAGE */}
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={
                teacher.profilePic ||
                "https://via.placeholder.com/150"
              }
              className="w-40 h-40 rounded-full border-[5px] border-white shadow-2xl object-cover"
            />

            {/* DETAILS */}
            <div className="flex-1 space-y-4">

              {/* NAME */}
              <div className="flex items-center gap-3 flex-wrap">

                <h1 className="text-5xl font-extrabold text-white tracking-tight">
                  {teacher.name}
                </h1>

                <BadgeCheck
                  className="text-sky-400"
                  size={30}
                />

              </div>

              {/* INFO */}
              <div className="space-y-1">

                <p className="text-2xl text-gray-200 font-medium">
                  {teacher.designation}
                </p>

                <p className="text-lg text-cyan-300 font-semibold">
                  {teacher.specialization}
                </p>

                <p className="text-gray-300 text-sm">
                  {teacher.experience} Experience
                </p>

              </div>

              {/* STATS */}
              <div className="flex flex-wrap gap-4 pt-2">

                <div className="bg-white/10 border border-white/10 px-5 py-3 rounded-2xl">
                  <div className="flex items-center gap-2 text-pink-300">
                    <Briefcase size={18} />
                    <span className="font-semibold">
                      {posts.length} Posts
                    </span>
                  </div>
                </div>

                <div className="bg-white/10 border border-white/10 px-5 py-3 rounded-2xl">
                  <div className="flex items-center gap-2 text-yellow-300">
                    <Star size={18} />
                    <span className="font-semibold">
                      Top Mentor
                    </span>
                  </div>
                </div>

              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-4 pt-3 flex-wrap">

                {/* MESSAGE */}
                <button
                  onClick={() =>
                    navigate(`/chat?user=${teacher._id}`)
                  }
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold shadow-lg hover:scale-105 transition flex items-center gap-2"
                >
                  <MessageCircle size={18} />
                  Message
                </button>

                {/* CONNECT */}
                <button
                  onClick={sendConnectionRequest}
                  className="px-6 py-3 rounded-2xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition flex items-center gap-2 hover:scale-105"
                >
                  <UserPlus size={18} />
                  Connect
                </button>

              </div>

            </div>

          </div>

        </div>

      </motion.div>

      {/* POSTS */}
      <div className="mt-14 space-y-6">

        <div className="flex items-center justify-between">

          <h2 className="text-3xl font-bold gradient-text">
            Posts 📝
          </h2>

          <span className="text-gray-400 text-sm">
            Recent teacher activity
          </span>

        </div>

        <div className="space-y-6">

          {posts.map((p) => (
            <motion.div
              key={p._id}
              whileHover={{ scale: 1.01 }}
              className="rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#0F172A] to-[#111827] shadow-xl"
            >

              {/* POST HEADER */}
              <div className="p-6 flex items-center gap-4 border-b border-white/10">

                <img
                  src={
                    teacher.profilePic ||
                    "https://via.placeholder.com/50"
                  }
                  className="w-14 h-14 rounded-full object-cover"
                />

                <div>

                  <div className="flex items-center gap-2">

                    <h3 className="font-bold text-white">
                      {teacher.name}
                    </h3>

                    <BadgeCheck
                      className="text-sky-400"
                      size={16}
                    />

                  </div>

                  <p className="text-sm text-gray-400">
                    {teacher.designation}
                  </p>

                </div>

              </div>

              {/* POST CONTENT */}
              <div className="p-6 space-y-5">

                <p className="text-gray-200 leading-relaxed text-[15px]">
                  {p.content}
                </p>

                {p.image && (
                  <img
                    src={p.image}
                    className="rounded-2xl w-full object-cover max-h-[500px]"
                  />
                )}

              </div>

            </motion.div>
          ))}

        </div>

      </div>

    </div>
  );
};

export default TeacherProfile;
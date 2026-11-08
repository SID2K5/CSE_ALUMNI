import { useEffect, useState } from "react";
import API from "../../services/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import {
  Search,
  MessageCircle,
  UserPlus,
  Trash2,
  Plus,
  GraduationCap,
  Briefcase,
  Mail,
  Lock,
  Sparkles,
  BookOpen,
  Stars,
  MoreVertical,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const Teachers = () => {

  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [teacherForm, setTeacherForm] = useState({
    name: "",
    email: "",
    password: "",
    designation: "",
    specialization: "",
    experience: "",
    department: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));

  const navigate = useNavigate();

  // =====================================================
  // FETCH TEACHERS
  // =====================================================

  const fetchTeachers = async () => {

    try {

      const { data } = await API.get(
        `/teachers?search=${search}`
      );

      setTeachers(data);

    } catch (error) {

      console.error(error);

      toast.error("Failed to fetch teachers");
    }
  };

  // =====================================================
  // CREATE TEACHER
  // =====================================================

  const createTeacher = async () => {

    try {

      if (
        !teacherForm.name ||
        !teacherForm.email ||
        !teacherForm.password
      ) {
        return toast.error(
          "Please fill all required fields"
        );
      }

      setLoading(true);

      await API.post(
        "/admin/create-teacher",
        teacherForm
      );

      toast.success(
        "Teacher added successfully 🚀"
      );

      setTeacherForm({
        name: "",
        email: "",
        password: "",
        designation: "",
        specialization: "",
        experience: "",
        department: "",
      });

      fetchTeachers();

    } catch (err) {

      console.error(err);

      toast.error(
        err.response?.data?.message ||
        "Failed to create teacher"
      );

    } finally {

      setLoading(false);
    }
  };

  // =====================================================
  // DELETE TEACHER
  // =====================================================

  const deleteTeacher = async (id) => {

    try {

      await API.delete(`/admin/teacher/${id}`);

      toast.success("Teacher removed");

      fetchTeachers();

    } catch (err) {

      console.error(err);

      toast.error("Failed to remove teacher");
    }
  };

  // =====================================================

  useEffect(() => {
    fetchTeachers();
  }, [search]);

  // =====================================================
  // THEMES
  // =====================================================

  const themes = [
    {
      border: "from-cyan-400 via-blue-500 to-violet-500",
      glow: "shadow-cyan-500/20",
      badge: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300",
      exp: "bg-violet-500/10 border-violet-500/20 text-violet-300",
      button: "from-cyan-400 to-violet-600",
    },
    {
      border: "from-pink-500 via-fuchsia-500 to-purple-500",
      glow: "shadow-pink-500/20",
      badge: "bg-pink-500/10 border-pink-500/20 text-pink-300",
      exp: "bg-purple-500/10 border-purple-500/20 text-purple-300",
      button: "from-pink-500 to-purple-600",
    },
    {
      border: "from-emerald-400 via-teal-500 to-cyan-500",
      glow: "shadow-emerald-500/20",
      badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
      exp: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300",
      button: "from-emerald-400 to-cyan-600",
    },
  ];

  return (

    <div className="w-full max-w-[1600px] mx-auto px-4 pb-10 space-y-10">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="space-y-4">

        <div className="flex items-center gap-4 flex-wrap">

          <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center shadow-2xl shrink-0">

            <GraduationCap
              className="text-white"
              size={30}
            />

          </div>

          <div>

            <h1 className="text-5xl font-black tracking-tight text-white leading-tight">
              Discover Teachers
            </h1>

            <p className="mt-2 text-lg text-gray-400">
              Explore verified educators, mentors and industry experts.
            </p>

          </div>

        </div>

      </div>

      {/* ===================================================== */}
      {/* ADMIN PANEL */}
      {/* ===================================================== */}

      {user?.role === "admin" && (

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[34px]
          border border-white/10
          bg-[#071028]/95
          backdrop-blur-2xl
          shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
        >

          {/* GLOW */}

          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/20 blur-3xl rounded-full" />

          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/20 blur-3xl rounded-full" />

          {/* CONTENT */}

          <div className="relative z-10 p-8 md:p-10">

            {/* TOP */}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">

              <div>

                <div className="flex items-center gap-3 mb-3 flex-wrap">

                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center shadow-xl">

                    <Plus className="text-white" />

                  </div>

                  <div>

                    <h2 className="text-3xl font-bold text-white">
                      Faculty Management
                    </h2>

                    <p className="text-gray-400 mt-1">
                      Create and manage verified teacher accounts.
                    </p>

                  </div>

                </div>

              </div>

              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-purple-500/20 bg-purple-500/10 self-start">

                <Sparkles
                  size={18}
                  className="text-purple-300"
                />

                <span className="text-sm font-semibold text-purple-200">
                  Admin Access
                </span>

              </div>

            </div>

            {/* FORM */}

            <div className="grid md:grid-cols-2 gap-6">

              {[
                {
                  label: "Teacher Name",
                  field: "name",
                  value: teacherForm.name,
                  placeholder: "Enter teacher name",
                  icon: GraduationCap,
                },
                {
                  label: "Email Address",
                  field: "email",
                  value: teacherForm.email,
                  placeholder: "teacher@example.com",
                  icon: Mail,
                },
                {
                  label: "Password",
                  field: "password",
                  value: teacherForm.password,
                  placeholder: "Create password",
                  icon: Lock,
                  type: "password",
                },
                {
                  label: "Designation",
                  field: "designation",
                  value: teacherForm.designation,
                  placeholder: "Professor",
                  icon: Briefcase,
                },
              ].map((item, i) => (

                <div key={i} className="space-y-2">

                  <label className="text-sm font-medium text-gray-300">
                    {item.label}
                  </label>

                  <div className="relative">

                    <item.icon
                      size={18}
                      className="absolute left-5 top-5 text-gray-500"
                    />

                    <input
                      type={item.type || "text"}
                      value={item.value}
                      placeholder={item.placeholder}
                      className="w-full h-[60px] pl-14 pr-5 rounded-2xl
                      bg-[#0B1328]
                      border border-white/10
                      text-white
                      placeholder-gray-500
                      focus:outline-none
                      focus:ring-2
                      focus:ring-purple-500
                      transition-all"
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          [item.field]: e.target.value,
                        })
                      }
                    />

                  </div>

                </div>

              ))}

              {/* SPECIALIZATION */}

              <div className="space-y-2">

                <label className="text-sm font-medium text-gray-300">
                  Specialization
                </label>

                <input
                  value={teacherForm.specialization}
                  placeholder="AI / ML / Web Development"
                  className="w-full h-[60px] px-5 rounded-2xl
                  bg-[#0B1328]
                  border border-white/10
                  text-white
                  placeholder-gray-500
                  focus:outline-none
                  focus:ring-2
                  focus:ring-cyan-500"
                  onChange={(e) =>
                    setTeacherForm({
                      ...teacherForm,
                      specialization: e.target.value,
                    })
                  }
                />

              </div>

              {/* EXPERIENCE */}

              <div className="space-y-2">

                <label className="text-sm font-medium text-gray-300">
                  Experience
                </label>

                <input
                  value={teacherForm.experience}
                  placeholder="10+ Years"
                  className="w-full h-[60px] px-5 rounded-2xl
                  bg-[#0B1328]
                  border border-white/10
                  text-white
                  placeholder-gray-500
                  focus:outline-none
                  focus:ring-2
                  focus:ring-orange-500"
                  onChange={(e) =>
                    setTeacherForm({
                      ...teacherForm,
                      experience: e.target.value,
                    })
                  }
                />

              </div>

              {/* DEPARTMENT */}

              <div className="md:col-span-2 space-y-2">

                <label className="text-sm font-medium text-gray-300">
                  Department
                </label>

                <input
                  value={teacherForm.department}
                  placeholder="Computer Science & Engineering"
                  className="w-full h-[60px] px-5 rounded-2xl
                  bg-[#0B1328]
                  border border-white/10
                  text-white
                  placeholder-gray-500
                  focus:outline-none
                  focus:ring-2
                  focus:ring-pink-500"
                  onChange={(e) =>
                    setTeacherForm({
                      ...teacherForm,
                      department: e.target.value,
                    })
                  }
                />

              </div>

            </div>

            {/* BUTTON */}

            <div className="mt-8 flex justify-end">

              <button
                onClick={createTeacher}
                disabled={loading}
                className="h-[60px] px-8 rounded-2xl
                bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400
                text-white font-semibold text-lg
                shadow-2xl
                hover:scale-[1.02]
                transition-all duration-300"
              >
                {loading
                  ? "Creating..."
                  : "Create Teacher 🚀"}
              </button>

            </div>

          </div>

        </motion.div>

      )}

      {/* ===================================================== */}
      {/* SEARCH */}
      {/* ===================================================== */}

      <div className="relative">

        <Search
          className="absolute left-5 top-5 text-gray-500"
          size={20}
        />

        <input
          placeholder="Search teachers by name or specialization..."
          className="w-full h-[64px] pl-14 pr-5 rounded-[28px]
          bg-[#071028]
          border border-white/10
          text-white
          placeholder-gray-500
          shadow-xl
          focus:outline-none
          focus:ring-2
          focus:ring-purple-500"
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      {/* ===================================================== */}
      {/* EMPTY STATE */}
      {/* ===================================================== */}

      {teachers.length === 0 && (

        <div className="rounded-[32px] border border-white/10 bg-[#071028] p-14 text-center">

          <h2 className="text-3xl font-bold text-white">
            No Teachers Found
          </h2>

          <p className="mt-3 text-gray-400">
            Teachers added by admin will appear here.
          </p>

        </div>

      )}

      {/* ===================================================== */}
{/* PROFESSIONAL TEACHER CARDS */}
{/* ===================================================== */}

<div className="flex flex-wrap gap-7 items-start">

  {teachers.map((teacher, index) => {

    const theme =
      themes[index % themes.length];

    const initials =
      teacher.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "T";

    return (

      <motion.div
        key={teacher._id}
        whileHover={{
          y: -4,
        }}
        transition={{
          duration: 0.25,
        }}
        onClick={() =>
          navigate(`/teachers/${teacher._id}`)
        }
        className={`group relative overflow-hidden
        rounded-[30px]
        border border-white/10
        bg-[#050B1D]
        shadow-[0_20px_60px_rgba(0,0,0,0.45)]
        ${theme.glow}
        cursor-pointer
        w-[520px]
        h-[400px]
        flex-shrink-0`}
      >

        {/* OUTER GRADIENT BORDER */}

        <div
          className={`absolute inset-0 rounded-[30px] p-[1.2px] bg-gradient-to-r ${theme.border}`}
        >
          <div className="w-full h-full rounded-[29px] bg-[#050B1D]" />
        </div>

        {/* SOFT GLOW */}

        <div
          className={`absolute -top-24 left-0 w-[200px] h-[200px]
          rounded-full blur-3xl opacity-20 bg-gradient-to-r ${theme.border}`}
        />

        {/* MENU */}

        <div className="absolute top-5 right-5 z-20">

          <button
            onClick={(e) => e.stopPropagation()}
            className="w-10 h-10 rounded-xl
            bg-white/[0.04]
            border border-white/10
            flex items-center justify-center"
          >

            <MoreVertical
              size={18}
              className="text-gray-300"
            />

          </button>

        </div>

        {/* MAIN CONTENT */}

        <div className="relative z-10 h-full p-7 flex flex-col justify-between">

          {/* ===================================================== */}
          {/* TOP */}
          {/* ===================================================== */}

          <div className="flex gap-5">

            {/* PROFILE */}

            <div className="relative shrink-0">

              <div
                className={`w-[96px] h-[96px] rounded-full p-[3px] bg-gradient-to-r ${theme.border}`}
              >

                <div className="w-full h-full rounded-full bg-[#071028] flex items-center justify-center overflow-hidden">

                  {teacher.profilePic ? (

                    <img
                      src={teacher.profilePic}
                      alt={teacher.name}
                      className="w-[88px] h-[88px] rounded-full object-cover"
                    />

                  ) : (

                    <div className="w-[88px] h-[88px] rounded-full bg-[#0C1735] flex items-center justify-center">

                      <span className="text-[36px] font-black text-white">
                        {initials}
                      </span>

                    </div>

                  )}

                </div>

              </div>

              {/* VERIFIED GOLD TICK */}

              <div className="absolute bottom-1 right-0 w-8 h-8 rounded-full bg-[#091224] border border-yellow-500/30 flex items-center justify-center shadow-lg">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#facc15"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>

              </div>

            </div>

            {/* INFO */}

            <div className="flex-1 min-w-0 pt-1">

              {/* NAME */}

              <h2 className="text-[22px] leading-[1.08] font-black text-white tracking-tight break-words">
                {teacher.name}
              </h2>

              {/* ROLE */}

              <div className="mt-3 flex items-center gap-2">

                <GraduationCap
                  size={16}
                  className="text-violet-400 shrink-0"
                />

                <span className="text-[15px] font-semibold text-white break-words">
                  {teacher.designation || "Professor"}
                </span>

              </div>

              {/* DECOR */}

              <div className="mt-4 flex items-center gap-3">

                <div className="w-16 h-[4px] rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />

                <div className="w-3 h-3 rounded-full bg-violet-500" />

              </div>

            </div>

          </div>

          {/* ===================================================== */}
          {/* INFO BOXES */}
          {/* ===================================================== */}

          <div className="grid grid-cols-2 gap-4 mt-4">

            {/* SPECIALIZATION */}

            <div
              className={`rounded-[22px] border px-4 py-4 ${theme.badge}`}
            >

              <div className="flex items-start gap-3">

                <BookOpen
                  size={18}
                  className="mt-1 shrink-0"
                />

                <div className="min-w-0">

                  <p className="text-[11px] text-gray-400">
                    Specialization
                  </p>

                  <h3 className="mt-1 text-[15px] font-bold leading-snug break-words">
                    {teacher.specialization || "Teaching"}
                  </h3>

                </div>

              </div>

            </div>

            {/* EXPERIENCE */}

            <div
              className={`rounded-[22px] border px-4 py-4 ${theme.exp}`}
            >

              <div className="flex items-start gap-3">

                <Stars
                  size={18}
                  className="mt-1 shrink-0"
                />

                <div>

                  <p className="text-[11px] text-gray-400">
                    Experience
                  </p>

                  <h3 className="mt-1 text-[18px] font-bold">
                    {teacher.experience || "5+ Years"}
                  </h3>

                </div>

              </div>

            </div>

          </div>

          {/* ===================================================== */}
          {/* BUTTONS */}
          {/* ===================================================== */}

          <div
            className="space-y-3 mt-4"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="grid grid-cols-2 gap-3">

              {/* MESSAGE */}

              <button
                onClick={() => navigate("/chat")}
                className={`h-[52px] rounded-[18px]
                bg-gradient-to-r ${theme.button}
                text-white font-bold text-[16px]
                flex items-center justify-center gap-2
                shadow-xl
                hover:scale-[1.01]
                transition-all duration-300`}
              >

                <MessageCircle size={19} />

                Message

              </button>

              {/* CONNECT */}

              <button
                className="h-[52px] rounded-[18px]
                bg-white/[0.04]
                border border-white/10
                hover:bg-white/[0.07]
                text-white font-bold text-[16px]
                flex items-center justify-center gap-2
                transition-all duration-300"
              >

                <UserPlus size={19} />

                Connect

              </button>

            </div>

            {/* REMOVE */}

            {user?.role === "admin" && (

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTeacher(teacher._id);
                }}
                className="w-full h-[50px] rounded-[18px]
                border border-red-500/20
                bg-red-500/10
                hover:bg-red-500/20
                text-red-400 font-bold text-[16px]
                flex items-center justify-center gap-2
                transition-all duration-300"
              >

                <Trash2 size={18} />

                Remove Teacher

              </button>

            )}

          </div>

        </div>

      </motion.div>

    );
  })}

</div>

    </div>
  );
};

export default Teachers;
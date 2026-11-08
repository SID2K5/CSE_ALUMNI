import { useState, useEffect } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

import { motion } from "framer-motion";

import {
  X,
  UploadCloud,
  Camera,
  Plus,
  Sparkles,
  Briefcase,
  GraduationCap,
  MapPin,
  User,
  Link2,
} from "lucide-react";

const EditProfileModal = ({ close }) => {
  const [form, setForm] = useState({
    name: "",
    bio: "",
    education: "",
    company: "",
    location: "",
    graduationYear: "",
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  const [portfolioLinks, setPortfolioLinks] = useState([]);
  const [linkInput, setLinkInput] = useState({
    label: "",
    url: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [resume, setResume] = useState(null);

  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔥 FETCH USER
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get("/users/me");

        setForm({
          name: data.name || "",
          bio: data.bio || "",
          education: data.education || "",
          company: data.company || "",
          location: data.location || "",
          graduationYear: data.graduationYear || "",
        });

        setSkills(data.skills || []);
        setPreview(data.profilePic);

        setPortfolioLinks(data.portfolioLinks || []);

      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
  }, []);

  // 🔥 INPUT CHANGE
  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 🔥 ADD SKILL
  const handleAddSkill = () => {
    if (!skillInput.trim()) return;

    if (!skills.includes(skillInput)) {
      setSkills((prev) => [...prev, skillInput]);
    }

    setSkillInput("");
  };

  // 🔥 REMOVE SKILL
  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  // 🔥 ADD PORTFOLIO
  const addLink = () => {
    if (!linkInput.url) return;

    setPortfolioLinks((prev) => [
      ...prev,
      linkInput,
    ]);

    setLinkInput({
      label: "",
      url: "",
    });
  };

  // 🔥 REMOVE PORTFOLIO
  const removeLink = (index) => {
    setPortfolioLinks(
      portfolioLinks.filter((_, i) => i !== index)
    );
  };

  // 🔥 RESUME DROP
  const handleDrop = (e) => {
    e.preventDefault();

    setDragActive(false);

    setResume(e.dataTransfer.files[0]);
  };

  // 🔥 SUBMIT
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const data = new FormData();

      Object.keys(form).forEach((k) =>
        data.append(k, form[k])
      );

      data.append(
        "skills",
        JSON.stringify(skills)
      );

      data.append(
        "portfolioLinks",
        JSON.stringify(portfolioLinks)
      );

      if (profileImage)
        data.append("image", profileImage);

      if (resume)
        data.append("resume", resume);

      await API.put("/users/profile", data);

      toast.success("Profile updated 🚀");

      close();

      window.location.reload();

    } catch (err) {
      console.log(err);

      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50
      bg-black/70 backdrop-blur-xl
      flex items-center justify-center
      p-4"
    >

      {/* MODAL */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.9,
          y: 40,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          duration: 0.3,
        }}
        className="w-full max-w-4xl
        rounded-[32px]
        overflow-hidden
        border border-white/10
        shadow-[0_0_80px_rgba(139,92,246,0.18)]"
      >

        {/* BACKGROUND */}
        <div
          className="relative
          bg-gradient-to-br
          from-[#07111f]
          via-[#0f172a]
          to-[#020617]
          p-8 md:p-10
          max-h-[92vh]
          overflow-y-auto"
        >

          {/* GLOW */}
          <div
            className="absolute top-0 left-0
            w-72 h-72 rounded-full
            bg-purple-500/10 blur-3xl"
          />

          {/* HEADER */}
          <div className="relative flex items-center justify-between mb-10">

            <div>

              <h2 className="text-4xl font-bold text-white">
                Edit Profile
              </h2>

              <p className="text-gray-400 mt-2">
                Customize your futuristic profile 🚀
              </p>

            </div>

            <button
              onClick={close}
              className="w-12 h-12 rounded-2xl
              bg-white/5 border border-white/10
              flex items-center justify-center
              hover:bg-red-500/20 transition"
            >
              <X className="text-white" />
            </button>

          </div>

          {/* PROFILE SECTION */}
          <div className="relative flex flex-col md:flex-row items-center gap-8 mb-10">

            {/* PROFILE IMAGE */}
            <div
              className="relative group cursor-pointer"
              onClick={() =>
                document
                  .getElementById("profileUpload")
                  .click()
              }
            >

              {/* GLOW */}
              <div
                className="absolute inset-0 rounded-full
                blur-2xl bg-cyan-400/30"
              />

              <img
                src={
                  preview ||
                  "https://via.placeholder.com/120"
                }
                className="relative w-32 h-32 rounded-full
                object-cover border-[5px]
                border-white shadow-2xl"
              />

              {/* OVERLAY */}
              <div
                className="absolute inset-0 rounded-full
                bg-black/50 opacity-0
                group-hover:opacity-100
                flex items-center justify-center
                transition"
              >
                <Camera className="text-white" />
              </div>

            </div>

            {/* INPUT */}
            <input
              id="profileUpload"
              type="file"
              hidden
              onChange={(e) => {
                setProfileImage(
                  e.target.files[0]
                );

                setPreview(
                  URL.createObjectURL(
                    e.target.files[0]
                  )
                );
              }}
            />

            {/* INFO */}
            <div className="space-y-3">

              <h3 className="text-2xl font-semibold text-white">
                Profile Photo
              </h3>

              <p className="text-gray-400">
                Upload a professional and clean photo
              </p>

              <button
                onClick={() =>
                  document
                    .getElementById("profileUpload")
                    .click()
                }
                className="px-5 py-3 rounded-2xl
                bg-gradient-to-r
                from-purple-500 to-cyan-400
                text-white font-medium
                hover:scale-105 transition"
              >
                Change Photo
              </button>

            </div>

          </div>

          {/* FORM GRID */}
          <div className="grid md:grid-cols-2 gap-5">

            {[
              {
                key: "name",
                icon: <User size={18} />,
                placeholder: "Full Name",
              },
              {
                key: "education",
                icon: <GraduationCap size={18} />,
                placeholder: "Education",
              },
              {
                key: "company",
                icon: <Briefcase size={18} />,
                placeholder: "Company",
              },
              {
                key: "location",
                icon: <MapPin size={18} />,
                placeholder: "Location",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="relative"
              >

                <div
                  className="absolute left-4 top-1/2
                  -translate-y-1/2 text-gray-400"
                >
                  {item.icon}
                </div>

                <input
                  value={form[item.key]}
                  placeholder={item.placeholder}
                  onChange={(e) =>
                    handleChange(
                      item.key,
                      e.target.value
                    )
                  }
                  className="w-full pl-12 pr-4 py-4
                  rounded-2xl
                  bg-white/5 border border-white/10
                  text-white
                  placeholder:text-gray-500
                  focus:border-cyan-400
                  focus:ring-2 focus:ring-cyan-400/20
                  outline-none transition"
                />

              </div>
            ))}

            {/* PASSOUT */}
            <div className="relative">

  <select
    value={form.graduationYear}
    onChange={(e) =>
      handleChange(
        "graduationYear",
        e.target.value
      )
    }
    className="
    w-full px-5 py-4
    rounded-2xl
    bg-[#111827]
    border border-white/10
    text-white
    appearance-none
    focus:border-cyan-400
    focus:ring-2 focus:ring-cyan-400/20
    outline-none
    transition
    cursor-pointer
    shadow-lg
    "
  >

    <option
      value=""
      className="bg-[#111827] text-gray-300"
    >
      Passout Year
    </option>

    {Array.from(
      { length: 15 },
      (_, i) => (
        <option
          key={i}
          value={2032 - i}
          className="bg-[#111827] text-white"
        >
          {2032 - i}
        </option>
      )
    )}

  </select>

  {/* CUSTOM ARROW */}
  <div
    className="absolute right-5 top-1/2
    -translate-y-1/2
    pointer-events-none
    text-gray-400"
  >
    ▼
  </div>

</div>

          </div>

          {/* BIO */}
          <div className="mt-6">

            <textarea
              value={form.bio}
              placeholder="Tell people about yourself..."
              onChange={(e) =>
                handleChange(
                  "bio",
                  e.target.value
                )
              }
              className="w-full min-h-[140px]
              p-5 rounded-3xl
              bg-white/5 border border-white/10
              text-white placeholder:text-gray-500
              focus:border-purple-400
              focus:ring-2 focus:ring-purple-400/20
              outline-none transition"
            />

          </div>

          {/* SKILLS */}
          <div className="mt-8">

            <div className="flex items-center gap-2 mb-4">

              <Sparkles className="text-purple-400" />

              <h3 className="text-xl font-semibold text-white">
                Skills
              </h3>

            </div>

            {/* INPUT */}
            <div className="flex gap-3">

              <input
                value={skillInput}
                onChange={(e) =>
                  setSkillInput(
                    e.target.value
                  )
                }
                placeholder="Add a skill..."
                className="flex-1 px-5 py-4 rounded-2xl
                bg-white/5 border border-white/10
                text-white outline-none"
              />

              <button
                onClick={handleAddSkill}
                className="px-5 rounded-2xl
                bg-gradient-to-r
                from-purple-500 to-cyan-400
                text-white hover:scale-105
                transition"
              >
                <Plus />
              </button>

            </div>

            {/* SKILL TAGS */}
            <div className="flex flex-wrap gap-3 mt-5">

              {skills.map((s, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  onClick={() =>
                    removeSkill(s)
                  }
                  className="px-5 py-2 rounded-2xl
                  bg-gradient-to-r
                  from-purple-500/20
                  to-cyan-400/20
                  border border-white/10
                  text-white cursor-pointer"
                >
                  {s} ✕
                </motion.div>
              ))}

            </div>

          </div>

          {/* PORTFOLIO */}
          <div className="mt-8">

            <div className="flex items-center gap-2 mb-4">

              <Link2 className="text-cyan-400" />

              <h3 className="text-xl font-semibold text-white">
                Portfolio Links
              </h3>

            </div>

            {/* INPUTS */}
            <div className="grid md:grid-cols-3 gap-3">

              <input
                placeholder="Label"
                value={linkInput.label}
                onChange={(e) =>
                  setLinkInput({
                    ...linkInput,
                    label:
                      e.target.value,
                  })
                }
                className="px-5 py-4 rounded-2xl
                bg-white/5 border border-white/10
                text-white outline-none"
              />

              <input
                placeholder="https://..."
                value={linkInput.url}
                onChange={(e) =>
                  setLinkInput({
                    ...linkInput,
                    url:
                      e.target.value,
                  })
                }
                className="px-5 py-4 rounded-2xl
                bg-white/5 border border-white/10
                text-white outline-none"
              />

              <button
                onClick={addLink}
                className="rounded-2xl
                bg-gradient-to-r
                from-purple-500 to-cyan-400
                text-white hover:scale-105
                transition"
              >
                Add Link
              </button>

            </div>

            {/* LINKS */}
            <div className="space-y-3 mt-5">

              {portfolioLinks.map((l, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between
                  p-4 rounded-2xl
                  bg-white/5 border border-white/10"
                >

                  <div>
                    <p className="text-white font-medium">
                      {l.label || "Portfolio"}
                    </p>

                    <p className="text-sm text-gray-400">
                      {l.url}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      removeLink(i)
                    }
                    className="text-red-400 hover:text-red-500"
                  >
                    ✕
                  </button>

                </div>
              ))}

            </div>

          </div>

          {/* RESUME */}
          <div className="mt-8">

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() =>
                setDragActive(false)
              }
              onDrop={handleDrop}
              onClick={() =>
                document
                  .getElementById(
                    "resumeUpload"
                  )
                  .click()
              }
              className={`p-8 rounded-[28px]
              border-2 border-dashed
              cursor-pointer transition
              ${
                dragActive
                  ? "border-cyan-400 bg-cyan-400/10"
                  : "border-white/10 bg-white/5"
              }`}
            >

              <div className="flex flex-col items-center gap-4">

                <UploadCloud className="text-cyan-400" />

                <div className="text-center">

                  <p className="text-white font-medium">
                    {resume
                      ? resume.name
                      : "Upload Resume"}
                  </p>

                  <p className="text-gray-400 text-sm mt-1">
                    Drag & drop or click to upload
                  </p>

                </div>

              </div>

              <input
                id="resumeUpload"
                type="file"
                hidden
                onChange={(e) =>
                  setResume(
                    e.target.files[0]
                  )
                }
              />

            </div>

          </div>

          {/* ACTIONS */}
          <div className="flex gap-4 mt-10">

            <button
              disabled={loading}
              onClick={handleSubmit}
              className="flex-1 py-4 rounded-2xl
              bg-gradient-to-r
              from-purple-500 to-cyan-400
              text-white font-semibold
              hover:scale-[1.02]
              transition shadow-xl"
            >
              {loading
                ? "Saving..."
                : "Save Changes"}
            </button>

            <button
              onClick={close}
              className="flex-1 py-4 rounded-2xl
              bg-white/5 border border-white/10
              text-white hover:bg-white/10
              transition"
            >
              Cancel
            </button>

          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default EditProfileModal;
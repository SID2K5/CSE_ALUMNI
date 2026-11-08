import { useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

import { motion, AnimatePresence } from "framer-motion";

import {
  CalendarDays,
  MapPin,
  UploadCloud,
  Sparkles,
  X,
  ChevronDown,
  Wand2,
  Clock3,
  Tag,
  ImageIcon,
} from "lucide-react";

const categories = [
  "General",
  "Hackathon",
  "Workshop",
  "Placement Drive",
  "Seminar",
  "Alumni Meet",
];

const CreateEventModal = ({
  close,
  refresh,
}) => {

  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    category: "General",
    autoDelete: false,
  });

  const [file, setFile] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [showCategory, setShowCategory] =
    useState(false);

  /* =====================================================
     SUBMIT
  ===================================================== */
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (
      !form.title ||
      !form.startDate ||
      !form.endDate ||
      !form.location
    ) {
      return toast.error(
        "Please fill all required fields"
      );
    }

    setLoading(true);

    try {

      const data = new FormData();

      Object.keys(form).forEach(
        (key) => {
          data.append(
            key,
            form[key]
          );
        }
      );

      if (file) {
        data.append(
          "poster",
          file
        );
      }

      await API.post(
        "/events",
        data,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      toast.success(
        "Event submitted 🚀"
      );

      close();

      refresh();

    } catch (err) {

      console.error(err);

      toast.error(
        err.response?.data
          ?.message ||
          "Failed to create event"
      );
    }

    setLoading(false);
  };

  return (

    <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-xl flex justify-center items-center p-4 overflow-y-auto">

      {/* =====================================================
          FLOATING GLOW EFFECTS
      ===================================================== */}

      <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 blur-[120px] rounded-full"></div>

      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/20 blur-[120px] rounded-full"></div>

      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 blur-[140px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.88,
          y: 60,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
          ease: "easeOut",
        }}
        className="relative w-full max-w-3xl"
      >

        {/* =====================================================
            MODAL
        ===================================================== */}

        <form
          onSubmit={handleSubmit}
          className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[#071028]/90 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,255,255,0.08)] max-h-[94vh] flex flex-col"
        >

          {/* =====================================================
              ANIMATED TOP BORDER
          ===================================================== */}

          <div className="h-[3px] w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-pulse"></div>

          {/* =====================================================
              HEADER
          ===================================================== */}

          <div className="sticky top-0 z-20 bg-[#071028]/90 backdrop-blur-xl border-b border-white/10 px-8 py-6 flex items-center justify-between">

            <div>

              <div className="flex items-center gap-3">

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">

                  <Sparkles
                    size={26}
                    className="text-white"
                  />

                </div>

                <div>

                  <h2 className="text-4xl font-black text-white tracking-tight">
                    Create Event
                  </h2>

                  <p className="text-gray-400 text-sm mt-1">
                    Build futuristic campus experiences
                  </p>

                </div>

              </div>

            </div>

            {/* CLOSE */}
            <button
              type="button"
              onClick={close}
              className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-red-500/20 border border-white/10 transition-all duration-300 flex items-center justify-center text-white hover:rotate-90"
            >
              <X size={20} />
            </button>

          </div>

          {/* =====================================================
              BODY
          ===================================================== */}

          <div className="overflow-y-auto px-8 py-8 space-y-7">

            {/* =====================================================
                TITLE
            ===================================================== */}

            <div className="space-y-2">

              <label className="text-sm font-semibold text-cyan-200">
                Event Title
              </label>

              <div className="relative group">

                <input
                  placeholder="Hackathon 2026"
                  className="w-full h-16 px-6 rounded-3xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 transition-all duration-300 focus:shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title:
                        e.target.value,
                    })
                  }
                />

                <div className="absolute inset-0 rounded-3xl border border-cyan-400/0 group-hover:border-cyan-400/20 pointer-events-none transition"></div>

              </div>

            </div>

            {/* =====================================================
                DATES
            ===================================================== */}

            <div className="grid md:grid-cols-2 gap-6">

              {/* START DATE */}
              <div className="space-y-2">

                <label className="text-sm font-semibold text-cyan-200">
                  Start Date
                </label>

                <div className="relative">

                  <CalendarDays
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-400"
                    size={20}
                  />

                  <input
                    type="date"
                    className="w-full h-16 pl-14 pr-5 rounded-3xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400 transition-all focus:shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        startDate:
                          e.target.value,
                      })
                    }
                  />

                </div>

              </div>

              {/* END DATE */}
              <div className="space-y-2">

                <label className="text-sm font-semibold text-pink-200">
                  End Date
                </label>

                <div className="relative">

                  <Clock3
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-400"
                    size={20}
                  />

                  <input
                    type="date"
                    className="w-full h-16 pl-14 pr-5 rounded-3xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-400 transition-all focus:shadow-[0_0_20px_rgba(236,72,153,0.2)]"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        endDate:
                          e.target.value,
                      })
                    }
                  />

                </div>

              </div>

            </div>

            {/* =====================================================
                LOCATION + CATEGORY
            ===================================================== */}

            <div className="grid md:grid-cols-2 gap-6">

              {/* LOCATION */}
              <div className="space-y-2">

                <label className="text-sm font-semibold text-pink-200">
                  Location
                </label>

                <div className="relative">

                  <MapPin
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-400"
                    size={20}
                  />

                  <input
                    placeholder="Bhubaneswar"
                    className="w-full h-16 pl-14 pr-5 rounded-3xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-pink-400 transition-all focus:shadow-[0_0_20px_rgba(236,72,153,0.2)]"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        location:
                          e.target.value,
                      })
                    }
                  />

                </div>

              </div>

              {/* CATEGORY */}
              <div className="space-y-2 relative">

                <label className="text-sm font-semibold text-yellow-200">
                  Category
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setShowCategory(
                      !showCategory
                    )
                  }
                  className="w-full h-16 px-5 rounded-3xl bg-white/5 border border-white/10 text-white flex items-center justify-between hover:border-yellow-400 transition-all"
                >

                  <div className="flex items-center gap-3">

                    <Tag
                      size={18}
                      className="text-yellow-400"
                    />

                    {form.category}

                  </div>

                  <ChevronDown
                    size={18}
                    className={`transition ${
                      showCategory
                        ? "rotate-180"
                        : ""
                    }`}
                  />

                </button>

                <AnimatePresence>

                  {showCategory && (

                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -10,
                      }}
                      className="absolute z-50 w-full mt-3 bg-[#0b1731] border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl"
                    >

                      {categories.map(
                        (cat) => (

                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setForm({
                                ...form,
                                category:
                                  cat,
                              });

                              setShowCategory(
                                false
                              );
                            }}
                            className="w-full px-6 py-4 text-left text-white hover:bg-cyan-500/10 transition"
                          >

                            {cat}

                          </button>

                        )
                      )}

                    </motion.div>

                  )}

                </AnimatePresence>

              </div>

            </div>

            {/* =====================================================
                DESCRIPTION
            ===================================================== */}

            <div className="space-y-2">

              <label className="text-sm font-semibold text-purple-200">
                Description
              </label>

              <textarea
                rows={6}
                placeholder="Describe your futuristic event..."
                className="w-full p-6 rounded-[28px] bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-400 transition-all resize-none focus:shadow-[0_0_25px_rgba(168,85,247,0.18)]"
                onChange={(e) =>
                  setForm({
                    ...form,
                    description:
                      e.target.value,
                  })
                }
              />

            </div>

            {/* =====================================================
                FILE UPLOAD
            ===================================================== */}

            <div className="space-y-3">

              <label className="text-sm font-semibold text-cyan-200">
                Event Poster
              </label>

              <label className="relative overflow-hidden border border-dashed border-cyan-400/20 hover:border-cyan-400 transition-all rounded-[30px] p-10 flex flex-col items-center justify-center cursor-pointer bg-gradient-to-br from-cyan-500/5 to-purple-500/5 group">

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 transition"></div>

                <div className="relative z-10 flex flex-col items-center">

                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center mb-4 shadow-xl shadow-cyan-500/20">

                    <UploadCloud
                      size={34}
                      className="text-white"
                    />

                  </div>

                  <span className="text-white font-bold text-lg">
                    Upload Event Poster
                  </span>

                  <span className="text-gray-400 text-sm mt-2">
                    PNG, JPG, PDF
                  </span>

                </div>

                <input
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    setFile(
                      e.target.files[0]
                    )
                  }
                />

              </label>

              {file && (

                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl px-5 py-4 flex items-center gap-3 text-cyan-300">

                  <ImageIcon size={18} />

                  {file.name}

                </div>

              )}

            </div>

            {/* =====================================================
                AUTO DELETE
            ===================================================== */}

            <label className="flex items-center justify-between bg-white/5 border border-white/10 p-5 rounded-[28px] text-gray-300">

              <div>

                <h4 className="font-semibold text-white">
                  Auto Remove Event
                </h4>

                <p className="text-sm text-gray-400 mt-1">
                  Automatically delete event after end date
                </p>

              </div>

              <div className="relative">

                <input
                  type="checkbox"
                  checked={
                    form.autoDelete
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      autoDelete:
                        e.target.checked,
                    })
                  }
                  className="w-6 h-6 accent-cyan-400"
                />

              </div>

            </label>

          </div>

          {/* =====================================================
              FOOTER
          ===================================================== */}

          <div className="sticky bottom-0 bg-[#071028]/90 backdrop-blur-xl border-t border-white/10 p-6 flex gap-4">

            <button
              type="button"
              onClick={close}
              className="flex-1 h-16 rounded-3xl border border-white/10 text-gray-300 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>

            <motion.button
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
              disabled={loading}
              className="flex-1 h-16 rounded-3xl bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-white font-black text-lg shadow-2xl shadow-cyan-500/20"
            >

              {loading
                ? "Submitting..."
                : "Submit Event 🚀"}

            </motion.button>

          </div>

        </form>

      </motion.div>

    </div>
  );
};

export default CreateEventModal;
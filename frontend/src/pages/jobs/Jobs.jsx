import { useEffect, useState, useRef, useMemo } from "react";
import API from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import CreateJobModal from "../../components/jobs/CreateJobModal";

import {
  Star,
  Bookmark,
  Briefcase,
  MapPin,
  BadgeCheck,
  GraduationCap,
  Search,
  SlidersHorizontal,
  Sparkles,
  ArrowUpRight,
  X,
  Trash2,
} from "lucide-react";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState([]);
  const [companyFilter, setCompanyFilter] = useState([]);

  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const [showLocation, setShowLocation] = useState(false);
  const [showCompany, setShowCompany] = useState(false);

  const locationRef = useRef();
  const companyRef = useRef();

  const user = JSON.parse(localStorage.getItem("user"));

  /* =====================================================
   ⭐ USER-SPECIFIC BOOKMARK STATE
===================================================== */

const userId = user?._id || "guest";

const storageKey = `savedJobs_${userId}`;

const [savedJobs, setSavedJobs] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem(storageKey)
    ) || [];
  } catch {
    return [];
  }
});

/* =====================================================
   ⭐ SAVE / UNSAVE JOB
===================================================== */

const toggleSave = (id) => {

  const stringId = String(id);

  setSavedJobs((prev) => {

    let updated;

    if (prev.includes(stringId)) {

      updated = prev.filter(
        (jobId) => jobId !== stringId
      );

    } else {

      updated = [...prev, stringId];

    }

    localStorage.setItem(
      storageKey,
      JSON.stringify(updated)
    );

    return updated;
  });
};

  /* =====================================================
     🗑 DELETE JOB
  ===================================================== */
  const removeJob = async (id) => {
    try {
      await API.delete(`/jobs/${id}`);

      setJobs((prev) =>
        prev.filter((job) => job._id !== id)
      );

      if (selectedJob?._id === id) {
        setSelectedJob(null);
      }

    } catch (error) {
      console.error("Delete Job Error:", error);
    }
  };

  /* =====================================================
     🔥 FETCH JOBS
  ===================================================== */
  const fetchJobs = async () => {
    try {
      setLoading(true);

      const { data } = await API.get("/jobs");

      setJobs(data);

    } catch (err) {
      console.error("Fetch Jobs Error:", err);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  /* =====================================================
     🔒 CLOSE DROPDOWNS
  ===================================================== */
  useEffect(() => {
    const handleClick = (e) => {

      if (
        locationRef.current &&
        !locationRef.current.contains(e.target)
      ) {
        setShowLocation(false);
      }

      if (
        companyRef.current &&
        !companyRef.current.contains(e.target)
      ) {
        setShowCompany(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () =>
      document.removeEventListener("mousedown", handleClick);

  }, []);

  /* =====================================================
     🎯 UNIQUE VALUES
  ===================================================== */
  const locations = [...new Set(jobs.map((j) => j.location))];
  const companies = [...new Set(jobs.map((j) => j.company))];

  /* =====================================================
     🔍 FILTER + SEARCH + SORT
  ===================================================== */
  useEffect(() => {
    let temp = jobs.filter((job) => {

      const typeMatch =
        typeFilter === "all" ||
        job.type === typeFilter;

      const locationMatch =
        locationFilter.length === 0 ||
        locationFilter.includes(job.location);

      const companyMatch =
        companyFilter.length === 0 ||
        companyFilter.includes(job.company);

      const searchMatch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase());

      return (
        typeMatch &&
        locationMatch &&
        companyMatch &&
        searchMatch
      );
    });

    /* ⭐ SAVED FIRST */
    temp.sort((a, b) => {
      const aSaved = savedJobs.includes(String(a._id));
      const bSaved = savedJobs.includes(String(b._id));

      return bSaved - aSaved;
    });

    /* ⭐ SAVED ONLY */
    if (showSavedOnly) {
      temp = temp.filter((job) =>
        savedJobs.includes(String(job._id))
      );
    }

    setFilteredJobs(temp);

  }, [
    jobs,
    typeFilter,
    locationFilter,
    companyFilter,
    savedJobs,
    showSavedOnly,
    search,
  ]);

  /* =====================================================
     🤖 RECOMMENDED
  ===================================================== */
  const recommended = useMemo(() => {
    return jobs.find(
      (j) =>
        j.title.toLowerCase().includes("engineer") ||
        j.title.toLowerCase().includes("developer")
    );
  }, [jobs]);

  /* =====================================================
     🔁 MULTI SELECT
  ===================================================== */
  const toggleSelect = (
    value,
    list,
    setList
  ) => {
    if (list.includes(value)) {
      setList(list.filter((v) => v !== value));
    } else {
      setList([...list, value]);
    }
  };

  /* =====================================================
     🚀 ROLE ACCESS
  ===================================================== */
  const canPostJob =
    user?.role === "alumni" ||
    user?.role === "teacher" ||
    user?.role === "admin";

  return (
    <div className="max-w-[1450px] mx-auto px-4 md:px-8 py-6 space-y-8">

      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-[#111827] via-[#0F172A] to-[#020617] p-8 shadow-2xl">

        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-400/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 blur-3xl rounded-full"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          {/* LEFT */}
          <div className="space-y-4 max-w-2xl">

            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm">
              <Sparkles size={15} />
              AI Curated Opportunities
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Discover your next
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {" "}career move
                </span>
              </h1>

              <p className="mt-3 text-gray-400 text-base md:text-lg">
                Premium opportunities shared by alumni, teachers &
                industry professionals.
              </p>
            </div>

            {/* SEARCH */}
            <div className="relative max-w-xl">

              <Search
                className="absolute left-4 top-4 text-gray-400"
                size={18}
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs, companies, skills..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4 items-start lg:items-end">

            {canPostJob && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold hover:scale-[1.03] transition shadow-xl"
              >
                + Post Opportunity
              </button>
            )}

            {/* STATS */}
            <div className="grid grid-cols-3 gap-3">

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[110px] backdrop-blur-xl">
                <div className="text-2xl font-bold text-white">
                  {jobs.length}
                </div>
                <div className="text-xs text-gray-400">
                  Jobs
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[110px] backdrop-blur-xl">
                <div className="text-2xl font-bold text-white">
                  {companies.length}
                </div>
                <div className="text-xs text-gray-400">
                  Companies
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[110px] backdrop-blur-xl">
                <div className="text-2xl font-bold text-white">
                  {savedJobs.length}
                </div>
                <div className="text-xs text-gray-400">
                  Saved
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}
      <div className="flex flex-wrap items-center gap-3">

        {/* TYPE */}
        {["all", "Full-time", "Internship"].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-5 py-2 rounded-2xl text-sm transition-all border ${
              typeFilter === t
                ? "bg-gradient-to-r from-purple-500 to-cyan-400 text-white border-transparent shadow-lg"
                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
            }`}
          >
            {t}
          </button>
        ))}

        {/* SAVED */}
        <button
          onClick={() =>
            setShowSavedOnly(!showSavedOnly)
          }
          className={`flex items-center gap-2 px-5 py-2 rounded-2xl border transition ${
            showSavedOnly
              ? "bg-yellow-400 text-black border-yellow-300"
              : "bg-white/5 border-white/10 text-gray-300"
          }`}
        >
          <Bookmark size={16} />
          Saved
        </button>

        {/* LOCATION */}
        <div
          className="relative"
          ref={locationRef}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowLocation((prev) => !prev);
              setShowCompany(false);
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-white/5 border border-white/10 text-gray-300"
          >
            <MapPin size={15} />
            Location
          </button>

          <AnimatePresence>
            {showLocation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute mt-3 w-56 bg-[#0F172A]/95 backdrop-blur-xl p-3 rounded-2xl z-50 border border-white/10 shadow-2xl"
              >
                {locations.map((loc) => (
                  <label
                    key={loc}
                    className="flex gap-2 text-sm py-2 text-gray-300"
                  >
                    <input
                      type="checkbox"
                      checked={locationFilter.includes(loc)}
                      onChange={() =>
                        toggleSelect(
                          loc,
                          locationFilter,
                          setLocationFilter
                        )
                      }
                    />
                    {loc}
                  </label>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* COMPANY */}
        <div
          className="relative"
          ref={companyRef}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCompany((prev) => !prev);
              setShowLocation(false);
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-white/5 border border-white/10 text-gray-300"
          >
            <Briefcase size={15} />
            Company
          </button>

          <AnimatePresence>
            {showCompany && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute mt-3 w-56 bg-[#0F172A]/95 backdrop-blur-xl p-3 rounded-2xl z-50 border border-white/10 shadow-2xl"
              >
                {companies.map((comp) => (
                  <label
                    key={comp}
                    className="flex gap-2 text-sm py-2 text-gray-300"
                  >
                    <input
                      type="checkbox"
                      checked={companyFilter.includes(comp)}
                      onChange={() =>
                        toggleSelect(
                          comp,
                          companyFilter,
                          setCompanyFilter
                        )
                      }
                    />
                    {comp}
                  </label>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* =====================================================
          RECOMMENDED CARD
      ===================================================== */}
      {recommended && (
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-cyan-400/10 backdrop-blur-xl p-6"
        >

          <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-400/10 blur-3xl rounded-full"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>
              <div className="text-cyan-400 text-sm mb-2">
                🚀 Recommended for you
              </div>

              <h2 className="text-2xl font-bold text-white">
                {recommended.title}
              </h2>

              <p className="text-gray-400 mt-1">
                {recommended.company} • {recommended.location}
              </p>
            </div>

            <button
              onClick={() => setSelectedJob(recommended)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-black font-semibold hover:scale-105 transition"
            >
              View Job
              <ArrowUpRight size={16} />
            </button>

          </div>

        </motion.div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}
      {loading && (
        <div className="text-center py-20 text-gray-500">
          Loading opportunities...
        </div>
      )}

      {/* =====================================================
          JOB GRID
      ===================================================== */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {filteredJobs.map((job) => (
            <motion.div
              key={job._id}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedJob(job)}
              className="group relative flex flex-col justify-between min-h-[320px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0F172A] to-[#111827] p-6 shadow-xl cursor-pointer"
            >

              {/* GLOW */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                <div className="absolute -top-20 right-0 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full"></div>
              </div>

              {/* SAVE + DELETE */}
              <div className="absolute top-5 right-5 z-10 flex items-center gap-3">

                <button
  onClick={(e) => {
    e.stopPropagation();
    toggleSave(job._id);
  }}
>
  <Star
    className={`transition-all duration-300 ${
      savedJobs.includes(String(job._id))
        ? "text-yellow-400 fill-yellow-400 scale-110"
        : "text-gray-500 hover:text-yellow-300 hover:scale-105"
    }`}
  />
</button>

                {(user?._id === job.postedBy?._id ||
                  user?.role === "admin") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeJob(job._id);
                    }}
                    className="text-red-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                )}

              </div>

              <div className="relative z-10 space-y-5">

                {/* TOP */}
                <div className="space-y-3">

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {job.title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">

                        <span className="flex items-center gap-1">
                          <Briefcase size={14} />
                          {job.company}
                        </span>

                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {job.location}
                        </span>

                      </div>
                    </div>

                  </div>

                  {/* BADGES */}
                  <div className="flex flex-wrap gap-2">

                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs border border-purple-500/20">
                      {job.type}
                    </span>

                    {job.postedBy?.role === "teacher" && (
                      <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs flex items-center gap-1 border border-blue-500/20">
                        <GraduationCap size={12} />
                        Teacher
                      </span>
                    )}

                    {job.postedBy?.role === "alumni" && (
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs flex items-center gap-1 border border-green-500/20">
                        <BadgeCheck size={12} />
                        Alumni
                      </span>
                    )}

                  </div>

                </div>

                {/* DESCRIPTION */}
                <p className="text-sm leading-relaxed line-clamp-4 text-gray-300">
                  {job.description}
                </p>

              </div>

              {/* ACTION */}
              <div className="relative z-10 mt-6">

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(job.applyLink, "_blank");
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold hover:opacity-90 transition"
                >
                  Apply Now 🚀
                </button>

              </div>

            </motion.div>
          ))}

        </div>
      )}

      {/* =====================================================
          JOB DETAILS MODAL
      ===================================================== */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0F172A] p-8 shadow-2xl"
            >

              {/* CLOSE */}
              <button
                onClick={() => setSelectedJob(null)}
                className="absolute top-5 right-5 text-gray-400 hover:text-white"
              >
                <X />
              </button>

              {/* DELETE IN MODAL */}
              {(user?._id === selectedJob.postedBy?._id ||
                user?.role === "admin") && (
                <button
                  onClick={() => removeJob(selectedJob._id)}
                  className="absolute top-5 right-16 text-red-400 hover:text-red-500 transition"
                >
                  <Trash2 size={20} />
                </button>
              )}

              {/* HEADER */}
              <div className="space-y-4">

                <div>
                  <h2 className="text-4xl font-bold text-white">
                    {selectedJob.title}
                  </h2>

                  <div className="flex flex-wrap gap-4 mt-3 text-gray-400">

                    <span>
                      🏢 {selectedJob.company}
                    </span>

                    <span>
                      📍 {selectedJob.location}
                    </span>

                    <span>
                      💼 {selectedJob.type}
                    </span>

                  </div>

                </div>

                {/* BADGES */}
                <div className="flex gap-3 flex-wrap">

                  {selectedJob.postedBy?.role === "teacher" && (
                    <span className="px-4 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm">
                      Teacher Posted
                    </span>
                  )}

                  {selectedJob.postedBy?.role === "alumni" && (
                    <span className="px-4 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">
                      Alumni Posted
                    </span>
                  )}

                </div>

              </div>

              {/* DESCRIPTION */}
              <div className="mt-8">

                <h3 className="text-lg font-semibold text-white mb-4">
                  About this role
                </h3>

                <p className="leading-relaxed whitespace-pre-line text-gray-300">
                  {selectedJob.description}
                </p>

              </div>

              {/* APPLY */}
              <button
                onClick={() =>
                  window.open(
                    selectedJob.applyLink,
                    "_blank"
                  )
                }
                className="mt-10 w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold text-lg"
              >
                Apply Now 🚀
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =====================================================
          CREATE JOB MODAL
      ===================================================== */}
      {showModal && (
        <CreateJobModal
          close={() => setShowModal(false)}
          refresh={fetchJobs}
        />
      )}
    </div>
  );
};

export default Jobs;
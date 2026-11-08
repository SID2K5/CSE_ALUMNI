import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import { motion } from "framer-motion";

import {
  MapPin,
  MessageCircle,
  BriefcaseBusiness,
  GraduationCap,
  ShieldCheck,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import ConnectionButton from "../../components/ConnectionButton";
import socket from "../../socket";
import { useNavigate } from "react-router-dom";

const Alumni = () => {
  const [allAlumni, setAllAlumni] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [search, setSearch] = useState("");

  // MULTI SELECT STATES
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

  // FILTER OPTIONS
  const [companies, setCompanies] = useState([]);
  const [years, setYears] = useState([]);
  const [locations, setLocations] = useState([]);

  const navigate = useNavigate();

  // ================= FETCH =================
  const fetchAlumni = async () => {
    const { data } = await API.get("/alumni");

    setAllAlumni(data);

    setCompanies([
      ...new Set(data.map((u) => u.company).filter(Boolean)),
    ]);

    setYears(
      [...new Set(data.map((u) => u.graduationYear).filter(Boolean))].sort(
        (a, b) => b - a
      )
    );

    setLocations([
      ...new Set(data.map((u) => u.location).filter(Boolean)),
    ]);
  };

  // ================= SOCKET =================
  useEffect(() => {
    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => socket.off("onlineUsers");
  }, []);

  useEffect(() => {
    fetchAlumni();
  }, []);

  // ================= MULTI FILTER LOGIC =================
  const alumni = useMemo(() => {
    return allAlumni.filter((u) => {
      const matchesSearch =
        !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.company?.toLowerCase().includes(search.toLowerCase());

      const matchesCompany =
        selectedCompanies.length === 0 ||
        selectedCompanies.includes(u.company);

      const matchesYear =
        selectedYears.length === 0 ||
        selectedYears.includes(String(u.graduationYear));

      const matchesLocation =
        selectedLocations.length === 0 ||
        selectedLocations.includes(u.location);

      return (
        matchesSearch &&
        matchesCompany &&
        matchesYear &&
        matchesLocation
      );
    });
  }, [
    allAlumni,
    search,
    selectedCompanies,
    selectedYears,
    selectedLocations,
  ]);

  // ================= TOGGLE HELPERS =================
  const toggleSelection = (value, state, setState) => {
    if (!value) return;

    if (state.includes(value)) {
      setState(state.filter((v) => v !== value));
    } else {
      setState([...state, value]);
    }
  };

  // ================= CHIP UI =================
  const FilterChips = ({ items, remove }) => (
    <div className="flex flex-wrap gap-2 mt-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="
            flex items-center gap-2
            px-3 py-1 rounded-full
            bg-cyan-500/10
            border border-cyan-400/20
            text-cyan-300 text-sm
          "
        >
          {item}

          <button onClick={() => remove(item)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative min-h-screen pb-10 overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[160px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[160px] rounded-full"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div>
            <h1
              className="
              text-4xl md:text-5xl
              font-black
              tracking-tight
              bg-gradient-to-r
              from-purple-400
              via-pink-400
              to-cyan-400
              bg-clip-text
              text-transparent
            "
            >
              Alumni Network
            </h1>

            <p className="text-gray-400 mt-2 text-sm md:text-base">
              Connect with alumni working across the globe 🌍
            </p>
          </div>

          {/* STATS */}
          <div className="flex gap-4">

            <div
              className="
              px-5 py-3 rounded-2xl
              bg-white/[0.04]
              backdrop-blur-xl
              border border-white/10
              min-w-[110px]
            "
            >
              <p className="text-2xl font-bold text-white">
                {alumni.length}
              </p>

              <p className="text-xs text-gray-400">
                Alumni
              </p>
            </div>

            <div
              className="
              px-5 py-3 rounded-2xl
              bg-white/[0.04]
              backdrop-blur-xl
              border border-white/10
              min-w-[110px]
            "
            >
              <p className="text-2xl font-bold text-green-400">
                {onlineUsers.length}
              </p>

              <p className="text-xs text-gray-400">
                Online
              </p>
            </div>

          </div>

        </div>

        {/* ================= FILTER BAR ================= */}
        <div
          className="
          p-5 rounded-[30px]
          bg-white/[0.04]
          backdrop-blur-2xl
          border border-white/10
        "
        >

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* SEARCH */}
            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-3.5 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search alumni..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-3 rounded-2xl
                  bg-[#0F172A]
                  border border-white/10
                  text-white
                  focus:outline-none
                  focus:ring-2 focus:ring-purple-500
                "
              />

            </div>

            {/* COMPANY */}
            <select
              onChange={(e) =>
                toggleSelection(
                  e.target.value,
                  selectedCompanies,
                  setSelectedCompanies
                )
              }
              className="
                px-4 py-3 rounded-2xl
                bg-[#0F172A]
                border border-white/10
                text-white
              "
            >
              <option value="">Select Company</option>

              {companies.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* LOCATION */}
            <select
              onChange={(e) =>
                toggleSelection(
                  e.target.value,
                  selectedLocations,
                  setSelectedLocations
                )
              }
              className="
                px-4 py-3 rounded-2xl
                bg-[#0F172A]
                border border-white/10
                text-white
              "
            >
              <option value="">Select Location</option>

              {locations.map((l, i) => (
                <option key={i} value={l}>
                  {l}
                </option>
              ))}
            </select>

            {/* YEAR */}
            <select
              onChange={(e) =>
                toggleSelection(
                  String(e.target.value),
                  selectedYears,
                  setSelectedYears
                )
              }
              className="
                px-4 py-3 rounded-2xl
                bg-[#0F172A]
                border border-white/10
                text-white
              "
            >
              <option value="">Select Year</option>

              {years.map((y, i) => (
                <option key={i} value={y}>
                  {y}
                </option>
              ))}
            </select>

          </div>

          {/* SELECTED FILTER CHIPS */}
          <FilterChips
            items={[
              ...selectedCompanies,
              ...selectedLocations,
              ...selectedYears,
            ]}
            remove={(value) => {
              setSelectedCompanies((prev) =>
                prev.filter((v) => v !== value)
              );

              setSelectedLocations((prev) =>
                prev.filter((v) => v !== value)
              );

              setSelectedYears((prev) =>
                prev.filter((v) => v !== value)
              );
            }}
          />

        </div>

        {/* ================= GRID ================= */}
        <div
          className="
          grid
          sm:grid-cols-2
          xl:grid-cols-3
          2xl:grid-cols-4
          gap-5
        "
        >

          {alumni.map((u) => (
            <motion.div
              key={u._id}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25 }}
              onClick={() => navigate(`/profile/${u._id}`)}
              className="
                relative overflow-hidden
                rounded-[32px]
                bg-[#081121]/95
                border border-white/10
                backdrop-blur-2xl
                shadow-[0_15px_40px_rgba(0,0,0,0.45)]
                p-5 group
                cursor-pointer
              "
            >

              {/* TOP */}
              <div className="flex items-start justify-between">

                <div className="flex gap-3 min-w-0">

                  <div className="relative shrink-0">

                    <div
                      className="
                      p-[2px]
                      rounded-2xl
                      bg-gradient-to-br
                      from-cyan-400
                      via-purple-500
                      to-pink-500
                    "
                    >

                      <img
                        src={
                          u.profilePic ||
                          "https://via.placeholder.com/100"
                        }
                        className="
                          w-14 h-14
                          rounded-2xl
                          object-cover
                          bg-[#081121]
                        "
                      />

                    </div>

                    {onlineUsers.includes(u._id) && (
                      <span
                        className="
                        absolute -bottom-1 -right-1
                        w-4 h-4 rounded-full
                        bg-green-500
                        border-2 border-[#081121]
                      "
                      ></span>
                    )}

                  </div>

                  <div className="min-w-0">

                    <div className="flex items-center gap-2">

                      <h3 className="text-lg font-bold text-white truncate">
                        {u.name}
                      </h3>

                      {u.isVerified && (
                        <ShieldCheck
                          size={16}
                          className="text-cyan-400"
                        />
                      )}

                    </div>

                    <p className="text-xs text-cyan-300/80 mt-1">
                      Verified Alumni
                    </p>

                    <div
                      className="
                      mt-3 flex items-center gap-2
                      text-sm text-gray-300
                    "
                    >
                      <BriefcaseBusiness
                        size={14}
                        className="text-purple-400"
                      />

                      <span className="truncate">
                        {u.company || "N/A"}
                      </span>
                    </div>

                  </div>

                </div>

                <div
                  className="
                  p-2 rounded-xl
                  bg-gradient-to-br
                  from-yellow-500/10
                  to-orange-500/10
                  border border-yellow-500/10
                  text-yellow-400
                "
                >
                  <Sparkles size={15} />
                </div>

              </div>

              {/* MIDDLE */}
              <div className="mt-5 grid grid-cols-2 gap-3">

                <div
                  className="
                  rounded-2xl
                  bg-white/[0.03]
                  border border-white/[0.06]
                  p-3
                "
                >

                  <div className="flex items-center gap-2">

                    <GraduationCap
                      size={14}
                      className="text-cyan-400"
                    />

                    <p className="text-[11px] text-gray-500">
                      Graduation
                    </p>

                  </div>

                  <p className="mt-2 text-sm font-semibold text-white">
                    {u.graduationYear || "N/A"}
                  </p>

                </div>

                <div
                  className="
                  rounded-2xl
                  bg-white/[0.03]
                  border border-white/[0.06]
                  p-3
                "
                >

                  <div className="flex items-center gap-2">

                    <MapPin
                      size={14}
                      className="text-pink-400"
                    />

                    <p className="text-[11px] text-gray-500">
                      Location
                    </p>

                  </div>

                  <p className="mt-2 text-sm font-semibold text-white truncate">
                    {u.location || "N/A"}
                  </p>

                </div>

              </div>

              {/* ACTIONS */}
              <div className="mt-5 flex gap-3">

                <div
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ConnectionButton userId={u._id} />
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/chat?userId=${u._id}`);
                  }}
                  className="
                    w-12 h-12 rounded-2xl
                    bg-white/[0.04]
                    border border-white/[0.08]
                    hover:border-cyan-400/40
                    transition-all
                    flex items-center justify-center
                    text-white
                  "
                >
                  <MessageCircle size={18} />
                </button>

              </div>

            </motion.div>
          ))}

        </div>

      </div>

    </div>
  );
};

export default Alumni;
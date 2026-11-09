import { avatarUrl } from "../../utils/avatar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../../services/api";

import { motion } from "framer-motion";

import Select from "react-select";

import {
  Users,
  Building2,
  MapPin,
  GraduationCap,
  MessageCircle,
  CheckCircle2,
  UserMinus,
} from "lucide-react";

/* =====================================================
   🎨 PREMIUM SELECT STYLES
===================================================== */

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    background: "#0F172A",
    border: state.isFocused
      ? "1px solid #8B5CF6"
      : "1px solid rgba(255,255,255,0.08)",

    borderRadius: "14px",
    minHeight: "52px",

    padding: "2px 6px",

    boxShadow: state.isFocused
      ? "0 0 0 3px rgba(139,92,246,0.15)"
      : "none",

    transition: "all 0.25s ease",

    "&:hover": {
      border: "1px solid #8B5CF6",
    },
  }),

  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),

  menu: (base) => ({
    ...base,
    background: "#0F172A",
    borderRadius: "16px",
    overflow: "hidden",
    padding: "6px",
    border: "1px solid rgba(255,255,255,0.08)",
  }),

  option: (base, state) => ({
    ...base,
    background: state.isFocused
      ? "linear-gradient(to right,#8B5CF6,#06B6D4)"
      : "#0F172A",

    color: "white",

    borderRadius: "10px",

    marginBottom: "3px",

    cursor: "pointer",

    transition: "0.2s",
  }),

  multiValue: (base) => ({
    ...base,
    background:
      "linear-gradient(to right,#8B5CF6,#06B6D4)",

    borderRadius: "10px",

    padding: "2px 4px",
  }),

  multiValueLabel: (base) => ({
    ...base,
    color: "white",
    fontWeight: "600",
    fontSize: "13px",
  }),

  multiValueRemove: (base) => ({
    ...base,
    color: "white",

    ":hover": {
      backgroundColor: "transparent",
      color: "#ffb4b4",
    },
  }),

  placeholder: (base) => ({
    ...base,
    color: "#94A3B8",
    fontWeight: "500",
    fontSize: "14px",
  }),

  input: (base) => ({
    ...base,
    color: "white",
  }),

  singleValue: (base) => ({
    ...base,
    color: "white",
  }),
};

const Connections = () => {

  const navigate = useNavigate();

  const [connections, setConnections] = useState([]);

  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    companies: [],
    locations: [],
    years: [],
  });

  const [filterOptions, setFilterOptions] =
    useState({
      companies: [],
      locations: [],
      years: [],
    });

  /* =====================================================
     🚀 FETCH CONNECTIONS
  ===================================================== */

  const fetchConnections = async () => {
    try {

      setLoading(true);

      const query = new URLSearchParams({
        company: filters.companies.join(","),
        location: filters.locations.join(","),
        year: filters.years.join(","),
      }).toString();

      const { data } = await API.get(
        `/connections?${query}`
      );

      setConnections(data);

      const req = await API.get(
        "/connections/pending"
      );

      setRequests(req.data);

      const options = await API.get(
        "/connections/filter-options"
      );

      setFilterOptions(options.data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  };

  /* =====================================================
     💬 OPEN CHAT
  ===================================================== */

  const openChat = async (userId) => {
    try {

      const { data } = await API.get(
        `/chat/conversation/${userId}`
      );

      navigate(`/chat/${data._id}`);

    } catch (error) {
      console.error(error);
    }
  };

  /* =====================================================
     🤝 RESPOND REQUEST
  ===================================================== */

  const respondRequest = async (
    id,
    status
  ) => {
    try {

      await API.put(
        `/connections/respond/${id}`,
        { status }
      );

      fetchConnections();

    } catch (error) {
      console.error(error);
    }
  };

  /* =====================================================
     ❌ REMOVE CONNECTION
  ===================================================== */

  const removeConnection = async (id) => {
    try {

      const confirmRemove = window.confirm(
        "Are you sure you want to remove this connection?"
      );

      if (!confirmRemove) return;

      await API.delete(
        `/connections/remove/${id}`
      );

      setConnections((prev) =>
        prev.filter((u) => u._id !== id)
      );

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [filters]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-5 pb-16 space-y-6">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex items-center gap-4">

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center shadow-xl">

          <Users size={26} className="text-white" />

        </div>

        <div>

          <h1 className="text-4xl font-extrabold gradient-text">
            Connections
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            Build and manage your network
          </p>

        </div>

      </div>

      {/* ================================================= */}
      {/* REQUESTS */}
      {/* ================================================= */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[26px] border border-white/10 bg-[#081028] p-6 shadow-xl overflow-visible"
      >

        <div className="flex items-center justify-between mb-5">

          <div>

            <h2 className="text-2xl font-bold text-white">
              Pending Requests
            </h2>

            <p className="text-gray-400 text-sm mt-1">
              People who want to connect with you
            </p>

          </div>

          <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-brand/20 text-accent font-semibold text-sm">

            {requests.length} Requests

          </div>

        </div>

        {requests.length === 0 ? (

          <div className="text-center py-10 text-gray-400">
            No pending requests
          </div>

        ) : (

          <div className="grid md:grid-cols-2 gap-4">

            {requests.map((r) => (

              <div
                key={r._id}
                className="rounded-2xl bg-[#0F172A] border border-white/5 p-4 flex justify-between items-center"
              >

                <div className="flex items-center gap-3">

                  <img
                    src={
                      r.sender.profilePic ||
                      avatarUrl(r.sender, 80)
                    }
                    alt=""
                    className="w-14 h-14 rounded-full object-cover border-2 border-info"
                  />

                  <div>

                    <h3 className="text-lg font-bold text-white">
                      {r.sender.name}
                    </h3>

                    <p className="text-gray-400 text-sm">
                      {r.sender.company ||
                        "No company"}
                    </p>

                  </div>

                </div>

                <div className="flex gap-2">

                  <button
                    onClick={() =>
                      respondRequest(
                        r._id,
                        "accepted"
                      )
                    }
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white text-sm font-semibold hover:scale-105 transition"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() =>
                      respondRequest(
                        r._id,
                        "rejected"
                      )
                    }
                    className="px-4 py-2 rounded-xl bg-danger text-white text-sm hover:scale-105 transition"
                  >
                    Reject
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </motion.div>

      {/* ================================================= */}
      {/* FILTERS */}
      {/* ================================================= */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-[26px] border border-white/10 bg-[#081028] p-6 shadow-xl overflow-visible"
      >

        <div className="mb-5">

          <h2 className="text-2xl font-bold text-white">
            Smart Filters
          </h2>

          <p className="text-gray-400 text-sm mt-1">
            Find people quickly using advanced filters
          </p>

        </div>

        <div className="grid lg:grid-cols-3 gap-4 overflow-visible">

          {/* COMPANY */}
          <Select
            isMulti
            styles={customSelectStyles}
            options={filterOptions.companies.map(
              (c) => ({
                value: c,
                label: c,
              })
            )}
            placeholder="🏢 Companies"
            menuPortalTarget={document.body}
            menuPosition="fixed"
            onChange={(selected) =>
              setFilters({
                ...filters,
                companies:
                  selected?.map(
                    (s) => s.value
                  ) || [],
              })
            }
          />

          {/* LOCATION */}
          <Select
            isMulti
            styles={customSelectStyles}
            options={filterOptions.locations.map(
              (c) => ({
                value: c,
                label: c,
              })
            )}
            placeholder="📍 Locations"
            menuPortalTarget={document.body}
            menuPosition="fixed"
            onChange={(selected) =>
              setFilters({
                ...filters,
                locations:
                  selected?.map(
                    (s) => s.value
                  ) || [],
              })
            }
          />

          {/* YEAR */}
          <Select
            isMulti
            styles={customSelectStyles}
            options={filterOptions.years.map(
              (c) => ({
                value: c,
                label: c,
              })
            )}
            placeholder="🎓 Passout Year"
            menuPortalTarget={document.body}
            menuPosition="fixed"
            onChange={(selected) =>
              setFilters({
                ...filters,
                years:
                  selected?.map(
                    (s) => s.value
                  ) || [],
              })
            }
          />

        </div>

      </motion.div>

      {/* ================================================= */}
      {/* CONNECTIONS GRID */}
      {/* ================================================= */}

      {loading ? (

        <div className="text-center py-16 text-gray-400">
          Loading connections...
        </div>

      ) : connections.length === 0 ? (

        <div className="rounded-[26px] border border-white/10 bg-[#081028] p-10 text-center text-gray-400">
          No connections found
        </div>

      ) : (

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">

          {connections.map((u) => (

            <motion.div
              key={u._id}
              whileHover={{
                y: -5,
                scale: 1.015,
              }}
              onClick={() => navigate(`/profile/${u._id}`)}
              className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[#0B1220] p-6 shadow-xl group cursor-pointer"
            >

              {/* GLOW */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-brand/20 blur-3xl rounded-full opacity-60 group-hover:opacity-100 transition" />

              {/* PROFILE */}
              <div className="relative flex items-center gap-4 mb-6">

                <img
                  src={
                    u.profilePic ||
                    avatarUrl(u, 100)
                  }
                  alt=""
                  className="w-20 h-20 rounded-full object-cover border-4 border-info"
                />

                <div>

                  <div className="flex items-center gap-2">

                    <h3 className="text-2xl font-bold text-white leading-tight">
                      {u.name}
                    </h3>

                    {u.isVerified && (
                      <CheckCircle2
                        size={18}
                        className="text-accent"
                      />
                    )}

                  </div>

                  <p className="text-info capitalize font-medium text-sm mt-1">
                    {u.role}
                  </p>

                </div>

              </div>

              {/* DETAILS */}
              <div className="space-y-4 text-gray-300">

                <div className="flex items-center gap-3 text-base">

                  <Building2 size={17} />

                  <span>
                    {u.company ||
                      "No company"}
                  </span>

                </div>

                <div className="flex items-center gap-3 text-base">

                  <MapPin size={17} />

                  <span>
                    {u.location ||
                      "Unknown"}
                  </span>

                </div>

                <div className="flex items-center gap-3 text-base">

                  <GraduationCap size={17} />

                  <span>
                    {u.graduationYear ||
                      "N/A"}
                  </span>

                </div>

              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-7 grid grid-cols-2 gap-3">

                {/* MESSAGE */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openChat(u._id);
                  }}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold hover:scale-[1.02] transition-all duration-300"
                >

                  <MessageCircle size={18} />

                  Message

                </button>

                {/* REMOVE */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeConnection(u._id);
                  }}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-danger/90 hover:bg-danger text-white font-semibold hover:scale-[1.02] transition-all duration-300"
                >

                  <UserMinus size={18} />

                  Remove

                </button>

              </div>

            </motion.div>
          ))}

        </div>

      )}

    </div>
  );
};

export default Connections;
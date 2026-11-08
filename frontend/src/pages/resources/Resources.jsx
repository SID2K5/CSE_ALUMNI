import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UploadResource from "../../components/resources/UploadResource";
import API from "../../services/api";

const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

const Resources = () => {
  const [type, setType] = useState("notes"); // ✅ default
  const [counts, setCounts] = useState({});

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  /* ================= FETCH COUNTS ================= */
  const fetchCounts = async () => {
    try {
      const { data } = await API.get("/resources");

      const map = {};

      data.forEach((r) => {
        if (type && r.type !== type) return;
        map[r.semester] = (map[r.semester] || 0) + 1;
      });

      setCounts(map);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [type]);

  /* ================= NAVIGATION ================= */
  const buildQuery = () => {
    const params = new URLSearchParams();

    if (type) params.append("type", type);

    return params.toString();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 px-3 md:px-0">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Resources Hub 📂
        </h1>
      </div>

      {/* ADMIN */}
      {user?.role === "admin" && <UploadResource />}

      {/* FILTER */}
      <div className="flex gap-3 flex-wrap">

        <button
          onClick={() => setType("notes")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            type === "notes"
              ? "bg-gradient-to-r from-purple-500 to-cyan-400 text-white shadow-md"
              : "bg-[#0f172a] text-gray-300 hover:bg-gray-800"
          }`}
        >
          NOTES
        </button>

        <button
          onClick={() => setType("pyq")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            type === "pyq"
              ? "bg-gradient-to-r from-purple-500 to-cyan-400 text-white shadow-md"
              : "bg-[#0f172a] text-gray-300 hover:bg-gray-800"
          }`}
        >
          PYQ
        </button>

      </div>

      {/* 📂 FOLDERS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        {semesters.map((id) => {
          const fileCount = counts[id] || 0;

          return (
            <motion.div
              key={id}
              whileHover={{ y: -5, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                navigate(`/resources/${id}?${buildQuery()}`)
              }
              className="
                group relative cursor-pointer rounded-xl p-5
                bg-[#0f172a] border border-gray-700
                hover:border-purple-500
                transition-all duration-300
              "
            >

              {/* ICON + TITLE */}
              <div className="flex items-center gap-3 mb-2">

                <Folder
                  size={28}
                  className={`transition ${
                    fileCount === 0
                      ? "text-gray-500"
                      : "text-yellow-400 group-hover:text-yellow-300"
                  }`}
                />

                <span className="font-semibold text-white text-sm tracking-wide">
                  Semester {id}
                </span>
              </div>

              {/* FILE COUNT */}
              <p className="text-xs text-gray-400">
                {fileCount === 0
                  ? "Empty folder"
                  : `${fileCount} file${fileCount > 1 ? "s" : ""}`}
              </p>

              {/* GLOW */}
              <div className="
                absolute inset-0 rounded-xl opacity-0
                group-hover:opacity-10
                bg-gradient-to-r from-purple-500 to-cyan-400
                blur-xl transition pointer-events-none
              " />

            </motion.div>
          );
        })}

      </div>

      {/* FOOTER */}
      <div className="text-center text-gray-500 text-sm py-6">
        📂 Click a folder to open
      </div>

    </div>
  );
};

export default Resources;
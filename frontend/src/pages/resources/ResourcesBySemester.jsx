import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import API from "../../services/api";

import {
  Download,
  Eye,
  Bookmark,
  Trash2,
  FileText,
  Search,
  BadgeCheck,
} from "lucide-react";

import PDFViewer from "../../components/resources/PDFViewer";

const ResourcesBySemester = () => {
  const { semester } = useParams();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type");

  const [resources, setResources] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [search, setSearch] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  /* ================= FETCH ================= */

  const fetchResources = async () => {
    try {
      const url = type
        ? `/resources?semester=${semester}&type=${type}`
        : `/resources?semester=${semester}`;

      const { data } = await API.get(url);

      setResources(data);

    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const { data } = await API.get("/bookmarks");

      setBookmarks(data.map((b) => b._id));

    } catch (err) {
      console.error("Bookmark error:", err);
    }
  };

  useEffect(() => {
    fetchResources();
    fetchBookmarks();
  }, [semester, type]);

  /* ================= SEARCH ================= */

  const filteredResources = resources.filter((r) => {
    const text =
      `
        ${r.title}
        ${r.description}
        ${r.subject || ""}
        ${(r.tags || []).join(" ")}
      `
        .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  /* ================= DOWNLOAD ================= */

  const handleDownload = async (resource) => {
    try {
      const response = await fetch(resource.fileUrl);

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const fileName = (resource.title || "file")
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "_") + ".pdf";

      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  /* ================= PREVIEW ================= */

  const handlePreview = (url) => {
    setPreviewFile(url);
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    try {
      await API.delete(`/resources/${id}`);

      fetchResources();

    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  /* ================= BOOKMARK ================= */

  const toggleBookmark = async (id) => {
    try {
      await API.put(`/bookmarks/${id}`);

      fetchBookmarks();

    } catch (err) {
      console.error("Bookmark toggle error:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-3 md:px-0">

      {/* HEADER */}
      <div className="space-y-2">

        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          Semester {semester}{" "}
          {type ? `(${type.toUpperCase()})` : ""} Resources 📂
        </h1>

        <p className="text-gray-400 text-sm">
          Discover curated academic materials uploaded by teachers and admins.
        </p>

      </div>

      {/* SEARCH */}
      <div className="relative">

        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search by title, subject or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full pl-10 pr-4 py-3
            rounded-xl
            bg-[#0f172a]
            border border-gray-700
            text-white
            focus:ring-2 focus:ring-purple-500
            outline-none
          "
        />

      </div>

      {/* EMPTY */}
      {filteredResources.length === 0 ? (

        <p className="text-center text-gray-400 py-10">
          🔍 No matching resources found
        </p>

      ) : (

        <div className="grid gap-5">

          {filteredResources.map((r) => (

            <div
              key={r._id}
              className="
                group relative
                rounded-3xl
                border border-gray-800
                bg-gradient-to-br from-[#0f172a] to-[#020617]
                p-5
                overflow-hidden
                shadow-[0_10px_30px_rgba(0,0,0,0.45)]
                hover:border-purple-500/50
                hover:shadow-[0_20px_50px_rgba(139,92,246,0.20)]
                hover:-translate-y-1
                transition-all duration-300
              "
            >

              {/* TOP */}
              <div className="flex justify-between gap-4">

                {/* LEFT CONTENT */}
                <div className="flex gap-4 flex-1">

                  {/* ICON */}
                  <div className="
                    h-fit p-3 rounded-2xl
                    bg-gradient-to-br
                    from-purple-500/20
                    to-cyan-400/20
                    border border-purple-500/20
                  ">
                    <FileText
                      className="text-purple-400"
                      size={24}
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="space-y-3 flex-1">

                    {/* TITLE */}
                    <div>

                      <h3 className="text-lg font-semibold text-white">
                        {r.title}
                      </h3>

                      <p className="text-sm text-gray-400 mt-1">
                        {r.description}
                      </p>

                    </div>

                    {/* SUBJECT + TAGS */}
                    <div className="flex flex-wrap gap-2">

                      {r.subject && (
                        <span className="
                          px-3 py-1 rounded-full text-xs
                          bg-purple-500/20
                          text-purple-300
                          border border-purple-500/20
                        ">
                          📘 {r.subject}
                        </span>
                      )}

                      {r.tags?.map((tag, idx) => (
                        <span
                          key={idx}
                          className="
                            px-3 py-1 rounded-full text-xs
                            bg-cyan-500/10
                            text-cyan-300
                            border border-cyan-500/20
                          "
                        >
                          #{tag}
                        </span>
                      ))}

                    </div>

                    {/* UPLOADER */}
                    <div className="flex items-center gap-3 pt-1">

                      <img
                        src={
                          r.uploadedBy?.profilePic ||
                          "https://ui-avatars.com/api/?name=User"
                        }
                        alt="uploader"
                        className="
                          w-9 h-9 rounded-full
                          object-cover border border-gray-700
                        "
                      />

                      <div>

                        <div className="flex items-center gap-1">

                          <p className="text-sm font-medium text-white">
                            {r.uploadedBy?.name || "Unknown"}
                          </p>

                          {(r.uploadedBy?.role === "teacher" ||
                            r.uploadedBy?.role === "admin") && (
                            <BadgeCheck
                              size={15}
                              className="text-blue-400"
                            />
                          )}

                        </div>

                        <p className="text-xs text-gray-500 capitalize">
                          {r.uploadedBy?.designation ||
                            r.uploadedBy?.role}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 items-start">

                  <button
                    onClick={() => handlePreview(r.fileUrl)}
                    className="
                      p-2 rounded-xl
                      bg-gray-800/70
                      hover:bg-gray-700
                      hover:scale-110
                      transition-all
                    "
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    onClick={() => toggleBookmark(r._id)}
                    className={`
                      p-2 rounded-xl transition-all
                      ${
                        bookmarks.includes(r._id)
                          ? "bg-yellow-400 text-black shadow-lg"
                          : "bg-gray-800/70 hover:bg-gray-700"
                      }
                    `}
                  >
                    <Bookmark size={18} />
                  </button>

                  <button
                    onClick={() => handleDownload(r)}
                    className="
                      p-2 rounded-xl text-white
                      bg-gradient-to-r from-purple-500 to-cyan-400
                      hover:scale-110
                      transition-all
                    "
                  >
                    <Download size={18} />
                  </button>

                  {(user?.role === "admin" ||
                    user?._id === r.uploadedBy?._id) && (
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="
                        p-2 rounded-xl
                        bg-red-500/10
                        text-red-400
                        hover:bg-red-500/20
                        hover:scale-110
                        transition-all
                      "
                    >
                      <Trash2 size={18} />
                    </button>
                  )}

                </div>

              </div>

              {/* GLOW */}
              <div className="
                absolute inset-0 rounded-3xl opacity-0
                group-hover:opacity-10
                bg-gradient-to-r from-purple-500 to-cyan-400
                blur-xl transition pointer-events-none
              " />

            </div>

          ))}

        </div>

      )}

      {/* PDF VIEW */}
      {previewFile && (
        <PDFViewer
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

    </div>
  );
};

export default ResourcesBySemester;
import { useEffect, useState } from "react";
import API from "../../services/api";

import {
  Upload,
  Trash2,
  FileText,
  FolderOpen,
  BookOpen,
  Eye,
  Search,
  Plus,
} from "lucide-react";

import { motion } from "framer-motion";
import toast from "react-hot-toast";

import PDFViewer from "../../components/resources/PDFViewer";

const TeacherDashboard = () => {
  const [resources, setResources] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);

  const [activeTab, setActiveTab] = useState("upload");

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    semester: "",
    type: "notes",
    subject: "",
    tags: "",
    file: null,
  });

  /* ================= FETCH RESOURCES ================= */

  const fetchResources = async () => {
    try {
      const { data } = await API.get("/resources/my");

      setResources(data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  /* ================= FILTERED RESOURCES ================= */

  const filteredResources = resources.filter((r) => {
    const text = `
      ${r.title}
      ${r.description}
      ${r.subject || ""}
      ${(r.tags || []).join(" ")}
    `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  /* ================= UPLOAD RESOURCE ================= */

  const uploadResource = async () => {
    try {
      if (
        !form.title ||
        !form.semester ||
        !form.subject ||
        !form.file
      ) {
        return toast.error("Please fill all required fields");
      }

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("semester", form.semester);
      formData.append("type", form.type);

      formData.append("subject", form.subject);
      formData.append("tags", form.tags);

      formData.append("file", form.file);

      await API.post("/resources", formData);

      toast.success("Resource uploaded successfully 🚀");

      fetchResources();

      setForm({
        title: "",
        description: "",
        semester: "",
        type: "notes",
        subject: "",
        tags: "",
        file: null,
      });

      setActiveTab("resources");

    } catch (error) {
      console.log(error);
      toast.error("Upload failed");
    }
  };

  /* ================= DELETE ================= */

  const deleteResource = async (id) => {
    try {
      await API.delete(`/resources/${id}`);

      toast.success("Resource deleted");

      fetchResources();

    } catch (error) {
      console.log(error);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-3 md:px-0">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

        <div>

          <h1 className="text-4xl md:text-5xl font-bold gradient-text">
            Teacher Dashboard 👨‍🏫
          </h1>

          <p className="text-gray-400 mt-2">
            Manage and organize your academic resources professionally.
          </p>

        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 gap-4">

          <div className="
            glass px-6 py-4 rounded-2xl
            border border-purple-500/20
            min-w-[170px]
          ">

            <div className="flex items-center gap-3">

              <div className="
                p-3 rounded-xl
                bg-purple-500/20
              ">
                <FolderOpen className="text-purple-400" />
              </div>

              <div>

                <p className="text-sm text-gray-400">
                  Total Resources
                </p>

                <h2 className="text-3xl font-bold text-white">
                  {resources.length}
                </h2>

              </div>

            </div>

          </div>

          <div className="
            glass px-6 py-4 rounded-2xl
            border border-cyan-500/20
            min-w-[170px]
          ">

            <div className="flex items-center gap-3">

              <div className="
                p-3 rounded-xl
                bg-cyan-500/20
              ">
                <BookOpen className="text-cyan-400" />
              </div>

              <div>

                <p className="text-sm text-gray-400">
                  Notes Uploaded
                </p>

                <h2 className="text-3xl font-bold text-white">
                  {
                    resources.filter(
                      (r) => r.type === "notes"
                    ).length
                  }
                </h2>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ================= TABS ================= */}

      <div className="flex gap-4 flex-wrap">

        <button
          onClick={() => setActiveTab("upload")}
          className={`
            px-5 py-3 rounded-xl font-medium transition-all
            ${
              activeTab === "upload"
                ? "bg-gradient-to-r from-purple-500 to-cyan-400 text-white shadow-lg"
                : "bg-[#0f172a] text-gray-300 border border-gray-700"
            }
          `}
        >
          <div className="flex items-center gap-2">
            <Plus size={18} />
            Upload Resource
          </div>
        </button>

        <button
          onClick={() => setActiveTab("resources")}
          className={`
            px-5 py-3 rounded-xl font-medium transition-all
            ${
              activeTab === "resources"
                ? "bg-gradient-to-r from-purple-500 to-cyan-400 text-white shadow-lg"
                : "bg-[#0f172a] text-gray-300 border border-gray-700"
            }
          `}
        >
          <div className="flex items-center gap-2">
            <FolderOpen size={18} />
            My Resources
          </div>
        </button>

      </div>

      {/* ================= UPLOAD TAB ================= */}

      {activeTab === "upload" && (

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            glass p-7 rounded-3xl
            border border-gray-800
            space-y-6
          "
        >

          <div className="flex items-center gap-3">

            <div className="
              p-3 rounded-2xl
              bg-gradient-to-r from-purple-500/20 to-cyan-400/20
            ">
              <Upload className="text-purple-400" />
            </div>

            <div>

              <h2 className="text-2xl font-bold text-white">
                Upload Academic Resource
              </h2>

              <p className="text-sm text-gray-400">
                Share notes and PYQs with students.
              </p>

            </div>

          </div>

          {/* FORM */}

          <div className="grid md:grid-cols-2 gap-5">

            <input
              type="text"
              placeholder="Resource Title"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              className="
                p-3 rounded-xl
                bg-[#0f172a]
                border border-gray-700
                text-white
                outline-none
                focus:ring-2 focus:ring-purple-500
              "
            />

            <input
              type="text"
              placeholder="Subject (DBMS, CN, OS...)"
              value={form.subject}
              onChange={(e) =>
                setForm({
                  ...form,
                  subject: e.target.value,
                })
              }
              className="
                p-3 rounded-xl
                bg-[#0f172a]
                border border-gray-700
                text-white
                outline-none
                focus:ring-2 focus:ring-purple-500
              "
            />

            <select
              value={form.semester}
              onChange={(e) =>
                setForm({
                  ...form,
                  semester: e.target.value,
                })
              }
              className="
                p-3 rounded-xl
                bg-[#0f172a]
                border border-gray-700
                text-white
                outline-none
                focus:ring-2 focus:ring-purple-500
              "
            >
              <option value="">Select Semester</option>

              {[1,2,3,4,5,6,7,8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>

            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value,
                })
              }
              className="
                p-3 rounded-xl
                bg-[#0f172a]
                border border-gray-700
                text-white
                outline-none
                focus:ring-2 focus:ring-purple-500
              "
            >
              <option value="notes">Notes</option>
              <option value="pyq">PYQ</option>
            </select>

            <input
              type="text"
              placeholder="Tags (SQL, Networks, Important...)"
              value={form.tags}
              onChange={(e) =>
                setForm({
                  ...form,
                  tags: e.target.value,
                })
              }
              className="
                md:col-span-2
                p-3 rounded-xl
                bg-[#0f172a]
                border border-gray-700
                text-white
                outline-none
                focus:ring-2 focus:ring-purple-500
              "
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              className="
                md:col-span-2
                p-4 rounded-xl
                bg-[#0f172a]
                border border-gray-700
                text-white
                min-h-[140px]
                outline-none
                focus:ring-2 focus:ring-purple-500
              "
            />

            {/* FILE INPUT */}

            <div className="md:col-span-2">

              <label className="
                flex items-center justify-center
                w-full p-5
                border-2 border-dashed border-purple-500/40
                rounded-2xl
                cursor-pointer
                bg-[#0f172a]
                hover:border-purple-400
                transition-all
              ">

                <div className="text-center space-y-2">

                  <Upload className="mx-auto text-purple-400" />

                  <p className="text-sm text-gray-300">
                    {form.file
                      ? form.file.name
                      : "Click to upload PDF"}
                  </p>

                </div>

                <input
                  type="file"
                  hidden
                  onChange={(e) =>
                    setForm({
                      ...form,
                      file: e.target.files[0],
                    })
                  }
                />

              </label>

            </div>

          </div>

          {/* BUTTON */}

          <button
            onClick={uploadResource}
            className="
              px-6 py-3 rounded-xl
              bg-gradient-to-r from-purple-500 to-cyan-400
              text-white font-semibold
              hover:scale-105 transition-all
              shadow-lg
            "
          >
            Upload Resource 🚀
          </button>

        </motion.div>

      )}

      {/* ================= RESOURCES TAB ================= */}

      {activeTab === "resources" && (

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >

          {/* SEARCH */}

          <div className="relative">

            <Search
              size={18}
              className="
                absolute left-3 top-1/2
                -translate-y-1/2 text-gray-400
              "
            />

            <input
              type="text"
              placeholder="Search your resources..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="
                w-full pl-10 pr-4 py-3
                rounded-xl
                bg-[#0f172a]
                border border-gray-700
                text-white
                outline-none
                focus:ring-2 focus:ring-purple-500
              "
            />

          </div>

          {/* EMPTY */}

          {filteredResources.length === 0 ? (

            <div className="
              glass rounded-3xl p-10
              text-center border border-gray-800
            ">

              <FolderOpen
                size={50}
                className="mx-auto text-gray-500 mb-4"
              />

              <h3 className="text-xl font-semibold text-white">
                No Resources Found
              </h3>

              <p className="text-gray-400 mt-2">
                Start uploading resources to build your academic library.
              </p>

            </div>

          ) : (

            <div className="grid md:grid-cols-2 gap-6">

              {filteredResources.map((r) => (

                <motion.div
                  key={r._id}
                  whileHover={{
                    y: -5,
                    scale: 1.01,
                  }}
                  className="
                    relative overflow-hidden
                    rounded-3xl
                    border border-gray-800
                    bg-gradient-to-br from-[#0f172a] to-[#020617]
                    p-6
                    shadow-[0_10px_30px_rgba(0,0,0,0.45)]
                    hover:border-purple-500/40
                    hover:shadow-[0_20px_50px_rgba(139,92,246,0.20)]
                    transition-all
                  "
                >

                  {/* TOP */}

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex gap-4">

                      <div className="
                        p-3 rounded-2xl
                        bg-gradient-to-br
                        from-purple-500/20
                        to-cyan-400/20
                      ">
                        <FileText
                          className="text-purple-400"
                          size={22}
                        />
                      </div>

                      <div>

                        <h3 className="text-xl font-semibold text-white">
                          {r.title}
                        </h3>

                        <p className="text-sm text-gray-400 mt-1">
                          Semester {r.semester}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* DESCRIPTION */}

                  <p className="text-gray-300 mt-5 leading-relaxed">
                    {r.description}
                  </p>

                  {/* SUBJECT */}

                  {r.subject && (
                    <div className="mt-4">
                      <span className="
                        px-3 py-1 rounded-full text-xs
                        bg-purple-500/20
                        text-purple-300
                        border border-purple-500/20
                      ">
                        📘 {r.subject}
                      </span>
                    </div>
                  )}

                  {/* TAGS */}

                  {r.tags?.length > 0 && (

                    <div className="flex flex-wrap gap-2 mt-4">

                      {r.tags.map((tag, idx) => (
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

                  )}

                  {/* ACTIONS */}

                  <div className="flex justify-between items-center mt-7">

                    <button
                      onClick={() =>
                        setPreviewFile(r.fileUrl)
                      }
                      className="
                        px-5 py-2 rounded-xl
                        bg-gradient-to-r
                        from-purple-500 to-cyan-400
                        text-white font-medium
                        flex items-center gap-2
                        hover:scale-105 transition-all
                      "
                    >
                      <Eye size={16} />
                      View
                    </button>

                    <button
                      onClick={() =>
                        deleteResource(r._id)
                      }
                      className="
                        p-3 rounded-xl
                        bg-red-500/10
                        text-red-400
                        hover:bg-red-500/20
                        hover:scale-110
                        transition-all
                      "
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                  {/* GLOW */}

                  <div className="
                    absolute inset-0 rounded-3xl opacity-0
                    hover:opacity-10
                    bg-gradient-to-r from-purple-500 to-cyan-400
                    blur-xl transition pointer-events-none
                  " />

                </motion.div>

              ))}

            </div>

          )}

        </motion.div>

      )}

      {/* ================= PDF VIEWER ================= */}

      {previewFile && (
        <PDFViewer
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

    </div>
  );
};

export default TeacherDashboard;
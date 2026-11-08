import { useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import {
  UploadCloud,
  FileText,
  Tag,
  BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";

const UploadResource = ({ refresh }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    semester: "",
    type: "notes",

    // ✅ NEW
    subject: "",
    tags: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!file) {
      return toast.error("Please select a PDF file");
    }

    // ✅ PDF CHECK
    if (file.type !== "application/pdf") {
      return toast.error("Only PDF files are allowed");
    }

    // ✅ SIZE CHECK
    if (file.size > 30 * 1024 * 1024) {
      return toast.error("File must be less than 30MB");
    }

    // ✅ REQUIRED FIELDS
    if (
      !form.title.trim() ||
      !form.semester ||
      !form.subject.trim()
    ) {
      return toast.error(
        "Title, Subject and Semester are required"
      );
    }

    // ✅ SEM CHECK
    if (isNaN(form.semester)) {
      return toast.error("Semester must be a number");
    }

    try {
      setLoading(true);

      const data = new FormData();

      // EXISTING
      data.append("title", form.title.trim());
      data.append("description", form.description.trim());
      data.append("semester", Number(form.semester));
      data.append("type", form.type);

      // ✅ NEW
      data.append("subject", form.subject.trim());
      data.append("tags", form.tags.trim());

      // FILE
      data.append("file", file);

      await API.post("/resources", data);

      toast.success("Resource uploaded 🚀");

      // RESET
      setForm({
        title: "",
        description: "",
        semester: "",
        type: "notes",

        // ✅ NEW RESET
        subject: "",
        tags: "",
      });

      setFile(null);

      // REFRESH
      if (typeof refresh === "function") {
        refresh();
      }

    } catch (err) {
      console.error(
        "UPLOAD ERROR:",
        err.response?.data || err.message
      );

      toast.error(
        err.response?.data?.message ||
          "Upload failed (check backend)"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        glass p-6 rounded-2xl space-y-5
        border border-gray-300 dark:border-gray-700
        shadow-lg
      "
    >

      {/* HEADER */}
      <h2 className="text-xl font-semibold flex items-center gap-2 text-black dark:text-white">
        <UploadCloud size={20} />
        Upload Resource
      </h2>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* TITLE */}
        <input
          value={form.title}
          placeholder="Title"
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
          className="
            p-3 rounded-xl
            bg-gray-100 dark:bg-gray-800
            text-black dark:text-white
            focus:ring-2 focus:ring-purple-500
            outline-none
          "
        />

        {/* SEM */}
        <input
          value={form.semester}
          placeholder="Semester (e.g. 3)"
          onChange={(e) =>
            setForm({
              ...form,
              semester: e.target.value,
            })
          }
          className="
            p-3 rounded-xl
            bg-gray-100 dark:bg-gray-800
            text-black dark:text-white
            focus:ring-2 focus:ring-purple-500
            outline-none
          "
        />

        {/* ✅ SUBJECT */}
        <div className="relative">

          <BookOpen
            size={18}
            className="absolute left-3 top-3.5 text-gray-400"
          />

          <input
            value={form.subject}
            placeholder="Subject (DBMS, OS, CN...)"
            onChange={(e) =>
              setForm({
                ...form,
                subject: e.target.value,
              })
            }
            className="
              w-full pl-10 p-3 rounded-xl
              bg-gray-100 dark:bg-gray-800
              text-black dark:text-white
              focus:ring-2 focus:ring-purple-500
              outline-none
            "
          />

        </div>

        {/* ✅ TAGS */}
        <div className="relative">

          <Tag
            size={18}
            className="absolute left-3 top-3.5 text-gray-400"
          />

          <input
            value={form.tags}
            placeholder="Tags (sql, joins, normalization)"
            onChange={(e) =>
              setForm({
                ...form,
                tags: e.target.value,
              })
            }
            className="
              w-full pl-10 p-3 rounded-xl
              bg-gray-100 dark:bg-gray-800
              text-black dark:text-white
              focus:ring-2 focus:ring-purple-500
              outline-none
            "
          />

        </div>

      </div>

      {/* DESCRIPTION */}
      <textarea
        value={form.description}
        placeholder="Description..."
        onChange={(e) =>
          setForm({
            ...form,
            description: e.target.value,
          })
        }
        className="
          w-full p-3 rounded-xl
          bg-gray-100 dark:bg-gray-800
          text-black dark:text-white
          focus:ring-2 focus:ring-purple-500
          outline-none
        "
      />

      {/* TYPE */}
      <select
        value={form.type}
        onChange={(e) =>
          setForm({
            ...form,
            type: e.target.value,
          })
        }
        className="
          w-full p-3 rounded-xl
          bg-gray-100 dark:bg-gray-800
          text-black dark:text-white
        "
      >
        <option value="notes">📚 Notes</option>
        <option value="pyq">📝 PYQ</option>
      </select>

      {/* FILE */}
      <label
        className="
          flex flex-col items-center justify-center
          border-2 border-dashed
          border-gray-400 dark:border-gray-600
          rounded-xl p-6 cursor-pointer
          hover:border-purple-500
          transition
        "
      >

        <FileText
          size={30}
          className="mb-2 text-gray-500"
        />

        <p className="text-sm text-gray-500 text-center">
          {file
            ? file.name
            : "Click to upload PDF"}
        </p>

        {/* FILE SIZE */}
        {file && (
          <p className="text-xs text-gray-400 mt-1">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        )}

        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
        />

      </label>

      {/* BUTTON */}
      <button
        onClick={submit}
        disabled={loading}
        className="
          w-full py-3 rounded-xl
          bg-gradient-to-r from-purple-500 to-cyan-400
          text-white font-semibold
          hover:scale-[1.02]
          transition-all shadow-md
          disabled:opacity-50
        "
      >
        {loading
          ? "Uploading..."
          : "Upload Resource 🚀"}
      </button>

    </motion.div>
  );
};

export default UploadResource;
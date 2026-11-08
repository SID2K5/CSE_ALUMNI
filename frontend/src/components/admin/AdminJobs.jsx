import { useEffect, useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🚀 Fetching pending jobs...");

      const { data } = await API.get("/jobs/pending");

      console.log("📦 Pending Jobs Response:", data);

      setJobs(data);

    } catch (err) {
      const message =
        err.response?.data?.message || err.message;

      console.error("❌ Fetch Jobs Error:", message);

      setError(message);
      toast.error("Failed to load pending jobs");

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const approve = async (id) => {
    try {
      await API.put(`/jobs/approve/${id}`);
      toast.success("Job Approved ✅");
      fetchJobs();
    } catch (err) {
      console.error("❌ Approve error:", err.response?.data);
      toast.error("Approval failed");
    }
  };

  const reject = async (id) => {
    try {
      await API.put(`/jobs/reject/${id}`);
      toast.success("Job Rejected ❌");
      fetchJobs();
    } catch (err) {
      console.error("❌ Reject error:", err.response?.data);
      toast.error("Reject failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Job Approvals 💼
        </h2>

        <button
          onClick={fetchJobs}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
        >
          Refresh
        </button>
      </div>

      {/* COUNT */}
      <p className="text-sm text-gray-500">
        Pending Jobs: {jobs.length}
      </p>

      {/* 🔄 LOADING */}
      {loading && (
        <p className="text-gray-500 text-sm">Loading jobs...</p>
      )}

      {/* ❌ ERROR */}
      {error && (
        <p className="text-red-500 text-sm">
          Error: {error}
        </p>
      )}

      {/* ❌ EMPTY */}
      {!loading && jobs.length === 0 && !error && (
        <p className="text-gray-500 text-sm">
          No pending jobs for approval
        </p>
      )}

      {/* ✅ JOB LIST */}
      {jobs.map((job) => (
        <div
          key={job._id}
          className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-5 rounded-xl shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-4"
        >

          {/* JOB INFO */}
          <div>
            <p className="font-semibold text-lg text-black dark:text-white">
              {job.title}
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              {job.company} • {job.location}
            </p>

            <p className="text-xs text-gray-400">
              Posted by: {job.postedBy?.name || "Unknown"}
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3">

            <button
              onClick={() => approve(job._id)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
            >
              Approve
            </button>

            <button
              onClick={() => reject(job._id)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Reject
            </button>

          </div>

        </div>
      ))}

    </div>
  );
};

export default AdminJobs;
import { useEffect, useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const UserApprovals = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingUsers = async () => {
    try {
      const { data } = await API.get("/admin/pending-users");

      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  /* ================= APPROVE ================= */

  const approveUser = async (id, role) => {
    try {
      await API.put(`/admin/approve/${id}`, {
        role,
      });

      toast.success(`User approved as ${role}`);

      fetchPendingUsers();
    } catch (err) {
      console.error(err);
      toast.error("Approval failed");
    }
  };

  /* ================= REJECT ================= */

  const rejectUser = async (id) => {
    try {
      await API.delete(`/admin/reject/${id}`);

      toast.success("User rejected");

      fetchPendingUsers();
    } catch (err) {
      console.error(err);
      toast.error("Reject failed");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-20 text-xl font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black gradient-text">
          User Approvals 👥
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Approve or reject new registrations
        </p>
      </div>

      {/* USERS */}
      <div className="space-y-5">

        {users.length === 0 ? (
          <div
            className="
              glass p-10 rounded-3xl
              text-center text-gray-500
            "
          >
            No pending users 🚀
          </div>
        ) : (
          users.map((u) => (
            <motion.div
              key={u._id}
              whileHover={{ scale: 1.01 }}
              className="
                glass p-5 rounded-3xl
                border border-gray-200 dark:border-gray-700
                shadow-xl
              "
            >

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                {/* USER INFO */}
                <div className="space-y-2">

                  <h2 className="text-xl font-bold text-black dark:text-white">
                    {u.name}
                  </h2>

                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">

                    <p>📧 {u.email}</p>

                    <p>🏫 {u.department}</p>

                    <p>🎓 Pass Out: {u.passOutYear}</p>

                    <p>🆔 {u.rollNumber}</p>

                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-wrap gap-3">

                  <button
                    onClick={() =>
                      approveUser(u._id, "student")
                    }
                    className="
                      px-4 py-2 rounded-xl
                      bg-gradient-to-r from-cyan-400 to-blue-500
                      text-white font-semibold
                      hover:scale-105 transition
                    "
                  >
                    Student
                  </button>

                  <button
                    onClick={() =>
                      approveUser(u._id, "alumni")
                    }
                    className="
                      px-4 py-2 rounded-xl
                      bg-gradient-to-r from-purple-500 to-pink-500
                      text-white font-semibold
                      hover:scale-105 transition
                    "
                  >
                    Alumni
                  </button>

                  <button
                    onClick={() =>
                      approveUser(u._id, "admin")
                    }
                    className="
                      px-4 py-2 rounded-xl
                      bg-gradient-to-r from-yellow-400 to-orange-500
                      text-black font-semibold
                      hover:scale-105 transition
                    "
                  >
                    Admin
                  </button>

                  <button
                    onClick={() => rejectUser(u._id)}
                    className="
                      px-4 py-2 rounded-xl
                      bg-red-500 text-white font-semibold
                      hover:scale-105 transition
                    "
                  >
                    Reject
                  </button>

                </div>
              </div>

            </motion.div>
          ))
        )}

      </div>

    </div>
  );
};

export default UserApprovals;
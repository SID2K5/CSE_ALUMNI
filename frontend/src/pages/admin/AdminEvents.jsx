import { useEffect, useState } from "react";
import API from "../../services/api";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  // 🔥 FETCH PENDING EVENTS
  const fetchPending = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/events/pending");
      setEvents(data);
    } catch (error) {
      console.error("Error fetching pending events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  // ✅ APPROVE EVENT
  const approveEvent = async (id) => {
    try {
      await API.put(`/events/approve/${id}`);
      toast.success("Event approved ✅");
      fetchPending();
    } catch (error) {
      console.error("Approve error:", error);
      toast.error("Failed to approve event");
    }
  };

  // ❌ REJECT EVENT
  const rejectEvent = async (id) => {
    try {
      await API.put(`/events/reject/${id}`);
      toast.success("Event rejected ❌");
      fetchPending();
    } catch (error) {
      console.error("Reject error:", error);
      toast.error("Failed to reject event");
    }
  };

  useEffect(() => {
    if (!user) return;

    // 🛡️ PROTECT PAGE
    if (user.role !== "admin") {
      navigate("/feed");
    } else {
      fetchPending();
    }
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      <h1 className="text-3xl font-bold gradient-text">
        Event Approvals 🛡️
      </h1>

      {/* 🔄 LOADING */}
      {loading ? (
        <p className="text-center text-gray-500">
          Loading events...
        </p>
      ) : events.length === 0 ? (
        <p className="text-center text-gray-500">
          No pending events 🎉
        </p>
      ) : (
        events.map((e) => (
          <motion.div
            key={e._id}
            whileHover={{ scale: 1.02 }}
            className="glass rounded-xl overflow-hidden shadow-lg border border-gray-300 dark:border-gray-700"
          >

            {/* POSTER / FILE */}
            {e.poster && (
              e.poster.endsWith(".pdf") ? (
                <a
                  href={e.poster}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center p-4 text-blue-500 underline"
                >
                  📄 View PDF
                </a>
              ) : (
                <img
                  src={e.poster}
                  className="w-full h-52 object-cover"
                />
              )
            )}

            <div className="p-5 space-y-3">

              {/* TITLE */}
              <h2 className="text-xl font-bold text-black dark:!text-white">
                {e.title}
              </h2>

              {/* DESCRIPTION */}
              <p className="text-gray-700 dark:text-gray-400">
                {e.description}
              </p>

              {/* DETAILS */}
              <div className="flex justify-between text-sm text-gray-700 dark:text-gray-400">
                <span>📍 {e.location}</span>
                <span>🗓 {dayjs(e.date).format("DD MMM YYYY")}</span>
              </div>

              {/* STATUS */}
              <div className="text-yellow-500 font-semibold">
                ⏳ Pending Approval
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3">

                <button
                  onClick={() => approveEvent(e._id)}
                  className="bg-green-500 text-white px-4 py-2 rounded-xl hover:scale-105 transition flex-1"
                >
                  Approve ✅
                </button>

                <button
                  onClick={() => rejectEvent(e._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-xl hover:scale-105 transition flex-1"
                >
                  Reject ❌
                </button>

              </div>

            </div>

          </motion.div>
        ))
      )}

    </div>
  );
};

export default AdminEvents;
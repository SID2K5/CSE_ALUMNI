import { useEffect, useState } from "react";
import API from "../services/api";

const NotificationDropdown = () => {
  const [requests, setRequests] = useState([]);

  /* =====================================================
     🔄 FETCH PENDING REQUESTS
  ===================================================== */
  const fetchRequests = async () => {
    try {
      const { data } = await API.get("/connections/pending");
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  /* =====================================================
     ✅ ACCEPT REQUEST
  ===================================================== */
  const handleAccept = async (id) => {
    try {
      await API.put(`/connections/respond/${id}`, {
        status: "accepted",
      });
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  /* =====================================================
     ❌ REJECT REQUEST
  ===================================================== */
  const handleReject = async (id) => {
    try {
      await API.put(`/connections/respond/${id}`, {
        status: "rejected",
      });
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">

      <h3 className="font-bold mb-3 text-black dark:text-white">
        Connection Requests
      </h3>

      {/* EMPTY STATE */}
      {requests.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No pending requests
        </p>
      )}

      {/* REQUEST LIST */}
      <div className="space-y-3 max-h-72 overflow-y-auto">

        {requests.map((r) => (
          <div
            key={r._id}
            className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {/* USER */}
            <div className="flex items-center gap-2">
              <img
                src={r.sender.profilePic || "https://via.placeholder.com/30"}
                className="w-8 h-8 rounded-full object-cover"
              />

              <span className="text-sm text-black dark:text-white">
                {r.sender.name}
              </span>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">
              <button
                onClick={() => handleAccept(r._id)}
                className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:scale-105 transition"
              >
                Accept
              </button>

              <button
                onClick={() => handleReject(r._id)}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:scale-105 transition"
              >
                Reject
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default NotificationDropdown;
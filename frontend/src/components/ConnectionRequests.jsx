import { useEffect, useState } from "react";
import API from "../services/api";
import socket from "../socket";
import toast from "react-hot-toast";

const ConnectionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const fetchRequests = async () => {
    try {
      const { data } = await API.get("/connections/pending");
      setRequests(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 🔥 REAL-TIME
  useEffect(() => {
    socket.on("notification", fetchRequests);
    socket.on("connectionUpdate", fetchRequests);

    return () => {
      socket.off("notification");
      socket.off("connectionUpdate");
    };
  }, []);

  // ✅ FIXED HANDLER
  const handleResponse = async (id, status) => {
    try {
      console.log("CLICKED:", id, status);

      setLoadingId(id);

      await API.put(`/connections/respond/${id}`, {
        status,
      });

      toast.success(
        status === "accepted"
          ? "Connection accepted 🤝"
          : "Request rejected ❌"
      );

      fetchRequests();

      socket.emit("connectionUpdate");

    } catch (err) {
      console.error("Response error:", err);
      toast.error("Action failed");
    } finally {
      setLoadingId(null);
    }
  };

  if (requests.length === 0) return null;

  return (
    <div className="glass p-4 space-y-3">

      <h3 className="font-semibold text-black dark:text-white">
        Connection Requests
      </h3>

      {requests.map((r) => (
        <div
          key={r._id}
          className="flex items-center justify-between gap-3"
        >

          {/* USER */}
          <div className="flex items-center gap-2">
            <img
              src={r.sender.profilePic || "https://via.placeholder.com/40"}
              className="w-10 h-10 rounded-full"
            />
            <span className="text-sm font-medium">
              {r.sender.name}
            </span>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2">

            <button
              disabled={loadingId === r._id}
              onClick={() => handleResponse(r._id, "accepted")}
              className="px-3 py-1 bg-green-500 text-white rounded hover:scale-105 transition disabled:opacity-50"
            >
              {loadingId === r._id ? "..." : "Accept"}
            </button>

            <button
              disabled={loadingId === r._id}
              onClick={() => handleResponse(r._id, "rejected")}
              className="px-3 py-1 bg-red-500 text-white rounded hover:scale-105 transition disabled:opacity-50"
            >
              Reject
            </button>

          </div>

        </div>
      ))}

    </div>
  );
};

export default ConnectionRequests;
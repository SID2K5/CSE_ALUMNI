import { useEffect, useState } from "react";
import API from "../services/api";
import socket from "../socket";
import {
  UserPlus,
  Clock,
  Check,
  Users,
  X,
} from "lucide-react";

const ConnectionButton = ({ userId }) => {
  const [status, setStatus] = useState("none");
  const [requestId, setRequestId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mutual, setMutual] = useState(0);

  /* =====================================================
     🔥 FETCH STATUS
  ===================================================== */
  const fetchStatus = async () => {
    try {
      const { data } = await API.get(`/connections/status/${userId}`);
      setStatus(data.status);
      setRequestId(data.id || null); // 🔥 IMPORTANT
    } catch (err) {
      console.error(err);
    }
  };

  /* =====================================================
     🔥 FETCH MUTUAL
  ===================================================== */
  const fetchMutual = async () => {
    try {
      const { data } = await API.get(`/connections/mutual/${userId}`);
      setMutual(data.count || 0); // 🔥 FIXED
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchMutual();
  }, [userId]);

  /* =====================================================
     🔥 REAL-TIME
  ===================================================== */
  useEffect(() => {
    socket.on("connectionUpdate", () => {
      fetchStatus();
      fetchMutual();
    });

    return () => socket.off("connectionUpdate");
  }, []);

  /* =====================================================
     📤 SEND REQUEST
  ===================================================== */
  const handleConnect = async () => {
    try {
      setLoading(true);

      await API.post("/connections/send", { receiverId: userId });

      setStatus("pending_sent");

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     ✅ ACCEPT REQUEST
  ===================================================== */
  const handleAccept = async () => {
    try {
      setLoading(true);

      await API.put(`/connections/respond/${requestId}`, {
        status: "accepted",
      });

      setStatus("connected");

      socket.emit("connectionUpdate");

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     ❌ REJECT REQUEST
  ===================================================== */
  const handleReject = async () => {
    try {
      setLoading(true);

      await API.put(`/connections/respond/${requestId}`, {
        status: "rejected",
      });

      setStatus("none");

      socket.emit("connectionUpdate");

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     🚫 CANCEL REQUEST
  ===================================================== */
  const handleCancel = async () => {
    try {
      setLoading(true);

      await API.delete(`/connections/cancel/${requestId}`);

      setStatus("none");

      socket.emit("connectionUpdate");

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     🎨 UI STATES
  ===================================================== */
  const renderButton = () => {
    switch (status) {
      case "connected":
        return (
          <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500 text-white">
            <Check size={16} /> Connected
          </button>
        );

      case "pending_sent":
        return (
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-400 text-white cursor-not-allowed">
              <Clock size={16} /> Pending
            </button>

            <button
              onClick={handleCancel}
              className="px-3 py-2 rounded-lg bg-red-500 text-white hover:scale-105 transition"
            >
              <X size={16} />
            </button>
          </div>
        );

      case "pending_received":
        return (
          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-500 text-white hover:scale-105 transition"
            >
              <Check size={16} /> Accept
            </button>

            <button
              onClick={handleReject}
              className="px-3 py-2 rounded-lg bg-red-500 text-white hover:scale-105 transition"
            >
              <X size={16} />
            </button>
          </div>
        );

      default:
        return (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-brand text-white hover:opacity-90 transition-opacity"
          >
            <UserPlus size={16} />
            {loading ? "Connecting..." : "Connect"}
          </button>
        );
    }
  };

  return (
    <div className="space-y-1">

      {renderButton()}

      {/* 🔥 MUTUAL CONNECTIONS */}
      {mutual > 0 && (
        <p className="text-xs text-gray-500 flex items-center gap-1 justify-center">
          <Users size={12} /> {mutual} mutual connections
        </p>
      )}

    </div>
  );
};

export default ConnectionButton;
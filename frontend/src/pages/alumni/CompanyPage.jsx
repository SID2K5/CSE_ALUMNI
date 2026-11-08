import { useEffect, useState } from "react";
import API from "../../services/api";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, MessageCircle } from "lucide-react";

// 🔥 IMPORTS
import ConnectionButton from "../../components/ConnectionButton";
import { useOnline } from "../../context/OnlineContext"; // ✅ FIX

// 🌍 Leaflet
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🔥 Fix marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const CompanyPage = () => {
  const { company } = useParams();
  const [users, setUsers] = useState([]);

  // ✅ GLOBAL ONLINE USERS
  const { onlineUsers } = useOnline();

  const fetchUsers = async () => {
    try {
      const { data } = await API.get(`/alumni/company/${company}`);
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getCoords = (index) => [20 + index, 78 + index];

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="glass p-6 flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold gradient-text capitalize">
            {company} Alumni 🏢
          </h1>

          <p className="text-gray-500">
            {users.length} alumni working here
          </p>
        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="glass p-4 text-center">
          <p className="text-xl font-bold">{users.length}</p>
          <p className="text-sm text-gray-500">Total Alumni</p>
        </div>

        <div className="glass p-4 text-center">
          <p className="text-xl font-bold">
            {new Set(users.map(u => u.location)).size}
          </p>
          <p className="text-sm text-gray-500">Locations</p>
        </div>

        <div className="glass p-4 text-center">
          <p className="text-xl font-bold">
            {new Set(users.map(u => u.graduationYear)).size}
          </p>
          <p className="text-sm text-gray-500">Batches</p>
        </div>

        <div className="glass p-4 text-center">
          <p className="text-xl font-bold">
            {users.filter(u => u.isVerified).length}
          </p>
          <p className="text-sm text-gray-500">Verified</p>
        </div>

      </div>

      {/* MAP */}
      <div className="glass p-5">
        <h2 className="font-semibold mb-3 text-black dark:text-white">
          Global Distribution 🌍
        </h2>

        <MapContainer
          center={[20, 78]}
          zoom={2}
          style={{ height: "250px", borderRadius: "12px" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {users.map((u, i) => (
            <Marker key={i} position={getCoords(i)}>
              <Popup>
                <div>
                  <p className="font-semibold">{u.name}</p>
                  <p>{u.location}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ALUMNI GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {users.map((u) => (
          <motion.div
            key={u._id}
            whileHover={{ scale: 1.05 }}
            className="glass p-5 space-y-3 border dark:border-none"
          >

            {/* PROFILE */}
            <div className="flex items-center gap-3">

              {/* 🔥 PROFILE IMAGE + ONLINE DOT */}
              <div className="relative">
                <img
                  src={u.profilePic || "https://via.placeholder.com/40"}
                  className="w-12 h-12 rounded-full object-cover"
                />

                {onlineUsers.includes(u._id) && (
                  <span className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-white shadow-[0_0_8px_#22c55e]"></span>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-black dark:text-white">
                  {u.name}
                </h3>

                {u.isVerified && (
                  <span className="text-blue-500 text-sm">
                    ✔ Verified
                  </span>
                )}
              </div>

            </div>

            {/* DETAILS */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              🎓 {u.graduationYear || "N/A"}
            </p>

            <p className="flex items-center gap-1 text-sm text-black dark:text-white">
              <MapPin size={14} /> {u.location || "N/A"}
            </p>

            {/* ACTIONS */}
            <div className="flex gap-2">

              <div className="w-full">
                <ConnectionButton userId={u._id} />
              </div>

              <button className="p-2 rounded bg-gray-200 dark:bg-gray-800 hover:scale-105 transition">
                <MessageCircle size={16} />
              </button>

            </div>

          </motion.div>
        ))}

      </div>

    </div>
  );
};

export default CompanyPage;
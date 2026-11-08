import { useEffect, useState } from "react";
import API from "../../services/api";

const Notifications = () => {
  const [data, setData] = useState([]);

  const fetchNotifications = async () => {
    const res = await API.get("/notifications");
    setData(res.data);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold gradient-text">Notifications 🔔</h1>

      {data.map((n) => (
        <div key={n._id} className="glass p-3">
          <p>{n.message}</p>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
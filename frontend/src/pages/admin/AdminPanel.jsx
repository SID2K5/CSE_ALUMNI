import { useEffect, useState } from "react";
import API from "../../services/api";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const { data } = await API.get("/admin/pending-users");
    setUsers(data);
  };

  const approve = async (id, role) => {
    await API.put(`/admin/approve/${id}`, { role });
    fetchUsers();
  };

  const reject = async (id) => {
    await API.delete(`/admin/reject/${id}`);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="glass p-5 space-y-4">

      <h2 className="font-bold text-lg">Admin Panel 🛡️</h2>

      {users.map((u) => (
        <div key={u._id} className="flex justify-between items-center">

          <span>{u.name}</span>

          <div className="flex gap-2">

            <button onClick={() => approve(u._id, "student")} className="btn-primary">Student</button>
            <button onClick={() => approve(u._id, "alumni")} className="btn-primary">Alumni</button>
            <button onClick={() => approve(u._id, "admin")} className="btn-primary">Admin</button>

            <button onClick={() => reject(u._id)} className="bg-red-500 text-white px-2 rounded">
              Reject
            </button>

          </div>

        </div>
      ))}

    </div>
  );
};

export default AdminPanel;
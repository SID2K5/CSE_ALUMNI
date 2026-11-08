import { createContext, useContext, useEffect, useState } from "react";
import socket from "../socket";
import { useAuth } from "./AuthContext";

const OnlineContext = createContext();

export const OnlineProvider = ({ children }) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (user?._id) {
      socket.emit("join", user._id);
    }

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => socket.off("onlineUsers");
  }, [user]);

  return (
    <OnlineContext.Provider value={{ onlineUsers }}>
      {children}
    </OnlineContext.Provider>
  );
};

export const useOnline = () => useContext(OnlineContext);
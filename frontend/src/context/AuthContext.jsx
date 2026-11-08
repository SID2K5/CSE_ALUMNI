import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import socket from "../socket";

const AuthContext = createContext();

export const AuthProvider = ({
  children,
}) => {

  /* =====================================================
     ✅ SAFE USER PARSER
  ===================================================== */

  const getStoredUser = () => {

    try {

      const raw =
        localStorage.getItem(
          "user"
        );

      if (
        !raw ||
        raw === "undefined" ||
        raw === "null"
      ) {

        return null;
      }

      return JSON.parse(raw);

    } catch (err) {

      console.error(
        "❌ Error parsing user from localStorage:",
        err
      );

      localStorage.removeItem(
        "user"
      );

      return null;
    }
  };

  /* =====================================================
     ✅ USER STATE
  ===================================================== */

  const [user, setUser] =
    useState(getStoredUser);

  /* =====================================================
     ✅ SYNC USER BETWEEN TABS
  ===================================================== */

  useEffect(() => {

    const syncUser = () => {

      const latestUser =
        getStoredUser();

      setUser(latestUser);

      /* =====================================================
         🔥 SOCKET REJOIN
      ===================================================== */

      if (
        latestUser?._id
      ) {

        socket.connect();

        socket.emit(
          "join",
          latestUser._id
        );

        console.log(
          "🔥 SOCKET REJOIN:",
          latestUser._id
        );
      }
    };

    window.addEventListener(
      "storage",
      syncUser
    );

    return () => {

      window.removeEventListener(
        "storage",
        syncUser
      );
    };

  }, []);

  /* =====================================================
     🔥 AUTO SOCKET JOIN
  ===================================================== */

  useEffect(() => {

    if (user?._id) {

      socket.connect();

      socket.emit(
        "join",
        user._id
      );

      console.log(
        "🟢 SOCKET CONNECTED FOR:",
        user._id
      );
    }

  }, [user]);

  /* =====================================================
     ✅ LOGIN
  ===================================================== */

  const login = (data) => {

    if (
      !data ||
      typeof data !==
        "object"
    ) {

      console.error(
        "❌ Invalid login data:",
        data
      );

      return;
    }

    if (!data.token) {

      console.warn(
        "⚠️ Login data missing token"
      );
    }

    /* =====================================================
       🔥 SAVE USER
    ===================================================== */

    localStorage.setItem(
      "user",
      JSON.stringify(data)
    );

    setUser(data);

    /* =====================================================
       🔥 CONNECT SOCKET
    ===================================================== */

    if (data?._id) {

      socket.connect();

      socket.emit(
        "join",
        data._id
      );

      console.log(
        "🔥 USER JOINED SOCKET:",
        data._id
      );
    }
  };

  /* =====================================================
     ✅ LOGOUT
  ===================================================== */

  const logout = () => {

    try {

      socket.disconnect();

    } catch (err) {

      console.error(
        "❌ Socket disconnect error:",
        err
      );
    }

    localStorage.removeItem(
      "user"
    );

    setUser(null);

    window.location.href =
      "/login";
  };

  /* =====================================================
     ✅ PROVIDER
  ===================================================== */

  return (

    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >

      {children}

    </AuthContext.Provider>
  );
};

/* =====================================================
   ✅ CUSTOM HOOK
===================================================== */

export const useAuth = () =>
  useContext(AuthContext);
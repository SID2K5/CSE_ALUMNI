import { useState, useEffect, useRef } from "react";

import {
  Search,
  Send,
  CheckCheck,
  Paperclip,
  MoreVertical,
  BellOff,
  Ban,
  X,
} from "lucide-react";

import { useLocation } from "react-router-dom";

import socket from "../../socket";

import { useAuth } from "../../context/AuthContext";

import API from "../../services/api";

const Chat = () => {

  const { user } = useAuth();

  const location = useLocation();

  const bottomRef = useRef();

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [typing, setTyping] =
    useState(false);

  const [users, setUsers] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [showActions, setShowActions] =
    useState(false);

  const [file, setFile] =
    useState(null);

  /* =====================================================
     🔥 FETCH CHAT LIST
  ===================================================== */

  const fetchChats = async () => {

    try {

      const { data } =
        await API.get("/messages");

      setUsers(data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  };

  /* =====================================================
     🔥 FETCH MESSAGES
  ===================================================== */

  const fetchMessages = async (
    userId
  ) => {

    try {

      const { data } =
        await API.get(
          `/messages/${userId}`
        );

      setMessages(data);

      await API.put(
        `/messages/read/${userId}`
      );

      socket.emit("markRead", {
        from: userId,
        to: user._id,
      });

    } catch (err) {

      console.error(err);
    }
  };

  /* =====================================================
     🔥 INITIAL LOAD
  ===================================================== */

  useEffect(() => {

    fetchChats();

  }, []);

  /* =====================================================
     🔥 AUTO SELECT USER
  ===================================================== */

  useEffect(() => {

    const params =
      new URLSearchParams(
        location.search
      );

    const userId =
      params.get("userId");

    if (
      !userId ||
      users.length === 0
    ) return;

    const found =
      users.find(
        (u) =>
          u.user._id === userId
      );

    if (found) {

      setSelectedUser({
        ...found.user,
      });
    }

  }, [location.search, users]);

  /* =====================================================
     🔥 LOAD CHAT
  ===================================================== */

  useEffect(() => {

    if (!selectedUser?._id)
      return;

    fetchMessages(
      selectedUser._id
    );

  }, [selectedUser]);

  /* =====================================================
     🔥 SYNC LIVE USER
  ===================================================== */

  useEffect(() => {

    if (!selectedUser?._id)
      return;

    const updatedUser =
      users.find(
        (u) =>
          u.user._id ===
          selectedUser._id
      );

    if (updatedUser) {

      setSelectedUser(
        updatedUser.user
      );
    }

  }, [users]);

  /* =====================================================
     🔥 SOCKET JOIN
  ===================================================== */

  useEffect(() => {

    if (!user?._id)
      return;

    socket.emit(
      "join",
      user._id
    );

  }, [user]);

  /* =====================================================
     🔥 SOCKET LISTENERS
  ===================================================== */

  useEffect(() => {

    /* =====================================================
       💬 RECEIVE MESSAGE
    ===================================================== */

    socket.on(
      "receiveMessage",
      (msg) => {

        if (
          msg.sender._id ===
            selectedUser?._id ||

          msg.receiver._id ===
            selectedUser?._id
        ) {

          setMessages((prev) => [
            ...prev,
            msg,
          ]);
        }

        fetchChats();
      }
    );

    /* =====================================================
       ✨ TYPING
    ===================================================== */

    socket.on(
      "typing",
      ({ from }) => {

        if (
          from ===
          selectedUser?._id
        ) {

          setTyping(true);
        }
      }
    );

    socket.on(
      "stopTyping",
      ({ from }) => {

        if (
          from ===
          selectedUser?._id
        ) {

          setTyping(false);
        }
      }
    );

    /* =====================================================
       👀 MESSAGE UPDATES
    ===================================================== */

    socket.on(
      "messagesUpdated",
      () => {

        if (
          selectedUser?._id
        ) {

          fetchMessages(
            selectedUser._id
          );
        }

        fetchChats();
      }
    );

    /* =====================================================
       🟢 REALTIME PRESENCE
    ===================================================== */

    socket.on(
      "presenceUpdate",
      (data) => {

        setUsers((prev) =>
          prev.map((chat) => {

            if (
              chat.user._id ===
              data.userId
            ) {

              return {

                ...chat,

                user: {

                  ...chat.user,

                  isOnline:
                    data.isOnline,

                  lastSeen:
                    data.lastSeen,
                },
              };
            }

            return chat;
          })
        );

        /* 🔥 UPDATE SELECTED USER LIVE */

        setSelectedUser((prev) => {

          if (
            prev?._id ===
            data.userId
          ) {

            return {

              ...prev,

              isOnline:
                data.isOnline,

              lastSeen:
                data.lastSeen,
            };
          }

          return prev;
        });
      }
    );

    return () => {

      socket.off(
        "receiveMessage"
      );

      socket.off("typing");

      socket.off(
        "stopTyping"
      );

      socket.off(
        "messagesUpdated"
      );

      socket.off(
        "presenceUpdate"
      );
    };

  }, [selectedUser]);

  /* =====================================================
     🔥 AUTO SCROLL
  ===================================================== */

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages, typing]);

  /* =====================================================
     🔥 LIVE USER
  ===================================================== */

  const getLiveUser = () => {

    if (!selectedUser)
      return null;

    const latestChat =
      users.find(
        (u) =>
          u.user._id ===
          selectedUser._id
      );

    if (!latestChat) {

      return selectedUser;
    }

    return latestChat.user;
  };

  /* =====================================================
     🔥 SEND MESSAGE
  ===================================================== */

  const handleSend = async () => {

    if (
      (!message.trim() &&
        !file) ||

      !selectedUser
    )
      return;

    try {

      const formData =
        new FormData();

      formData.append(
        "receiver",
        selectedUser._id
      );

      formData.append(
        "text",
        message
      );

      if (file) {

        formData.append(
          "file",
          file
        );
      }

      const { data } =
        await API.post(
          "/messages/send",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      setMessages((prev) => [
        ...prev,
        data,
      ]);

      socket.emit(
        "sendMessage",
        data
      );

      setMessage("");

      setFile(null);

      socket.emit(
        "stopTyping",
        {
          to:
            selectedUser._id,

          from: user._id,
        }
      );

      fetchChats();

    } catch (err) {

      console.error(err);
    }
  };

  /* =====================================================
     🔥 TYPING
  ===================================================== */

  const handleTyping = (
    e
  ) => {

    setMessage(
      e.target.value
    );

    socket.emit(
      "typing",
      {
        to:
          selectedUser?._id,

        from: user._id,
      }
    );

    setTimeout(() => {

      socket.emit(
        "stopTyping",
        {
          to:
            selectedUser?._id,

          from: user._id,
        }
      );

    }, 1000);
  };

  /* =====================================================
     🔥 SEARCH FILTER
  ===================================================== */

  const filteredUsers =
    users.filter((u) =>
      u.user.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (

    <div className="h-[85vh] grid grid-cols-1 md:grid-cols-4 gap-4">

      {/* =====================================================
         🔹 LEFT PANEL
      ===================================================== */}

      <div className="glass p-4 flex flex-col overflow-hidden">

        {/* SEARCH */}

        <div className="relative mb-4">

          <Search
            className="absolute left-3 top-3 text-gray-500"
            size={16}
          />

          <input
            value={search}

            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }

            placeholder="Search chats..."

            className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-black dark:text-white focus:outline-none"
          />
        </div>

        {/* USERS */}

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">

          {loading && (

            <p className="text-sm text-gray-500">
              Loading chats...
            </p>
          )}

          {!loading &&
            filteredUsers.map(
              (chat) => {

                const u =
                  chat.user;

                return (

                  <div
                    key={u._id}

                    onClick={() =>
                      setSelectedUser(
                        u
                      )
                    }

                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 ${
                      selectedUser?._id ===
                      u._id
                        ? "bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/40 shadow-lg"
                        : "hover:bg-gray-200 dark:hover:bg-gray-800"
                    }`}
                  >

                    <div className="relative">

                      <img
                        src={
                          u.profilePic ||
                          "https://via.placeholder.com/40"
                        }

                        className="w-12 h-12 rounded-full object-cover"
                      />

                      {u.isOnline && (

                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                      )}

                      {chat.unread >
                        0 && (

                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                          {
                            chat.unread
                          }
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">

                      <p className="font-semibold text-black dark:text-white truncate">
                        {u.name}
                      </p>

                      <p className="text-xs text-gray-500 truncate">
                        {
                          chat.lastMessage
                        }
                      </p>
                    </div>
                  </div>
                );
              }
            )}
        </div>
      </div>

      {/* =====================================================
         🔹 RIGHT PANEL
      ===================================================== */}

      <div className="col-span-3 glass flex flex-col overflow-hidden">

        {selectedUser ? (

          <>
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-700 px-5 py-4 backdrop-blur-lg bg-white/40 dark:bg-[#020617]/40">

              <div className="flex items-center gap-3">

                <div className="relative">

                  <img
                    src={
                      getLiveUser()
                        ?.profilePic ||

                      "https://via.placeholder.com/40"
                    }

                    className="w-11 h-11 rounded-full object-cover"
                  />

                  {getLiveUser()
                    ?.isOnline && (

                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>

                <div>

                  <h2 className="font-semibold text-black dark:text-white">
                    {
                      getLiveUser()
                        ?.name
                    }
                  </h2>

                  <p className="text-xs text-green-500">

                    {getLiveUser()
                      ?.isOnline

                      ? "Active now"

                      : getLiveUser()
                          ?.lastSeen

                      ? `Last seen ${new Date(
                          getLiveUser().lastSeen
                        ).toLocaleTimeString(
                          [],
                          {
                            hour:
                              "2-digit",

                            minute:
                              "2-digit",
                          }
                        )}`

                      : "Offline"}
                  </p>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="relative">

                <button
                  onClick={() =>
                    setShowActions(
                      !showActions
                    )
                  }

                  className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                >

                  <MoreVertical
                    size={18}
                  />
                </button>

                {showActions && (

                  <div className="absolute right-0 top-12 glass p-2 rounded-xl w-40 z-50">

                    <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg text-sm">

                      <BellOff
                        size={14}
                      />

                      Mute
                    </button>

                    <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg text-sm text-red-500">

                      <Ban
                        size={14}
                      />

                      Block
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* MESSAGES */}

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#f8fafc] dark:bg-[#0f172a]">

              {messages.map(
                (m) => {

                  const isMe =
                    m.sender
                      ._id ===
                    user._id;

                  return (

                    <div
                      key={m._id}

                      className={`flex ${
                        isMe
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      <div
                        className={`group relative max-w-sm px-4 py-3 rounded-3xl shadow-md backdrop-blur-lg transition-all
                        ${
                          isMe
                            ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-br-md"
                            : "bg-white dark:bg-gray-800 text-black dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-700"
                        }`}
                      >

                        {isMe &&
                          !m.deleted && (

                            <button
                              onClick={async () => {

                                await API.put(
                                  `/messages/delete/${m._id}`
                                );

                                fetchMessages(
                                  selectedUser._id
                                );
                              }}

                              className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                            >

                              Delete
                            </button>
                          )}

                        <p className="text-sm break-words">

                          {m.deleted
                            ? "🚫 This message was deleted"

                            : m.text}
                        </p>

                        {m.fileUrl && (

                          <a
                            href={m.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block mt-2 rounded-2xl overflow-hidden border border-white/10 hover:scale-[1.02] transition"
                          >

                            {m.type === "image" ? (

                              <img
                                src={m.fileUrl}
                                alt="attachment"
                                className="max-h-60 w-full object-cover"
                              />

                            ) : (

                              <div className="p-3 bg-black/10 text-sm text-white">

                                📎 Open Attachment
                              </div>
                            )}
                          </a>
                        )}

                        <div
                          className={`flex items-center gap-1 mt-2 text-[10px]
                          ${
                            isMe
                              ? "text-white/80"
                              : "text-gray-400"
                          }`}
                        >

                          <span>

                            {new Date(
                              m.createdAt
                            ).toLocaleTimeString(
                              [],
                              {
                                hour:
                                  "2-digit",

                                minute:
                                  "2-digit",
                              }
                            )}
                          </span>

                          {isMe && (

                            <>
                              {m.read ? (

                                <CheckCheck
                                  size={12}
                                  className="text-cyan-300"
                                />

                              ) : (

                                <CheckCheck
                                  size={12}
                                  className="text-white/70"
                                />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}

              {typing && (

                <div className="flex items-center gap-1 px-3">

                  <span className="text-xs text-gray-500">

                    {
                      selectedUser.name
                    }{" "}

                    is typing
                  </span>

                  <div className="flex gap-1">

                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>

                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{
                        animationDelay:
                          "0.15s",
                      }}
                    ></span>

                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{
                        animationDelay:
                          "0.3s",
                      }}
                    ></span>
                  </div>
                </div>
              )}

              <div ref={bottomRef}></div>
            </div>

            {/* INPUT */}

            <div className="border-t border-gray-300 dark:border-gray-700 p-4 flex gap-3">

              <label className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center cursor-pointer hover:scale-105 transition relative">

                <Paperclip
                  size={18}
                />

                <input
                  type="file"
                  hidden
                  onChange={(e) =>
                    setFile(
                      e.target
                        .files[0]
                    )
                  }
                />
              </label>

              {file && (

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-xs">

                  <span className="truncate max-w-[120px]">

                    {file.name}
                  </span>

                  <button
                    onClick={() =>
                      setFile(null)
                    }
                  >

                    <X
                      size={14}
                    />
                  </button>
                </div>
              )}

              <input
                value={message}
                onChange={
                  handleTyping
                }
                onKeyDown={(e) =>
                  e.key ===
                    "Enter" &&
                  handleSend()
                }
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 rounded-2xl bg-gray-200 dark:bg-gray-800 text-black dark:text-white focus:outline-none"
              />

              <button
                onClick={
                  handleSend
                }
                className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white flex items-center justify-center hover:scale-105 transition"
              >

                <Send
                  size={18}
                />
              </button>
            </div>
          </>

        ) : (

          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-lg">

            Select a user to start chatting 💬
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
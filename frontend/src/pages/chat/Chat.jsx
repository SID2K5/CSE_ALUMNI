import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import {
  Search,
  Send,
  Paperclip,
  ArrowLeft,
  MessageCircle,
  X,
  Trash2,
  FileText,
  Download,
  Users,
} from "lucide-react";

import API from "../../services/api";
import socket from "../../socket";
import { useAuth } from "../../context/AuthContext";

import { Avatar, Badge, EmptyState, Skeleton } from "../../components/ui";

/* =====================================================
   CHAT — real-time, Socket.IO preserved verbatim.

   Emits   : join, markRead, sendMessage, typing, stopTyping
   Listens : receiveMessage, typing, stopTyping, messagesUpdated,
             presenceUpdate
   REST    : GET  /messages            (chat list)
             GET  /messages/:userId    (thread)
             PUT  /messages/read/:userId
             POST /messages/send       (multipart: receiver, text, file)
             PUT  /messages/delete/:id
===================================================== */

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);

  const [listLoading, setListLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);

  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [search, setSearch] = useState("");

  const bottomRef = useRef(null);
  const typingTimer = useRef(null);
  // Keep the latest selected user available inside socket callbacks
  const selectedRef = useRef(null);
  useEffect(() => {
    selectedRef.current = selectedUser;
  }, [selectedUser]);

  /* ===================== DATA ===================== */

  const fetchChats = useCallback(async () => {
    try {
      const { data } = await API.get("/messages");
      setChats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (userId) => {
    if (!userId) return;
    setThreadLoading(true);
    try {
      const { data } = await API.get(`/messages/${userId}`);
      setMessages(Array.isArray(data) ? data : []);

      await API.put(`/messages/read/${userId}`);

      socket.emit("markRead", {
        from: userId,
        to: user?._id,
      });

      // Clear the unread badge locally
      setChats((prev) =>
        prev.map((c) =>
          c.user._id === userId ? { ...c, unread: 0 } : c
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setThreadLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  /* Deep link /chat/:conversationId → open that thread */
  useEffect(() => {
    if (!conversationId || chats.length === 0) return;
    const match = chats.find((c) => c.user._id === conversationId);
    if (match) {
      setSelectedUser(match.user);
      fetchMessages(match.user._id);
    }
  }, [conversationId, chats, fetchMessages]);

  /* ===================== SOCKET ===================== */

  // Join own room
  useEffect(() => {
    if (!user?._id) return;
    socket.emit("join", user._id);
  }, [user]);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      const active = selectedRef.current;
      const fromActive = msg.sender?._id === active?._id;

      if (fromActive) {
        setMessages((prev) => [...prev, msg]);
        // We're looking at it — mark read immediately
        API.put(`/messages/read/${msg.sender._id}`).catch(() => {});
        socket.emit("markRead", {
          from: msg.sender._id,
          to: user?._id,
        });
      }

      // Update the conversation list preview / unread count
      setChats((prev) =>
        prev.map((c) => {
          const otherId =
            msg.sender?._id === user?._id
              ? msg.receiver?._id
              : msg.sender?._id;
          if (c.user._id !== otherId) return c;
          return {
            ...c,
            lastMessage: msg.text || (msg.fileUrl ? "Attachment" : ""),
            updatedAt: msg.createdAt || new Date().toISOString(),
            unread:
              fromActive || msg.sender?._id === user?._id
                ? 0
                : (c.unread || 0) + 1,
          };
        })
      );
    });

    socket.on("typing", ({ from }) => {
      if (from === selectedRef.current?._id) setTyping(true);
    });

    socket.on("stopTyping", ({ from }) => {
      if (from === selectedRef.current?._id) setTyping(false);
    });

    socket.on("messagesUpdated", () => {
      const active = selectedRef.current;
      if (active?._id) fetchMessages(active._id);
    });

    socket.on("presenceUpdate", (data) => {
      setChats((prev) =>
        prev.map((c) =>
          c.user._id === data.userId
            ? {
                ...c,
                user: {
                  ...c.user,
                  isOnline: data.isOnline,
                  lastSeen: data.lastSeen,
                },
              }
            : c
        )
      );
      setSelectedUser((prev) =>
        prev?._id === data.userId
          ? { ...prev, isOnline: data.isOnline, lastSeen: data.lastSeen }
          : prev
      );
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("messagesUpdated");
      socket.off("presenceUpdate");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, fetchMessages]);

  /* Auto-scroll to newest */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  /* ===================== ACTIONS ===================== */

  const openChat = (chatUser) => {
    setSelectedUser(chatUser);
    setMessages([]);
    setTyping(false);
    fetchMessages(chatUser._id);
    navigate(`/chat/${chatUser._id}`, { replace: true });
  };

  const closeChat = () => {
    setSelectedUser(null);
    setMessages([]);
    navigate("/chat", { replace: true });
  };

  const handleTyping = (value) => {
    setText(value);
    if (!selectedUser?._id) return;

    socket.emit("typing", {
      to: selectedUser._id,
      from: user?._id,
    });

    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("stopTyping", {
        to: selectedUser._id,
        from: user?._id,
      });
    }, 1200);
  };

  const handleSend = async (e) => {
    e?.preventDefault?.();
    if ((!text.trim() && !file) || !selectedUser || sending) return;

    const formData = new FormData();
    formData.append("receiver", selectedUser._id);
    formData.append("text", text);
    if (file) formData.append("file", file);

    try {
      setSending(true);
      const { data } = await API.post("/messages/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessages((prev) => [...prev, data]);
      socket.emit("sendMessage", data);

      setText("");
      setFile(null);

      socket.emit("stopTyping", {
        to: selectedUser._id,
        from: user?._id,
      });

      setChats((prev) =>
        prev.map((c) =>
          c.user._id === selectedUser._id
            ? {
                ...c,
                lastMessage: data.text || "Attachment",
                updatedAt: data.createdAt || new Date().toISOString(),
              }
            : c
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Message failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (m) => {
    if (!confirm("Delete this message?")) return;
    try {
      await API.put(`/messages/delete/${m._id}`);
      if (selectedUser?._id) fetchMessages(selectedUser._id);
    } catch {
      toast.error("Could not delete message");
    }
  };

  const pickFile = (f) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      return toast.error("File must be under 10 MB");
    }
    setFile(f);
  };

  /* ===================== DERIVED ===================== */

  const filteredChats = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sorted = [...chats].sort(
      (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
    );
    if (!q) return sorted;
    return sorted.filter((c) =>
      [c.user?.name, c.user?.company]
        .filter(Boolean)
        .some((f) => f.toLowerCase().includes(q))
    );
  }, [chats, search]);

  /* ===================== RENDER ===================== */

  return (
    <div className="pt-4 pb-4">
      <div className="card overflow-hidden grid grid-cols-1 lg:grid-cols-[330px_1fr] h-[calc(100vh-150px)] min-h-[480px]">
        {/* ---------- CONVERSATION LIST ---------- */}
        <aside
          className={`border-r border-line flex-col min-h-0 ${
            selectedUser ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="p-3 border-b border-line shrink-0">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="input pl-9 !h-9 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {listLoading ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton circle className="w-10 h-10" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-2.5 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredChats.length === 0 ? (
              <EmptyState
                compact
                icon={Users}
                title={search ? "No matches" : "No conversations"}
                description={
                  search
                    ? "Try another name."
                    : "Connect with people to start chatting."
                }
              />
            ) : (
              <ul>
                {filteredChats.map((c) => {
                  const active = selectedUser?._id === c.user._id;
                  return (
                    <li key={c.user._id}>
                      <button
                        onClick={() => openChat(c.user)}
                        className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors border-l-2 ${
                          active
                            ? "bg-brand-soft border-brand"
                            : "border-transparent hover:bg-surface-2"
                        }`}
                      >
                        <div className="relative shrink-0">
                          <Avatar user={c.user} size={40} />
                          {c.user.isOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-ink truncate text-sm">
                              {c.user.name}
                            </span>
                            {c.updatedAt && (
                              <span className="text-[10px] text-muted shrink-0">
                                {dayjs(c.updatedAt).format("MMM D")}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <span className="text-xs text-muted truncate">
                              {c.lastMessage || "No messages yet"}
                            </span>
                            {c.unread > 0 && (
                              <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                                {c.unread > 9 ? "9+" : c.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* ---------- THREAD ---------- */}
        <section
          className={`flex-col min-h-0 ${
            selectedUser ? "flex" : "hidden lg:flex"
          }`}
        >
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={MessageCircle}
                title="Select a conversation"
                description="Choose someone from the list to start chatting."
              />
            </div>
          ) : (
            <>
              {/* HEADER */}
              <header className="flex items-center gap-3 px-4 py-3 border-b border-line shrink-0">
                <button
                  onClick={closeChat}
                  className="icon-btn !w-9 !h-9 lg:hidden"
                  aria-label="Back"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="relative shrink-0">
                  <Avatar user={selectedUser} size={38} />
                  {selectedUser.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <button
                    onClick={() => navigate(`/profile/${selectedUser._id}`)}
                    className="font-semibold text-ink truncate hover:underline block text-left"
                  >
                    {selectedUser.name}
                  </button>
                  <p className="text-xs text-muted">
                    {typing ? (
                      <span className="text-brand">typing…</span>
                    ) : selectedUser.isOnline ? (
                      "Online"
                    ) : selectedUser.lastSeen ? (
                      `Last seen ${dayjs(selectedUser.lastSeen).fromNow?.() ||
                        dayjs(selectedUser.lastSeen).format("MMM D, h:mm A")}`
                    ) : (
                      "Offline"
                    )}
                  </p>
                </div>
              </header>

              {/* MESSAGES */}
              <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-2 bg-surface-2/30">
                {threadLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        className={`h-10 ${
                          i % 2 ? "w-1/2 ml-auto" : "w-2/5"
                        }`}
                      />
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <EmptyState
                      compact
                      icon={MessageCircle}
                      title="No messages yet"
                      description={`Say hello to ${selectedUser.name}.`}
                    />
                  </div>
                ) : (
                  messages.map((m, i) => (
                    <MessageBubble
                      key={m._id || i}
                      m={m}
                      mine={(m.sender?._id || m.sender) === user?._id}
                      onDelete={() => handleDelete(m)}
                    />
                  ))
                )}

                {typing && (
                  <div className="flex items-center gap-1.5 px-3 py-2 w-fit rounded-2xl bg-surface border border-line">
                    <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* COMPOSER */}
              <form
                onSubmit={handleSend}
                className="border-t border-line p-3 shrink-0"
              >
                {file && (
                  <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-surface-2 border border-line">
                    <FileText size={14} className="text-muted shrink-0" />
                    <span className="text-xs text-ink truncate flex-1">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="icon-btn !w-7 !h-7"
                      aria-label="Remove attachment"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label
                    className="icon-btn !w-10 !h-10 border border-line cursor-pointer shrink-0"
                    title="Attach a file"
                  >
                    <Paperclip size={17} />
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => pickFile(e.target.files?.[0])}
                    />
                  </label>
                  <input
                    value={text}
                    onChange={(e) => handleTyping(e.target.value)}
                    placeholder={`Message ${selectedUser.name}…`}
                    className="input flex-1"
                  />
                  <button
                    type="submit"
                    disabled={(!text.trim() && !file) || sending}
                    className="icon-btn !w-10 !h-10 bg-brand text-white hover:bg-brand disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    aria-label="Send"
                  >
                    <Send size={17} />
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

/* ---------------- message bubble ---------------- */
const MessageBubble = ({ m, mine, onDelete }) => {
  const deleted = m.deleted || m.deletedForEveryone;
  const isImage =
    m.fileUrl && (m.fileMimeType || m.fileType || "").startsWith("image/");

  return (
    <div className={`flex group ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[78%] sm:max-w-[65%] flex items-end gap-1.5`}>
        {mine && !deleted && (
          <button
            onClick={onDelete}
            className="icon-btn !w-7 !h-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-red-500 shrink-0"
            aria-label="Delete message"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        )}

        <div
          className={`rounded-2xl px-3.5 py-2 ${
            mine
              ? "bg-brand text-white rounded-br-md"
              : "bg-surface border border-line text-ink rounded-bl-md"
          }`}
        >
          {deleted ? (
            <p
              className={`text-sm italic ${
                mine ? "text-white/70" : "text-muted"
              }`}
            >
              This message was deleted
            </p>
          ) : (
            <>
              {m.fileUrl && (
                <div className="mb-1.5">
                  {isImage ? (
                    <a href={m.fileUrl} target="_blank" rel="noreferrer">
                      <img
                        src={m.fileUrl}
                        alt={m.fileName || "attachment"}
                        className="rounded-lg max-h-56 object-cover"
                        loading="lazy"
                      />
                    </a>
                  ) : (
                    <a
                      href={m.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${
                        mine
                          ? "bg-white/15 hover:bg-white/25"
                          : "bg-surface-2 hover:bg-surface-3"
                      } transition-colors`}
                    >
                      <FileText size={15} className="shrink-0" />
                      <span className="truncate max-w-[180px]">
                        {m.fileName || "Attachment"}
                      </span>
                      <Download size={13} className="shrink-0 opacity-70" />
                    </a>
                  )}
                </div>
              )}

              {m.text && (
                <p className="text-sm whitespace-pre-wrap break-words">
                  {m.text}
                </p>
              )}

              <div
                className={`flex items-center gap-1.5 mt-1 text-[10px] ${
                  mine ? "text-white/70" : "text-muted"
                }`}
              >
                {m.createdAt && dayjs(m.createdAt).format("h:mm A")}
                {m.edited && <span>· edited</span>}
                {mine && m.read && <span>· seen</span>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Dot = ({ delay = "0ms" }) => (
  <span
    className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
    style={{ animationDelay: delay }}
  />
);

export default Chat;

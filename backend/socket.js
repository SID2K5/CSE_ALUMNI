import { Server } from "socket.io";

let io;

/* =====================================================
   🔥 ONLINE USERS MAP
   userId -> Set(socketIds)
===================================================== */

const onlineUsers = new Map();

export const initSocket = (server) => {

  io = new Server(server, {

    cors: {
      origin: "*",
      credentials: true,
    },

    transports: [
      "websocket",
      "polling",
    ],
  });

  io.on(
    "connection",
    (socket) => {

      console.log(
        "🟢 User connected:",
        socket.id
      );

      /* =====================================================
         🔥 USER JOIN
      ===================================================== */

      socket.on(
        "join",
        async (userId) => {

          try {

            console.log(
              "🔥 JOIN EVENT:",
              userId
            );

            if (!userId)
              return;

            socket.userId =
              userId;

            const User =
              (
                await import(
                  "./models/User.js"
                )
              ).default;

            /* =====================================================
               🔥 MULTI TAB SUPPORT
            ===================================================== */

            if (
              !onlineUsers.has(
                userId
              )
            ) {

              onlineUsers.set(
                userId,
                new Set()
              );
            }

            onlineUsers
              .get(userId)
              .add(socket.id);

            /* =====================================================
               🔥 PERSONAL ROOM
            ===================================================== */

            socket.join(
              userId.toString()
            );

            /* =====================================================
               🔥 UPDATE DATABASE
            ===================================================== */

            await User.findByIdAndUpdate(
              userId,
              {
                isOnline: true,

                // ✅ VERY IMPORTANT
                // REMOVE LAST SEEN WHEN ONLINE
                lastSeen: null,

                lastActive:
                  new Date(),
              }
            );

            /* =====================================================
               🔥 LIVE PRESENCE UPDATE
            ===================================================== */

            io.emit(
              "presenceUpdate",
              {
                userId,

                isOnline: true,

                lastSeen: null,
              }
            );

            /* =====================================================
               🔥 SEND ONLINE USERS
            ===================================================== */

            io.emit(
              "onlineUsers",
              Array.from(
                onlineUsers.keys()
              )
            );

            console.log(
              `✅ ${userId} online`
            );

          } catch (err) {

            console.error(
              "❌ JOIN ERROR:",
              err.message
            );
          }
        }
      );

      /* =====================================================
         💬 RECEIVE MESSAGE EVENT
      ===================================================== */

      socket.on(
        "sendMessage",
        async (
          messageData
        ) => {

          try {

            if (
              !messageData
            )
              return;

            const receiverId =
              messageData
                .receiver
                ?._id ||
              messageData
                .receiver;

            const senderId =
              messageData
                .sender
                ?._id ||
              messageData
                .sender;

            io.to(
              receiverId.toString()
            ).emit(
              "receiveMessage",
              messageData
            );

            io.to(
              senderId.toString()
            ).emit(
              "receiveMessage",
              messageData
            );

            io.to(
              receiverId.toString()
            ).emit(
              "chatUpdate"
            );

            io.to(
              senderId.toString()
            ).emit(
              "chatUpdate"
            );

          } catch (err) {

            console.error(
              "❌ sendMessage ERROR:",
              err.message
            );
          }
        }
      );

      /* =====================================================
         ✨ TYPING
      ===================================================== */

      socket.on(
        "typing",
        ({ to, from }) => {

          try {

            if (
              !to ||
              !from
            )
              return;

            io.to(
              to.toString()
            ).emit(
              "typing",
              { from }
            );

          } catch (err) {

            console.error(
              "❌ typing ERROR:",
              err.message
            );
          }
        }
      );

      socket.on(
        "stopTyping",
        ({
          to,
          from,
        }) => {

          try {

            if (
              !to ||
              !from
            )
              return;

            io.to(
              to.toString()
            ).emit(
              "stopTyping",
              { from }
            );

          } catch (err) {

            console.error(
              "❌ stopTyping ERROR:",
              err.message
            );
          }
        }
      );

      /* =====================================================
         👀 READ RECEIPTS
      ===================================================== */

      socket.on(
        "markRead",
        ({
          from,
          to,
        }) => {

          try {

            if (
              !from ||
              !to
            )
              return;

            io.to(
              to.toString()
            ).emit(
              "messagesRead",
              { from }
            );

            io.to(
              to.toString()
            ).emit(
              "chatUpdate"
            );

            io.to(
              from.toString()
            ).emit(
              "chatUpdate"
            );

          } catch (err) {

            console.error(
              "❌ markRead ERROR:",
              err.message
            );
          }
        }
      );

      /* =====================================================
         🚫 DELETE MESSAGE
      ===================================================== */

      socket.on(
        "deleteMessage",
        ({
          messageId,
          to,
        }) => {

          try {

            if (
              !messageId ||
              !to
            )
              return;

            io.to(
              to.toString()
            ).emit(
              "messageDeleted",
              {
                messageId,
              }
            );

          } catch (err) {

            console.error(
              "❌ deleteMessage ERROR:",
              err.message
            );
          }
        }
      );

      /* =====================================================
         🔔 NOTIFICATIONS
      ===================================================== */

      socket.on(
        "sendNotification",
        ({
          to,
          data,
        }) => {

          try {

            if (
              !to ||
              !data
            )
              return;

            io.to(
              to.toString()
            ).emit(
              "notification",
              data
            );

          } catch (err) {

            console.error(
              "❌ notification ERROR:",
              err.message
            );
          }
        }
      );

      /* =====================================================
         🤝 CONNECTION UPDATE
      ===================================================== */

      socket.on(
        "connectionUpdate",
        () => {

          try {

            io.emit(
              "connectionUpdate"
            );

          } catch (err) {

            console.error(
              "❌ connectionUpdate ERROR:",
              err.message
            );
          }
        }
      );

      /* =====================================================
         🔕 MUTE CHAT
      ===================================================== */

      socket.on(
        "muteChat",
        ({
          from,
          to,
        }) => {

          try {

            io.to(
              to.toString()
            ).emit(
              "chatMuted",
              { from }
            );

          } catch (err) {

            console.error(
              "❌ muteChat ERROR:",
              err.message
            );
          }
        }
      );

      /* =====================================================
         🚫 BLOCK USER
      ===================================================== */

      socket.on(
        "blockUser",
        ({
          from,
          to,
        }) => {

          try {

            io.to(
              to.toString()
            ).emit(
              "blockedByUser",
              { from }
            );

          } catch (err) {

            console.error(
              "❌ blockUser ERROR:",
              err.message
            );
          }
        }
      );

      /* =====================================================
         🔴 DISCONNECT
      ===================================================== */

      socket.on(
        "disconnect",
        async () => {

          try {

            console.log(
              "🔴 User disconnected:",
              socket.id
            );

            const User =
              (
                await import(
                  "./models/User.js"
                )
              ).default;

            for (let [
              userId,
              sockets,
            ] of onlineUsers.entries()) {

              if (
                sockets.has(
                  socket.id
                )
              ) {

                sockets.delete(
                  socket.id
                );

                /* =====================================================
                   🔥 ONLY OFFLINE IF NO ACTIVE TABS
                ===================================================== */

                if (
                  sockets.size ===
                  0
                ) {

                  onlineUsers.delete(
                    userId
                  );

                  const lastSeen =
                    new Date();

                  await User.findByIdAndUpdate(
                    userId,
                    {
                      isOnline: false,

                      lastSeen,

                      lastActive:
                        lastSeen,
                    }
                  );

                  io.emit(
                    "presenceUpdate",
                    {
                      userId,

                      isOnline: false,

                      lastSeen,
                    }
                  );

                  console.log(
                    `🔴 ${userId} offline`
                  );
                }

                break;
              }
            }

            /* =====================================================
               🔥 UPDATE ONLINE USERS LIST
            ===================================================== */

            io.emit(
              "onlineUsers",
              Array.from(
                onlineUsers.keys()
              )
            );

          } catch (err) {

            console.error(
              "❌ disconnect ERROR:",
              err.message
            );
          }
        }
      );
    }
  );

  return io;
};

/* =====================================================
   🔥 GET SOCKET INSTANCE
===================================================== */

export const getIO = () => io;

/* =====================================================
   🔥 GET ONLINE USERS
===================================================== */

export const getOnlineUsers =
  () => {

    return Array.from(
      onlineUsers.keys()
    );
  };

/* =====================================================
   🔥 CHECK USER ONLINE
===================================================== */

export const isUserOnline = (
  userId
) => {

  return onlineUsers.has(
    userId
  );
};
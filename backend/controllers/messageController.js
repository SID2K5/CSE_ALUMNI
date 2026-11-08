import Message from "../models/Message.js";
import User from "../models/User.js";

/* =====================================================
   📩 SEND MESSAGE
===================================================== */
export const sendMessage = async (req, res) => {

  try {

    const sender =
      req.user._id;

    const {
      receiver,
      text,
    } = req.body;

    /* =====================================================
       🚫 BLOCK CHECK
    ===================================================== */

    const receiverUser =
      await User.findById(
        receiver
      );

    if (
      receiverUser?.blockedUsers?.includes(
        sender
      )
    ) {

      return res.status(403).json({
        message:
          "You are blocked by this user",
      });
    }

    /* =====================================================
       📎 DETERMINE MESSAGE TYPE
    ===================================================== */

    let messageType =
      "text";

    if (req.file) {

      if (
        req.file.mimetype.startsWith(
          "image"
        )
      ) {

        messageType =
          "image";

      } else if (
        req.file.mimetype ===
        "application/pdf"
      ) {

        messageType =
          "pdf";

      } else {

        messageType =
          "file";
      }
    }

    /* =====================================================
       📂 FILE URL FIX
    ===================================================== */

    let uploadedFileUrl =
      "";

    if (req.file) {

      uploadedFileUrl =
        req.file.path?.startsWith(
          "http"
        )

          ? req.file.path

          : `${req.protocol}://${req.get(
              "host"
            )}/${req.file.path}`;
    }

    /* =====================================================
       📩 CREATE MESSAGE
    ===================================================== */

    const message =
      await Message.create({

        sender,

        receiver,

        text:
          text || "",

        type:
          messageType,

        fileUrl:
          uploadedFileUrl,

        fileName:
          req.file
            ?.originalname || "",

        fileMimeType:
          req.file
            ?.mimetype || "",

        fileSize:
          req.file?.size || 0,

        deliveredAt:
          new Date(),

        deleted:
          false,
      });

    /* =====================================================
       🔥 POPULATE
    ===================================================== */

    const populatedMessage =
      await Message.findById(
        message._id
      )

        .populate(
          "sender",
          "name profilePic isOnline lastSeen"
        )

        .populate(
          "receiver",
          "name profilePic isOnline lastSeen"
        );

    /* =====================================================
       ⚡ SOCKET REALTIME
    ===================================================== */

    const io =
      req.app.get("io");

    if (io) {

      io.to(
        receiver.toString()
      ).emit(
        "receiveMessage",
        populatedMessage
      );

      io.to(
        receiver.toString()
      ).emit(
        "messagesUpdated"
      );

      io.to(
        sender.toString()
      ).emit(
        "messagesUpdated"
      );
    }

    res.status(201).json(
      populatedMessage
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};

/* =====================================================
   💬 GET CHAT MESSAGES
===================================================== */
export const getMessages = async (
  req,
  res
) => {

  try {

    const myId =
      req.user._id;

    const otherUserId =
      req.params.userId;

    const page =
      Number(
        req.query.page
      ) || 1;

    const limit =
      Number(
        req.query.limit
      ) || 30;

    const skip =
      (page - 1) *
      limit;

    const messages =
      await Message.find({

        $or: [

          {
            sender: myId,
            receiver:
              otherUserId,
          },

          {
            sender:
              otherUserId,

            receiver: myId,
          },
        ],
      })

        .sort({
          createdAt: -1,
        })

        .skip(skip)

        .limit(limit)

        .populate(
          "sender",
          "name profilePic isOnline lastSeen"
        )

        .populate(
          "receiver",
          "name profilePic isOnline lastSeen"
        );

    res.json(
      messages.reverse()
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};

/* =====================================================
   👀 MARK AS READ
===================================================== */
export const markAsRead = async (
  req,
  res
) => {

  try {

    const myId =
      req.user._id;

    const otherUserId =
      req.params.userId;

    await Message.updateMany(

      {
        sender:
          otherUserId,

        receiver: myId,

        read: false,
      },

      {
        $set: {

          read: true,

          seenAt:
            new Date(),
        },
      }
    );

    /* =====================================================
       ⚡ REALTIME UPDATE
    ===================================================== */

    const io =
      req.app.get("io");

    if (io) {

      io.to(
        otherUserId
      ).emit(
        "messagesUpdated"
      );
    }

    res.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};

/* =====================================================
   ✏️ EDIT MESSAGE
===================================================== */
export const editMessage = async (
  req,
  res
) => {

  try {

    const myId =
      req.user._id;

    const message =
      await Message.findById(
        req.params.id
      );

    if (!message) {

      return res.status(404).json({
        message:
          "Message not found",
      });
    }

    if (
      message.sender.toString() !==
      myId.toString()
    ) {

      return res.status(401).json({
        message:
          "Not authorized",
      });
    }

    message.text =
      req.body.text;

    message.edited =
      true;

    await message.save();

    const io =
      req.app.get("io");

    if (io) {

      io.emit(
        "messagesUpdated"
      );
    }

    res.json(message);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};

/* =====================================================
   🗑️ DELETE MESSAGE
===================================================== */
export const deleteMessage = async (
  req,
  res
) => {

  try {

    const myId =
      req.user._id;

    const message =
      await Message.findById(
        req.params.id
      );

    if (!message) {

      return res.status(404).json({
        message:
          "Message not found",
      });
    }

    if (
      message.sender.toString() !==
      myId.toString()
    ) {

      return res.status(401).json({
        message:
          "Not authorized",
      });
    }

    message.deleted =
      true;

    message.deletedForEveryone =
      true;

    message.deletedAt =
      new Date();

    message.text =
      "🚫 This message was deleted";

    message.fileUrl = "";

    message.fileName = "";

    message.fileMimeType =
      "";

    await message.save();

    /* =====================================================
       ⚡ REALTIME UPDATE
    ===================================================== */

    const io =
      req.app.get("io");

    if (io) {

      io.emit(
        "messagesUpdated"
      );
    }

    res.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};

/* =====================================================
   😀 REACT TO MESSAGE
===================================================== */
export const reactToMessage = async (
  req,
  res
) => {

  try {

    const myId =
      req.user._id;

    const { emoji } =
      req.body;

    const message =
      await Message.findById(
        req.params.id
      );

    if (!message) {

      return res.status(404).json({
        message:
          "Message not found",
      });
    }

    message.reactions =
      message.reactions.filter(
        (r) =>
          r.user.toString() !==
          myId.toString()
      );

    message.reactions.push({

      user: myId,

      emoji,
    });

    await message.save();

    const io =
      req.app.get("io");

    if (io) {

      io.emit(
        "messagesUpdated"
      );
    }

    res.json(message);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};

/* =====================================================
   🚫 BLOCK USER
===================================================== */
export const blockUser = async (
  req,
  res
) => {

  try {

    const myId =
      req.user._id;

    const blockedUserId =
      req.params.userId;

    const user =
      await User.findById(
        myId
      );

    if (
      !user.blockedUsers.includes(
        blockedUserId
      )
    ) {

      user.blockedUsers.push(
        blockedUserId
      );
    }

    await user.save();

    res.json({

      success: true,

      message:
        "User blocked",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};

/* =====================================================
   📋 CHAT LIST
===================================================== */
export const getChats = async (
  req,
  res
) => {

  try {

    const myId =
      req.user._id;

    const currentUser =
      await User.findById(
        myId
      ).populate(

        "connections",

        "name profilePic company isOnline lastSeen"
      );

    const messages =
      await Message.find({

        $or: [

          { sender: myId },

          { receiver: myId },
        ],
      })

        .sort({
          createdAt: -1,
        })

        .populate(
          "sender",
          "name profilePic isOnline lastSeen"
        )

        .populate(
          "receiver",
          "name profilePic isOnline lastSeen"
        );

    const chatMap =
      new Map();

    /* =====================================================
       🔥 ADD CONNECTIONS
    ===================================================== */

    currentUser.connections.forEach(
      (conn) => {

        chatMap.set(
          conn._id.toString(),

          {

            user: conn,

            lastMessage:
              "",

            updatedAt:
              conn.updatedAt ||
              new Date(),

            unread: 0,
          }
        );
      }
    );

    /* =====================================================
       🔥 MERGE MESSAGE DATA
    ===================================================== */

    messages.forEach((msg) => {

      const otherUser =
        msg.sender._id.toString() ===
        myId.toString()

          ? msg.receiver

          : msg.sender;

      const existing =
        chatMap.get(
          otherUser._id.toString()
        );

      if (
        existing &&
        !existing.lastMessage
      ) {

        existing.lastMessage =
          msg.deleted

            ? "🚫 Message deleted"

            : msg.type ===
              "image"

            ? "📷 Image"

            : msg.type ===
              "pdf"

            ? "📄 PDF"

            : msg.type ===
              "file"

            ? "📎 File"

            : msg.text;

        existing.updatedAt =
          msg.createdAt;

        if (
          msg.receiver._id.toString() ===
            myId.toString() &&
          !msg.read
        ) {

          existing.unread += 1;
        }

        chatMap.set(
          otherUser._id.toString(),
          existing
        );
      }
    });

    /* =====================================================
       🔥 SORT
    ===================================================== */

    const chats =
      Array.from(
        chatMap.values()
      ).sort(
        (a, b) =>
          new Date(
            b.updatedAt
          ) -
          new Date(
            a.updatedAt
          )
      );

    res.json(chats);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};
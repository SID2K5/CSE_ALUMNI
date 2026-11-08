import Connection from "../models/Connection.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

/* =====================================================
   📤 SEND REQUEST
===================================================== */
export const sendRequest = async (req, res) => {
  try {
    const senderId = req.user.id || req.user._id;
    const { receiverId } = req.body;

    if (receiverId === senderId.toString()) {
      return res.status(400).json({
        message: "Cannot connect with yourself",
      });
    }

    const existing = await Connection.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existing) {
      if (existing.status === "accepted") {
        return res.status(400).json({
          message: "Already connected",
        });
      }

      return res.status(400).json({
        message: "Request already exists",
      });
    }

    const connection = await Connection.create({
      sender: senderId,
      receiver: receiverId,
    });

    await User.findByIdAndUpdate(receiverId, {
      $addToSet: {
        connectionRequests: senderId,
      },
    });

    await Notification.create({
      user: receiverId,
      sender: senderId,
      type: "connection_request",
      message: "sent you a connection request",
      link: `/profile/${senderId}`,
      meta: { connectionId: connection._id },
    });

    const io = req.app.get("io");

    if (io) {
      io.to(receiverId.toString()).emit("notification", {
        type: "connection_request",
        from: senderId,
        message: "New connection request",
      });

      io.emit("connectionUpdate");
    }

    res.status(201).json(connection);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =====================================================
   📥 ACCEPT / REJECT REQUEST
===================================================== */
export const respondRequest = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { status } = req.body;

    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (connection.receiver.toString() !== userId.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    connection.status = status;
    await connection.save();

    await User.findByIdAndUpdate(connection.receiver, {
      $pull: {
        connectionRequests: connection.sender,
      },
    });

    if (status === "accepted") {

      await User.findByIdAndUpdate(connection.sender, {
        $addToSet: {
          connections: connection.receiver,
        },
      });

      await User.findByIdAndUpdate(connection.receiver, {
        $addToSet: {
          connections: connection.sender,
        },
      });

      await Notification.create({
        user: connection.sender,
        sender: userId,
        type: "connection_accepted",
        message: "accepted your connection request",
        link: `/profile/${userId}`,
        meta: { connectionId: connection._id },
      });
    }

    if (status === "rejected") {
      await connection.deleteOne();
    }

    const io = req.app.get("io");

    if (io) {
      io.to(connection.sender.toString()).emit("notification", {
        type: "connection_accepted",
        message:
          status === "accepted"
            ? "Your connection request was accepted"
            : "Your connection request was rejected",
      });

      io.emit("connectionUpdate");
    }

    res.json(connection);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =====================================================
   ❌ CANCEL REQUEST
===================================================== */
export const cancelRequest = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (connection.sender.toString() !== userId.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    await User.findByIdAndUpdate(connection.receiver, {
      $pull: {
        connectionRequests: connection.sender,
      },
    });

    await connection.deleteOne();

    const io = req.app.get("io");

    if (io) {
      io.emit("connectionUpdate");
    }

    res.json({
      message: "Request cancelled",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =====================================================
   👥 GET MY CONNECTIONS + FILTERS
===================================================== */
export const getConnections = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const { company, location, year } = req.query;

    const connections = await Connection.find({
      status: "accepted",
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    })
      .populate(
        "sender",
        "name profilePic bio company location graduationYear role"
      )
      .populate(
        "receiver",
        "name profilePic bio company location graduationYear role"
      );

    let users = connections.map((c) => {
      if (c.sender._id.toString() === userId.toString()) {
        return c.receiver;
      }

      return c.sender;
    });

    users = users.filter(Boolean);

    if (company) {
      const companies = company.split(",");

      users = users.filter(
        (u) =>
          u.company &&
          companies.includes(u.company)
      );
    }

    if (location) {
      const locations = location.split(",");

      users = users.filter(
        (u) =>
          u.location &&
          locations.includes(u.location)
      );
    }

    if (year) {
      const years = year.split(",");

      users = users.filter(
        (u) =>
          years.includes(
            String(u.graduationYear)
          )
      );
    }

    res.json(users);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


/* =====================================================
   🎯 FILTER OPTIONS
===================================================== */
export const getConnectionFilterOptions = async (
  req,
  res
) => {
  try {

    const companies = await User.distinct(
      "company",
      {
        company: { $ne: "" },
      }
    );

    const locations = await User.distinct(
      "location",
      {
        location: { $ne: "" },
      }
    );

    const years = await User.distinct(
      "graduationYear",
      {
        graduationYear: { $ne: null },
      }
    );

    res.json({
      companies: companies.sort(),
      locations: locations.sort(),
      years: years.sort((a, b) => b - a),
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


/* =====================================================
   ⏳ GET PENDING REQUESTS
===================================================== */
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const requests = await Connection.find({
      receiver: userId,
      status: "pending",
    }).populate(
      "sender",
      "name profilePic company location graduationYear role"
    );

    res.json(requests);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =====================================================
   📤 SENT REQUESTS
===================================================== */
export const getSentRequests = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const requests = await Connection.find({
      sender: userId,
      status: "pending",
    }).populate(
      "receiver",
      "name profilePic company location graduationYear"
    );

    res.json(requests);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =====================================================
   🔍 CONNECTION STATUS
===================================================== */
export const getConnectionStatus = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { userId: targetId } = req.params;

    const connection = await Connection.findOne({
      $or: [
        { sender: userId, receiver: targetId },
        { sender: targetId, receiver: userId },
      ],
    });

    if (!connection) {
      return res.json({ status: "none" });
    }

    if (connection.status === "accepted") {
      return res.json({
        status: "connected",
      });
    }

    if (
      connection.sender.toString() === userId.toString()
    ) {
      return res.json({
        status: "pending_sent",
        id: connection._id,
      });
    }

    return res.json({
      status: "pending_received",
      id: connection._id,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =====================================================
   🤝 MUTUAL CONNECTIONS
===================================================== */
export const getMutualConnections = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { userId: targetId } = req.params;

    const currentConnections = await Connection.find({
      status: "accepted",
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    });

    const targetConnections = await Connection.find({
      status: "accepted",
      $or: [
        { sender: targetId },
        { receiver: targetId },
      ],
    });

    const currentIds = currentConnections.map((c) =>
      c.sender.toString() === userId.toString()
        ? c.receiver.toString()
        : c.sender.toString()
    );

    const targetIds = targetConnections.map((c) =>
      c.sender.toString() === targetId.toString()
        ? c.receiver.toString()
        : c.sender.toString()
    );

    const mutual = currentIds.filter((id) =>
      targetIds.includes(id)
    );

    res.json({
      count: mutual.length,
      users: mutual,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =====================================================
   💡 SUGGESTIONS
===================================================== */
export const getSuggestions = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const acceptedConnections = await Connection.find({
      status: "accepted",
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    });

    const connectedIds = acceptedConnections.map((c) =>
      c.sender.toString() === userId.toString()
        ? c.receiver
        : c.sender
    );

    const users = await User.find({
      _id: {
        $ne: userId,
        $nin: connectedIds,
      },
    }).select(
      "name profilePic bio company location graduationYear role"
    );

    res.json(users);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =====================================================
   ❌ REMOVE CONNECTION
===================================================== */
export const removeConnection = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id: targetId } = req.params;

    // Find accepted connection
    const connection = await Connection.findOne({
      status: "accepted",
      $or: [
        { sender: userId, receiver: targetId },
        { sender: targetId, receiver: userId },
      ],
    });

    if (!connection) {
      return res.status(404).json({
        message: "Connection not found",
      });
    }

    // Remove from users collection
    await User.findByIdAndUpdate(userId, {
      $pull: {
        connections: targetId,
      },
    });

    await User.findByIdAndUpdate(targetId, {
      $pull: {
        connections: userId,
      },
    });

    // Delete connection document
    await connection.deleteOne();

    const io = req.app.get("io");

    if (io) {
      io.emit("connectionUpdate");
    }

    res.json({
      message: "Connection removed successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
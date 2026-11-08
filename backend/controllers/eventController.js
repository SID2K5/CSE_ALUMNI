import Event from "../models/Event.js";
import Notification from "../models/Notification.js";

/* =====================================================
   ================= CREATE EVENT =================
===================================================== */
export const createEvent = async (req, res) => {
  try {

    /* =====================================================
       🔒 ROLE CHECK
       ONLY:
       ✅ alumni
       ✅ teacher
       ✅ admin
    ===================================================== */
    if (
      req.user.role !== "alumni" &&
      req.user.role !== "teacher" &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not authorized to create events",
      });
    }

    /* =====================================================
       🔐 USER CHECK
    ===================================================== */
    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized, no user",
      });
    }

    const {
      title,
      description,
      startDate,
      endDate,
      location,
      autoDelete,
      category,
    } = req.body;

    /* =====================================================
       🧠 VALIDATION
    ===================================================== */
    if (
      !title ||
      !description ||
      !startDate ||
      !endDate ||
      !location
    ) {
      return res.status(400).json({
        message:
          "All fields (title, description, startDate, endDate, location) are required",
      });
    }

    /* =====================================================
       📅 DATE VALIDATION
    ===================================================== */
    if (
      new Date(endDate) <
      new Date(startDate)
    ) {
      return res.status(400).json({
        message:
          "End date cannot be before start date",
      });
    }

    /* =====================================================
       🔥 HANDLE FILE
       IMAGE / PDF / ANY FILE
    ===================================================== */
    let fileUrl = "";

    if (req.file) {

      console.log(
        "📂 Uploaded file:",
        req.file
      );

      fileUrl =
        req.file.path ||
        req.file.secure_url ||
        (req.file.buffer
          ? "FILE_UPLOADED"
          : "");
    }

    /* =====================================================
       🚀 CREATE EVENT
    ===================================================== */
    const event = await Event.create({
      title,
      description,

      startDate,
      endDate,

      location,

      poster: fileUrl,

      createdBy: req.user._id,

      // ✅ DIRECTLY PUBLISH EVENT
      status: "approved",
      isApproved: true,

      attendees: [],

      // 🧹 AUTO DELETE
      autoDelete:
        autoDelete || false,

      // 📂 CATEGORY
      category:
        category || "General",
    });

    console.log(
      "✅ Event created:",
      event
    );

    res.status(201).json({
      message:
        "Event created successfully",
      event,
    });

  } catch (error) {

    console.error(
      "❌ CREATE EVENT ERROR:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Server Error",
    });
  }
};

/* =====================================================
   ================= GET APPROVED EVENTS =================
===================================================== */
export const getEvents = async (
  req,
  res
) => {
  try {

    // Public listing — only approved, non-deleted events.
    // Pending events (if any) must only appear in the admin queue.
    const events = await Event.find({
      deletedAt: null,
      isApproved: true,
      status: "approved",
    })
      .populate(
        "createdBy",
        "name profilePic role"
      )
      .populate(
        "attendees",
        "name profilePic"
      )
      .sort({
        startDate: 1,
      });

    res.json(events);

  } catch (error) {

    console.error(
      "❌ GET EVENTS ERROR:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};

/* =====================================================
   ================= GET SINGLE EVENT =================
===================================================== */
export const getSingleEvent = async (
  req,
  res
) => {
  try {

    const event =
      await Event.findById(
        req.params.id
      )
        .populate(
          "createdBy",
          "name profilePic role"
        )
        .populate(
          "attendees",
          "name profilePic"
        );

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.json(event);

  } catch (error) {

    console.error(
      "❌ GET SINGLE EVENT ERROR:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};

/* =====================================================
   ================= RSVP TO EVENT =================
===================================================== */
export const toggleRSVP = async (
  req,
  res
) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    const event =
      await Event.findById(
        req.params.id
      );

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const userId =
      req.user._id.toString();

    const alreadyJoined =
      event.attendees.some(
        (id) =>
          id.toString() === userId
      );

    /* =====================================================
       ❌ REMOVE RSVP
    ===================================================== */
    if (alreadyJoined) {

      event.attendees =
        event.attendees.filter(
          (id) =>
            id.toString() !==
            userId
        );

    } else {

      /* =====================================================
         ✅ ADD RSVP
      ===================================================== */
      event.attendees.push(userId);

      /* =====================================================
         🔔 NOTIFY CREATOR
      ===================================================== */
      if (
        event.createdBy.toString() !==
        userId
      ) {
        await Notification.create({
          user: event.createdBy,

          text: `${req.user.name} is attending your event "${event.title}" 🎉`,
        });
      }
    }

    await event.save();

    res.json(event);

  } catch (error) {

    console.error(
      "❌ RSVP ERROR:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};

/* =====================================================
   ================= ADMIN: GET PENDING EVENTS =================
===================================================== */
export const getPendingEvents =
  async (req, res) => {
    try {

      console.log(
        "🔍 Fetching pending events..."
      );

      const events =
        await Event.find({
          status: "pending",
          isApproved: false,
          deletedAt: null,
        }).populate(
          "createdBy",
          "name profilePic role"
        );

      console.log(
        "📊 Pending events:",
        events.length
      );

      res.json(events);

    } catch (error) {

      console.error(
        "❌ GET PENDING EVENTS ERROR:",
        error
      );

      res.status(500).json({
        message: "Server Error",
      });
    }
  };

/* =====================================================
   ================= ADMIN: APPROVE EVENT =================
===================================================== */
export const approveEvent =
  async (req, res) => {
    try {

      const event =
        await Event.findById(
          req.params.id
        );

      if (!event) {
        return res
          .status(404)
          .json({
            message:
              "Event not found",
          });
      }

      event.status = "approved";

      event.isApproved = true;

      await event.save();

      /* =====================================================
         🔔 NOTIFY CREATOR
      ===================================================== */
      await Notification.create({
        user: event.createdBy,

        text: `Your event "${event.title}" has been approved 🎉`,
      });

      res.json({
        message:
          "Event approved",
        event,
      });

    } catch (error) {

      console.error(
        "❌ APPROVE EVENT ERROR:",
        error
      );

      res.status(500).json({
        message: "Server Error",
      });
    }
  };

/* =====================================================
   ================= ADMIN: REJECT EVENT =================
===================================================== */
export const rejectEvent =
  async (req, res) => {
    try {

      const event =
        await Event.findById(
          req.params.id
        );

      if (!event) {
        return res
          .status(404)
          .json({
            message:
              "Event not found",
          });
      }

      event.status = "rejected";

      await event.save();

      /* =====================================================
         🔔 NOTIFY CREATOR
      ===================================================== */
      await Notification.create({
        user: event.createdBy,

        text: `Your event "${event.title}" was rejected ❌`,
      });

      res.json({
        message:
          "Event rejected",
        event,
      });

    } catch (error) {

      console.error(
        "❌ REJECT EVENT ERROR:",
        error
      );

      res.status(500).json({
        message: "Server Error",
      });
    }
  };

/* =====================================================
   ================= DELETE EVENT =================
===================================================== */
export const deleteEvent =
  async (req, res) => {
    try {

      const event =
        await Event.findById(
          req.params.id
        );

      if (!event) {
        return res
          .status(404)
          .json({
            message:
              "Event not found",
          });
      }

      /* =====================================================
         👑 ADMIN CAN DELETE ANY EVENT
      ===================================================== */
      if (
        req.user.role === "admin"
      ) {

        await event.deleteOne();

        return res.json({
          message:
            "Event deleted by admin",
        });
      }

      /* =====================================================
         👤 CREATOR CAN DELETE OWN EVENT
      ===================================================== */
      if (
        event.createdBy.toString() ===
        req.user._id.toString()
      ) {

        await event.deleteOne();

        return res.json({
          message:
            "Your event deleted successfully",
        });
      }

      /* =====================================================
         ❌ OTHERWISE DENY
      ===================================================== */
      return res
        .status(403)
        .json({
          message:
            "Not authorized to delete this event",
        });

    } catch (error) {

      console.error(
        "❌ DELETE EVENT ERROR:",
        error
      );

      res.status(500).json({
        message: "Server Error",
      });
    }
  };

/* =====================================================
   ================= AUTO DELETE EXPIRED EVENTS =================
===================================================== */
export const cleanupExpiredEvents =
  async () => {
    try {

      const now = new Date();

      const expiredEvents =
        await Event.find({
          autoDelete: true,

          endDate: {
            $lt: now,
          },
        });

      for (const event of expiredEvents) {

        await Event.findByIdAndDelete(
          event._id
        );

        console.log(
          "🧹 Auto deleted expired event:",
          event.title
        );
      }

    } catch (error) {

      console.error(
        "❌ CLEANUP ERROR:",
        error
      );
    }
  };
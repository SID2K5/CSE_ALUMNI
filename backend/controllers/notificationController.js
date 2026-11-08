import Notification from "../models/Notification.js";

/* =====================================================
   🔔 GET ALL NOTIFICATIONS
===================================================== */
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find({
      user: req.user._id,
    })
      .populate("sender", "name profilePic")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json(notifications);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =====================================================
   🔴 GET UNREAD COUNT (VERY IMPORTANT FOR 🔔)
===================================================== */
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.json({ count });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =====================================================
   ✅ MARK SINGLE AS READ
===================================================== */
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // 🔥 SECURITY FIX
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    notification.isRead = true;
    notification.readAt = new Date();

    await notification.save();

    res.json(notification);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =====================================================
   ✅ MARK ALL AS READ (LINKEDIN STYLE 🔥)
===================================================== */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        user: req.user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    res.json({ message: "All notifications marked as read" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =====================================================
   🗑️ DELETE NOTIFICATION (OPTIONAL CLEANUP)
===================================================== */
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Not found" });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await notification.deleteOne();

    res.json({ message: "Notification removed" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
import User from "../models/User.js";

// 🔖 Toggle Bookmark
export const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const jobId = req.params.jobId;

    const alreadySaved = user.bookmarks.includes(jobId);

    if (alreadySaved) {
      user.bookmarks = user.bookmarks.filter(
        (id) => id.toString() !== jobId
      );
    } else {
      user.bookmarks.push(jobId);
    }

    await user.save();

    res.json({
      success: true,
      bookmarks: user.bookmarks,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔖 Get Bookmarked Jobs
export const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("bookmarks");

    res.json(user.bookmarks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
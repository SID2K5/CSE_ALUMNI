import User from "../models/User.js";
import Post from "../models/Post.js";
import Job from "../models/Job.js";

// Escape user input before putting it into a RegExp, so characters like
// `.*+?^${}()|[]\` don't become operators and a crafted query can't DoS
// the DB or match things the user shouldn't see.
const escapeRegExp = (str) =>
  String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const globalSearch = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || !String(query).trim()) {
      return res.json({ users: [], posts: [], jobs: [] });
    }

    const safe = escapeRegExp(String(query).trim());
    const regex = new RegExp(safe, "i");

    const users = await User.find({
      name: regex,
      isApproved: true,
    })
      .select("-password") // belt-and-braces; password is select:false anyway
      .limit(5);

    const posts = await Post.find({
      content: regex,
      isDeleted: { $ne: true },
    }).limit(5);

    const jobs = await Job.find({
      title: regex,
    }).limit(5);

    res.json({ users, posts, jobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

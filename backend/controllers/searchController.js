import User from "../models/User.js";
import Post from "../models/Post.js";
import Job from "../models/Job.js";

export const globalSearch = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.json({ users: [], posts: [], jobs: [] });
    }

    const regex = new RegExp(query, "i");

    const users = await User.find({
      name: regex,
      isApproved: true,
    }).limit(5);

    const posts = await Post.find({
      content: regex,
    }).limit(5);

    const jobs = await Job.find({
      title: regex,
    }).limit(5);

    res.json({ users, posts, jobs });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
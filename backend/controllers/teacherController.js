import User from "../models/User.js";
import Resource from "../models/Resource.js";
import Post from "../models/Post.js";

// =========================
// GET ALL TEACHERS
// =========================
export const getTeachers = async (req, res) => {
  try {
    const { search } = req.query;

    let query = {
      role: "teacher",
      isApproved: true,
    };

    // Search by teacher name
    if (search) {
      query.name = {
        $regex: search,
        $options: "i",
      };
    }

    const teachers = await User.find(query);

    res.json(teachers);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// GET SINGLE TEACHER PROFILE
// =========================
export const getTeacherProfile = async (req, res) => {
  try {

    // Teacher Details
    const teacher = await User.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    // Teacher Resources
    const resources = await Resource.find({
      uploadedBy: req.params.id,
    }).sort({ createdAt: -1 });

    // Teacher Posts
    const posts = await Post.find({
      user: req.params.id,
    }).sort({ createdAt: -1 });

    res.json({
      teacher,
      resources,
      posts,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
import User from "../models/User.js";
import Resource from "../models/Resource.js";
import Post from "../models/Post.js";

// =========================
// GET ALL TEACHERS
// =========================
const escapeRegExp = (s) =>
  String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getTeachers = async (req, res) => {
  try {
    const { search, department, specialization } = req.query;

    const query = {
      role: "teacher",
      isApproved: true,
    };

    // Free-text search spans name, department and specialization.
    if (search) {
      const rx = { $regex: escapeRegExp(search), $options: "i" };
      query.$or = [
        { name: rx },
        { department: rx },
        { specialization: rx },
        { designation: rx },
      ];
    }

    // Explicit filters
    if (department) {
      query.department = {
        $regex: escapeRegExp(department),
        $options: "i",
      };
    }

    if (specialization) {
      query.specialization = {
        $regex: escapeRegExp(specialization),
        $options: "i",
      };
    }

    const teachers = await User.find(query)
      .select("-password")
      .sort({ name: 1 });

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
    const teacher = await User.findById(req.params.id).select("-password");

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
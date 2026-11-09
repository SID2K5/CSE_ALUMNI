import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Post from "../models/Post.js";
import Event from "../models/Event.js";
import Job from "../models/Job.js";

/* =====================================================
   DASHBOARD
===================================================== */

// Get dashboard stats
export const getStats = async (
  req,
  res
) => {

  try {

    const users =
      await User.countDocuments();

    const posts =
      await Post.countDocuments({
        isDeleted: false,
      });

    const pendingUsers =
      await User.countDocuments({
        isApproved: false,
      });

    const pendingEvents =
      await Event.countDocuments({
        isApproved: false,
      });

    const teachers =
      await User.countDocuments({
        role: "teacher",
      });

    // NEW
    const reportedPosts =
      await Post.countDocuments({
        reports: {
          $exists: true,
          $not: {
            $size: 0,
          },
        },
      });

    /* =====================================================
       Additional real counts for the admin dashboard cards.
       All derived from live collections — no estimates.
    ===================================================== */

    const events =
      await Event.countDocuments({
        deletedAt: null,
      });

    const jobs =
      await Job.countDocuments({
        status: "approved",
      });

    const pendingJobs =
      await Job.countDocuments({
        status: "pending",
      });

    const alumni =
      await User.countDocuments({
        isAlumni: true,
        isApproved: true,
      });

    const students =
      await User.countDocuments({
        role: "student",
        isApproved: true,
      });

    res.json({
      users,
      posts,
      pendingUsers,
      pendingEvents,
      teachers,
      reportedPosts,

      // new
      events,
      jobs,
      pendingJobs,
      alumni,
      students,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

/* =====================================================
   USER MANAGEMENT
===================================================== */

// Get pending users
export const getPendingUsers =
  async (req, res) => {

    try {

      const users =
        await User.find({
          isApproved: false,
        }).select("-password");

      res.json(users);

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }

  };

// Approve user + assign role
export const approveUser =
  async (req, res) => {

    try {

      const { role } =
        req.body;

      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {

        return res
          .status(404)
          .json({
            message:
              "User not found",
          });

      }

      user.isApproved = true;

      // assign role only if provided
      if (role) {

        user.role = role;

      }

      await user.save();

      res.json({
        message:
          "User approved successfully",
        user,
      });

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }

  };

// Reject user
export const rejectUser =
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {

        return res
          .status(404)
          .json({
            message:
              "User not found",
          });

      }

      await User.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "User rejected and removed",
      });

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }

  };

// Delete user
export const deleteUser =
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {

        return res
          .status(404)
          .json({
            message:
              "User not found",
          });

      }

      await User.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "User removed successfully",
      });

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }

  };

/* =====================================================
   TEACHER MANAGEMENT
===================================================== */

// Create teacher directly by admin
export const createTeacher =
  async (req, res) => {

    try {

      const {
        name,
        email,
        password,
        designation,
        specialization,
        experience,
        department,
      } = req.body;

      // validations
      if (
        !name ||
        !email ||
        !password
      ) {

        return res
          .status(400)
          .json({
            message:
              "Please fill all required fields",
          });

      }

      // existing check
      const existingTeacher =
        await User.findOne({
          email,
        });

      if (existingTeacher) {

        return res
          .status(400)
          .json({
            message:
              "Teacher already exists",
          });

      }

      // hash password
      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      // create teacher
      const teacher =
        await User.create({

          name,
          email,

          password:
            hashedPassword,

          role: "teacher",

          // auto approve
          isApproved: true,

          designation,
          specialization,
          experience,
          department,

        });

      res.status(201).json({
        message:
          "Teacher created successfully",
        teacher,
      });

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }

  };

// Get all teachers
export const getAllTeachers =
  async (req, res) => {

    try {

      const teachers =
        await User.find({

          role: "teacher",

          isApproved: true,

        }).select("-password");

      res.json(teachers);

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }

  };

// Remove teacher
export const removeTeacher =
  async (req, res) => {

    try {

      const teacher =
        await User.findById(
          req.params.id
        );

      if (!teacher) {

        return res
          .status(404)
          .json({
            message:
              "Teacher not found",
          });

      }

      if (
        teacher.role !==
        "teacher"
      ) {

        return res
          .status(400)
          .json({
            message:
              "User is not a teacher",
          });

      }

      await User.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Teacher removed successfully",
      });

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }

  };

/* =====================================================
   POST MANAGEMENT
===================================================== */

// Get reported posts 🚨
export const getReportedPosts =
  async (req, res) => {

    try {

      const posts =
        await Post.find({

          reports: {
            $exists: true,
            $not: {
              $size: 0,
            },
          },

          isDeleted: false,

        })

          .populate(
            "user",
            "name profilePic role"
          )

          .sort({
            createdAt: -1,
          });

      res.json(posts);

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }

  };

// Ignore report 🚨
export const ignoreReport =
  async (req, res) => {

    try {

      const post =
        await Post.findById(
          req.params.id
        );

      if (!post) {

        return res
          .status(404)
          .json({
            message:
              "Post not found",
          });

      }

      post.reports = [];

      await post.save();

      res.json({
        message:
          "Reports cleared successfully",
      });

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }

  };

// Delete post
export const deletePost =
  async (req, res) => {

    try {

      const post =
        await Post.findById(
          req.params.id
        );

      if (!post) {

        return res
          .status(404)
          .json({
            message:
              "Post not found",
          });

      }

      // SOFT DELETE
      post.isDeleted = true;

      await post.save();

      res.json({
        message:
          "Post removed successfully",
      });

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }

  };

/* =====================================================
   EVENT MANAGEMENT
===================================================== */

// Get pending events
export const getPendingEvents =
  async (req, res) => {

    try {

      const events =
        await Event.find({
          isApproved: false,
        }).populate(
          "createdBy",
          "name email"
        );

      res.json(events);

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }

  };

// Approve event
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

      event.isApproved = true;

      await event.save();

      res.json({
        message:
          "Event approved successfully",
        event,
      });

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }

  };

// Reject event
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

      await Event.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Event rejected and removed",
      });

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }

  };
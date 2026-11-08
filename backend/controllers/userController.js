import User from "../models/User.js";

// ======================================================
// 🔥 GET CURRENT USER
// ======================================================

export const getMyProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);

  } catch (error) {
    console.error("Get My Profile Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// 🔥 GET USER BY ID (NEW)
// ======================================================

export const getUserById = async (req, res) => {
  try {

    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);

  } catch (error) {
    console.error("Get User By ID Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// 🔥 UPDATE PROFILE
// ======================================================

export const updateProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ======================================================
    // 🔹 SAFE TEXT FIELD UPDATE
    // ======================================================

    const fields = [
      "name",
      "bio",
      "education",
      "company",
      "position",
      "location",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // ======================================================
    // 🔥 GRADUATION YEAR + ALUMNI AUTO DETECTION
    // ======================================================

    if (req.body.graduationYear !== undefined) {

      const year = Number(req.body.graduationYear);

      if (!isNaN(year)) {

        user.graduationYear = year;

        // AUTO ALUMNI DETECT
        if (year) {
          user.isAlumni = true;
        }
      }
    }

    // ======================================================
    // 🔥 SKILLS PARSING
    // ======================================================

    if (req.body.skills) {

      try {

        user.skills = JSON.parse(req.body.skills);

      } catch {

        user.skills = req.body.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    // ======================================================
    // 🔥 PORTFOLIO LINKS
    // ======================================================

    if (req.body.portfolioLinks) {

      try {

        const parsed = JSON.parse(req.body.portfolioLinks);

        user.portfolioLinks = parsed.map((link) => ({
          label: link.label || "",
          url: link.url || "",
        }));

      } catch (error) {
        console.log("Portfolio parsing failed");
      }
    }

    // ======================================================
    // 🔥 PROFILE IMAGE
    // ======================================================

    if (req.files?.image) {
      user.profilePic = req.files.image[0].path;
    }

    // ======================================================
    // 🔥 COVER IMAGE
    // ======================================================

    if (req.files?.coverPic) {
      user.coverPic = req.files.coverPic[0].path;
    }

    // ======================================================
    // 🔥 RESUME
    // ======================================================

    if (req.files?.resume) {
      user.resume = req.files.resume[0].path;
    }

    // ======================================================
    // 🔥 SAVE USER
    // ======================================================

    await user.save();

    // ======================================================
    // 🔥 RETURN UPDATED USER
    // ======================================================

    const updatedUser = await User.findById(user._id)
      .select("-password");

    res.json(updatedUser);

  } catch (error) {

    console.error("Update Profile Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
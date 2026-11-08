import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

// @desc Register User
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,

      // ✅ NEW FIELDS
      department,
      passOutYear,
      rollNumber,
    } = req.body;

    // ✅ Validation
    if (
      !name ||
      !email ||
      !password ||
      !department ||
      !passOutYear ||
      !rollNumber
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ✅ Check existing user
    const userExists = await User.findOne({
      email: normalizedEmail,
    });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // ✅ Allow only student or alumni request
    let requestedRole = "student";

    if (role && ["student", "alumni"].includes(role)) {
      requestedRole = role;
    }

    // 🔐 Hash Password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Create User
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,

      // ✅ NEW FIELDS
      department,
      passOutYear,
      rollNumber,

      // Existing system
      role: requestedRole,
      isApproved: false,
    });

    res.status(201).json({
      message:
        "Registration successful. Waiting for admin approval.",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ✅ Find User (explicitly request password — it is select:false by default)
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // ✅ Compare Password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // 🚫 Approval Check
    if (!user.isApproved) {
      return res.status(403).json({
        message: "Account pending admin approval",
        isApproved: false,
      });
    }

    // ✅ FINAL LOGIN RESPONSE
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,

      // ✅ EXTRA USER DATA
      department: user.department || "",
      passOutYear: user.passOutYear || "",
      rollNumber: user.rollNumber || "",

      // Existing
      profilePic: user.profilePic || "",
      role: user.role,
      isApproved: user.isApproved,

      // 🔐 JWT TOKEN
      token: generateToken(user._id),
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
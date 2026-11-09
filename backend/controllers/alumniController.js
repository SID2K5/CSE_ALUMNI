import User from "../models/User.js";

const escapeRegExp = (s) =>
  String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * GET /api/alumni
 *
 * Supports optional query params (all filters combine with AND):
 *   name       — case-insensitive substring on name
 *   company    — raw or normalised match
 *   year       — exact graduationYear (number)
 *   location   — case-insensitive substring
 *   domain     — case-insensitive substring
 *   skills     — comma-separated list; matches any (case-insensitive)
 *
 * Password is select:false on the model, so it will never be returned.
 * Belt-and-braces: .select("-password") is added anyway.
 */
export const getAlumni = async (req, res) => {
  try {
    const { name, company, year, location, domain, skills } = req.query;

    const query = { isAlumni: true, isApproved: true };

    if (name) {
      query.name = { $regex: escapeRegExp(name), $options: "i" };
    }

    if (company) {
      const safe = escapeRegExp(company);
      query.$or = [
        { company: { $regex: safe, $options: "i" } },
        { companyNormalized: company.toLowerCase().trim() },
      ];
    }

    if (year) {
      const n = Number(year);
      if (!Number.isNaN(n)) query.graduationYear = n;
    }

    if (location) {
      query.location = { $regex: escapeRegExp(location), $options: "i" };
    }

    if (domain) {
      query.domain = { $regex: escapeRegExp(domain), $options: "i" };
    }

    if (skills) {
      const list = String(skills)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => new RegExp(escapeRegExp(s), "i"));
      if (list.length) query.skills = { $in: list };
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/alumni/stats
 * Top companies by alumni count (top 10).
 */
export const getCompanyStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $match: {
          isAlumni: true,
          isApproved: true,
          companyNormalized: { $nin: ["", null] },
        },
      },
      {
        $group: {
          _id: "$companyNormalized",
          count: { $sum: 1 },
          // Keep an original-case label for the UI (first one wins).
          label: { $first: "$company" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/alumni/year-stats
 * Graduation-year distribution (ascending by year).
 */
export const getYearStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $match: {
          isAlumni: true,
          isApproved: true,
          graduationYear: { $exists: true, $ne: null, $gt: 0 },
        },
      },
      {
        $group: {
          _id: "$graduationYear",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(stats.map((s) => ({ year: s._id, count: s.count })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/alumni/company/:company
 * Alumni by normalised company.
 */
export const getAlumniByCompany = async (req, res) => {
  try {
    const company = String(req.params.company || "").toLowerCase();

    const users = await User.find({
      isAlumni: true,
      isApproved: true,
      companyNormalized: company,
    })
      .select("-password")
      .sort({ graduationYear: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import User from "../models/User.js";

// 🔍 Get alumni with filters
export const getAlumni = async (req, res) => {
  try {
    const { company, year, location } = req.query;

    let query = { isAlumni: true };

    // 🔹 Company filter (supports normalized search)
    if (company) {
      query.$or = [
        { company: { $regex: company, $options: "i" } },
        { companyNormalized: company.toLowerCase() },
      ];
    }

    // 🔹 Year filter (FIX: convert to Number)
    if (year) {
      query.graduationYear = Number(year);
    }

    // 🔹 Location filter (optional future use)
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 📊 Company grouping (Top companies)
export const getCompanyStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      { $match: { isAlumni: true, companyNormalized: { $ne: "" } } },

      {
        $group: {
          _id: "$companyNormalized", // 🔥 use normalized
          count: { $sum: 1 },
        },
      },

      { $sort: { count: -1 } }, // 🔥 top companies first
      { $limit: 10 }, // 🔥 optional: top 10
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🏢 Get alumni by company (company page)
export const getAlumniByCompany = async (req, res) => {
  try {
    const company = req.params.company.toLowerCase();

    const users = await User.find({
      isAlumni: true,
      companyNormalized: company,
    }).sort({ graduationYear: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
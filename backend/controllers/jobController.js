import Job from "../models/Job.js";

/* =====================================================
   🔹 CREATE JOB (ALUMNI / TEACHER / ADMIN)
===================================================== */
export const createJob = async (req, res) => {
  try {

    // 🔒 ROLE CHECK
    if (
      req.user.role !== "alumni" &&
      req.user.role !== "teacher" &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not authorized to post jobs",
      });
    }

    const job = await Job.create({
      ...req.body,
      postedBy: req.user._id,
      status: "pending",
    });

    console.log("✅ Job created:", job._id);

    res.status(201).json(job);

  } catch (error) {
    console.error("❌ Create Job Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   🔹 GET JOBS (APPROVED ONLY)
===================================================== */
export const getJobs = async (req, res) => {
  try {
    const {
      search,
      type,
      location,
      experienceLevel,
      skill,
    } = req.query;

    const escapeRegExp = (s) =>
      String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const query = { status: "approved" };

    // 🔍 SEARCH across title / company / tags
    if (search) {
      const safe = escapeRegExp(search);
      query.$or = [
        { title: { $regex: safe, $options: "i" } },
        { company: { $regex: safe, $options: "i" } },
        { tags: { $regex: safe, $options: "i" } },
      ];
    }

    // 📌 TYPE
    if (type) query.type = type;

    // 📍 LOCATION
    if (location) {
      query.location = { $regex: escapeRegExp(location), $options: "i" };
    }

    // 🎯 EXPERIENCE
    if (experienceLevel) query.experienceLevel = experienceLevel;

    // 🛠️ SKILL (single tag)
    if (skill) {
      query.tags = { $regex: escapeRegExp(skill), $options: "i" };
    }

    const jobs = await Job.find(query)
      .populate("postedBy", "_id name role profilePic")
      .sort({ createdAt: -1 });

    res.json(jobs);

  } catch (error) {
    console.error("❌ Get Jobs Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   🔹 GET PENDING JOBS (ADMIN)
===================================================== */
export const getPendingJobs = async (req, res) => {
  try {

    console.log("🔥 Admin requesting pending jobs...");

    const jobs = await Job.find({ status: "pending" })
      .populate("postedBy", "name email role")
      .sort({ createdAt: -1 });

    console.log("📦 Pending Jobs Count:", jobs.length);

    res.json(jobs);

  } catch (error) {
    console.error("❌ getPendingJobs Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   🔹 APPROVE JOB
===================================================== */
export const approveJob = async (req, res) => {
  try {

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    job.status = "approved";

    await job.save();

    console.log("✅ Job Approved:", job._id);

    res.json(job);

  } catch (error) {
    console.error("❌ Approve Job Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   🔹 REJECT JOB
===================================================== */
export const rejectJob = async (req, res) => {
  try {

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    job.status = "rejected";

    await job.save();

    console.log("❌ Job Rejected:", job._id);

    res.json(job);

  } catch (error) {
    console.error("❌ Reject Job Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   🔹 DELETE JOB
   OWNER OR ADMIN CAN DELETE
===================================================== */
export const deleteJob = async (req, res) => {
  try {

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // 🔒 OWNER CHECK
    const isOwner =
      job.postedBy.toString() === req.user._id.toString();

    // 🛡️ ADMIN CHECK
    const isAdmin = req.user.role === "admin";

    // ❌ NOT AUTHORIZED
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Not authorized to delete this job",
      });
    }

    await job.deleteOne();

    console.log("🗑️ Job Deleted:", job._id);

    res.json({
      success: true,
      message: "Job deleted successfully",
    });

  } catch (error) {
    console.error("❌ Delete Job Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   🔹 APPLY JOB
===================================================== */
export const applyJob = async (req, res) => {
  try {

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // 🚫 PREVENT DUPLICATE APPLY
    if (!job.applicants.includes(req.user._id)) {
      job.applicants.push(req.user._id);
      await job.save();
    }

    res.json(job);

  } catch (error) {
    console.error("❌ Apply Job Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   🔥 JOB VIEW TRACKING (ANALYTICS)
===================================================== */
export const trackJobView = async (req, res) => {
  try {

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    job.views += 1;

    await job.save();

    res.json({
      success: true,
    });

  } catch (error) {
    console.error("❌ Track View Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   🤖 AI RECOMMENDATION SYSTEM
===================================================== */
export const getRecommendedJobs = async (req, res) => {
  try {

    const user = req.user;

    const jobs = await Job.find({
      status: "approved",
    });

    const scoredJobs = jobs.map((job) => {
      let score = 0;

      /* =========================================
         🔥 SKILL MATCH
      ========================================= */
      if (job.tags && user.skills) {

        job.tags.forEach((tag) => {

          if (
            user.skills.some(
              (skill) =>
                skill.toLowerCase() === tag.toLowerCase()
            )
          ) {
            score += 10;
          }

        });
      }

      /* =========================================
         📍 LOCATION MATCH
      ========================================= */
      if (
        user.location &&
        job.location &&
        user.location.toLowerCase() ===
          job.location.toLowerCase()
      ) {
        score += 5;
      }

      /* =========================================
         🎯 TYPE MATCH
      ========================================= */
      if (
        job.type === "Internship" &&
        user.role === "student"
      ) {
        score += 3;
      }

      return {
        ...job._doc,
        score,
      };
    });

    // 🔥 SORT BY SCORE
    scoredJobs.sort((a, b) => b.score - a.score);

    console.log("🤖 Recommended Jobs Generated");

    res.json(scoredJobs.slice(0, 6));

  } catch (error) {
    console.error("❌ Recommendation Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
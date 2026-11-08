import Resource from "../models/Resource.js";

/* =====================================================
   📤 UPLOAD RESOURCE
===================================================== */
export const uploadResource = async (req, res) => {
  try {
    const {
      title,
      description,
      semester,
      type,
      subject,
      tags,
    } = req.body;

    /* ================= VALIDATIONS ================= */

    if (!title || !semester || !type) {
      return res.status(400).json({
        message: "Title, semester and type are required",
      });
    }

    /* ================= FILE VALIDATION ================= */

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const fileUrl = req.file.path;

    if (!fileUrl) {
      console.error("FILE DEBUG:", req.file);

      return res.status(500).json({
        message: "File upload failed",
      });
    }

    /* ================= CREATE RESOURCE ================= */

    const resource = await Resource.create({
      title,

      description,

      semester: Number(semester),

      type,

      subject,

      // convert comma separated tags → array
      tags: tags
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],

      fileUrl,

      // ownership
      uploadedBy: req.user._id,

      uploadedByRole: req.user.role,

      // file metadata
      fileType: req.file.mimetype,

      fileSize: req.file.size || 0,

      // analytics
      downloads: 0,

      views: 0,

      // moderation
      isApproved: true,
    });

    return res.status(201).json(resource);

  } catch (err) {
    console.error("UPLOAD ERROR:", err);

    return res.status(500).json({
      message: "Upload failed",
    });
  }
};

/* =====================================================
   📥 GET RESOURCES
===================================================== */
export const getResources = async (req, res) => {
  try {
    const {
      semester,
      search,
      type,
      subject,
      tag,
    } = req.query;

    let query = {
      isApproved: true,
    };

    /* ================= FILTERS ================= */

    if (semester) {
      query.semester = Number(semester);
    }

    if (type) {
      query.type = type;
    }

    if (subject) {
      query.subject = {
        $regex: subject,
        $options: "i",
      };
    }

    // filter by single tag
    if (tag) {
      query.tags = {
        $in: [tag],
      };
    }

    /* ================= SEARCH ================= */

    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          subject: {
            $regex: search,
            $options: "i",
          },
        },
        {
          tags: {
            $elemMatch: {
              $regex: search,
              $options: "i",
            },
          },
        },
      ];
    }

    /* ================= FETCH ================= */

    const resources = await Resource.find(query)

      // uploader info
      .populate(
        "uploadedBy",
        "name role profilePic designation"
      )

      .sort({ createdAt: -1 });

    return res.json(resources);

  } catch (err) {
    console.error("GET ERROR:", err);

    return res.status(500).json({
      message: "Failed to fetch resources",
    });
  }
};

/* =====================================================
   👨‍🏫 GET MY RESOURCES
===================================================== */
export const getMyResources = async (req, res) => {
  try {
    const resources = await Resource.find({
      uploadedBy: req.user._id,
    })

      .populate(
        "uploadedBy",
        "name role profilePic"
      )

      .sort({ createdAt: -1 });

    return res.json(resources);

  } catch (err) {
    console.error("MY RESOURCES ERROR:", err);

    return res.status(500).json({
      message: "Failed to fetch your resources",
    });
  }
};

/* =====================================================
   ⬇️ DOWNLOAD RESOURCE
===================================================== */
export const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found",
      });
    }

    /* ================= INCREMENT ================= */

    resource.downloads =
      (resource.downloads || 0) + 1;

    await resource.save();

    /* ================= SAFE FILE NAME ================= */

    const safeName = (resource.title || "file")
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "_");

    /* ================= FINAL DOWNLOAD URL ================= */

    const downloadUrl =
      `${resource.fileUrl}?fl_attachment=${encodeURIComponent(
        safeName
      )}.pdf`;

    return res.json({
      url: downloadUrl,
    });

  } catch (err) {
    console.error("DOWNLOAD ERROR:", err);

    return res.status(500).json({
      message: "Download failed",
    });
  }
};

/* =====================================================
   👁️ VIEW RESOURCE
===================================================== */
export const viewResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found",
      });
    }

    /* ================= INCREMENT ================= */

    resource.views =
      (resource.views || 0) + 1;

    await resource.save();

    return res.json(resource);

  } catch (err) {
    console.error("VIEW ERROR:", err);

    return res.status(500).json({
      message: "Failed to update views",
    });
  }
};

/* =====================================================
   🗑️ DELETE RESOURCE
===================================================== */
export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found",
      });
    }

    /* ================= AUTHORIZATION ================= */

    if (
      resource.uploadedBy.toString() !==
        req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    await resource.deleteOne();

    return res.json({
      message: "Resource deleted successfully",
    });

  } catch (err) {
    console.error("DELETE ERROR:", err);

    return res.status(500).json({
      message: "Failed to delete resource",
    });
  }
};
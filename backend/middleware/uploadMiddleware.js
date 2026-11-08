import multer from "multer";

import {
  CloudinaryStorage,
} from "multer-storage-cloudinary";

import cloudinary from "../config/cloudinary.js";

/* =====================================================
   📦 CLOUDINARY STORAGE CONFIG
===================================================== */

const storage =
  new CloudinaryStorage({

    cloudinary,

    params: async (
      req,
      file
    ) => {

      /* =====================================================
         💬 CHAT FILES / PDFs / IMAGES
      ===================================================== */

      if (
        file.fieldname ===
        "file"
      ) {

        const isImage =
          file.mimetype.startsWith(
            "image"
          );

        return {

          folder:
            "ALU_chat",

          resource_type:
            isImage
              ? "image"
              : "raw",

          public_id: `chat-${Date.now()}`,

          use_filename: true,

          unique_filename: true,
        };
      }

      /* =====================================================
         📄 RESUME
      ===================================================== */

      if (
        file.fieldname ===
        "resume"
      ) {

        return {

          folder:
            "ALU_resumes",

          resource_type:
            "raw",

          use_filename: true,

          unique_filename: true,
        };
      }

      /* =====================================================
         🎉 EVENT POSTER
      ===================================================== */

      if (
        file.fieldname ===
        "poster"
      ) {

        return {

          folder:
            "ALU_events",

          resource_type:
            "image",
        };
      }

      /* =====================================================
         🖼️ PROFILE IMAGE
      ===================================================== */

      if (
        file.fieldname ===
        "profilePic"
      ) {

        return {

          folder:
            "ALU_profiles",

          resource_type:
            "image",

          allowed_formats: [
            "jpg",
            "jpeg",
            "png",
            "webp",
          ],
        };
      }

      /* =====================================================
         🚀 POST MEDIA
      ===================================================== */

      if (
        file.fieldname ===
        "media"
      ) {

        return {

          folder:
            "ALU_posts",

          resource_type:
            "auto",
        };
      }

      /* =====================================================
         📚 RESOURCES
      ===================================================== */

      if (
        file.fieldname ===
        "resource"
      ) {

        return {

          folder:
            "ALU_resources",

          resource_type:
            "raw",

          use_filename: true,

          unique_filename: true,
        };
      }

      /* =====================================================
         DEFAULT
      ===================================================== */

      return {

        folder:
          "ALU_misc",

        resource_type:
          "auto",
      };
    },
  });

/* =====================================================
   📤 MULTER CONFIG
===================================================== */

const upload = multer({

  storage,

  limits: {

    // 🔥 30MB
    fileSize:
      30 * 1024 * 1024,
  },

  fileFilter: (
    req,
    file,
    cb
  ) => {

    try {

      /* =====================================================
         💬 CHAT FILE VALIDATION
      ===================================================== */

      if (
        file.fieldname ===
        "file"
      ) {

        const allowedMimeTypes = [

          // 🔥 IMAGES
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/webp",

          // 🔥 PDFs
          "application/pdf",

          // 🔥 DOCS
          "application/msword",

          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

          // 🔥 TEXT
          "text/plain",
        ];

        if (
          allowedMimeTypes.includes(
            file.mimetype
          )
        ) {

          cb(null, true);

        } else {

          cb(
            new Error(
              "Unsupported file format"
            )
          );
        }

        return;
      }

      /* =====================================================
         📄 RESUME VALIDATION
      ===================================================== */

      if (
        file.fieldname ===
        "resume"
      ) {

        const allowedResumeTypes = [

          "application/pdf",

          "application/msword",

          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (
          allowedResumeTypes.includes(
            file.mimetype
          )
        ) {

          cb(null, true);

        } else {

          cb(
            new Error(
              "Only PDF/DOC resumes allowed"
            )
          );
        }

        return;
      }

      /* =====================================================
         🖼️ IMAGE VALIDATION
      ===================================================== */

      if (
        [
          "profilePic",
          "poster",
          "media",
        ].includes(
          file.fieldname
        )
      ) {

        if (
          file.mimetype.startsWith(
            "image"
          )
        ) {

          cb(null, true);

        } else {

          cb(
            new Error(
              "Only image files allowed"
            )
          );
        }

        return;
      }

      /* =====================================================
         DEFAULT
      ===================================================== */

      cb(null, true);

    } catch (err) {

      cb(err);
    }
  },
});

export default upload;
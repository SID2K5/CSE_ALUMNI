import User from "../models/User.js";
import Post from "../models/Post.js";
import Job from "../models/Job.js";
import Event from "../models/Event.js";
import Resource from "../models/Resource.js";

/* =====================================================
   ADMIN REPORTS — CSV export with filtering + sorting

   GET /api/admin/report/meta
       → datasets, their columns and available filters
   GET /api/admin/report?dataset=users&format=csv
       &sortBy=createdAt&order=desc&from=&to=&<filters>
       → text/csv attachment (format=json returns a preview)
===================================================== */

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const contains = (field) => (v) => ({ [field]: new RegExp(escapeRegex(v), "i") });
const equals = (field) => (v) => ({ [field]: v });
const count = (arr) => (Array.isArray(arr) ? arr.length : 0);
const person = (ref) => (ref && typeof ref === "object" ? ref.name || "" : "");
const personEmail = (ref) => (ref && typeof ref === "object" ? ref.email || "" : "");

const DATASETS = {
  users: {
    label: "Users",
    model: User,
    select: "-password",
    columns: [
      { key: "name", label: "Name", get: (d) => d.name },
      { key: "email", label: "Email", get: (d) => d.email },
      { key: "role", label: "Role", get: (d) => d.role },
      { key: "status", label: "Status", get: (d) => (d.isApproved ? "approved" : "pending") },
      { key: "department", label: "Department", get: (d) => d.department },
      { key: "rollNumber", label: "Roll number", get: (d) => d.rollNumber },
      { key: "graduationYear", label: "Graduation year", get: (d) => d.graduationYear },
      { key: "company", label: "Company", get: (d) => d.company },
      { key: "position", label: "Position", get: (d) => d.position },
      { key: "location", label: "Location", get: (d) => d.location },
      { key: "skills", label: "Skills", get: (d) => (d.skills || []).join("; ") },
      { key: "connections", label: "Connections", get: (d) => count(d.connections) },
      { key: "profileCompletion", label: "Profile completion %", get: (d) => d.profileCompletion },
      { key: "banned", label: "Banned", get: (d) => (d.banned ? "yes" : "no") },
      { key: "lastActive", label: "Last active", get: (d) => d.lastActive },
      { key: "createdAt", label: "Joined", get: (d) => d.createdAt },
    ],
    filters: [
      {
        key: "role",
        label: "Role",
        type: "select",
        options: ["student", "alumni", "teacher", "admin"],
        where: equals("role"),
      },
      {
        key: "status",
        label: "Approval status",
        type: "select",
        options: ["approved", "pending"],
        where: (v) => ({ isApproved: v === "approved" }),
      },
      { key: "department", label: "Department", type: "text", where: contains("department") },
      { key: "company", label: "Company", type: "text", where: contains("company") },
      { key: "location", label: "Location", type: "text", where: contains("location") },
      {
        key: "graduationYear",
        label: "Graduation year",
        type: "number",
        where: (v) => ({ graduationYear: Number(v) }),
      },
      {
        key: "banned",
        label: "Banned",
        type: "select",
        options: ["yes", "no"],
        where: (v) => ({ banned: v === "yes" }),
      },
    ],
  },

  posts: {
    label: "Posts",
    model: Post,
    populate: [{ path: "user", select: "name email" }],
    columns: [
      { key: "author", label: "Author", get: (d) => person(d.user) },
      { key: "authorEmail", label: "Author email", get: (d) => personEmail(d.user) },
      { key: "postType", label: "Type", get: (d) => d.postType },
      { key: "content", label: "Content", get: (d) => d.content },
      { key: "hashtags", label: "Hashtags", get: (d) => (d.hashtags || []).join(" ") },
      { key: "likes", label: "Likes", get: (d) => count(d.likes) },
      {
        key: "reactions",
        label: "Reactions",
        get: (d) =>
          count(d.reactions?.heart) + count(d.reactions?.fire) + count(d.reactions?.celebrate),
      },
      { key: "comments", label: "Comments", get: (d) => count(d.comments) },
      { key: "reports", label: "Reports", get: (d) => count(d.reports) },
      { key: "isPinned", label: "Pinned", get: (d) => (d.isPinned ? "yes" : "no") },
      { key: "isDeleted", label: "Deleted", get: (d) => (d.isDeleted ? "yes" : "no") },
      { key: "createdAt", label: "Posted", get: (d) => d.createdAt },
    ],
    filters: [
      {
        key: "postType",
        label: "Post type",
        type: "select",
        options: ["text", "image", "media", "code"],
        where: equals("postType"),
      },
      {
        key: "reported",
        label: "Reported",
        type: "select",
        options: ["yes", "no"],
        where: (v) =>
          v === "yes" ? { "reports.0": { $exists: true } } : { "reports.0": { $exists: false } },
      },
      {
        key: "deleted",
        label: "Deleted",
        type: "select",
        options: ["no", "yes"],
        where: (v) => ({ isDeleted: v === "yes" }),
      },
      { key: "hashtag", label: "Hashtag", type: "text", where: contains("hashtags") },
    ],
  },

  jobs: {
    label: "Jobs",
    model: Job,
    populate: [{ path: "postedBy", select: "name email" }],
    columns: [
      { key: "title", label: "Title", get: (d) => d.title },
      { key: "company", label: "Company", get: (d) => d.company },
      { key: "location", label: "Location", get: (d) => d.location },
      { key: "type", label: "Type", get: (d) => d.type },
      { key: "experienceLevel", label: "Experience", get: (d) => d.experienceLevel },
      { key: "salary", label: "Salary", get: (d) => d.salary },
      { key: "status", label: "Status", get: (d) => d.status },
      { key: "tags", label: "Tags", get: (d) => (d.tags || []).join("; ") },
      { key: "postedBy", label: "Posted by", get: (d) => person(d.postedBy) },
      { key: "applicants", label: "Applicants", get: (d) => count(d.applicants) },
      { key: "views", label: "Views", get: (d) => d.views },
      { key: "applyLink", label: "Apply link", get: (d) => d.applyLink },
      { key: "createdAt", label: "Posted", get: (d) => d.createdAt },
    ],
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["approved", "pending", "rejected"],
        where: equals("status"),
      },
      {
        key: "type",
        label: "Job type",
        type: "select",
        options: ["Full-time", "Internship", "Part-time", "Contract"],
        where: equals("type"),
      },
      {
        key: "experienceLevel",
        label: "Experience",
        type: "select",
        options: ["Fresher", "Junior", "Mid", "Senior"],
        where: equals("experienceLevel"),
      },
      { key: "company", label: "Company", type: "text", where: contains("company") },
      { key: "location", label: "Location", type: "text", where: contains("location") },
    ],
  },

  events: {
    label: "Events",
    model: Event,
    populate: [{ path: "createdBy", select: "name email" }],
    columns: [
      { key: "title", label: "Title", get: (d) => d.title },
      { key: "category", label: "Category", get: (d) => d.category },
      { key: "location", label: "Location", get: (d) => d.location },
      { key: "startDate", label: "Starts", get: (d) => d.startDate },
      { key: "endDate", label: "Ends", get: (d) => d.endDate },
      { key: "status", label: "Status", get: (d) => d.status },
      { key: "featured", label: "Featured", get: (d) => (d.featured ? "yes" : "no") },
      { key: "attendees", label: "Attendees", get: (d) => count(d.attendees) },
      { key: "views", label: "Views", get: (d) => d.views },
      { key: "createdBy", label: "Created by", get: (d) => person(d.createdBy) },
      { key: "createdAt", label: "Created", get: (d) => d.createdAt },
    ],
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["approved", "pending", "rejected"],
        where: equals("status"),
      },
      {
        key: "timing",
        label: "Timing",
        type: "select",
        options: ["upcoming", "past"],
        where: (v) =>
          v === "upcoming" ? { endDate: { $gte: new Date() } } : { endDate: { $lt: new Date() } },
      },
      {
        key: "featured",
        label: "Featured",
        type: "select",
        options: ["yes", "no"],
        where: (v) => ({ featured: v === "yes" }),
      },
      { key: "category", label: "Category", type: "text", where: contains("category") },
      { key: "location", label: "Location", type: "text", where: contains("location") },
    ],
    baseQuery: { deletedAt: null },
  },

  resources: {
    label: "Resources",
    model: Resource,
    populate: [{ path: "uploadedBy", select: "name email" }],
    columns: [
      { key: "title", label: "Title", get: (d) => d.title },
      { key: "subject", label: "Subject", get: (d) => d.subject },
      { key: "semester", label: "Semester", get: (d) => d.semester },
      { key: "type", label: "Type", get: (d) => d.type },
      { key: "tags", label: "Tags", get: (d) => (d.tags || []).join("; ") },
      { key: "uploadedBy", label: "Uploaded by", get: (d) => person(d.uploadedBy) },
      { key: "uploadedByRole", label: "Uploader role", get: (d) => d.uploadedByRole },
      { key: "downloads", label: "Downloads", get: (d) => d.downloads },
      { key: "views", label: "Views", get: (d) => d.views },
      { key: "fileSizeKB", label: "File size (KB)", get: (d) => Math.round((d.fileSize || 0) / 1024) },
      { key: "fileUrl", label: "File URL", get: (d) => d.fileUrl },
      { key: "createdAt", label: "Uploaded", get: (d) => d.createdAt },
    ],
    filters: [
      {
        key: "semester",
        label: "Semester",
        type: "select",
        options: ["1", "2", "3", "4", "5", "6", "7", "8"],
        where: (v) => ({ semester: Number(v) }),
      },
      {
        key: "type",
        label: "Resource type",
        type: "select",
        options: ["notes", "pyq", "assignment", "study-material", "other"],
        where: equals("type"),
      },
      { key: "subject", label: "Subject", type: "text", where: contains("subject") },
      {
        key: "uploadedByRole",
        label: "Uploader role",
        type: "select",
        options: ["admin", "teacher"],
        where: equals("uploadedByRole"),
      },
    ],
  },
};

/* ---------------- helpers ---------------- */

const toCell = (value) => {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  let s = String(value);
  // Neutralise spreadsheet formula injection (=, +, -, @ at start of a cell)
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  if (/[",\r\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
};

const toCSV = (columns, rows) => {
  const header = columns.map((c) => toCell(c.label)).join(",");
  const lines = rows.map((r) => columns.map((c) => toCell(r[c.key])).join(","));
  // BOM so Excel opens UTF-8 correctly
  return "﻿" + [header, ...lines].join("\r\n");
};

const compare = (a, b) => {
  const aEmpty = a === null || a === undefined || a === "";
  const bEmpty = b === null || b === undefined || b === "";
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;
  if (a instanceof Date && b instanceof Date) return a - b;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { sensitivity: "base", numeric: true });
};

const parseDate = (v, endOfDay = false) => {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(v)) d.setHours(23, 59, 59, 999);
  return d;
};

/* ---------------- controllers ---------------- */

export const getReportMeta = (req, res) => {
  const datasets = Object.entries(DATASETS).map(([key, d]) => ({
    key,
    label: d.label,
    columns: d.columns.map(({ key, label }) => ({ key, label })),
    filters: d.filters.map(({ key, label, type, options }) => ({ key, label, type, options })),
  }));
  res.json({ datasets });
};

export const generateReport = async (req, res) => {
  try {
    const { dataset, format = "csv", sortBy, order = "desc", from, to, limit } = req.query;

    const def = DATASETS[dataset];
    if (!def) {
      return res.status(400).json({
        message: `Unknown dataset. Use one of: ${Object.keys(DATASETS).join(", ")}`,
      });
    }

    /* ---- build query from whitelisted filters ---- */
    const query = { ...(def.baseQuery || {}) };

    for (const f of def.filters) {
      const raw = req.query[f.key];
      if (raw === undefined || raw === "") continue;
      if (f.type === "select" && !f.options.includes(String(raw))) {
        return res.status(400).json({ message: `Invalid value for filter "${f.key}"` });
      }
      if (f.type === "number" && Number.isNaN(Number(raw))) {
        return res.status(400).json({ message: `Filter "${f.key}" must be a number` });
      }
      Object.assign(query, f.where(String(raw)));
    }

    const fromDate = parseDate(from);
    const toDate = parseDate(to, true);
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = fromDate;
      if (toDate) query.createdAt.$lte = toDate;
    }

    /* ---- fetch ---- */
    let q = def.model.find(query).lean();
    if (def.select) q = q.select(def.select);
    for (const p of def.populate || []) q = q.populate(p);
    const docs = await q;

    /* ---- shape rows ---- */
    let rows = docs.map((d) => {
      const row = {};
      for (const c of def.columns) row[c.key] = c.get(d);
      return row;
    });

    /* ---- sort (whitelisted to known columns) ---- */
    const sortKey = def.columns.some((c) => c.key === sortBy) ? sortBy : "createdAt";
    const dir = order === "asc" ? 1 : -1;
    rows.sort((a, b) => dir * compare(a[sortKey], b[sortKey]));

    /* ---- respond ---- */
    if (format === "json") {
      const n = Math.min(Math.max(parseInt(limit, 10) || 25, 1), 200);
      return res.json({
        dataset,
        total: rows.length,
        sortBy: sortKey,
        order: dir === 1 ? "asc" : "desc",
        columns: def.columns.map(({ key, label }) => ({ key, label })),
        rows: rows.slice(0, n),
      });
    }

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="nexus-${dataset}-report-${stamp}.csv"`
    );
    res.setHeader("X-Report-Rows", String(rows.length));
    return res.send(toCSV(def.columns, rows));
  } catch (error) {
    console.error("❌ REPORT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

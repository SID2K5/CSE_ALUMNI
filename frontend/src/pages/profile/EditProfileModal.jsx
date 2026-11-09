import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Save, Trash2, Upload, X } from "lucide-react";

import API from "../../services/api";
import { Avatar, Button, Modal } from "../../components/ui";

/* =====================================================
   EDIT PROFILE — modal form.
   Preserves PUT /api/users/profile multipart contract:
     text  : name, bio, education, company, position, location,
             graduationYear, skills (CSV), portfolioLinks (JSON)
     files : image (avatar), coverPic, resume
===================================================== */

const blank = {
  name: "",
  bio: "",
  education: "",
  company: "",
  position: "",
  location: "",
  graduationYear: "",
  skills: "",
};

const EditProfileModal = ({ open, onClose, profile, onSaved }) => {
  const [form, setForm] = useState(blank);
  const [links, setLinks] = useState([]);
  const [files, setFiles] = useState({ image: null, coverPic: null, resume: null });
  const [previews, setPreviews] = useState({ image: null, coverPic: null });
  const [loading, setLoading] = useState(false);

  /* Seed form whenever the modal opens with a profile */
  useEffect(() => {
    if (!open || !profile) return;
    setForm({
      name: profile.name || "",
      bio: profile.bio || "",
      education: profile.education || "",
      company: profile.company || "",
      position: profile.position || "",
      location: profile.location || "",
      graduationYear: profile.graduationYear || "",
      skills: Array.isArray(profile.skills) ? profile.skills.join(", ") : "",
    });
    setLinks(
      Array.isArray(profile.portfolioLinks) && profile.portfolioLinks.length
        ? profile.portfolioLinks.map((l) => ({
            label: l.label || "",
            url: l.url || "",
          }))
        : []
    );
    setFiles({ image: null, coverPic: null, resume: null });
    setPreviews({ image: null, coverPic: null });
  }, [open, profile]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const pickFile = (key, accept) => (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (accept === "image" && !f.type.startsWith("image/")) {
      return toast.error("Please choose an image file");
    }
    if (f.size > 5 * 1024 * 1024) {
      return toast.error("File must be under 5 MB");
    }
    setFiles((p) => ({ ...p, [key]: f }));
    if (accept === "image") {
      setPreviews((p) => {
        if (p[key]) URL.revokeObjectURL(p[key]);
        return { ...p, [key]: URL.createObjectURL(f) };
      });
    }
  };

  const addLink = () => setLinks((p) => [...p, { label: "", url: "" }]);
  const updateLink = (i, k, v) =>
    setLinks((p) => p.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  const removeLink = (i) => setLinks((p) => p.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!form.name.trim()) return toast.error("Name is required");

    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("bio", form.bio);
    fd.append("education", form.education);
    fd.append("company", form.company);
    fd.append("position", form.position);
    fd.append("location", form.location);
    if (form.graduationYear !== "") {
      fd.append("graduationYear", form.graduationYear);
    }
    fd.append("skills", form.skills);

    const cleanLinks = links.filter((l) => l.url.trim());
    fd.append("portfolioLinks", JSON.stringify(cleanLinks));

    if (files.image) fd.append("image", files.image);
    if (files.coverPic) fd.append("coverPic", files.coverPic);
    if (files.resume) fd.append("resume", files.resume);

    try {
      setLoading(true);
      const { data } = await API.put("/users/profile", fd);
      onSaved?.(data);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Could not save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    Object.values(previews).forEach((u) => u && URL.revokeObjectURL(u));
    onClose?.();
  };

  const avatarPreviewUser = previews.image
    ? { name: form.name, profilePic: previews.image }
    : profile;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Edit profile"
      size="lg"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            iconLeft={Save}
          >
            Save changes
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* COVER + AVATAR */}
        <div>
          <div className="relative h-28 rounded-xl overflow-hidden bg-surface-2 border border-line">
            {previews.coverPic || profile?.coverPic ? (
              <img
                src={previews.coverPic || profile.coverPic}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 via-accent/15 to-surface-2" />
            )}
            <label className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 text-xs font-semibold bg-surface border border-line rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-brand/50">
              <Upload size={12} />
              Cover
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={pickFile("coverPic", "image")}
              />
            </label>
          </div>

          <div className="flex items-center gap-3 -mt-7 ml-4 relative">
            <div className="ring-4 ring-surface rounded-full">
              <Avatar user={avatarPreviewUser} size={64} />
            </div>
            <label className="inline-flex items-center gap-1.5 text-xs font-semibold bg-surface border border-line rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-brand/50 mt-7">
              <Upload size={12} />
              Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={pickFile("image", "image")}
              />
            </label>
          </div>
        </div>

        {/* BASICS */}
        <div>
          <Label>Name *</Label>
          <input className="input" value={form.name} onChange={set("name")} />
        </div>

        <div>
          <Label>Bio</Label>
          <textarea
            className="input"
            rows={3}
            value={form.bio}
            onChange={set("bio")}
            placeholder="A short introduction"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Position / role</Label>
            <input
              className="input"
              value={form.position}
              onChange={set("position")}
              placeholder="e.g. Software Engineer"
            />
          </div>
          <div>
            <Label>Company</Label>
            <input
              className="input"
              value={form.company}
              onChange={set("company")}
              placeholder="e.g. Google"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Location</Label>
            <input
              className="input"
              value={form.location}
              onChange={set("location")}
              placeholder="e.g. Bangalore"
            />
          </div>
          <div>
            <Label>Graduation year</Label>
            <input
              className="input"
              type="number"
              min="1950"
              max="2100"
              value={form.graduationYear}
              onChange={set("graduationYear")}
              placeholder="e.g. 2024"
            />
            <p className="text-xs text-muted mt-1">
              Setting this marks your account as alumni.
            </p>
          </div>
        </div>

        <div>
          <Label>Education</Label>
          <input
            className="input"
            value={form.education}
            onChange={set("education")}
            placeholder="e.g. B.Tech CSE, 2020–2024"
          />
        </div>

        <div>
          <Label>Skills</Label>
          <input
            className="input"
            value={form.skills}
            onChange={set("skills")}
            placeholder="Comma-separated, e.g. React, Node.js, SQL"
          />
        </div>

        {/* RESUME */}
        <div>
          <Label>Resume</Label>
          <label className="flex items-center gap-3 border border-dashed border-line rounded-xl px-4 py-3 cursor-pointer hover:border-brand/60 bg-surface-2">
            <Upload size={16} className="text-muted shrink-0" />
            <span className="text-sm text-ink truncate flex-1">
              {files.resume
                ? files.resume.name
                : profile?.resume
                ? "Replace current resume"
                : "Upload a PDF resume"}
            </span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={pickFile("resume")}
            />
          </label>
        </div>

        {/* PORTFOLIO LINKS */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Links</Label>
            <button
              type="button"
              onClick={addLink}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
            >
              <Plus size={13} />
              Add link
            </button>
          </div>
          {links.length === 0 ? (
            <p className="text-xs text-muted">
              Add a GitHub, LinkedIn or portfolio link.
            </p>
          ) : (
            <div className="space-y-2">
              {links.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input flex-[0_0_32%]"
                    value={l.label}
                    onChange={(e) => updateLink(i, "label", e.target.value)}
                    placeholder="Label"
                  />
                  <input
                    className="input flex-1"
                    value={l.url}
                    onChange={(e) => updateLink(i, "url", e.target.value)}
                    placeholder="https://…"
                  />
                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    className="icon-btn !w-10 !h-10 border border-line text-danger shrink-0"
                    aria-label="Remove link"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

const Label = ({ children }) => (
  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
    {children}
  </label>
);

export default EditProfileModal;

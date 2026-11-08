import { useState } from "react";
import toast from "react-hot-toast";
import { Briefcase } from "lucide-react";

import API from "../../services/api";
import { Button, Modal } from "../ui";

/* =====================================================
   CreateJobModal — Modal form.
   Preserves POST /api/jobs JSON contract.
===================================================== */

const TYPES = ["Full-time", "Internship", "Part-time", "Contract"];
const EXPERIENCE = ["Fresher", "Junior", "Mid", "Senior"];

const emptyForm = {
  title: "",
  company: "",
  location: "",
  type: "Full-time",
  experienceLevel: "Fresher",
  salary: "",
  applyLink: "",
  description: "",
  tags: "",
};

const CreateJobModal = ({ open, onClose, onCreated }) => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const resetAll = () => setForm(emptyForm);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (
      !form.title.trim() ||
      !form.company.trim() ||
      !form.location.trim() ||
      !form.applyLink.trim()
    ) {
      return toast.error("Title, company, location and apply link are required");
    }
    try {
      new URL(form.applyLink);
    } catch {
      return toast.error("Apply link must be a valid URL");
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim(),
      applyLink: form.applyLink.trim(),
      salary: form.salary.trim(),
      tags: form.tags
        ? form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };

    try {
      setLoading(true);
      await API.post("/jobs", payload);
      resetAll();
      onCreated?.();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Could not post job");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    resetAll();
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Post a job"
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
            iconLeft={Briefcase}
          >
            Submit for review
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-muted">
          New jobs go to the admin review queue before they appear publicly.
        </p>

        <div>
          <Label>Role title *</Label>
          <input
            className="input"
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. Software Engineer — Platform"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Company *</Label>
            <input
              className="input"
              value={form.company}
              onChange={set("company")}
              placeholder="e.g. Google"
            />
          </div>
          <div>
            <Label>Location *</Label>
            <input
              className="input"
              value={form.location}
              onChange={set("location")}
              placeholder="e.g. Bangalore (Hybrid)"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label>Type</Label>
            <select className="input" value={form.type} onChange={set("type")}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Experience</Label>
            <select
              className="input"
              value={form.experienceLevel}
              onChange={set("experienceLevel")}
            >
              {EXPERIENCE.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Salary (optional)</Label>
            <input
              className="input"
              value={form.salary}
              onChange={set("salary")}
              placeholder="e.g. 12 LPA"
            />
          </div>
        </div>

        <div>
          <Label>Apply link *</Label>
          <input
            className="input"
            type="url"
            value={form.applyLink}
            onChange={set("applyLink")}
            placeholder="https://company.com/careers/role"
          />
        </div>

        <div>
          <Label>Description</Label>
          <textarea
            className="input"
            rows={4}
            value={form.description}
            onChange={set("description")}
            placeholder="What the role involves, team context, must-haves…"
          />
        </div>

        <div>
          <Label>Skills / tags</Label>
          <input
            className="input"
            value={form.tags}
            onChange={set("tags")}
            placeholder="Comma-separated, e.g. react, node, aws"
          />
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

export default CreateJobModal;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  MessageCircle,
  GraduationCap,
  FileText,
  Download,
  BookOpen,
} from "lucide-react";

import API from "../../services/api";

import { Badge, Button, EmptyState, Skeleton } from "../../components/ui";
import {
  ProfileHeader,
  Section,
  DetailsBlock,
  SkillsBlock,
} from "../../components/profile/ProfileLayout";
import ConnectionButton from "../../components/ConnectionButton";

/* =====================================================
   TEACHER PROFILE — /teachers/:id
   Backend returns { teacher, resources, posts }
===================================================== */

const TeacherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/teachers/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Could not load this profile");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-4 pb-10 space-y-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const teacher = data?.teacher;
  const resources = data?.resources || [];

  if (!teacher) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Teacher not found"
        description="This profile may have been removed."
        action={
          <Button variant="secondary" onClick={() => navigate("/teachers")}>
            Back to faculty
          </Button>
        }
      />
    );
  }

  return (
    <div className="pt-4 pb-10">
      <button
        onClick={() => navigate("/teachers")}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4"
      >
        <ArrowLeft size={14} />
        Faculty
      </button>

      <ProfileHeader
        user={teacher}
        actions={
          <>
            <div className="min-w-[150px]">
              <ConnectionButton userId={teacher._id} />
            </div>
            <Button
              variant="secondary"
              iconLeft={MessageCircle}
              onClick={() => navigate("/chat")}
            >
              Message
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 space-y-5">
          <DetailsBlock user={teacher} />
          <SkillsBlock skills={teacher.skills} />
        </div>

        <div className="lg:col-span-2">
          <Section
            title={`Uploaded resources${
              resources.length ? ` · ${resources.length}` : ""
            }`}
          >
            {resources.length === 0 ? (
              <EmptyState
                compact
                icon={FileText}
                title="No resources yet"
                description={`${teacher.name} hasn't uploaded any study material.`}
              />
            ) : (
              <ul className="space-y-2">
                {resources.map((r) => (
                  <li
                    key={r._id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-line hover:bg-surface-2 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-brand-soft flex items-center justify-center shrink-0">
                      <FileText size={15} className="text-brand" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-ink truncate">
                        {r.title}
                      </div>
                      <div className="text-xs text-muted flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <BookOpen size={11} />
                          Sem {r.semester}
                        </span>
                        {r.subject && <span>· {r.subject}</span>}
                        {typeof r.downloads === "number" && (
                          <span>· {r.downloads} downloads</span>
                        )}
                      </div>
                    </div>
                    {r.type && <Badge variant="neutral">{r.type}</Badge>}
                    {r.fileUrl && (
                      <a
                        href={r.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="icon-btn !w-9 !h-9 border border-line shrink-0"
                        aria-label="Open resource"
                        title="Open"
                      >
                        <Download size={15} />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;

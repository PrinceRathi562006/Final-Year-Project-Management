import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CircleHelp,
  Clock3,
  GraduationCap,
  LoaderCircle,
  MessageSquareText,
  RefreshCw,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { fetchStudentFeedback, fetchStudentProject } from "../../store/slices/studentSlice";
import "./FeedbackPage.css";

const feedbackTypes = {
  positive: { label: "Encouragement", Icon: Sparkles },
  general: { label: "Supervisor note", Icon: MessageSquareText },
  negative: { label: "Revision requested", Icon: RotateCcw },
};

function formatDate(value) {
  if (!value) return "Date not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not recorded";
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function feedbackDate(note, project) {
  if (note.createdAt) return note.createdAt;
  const id = String(note._id || "");
  if (/^[a-f\d]{24}$/i.test(id)) return new Date(Number.parseInt(id.slice(0, 8), 16) * 1000);
  return project.updatedAt;
}

function toDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export default function FeedbackPage() {
  const dispatch = useDispatch();
  const {
    project,
    isLoadingProject,
    projectError,
    feedback = [],
    feedbackProject,
    isLoadingFeedback,
    feedbackError,
  } = useSelector((state) => state.student || {});

  useEffect(() => {
    dispatch(fetchStudentProject());
  }, [dispatch]);

  useEffect(() => {
    if (project?._id) dispatch(fetchStudentFeedback(project._id));
  }, [dispatch, project?._id]);

  const isLoading = isLoadingProject || isLoadingFeedback;
  const displayedProject = feedbackProject || project;

  return (
    <main className="student-feedback">
      <div className="student-feedback__ambient" aria-hidden="true"><i /><span /></div>
      <div className="student-feedback__inner">
        <header className="student-feedback__masthead"><span><BookOpen size={15} /> STUDENT FIELDNOTES <i /> SUPERVISOR NOTES</span><small>YOUR WORKSPACE / 04</small></header>

        <section className="student-feedback__intro">
          <span className="student-feedback__kicker"><MessageSquareText size={13} /> PROJECT CONVERSATION</span>
          <h1>Notes to help<br />your work <em>grow.</em></h1>
          <p>Keep your supervisor’s comments close as your project takes shape. Use each note to guide your next steps.</p>
        </section>

        {isLoading && <div className="student-feedback__state" role="status"><LoaderCircle className="student-feedback__spin" size={18} /> Loading your feedback…</div>}

        {!isLoading && projectError && <div className="student-feedback__message student-feedback__message--error" role="alert"><CircleHelp size={17} /><span>{projectError}</span><button type="button" onClick={() => dispatch(fetchStudentProject())}><RefreshCw size={13} /> Try again</button></div>}

        {!isLoading && !projectError && !project && <section className="student-feedback__empty"><span><GraduationCap size={21} /></span><small>NO PROJECT YET</small><h2>Feedback starts with an idea.</h2><p>Once you submit a project proposal, your supervisor’s notes will be collected here.</p><Link to="/student/submit-proposal">Create a proposal <ArrowUpRight size={14} /></Link></section>}

        {!isLoading && project && <>
          <section className="student-feedback__project"><span className="student-feedback__project-icon"><BookOpen size={17} /></span><div><small>FEEDBACK FOR</small><strong>{displayedProject?.title || project.title}</strong></div><span className="student-feedback__project-count">{feedback.length} {feedback.length === 1 ? "NOTE" : "NOTES"}</span></section>

          {feedbackError && <div className="student-feedback__message student-feedback__message--error" role="alert"><CircleHelp size={17} /><span>{feedbackError}</span><button type="button" onClick={() => dispatch(fetchStudentFeedback(project._id))}><RefreshCw size={13} /> Try again</button></div>}

          {!feedbackError && feedback.length === 0 && <section className="student-feedback__empty student-feedback__empty--notes"><span><MessageSquareText size={21} /></span><small>NO NOTES SHARED</small><h2>Your feedback will appear here.</h2><p>When your supervisor leaves a comment on this project, you’ll find it here with its date and context.</p><Link to="/student/supervisor">View your supervisor <ArrowUpRight size={14} /></Link></section>}

          {!feedbackError && feedback.length > 0 && <section className="student-feedback__list" aria-label="Supervisor feedback">
            {feedback.map((note, index) => {
              const type = feedbackTypes[note.type] || feedbackTypes.general;
              const TypeIcon = type.Icon;
              const supervisorName = note.supervisorId?.name || project.supervisor?.name || "Project supervisor";
              return <article className={`student-feedback__note student-feedback__note--${note.type || "general"}`} key={note._id || `${note.title}-${index}`}>
                <div className="student-feedback__note-top"><span className="student-feedback__note-type"><TypeIcon size={14} /> {type.label}</span><time dateTime={toDateTime(feedbackDate(note, project))}><Clock3 size={12} /> {formatDate(feedbackDate(note, project))}</time></div>
                <h2>{note.title || "Supervisor feedback"}</h2>
                <p>{note.message}</p>
                <footer><span><GraduationCap size={14} /> {supervisorName}</span><span>NOTE {String(feedback.length - index).padStart(2, "0")}</span></footer>
              </article>;
            })}
          </section>}
        </>}

        <footer className="student-feedback__footer"><Link to="/student"><ArrowLeft size={14} /> Back to project desk</Link><Link to="/student/upload-files">Project materials <ArrowUpRight size={13} /></Link></footer>
      </div>
    </main>
  );
}

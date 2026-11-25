import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  GraduationCap,
  Lightbulb,
  MessageSquareText,
  RotateCcw,
  Sparkles,
  Upload,
} from "lucide-react";
import { fetchStudentDashboardStats } from "../../store/slices/studentSlice";
import "./StudentDashboard.css";

const statusDetails = {
  pending: { label: "Under review", icon: Clock3, tone: "pending" },
  approved: { label: "Approved", icon: Check, tone: "approved" },
  rejected: { label: "Changes requested", icon: RotateCcw, tone: "rejected" },
  completed: { label: "Completed", icon: Check, tone: "completed" },
};

function formatDate(dateValue) {
  if (!dateValue) return "Not set";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function getFirstName(name) {
  return name?.trim().split(/\s+/)[0] || "there";
}

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth || {});
  const { project, dashboardStats, isLoadingProject, projectError } = useSelector((state) => state.student || {});

  useEffect(() => {
    dispatch(fetchStudentDashboardStats());
  }, [dispatch]);

  const status = project ? (statusDetails[project.status] || statusDetails.pending) : null;
  const StatusIcon = status?.icon;
  const files = project?.files || [];
  const feedback = project?.feedback || [];
  const latestFeedback = [...feedback].sort((a, b) => {
    const aDate = new Date(a.createdAt || 0).getTime();
    const bDate = new Date(b.createdAt || 0).getTime();
    return bDate - aDate || feedback.indexOf(b) - feedback.indexOf(a);
  })[0];
  const needsProposal = !project || project.status === "rejected";
  const steps = [
    { label: "Share your idea", detail: project ? "Proposal submitted" : "Write a project proposal", done: Boolean(project), to: "/student/submit-proposal", icon: Lightbulb },
    { label: "Meet your guide", detail: project?.supervisor?.name || "Explore faculty interests", done: Boolean(project?.supervisor), to: "/student/supervisor", icon: GraduationCap },
    { label: "Build your project", detail: files.length ? `${files.length} ${files.length === 1 ? "file" : "files"} shared` : "Upload supporting files", done: files.length > 0, to: "/student/upload-files", icon: Upload },
  ];

  return (
    <main className="student-home">
      <div className="student-home__ambient" aria-hidden="true"><i /><i /><span /></div>
      <div className="student-home__inner">
        <header className="student-home__masthead">
          <span><BookOpen size={15} /> STUDENT FIELDNOTES <i /> PROJECT DESK</span>
          <small>YOUR WORKSPACE / 01</small>
        </header>

        <section className="student-home__hero">
          <div className="student-home__hero-copy">
            <span className="student-home__kicker"><Sparkles size={13} /> A SPACE FOR WHAT YOU’RE BUILDING</span>
            <h1>Welcome back,<br /><em>{getFirstName(authUser?.name)}.</em></h1>
            <p>Your project starts with a question. Keep track of your idea, the people guiding it, and the work taking shape.</p>
          </div>
          <div className="student-home__hero-mark" aria-hidden="true"><BookOpen size={32} /><span>IDEAS<br />IN PROGRESS</span><i /></div>
        </section>

        <section className="student-home__metrics" aria-label="Project summary">
          <article className="student-home__metric"><span className="student-home__metric-icon"><FileText size={17} /></span><span><small>PROJECT STATUS</small><strong>{isLoadingProject && !project ? "Loading" : status?.label || "No proposal"}</strong></span></article>
          <article className="student-home__metric"><span className="student-home__metric-icon"><Upload size={17} /></span><span><small>SHARED MATERIAL</small><strong>{files.length} {files.length === 1 ? "file" : "files"}</strong></span></article>
          <article className="student-home__metric"><span className="student-home__metric-icon"><MessageSquareText size={17} /></span><span><small>FEEDBACK NOTES</small><strong>{feedback.length} {feedback.length === 1 ? "note" : "notes"}</strong></span></article>
        </section>

        {projectError && <div className="student-home__error" role="alert"><span>{projectError}</span><button type="button" onClick={() => dispatch(fetchStudentDashboardStats())} disabled={isLoadingProject}>{isLoadingProject ? "Retrying..." : "Retry"}</button></div>}

        <div className="student-home__grid">
          <section className="student-home__project-panel" aria-labelledby="student-project-title">
            <div className="student-home__panel-head"><div><span className="student-home__eyebrow">PROJECT REGISTER</span><h2 id="student-project-title">Your current work</h2></div><span className="student-home__folio">01 / PROJECT</span></div>
            {isLoadingProject && !project ? (
              <div className="student-home__state" role="status"><span className="student-home__spinner" /> Checking your project register…</div>
            ) : project ? (
              <article className="student-home__project-card">
                <div className="student-home__project-top"><span className="student-home__project-index">PROJECT / 01</span><span className={`student-home__status student-home__status--${status.tone}`}><StatusIcon size={13} />{status.label}</span></div>
                <h3>{project.title}</h3>
                <p className="student-home__project-description">{project.description || "No project description has been added."}</p>
                <div className="student-home__project-meta"><span><CalendarDays size={14} /> Due {formatDate(project.deadline)}</span><span><GraduationCap size={14} /> {project.supervisor?.name || "No guide assigned"}</span></div>
                {latestFeedback && <div className="student-home__feedback"><MessageSquareText size={15} /><span><small>LATEST FEEDBACK</small><strong>{latestFeedback.title}</strong><p>{latestFeedback.message}</p></span></div>}
                <Link className="student-home__text-link" to={project.status === "rejected" ? "/student/submit-proposal" : "/student/feedback"}>{project.status === "rejected" ? "Revise your proposal" : "View project feedback"}<ArrowUpRight size={14} /></Link>
              </article>
            ) : (
              <div className="student-home__empty-project"><span><Lightbulb size={20} /></span><h3>Your idea can start here.</h3><p>Write a short proposal to give your project a starting point. You can refine it as your work develops.</p><Link to="/student/submit-proposal">Create a proposal <ArrowRight size={15} /></Link></div>
            )}
          </section>

          <aside className="student-home__steps-panel" aria-labelledby="student-steps-title">
            <div className="student-home__panel-head"><div><span className="student-home__eyebrow">A FEW GOOD NEXT STEPS</span><h2 id="student-steps-title">Project path</h2></div><span className="student-home__path-count">{steps.filter((step) => step.done).length}/{steps.length}</span></div>
            <div className="student-home__steps">{steps.map((step, index) => {
              const StepIcon = step.icon;
              return <Link className={`student-home__step${step.done ? " is-done" : ""}`} to={step.to} key={step.label}><span className="student-home__step-number">{step.done ? <Check size={14} /> : `0${index + 1}`}</span><span className="student-home__step-icon"><StepIcon size={16} /></span><span className="student-home__step-copy"><strong>{step.label}</strong><small>{step.detail}</small></span><ArrowUpRight className="student-home__step-arrow" size={15} /></Link>;
            })}</div>
            <div className="student-home__step-note"><Clock3 size={14} /><span>Take the next step when you’re ready. Your workspace keeps everything together.</span></div>
          </aside>
        </div>

        <section className="student-home__shortcuts" aria-label="Student workspace shortcuts">
          <div><span className="student-home__eyebrow">YOUR DESK, YOUR PACE</span><h2>Pick up where you left off</h2></div>
          <div className="student-home__shortcut-links">
            <Link to={needsProposal ? "/student/submit-proposal" : "/student/upload-files"}><span>{needsProposal ? <Lightbulb size={17} /> : <Upload size={17} />}</span>{needsProposal ? "Proposal" : "Upload files"}<ArrowRight size={14} /></Link>
            <Link to="/student/supervisor"><span><GraduationCap size={17} /></span>Faculty directory<ArrowRight size={14} /></Link>
            <Link to="/student/notifications"><span><MessageSquareText size={17} /></span>Notifications<ArrowRight size={14} /></Link>
          </div>
        </section>

        {(dashboardStats?.upcomingDeadlines?.length > 0 || dashboardStats?.topNotifications?.length > 0) && <section className="student-home__updates" aria-label="Upcoming deadlines and recent updates">
          {dashboardStats?.upcomingDeadlines?.length > 0 && <div><span className="student-home__eyebrow">COMING UP</span><h2>Next deadlines</h2><ul>{dashboardStats.upcomingDeadlines.map((deadline) => <li key={deadline._id}><CalendarDays size={14} /><span><strong>{deadline.title}</strong><small>{formatDate(deadline.deadline)}</small></span></li>)}</ul></div>}
          {dashboardStats?.topNotifications?.length > 0 && <div><span className="student-home__eyebrow">FROM YOUR WORKSPACE</span><h2>Recent updates</h2><ul>{dashboardStats.topNotifications.map((notification) => <li key={notification._id}><MessageSquareText size={14} /><span><strong>{notification.message}</strong><small>{formatDate(notification.createdAt)}</small></span></li>)}</ul><Link to="/student/notifications">See all notifications <ArrowUpRight size={13} /></Link></div>}
        </section>}

        <footer className="student-home__footer"><span>PROJECT HUB <i /> STUDENT FIELDNOTES</span><span>SMALL STEPS MAKE STRONG PROJECTS <ArrowUpRight size={13} /></span></footer>
      </div>
    </main>
  );
}

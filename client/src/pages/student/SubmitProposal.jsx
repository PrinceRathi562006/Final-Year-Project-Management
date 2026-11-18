import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AnimatePresence, motion as motionComponents, useReducedMotion } from "framer-motion";
import { toast } from "react-toastify";
import {
  ArrowRight,
  BookOpen,
  Check,
  CircleHelp,
  Clock3,
  FileText,
  Lightbulb,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";
import {
  clearProposalError,
  fetchStudentProject,
  submitProposal,
} from "../../store/slices/studentSlice";
import "./SubmitProposal.css";

const MotionArticle = motionComponents.article;
const MotionSection = motionComponents.section;
const MotionDiv = motionComponents.div;

const MAX_TITLE = 200;
const MAX_DESCRIPTION = 2000;

const statusCopy = {
  pending: {
    label: "Under review",
    detail: "Your proposal is with the project office for review. You can submit another proposal after this one is rejected; if it’s approved, you can continue developing this project.",
    icon: Clock3,
  },
  approved: {
    label: "Approved",
    detail: "Your idea is approved. You can move on to the next steps.",
    icon: Check,
  },
  rejected: {
    label: "Changes requested",
    detail: "Review the feedback, refine your idea, and submit a new version.",
    icon: RotateCcw,
  },
  completed: {
    label: "Completed",
    detail: "This project has been marked complete.",
    icon: Check,
  },
};

function ProposalStatus({ project, onStartNew }) {
  const status = statusCopy[project.status] || statusCopy.pending;
  const StatusIcon = status.icon;

  return (
    <MotionArticle
      className={`proposal-status proposal-status--${project.status || "pending"}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="proposal-status__topline">
        <span className="proposal-status__icon"><StatusIcon size={19} /></span>
        <span className="proposal-status__eyebrow">CURRENT PROPOSAL</span>
        <span className="proposal-status__badge"><i />{status.label}</span>
      </div>
      <h2>{project.title}</h2>
      <p className={`proposal-status__reminder${project.status === "pending" ? " is-pending" : ""}`}>{status.detail}</p>
      <div className="proposal-status__description">{project.description}</div>
      <div className="proposal-status__meta">
        <span><BookOpen size={14} /> Submitted {project.createdAt ? new Date(project.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "recently"}</span>
        {project.supervisor?.name && <span>Guide Â· {project.supervisor.name}</span>}
      </div>
      {project.status === "rejected" && (
        <div className="proposal-status__actions">
          <p>You can submit a revised proposal when youâ€™re ready.</p>
          <button type="button" onClick={onStartNew}><RotateCcw size={15} /> Start a new proposal</button>
        </div>
      )}
      {project.status === "approved" && (
        <div className="proposal-status__actions">
          <p>Your next step is to share supporting material.</p>
          <Link to="/student/upload-files">Go to file uploads <ArrowRight size={15} /></Link>
        </div>
      )}
    </MotionArticle>
  );
}

export default function SubmitProposal() {
  const dispatch = useDispatch();
  const reducedMotion = useReducedMotion();
  const {
    project,
    isLoadingProject,
    isSubmittingProposal,
    projectError,
    proposalError,
  } = useSelector((state) => state.student);
  const { authUser } = useSelector((state) => state.auth);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    dispatch(fetchStudentProject());
  }, [dispatch]);

  const canStartNew = !project || project.status === "rejected";
  const titleError = attempted && !title.trim() ? "Add a title for your idea." : "";
  const descriptionError = attempted && !description.trim()
    ? "Describe the problem and what you hope to build."
    : "";

  const focusProposalForm = () => {
    document.getElementById("proposal-form")?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
    window.setTimeout(() => document.getElementById("proposal-title")?.focus(), reducedMotion ? 0 : 350);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAttempted(true);
    dispatch(clearProposalError());
    if (!title.trim() || !description.trim()) return;

    try {
      await dispatch(submitProposal({
        title: title.trim(),
        description: description.trim(),
      })).unwrap();
      setTitle("");
      setDescription("");
      setAttempted(false);
      toast.success("Your proposal has been submitted.");
    } catch {
      // Redux exposes the API message beside the form so it remains available
      // if the student needs to correct the proposal and retry.
    }
  };

  return (
    <main className="proposal-page">
      <div className="proposal-page__ambient" aria-hidden="true">
        <span className="proposal-orbit proposal-orbit--one" />
        <span className="proposal-orbit proposal-orbit--two" />
        <span className="proposal-page__grain" />
      </div>
      <div className="proposal-page__inner">
        <header className="proposal-page__masthead">
          <div className="proposal-page__folio"><BookOpen size={15} /> STUDENT FIELDNOTES <i /> PROJECT OFFICE</div>
          <span className="proposal-page__edition">IDEA REGISTER / 01</span>
        </header>

        <MotionSection
          className="proposal-page__intro"
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 0.75, 0.28, 1] }}
        >
          <span className="proposal-page__kicker"><Sparkles size={13} /> THE FIRST PAGE OF YOUR PROJECT</span>
          <h1>Give your idea<br />a place to <em>begin.</em></h1>
          <p>Start with the question you want to answer. You can shape the details as the work takes form.</p>
          <div className="proposal-page__welcome"><span>{(authUser?.name || "S").trim().charAt(0).toUpperCase()}</span> A new chapter for {authUser?.name?.split(" ")[0] || "you"}</div>
        </MotionSection>

        <div className="proposal-page__layout">
          <section className="proposal-compose" id="proposal-form" aria-labelledby="proposal-form-title">
            <div className="proposal-compose__heading">
              <span className="proposal-compose__number">01</span>
              <div><span>PROJECT PROPOSAL</span><h2 id="proposal-form-title">Put the idea into words</h2></div>
              <FileText size={20} aria-hidden="true" />
            </div>

            {isLoadingProject ? (
              <div className="proposal-loading" role="status"><span /> Checking your project registerâ€¦</div>
            ) : projectError ? (
              <div className="proposal-message proposal-message--error" role="alert">
                <CircleHelp size={18} /><span>{projectError}</span>
                <button type="button" onClick={() => dispatch(fetchStudentProject())}>Try again</button>
              </div>
            ) : project && !canStartNew ? (
              <ProposalStatus project={project} onStartNew={focusProposalForm} />
            ) : (
              <>
                {project?.status === "rejected" && <ProposalStatus project={project} onStartNew={focusProposalForm} />}
                <AnimatePresence>
                  {proposalError && <MotionDiv className="proposal-message proposal-message--error" role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}><CircleHelp size={18} /><span>{proposalError}</span></MotionDiv>}
                </AnimatePresence>
                <form className="proposal-form" onSubmit={handleSubmit} noValidate>
                  <label className={`proposal-field${titleError ? " is-invalid" : ""}`} htmlFor="proposal-title">
                    <span>Working title <i>Required</i></span>
                    <input
                      id="proposal-title"
                      name="title"
                      type="text"
                      autoComplete="off"
                      maxLength={MAX_TITLE}
                      placeholder="A clear, working title for your idea"
                      value={title}
                      aria-invalid={Boolean(titleError)}
                      aria-describedby={titleError ? "proposal-title-error" : "proposal-title-help"}
                      onChange={(event) => setTitle(event.target.value)}
                    />
                    <small id={titleError ? "proposal-title-error" : "proposal-title-help"}>{titleError || `${title.length} / ${MAX_TITLE} characters`}</small>
                  </label>
                  <label className={`proposal-field proposal-field--textarea${descriptionError ? " is-invalid" : ""}`} htmlFor="proposal-description">
                    <span>Tell us about it <i>Required</i></span>
                    <textarea
                      id="proposal-description"
                      name="description"
                      rows={7}
                      maxLength={MAX_DESCRIPTION}
                      placeholder="What problem or opportunity are you exploring? Why does it matter, and what do you hope to create or learn?"
                      value={description}
                      aria-invalid={Boolean(descriptionError)}
                      aria-describedby={descriptionError ? "proposal-description-error" : "proposal-description-help"}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                    <small id={descriptionError ? "proposal-description-error" : "proposal-description-help"}>{descriptionError || `${description.length} / ${MAX_DESCRIPTION} characters`}</small>
                  </label>
                  <div className="proposal-form__guide"><Lightbulb size={17} /><p><strong>A useful starting point</strong><br />Share the context, your main question, and the outcome you have in mind. A first draft can be rough.</p></div>
                  <div className="proposal-form__bottom">
                    <span><i /> You can refine your idea after review.</span>
                    <button type="submit" disabled={isSubmittingProposal}>
                      {isSubmittingProposal ? <><span className="proposal-spinner" /> Sending proposalâ€¦</> : <>Submit proposal <Send size={16} /></>}
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>

          <aside className="proposal-aside" aria-label="Proposal guidance">
            <div className="proposal-aside__art" aria-hidden="true">
              <div className="proposal-aside__sheet"><i /><i /><i /><i /><span><Lightbulb /></span></div>
              <div className="proposal-aside__shadow" />
              <div className="proposal-aside__stamp">FIELD<br />NOTE</div>
            </div>
            <div className="proposal-aside__copy">
              <span>GOOD IDEAS GROW</span>
              <h2>Begin curious.<br /><em>Build with care.</em></h2>
              <p>Thereâ€™s no perfect first draft. Give your idea a clear starting point, then let questions and feedback make it stronger.</p>
              <div className="proposal-aside__steps"><span><b>01</b> Share your idea</span><span><b>02</b> Get it reviewed</span><span><b>03</b> Keep building</span></div>
            </div>
          </aside>
        </div>

        <footer className="proposal-page__footer"><span>PROJECT HUB <i /> STUDENT FIELDNOTES</span><span>MADE TO MOVE IDEAS FORWARD <ArrowRight size={13} /></span></footer>
      </div>
    </main>
  );
}

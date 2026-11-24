import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Building2,
  Check,
  CalendarDays,
  CircleHelp,
  GraduationCap,
  Mail,
  MessageSquareText,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import {
  clearSupervisorRequestError,
  fetchAllSupervisors,
  fetchProject,
  getSupervisor,
  requestSupervisor,
} from "../../store/slices/studentSlice";
import "./SupervisorPage.css";

function getExpertise(supervisor) {
  const areas = supervisor.experties || supervisor.expertise || [];
  return Array.isArray(areas)
    ? areas.map((area) => String(area).trim()).filter(Boolean)
    : String(areas).split(",").map((area) => area.trim()).filter(Boolean);
}

function getInitials(name = "Faculty member") {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function formatDeadline(dateValue) {
  if (!dateValue) return "No deadline set";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "No deadline set";
  const day = date.getDate();
  const lastTwoDigits = day % 100;
  const suffix = lastTwoDigits >= 11 && lastTwoDigits <= 13
    ? "th"
    : ({ 1: "st", 2: "nd", 3: "rd" }[day % 10] || "th");
  const month = new Intl.DateTimeFormat(undefined, { month: "long" }).format(date);
  return `${day}${suffix} ${month} ${date.getFullYear()}`;
}

export default function SupervisorPage() {
  const dispatch = useDispatch();
  const {
    supervisors = [],
    isLoadingSupervisors,
    supervisorsError,
    project,
    isLoadingProject,
    projectError,
    supervisor,
    isLoadingSupervisor,
    supervisorError,
    supervisorRequest,
    isRequestingSupervisor,
    supervisorRequestError,
  } = useSelector((state) => state.student || {});
  const { authUser } = useSelector((state) => state.auth || {});
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

  useEffect(() => {
    dispatch(fetchProject());
    dispatch(getSupervisor());
    dispatch(fetchAllSupervisors());
  }, [dispatch]);

  useEffect(() => {
    if (supervisorRequest) {
      setShowRequestModal(false);
      setRequestMessage("");
      setSelectedSupervisor(null);
      toast.success("Supervisor request sent successfully.");
    }
  }, [supervisorRequest]);

  const handleOpenRequest = (person) => {
    dispatch(clearSupervisorRequestError());
    setSelectedSupervisor(person);
    setRequestMessage("");
    setShowRequestModal(true);
  };

  const handleCloseRequest = () => {
    if (isRequestingSupervisor) return;
    setShowRequestModal(false);
    setRequestMessage("");
    setSelectedSupervisor(null);
    dispatch(clearSupervisorRequestError());
  };

  const handleSubmitRequest = async (event) => {
    event.preventDefault();
    if (!selectedSupervisor) return;
    const message = requestMessage.trim();
    if (!message) {
      toast.error("Add a short message to your request.");
      return;
    }
    try {
      await dispatch(requestSupervisor({ teacherId: selectedSupervisor._id, message })).unwrap();
    } catch {
      // Keep the form open so the student can correct the request and retry.
    }
  };

  const departments = useMemo(
    () => [...new Set(supervisors.map((person) => person.department).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b)),
    [supervisors],
  );
  const filteredSupervisors = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return supervisors.filter((person) => {
      const expertise = getExpertise(person);
      const values = [person.name, person.department, person.email, ...expertise];
      const matchesText = !needle || values.some((value) => String(value || "").toLowerCase().includes(needle));
      return matchesText && (department === "all" || person.department === department);
    }).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [supervisors, query, department]);

  const clearFilters = () => {
    setQuery("");
    setDepartment("all");
  };

  return (
    <main className="supervisor-directory">
      <div className="supervisor-directory__ambient" aria-hidden="true"><i /><i /><span /></div>
      <div className="supervisor-directory__inner">
        <header className="supervisor-directory__masthead">
          <span><BookOpen size={15} /> STUDENT FIELDNOTES <i /> FACULTY DIRECTORY</span>
          <small>PEOPLE / GUIDES</small>
        </header>

        <section
          className="supervisor-directory__intro"
        >
          <div className="supervisor-directory__intro-copy">
            <span className="supervisor-directory__kicker"><Sparkles size={13} /> FIND YOUR NEXT CONVERSATION</span>
            <h1>Good work grows<br />with a <em>good guide.</em></h1>
            <p>Explore faculty interests and find someone whose experience connects with the questions you want to explore.</p>
            <div className="supervisor-directory__welcome"><span>{getInitials(authUser?.name || "Student")}</span> A guide for your next chapter</div>
          </div>
          <div className="supervisor-directory__seal" aria-hidden="true"><GraduationCap size={29} /><span>PROJECT<br />FIELD GUIDE</span><i /></div>
        </section>

        <section className="supervisor-current-panel" aria-labelledby="current-supervisor-title">
          <div className="supervisor-detail-heading"><span className="supervisor-detail-heading__icon"><GraduationCap size={17} /></span><div><small>YOUR PROJECT TEAM</small><h2 id="current-supervisor-title">Current supervisor</h2></div></div>
          {isLoadingSupervisor ? (
            <div className="supervisor-detail-loading" role="status"><span className="supervisor-spinner" /> Checking your supervisor assignment...</div>
          ) : supervisorError ? (
            <div className="supervisor-detail-message supervisor-detail-message--error" role="alert"><CircleHelp size={16} /> {supervisorError}</div>
          ) : supervisor ? (
            <div className="supervisor-current-person"><span className="supervisor-card__avatar">{getInitials(supervisor.name)}</span><div><strong>{supervisor.name}</strong><span>{supervisor.department || "Faculty member"}</span>{supervisor.email && <a href={`mailto:${supervisor.email}`}><Mail size={13} /> {supervisor.email}</a>}</div><span className="supervisor-current-person__badge"><Check size={13} /> Assigned</span></div>
          ) : (
            <div className="supervisor-unassigned"><span>Supervisor not assigned yet.</span><a href="#faculty-directory">Explore faculty <ArrowUpRight size={14} /></a></div>
          )}
        </section>

        <section className="supervisor-project-details" aria-labelledby="supervisor-project-title">
          <div className="supervisor-detail-heading"><span className="supervisor-detail-heading__icon"><BookOpen size={17} /></span><div><small>PROJECT REGISTER</small><h2 id="supervisor-project-title">Project details</h2></div></div>
          {isLoadingProject && !project ? (
            <div className="supervisor-detail-loading" role="status"><span className="supervisor-spinner" /> Loading your project details...</div>
          ) : projectError ? (
            <div className="supervisor-detail-message supervisor-detail-message--error" role="alert"><CircleHelp size={16} /> {projectError}<button type="button" onClick={() => dispatch(fetchProject())} disabled={isLoadingProject}>Retry</button></div>
          ) : project ? (
            <div className="supervisor-project-facts">
              <div className="supervisor-project-fact supervisor-project-fact--title"><small>PROJECT TITLE</small><strong>{project.title || "Untitled project"}</strong></div>
              <div className="supervisor-project-fact"><small>DEADLINE</small><strong>{formatDeadline(project.deadline)}</strong></div>
              <div className="supervisor-project-fact"><small>STATUS</small><strong><span className={`supervisor-project-status supervisor-project-status--${project.status || "pending"}`}>{project.status || "Pending"}</span></strong></div>
              <div className="supervisor-project-fact"><small>CREATED</small><strong>{formatDeadline(project.createdAt)}</strong></div>
              <div className="supervisor-project-fact supervisor-project-fact--description"><small>DESCRIPTION</small><p>{project.description || "No project description has been added."}</p></div>
            </div>
          ) : (
            <div className="supervisor-project-empty"><FileText size={18} /><span>No project proposal found yet.</span><Link to="/student/submit-proposal">Create a proposal <ArrowUpRight size={14} /></Link></div>
          )}
        </section>
        {supervisorRequest && !supervisor && <div className="supervisor-request-notice" role="status"><MessageSquareText size={16} /> Your supervisor request is pending review.</div>}

        <section className="supervisor-directory__overview" aria-label="Directory overview">
          <div className="supervisor-overview-card"><span className="supervisor-overview-card__icon"><UsersRound size={17} /></span><span><small>FACULTY IN DIRECTORY</small><strong>{isLoadingSupervisors && !supervisors.length ? "—" : supervisors.length}</strong></span></div>
          <div className="supervisor-overview-card"><span className="supervisor-overview-card__icon"><Building2 size={17} /></span><span><small>DEPARTMENTS</small><strong>{departments.length}</strong></span></div>
          <div className="supervisor-overview-card supervisor-overview-card--welcome"><span className="supervisor-overview-card__icon"><BookOpen size={17} /></span><span><small>YOUR DIRECTORY</small><strong>Start a conversation</strong></span></div>
        </section>

        <section className="supervisor-directory__content" id="faculty-directory" aria-label="Supervisor directory">
          <div className="supervisor-directory__section-head">
            <div><span className="supervisor-directory__kicker"><SlidersHorizontal size={12} /> BROWSE THE DIRECTORY</span><h2>Faculty &amp; interests</h2></div>
            <span className="supervisor-directory__count"><b>{filteredSupervisors.length}</b> of {supervisors.length} {supervisors.length === 1 ? "guide" : "guides"}</span>
          </div>

          <div className="supervisor-directory__toolbar">
            <label className="supervisor-search" htmlFor="supervisor-search">
              <Search size={17} />
              <input id="supervisor-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, department, or interest" />
              {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={15} /></button>}
            </label>
            <label className="supervisor-filter" htmlFor="supervisor-department">
              <Building2 size={15} />
              <select id="supervisor-department" value={department} onChange={(event) => setDepartment(event.target.value)}>
                <option value="all">Every department</option>
                {departments.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            {(query || department !== "all") && <button className="supervisor-clear" type="button" onClick={clearFilters}>Clear filters</button>}
          </div>

          {isLoadingSupervisors && !supervisors.length ? (
            <div className="supervisor-state" role="status"><span className="supervisor-spinner" /> Opening the faculty directory...</div>
          ) : supervisorsError && !supervisors.length ? (
            <div className="supervisor-state supervisor-state--error" role="alert">
              <div className="supervisor-state__symbol"><UsersRound size={21} /></div>
              <strong>The directory did not load</strong><p>{supervisorsError}</p>
              <button type="button" onClick={() => dispatch(fetchAllSupervisors())}>Try again <ArrowUpRight size={14} /></button>
            </div>
          ) : !filteredSupervisors.length ? (
            <div className="supervisor-state supervisor-state--empty">
              <div className="supervisor-state__symbol"><Search size={21} /></div>
              <strong>{supervisors.length ? "No faculty match this search" : "No supervisors are listed yet"}</strong>
              <p>{supervisors.length ? "Try a different name, interest, or department." : "The faculty directory is empty right now. Check back later."}</p>
              {supervisors.length > 0 && <button type="button" onClick={clearFilters}>Show everyone</button>}
            </div>
          ) : (
            <div className="supervisor-cards">
              {filteredSupervisors.map((person, index) => {
                  const expertise = getExpertise(person);
                  const isSelected = person._id === selectedId;
                  const isCurrent = supervisor?._id === person._id;
                  return (
                    <article
                      key={person._id || person.email || person.name}
                      className={`supervisor-card${isSelected ? " is-selected" : ""}${isCurrent ? " is-current" : ""}`}
                    >
                      <div className="supervisor-card__topline"><span>{isCurrent ? "YOUR SUPERVISOR" : "FACULTY PROFILE"}</span><span>{String(index + 1).padStart(2, "0")}</span></div>
                      <button type="button" className="supervisor-card__select" aria-expanded={isSelected} onClick={() => setSelectedId(isSelected ? null : person._id)} aria-label={`${isSelected ? "Close" : "View"} ${person.name || "faculty member"}'s profile`}>
                        <span className="supervisor-card__avatar">{getInitials(person.name)}</span>
                        <span className="supervisor-card__identity"><strong>{person.name || "Faculty member"}</strong><small>{person.department || "Department not listed"}</small></span>
                        <span className="supervisor-card__open" aria-hidden="true">{isSelected ? <Check size={16} /> : <ArrowUpRight size={16} />}</span>
                      </button>
                      <div className="supervisor-card__details">
                        <span className="supervisor-card__label"><GraduationCap size={14} /> AREAS OF INTEREST</span>
                        {expertise.length ? (
                          <div className="supervisor-card__tags">{(isSelected ? expertise : expertise.slice(0, 3)).map((area) => <span key={area}>{area}</span>)}{!isSelected && expertise.length > 3 && <span className="supervisor-card__more">+{expertise.length - 3}</span>}</div>
                        ) : <p className="supervisor-card__none">Areas of interest have not been added.</p>}
                      </div>
                      <div className={`supervisor-card__contact${isSelected ? " is-expanded" : ""}`}>
                        <span>{isSelected ? "Have an idea in mind?" : "Connect about a project"}</span>
                        {isCurrent ? <span className="supervisor-card__assigned"><Check size={13} /> Assigned</span> : (
                          <button type="button" className="supervisor-card__request" onClick={() => handleOpenRequest(person)} disabled={Boolean(supervisor) || Boolean(supervisorRequest)}>
                            <MessageSquareText size={13} /> Request guide <ArrowUpRight size={13} />
                          </button>
                        )}
                        {person.email && <a className="supervisor-card__email" href={`mailto:${person.email}?subject=${encodeURIComponent("Project supervision inquiry")}`} aria-label={`Email ${person.name || "faculty member"}`}><Mail size={14} /></a>}
                      </div>
                    </article>
                  );
                })}
            </div>
          )}
          {supervisorsError && supervisors.length > 0 && (
            <div className="supervisor-refresh-error" role="alert">
              <span>{supervisorsError}</span>
              <button type="button" onClick={() => dispatch(fetchAllSupervisors())} disabled={isLoadingSupervisors}>
                {isLoadingSupervisors ? "Refreshing…" : "Retry"}
              </button>
            </div>
          )}
          {isLoadingSupervisors && supervisors.length > 0 && (
            <div className="supervisor-refresh-status" role="status"><span className="supervisor-spinner" /> Refreshing directory…</div>
          )}
        </section>

        <aside className="supervisor-directory__note"><span><Sparkles size={16} /></span><p><strong>A good first step</strong> Browse faculty interests, then send a short note about the question you want to explore. A focused introduction makes it easier to start a useful conversation.</p><span className="supervisor-directory__note-mark" aria-hidden="true">01</span></aside>
        <footer className="supervisor-directory__footer"><span>PROJECT HUB <i /> STUDENT FIELDNOTES</span><span>GOOD IDEAS FIND THEIR PEOPLE <ArrowUpRight size={13} /></span></footer>
      </div>

      {showRequestModal && selectedSupervisor && <div className="supervisor-request-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) handleCloseRequest(); }}>
        <section className="supervisor-request-modal" role="dialog" aria-modal="true" aria-labelledby="supervisor-request-title">
          <header className="supervisor-request-modal__header"><span><MessageSquareText size={16} /> SUPERVISOR REQUEST</span><button type="button" onClick={handleCloseRequest} disabled={isRequestingSupervisor} aria-label="Close request dialog"><X size={18} /></button></header>
          <div className="supervisor-request-modal__person"><span className="supervisor-card__avatar">{getInitials(selectedSupervisor.name)}</span><span><small>REQUESTING AS YOUR GUIDE</small><strong>{selectedSupervisor.name}</strong><i>{selectedSupervisor.department || "Faculty member"}</i></span></div>
          {project && <div className="supervisor-request-modal__project"><small>PROJECT IDEA</small><strong>{project.title}</strong><span>Deadline: {formatDeadline(project.deadline)}</span></div>}
          <form onSubmit={handleSubmitRequest}>
            <label htmlFor="supervisor-request-message">Introduce your project idea <span>Required</span></label>
            <textarea id="supervisor-request-message" value={requestMessage} onChange={(event) => setRequestMessage(event.target.value)} maxLength={250} rows={4} placeholder="Briefly explain why you are contacting this supervisor and how your interests connect." required />
            <small className="supervisor-request-modal__counter">{requestMessage.length}/250 characters</small>
            {supervisorRequestError && <p className="supervisor-request-modal__error" role="alert"><CircleHelp size={15} /> {supervisorRequestError}</p>}
            {!project && <p className="supervisor-request-modal__hint">You can send a request before creating a project proposal.</p>}
            <footer><button className="supervisor-request-modal__cancel" type="button" onClick={handleCloseRequest} disabled={isRequestingSupervisor}><ArrowLeft size={14} /> Back</button><button className="supervisor-request-modal__submit" type="submit" disabled={isRequestingSupervisor || !requestMessage.trim()}>{isRequestingSupervisor ? "Sending..." : "Send request"}<Send size={14} /></button></footer>
          </form>
        </section>
      </div>}
    </main>
  );
}

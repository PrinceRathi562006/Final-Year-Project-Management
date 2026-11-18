import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion as motionComponents, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  Building2,
  Check,
  GraduationCap,
  Mail,
  Search,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { fetchAvailableSupervisors } from "../../store/slices/studentSlice";
import "./SupervisorPage.css";

const MotionArticle = motionComponents.article;

function getExpertise(supervisor) {
  const areas = supervisor.experties || supervisor.expertise || [];
  return Array.isArray(areas)
    ? areas.filter(Boolean)
    : String(areas).split(",").map((area) => area.trim()).filter(Boolean);
}

export default function SupervisorPage() {
  const dispatch = useDispatch();
  const reducedMotion = useReducedMotion();
  const {
    supervisors = [],
    isLoadingSupervisors,
    supervisorsError,
  } = useSelector((state) => state.student);
  const { authUser } = useSelector((state) => state.auth);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    dispatch(fetchAvailableSupervisors());
  }, [dispatch]);

  const departments = useMemo(
    () => [...new Set(supervisors.map((person) => person.department).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [supervisors],
  );
  const filteredSupervisors = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return supervisors.filter((person) => {
      const expertise = getExpertise(person);
      const matchesText = !needle || [person.name, person.department, person.email, ...expertise]
        .some((value) => String(value || "").toLowerCase().includes(needle));
      return matchesText && (department === "all" || person.department === department);
    }).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [supervisors, query, department]);
  const selectedSupervisor = supervisors.find((person) => person._id === selectedId);

  return (
    <main className="supervisor-directory">
      <div className="supervisor-directory__ambient" aria-hidden="true"><i /><i /><span /></div>
      <div className="supervisor-directory__inner">
        <header className="supervisor-directory__masthead">
          <span><BookOpen size={15} /> STUDENT FIELDNOTES <i /> FACULTY DIRECTORY</span>
          <small>PEOPLE / GUIDES</small>
        </header>

        <motionComponents.section
          className="supervisor-directory__intro"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="supervisor-directory__kicker"><Sparkles size={13} /> FIND YOUR NEXT CONVERSATION</span>
          <h1>Good work grows<br />with a <em>good guide.</em></h1>
          <p>Explore faculty interests and find someone whose experience connects with the questions you want to explore.</p>
          <div className="supervisor-directory__welcome"><span>{(authUser?.name || "S").trim().charAt(0).toUpperCase()}</span> A guide for your next chapter</div>
        </motionComponents.section>

        <section className="supervisor-directory__content" aria-label="Supervisor directory">
          <div className="supervisor-directory__toolbar">
            <label className="supervisor-search" htmlFor="supervisor-search">
              <Search size={17} />
              <input id="supervisor-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or expertise" />
              {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}
            </label>
            <label className="supervisor-filter" htmlFor="supervisor-department">
              <Building2 size={15} />
              <select id="supervisor-department" value={department} onChange={(event) => setDepartment(event.target.value)}>
                <option value="all">Every department</option>
                {departments.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <span className="supervisor-directory__count"><b>{filteredSupervisors.length}</b> {filteredSupervisors.length === 1 ? "faculty member" : "faculty members"}</span>
          </div>

          {isLoadingSupervisors && !supervisors.length ? (
            <div className="supervisor-state" role="status"><span className="supervisor-spinner" /> Opening the faculty directory…</div>
          ) : supervisorsError && !supervisors.length ? (
            <div className="supervisor-state supervisor-state--error" role="alert">
              <p>{supervisorsError}</p>
              <button type="button" onClick={() => dispatch(fetchAvailableSupervisors())}>Try again</button>
            </div>
          ) : !filteredSupervisors.length ? (
            <div className="supervisor-state supervisor-state--empty">
              <Search size={23} />
              <strong>{supervisors.length ? "No faculty match this search" : "No supervisors are listed yet"}</strong>
              <p>{supervisors.length ? "Try a different name, expertise, or department." : "The faculty directory is empty right now. Check back later."}</p>
              {supervisors.length > 0 && <button type="button" onClick={() => { setQuery(""); setDepartment("all"); }}>Clear filters</button>}
            </div>
          ) : (
            <div className="supervisor-cards">
              <AnimatePresence mode="popLayout">
                {filteredSupervisors.map((person, index) => {
                  const expertise = getExpertise(person);
                  const isSelected = person._id === selectedId;
                  return (
                    <MotionArticle
                      layout
                      key={person._id}
                      className={`supervisor-card${isSelected ? " is-selected" : ""}`}
                      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.25, delay: reducedMotion ? 0 : Math.min(index * 0.035, 0.2) }}
                    >
                      <button type="button" className="supervisor-card__select" aria-pressed={isSelected} onClick={() => setSelectedId(isSelected ? null : person._id)} aria-label={`${isSelected ? "Close" : "View"} ${person.name}'s profile`}>
                        <span className="supervisor-card__number">{String(index + 1).padStart(2, "0")}</span>
                        <span className="supervisor-card__avatar">{(person.name || "F").trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span>
                        <span className="supervisor-card__identity"><strong>{person.name || "Faculty member"}</strong><small>{person.department || "Department not listed"}</small></span>
                        <span className="supervisor-card__open" aria-hidden="true">{isSelected ? <Check size={16} /> : <ArrowUpRight size={16} />}</span>
                      </button>
                      <div className="supervisor-card__details">
                        <span className="supervisor-card__label"><GraduationCap size={14} /> AREAS OF INTEREST</span>
                        {expertise.length ? (
                          <div className="supervisor-card__tags">{(isSelected ? expertise : expertise.slice(0, 3)).map((area) => <span key={area}>{area}</span>)}{!isSelected && expertise.length > 3 && <span className="supervisor-card__more">+{expertise.length - 3}</span>}</div>
                        ) : <p className="supervisor-card__none">Areas of interest have not been added.</p>}
                        {isSelected && <div className="supervisor-card__contact"><span>Want to discuss a project idea?</span><a href={`mailto:${person.email}?subject=${encodeURIComponent("Project supervision inquiry")}`}><Mail size={15} /> Contact {person.name?.split(" ")[0] || "faculty"}</a></div>}
                      </div>
                      <span className="supervisor-card__index" aria-hidden="true">FIELDNOTE {String(index + 1).padStart(2, "0")}</span>
                    </MotionArticle>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>

        <aside className="supervisor-directory__note"><UsersRound size={16} /><p><strong>Looking for a supervisor?</strong> Browse faculty interests, then contact a potential guide to start a conversation about your project.</p></aside>
        <footer className="supervisor-directory__footer"><span>PROJECT HUB <i /> STUDENT FIELDNOTES</span><span>GOOD IDEAS FIND THEIR PEOPLE <ArrowUpRight size={13} /></span></footer>
      </div>
    </main>
  );
}

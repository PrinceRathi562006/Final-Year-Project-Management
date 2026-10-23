import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import { AnimatePresence, motion as Motion, MotionConfig } from "framer-motion";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Link2,
  LoaderCircle,
  Mail,
  Search,
  UserRoundCheck,
  UsersRound,
  X,
} from "lucide-react";
import { assignSupervisor, getAllUsers } from "../../store/slices/adminSlice";
import "./AssignSupervisor.css";

const idOf = (value) => (value && typeof value === "object" ? value._id : value) || "";
const displayName = (user) => user?.name?.trim() || "Unnamed user";
const initials = (name = "") => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";

const AssignSupervisor = () => {
  const dispatch = useDispatch();
  const { theme } = useOutletContext();
  const { users = [] } = useSelector((state) => state.admin || {});
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("name");
  const [drafts, setDrafts] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let mounted = true;
    dispatch(getAllUsers())
      .unwrap()
      .catch(() => { if (mounted) setLoadError(true); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [dispatch]);

  const students = useMemo(() => users.filter((user) => user.role?.toLowerCase() === "student"), [users]);
  const teachers = useMemo(() => users.filter((user) => user.role?.toLowerCase() === "teacher"), [users]);
  const departments = useMemo(() => [...new Set(students.map((student) => student.department).filter(Boolean))].sort(), [students]);
  const teacherLoad = useMemo(() => teachers.map((teacher) => ({
    ...teacher,
    assignedCount: students.filter((student) => idOf(student.supervisor) === teacher._id).length,
    capacity: Number(teacher.maxStudents) || 0,
  })), [teachers, students]);
  const loadById = useMemo(() => new Map(teacherLoad.map((teacher) => [teacher._id, teacher])), [teacherLoad]);
  const assignedCount = students.filter((student) => Boolean(idOf(student.supervisor))).length;
  const unassignedCount = students.length - assignedCount;
  const roomCount = teacherLoad.filter((teacher) => !teacher.capacity || teacher.assignedCount < teacher.capacity).length;
  const freeSeats = teacherLoad.reduce((sum, teacher) => sum + (teacher.capacity ? Math.max(0, teacher.capacity - teacher.assignedCount) : 0), 0);
  const assignmentRate = students.length ? Math.round((assignedCount / students.length) * 100) : 0;

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) => {
      const supervisorId = idOf(student.supervisor);
      const supervisor = typeof student.supervisor === "object"
        ? student.supervisor
        : teachers.find((teacher) => teacher._id === supervisorId);
      const matchesSearch = !query || [student.name, student.email, student.studentId, student.department, supervisor?.name, supervisor?.email]
        .some((value) => String(value || "").toLowerCase().includes(query));
      const matchesDepartment = department === "all" || student.department === department;
      const matchesAssignment = assignmentFilter === "all"
        || (assignmentFilter === "assigned" && Boolean(supervisorId))
        || (assignmentFilter === "unassigned" && !supervisorId);
      return matchesSearch && matchesDepartment && matchesAssignment;
    }).sort((a, b) => {
      if (sortOrder === "department") return String(a.department || "").localeCompare(String(b.department || ""));
      if (sortOrder === "supervisor") return String(a.supervisor?.name || "").localeCompare(String(b.supervisor?.name || ""));
      if (sortOrder === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      const aAssigned = Boolean(idOf(a.supervisor));
      const bAssigned = Boolean(idOf(b.supervisor));
      if (aAssigned !== bAssigned) return Number(aAssigned) - Number(bAssigned);
      return displayName(a).localeCompare(displayName(b));
    });
  }, [students, teachers, search, department, assignmentFilter, sortOrder]);

  const pageCount = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const pageStudents = filteredStudents.slice((page - 1) * pageSize, page * pageSize);
  const selected = filteredStudents.find((student) => student._id === selectedId) || null;
  const selectedSupervisorId = (student) => Object.hasOwn(drafts, student._id) ? drafts[student._id] : idOf(student.supervisor);
  const draftSupervisorId = selected ? selectedSupervisorId(selected) : "";
  const draftTeacher = loadById.get(draftSupervisorId);
  const currentSupervisorId = selected ? idOf(selected.supervisor) : "";
  const assignmentChanged = Boolean(selected && draftSupervisorId !== currentSupervisorId);
  const isFull = Boolean(draftTeacher?.capacity && draftTeacher.assignedCount >= draftTeacher.capacity && draftSupervisorId !== currentSupervisorId);
  const filtersActive = Boolean(search.trim()) || department !== "all" || assignmentFilter !== "all";

  useEffect(() => { setPage(1); }, [search, department, assignmentFilter, pageSize]);

  const clearFilters = () => {
    setSearch("");
    setDepartment("all");
    setAssignmentFilter("all");
  };

  const saveAssignment = async () => {
    if (!selected || !assignmentChanged || isFull) return;
    setSavingId(selected._id);
    try {
      await dispatch(assignSupervisor({ studentId: selected._id, supervisorId: draftSupervisorId || null })).unwrap();
      setDrafts((current) => {
        const next = { ...current };
        delete next[selected._id];
        return next;
      });
    } catch {
      // Keep the selected student and draft visible so the admin can retry.
    } finally {
      setSavingId(null);
    }
  };

  return (
    <main className="mt-page as-page" data-theme={theme}>
      <div className="mt-shell as-shell">
        <header className="mt-head as-head">
          <div className="mt-head__text"><h1>Assign supervisors</h1><p className="mt-lede">Match every student with a faculty mentor and keep supervision workloads balanced.</p></div>
          <div className="as-head__badge"><span><Link2 /></span><div><b>{unassignedCount}</b><small>students awaiting a match</small></div></div>
          <div className="mt-hall" aria-label={`${students.length ? assignmentRate : 0}% of students have a supervisor`}>
            <div className="mt-hall__chairs" aria-hidden="true">{Array.from({ length: students.length }, (_, index) => <i key={index} className={index < assignedCount ? "is-taken" : ""} style={{ "--n": index }} />)}</div>
            <dl className="mt-hall__stats">
              <div><dt>Students</dt><dd>{loading && !users.length ? "—" : students.length}</dd></div>
              <div><dt>Assigned</dt><dd>{loading && !users.length ? "—" : assignedCount}</dd></div>
              <div><dt>Awaiting match</dt><dd>{loading && !users.length ? "—" : unassignedCount}</dd></div>
              <div><dt>Mentors with room</dt><dd>{loading && !users.length ? "—" : roomCount}</dd></div>
              <div className="mt-hall__pct"><dt>Assignment rate</dt><dd>{students.length ? `${assignmentRate}%` : "—"}</dd></div>
            </dl>
          </div>
        </header>

        {loadError && !users.length && <section className="mt-error" role="alert"><AlertTriangle /><div><strong>Directory could not be loaded</strong><span>Check your connection, then try again.</span></div><button type="button" onClick={() => { setLoading(true); setLoadError(false); dispatch(getAllUsers()).unwrap().catch(() => setLoadError(true)).finally(() => setLoading(false)); }}>Try again</button></section>}

        {departments.length > 0 && <section className="mt-ribbon" aria-label="Filter by department">{departments.map((name, index) => { const count = students.filter((student) => student.department === name).length; return <button type="button" key={name} className={`mt-seg ${department === name ? "is-active" : ""} ${department !== "all" && department !== name ? "is-dim" : ""}`} style={{ "--n": count, "--dc": `hsl(${(index * 67 + 148) % 360} 65% 52%)` }} aria-pressed={department === name} onClick={() => setDepartment((current) => current === name ? "all" : name)} title={`${name}: ${count} students`}><span className="mt-seg__name">{name}</span><span className="mt-seg__meta"><b>{count}</b> students</span></button>; })}</section>}

        <section className="mt-controls as-controls">
          <label className="mt-search" htmlFor="assignment-search"><Search /><input id="assignment-search" type="search" placeholder="Search student, department or supervisor" value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>Ctrl K</kbd></label>
          <p className="mt-sentence">Show students <label className="mt-pick"><span className="sr-only">Assignment state</span><select value={assignmentFilter} onChange={(event) => setAssignmentFilter(event.target.value)}><option value="all">with any status</option><option value="unassigned">awaiting a supervisor</option><option value="assigned">already assigned</option></select></label>, sorted by <label className="mt-pick"><span className="sr-only">Sort order</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option value="name">name</option><option value="department">department</option><option value="supervisor">supervisor</option><option value="newest">newest first</option></select></label>.{filtersActive && <button type="button" className="mt-reset" onClick={clearFilters}>Reset</button>}</p>
        </section>

        <div className="mt-body as-body">
          <section className="mt-main as-main" aria-label="Student directory">
            <div className="mt-count">Showing <strong>{filteredStudents.length}</strong> {filteredStudents.length === 1 ? "student" : "students"}</div>
            {loading && !users.length ? <ul className="mt-skeleton" aria-label="Loading students">{Array.from({ length: 6 }, (_, index) => <li key={index} />)}</ul>
              : !teachers.length ? <div className="mt-empty"><h2>No mentors available yet</h2><p>Add a teacher profile before making supervisor assignments.</p></div>
                : !filteredStudents.length ? <div className="mt-empty"><h2>{students.length ? "No students fit this view" : "No students added yet"}</h2><p>{students.length ? "Loosen the filters or try another search." : "Add student profiles to begin making supervisor assignments."}</p>{filtersActive && <button type="button" onClick={clearFilters}>Reset filters</button>}</div>
                  : <>
                    <div className="as-cols" aria-hidden="true"><span>Student</span><span>Department</span><span>Current supervisor</span><span /></div>
                    <ul className="as-roster">{pageStudents.map((student) => {
                      const supervisorId = idOf(student.supervisor);
                      const supervisor = loadById.get(supervisorId) || (typeof student.supervisor === "object" ? student.supervisor : null);
                      return <li className={`as-row ${selectedId === student._id ? "is-selected" : ""} ${!supervisorId ? "is-unassigned" : ""}`} key={student._id}>
                        <button type="button" className="as-row__main" onClick={() => setSelectedId(student._id)} aria-pressed={selectedId === student._id}>
                          <span className="as-identity"><span className="as-avatar">{initials(student.name)}</span><span className="as-identity__text"><strong>{displayName(student)}</strong><small>{student.email || "No email provided"}{student.studentId ? ` · ${student.studentId}` : ""}</small></span></span>
                          <span className="as-department">{student.department || "Department not set"}</span>
                          <span className="as-supervisor">{supervisor ? <><span className="as-mini-avatar">{initials(supervisor.name)}</span><span><strong>{supervisor.name}</strong><small>{supervisor.department || "Faculty mentor"}</small></span></> : <span className="as-unassigned"><i /> Awaiting match</span>}</span>
                        </button>
                        <span className="as-row__action">{selectedId === student._id ? <span className="as-selected-mark"><Check /> Selected</span> : <button type="button" onClick={() => setSelectedId(student._id)}>Review <ChevronRight /></button>}</span>
                      </li>;
                    })}</ul>
                    <footer className="mt-pager"><span>Showing <strong>{Math.min((page - 1) * pageSize + 1, filteredStudents.length)}–{Math.min(page * pageSize, filteredStudents.length)}</strong> of {filteredStudents.length}</span><div><label>Rows <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label><button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft /></button><span>Page <strong>{page}</strong> of {pageCount}</span><button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}><ChevronRight /></button></div></footer>
                  </>}
          </section>

          {selected && <div className="as-scrim" role="presentation" onClick={() => setSelectedId(null)} />}
          <aside className={`mt-inspector as-inspector ${selected ? "is-open" : ""}`} aria-live="polite">
            <MotionConfig reducedMotion="user"><AnimatePresence initial={false} mode="wait">{selected ? <Motion.div key={selected._id} className="profile-preview-motion" initial={{ opacity: 0, scale: 0.9, y: 14, filter: "blur(8px)" }} animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, scale: 0.92, y: 8, filter: "blur(6px)" }} transition={{ type: "spring", stiffness: 360, damping: 30 }}><div className="mt-detail as-detail">
              <div className="mt-detail__top"><span className="mt-badge mt-badge--lg">{initials(selected.name)}</span><div className="mt-detail__id"><h2>{displayName(selected)}</h2><a href={`mailto:${selected.email}`}><Mail /> {selected.email || "No email provided"}</a></div><button type="button" className="mt-close" onClick={() => setSelectedId(null)} aria-label="Close details"><X /></button></div>
              <div className={`as-assignment-state ${currentSupervisorId ? "is-assigned" : ""}`}><span>{currentSupervisorId ? <UserRoundCheck /> : <GraduationCap />}</span><div><strong>{currentSupervisorId ? "Supervisor assigned" : "Needs a supervisor"}</strong><small>{currentSupervisorId ? "Remove this match before assigning a different mentor." : "Choose a mentor with room in their caseload."}</small></div></div>
              <label className="as-field">Assign supervisor<span className="as-field__select"><select value={draftSupervisorId} onChange={(event) => setDrafts((current) => ({ ...current, [selected._id]: event.target.value }))}><option value="">Leave unassigned</option>{teacherLoad.map((teacher) => { const full = teacher.capacity > 0 && teacher.assignedCount >= teacher.capacity && teacher._id !== currentSupervisorId; const changingSupervisor = Boolean(currentSupervisorId && teacher._id !== currentSupervisorId); return <option key={teacher._id} value={teacher._id} disabled={full || changingSupervisor}>{teacher.name} · {teacher.assignedCount}{teacher.capacity ? ` / ${teacher.capacity}` : " assigned · no limit"}{full ? " · full" : changingSupervisor ? " · remove current match first" : ""}</option>; })}</select><ChevronRight /></span></label>
              {isFull && <p className="as-capacity-warning">This mentor has reached their student capacity.</p>}
              {draftTeacher && <div className="as-load-card"><div><span>Mentor workload</span><strong>{draftTeacher.assignedCount}{draftTeacher.capacity ? ` / ${draftTeacher.capacity}` : " assigned"}</strong></div><div className="as-load-track"><i style={{ width: `${draftTeacher.capacity ? Math.min(100, draftTeacher.assignedCount / draftTeacher.capacity * 100) : 12}%` }} /></div><small>{draftTeacher.capacity ? `${Math.max(0, draftTeacher.capacity - draftTeacher.assignedCount + (draftSupervisorId === currentSupervisorId ? 1 : 0))} seats available after this assignment` : "No student limit set"}</small></div>}
              <dl className="mt-facts"><div><dt>Department</dt><dd>{selected.department || "Not provided"}</dd></div><div><dt>Student ID</dt><dd>{selected.studentId || "Not provided"}</dd></div><div><dt>Joined</dt><dd>{selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "Not available"}</dd></div></dl>
              <div className="mt-detail__actions"><button type="button" className="mt-btn mt-btn--ghost" disabled={!currentSupervisorId || savingId === selected._id} onClick={() => { setDrafts((current) => ({ ...current, [selected._id]: "" })); }}><X /> Remove match</button><button type="button" className="mt-btn mt-btn--solid as-save" disabled={!assignmentChanged || isFull || savingId === selected._id} onClick={saveAssignment}>{savingId === selected._id ? <LoaderCircle className="as-spin" /> : <><Check /> Save assignment</>}</button></div>
            </div></Motion.div> : <Motion.div key="assignment-profile-idle" className="profile-preview-motion" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ type: "spring", stiffness: 360, damping: 30 }}><div className="mt-idle"><h2>Assignment details</h2><p>Select a student to review their record and choose a supervisor.</p><h3>Mentor availability</h3><ul>{teacherLoad.slice(0, 5).map((teacher) => <li key={teacher._id}><span>{teacher.name}</span><b>{teacher.capacity ? `${Math.max(0, teacher.capacity - teacher.assignedCount)} free` : "No limit"}</b></li>)}</ul><div className="as-room-summary"><GraduationCap /><span>{freeSeats} tracked seats free across {teachers.length} mentors</span></div></div></Motion.div>}</AnimatePresence></MotionConfig>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default AssignSupervisor;

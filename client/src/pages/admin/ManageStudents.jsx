import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import { AnimatePresence, motion as Motion, MotionConfig } from "framer-motion";
import AddStudent from "../../components/modal/AddStudent";
import {
  createStudent,
  deleteStudent,
  getAllUsers,
  updateStudent,
} from "../../store/slices/adminSlice";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Minus,
  Maximize2,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toggleStudentModal } from "../../store/slices/popupSlice";
import "./ManageStudents.css";

const statusLabel = (status, hasProject = false) => {
  if (!status) return hasProject ? "Status unavailable" : "No project";
  return String(status).replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const supervisorName = (supervisor, userList = []) => {
  if (!supervisor) return null;
  if (typeof supervisor === "object") return supervisor.name || null;
  const referencedTeacher = userList.find((user) => user._id === supervisor && user.role?.toLowerCase() === "teacher");
  if (referencedTeacher) return referencedTeacher.name;
  return /^[a-f\d]{24}$/i.test(supervisor) ? null : supervisor;
};

const DEPARTMENT_OPTIONS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Artificial Intelligence & Machine Learning",
  "Data Science",
  "Electronics & Communication Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Bachelor of Business Administration",
  "Bachelor of Commerce",
  "Bachelor of Computer Applications",
  "Master of Computer Applications",
  "Master of Business Administration",
  "Mathematics",
  "Physics",
  "Chemistry",
  "English",
  "Management Studies",
  "Law",
  "Pharmacy",
  "Hotel Management",
  "Architecture",
  "Design",
  "Other",
];

const ManageStudents = () => {
  const { users, projects } = useSelector((state) => state.admin);
  const { isCreateStudentModalOpen } = useSelector((state) => state.popup);
  const { theme } = useOutletContext();
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSupervisor, setFilterSupervisor] = useState("all");
  const [sortOrder, setSortOrder] = useState("name");
  const [view, setView] = useState("list");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [previewMinimized, setPreviewMinimized] = useState(false);
  const [previewMaximized, setPreviewMaximized] = useState(false);
  const [previewOrigin, setPreviewOrigin] = useState(null);
  const previewRef = useRef(null);
  const dockRef = useRef(null);
  const restoreMaximizedRef = useRef(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", department: "" });

  useEffect(() => {
    let mounted = true;
    dispatch(getAllUsers())
      .unwrap()
      .catch(() => { if (mounted) setLoadError(true); })
      .finally(() => { if (mounted) setIsLoadingStudents(false); });
    return () => { mounted = false; };
  }, [dispatch]);

  const reloadStudents = () => {
    setIsLoadingStudents(true);
    setLoadError(false);
    dispatch(getAllUsers())
      .unwrap()
      .catch(() => setLoadError(true))
      .finally(() => setIsLoadingStudents(false));
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowModal(false);
        setShowDeleteModal(false);
        if (previewMinimized) setPreviewMinimized(false);
        else setSelectedStudent(null);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("student-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const students = useMemo(() => {
    const studentUsers = (users || []).filter((user) => user.role?.toLowerCase() === "student");
    return studentUsers.map((student) => {
      const studentProject = (projects || []).find((project) =>
        project.student?._id === student._id || project.student === student._id || student.project?._id === project._id || student.project === project._id,
      );
      return {
        ...student,
        projectTitle: studentProject?.title || student.project?.title || null,
        supervisor: student.supervisor || null,
        projectStatus: studentProject?.status || student.project?.status || null,
        hasProject: Boolean(studentProject || student.project),
      };
    });
  }, [users, projects]);

  const departments = useMemo(() => [...new Set(students.map((student) => student.department).filter(Boolean))].sort(), [students]);
  const editDepartments = useMemo(() => [...new Set([...DEPARTMENT_OPTIONS, ...departments])], [departments]);
  const years = useMemo(() => [...new Set(students.map((student) => student.createdAt && new Date(student.createdAt).getFullYear()).filter(Boolean))].sort((a, b) => b - a), [students]);
  const supervisors = useMemo(() => [...new Set(students.map((student) => supervisorName(student.supervisor, users)).filter(Boolean))].sort(), [students, users]);
  const statuses = useMemo(() => [...new Set(students.map((student) => student.projectStatus).filter(Boolean))].sort(), [students]);

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return students.filter((student) => {
      const matchesSearch = !query || [student.name, student.email, student.studentId, student.department, student.projectTitle, supervisorName(student.supervisor, users)].some((value) => String(value || "").toLowerCase().includes(query));
      const matchesDepartment = filterDepartment === "all" || student.department === filterDepartment;
      const matchesYear = filterYear === "all" || String(new Date(student.createdAt).getFullYear()) === filterYear;
      const matchesStatus = filterStatus === "all" || student.projectStatus === filterStatus;
      const matchesSupervisor = filterSupervisor === "all" || supervisorName(student.supervisor, users) === filterSupervisor;
      return matchesSearch && matchesDepartment && matchesYear && matchesStatus && matchesSupervisor;
    }).sort((a, b) => sortOrder === "newest"
      ? new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      : sortOrder === "department"
        ? String(a.department || "").localeCompare(String(b.department || ""))
        : String(a.name || "").localeCompare(String(b.name || "")));
  }, [students, users, searchTerm, filterDepartment, filterYear, filterStatus, filterSupervisor, sortOrder]);

  const completedCount = students.filter((student) => String(student.projectStatus || "").toLowerCase() === "completed").length;
  const assignedCount = students.filter((student) => Boolean(student.supervisor)).length;
  const unassignedCount = students.length - assignedCount;
  const completionRate = students.length ? Math.round((completedCount / students.length) * 100) : 0;
  const linkedProjectCount = students.filter((student) => student.hasProject).length;
  const filteredCount = filteredStudents.length;
  const pageCount = Math.max(1, Math.ceil(filteredCount / pageSize));
  const pageStudents = filteredStudents.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [searchTerm, filterDepartment, filterYear, filterStatus, filterSupervisor, pageSize]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target?.tagName) || !["ArrowDown", "ArrowUp"].includes(event.key) || !pageStudents.length) return;
      event.preventDefault();
      const current = pageStudents.findIndex((student) => student._id === selectedStudent?._id);
      const nextIndex = Math.min(pageStudents.length - 1, Math.max(0, current + (event.key === "ArrowDown" ? 1 : -1)));
      setSelectedStudent(pageStudents[nextIndex]);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pageStudents, selectedStudent]);

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData({ name: "", email: "", department: "" });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editingStudent) dispatch(updateStudent({ id: editingStudent._id, data: formData }));
    else dispatch(createStudent(formData));
    handleCloseModal();
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({ name: student.name || "", email: student.email || "", department: student.department || "" });
    setShowModal(true);
    setSelectedStudent(null);
  };

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      await dispatch(deleteStudent(studentToDelete._id)).unwrap();
      setShowDeleteModal(false);
      setStudentToDelete(null);
      setSelectedStudent(null);
    } catch {
      setShowDeleteModal(true);
    }
  };

  const startAddStudent = () => dispatch(toggleStudentModal());

  const renderProjectStatus = (student) => {
    const normalized = String(student.projectStatus || "").toLowerCase();
    const tone = normalized === "completed" || normalized === "approved" ? "success" : normalized === "rejected" ? "danger" : normalized ? "progress" : "neutral";
    const label = student.projectStatus ? statusLabel(student.projectStatus) : student.hasProject ? "Status unavailable" : "No project";
    return <span className={`ms-status ms-status--${tone}`}><span />{label}</span>;
  };

  return (
    <main className="mt-page" data-theme={theme}>
      <div className="mt-shell ms-shell">
        <header className="mt-head"><div className="mt-head__text"><h1>Student directory</h1><p className="mt-lede">{isLoadingStudents && !users?.length ? "Loading student records…" : `${students.length} ${students.length === 1 ? "student" : "students"} across ${departments.length} ${departments.length === 1 ? "department" : "departments"}; ${assignedCount} with supervisors and ${linkedProjectCount} with projects.`}</p></div><button type="button" className="mt-add" onClick={startAddStudent}><Plus /> Add student</button>
          <div className="mt-hall" aria-label={`${statuses.length ? `${completionRate}%` : "Project status unavailable"} project completion`}><div className="mt-hall__chairs" aria-hidden="true">{Array.from({ length: students.length }, (_, i) => <i key={i} className={i < completedCount ? "is-taken" : ""} style={{ "--n": i }} />)}</div><dl className="mt-hall__stats"><div><dt>Students</dt><dd>{isLoadingStudents && !users?.length ? "—" : students.length}</dd></div><div><dt>Completed projects</dt><dd>{statuses.length ? completedCount : "—"}</dd></div><div><dt>With supervisor</dt><dd>{assignedCount}</dd></div><div><dt>Awaiting supervisor</dt><dd>{unassignedCount}</dd></div><div className="mt-hall__pct"><dt>Completion</dt><dd>{statuses.length ? `${completionRate}%` : "—"}</dd></div></dl></div>
        </header>
        {loadError && !students.length && <section className="mt-error" role="alert"><AlertTriangle /><div><strong>Student records could not be loaded</strong><span>Check your connection, then try again.</span></div><button type="button" onClick={reloadStudents}>Try again</button></section>}
        {!!departments.length && <section className="mt-ribbon" aria-label="Filter by department">{departments.map((department, index) => { const count = students.filter((student) => student.department === department).length; return <button key={department} type="button" className={`mt-seg ${filterDepartment === department ? "is-active" : ""} ${filterDepartment !== "all" && filterDepartment !== department ? "is-dim" : ""}`} style={{ "--n": count, "--dc": `hsl(${(index * 67 + 218) % 360} 68% 56%)` }} aria-pressed={filterDepartment === department} onClick={() => setFilterDepartment((current) => current === department ? "all" : department)} title={`${department}: ${count} students`}><span className="mt-seg__name">{department}</span><span className="mt-seg__meta"><b>{count}</b> students</span></button>; })}</section>}
        <section className="mt-controls"><label className="mt-search" htmlFor="student-search"><Search /><input id="student-search" type="search" placeholder="Search name, email, project or supervisor" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /><kbd>Ctrl K</kbd></label>
          <div className="mt-views" role="group" aria-label="Directory view"><button type="button" aria-pressed={view === "list"} className={view === "list" ? "is-active" : ""} onClick={() => setView("list")}><List /> Roster</button><button type="button" aria-pressed={view === "grid"} className={view === "grid" ? "is-active" : ""} onClick={() => setView("grid")}><LayoutGrid /> Cards</button></div>
          <p className="mt-sentence">Show students in <label className="mt-pick"><span className="sr-only">Department</span><select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}><option value="all">every department</option>{departments.map((d) => <option key={d} value={d}>{d}</option>)}</select></label> who joined <label className="mt-pick"><span className="sr-only">Year</span><select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}><option value="all">any year</option>{years.map((y) => <option key={y} value={y}>{y}</option>)}</select></label> with status <label className="mt-pick"><span className="sr-only">Project status</span><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}><option value="all">any project status</option>{statuses.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}</select></label> and supervisor <label className="mt-pick"><span className="sr-only">Supervisor</span><select value={filterSupervisor} onChange={(e) => setFilterSupervisor(e.target.value)}><option value="all">any supervisor</option>{supervisors.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>, sorted by <label className="mt-pick"><span className="sr-only">Sort</span><select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}><option value="name">name</option><option value="newest">newest first</option><option value="department">department</option></select></label>.
            {(filterDepartment !== "all" || filterYear !== "all" || filterStatus !== "all" || filterSupervisor !== "all" || searchTerm.trim()) && <button type="button" className="mt-reset" onClick={() => { setSearchTerm(""); setFilterDepartment("all"); setFilterYear("all"); setFilterStatus("all"); setFilterSupervisor("all"); }}>Reset</button>}
          </p>
        </section>
        <div className="mt-body ms-body"><section className="mt-main" aria-label="Student directory"><div className="mt-count">Showing <strong>{filteredCount}</strong> students</div>
          {isLoadingStudents && !users?.length ? <ul className="mt-skeleton" aria-label="Loading students">{Array.from({ length: 6 }, (_, i) => <li key={i} />)}</ul> : !pageStudents.length ? <div className="mt-empty"><h2>{students.length ? "No students fit this view" : "No students added yet"}</h2><p>{students.length ? "Loosen the filters or try another search." : "Add your first student to start building the directory."}</p>{students.length ? <button type="button" onClick={() => { setSearchTerm(""); setFilterDepartment("all"); setFilterYear("all"); setFilterStatus("all"); setFilterSupervisor("all"); }}>Reset filters</button> : <button type="button" onClick={startAddStudent}><Plus /> Add student</button>}</div> : view === "list" ? <><div className="ms-cols" aria-hidden="true"><span>Student</span><span>Department</span><span>Supervisor</span><span>Project / status</span><span /></div><ul className="ms-roster">{pageStudents.map((s) => <li key={s._id} className={`ms-row ${selectedStudent?._id === s._id ? "is-selected" : ""}`}><button type="button" className="ms-row__main" aria-pressed={selectedStudent?._id === s._id} onClick={() => setSelectedStudent(s)}><span className="ms-identity"><span className="ms-avatar">{s.name?.charAt(0).toUpperCase() || "S"}</span><span className="ms-identity__text"><strong>{s.name}</strong><small>{s.email}{s.studentId ? ` · ${s.studentId}` : ""}</small></span></span><span className="ms-dept">{s.department || "Department not set"}{s.createdAt && <small>Joined {new Date(s.createdAt).getFullYear()}</small>}</span><span className="ms-supervisor">{supervisorName(s.supervisor, users) || (s.supervisor ? "Supervisor assigned" : "Not assigned")}</span><span className="ms-project"><strong>{s.projectTitle || (s.hasProject ? "Project linked" : "No project linked")}</strong>{renderProjectStatus(s)}</span></button><div className="ms-row__actions"><button type="button" onClick={() => handleEdit(s)} aria-label={`Edit ${s.name}`}><Pencil /></button><button type="button" className="is-danger" onClick={() => handleDelete(s)} aria-label={`Delete ${s.name}`}><Trash2 /></button></div></li>)}</ul></> : <div className="ms-card-grid">{pageStudents.map((s) => <article className={`ms-card ${selectedStudent?._id === s._id ? "is-selected" : ""}`} key={s._id}><button type="button" className="ms-card__identity" aria-pressed={selectedStudent?._id === s._id} onClick={() => setSelectedStudent(s)}><span className="ms-avatar">{s.name?.charAt(0).toUpperCase() || "S"}</span><span><strong>{s.name}</strong><small>{s.email}</small></span></button><dl><div><dt>Department</dt><dd>{s.department || "Not set"}</dd></div><div><dt>Supervisor</dt><dd>{supervisorName(s.supervisor, users) || (s.supervisor ? "Supervisor assigned" : "Not assigned")}</dd></div><div><dt>Project</dt><dd>{s.projectTitle || (s.hasProject ? "Project linked" : "Not linked")}</dd></div></dl><div className="ms-card__footer">{renderProjectStatus(s)}<span><button type="button" onClick={() => handleEdit(s)} aria-label={`Edit ${s.name}`}><Pencil /></button><button type="button" className="is-danger" onClick={() => handleDelete(s)} aria-label={`Delete ${s.name}`}><Trash2 /></button></span></div></article>)}</div>}
          {filteredCount > 0 && <footer className="mt-pager"><span>Showing <strong>{Math.min((page - 1) * pageSize + 1, filteredCount)}–{Math.min(page * pageSize, filteredCount)}</strong> of {filteredCount}</span><div><label>Rows <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label><button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((n) => n - 1)}><ChevronLeft /></button><span>Page <strong>{page}</strong> of {pageCount}</span><button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage((n) => n + 1)}><ChevronRight /></button></div></footer>}
        </section>
        {selectedStudent && !previewMinimized && <div className="ms-scrim" role="presentation" onClick={closePreview} />}
        <AnimatePresence>{selectedStudent && previewMinimized && <Motion.button ref={dockRef} type="button" className="ms-preview-dock" aria-label={`Restore ${selectedStudent.name} profile`} title={`Restore ${selectedStudent.name} profile`} onClick={restorePreview} initial={{ opacity: 0, y: 28, scale: 0.7 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.7 }} transition={{ type: "spring", stiffness: 420, damping: 28 }}><span>{selectedStudent.name?.charAt(0).toUpperCase() || "S"}</span><small>{selectedStudent.name?.split(" ")[0] || "Profile"}</small></Motion.button>}</AnimatePresence>
        <AnimatePresence>{selectedStudent && !previewMinimized && <Motion.aside ref={previewRef} layout className={`mt-inspector ms-inspector ms-window ${previewMaximized ? "is-maximized" : ""}`} aria-label="Student details" initial={previewOrigin ? { opacity: 0.15, scale: 0.28, x: previewOrigin.x, y: previewOrigin.y, rotateX: 12 } : { opacity: 0, scale: 0.94, x: 38, y: 8 }} animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotateX: 0 }} exit={previewOrigin ? { opacity: 0, scale: 0.22, x: previewOrigin.x, y: previewOrigin.y, rotateX: 16, borderRadius: 28, filter: "blur(3px)" } : { opacity: 0, scale: 0.92, x: 26, y: 10 }} transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.82 }} onAnimationComplete={() => setPreviewOrigin(null)}><MotionConfig reducedMotion="user"><AnimatePresence initial={false} mode="wait">{selectedStudent ? <Motion.div key={selectedStudent._id} className="profile-preview-motion" initial={{ opacity: 0, scale: 0.9, y: 14, filter: "blur(8px)" }} animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, scale: 0.92, y: 8, filter: "blur(6px)" }} transition={{ type: "spring", stiffness: 360, damping: 30 }}><div className="mt-detail"><div className="ms-window__titlebar"><div className="ms-window__traffic" role="group" aria-label="Profile window controls"><button type="button" className="is-close" aria-label="Close profile preview" title="Close preview (Esc)" onClick={closePreview}><X /></button><button type="button" className="is-minimize" aria-label="Minimize profile preview" title="Minimize to dock" onClick={minimizePreview}><Minus /></button><button type="button" className="is-maximize" aria-label={previewMaximized ? "Restore profile window" : "Maximize profile window"} title={previewMaximized ? "Restore window" : "Maximize window"} aria-pressed={previewMaximized} onClick={() => setPreviewMaximized((current) => !current)}><Maximize2 /></button></div><span>STUDENT PROFILE · FIELDNOTES</span></div><div className="mt-detail__top"><span className="mt-badge mt-badge--lg">{selectedStudent.name?.charAt(0).toUpperCase() || "S"}</span><div className="mt-detail__id"><h2>{selectedStudent.name}</h2><a href={`mailto:${selectedStudent.email}`}><Mail />{selectedStudent.email}</a></div><button type="button" className="mt-close" onClick={closePreview} aria-label="Close details"><X /></button></div>{selectedStudent.studentId && <span className="ms-id">Student ID · {selectedStudent.studentId}</span>}{renderProjectStatus(selectedStudent)}<dl className="mt-facts"><div><dt>Department</dt><dd>{selectedStudent.department || "Not provided"}</dd></div><div><dt>Joined</dt><dd>{selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : "Not available"}</dd></div><div><dt>Supervisor</dt><dd>{supervisorName(selectedStudent.supervisor, users) || (selectedStudent.supervisor ? "Supervisor assigned" : "Not assigned")}</dd></div><div><dt>Project</dt><dd>{selectedStudent.projectTitle || (selectedStudent.hasProject ? "Title unavailable" : "No project linked")}</dd></div><div><dt>Project status</dt><dd>{statusLabel(selectedStudent.projectStatus, selectedStudent.hasProject)}</dd></div></dl><div className="mt-detail__actions"><button type="button" className="mt-btn mt-btn--ghost" onClick={() => handleDelete(selectedStudent)}><Trash2 /> Delete</button><button type="button" className="mt-btn mt-btn--solid" onClick={() => handleEdit(selectedStudent)}><Pencil /> Edit profile</button></div></div></Motion.div> : <Motion.div key="student-profile-idle" className="profile-preview-motion" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ type: "spring", stiffness: 360, damping: 30 }}><div className="mt-idle"><h2>Student profile</h2><p>Select a student to review academic details, projects and supervisor assignment.</p><h3>Directory snapshot</h3><ul><li><span>Project records</span><b>{linkedProjectCount}</b></li><li><span>Supervisors</span><b>{supervisors.length}</b></li><li><span>Departments</span><b>{departments.length}</b></li><li><span>Completion</span><b>{statuses.length ? `${completionRate}%` : "—"}</b></li></ul></div></Motion.div>}</AnimatePresence></MotionConfig></Motion.aside>}</AnimatePresence><div ref={dockRef} className="ms-dock-anchor" aria-hidden="true" /></div>
        {showModal && <div className="app-modal-overlay students-modal-overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && handleCloseModal()}><section className="app-modal students-edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-student-title"><button type="button" className="students-modal__close" onClick={handleCloseModal} aria-label="Close"><X /></button><span className="students-modal__eyebrow">STUDENT PROFILE</span><h3 id="edit-student-title">Edit student</h3><p className="students-modal__description">Update directory information for {editingStudent?.name || "this student"}.</p><form onSubmit={handleSubmit} className="students-form"><label>Full name<input type="text" required autoFocus value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></label><label>Email address<input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></label><label>Department<select required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}><option value="" disabled>Select department</option>{editDepartments.map((d) => <option key={d} value={d}>{d}</option>)}</select></label><div className="students-modal__actions"><button type="button" className="students-button students-button--quiet" onClick={handleCloseModal}>Cancel</button><button type="submit" className="students-button students-button--primary"><Check size={16} /> Save changes</button></div></form></section></div>}
        {showDeleteModal && studentToDelete && <div className="app-modal-overlay students-modal-overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}><section className="app-modal students-delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-student-title"><span className="students-modal__eyebrow">REMOVE FROM DIRECTORY</span><h3 id="delete-student-title">Delete student?</h3><p><strong>{studentToDelete.name}</strong> and their directory record will be removed. This action cannot be undone.</p><div className="students-modal__actions"><button type="button" className="students-button students-button--quiet" onClick={() => setShowDeleteModal(false)}>Keep student</button><button type="button" className="students-button students-button--danger" onClick={confirmDelete}><Trash2 size={16} /> Delete student</button></div></section></div>}
        {isCreateStudentModalOpen && <AddStudent />}
      </div>
    </main>
  );
};

export default ManageStudents;

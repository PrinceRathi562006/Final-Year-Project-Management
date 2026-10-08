import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPortal } from "react-dom";
import { useOutletContext } from "react-router-dom";
import universityImage from "../../assets/university.png";
import AddStudent from "../../components/modal/AddStudent";
import {
  createStudent,
  deleteStudent,
  getAllUsers,
  updateStudent,
} from "../../store/slices/adminSlice";
import {
  AlertTriangle,
  ArrowDownUp,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  GraduationCap,
  LayoutGrid,
  List,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { toggleStudentModal } from "../../store/slices/popupSlice";
import "./ManageStudents.css";

const statusLabel = (status) => {
  if (!status) return "No project";
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
        setSelectedStudent(null);
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
        supervisor: studentProject?.supervisor || student.supervisor || null,
        projectStatus: studentProject?.status || null,
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
  const departmentData = departments.map((department) => ({ department, count: students.filter((student) => student.department === department).length })).sort((a, b) => b.count - a.count).slice(0, 6);
  const maxDepartmentCount = Math.max(1, ...departmentData.map((item) => item.count));
  const projectStatusData = statuses.map((status) => ({ status, count: students.filter((student) => student.projectStatus === status).length }));
  const assignedProjectCount = students.filter((student) => student.projectStatus).length;
  const statusPalette = ["#23bd8e", "#5f7dec", "#efa93f", "#8e67df", "#e87979"];
  let statusCursor = 0;
  const statusGradient = projectStatusData.length
    ? `conic-gradient(${projectStatusData.map(({ count }, index) => {
      const start = statusCursor;
      statusCursor += count / assignedProjectCount * 100;
      return `${statusPalette[index % statusPalette.length]} ${start}% ${statusCursor}%`;
    }).join(", ")})`
    : "#edf0f7";
  const supervisorData = supervisors.map((supervisor) => ({ supervisor, count: students.filter((student) => supervisorName(student.supervisor, users) === supervisor).length })).sort((a, b) => b.count - a.count).slice(0, 4);
  const filteredCount = filteredStudents.length;
  const pageCount = Math.max(1, Math.ceil(filteredCount / pageSize));
  const pageStudents = filteredStudents.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [searchTerm, filterDepartment, filterYear, filterStatus, filterSupervisor, pageSize]);

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

  const confirmDelete = () => {
    if (!studentToDelete) return;
    dispatch(deleteStudent(studentToDelete._id));
    setShowDeleteModal(false);
    setStudentToDelete(null);
    setSelectedStudent(null);
  };

  const startAddStudent = () => dispatch(toggleStudentModal());

  const renderProjectStatus = (student) => {
    const normalized = String(student.projectStatus || "").toLowerCase();
    const tone = normalized === "completed" || normalized === "approved" ? "success" : normalized === "rejected" ? "danger" : normalized ? "progress" : "neutral";
    const label = student.projectStatus ? statusLabel(student.projectStatus) : student.hasProject ? "Status unavailable" : "No project";
    return <span className={`ms-status ms-status--${tone}`}><span />{label}</span>;
  };

  return (
    <main className="manage-students-page" data-theme={theme}>
      <div className="manage-students-content">
        <header className="students-hero" style={{ "--campus-image": `url("${universityImage}")` }}>
          <div className="students-hero__mesh" aria-hidden="true" />
          <div className="students-hero__content">
            <div className="students-hero__copy">
              <div className="students-hero__eyebrow"><span className="students-hero__eyebrow-icon"><GraduationCap /></span> Academic directory <span className="students-hero__eyebrow-line" /></div>
              <h1>Manage <span>Students</span></h1>
              <p>One clear view of your student community, project activity and academic assignments.</p>
              <div className="students-hero__meta"><span><span className="students-live-dot" /> Directory overview</span><i />{departments.length} {departments.length === 1 ? "department" : "departments"}</div>
            </div>
            <div className="students-hero__actions"><div className="students-promo"><span className="students-promo__quote">“Empowering Students<br />Building Brighter Futures”</span><GraduationCap className="students-promo__cap" aria-hidden="true" /><button type="button" className="students-add-button" onClick={startAddStudent}><Plus size={18} /><span>Add New Student</span></button></div></div>
          </div>
          <div className="students-hero__seal" aria-hidden="true"><GraduationCap /><span>ACADEMIC<br />DIRECTORY</span></div>
        </header>

        {loadError && !students.length && <section className="students-error"><AlertTriangle /><div><strong>Unable to load student records</strong><span>Please check your connection and try again.</span></div><button type="button" onClick={reloadStudents}>Try again <ArrowRight size={15} /></button></section>}

        <section className="students-stats" aria-label="Student metrics">
          <article className="student-stat student-stat--total"><div className="student-stat__top"><span className="student-stat__icon"><Users /></span><span className="student-stat__tag">Directory</span></div><div className="student-stat__value">{isLoadingStudents && !users?.length ? "—" : students.length}</div><div className="student-stat__label">Total students</div><div className="student-stat__detail">Across {departments.length} active departments</div></article>
          <article className="student-stat student-stat--complete"><div className="student-stat__top"><span className="student-stat__icon"><CheckCircle2 /></span><span className="student-stat__tag">Project status</span></div><div className="student-stat__value">{statuses.length ? completedCount : "—"}</div><div className="student-stat__label">Completed projects</div><div className="student-stat__detail">{statuses.length ? `${completionRate}% of all students` : "Status data unavailable"}</div></article>
          <article className="student-stat student-stat--assigned"><div className="student-stat__top"><span className="student-stat__icon"><UserRound /></span><span className="student-stat__tag">Supervision</span></div><div className="student-stat__value">{assignedCount}</div><div className="student-stat__label">Assigned to supervisors</div><div className="student-stat__detail">{students.length ? Math.round(assignedCount / students.length * 100) : 0}% of the directory</div></article>
          <article className="student-stat student-stat--unassigned"><div className="student-stat__top"><span className="student-stat__icon"><CircleHelp /></span><span className="student-stat__tag">Needs attention</span></div><div className="student-stat__value">{unassignedCount}</div><div className="student-stat__label">Without a supervisor</div><div className="student-stat__detail">Students awaiting assignment</div></article>
        </section>

        <section className="students-analytics" aria-label="Student analytics">
          <article className="analytics-card analytics-card--departments">
            <div className="analytics-card__header"><div><span className="analytics-card__kicker">ACADEMIC MIX</span><h2>Students by department</h2></div><span className="analytics-card__count">{students.length} <small>students</small></span></div>
            {departmentData.length ? <div className="department-chart">{departmentData.map(({ department, count }, index) => <button type="button" className="department-bar" key={department} title={`${department}: ${count} students`} onClick={() => { setFilterDepartment(department); document.getElementById("student-directory")?.scrollIntoView({ behavior: "smooth" }); }}><span className="department-bar__label">{department}</span><span className="department-bar__track"><span className={`department-bar__fill department-bar__fill--${index % 5}`} style={{ "--bar-size": `${Math.max(8, count / maxDepartmentCount * 100)}%` }} /></span><span className="department-bar__count">{count}</span></button>)}</div> : <div className="analytics-empty">Department information will appear when student records are available.</div>}
            <div className="analytics-card__foot"><span><i className="legend-dot legend-dot--blue" /> Enrollment distribution</span><button type="button" onClick={() => { document.getElementById("student-directory")?.scrollIntoView({ behavior: "smooth" }); }}>View directory <ArrowRight size={14} /></button></div>
          </article>

          <article className="analytics-card analytics-card--status">
            <div className="analytics-card__header"><div><span className="analytics-card__kicker">PROJECT PIPELINE</span><h2>Assignment status</h2></div><span className="analytics-card__icon"><SlidersHorizontal /></span></div>
            {assignedProjectCount ? <><div className="status-chart"><div className="status-chart__ring" style={{ background: statusGradient }}><div><strong>{assignedProjectCount}</strong><span>projects</span></div></div><div className="status-chart__legend">{projectStatusData.map(({ status, count }, index) => <div key={status}><i className="legend-dot" style={{ background: statusPalette[index % statusPalette.length] }} /><span>{statusLabel(status)}</span><strong>{count}</strong></div>)}</div></div><div className="analytics-card__foot"><span>Based on linked project records</span><button type="button" onClick={() => { setFilterStatus("all"); document.getElementById("student-directory")?.scrollIntoView({ behavior: "smooth" }); }}>Explore students <ArrowRight size={14} /></button></div></> : <div className="analytics-empty analytics-empty--status"><BookOpen /><strong>{linkedProjectCount ? "Project status unavailable" : "No project assignments yet"}</strong><span>{linkedProjectCount ? `${linkedProjectCount} linked projects have no status details in the directory response.` : "Linked projects will be summarized here when available."}</span></div>}
          </article>

          <article className="analytics-card analytics-card--supervisors">
            <div className="analytics-card__header"><div><span className="analytics-card__kicker">MENTORSHIP</span><h2>Supervisor overview</h2></div><span className="analytics-card__icon"><GraduationCap /></span></div>
            {supervisorData.length ? <div className="supervisor-list">{supervisorData.map(({ supervisor, count }, index) => <button type="button" className="supervisor-item" key={supervisor} onClick={() => { setFilterSupervisor(supervisor); document.getElementById("student-directory")?.scrollIntoView({ behavior: "smooth" }); }}><span className={`supervisor-avatar supervisor-avatar--${index % 4}`}>{supervisor.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span><span className="supervisor-item__name">{supervisor}<small>Assigned students</small></span><span className="supervisor-item__count">{count}<small>{count === 1 ? "student" : "students"}</small></span></button>)}</div> : <div className="analytics-empty analytics-empty--status"><Users /><strong>{assignedCount ? "Supervisor names unavailable" : "No supervisor assignments"}</strong><span>{assignedCount ? `${assignedCount} student records have a supervisor reference that could not be matched to a teacher name.` : "Assignment totals will appear when linked to students."}</span></div>}
            <div className="analytics-card__foot"><span>{supervisors.length} {supervisors.length === 1 ? "supervisor" : "supervisors"} represented</span><button type="button" onClick={() => { setFilterSupervisor("all"); document.getElementById("student-directory")?.scrollIntoView({ behavior: "smooth" }); }}>View all <ArrowRight size={14} /></button></div>
          </article>
        </section>

        <section className="students-directory" id="student-directory">
          <div className="students-directory__heading"><div><div className="students-directory__eyebrow"><span className="students-directory__eyebrow-mark"><Sparkles /></span> DIRECTORY <span className="students-directory__heading-line" /></div><h2>Student registry</h2><p>Search, review and manage academic profiles in one place.</p></div><span className="students-directory__total"><strong>{filteredCount}</strong> {filteredCount === 1 ? "record" : "records"}</span></div>
          <div className="students-toolbar">
            <label className="students-search-input" htmlFor="student-search"><Search /><input id="student-search" type="search" placeholder="Search name, email, project…" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /><kbd>Ctrl K</kbd></label>
            <div className="students-toolbar__filters">
              <label className="student-filter"><span>Department</span><select value={filterDepartment} onChange={(event) => setFilterDepartment(event.target.value)}><option value="all">All departments</option>{departments.map((department) => <option key={department} value={department}>{department}</option>)}</select></label>
              <label className="student-filter"><span>Year joined</span><select value={filterYear} onChange={(event) => setFilterYear(event.target.value)}><option value="all">All years</option>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
              <label className="student-filter"><span>Project status</span><select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}><option value="all">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label>
              <label className="student-filter"><span>Supervisor</span><select value={filterSupervisor} onChange={(event) => setFilterSupervisor(event.target.value)}><option value="all">All supervisors</option>{supervisors.map((supervisor) => <option key={supervisor} value={supervisor}>{supervisor}</option>)}</select></label>
              <button type="button" className="students-sort" onClick={() => setSortOrder((current) => current === "name" ? "newest" : current === "newest" ? "department" : "name")} title="Change sort order"><ArrowDownUp /><span>Sort</span></button>
              <div className="students-view-toggle" role="group" aria-label="Directory view"><button type="button" aria-label="List view" aria-pressed={view === "list"} className={view === "list" ? "is-active" : ""} onClick={() => setView("list")}><List /></button><button type="button" aria-label="Grid view" aria-pressed={view === "grid"} className={view === "grid" ? "is-active" : ""} onClick={() => setView("grid")}><LayoutGrid /></button></div>
            </div>
          </div>
          {filterSupervisor !== "all" && <div className="student-filter-chip">Supervisor: {filterSupervisor}<button type="button" aria-label="Clear supervisor filter" onClick={() => setFilterSupervisor("all")}><X /></button></div>}

          {isLoadingStudents && !users?.length ? <div className="students-loading"><span /><span /><span /><span /><span /></div> : pageStudents.length ? view === "list" ? <div className="students-table-wrap"><table className="students-table"><thead><tr><th>Student</th><th>Department / year</th><th>Supervisor</th><th>Project</th><th>Assignment</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{pageStudents.map((student) => <tr key={student._id} className="student-row"><td><button type="button" className="student-profile" onClick={() => setSelectedStudent(student)}><span className="student-avatar">{student.name?.charAt(0).toUpperCase() || "S"}</span><span><strong>{student.name}</strong><small>{student.email}</small>{student.studentId && <small className="student-profile__id">ID · {student.studentId}</small>}</span></button></td><td><strong className="student-department">{student.department || "Department not set"}</strong><small className="student-year">{student.createdAt ? `Joined ${new Date(student.createdAt).getFullYear()}` : "Year not available"}</small></td><td>{student.supervisor ? <span className="student-supervisor"><span className="student-supervisor__dot" />{supervisorName(student.supervisor, users) || "Supervisor assigned"}</span> : <span className="student-unassigned">Not assigned</span>}</td><td><span className={`student-project${student.projectTitle ? "" : " student-project--empty"}`}>{student.projectTitle || (student.hasProject ? "Project linked · title unavailable" : "No project linked")}</span></td><td>{renderProjectStatus(student)}</td><td><div className="student-actions"><button type="button" className="student-action student-action--edit" onClick={() => handleEdit(student)} aria-label={`Edit ${student.name}`} title={`Edit ${student.name}`}><Pencil /></button><button type="button" className="student-action student-action--delete" onClick={() => handleDelete(student)} aria-label={`Delete ${student.name}`} title={`Delete ${student.name}`}><Trash2 /></button></div></td></tr>)}</tbody></table></div> : <div className="student-card-grid">{pageStudents.map((student) => <article className="student-grid-card" key={student._id}><button type="button" className="student-grid-card__identity" onClick={() => setSelectedStudent(student)}><span className="student-avatar">{student.name?.charAt(0).toUpperCase() || "S"}</span><span><strong>{student.name}</strong><small>{student.email}</small></span><MoreHorizontal /></button><div className="student-grid-card__details"><span><small>Department</small>{student.department || "Not set"}</span><span><small>Supervisor</small>{supervisorName(student.supervisor, users) || (student.supervisor ? "Supervisor assigned" : "Not assigned")}</span><span><small>Project</small>{student.projectTitle || (student.hasProject ? "Project linked · title unavailable" : "Not linked")}</span></div><div className="student-grid-card__footer">{renderProjectStatus(student)}<div className="student-actions"><button type="button" className="student-action student-action--edit" onClick={() => handleEdit(student)} aria-label={`Edit ${student.name}`}><Pencil /></button><button type="button" className="student-action student-action--delete" onClick={() => handleDelete(student)} aria-label={`Delete ${student.name}`}><Trash2 /></button></div></div></article>)}</div> : <div className="students-empty-state"><span className="students-empty-state__icon"><Search /></span><strong>{students.length ? "No students match these filters" : "Your directory is ready"}</strong><span>{students.length ? "Try a different search or clear a filter to see more records." : "Add a student to begin building your academic directory."}</span>{students.length ? <button type="button" onClick={() => { setSearchTerm(""); setFilterDepartment("all"); setFilterYear("all"); setFilterStatus("all"); setFilterSupervisor("all"); }}>Clear filters</button> : <button type="button" onClick={startAddStudent}><Plus /> Add first student</button>}</div>}

          {filteredCount > 0 && <footer className="students-pagination"><span>Showing <strong>{Math.min((page - 1) * pageSize + 1, filteredCount)}–{Math.min(page * pageSize, filteredCount)}</strong> of {filteredCount} students</span><div className="students-pagination__controls"><label>Rows <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label><button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft /></button><span>Page <strong>{page}</strong> of {pageCount}</span><button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}><ChevronRight /></button></div></footer>}
        </section>

        {showModal && <div className="app-modal-overlay students-modal-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && handleCloseModal()}><section className="app-modal students-edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-student-title"><div className="students-modal__top"><span className="students-modal__icon"><Pencil /></span><button type="button" className="students-modal__close" onClick={handleCloseModal} aria-label="Close"><X /></button></div><span className="students-modal__eyebrow">STUDENT PROFILE</span><h3 id="edit-student-title">Edit student</h3><p className="students-modal__description">Update directory information for {editingStudent?.name || "this student"}.</p><form onSubmit={handleSubmit} className="students-form"><label>Full name<input type="text" required autoFocus value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} /></label><label>Email address<input type="email" required value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} /></label><label>Department<select required value={formData.department} onChange={(event) => setFormData({ ...formData, department: event.target.value })}><option value="" disabled>Select department</option>{editDepartments.map((department) => <option key={department} value={department}>{department}</option>)}</select></label><div className="students-modal__actions"><button type="button" className="students-button students-button--quiet" onClick={handleCloseModal}>Cancel</button><button type="submit" className="students-button students-button--primary"><Check size={16} /> Save changes</button></div></form></section></div>}

        {showDeleteModal && studentToDelete && <div className="app-modal-overlay students-modal-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setShowDeleteModal(false)}><section className="app-modal students-delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-student-title"><span className="students-delete-modal__icon"><AlertTriangle /></span><span className="students-modal__eyebrow">REMOVE FROM DIRECTORY</span><h3 id="delete-student-title">Delete student?</h3><p><strong>{studentToDelete.name}</strong> and their directory record will be removed. This action cannot be undone.</p><div className="students-modal__actions"><button type="button" className="students-button students-button--quiet" onClick={() => setShowDeleteModal(false)}>Keep student</button><button type="button" className="students-button students-button--danger" onClick={confirmDelete}><Trash2 size={16} /> Delete student</button></div></section></div>}

        {selectedStudent && createPortal(<div className="manage-students-page students-drawer-portal-root" data-theme={theme}><div className="students-drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedStudent(null)}><aside className="students-detail-drawer" role="dialog" aria-modal="true" aria-labelledby="student-detail-title"><div className="students-drawer__header"><span>STUDENT PROFILE</span><button type="button" onClick={() => setSelectedStudent(null)} aria-label="Close details"><X /></button></div><div className="students-drawer__identity"><span className="student-avatar student-avatar--large">{selectedStudent.name?.charAt(0).toUpperCase() || "S"}</span><h2 id="student-detail-title">{selectedStudent.name}</h2><a href={`mailto:${selectedStudent.email}`}><Mail />{selectedStudent.email}</a>{selectedStudent.studentId && <span className="students-drawer__id">Student ID · {selectedStudent.studentId}</span>}</div><div className="students-drawer__section"><span>ACADEMIC DETAILS</span><dl><div><dt>Department</dt><dd>{selectedStudent.department || "Not provided"}</dd></div><div><dt>Joined</dt><dd>{selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : "Not available"}</dd></div><div><dt>Supervisor</dt><dd>{supervisorName(selectedStudent.supervisor, users) || (selectedStudent.supervisor ? "Supervisor assigned" : "Not assigned")}</dd></div><div><dt>Project</dt><dd>{selectedStudent.projectTitle || (selectedStudent.hasProject ? "Project linked · title unavailable" : "No project linked")}</dd></div><div><dt>Project status</dt><dd>{selectedStudent.projectStatus ? renderProjectStatus(selectedStudent) : "Status unavailable"}</dd></div></dl></div><div className="students-drawer__actions"><button type="button" className="students-button students-button--quiet" onClick={() => handleDelete(selectedStudent)}><Trash2 /> Delete</button><button type="button" className="students-button students-button--primary" onClick={() => handleEdit(selectedStudent)}><Pencil /> Edit profile</button></div></aside></div></div>, document.body)}

        {isCreateStudentModalOpen && <AddStudent />}
      </div>
    </main>
  );
};

export default ManageStudents;

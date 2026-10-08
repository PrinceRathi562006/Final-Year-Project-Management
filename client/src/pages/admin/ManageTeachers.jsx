import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import {
  Activity, AlertTriangle, ArrowDownUp, ArrowRight, Award, BookOpen,
  BriefcaseBusiness, Check, ChevronLeft, ChevronRight, CircleHelp,
  GraduationCap, LayoutGrid, List, Mail, Pencil, Plus, Search,
  SlidersHorizontal, Sparkles, Trash2, UserRound, Users, X,
} from "lucide-react";
import universityImage from "../../assets/university.png";
import AddTeacher from "../../components/modal/AddTeacher";
import {
  deleteTeacher, getAllUsers, updateTeacher,
} from "../../store/slices/adminSlice";
import { toggleTeacherModal } from "../../store/slices/popupSlice";
import "./ManageTeachers.css";

const teacherCapacity = (teacher) => Number(teacher.maxStudents) || 0;
const assignedCount = (teacher) => Array.isArray(teacher.assignedStudents) ? teacher.assignedStudents.length : 0;
const teacherExpertise = (teacher) => Array.isArray(teacher.experties)
  ? teacher.experties.filter(Boolean)
  : String(teacher.experties || "").split(",").map((item) => item.trim()).filter(Boolean);
const initials = (name = "") => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "T";
const joinedYear = (date) => date ? new Date(date).getFullYear() : null;
const avatarTone = (name = "") => `tone-${name.split("").reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % 6}`;

const ManageTeachers = () => {
  const { users = [] } = useSelector((state) => state.admin || {});
  const { isCreateTeacherModalOpen } = useSelector((state) => state.popup || {});
  const { theme } = useOutletContext();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterCapacity, setFilterCapacity] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [sortOrder, setSortOrder] = useState("name");
  const [view, setView] = useState("list");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", department: "", experties: "", maxStudents: 10 });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadTeachers = () => {
    setLoading(true);
    setLoadError(false);
    dispatch(getAllUsers()).unwrap()
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let mounted = true;
    dispatch(getAllUsers()).unwrap()
      .catch(() => { if (mounted) setLoadError(true); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [dispatch]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setEditingTeacher(null);
        setTeacherToDelete(null);
        setSelectedTeacher(null);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("teacher-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const teachers = useMemo(() => users.filter((user) => user.role?.toLowerCase() === "teacher"), [users]);
  const departments = useMemo(() => [...new Set(teachers.map((teacher) => teacher.department).filter(Boolean))].sort(), [teachers]);
  const years = useMemo(() => [...new Set(teachers.map((teacher) => joinedYear(teacher.createdAt)).filter(Boolean))].sort((a, b) => b - a), [teachers]);
  const availableTeachers = teachers.filter((teacher) => assignedCount(teacher) < teacherCapacity(teacher));
  const atCapacity = teachers.length - availableTeachers.length;
  const totalAssigned = teachers.reduce((sum, teacher) => sum + assignedCount(teacher), 0);
  const totalCapacity = teachers.reduce((sum, teacher) => sum + teacherCapacity(teacher), 0);
  const overallUtilization = totalCapacity ? Math.min(100, Math.round(totalAssigned / totalCapacity * 100)) : 0;

  const filteredTeachers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return teachers.filter((teacher) => {
      const matchesSearch = !query || [teacher.name, teacher.email, teacher.department, ...teacherExpertise(teacher)].some((value) => String(value || "").toLowerCase().includes(query));
      const matchesDepartment = filterDepartment === "all" || teacher.department === filterDepartment;
      const matchesYear = filterYear === "all" || String(joinedYear(teacher.createdAt)) === filterYear;
      const full = assignedCount(teacher) >= teacherCapacity(teacher);
      const matchesCapacity = filterCapacity === "all" || (filterCapacity === "full" ? full : !full);
      return matchesSearch && matchesDepartment && matchesYear && matchesCapacity;
    }).sort((a, b) => sortOrder === "newest"
      ? new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      : sortOrder === "capacity"
        ? (assignedCount(a) / Math.max(teacherCapacity(a), 1)) - (assignedCount(b) / Math.max(teacherCapacity(b), 1))
        : String(a.name || "").localeCompare(String(b.name || "")));
  }, [teachers, searchTerm, filterDepartment, filterYear, filterCapacity, sortOrder]);

  const pageCount = Math.max(1, Math.ceil(filteredTeachers.length / pageSize));
  const pageTeachers = filteredTeachers.slice((page - 1) * pageSize, page * pageSize);
  const departmentData = departments.map((department) => ({
    department,
    count: teachers.filter((teacher) => teacher.department === department).length,
    available: teachers.filter((teacher) => teacher.department === department && assignedCount(teacher) < teacherCapacity(teacher)).length,
  })).sort((a, b) => b.count - a.count).slice(0, 5);
  const maxDepartmentCount = Math.max(1, ...departmentData.map((item) => item.count));

  useEffect(() => setPage(1), [searchTerm, filterDepartment, filterYear, filterCapacity, pageSize]);

  const startAddTeacher = () => dispatch(toggleTeacherModal());
  const startEdit = (teacher) => {
    setEditingTeacher(teacher);
      setFormData({
      name: teacher.name || "",
      email: teacher.email || "",
      department: teacher.department || "",
      experties: teacherExpertise(teacher).join(", "),
      maxStudents: teacherCapacity(teacher) || 10,
    });
    setSelectedTeacher(null);
  };
  const askToDelete = (teacher) => {
    setSelectedTeacher(null);
    setTeacherToDelete(teacher);
  };
  const submitEdit = async (event) => {
    event.preventDefault();
    if (!editingTeacher) return;
    setSaving(true);
    try {
      await dispatch(updateTeacher({
        id: editingTeacher._id,
        data: { ...formData, maxStudents: Number(formData.maxStudents), experties: formData.experties.split(",").map((item) => item.trim()).filter(Boolean) },
      })).unwrap();
      setEditingTeacher(null);
    } catch {
      // The thunk surfaces the API error through the shared toast system.
    } finally {
      setSaving(false);
    }
  };
  const confirmDelete = async () => {
    if (!teacherToDelete) return;
    try {
      await dispatch(deleteTeacher(teacherToDelete._id)).unwrap();
      setTeacherToDelete(null);
      setSelectedTeacher(null);
    } catch {
      // Keep the confirmation open so the action can be retried.
    }
  };
  const clearFilters = () => { setSearchTerm(""); setFilterDepartment("all"); setFilterYear("all"); setFilterCapacity("all"); };

  const renderCapacity = (teacher) => {
    const assigned = assignedCount(teacher);
    const capacity = teacherCapacity(teacher);
    const percent = capacity ? Math.min(100, Math.round(assigned / capacity * 100)) : 0;
    const full = capacity > 0 && assigned >= capacity;
    return <div className={`mt-capacity ${full ? "is-full" : ""}`}>
      <div className="mt-capacity__top"><span>{assigned} <i>/</i> {capacity || "—"} students</span><strong>{capacity ? `${percent}%` : "Set capacity"}</strong></div>
      <span className="mt-capacity__track"><span style={{ "--fill": `${percent}%` }} /></span>
      <small>{full ? "At capacity" : capacity ? `${capacity - assigned} places available` : "No student limit set"}</small>
    </div>;
  };

  return (
    <main className="manage-teachers-page" data-theme={theme}>
      <div className="manage-teachers-content">
        <header className="mt-hero" style={{ "--campus-image": `url("${universityImage}")` }}>
          <div className="mt-hero__grid" aria-hidden="true" />
          <div className="mt-hero__copy">
            <div className="mt-eyebrow"><span><GraduationCap /></span> FACULTY &amp; MENTORSHIP <i /></div>
            <h1>Meet the <em>mentors</em></h1>
            <p>Faculty expertise, student capacity and academic support—together in one place.</p>
            <div className="mt-hero__meta"><span><b /> Faculty directory live</span><i />{departments.length} {departments.length === 1 ? "department" : "departments"}</div>
          </div>
          <div className="mt-hero__feature" aria-hidden="true">
            <span className="mt-hero__orbit mt-hero__orbit--one" /><span className="mt-hero__orbit mt-hero__orbit--two" />
            <span className="mt-hero__feature-icon"><Award /></span><span className="mt-hero__feature-caption">GUIDANCE<br />THAT MOVES<br /><b>IDEAS FORWARD</b></span>
            <span className="mt-hero__feature-spark"><Sparkles /></span>
          </div>
          <button type="button" className="mt-add-button" onClick={startAddTeacher}><Plus /> Add faculty member <span>↗</span></button>
        </header>

        {loadError && !teachers.length && <section className="mt-error"><AlertTriangle /><div><strong>Faculty records could not be loaded</strong><span>Check your connection, then try again.</span></div><button type="button" onClick={loadTeachers}>Try again <ArrowRight /></button></section>}

        <section className="mt-overview" aria-label="Faculty overview">
          <article className="mt-stat mt-stat--faculty"><div className="mt-stat__head"><span className="mt-stat__icon"><Users /></span><span className="mt-stat__label">DIRECTORY</span></div><strong>{loading && !users.length ? "—" : teachers.length.toString().padStart(2, "0")}</strong><span className="mt-stat__caption">Faculty members</span><small>Across {departments.length} departments</small><span className="mt-stat__watermark"><GraduationCap /></span></article>
          <article className="mt-stat mt-stat--students"><div className="mt-stat__head"><span className="mt-stat__icon"><UserRound /></span><span className="mt-stat__label">MENTORSHIP</span></div><strong>{totalAssigned}</strong><span className="mt-stat__caption">Students supported</span><small>Currently assigned to faculty</small><span className="mt-stat__watermark"><BookOpen /></span></article>
          <article className="mt-stat mt-stat--open"><div className="mt-stat__head"><span className="mt-stat__icon"><CircleHelp /></span><span className="mt-stat__label">OPEN PLACES</span></div><strong>{Math.max(0, totalCapacity - totalAssigned)}</strong><span className="mt-stat__caption">Mentorship places</span><small>Remaining faculty capacity</small><span className="mt-stat__watermark"><Activity /></span></article>
          <article className="mt-stat mt-stat--utilization"><div className="mt-stat__head"><span className="mt-stat__icon"><SlidersHorizontal /></span><span className="mt-stat__label">CAPACITY</span></div><strong>{overallUtilization}<sup>%</sup></strong><span className="mt-stat__caption">Overall utilization</span><small>{availableTeachers.length} {availableTeachers.length === 1 ? "mentor has" : "mentors have"} room</small><span className="mt-stat__ring" style={{ "--progress": `${overallUtilization * 3.6}deg` }} /></article>
        </section>

        <section className="mt-insights" aria-label="Faculty insights">
          <article className="mt-insight mt-insight--distribution">
            <div className="mt-insight__heading"><div><span>FACULTY LANDSCAPE</span><h2>Expertise across campus</h2></div><span className="mt-insight__badge"><BriefcaseBusiness /> {departments.length} areas</span></div>
            {departmentData.length ? <div className="mt-department-list">{departmentData.map((item, index) => <div className="mt-department" key={item.department}>
              <span className={`mt-department__mark mark-${index}`}><GraduationCap /></span><span className="mt-department__name" title={item.department}>{item.department}</span>
              <span className="mt-department__bar"><i style={{ "--bar": `${item.count / maxDepartmentCount * 100}%` }} /></span><strong>{item.count}</strong><small>{item.available} open</small>
            </div>)}</div> : <div className="mt-insight__empty">Department distribution will appear as faculty profiles are added.</div>}
            <div className="mt-insight__foot"><span><i /> Faculty by department</span><button type="button" onClick={() => { document.getElementById("teacher-directory")?.scrollIntoView({ behavior: "smooth" }); }}>Browse directory <ArrowRight /></button></div>
          </article>
          <article className="mt-insight mt-insight--capacity">
            <div className="mt-insight__heading"><div><span>MENTORSHIP PULSE</span><h2>Capacity at a glance</h2></div><span className="mt-capacity-ring" style={{ "--progress": `${overallUtilization * 3.6}deg` }}><b>{overallUtilization}%</b></span></div>
            <p className="mt-capacity-note">{totalCapacity ? `${totalAssigned} of ${totalCapacity} available mentorship places are in use.` : "Set a student capacity to begin tracking mentorship availability."}</p>
            <div className="mt-pulse-stats"><div><span className="pulse-dot pulse-dot--open" /><strong>{availableTeachers.length}</strong><small>Available</small></div><div><span className="pulse-dot pulse-dot--full" /><strong>{atCapacity}</strong><small>At capacity</small></div><div><span className="pulse-dot pulse-dot--all" /><strong>{teachers.length}</strong><small>Total faculty</small></div></div>
            <div className="mt-insight__foot"><span><Activity /> Live from faculty assignments</span><button type="button" onClick={() => { setFilterCapacity("available"); document.getElementById("teacher-directory")?.scrollIntoView({ behavior: "smooth" }); }}>Find available <ArrowRight /></button></div>
          </article>
        </section>

        <section className="mt-directory" id="teacher-directory">
          <div className="mt-directory__heading"><div><div className="mt-eyebrow mt-eyebrow--dark"><span><Sparkles /></span> THE PEOPLE BEHIND THE PROJECTS <i /></div><h2>Faculty directory</h2><p>Explore specialisms, review mentoring availability and manage each profile.</p></div><span className="mt-total"><strong>{filteredTeachers.length}</strong> {filteredTeachers.length === 1 ? "profile" : "profiles"}</span></div>
          <div className="mt-toolbar">
            <label className="mt-search" htmlFor="teacher-search"><Search /><input id="teacher-search" type="search" placeholder="Name, department or expertise…" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /><kbd>Ctrl K</kbd></label>
            <div className="mt-toolbar__controls">
              <label className="mt-filter"><span>Department</span><select value={filterDepartment} onChange={(event) => setFilterDepartment(event.target.value)}><option value="all">All departments</option>{departments.map((department) => <option key={department} value={department}>{department}</option>)}</select></label>
              <label className="mt-filter"><span>Availability</span><select value={filterCapacity} onChange={(event) => setFilterCapacity(event.target.value)}><option value="all">Any capacity</option><option value="available">Has open places</option><option value="full">At capacity</option></select></label>
              <label className="mt-filter mt-filter--year"><span>Joined</span><select value={filterYear} onChange={(event) => setFilterYear(event.target.value)}><option value="all">Any year</option>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
              <button type="button" className="mt-sort" onClick={() => setSortOrder((current) => current === "name" ? "capacity" : current === "capacity" ? "newest" : "name")} title={`Sort by ${sortOrder === "name" ? "capacity" : sortOrder === "capacity" ? "newest" : "name"}`}><ArrowDownUp /><span>{sortOrder === "name" ? "Name" : sortOrder === "capacity" ? "Capacity" : "Newest"}</span></button>
              <div className="mt-view-toggle" role="group" aria-label="Directory view"><button type="button" aria-label="List view" aria-pressed={view === "list"} className={view === "list" ? "is-active" : ""} onClick={() => setView("list")}><List /></button><button type="button" aria-label="Card view" aria-pressed={view === "grid"} className={view === "grid" ? "is-active" : ""} onClick={() => setView("grid")}><LayoutGrid /></button></div>
            </div>
          </div>
          {(filterDepartment !== "all" || filterYear !== "all" || filterCapacity !== "all") && <div className="mt-filter-chips">{filterDepartment !== "all" && <span>{filterDepartment}<button type="button" onClick={() => setFilterDepartment("all")} aria-label="Clear department filter"><X /></button></span>}{filterYear !== "all" && <span>Joined {filterYear}<button type="button" onClick={() => setFilterYear("all")} aria-label="Clear joined year filter"><X /></button></span>}{filterCapacity !== "all" && <span>{filterCapacity === "full" ? "At capacity" : "Has open places"}<button type="button" onClick={() => setFilterCapacity("all")} aria-label="Clear availability filter"><X /></button></span>}<button type="button" className="mt-clear-filters" onClick={clearFilters}>Clear all</button></div>}

          {loading && !users.length ? <div className="mt-loading" aria-label="Loading faculty"><i /><i /><i /><i /></div> : pageTeachers.length ? view === "list" ? <div className="mt-table-wrap"><table className="mt-table"><thead><tr><th>Faculty member</th><th>Department</th><th>Expertise</th><th>Mentorship capacity</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{pageTeachers.map((teacher) => <tr key={teacher._id}>
            <td><button type="button" className="mt-person" onClick={() => setSelectedTeacher(teacher)}><span className={`mt-avatar ${avatarTone(teacher.name)}`}>{initials(teacher.name)}</span><span><strong>{teacher.name || "Unnamed faculty"}</strong><small>{teacher.email}</small></span></button></td>
            <td><span className="mt-dept-pill">{teacher.department || "Department not set"}</span><small className="mt-joined">{joinedYear(teacher.createdAt) ? `Joined ${joinedYear(teacher.createdAt)}` : "Year unavailable"}</small></td>
            <td><div className="mt-expertise">{teacherExpertise(teacher).length ? <>{teacherExpertise(teacher).slice(0, 2).map((skill) => <span key={skill}>{skill}</span>)}{teacherExpertise(teacher).length > 2 && <small>+{teacherExpertise(teacher).length - 2}</small>}</> : <span className="is-empty">Not added</span>}</div></td>
            <td>{renderCapacity(teacher)}</td>
            <td><div className="mt-actions"><button type="button" onClick={() => startEdit(teacher)} aria-label={`Edit ${teacher.name}`} title="Edit profile"><Pencil /></button><button type="button" className="is-danger" onClick={() => setTeacherToDelete(teacher)} aria-label={`Delete ${teacher.name}`} title="Delete faculty member"><Trash2 /></button></div></td>
          </tr>)}</tbody></table></div> : <div className="mt-card-grid">{pageTeachers.map((teacher) => <article className="mt-faculty-card" key={teacher._id}>
            <div className="mt-faculty-card__top"><button type="button" className="mt-card-person" onClick={() => setSelectedTeacher(teacher)}><span className={`mt-avatar mt-avatar--large ${avatarTone(teacher.name)}`}>{initials(teacher.name)}</span><span><strong>{teacher.name || "Unnamed faculty"}</strong><small>{teacher.department || "Department not set"}</small></span></button><div className="mt-actions"><button type="button" onClick={() => startEdit(teacher)} aria-label={`Edit ${teacher.name}`}><Pencil /></button><button type="button" className="is-danger" onClick={() => setTeacherToDelete(teacher)} aria-label={`Delete ${teacher.name}`}><Trash2 /></button></div></div>
            <a className="mt-card-email" href={`mailto:${teacher.email}`}><Mail />{teacher.email}</a><div className="mt-card-skills">{teacherExpertise(teacher).length ? teacherExpertise(teacher).slice(0, 3).map((skill) => <span key={skill}>{skill}</span>) : <span className="is-empty">Add expertise to this profile</span>}</div>{renderCapacity(teacher)}<button type="button" className="mt-card-details" onClick={() => setSelectedTeacher(teacher)}>View faculty profile <ArrowRight /></button>
          </article>)}</div> : <div className="mt-empty"><span><Search /></span><strong>{teachers.length ? "No faculty match this view" : "Start building your faculty directory"}</strong><p>{teachers.length ? "Try another search or adjust the selected filters." : "Add faculty profiles to keep expertise and mentoring availability easy to find."}</p>{teachers.length ? <button type="button" onClick={clearFilters}>Clear filters</button> : <button type="button" onClick={startAddTeacher}><Plus /> Add the first faculty member</button>}</div>}

          {filteredTeachers.length > 0 && <footer className="mt-pagination"><span>Showing <strong>{Math.min((page - 1) * pageSize + 1, filteredTeachers.length)}–{Math.min(page * pageSize, filteredTeachers.length)}</strong> of {filteredTeachers.length} faculty members</span><div><label>Rows <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label><button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft /></button><span>Page <strong>{page}</strong> of {pageCount}</span><button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}><ChevronRight /></button></div></footer>}
        </section>

      {editingTeacher && <div className="mt-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setEditingTeacher(null)}><section className="mt-modal" role="dialog" aria-modal="true" aria-labelledby="mt-edit-title"><div className="mt-modal__top"><span><Pencil /></span><button type="button" onClick={() => setEditingTeacher(null)} aria-label="Close"><X /></button></div><span className="mt-modal__eyebrow">FACULTY PROFILE</span><h3 id="mt-edit-title">Edit faculty member</h3><p>Update the directory details and mentoring capacity for {editingTeacher.name || "this faculty member"}.</p><form onSubmit={submitEdit} className="mt-form"><label>Full name<input autoFocus required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} /></label><label>Email address<input required type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} /></label><label>Department<input required value={formData.department} onChange={(event) => setFormData({ ...formData, department: event.target.value })} /></label><label>Areas of expertise <small>Separate each area with a comma</small><textarea required rows={3} value={formData.experties} onChange={(event) => setFormData({ ...formData, experties: event.target.value })} /></label><label>Maximum student capacity<input required min="1" type="number" value={formData.maxStudents} onChange={(event) => setFormData({ ...formData, maxStudents: event.target.value })} /></label><div className="mt-modal__actions"><button type="button" className="mt-button mt-button--quiet" onClick={() => setEditingTeacher(null)}>Cancel</button><button type="submit" className="mt-button mt-button--primary" disabled={saving}>{saving ? "Saving…" : <><Check /> Save changes</>}</button></div></form></section></div>}

        {teacherToDelete && <div className="mt-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setTeacherToDelete(null)}><section className="mt-modal mt-modal--delete" role="alertdialog" aria-modal="true" aria-labelledby="mt-delete-title"><span className="mt-delete-icon"><AlertTriangle /></span><span className="mt-modal__eyebrow">REMOVE FROM FACULTY</span><h3 id="mt-delete-title">Delete this profile?</h3><p><strong>{teacherToDelete.name}</strong> will be removed from the faculty directory. This action cannot be undone.</p><div className="mt-modal__actions"><button type="button" className="mt-button mt-button--quiet" onClick={() => setTeacherToDelete(null)}>Keep profile</button><button type="button" className="mt-button mt-button--danger" onClick={confirmDelete}><Trash2 /> Delete profile</button></div></section></div>}

        {selectedTeacher && createPortal(<div className="manage-teachers-page mt-portal" data-theme={theme}><div className="mt-drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedTeacher(null)}><aside className="mt-drawer" role="dialog" aria-modal="true" aria-labelledby="mt-profile-title"><div className="mt-drawer__header"><span>FACULTY PROFILE</span><button type="button" onClick={() => setSelectedTeacher(null)} aria-label="Close profile"><X /></button></div><div className="mt-drawer__identity"><span className={`mt-avatar mt-avatar--hero ${avatarTone(selectedTeacher.name)}`}>{initials(selectedTeacher.name)}</span><span className="mt-drawer__verified"><Check /> Faculty member</span><h2 id="mt-profile-title">{selectedTeacher.name}</h2><a href={`mailto:${selectedTeacher.email}`}><Mail />{selectedTeacher.email}</a></div><div className="mt-drawer__section"><span>ACADEMIC PROFILE</span><dl><div><dt>Department</dt><dd>{selectedTeacher.department || "Not provided"}</dd></div><div><dt>Joined</dt><dd>{selectedTeacher.createdAt ? new Date(selectedTeacher.createdAt).toLocaleDateString() : "Not available"}</dd></div><div><dt>Students assigned</dt><dd>{assignedCount(selectedTeacher)} of {teacherCapacity(selectedTeacher) || "—"}</dd></div></dl></div><div className="mt-drawer__section"><span>AREAS OF EXPERTISE</span><div className="mt-drawer__skills">{teacherExpertise(selectedTeacher).length ? teacherExpertise(selectedTeacher).map((skill) => <span key={skill}>{skill}</span>) : <p>No expertise has been added to this profile.</p>}</div></div><div className="mt-drawer__capacity"><span>MENTORSHIP CAPACITY</span>{renderCapacity(selectedTeacher)}</div><div className="mt-drawer__actions"><button type="button" className="mt-button mt-button--quiet" onClick={() => askToDelete(selectedTeacher)}><Trash2 /> Remove</button><button type="button" className="mt-button mt-button--primary" onClick={() => startEdit(selectedTeacher)}><Pencil /> Edit profile</button></div></aside></div></div>, document.body)}

        {isCreateTeacherModalOpen && <AddTeacher />}
      </div>
    </main>
  );
};

export default ManageTeachers;

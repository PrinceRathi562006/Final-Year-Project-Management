import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import {
  AlertTriangle, Check, ChevronLeft, ChevronRight, Crosshair, List,
  Mail, Minus, Pencil, Plus, Search, Trash2, X,
} from "lucide-react";
import AddTeacher from "../../components/modal/AddTeacher";
import { deleteTeacher, getAllUsers, updateTeacher } from "../../store/slices/adminSlice";
import { toggleTeacherModal } from "../../store/slices/popupSlice";
import "./ManageTeachers.css";

/* ------------------------------ helpers ------------------------------ */
const teacherCapacity = (t) => Number(t.maxStudents) || 0;
const assignedCount = (t) => (Array.isArray(t.assignedStudents) ? t.assignedStudents.length : 0);
const idOf = (value) => (value && typeof value === "object" ? value._id : value) || "";
const teacherExpertise = (t) =>
  Array.isArray(t.experties)
    ? t.experties.filter(Boolean)
    : String(t.experties || "").split(",").map((s) => s.trim()).filter(Boolean);
const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "T";
const joinedYear = (date) => (date ? new Date(date).getFullYear() : null);
const hueOf = (text = "") => [...text].reduce((sum, ch) => sum + ch.charCodeAt(0) * 17, 0) % 360;
const deptColor = (dept) => `hsl(${hueOf(dept || "none")} 68% 56%)`;

/* open = has room, near = 80% or more, full = no room, unset = no limit saved */
const statusOf = (t) => {
  const cap = teacherCapacity(t);
  const used = assignedCount(t);
  if (!cap) return "unset";
  if (used >= cap) return "full";
  if (used / cap >= 0.8) return "near";
  return "open";
};
const STATUS_LABEL = { open: "Has room", near: "Almost full", full: "Full", unset: "No limit set" };

/* A row of little lecture-hall chairs: filled chair = a student is assigned. */
const Chairs = ({ teacher, size = "sm" }) => {
  const used = assignedCount(teacher);
  const cap = teacherCapacity(teacher);
  if (!cap) return <span className="mt-chairs-empty">No limit set</span>;
  const max = size === "lg" ? 48 : 14;
  const total = Math.min(cap, max);
  const filled = cap <= max ? Math.min(used, cap) : Math.round((used / cap) * total);
  return (
    <span className={`mt-chairs mt-chairs--${size} is-${statusOf(teacher)}`} aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={i < filled ? "is-taken" : ""} style={{ "--n": i }} />
      ))}
    </span>
  );
};

/* Inline dropdown used inside the filter sentence. */
const Pick = ({ label, value, onChange, children }) => (
  <label className="mt-pick">
    <span className="sr-only">{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
  </label>
);

const emptyForm = { name: "", email: "", department: "", experties: "", maxStudents: 10 };

/* ------------------------------ component ------------------------------ */
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
  const [view, setView] = useState("roster"); // roster | balance
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState("view"); // view | edit | delete
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  /* ---------- data loading (same thunk as before) ---------- */
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

  /* ---------- derived data ---------- */
  const teachers = useMemo(() => {
    const students = users.filter((user) => user.role?.toLowerCase() === "student");

    return users
      .filter((user) => user.role?.toLowerCase() === "teacher")
      .map((teacher) => ({
        ...teacher,
        assignedStudents: students
          .filter((student) => idOf(student.supervisor) === teacher._id)
          .map((student) => student._id),
      }));
  }, [users]);
  const selected = teachers.find((t) => t._id === selectedId) || null;

  const departments = useMemo(
    () => [...new Set(teachers.map((t) => t.department).filter(Boolean))].sort(),
    [teachers],
  );
  const years = useMemo(
    () => [...new Set(teachers.map((t) => joinedYear(t.createdAt)).filter(Boolean))].sort((a, b) => b - a),
    [teachers],
  );

  const availableTeachers = teachers.filter((t) => ["open", "near"].includes(statusOf(t)));
  const atCapacity = teachers.filter((t) => statusOf(t) === "full").length;
  const totalAssigned = teachers.reduce((sum, t) => sum + assignedCount(t), 0);
  const totalCapacity = teachers.reduce((sum, t) => sum + teacherCapacity(t), 0);
  const openSeats = Math.max(0, totalCapacity - totalAssigned);
  const utilization = totalCapacity ? Math.min(100, Math.round((totalAssigned / totalCapacity) * 100)) : 0;

  const departmentData = useMemo(
    () => departments
      .map((name) => {
        const list = teachers.filter((t) => t.department === name);
        return { name, count: list.length, open: list.filter((t) => ["open", "near"].includes(statusOf(t))).length };
      })
      .sort((a, b) => b.count - a.count),
    [departments, teachers],
  );

  const filteredTeachers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return teachers
      .filter((t) => {
        const matchesSearch = !query
          || [t.name, t.email, t.department, ...teacherExpertise(t)]
            .some((v) => String(v || "").toLowerCase().includes(query));
        const matchesDepartment = filterDepartment === "all" || t.department === filterDepartment;
        const matchesYear = filterYear === "all" || String(joinedYear(t.createdAt)) === filterYear;
        const status = statusOf(t);
        const matchesCapacity =
          filterCapacity === "all"
          || (filterCapacity === "open" && assignedCount(t) < teacherCapacity(t))
          || (filterCapacity === "near" && status === "near")
          || (filterCapacity === "full" && status === "full")
          || (filterCapacity === "unset" && status === "unset");
        return matchesSearch && matchesDepartment && matchesYear && matchesCapacity;
      })
      .sort((a, b) => {
        if (sortOrder === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        if (sortOrder === "room") {
          return (teacherCapacity(b) - assignedCount(b)) - (teacherCapacity(a) - assignedCount(a));
        }
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
  }, [teachers, searchTerm, filterDepartment, filterYear, filterCapacity, sortOrder]);

  const pageCount = Math.max(1, Math.ceil(filteredTeachers.length / pageSize));
  const pageTeachers = filteredTeachers.slice((page - 1) * pageSize, page * pageSize);
  const roomiest = [...availableTeachers]
    .sort((a, b) => (teacherCapacity(b) - assignedCount(b)) - (teacherCapacity(a) - assignedCount(a)))
    .slice(0, 4);

  /* balance view: x = seat capacity, y = students assigned */
  const plotMax = useMemo(
    () => Math.max(1, ...filteredTeachers.map((t) => Math.max(teacherCapacity(t), assignedCount(t)))),
    [filteredTeachers],
  );
  const mapPoints = useMemo(() => {
    const seen = {};
    return filteredTeachers.map((t) => {
      const cap = teacherCapacity(t);
      const used = assignedCount(t);
      const key = `${cap}-${used}`;
      seen[key] = (seen[key] ?? -1) + 1;
      const idx = seen[key];
      const angle = idx * 2.4;
      const radius = idx ? 9 * Math.sqrt(idx) : 0;
      return {
        teacher: t,
        x: Math.min(100, (cap / plotMax) * 100),
        y: Math.min(100, (used / plotMax) * 100),
        dx: Math.cos(angle) * radius,
        dy: Math.sin(angle) * radius,
      };
    });
  }, [filteredTeachers, plotMax]);

  const filtersActive = filterDepartment !== "all" || filterYear !== "all" || filterCapacity !== "all" || searchTerm.trim();

  /* ---------- effects ---------- */
  useEffect(() => { setPage(1); }, [searchTerm, filterDepartment, filterYear, filterCapacity, pageSize]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = event.target?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("teacher-search")?.focus();
        return;
      }
      if (event.key === "Escape") {
        if (mode !== "view") setMode("view");
        else setSelectedId(null);
        return;
      }
      if (typing || view !== "roster" || !pageTeachers.length) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const current = pageTeachers.findIndex((t) => t._id === selectedId);
        const delta = event.key === "ArrowDown" ? 1 : -1;
        const next = pageTeachers[Math.min(pageTeachers.length - 1, Math.max(0, current + delta))];
        if (next) { setSelectedId(next._id); setMode("view"); }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, view, pageTeachers, selectedId]);

  /* ---------- actions ---------- */
  const startAddTeacher = () => dispatch(toggleTeacherModal());
  const selectTeacher = (teacher) => { setSelectedId(teacher._id); setMode("view"); };
  const startEdit = (teacher) => {
    setSelectedId(teacher._id);
    setFormData({
      name: teacher.name || "",
      email: teacher.email || "",
      department: teacher.department || "",
      experties: teacherExpertise(teacher).join(", "),
      maxStudents: teacherCapacity(teacher) || 10,
    });
    setMode("edit");
  };
  const startDelete = (teacher) => { setSelectedId(teacher._id); setMode("delete"); };

  const submitEdit = async (event) => {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await dispatch(updateTeacher({
        id: selected._id,
        data: {
          ...formData,
          maxStudents: Number(formData.maxStudents),
          experties: formData.experties.split(",").map((s) => s.trim()).filter(Boolean),
        },
      })).unwrap();
      setMode("view");
    } catch {
      // The thunk surfaces the API error through the shared toast system.
    } finally {
      setSaving(false);
    }
  };

  /* quick +/- on seat capacity, saved straight away */
  const changeCapacity = async (teacher, next) => {
    if (saving || next < Math.max(1, assignedCount(teacher)) || next > 500) return;
    setSaving(true);
    try {
      await dispatch(updateTeacher({
        id: teacher._id,
        data: {
          name: teacher.name || "",
          email: teacher.email || "",
          department: teacher.department || "",
          experties: teacherExpertise(teacher),
          maxStudents: next,
        },
      })).unwrap();
    } catch {
      // Error toast comes from the thunk.
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await dispatch(deleteTeacher(selected._id)).unwrap();
      setSelectedId(null);
      setMode("view");
    } catch {
      // Keep the confirmation open so the action can be retried.
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("all");
    setFilterYear("all");
    setFilterCapacity("all");
  };
  const toggleDepartment = (name) => setFilterDepartment((current) => (current === name ? "all" : name));

  /* ---------- render ---------- */
  const status = selected ? statusOf(selected) : null;
  const masterTicks = totalCapacity;
  const masterFilled = totalAssigned;

  return (
    <main className="mt-page" data-theme={theme}>
      <div className="mt-shell">
        {/* ===== Header ===== */}
        <header className="mt-head">
          <div className="mt-head__text">
            <h1>Faculty mentors</h1>
            <p className="mt-lede">
              {loading && !users.length
                ? "Loading the faculty list…"
                : `${teachers.length} ${teachers.length === 1 ? "mentor" : "mentors"} in ${departments.length} ${departments.length === 1 ? "department" : "departments"} are holding ${totalAssigned} of ${totalCapacity} mentorship seats.`}
            </p>
          </div>
          <button type="button" className="mt-add" onClick={startAddTeacher}>
            <Plus /> Add mentor
          </button>

          <div className="mt-hall" aria-label={`${utilization}% of mentorship seats are taken`}>
            <div className="mt-hall__chairs" aria-hidden="true">
              {Array.from({ length: masterTicks }, (_, i) => (
                <i key={i} className={i < masterFilled ? "is-taken" : ""} style={{ "--n": i }} />
              ))}
            </div>
            <dl className="mt-hall__stats">
              <div><dt>Seats taken</dt><dd>{totalAssigned}</dd></div>
              <div><dt>Seats free</dt><dd>{openSeats}</dd></div>
              <div><dt>Mentors with room</dt><dd>{availableTeachers.length}</dd></div>
              <div><dt>Mentors full</dt><dd>{atCapacity}</dd></div>
              <div className="mt-hall__pct"><dt>Hall filled</dt><dd>{utilization}%</dd></div>
            </dl>
          </div>
        </header>

        {loadError && !teachers.length && (
          <section className="mt-error" role="alert">
            <AlertTriangle />
            <div>
              <strong>Faculty records could not be loaded</strong>
              <span>Check your connection, then try again.</span>
            </div>
            <button type="button" onClick={loadTeachers}>Try again</button>
          </section>
        )}

        {/* ===== Department ribbon ===== */}
        {departmentData.length > 0 && (
          <section className="mt-ribbon" aria-label="Filter by department">
            {departmentData.map((item) => (
              <button
                type="button"
                key={item.name}
                className={`mt-seg ${filterDepartment === item.name ? "is-active" : ""} ${filterDepartment !== "all" && filterDepartment !== item.name ? "is-dim" : ""}`}
                style={{ "--n": item.count, "--dc": deptColor(item.name) }}
                aria-pressed={filterDepartment === item.name}
                onClick={() => toggleDepartment(item.name)}
                title={`${item.name}: ${item.count} mentors, ${item.open} with room`}
              >
                <span className="mt-seg__name">{item.name}</span>
                <span className="mt-seg__meta"><b>{item.count}</b> {item.open} with room</span>
              </button>
            ))}
          </section>
        )}

        {/* ===== Controls ===== */}
        <section className="mt-controls">
          <label className="mt-search" htmlFor="teacher-search">
            <Search />
            <input
              id="teacher-search"
              type="search"
              placeholder="Search by name, email or expertise"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <kbd>Ctrl K</kbd>
          </label>

          <div className="mt-views" role="group" aria-label="Choose view">
            <button type="button" aria-pressed={view === "roster"} className={view === "roster" ? "is-active" : ""} onClick={() => setView("roster")}>
              <List /> Roster
            </button>
            <button type="button" aria-pressed={view === "balance"} className={view === "balance" ? "is-active" : ""} onClick={() => setView("balance")}>
              <Crosshair /> Balance
            </button>
          </div>

          <p className="mt-sentence">
            Show mentors in
            <Pick label="Department" value={filterDepartment} onChange={setFilterDepartment}>
              <option value="all">every department</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </Pick>
            who
            <Pick label="Availability" value={filterCapacity} onChange={setFilterCapacity}>
              <option value="all">have any load</option>
              <option value="open">have seats free</option>
              <option value="near">are almost full</option>
              <option value="full">are full</option>
              <option value="unset">have no limit set</option>
            </Pick>
            and joined
            <Pick label="Joined year" value={filterYear} onChange={setFilterYear}>
              <option value="all">in any year</option>
              {years.map((y) => <option key={y} value={y}>in {y}</option>)}
            </Pick>
            , sorted by
            <Pick label="Sort order" value={sortOrder} onChange={setSortOrder}>
              <option value="name">name</option>
              <option value="room">most free seats</option>
              <option value="newest">newest first</option>
            </Pick>
            .
            {filtersActive ? <button type="button" className="mt-reset" onClick={clearFilters}>Reset</button> : null}
          </p>
        </section>

        {/* ===== Body: list + inspector ===== */}
        <div className="mt-body">
          <section className="mt-main" aria-label="Faculty directory">
            <div className="mt-count">
              Showing <strong>{filteredTeachers.length}</strong> {filteredTeachers.length === 1 ? "mentor" : "mentors"}
              {view === "roster" && filteredTeachers.length > 0 && <span className="mt-hint">Use the up and down keys to move</span>}
            </div>

            {loading && !users.length ? (
              <ul className="mt-skeleton" aria-label="Loading faculty">
                {Array.from({ length: 6 }, (_, i) => <li key={i} />)}
              </ul>
            ) : !filteredTeachers.length ? (
              <div className="mt-empty">
                <h2>{teachers.length ? "No mentor fits this view" : "No mentors added yet"}</h2>
                <p>
                  {teachers.length
                    ? "Loosen the filters or search for a different name or topic."
                    : "Add your first faculty member to start assigning mentorship seats."}
                </p>
                {teachers.length
                  ? <button type="button" onClick={clearFilters}>Reset filters</button>
                  : <button type="button" onClick={startAddTeacher}><Plus /> Add mentor</button>}
              </div>
            ) : view === "roster" ? (
              <>
                <div className="mt-cols" aria-hidden="true">
                  <span>Mentor</span><span>Department</span><span>Expertise</span><span>Seats</span><span />
                </div>
                <ul className="mt-list">
                  {pageTeachers.map((teacher) => {
                    const s = statusOf(teacher);
                    const skills = teacherExpertise(teacher);
                    return (
                      <li
                        key={teacher._id}
                        className={`mt-row is-${s} ${selectedId === teacher._id ? "is-selected" : ""}`}
                        style={{ "--dc": deptColor(teacher.department) }}
                      >
                        <button type="button" className="mt-row__main" onClick={() => selectTeacher(teacher)} aria-pressed={selectedId === teacher._id}>
                          <span className="mt-who">
                            <span className="mt-badge">{initials(teacher.name)}</span>
                            <span className="mt-who__text">
                              <strong>{teacher.name || "Unnamed faculty"}</strong>
                              <small>{teacher.email}</small>
                            </span>
                          </span>
                          <span className="mt-dept"><i />{teacher.department || "No department"}</span>
                          <span className="mt-skills">
                            {skills.length
                              ? <>{skills.slice(0, 2).join(", ")}{skills.length > 2 && <em> +{skills.length - 2} more</em>}</>
                              : <em>Not added</em>}
                          </span>
                          <span className="mt-load">
                            <Chairs teacher={teacher} />
                            <b>{assignedCount(teacher)}/{teacherCapacity(teacher) || "–"}</b>
                            <span className="sr-only">{STATUS_LABEL[s]}</span>
                          </span>
                        </button>
                        <div className="mt-row__actions">
                          <button type="button" onClick={() => startEdit(teacher)} aria-label={`Edit ${teacher.name}`} title="Edit"><Pencil /></button>
                          <button type="button" className="is-danger" onClick={() => startDelete(teacher)} aria-label={`Delete ${teacher.name}`} title="Delete"><Trash2 /></button>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <footer className="mt-pager">
                  <span>
                    {Math.min((page - 1) * pageSize + 1, filteredTeachers.length)} to {Math.min(page * pageSize, filteredTeachers.length)} of {filteredTeachers.length}
                  </span>
                  <div>
                    <label>Rows
                      <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </label>
                    <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft /></button>
                    <span>Page {page} of {pageCount}</span>
                    <button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}><ChevronRight /></button>
                  </div>
                </footer>
              </>
            ) : (
              <div className="mt-balance">
                <p className="mt-balance__note">
                  Each dot is one mentor. Dots further right offer more seats, dots higher up have more students.
                  Dots on the diagonal are full, dots below it still have room.
                </p>
                <div className="mt-plot">
                  <span className="mt-plot__y">Students assigned</span>
                  <div className="mt-plot__area">
                    <svg className="mt-plot__diag" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                      <polygon points="0,100 100,100 100,0" className="mt-plot__room" />
                      <line x1="0" y1="100" x2="100" y2="0" />
                    </svg>
                    <span className="mt-plot__label mt-plot__label--room">Room to mentor</span>
                    <span className="mt-plot__label mt-plot__label--full">Full</span>
                    {mapPoints.map(({ teacher, x, y, dx, dy }) => (
                      <button
                        type="button"
                        key={teacher._id}
                        className={`mt-dot is-${statusOf(teacher)} ${selectedId === teacher._id ? "is-selected" : ""}`}
                        style={{ "--x": x, "--y": y, "--dx": `${dx}px`, "--dy": `${dy}px`, "--dc": deptColor(teacher.department) }}
                        onClick={() => selectTeacher(teacher)}
                        aria-label={`${teacher.name}, ${assignedCount(teacher)} of ${teacherCapacity(teacher)} seats`}
                      >
                        <span className="mt-dot__tip">{teacher.name} ({assignedCount(teacher)}/{teacherCapacity(teacher)})</span>
                      </button>
                    ))}
                  </div>
                  <span className="mt-plot__x">Seat capacity (up to {plotMax})</span>
                </div>
              </div>
            )}
          </section>

          {selected && <div className="mt-scrim" role="presentation" onClick={() => setSelectedId(null)} />}

          <aside className={`mt-inspector ${selected ? "is-open" : ""}`} aria-live="polite">
            {!selected ? (
              <div className="mt-idle">
                <h2>Select a mentor</h2>
                <p>Choose a row or a dot to see their seats, expertise and edit options.</p>
                {roomiest.length > 0 && (
                  <>
                    <h3>Most room to mentor</h3>
                    <ul>
                      {roomiest.map((t) => (
                        <li key={t._id}>
                          <button type="button" onClick={() => selectTeacher(t)}>
                            <span>{t.name}</span>
                            <b>{teacherCapacity(t) - assignedCount(t)} free</b>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-detail" key={selected._id} style={{ "--dc": deptColor(selected.department) }}>
                <div className="mt-detail__top">
                  <span className="mt-badge mt-badge--lg">{initials(selected.name)}</span>
                  <div className="mt-detail__id">
                    <h2>{selected.name}</h2>
                    <a href={`mailto:${selected.email}`}><Mail /> {selected.email}</a>
                  </div>
                  <button type="button" className="mt-close" onClick={() => setSelectedId(null)} aria-label="Close details"><X /></button>
                </div>

                {mode === "view" && (
                  <>
                    <div className={`mt-status is-${status}`}>{STATUS_LABEL[status]}</div>

                    <div className="mt-detail__seats">
                      <Chairs teacher={selected} size="lg" />
                      <p>
                        {teacherCapacity(selected)
                          ? <><strong>{assignedCount(selected)}</strong> of {teacherCapacity(selected)} seats taken, {Math.max(0, teacherCapacity(selected) - assignedCount(selected))} free</>
                          : "Set a seat capacity so students can be assigned."}
                      </p>
                      <div className="mt-stepper">
                        <span>Seat capacity</span>
                        <div>
                          <button type="button" aria-label="Remove one seat" disabled={saving || teacherCapacity(selected) <= Math.max(1, assignedCount(selected))} onClick={() => changeCapacity(selected, teacherCapacity(selected) - 1)}><Minus /></button>
                          <output>{teacherCapacity(selected) || 0}</output>
                          <button type="button" aria-label="Add one seat" disabled={saving} onClick={() => changeCapacity(selected, teacherCapacity(selected) + 1)}><Plus /></button>
                        </div>
                      </div>
                    </div>

                    <dl className="mt-facts">
                      <div><dt>Department</dt><dd>{selected.department || "Not provided"}</dd></div>
                      <div><dt>Joined</dt><dd>{selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "Not available"}</dd></div>
                    </dl>

                    <div className="mt-tags">
                      <h3>Areas of expertise</h3>
                      {teacherExpertise(selected).length
                        ? <ul>{teacherExpertise(selected).map((skill) => <li key={skill}>{skill}</li>)}</ul>
                        : <p>No expertise added yet. Use Edit profile to add some.</p>}
                    </div>

                    <div className="mt-detail__actions">
                      <button type="button" className="mt-btn mt-btn--ghost" onClick={() => startDelete(selected)}><Trash2 /> Delete</button>
                      <button type="button" className="mt-btn mt-btn--solid text-white" onClick={() => startEdit(selected)}><Pencil /> Edit profile</button>
                    </div>
                  </>
                )}

                {mode === "edit" && (
                  <form className="mt-form" onSubmit={submitEdit}>
                    <label>Full name
                      <input autoFocus required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </label>
                    <label>Email address
                      <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </label>
                    <label>Department
                      <input required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                    </label>
                    <label>Areas of expertise <small>separate with commas</small>
                      <textarea required rows={3} value={formData.experties} onChange={(e) => setFormData({ ...formData, experties: e.target.value })} />
                    </label>
                    <label>Seat capacity
                      <input required min="1" type="number" value={formData.maxStudents} onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })} />
                    </label>
                    <div className="mt-detail__actions">
                      <button type="button" className="mt-btn mt-btn--ghost" onClick={() => setMode("view")}>Cancel</button>
                      <button type="submit" className="mt-btn mt-btn--solid" disabled={saving}>
                        {saving ? "Saving…" : <><Check /> Save changes</>}
                      </button>
                    </div>
                  </form>
                )}

                {mode === "delete" && (
                  <div className="mt-confirm" role="alertdialog" aria-labelledby="mt-confirm-title">
                    <AlertTriangle />
                    <h3 id="mt-confirm-title">Delete {selected.name}?</h3>
                    <p>This removes the mentor from the faculty directory. It cannot be undone.</p>
                    <div className="mt-detail__actions">
                      <button type="button" className="mt-btn mt-btn--ghost" onClick={() => setMode("view")}>Keep mentor</button>
                      <button type="button" className="mt-btn mt-btn--danger" onClick={confirmDelete}><Trash2 /> Delete mentor</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>

        {isCreateTeacherModalOpen && <AddTeacher />}
      </div>
    </main>
  );
};

export default ManageTeachers;

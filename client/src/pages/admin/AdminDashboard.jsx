import {
  createElement,
  lazy,
  Suspense,
  useRef,
  useState,
  useEffect,
} from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Compass,
  GraduationCap,
  LogOut,
  Network,
  UsersRound,
} from "lucide-react";
import { getAllUsers } from "../../store/slices/adminSlice";
import { logout } from "../../store/slices/authSlice";
import AdminIntro from "./AdminIntro";
import "./AdminPortal.css";
import "./AdminDashboard.css";
import "./AdminBookOpening.css";

const AdminSketchbookCanvas = lazy(() => import("./AdminSketchbookCanvas"));

const plates = [
  {
    title: "Students",
    note: "The people behind the work",
    path: "/admin/students",
    icon: "01",
    color: "#e5a875",
    position: [-2.45, 0.2, 0.1],
    size: [2.45, 2.8],
  },
  {
    title: "Faculty",
    note: "Guides, mentors & reviewers",
    path: "/admin/teachers",
    icon: "02",
    color: "#91a9c8",
    position: [0, 0.15, 0.3],
    size: [2.45, 2.8],
  },
  {
    title: "Project atlas",
    note: "Ideas taking shape",
    path: "/admin/projects",
    icon: "03",
    color: "#a7b58e",
    position: [2.45, 0.2, 0.1],
    size: [2.45, 2.8],
  },
  {
    title: "Mentor matches",
    note: "Bring the right minds together",
    path: "/admin/assign-supervisor",
    icon: "04",
    color: "#d08c80",
    position: [-1.23, -2.95, 0.18],
    size: [2.45, 2.45],
  },
  {
    title: "Milestones",
    note: "A timeline for every big idea",
    path: "/admin/deadlines",
    icon: "05",
    color: "#c4a568",
    position: [1.23, -2.95, 0.18],
    size: [2.45, 2.45],
  },
];

export default function AdminDashboard() {
  const { theme = "dark" } = useOutletContext() || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { authUser } = useSelector((state) => state.auth);
  const { users = [] } = useSelector((state) => state.admin || {});
  const [hovered, setHovered] = useState(null);
  const [openingPlate, setOpeningPlate] = useState(null);
  const navigationTimer = useRef(null);
  const [introOpen, setIntroOpen] = useState(
    () => !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);
  useEffect(() => () => window.clearTimeout(navigationTimer.current), []);
  const openPlate = (plate) => {
    if (openingPlate) return;
    if (reducedMotion) {
      navigate(plate.path);
      return;
    }
    setOpeningPlate(plate);
    navigationTimer.current = window.setTimeout(
      () => navigate(plate.path),
      2750,
    );
  };
  const students = users.filter(
    (user) => user.role?.toLowerCase() === "student",
  );
  const teachers = users.filter(
    (user) => user.role?.toLowerCase() === "teacher",
  );
  const assigned = students.filter((student) => student.supervisor).length;
  const metricData = [
    ["Student authors", students.length, GraduationCap],
    ["Faculty guides", teachers.length, UsersRound],
    ["Waiting for a guide", Math.max(0, students.length - assigned), Network],
  ];
  return (
    <main className="sketch-admin" data-theme={theme}>
      <div className="sketch-admin__scene" aria-hidden="true">
        <Suspense fallback={null}>
          <AdminSketchbookCanvas
            plates={plates}
            hovered={hovered}
            setHovered={setHovered}
            onSelect={openPlate}
          />
        </Suspense>
      </div>
      <header className="sketch-header">
        <Link className="sketch-brand" to="/admin">
          <span className="sketch-brand__mark">
            <BookOpen size={18} />
          </span>
          <span>
            FIELDNOTES <small>PROJECT OFFICE · VOL. 01</small>
          </span>
        </Link>
        <span className="sketch-header__center">
          A living record of ideas in progress
        </span>
        <button
          className="sketch-header__user"
          type="button"
          onClick={async () => {
            try {
              await dispatch(logout()).unwrap();
              navigate("/login", { replace: true });
            } catch {
              /* Keep the current workspace when sign out fails. */
            }
          }}
          title="Sign out"
        >
          <i /> {authUser?.name || "Administrator"}
          <LogOut size={14} />
        </button>
      </header>
      <section className="sketch-intro">
        <span className="sketch-kicker">
          <Compass size={13} /> THE ACADEMIC YEAR, IN MOTION
        </span>
        <h1>
          Every great project
          <br />
          begins with a <em>page.</em>
        </h1>
        <p>
          Welcome back, {authUser?.name?.split(" ")[0] || "Admin"}. Pick up the
          thread and keep good work moving.
        </p>
      </section>
      <nav className="sketch-index" aria-label="Workspace index">
        {plates.map((plate, i) => (
          <Link
            className={`sketch-index__item${hovered === i ? " is-active" : ""}`}
            key={plate.path}
            to={plate.path}
            onClick={(event) => {
              event.preventDefault();
              openPlate(plate);
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="sketch-index__number">{plate.icon}</span>
            <span>
              <b>{plate.title}</b>
              <small>{plate.note}</small>
            </span>
            <ArrowUpRight size={15} />
          </Link>
        ))}
      </nav>
      <section
        className="sketch-metrics"
        aria-label="Workspace directory summary"
      >
        {metricData.map(([label, value, Icon]) => (
          <div className="sketch-metric" key={label}>
            {createElement(Icon, { size: 15 })}
            <span>{label}</span>
            <b>{value.toLocaleString()}</b>
            <ArrowDownRight size={13} />
          </div>
        ))}
      </section>
      <footer className="sketch-footer">
        <span>
          PROJECT HUB <i /> ADMIN FIELDNOTES
        </span>
        <span>
          OPEN A PLATE TO CONTINUE <b>↗</b>
        </span>
      </footer>
      <div className="sketch-mobile-links">
        {plates.map((plate) => (
          <Link
            key={plate.path}
            to={plate.path}
            onClick={(event) => {
              event.preventDefault();
              openPlate(plate);
            }}
          >
            {plate.icon} · {plate.title}
          </Link>
        ))}
      </div>
      {openingPlate && (
        <div className="book-opening" role="status" aria-live="polite">
          <div className="book-opening__sky" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="book-opening__book">
            <span className="book-opening__cover" />
            <span className="book-opening__pages" />
            <span className="book-opening__scratch" />
          </div>
          <div className="book-opening__title">
            <small>OPENING FIELDNOTE {openingPlate.icon}</small>
            <strong>{openingPlate.title}</strong>
            <span>{openingPlate.note}</span>
          </div>
          <div className="book-opening__fire" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
      )}
      <AnimatePresence>
        {introOpen && (
          <AdminIntro
            key="admin-intro"
            onFinish={() => setIntroOpen(false)}
            reducedMotion={Boolean(reducedMotion)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

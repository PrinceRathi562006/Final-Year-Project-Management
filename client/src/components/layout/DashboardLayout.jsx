import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen, LogOut } from "lucide-react";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import { logout } from "../../store/slices/authSlice";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import AdminIntro from "../../pages/admin/AdminIntro";
import "./AdminWorkspaceFrame.css";
import "./AdminWorkspaceRedesign.css";

const WorkspaceScene = lazy(() => import("../../pages/admin/AdminWorkspaceScene"));
const adminNavigation = [
  { to: "/admin", label: "Home", end: true },
  { to: "/admin/students", label: "Students" },
  { to: "/admin/teachers", label: "Faculty" },
  { to: "/admin/assign-supervisor", label: "Mentor matches" },
];

const DashboardLayout = ({ userRole }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => window.localStorage.getItem("manage-students-theme") === "light" ? "light" : "dark");
  const location = useLocation();
  const isAdminLanding = userRole === "Admin" && location.pathname === "/admin";
  const isAdminWorkspace = userRole === "Admin" && /^\/admin\/(students|teachers|assign-supervisor)\/?$/.test(location.pathname);
  const useAdminFrame = isAdminLanding || isAdminWorkspace;
  const reducedMotion = useReducedMotion();
  const [workspaceIntroOpen, setWorkspaceIntroOpen] = useState(() => !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches && !/^\/admin\/?$/.test(window.location.pathname));
  const { authUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    window.localStorage.setItem("manage-students-theme", theme);
  }, [theme]);

  return (
    <div className={`min-h-screen bg-slate-50 ${isAdminLanding ? "admin-landing-shell" : isAdminWorkspace ? "admin-workspace-shell" : "pt-[66px]"}`} data-theme={theme}>
      {isAdminWorkspace && <header className="admin-workspace-header">
        <NavLink className="admin-workspace-brand" to="/admin"><span><BookOpen size={17} /></span> PROJECT OFFICE <small>FIELDNOTES · 2026</small></NavLink>
        <nav aria-label="Admin workspace">{adminNavigation.map((item) => <NavLink key={item.to} to={item.to} end={item.end}>{item.label}</NavLink>)}</nav>
        <div className="admin-workspace-account"><span>{authUser?.name || "Administrator"}</span><button type="button" onClick={async () => { try { await dispatch(logout()).unwrap(); navigate("/login", { replace: true }); } catch { /* Keep the current workspace when sign out fails. */ } }} title="Sign out" aria-label="Sign out"><LogOut size={16} /></button></div>
        <div className="admin-workspace-scene-stage" aria-hidden="true"><Suspense fallback={null}><WorkspaceScene mode="dashboard" /></Suspense></div>
      </header>}
      <AnimatePresence>{isAdminWorkspace && workspaceIntroOpen && <AdminIntro key="admin-workspace-intro" onFinish={() => setWorkspaceIntroOpen(false)} reducedMotion={Boolean(reducedMotion)} />}</AnimatePresence>
      {/* Navbar */}
      {!useAdminFrame && <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userRole={userRole}
      />}

      <div className={useAdminFrame ? "" : "flex"}>
        {/* Sidebar */}
        {!useAdminFrame && <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          userRole={userRole}
          theme={theme}
          onThemeToggle={() => setTheme((current) => current === "dark" ? "light" : "dark")}
        />}

        {/* Main Content */}
        <main
          className={isAdminLanding ? "admin-landing-main" : isAdminWorkspace ? "admin-workspace-main" : `min-w-0 flex-1 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}
        >
          <div className={useAdminFrame ? (isAdminLanding ? "admin-landing-page" : "admin-workspace-page") : "min-w-0 w-full p-6"}>
            <div className="app-page-transition" key={location.pathname}>
              <Outlet context={{ theme, setTheme }} />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;

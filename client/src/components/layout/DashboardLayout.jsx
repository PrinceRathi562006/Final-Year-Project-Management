import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen, LogOut } from "lucide-react";
import { logout } from "../../store/slices/authSlice";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "./AdminWorkspaceFrame.css";
import "./AdminWorkspaceRedesign.css";

const WorkspaceScene = lazy(() => import("../../pages/admin/AdminWorkspaceScene"));
const AdminScrollScene = lazy(() => import("../../pages/admin/AdminScrollScene"));
const adminNavigation = [
  { to: "/admin", label: "Home", end: true },
  { to: "/admin/students", label: "Students" },
  { to: "/admin/teachers", label: "Faculty" },
  { to: "/admin/projects", label: "Project atlas" },
  { to: "/admin/assign-supervisor", label: "Mentor matches" },
  { to: "/admin/deadlines", label: "Milestones" },
];

const DashboardLayout = ({ userRole }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => window.localStorage.getItem("manage-students-theme") === "light" ? "light" : "dark");
  const location = useLocation();
  const isAdminLanding = userRole === "Admin" && location.pathname === "/admin";
  const isAdminWorkspace = userRole === "Admin" && /^\/admin\/(students|teachers|assign-supervisor|projects|deadlines)\/?$/.test(location.pathname);
  const useAdminFrame = isAdminLanding || isAdminWorkspace;
  const { authUser } = useSelector((state) => state.auth);
  const activeTheme = userRole === "Admin" ? "light" : theme;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    window.localStorage.setItem("manage-students-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!useAdminFrame) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, useAdminFrame]);

  useEffect(() => {
    if (!isAdminWorkspace || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || !window.IntersectionObserver) return undefined;
    const root = document.querySelector(".admin-workspace-page");
    if (!root) return undefined;
    const selector = ".mt-row, .ms-row, .as-row, .ms-card, .mt-dot";
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove("is-depth-pending");
        entry.target.classList.add("is-depth-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -5% 0px" });
    const observeItems = (node) => {
      if (!(node instanceof Element)) return;
      if (node.matches(selector) && !node.dataset.depthObserved) {
        node.dataset.depthObserved = "true";
        node.classList.add("is-depth-pending");
        observer.observe(node);
      }
      node.querySelectorAll?.(selector).forEach((item) => {
        if (item.dataset.depthObserved) return;
        item.dataset.depthObserved = "true";
        item.classList.add("is-depth-pending");
        observer.observe(item);
      });
    };
    observeItems(root);
    const mutations = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach(observeItems)));
    mutations.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
      root.querySelectorAll(selector).forEach((item) => {
        if (!item.classList.contains("is-depth-visible")) delete item.dataset.depthObserved;
      });
    };
  }, [isAdminWorkspace, location.pathname]);

  return (
    <div className={`min-h-screen bg-slate-50 ${isAdminLanding ? "admin-landing-shell" : isAdminWorkspace ? "admin-workspace-shell" : "pt-[66px]"}`} data-theme={activeTheme}>
      {isAdminWorkspace && <div className="admin-scroll-scene" aria-hidden="true"><Suspense fallback={null}><AdminScrollScene /></Suspense></div>}
      {isAdminWorkspace && <header className="admin-workspace-header">
        <NavLink className="admin-workspace-brand" to="/admin"><span className="admin-workspace-brand__mark"><BookOpen size={17} /></span><span className="admin-workspace-brand__copy">PROJECT OFFICE<small>FIELDNOTES · 2026</small></span></NavLink>
        <nav aria-label="Admin workspace">{adminNavigation.map((item) => <NavLink key={item.to} to={item.to} end={item.end}>{item.label}</NavLink>)}</nav>
        <div className="admin-workspace-account"><span className="admin-workspace-avatar" aria-hidden="true">{(authUser?.name || "A").trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span><span>{authUser?.name || "Administrator"}</span><button type="button" onClick={async () => { try { await dispatch(logout()).unwrap(); navigate("/login", { replace: true }); } catch { /* Keep the current workspace when sign out fails. */ } }} title="Sign out" aria-label="Sign out"><LogOut size={16} /></button></div>
        <div className="admin-workspace-scene-stage" aria-hidden="true"><Suspense fallback={null}><WorkspaceScene mode="dashboard" /></Suspense></div>
      </header>}
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
            <Suspense fallback={<div className="route-loading route-loading--inline" role="status" aria-live="polite"><span className="route-loading__icon" aria-hidden="true" /><span>Opening this section…</span></div>}>
              <div className="app-page-transition" key={location.pathname}>
                <Outlet context={{ theme: activeTheme, setTheme }} />
              </div>
            </Suspense>
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

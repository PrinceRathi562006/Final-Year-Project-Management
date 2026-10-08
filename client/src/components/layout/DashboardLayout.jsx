import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ userRole }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => window.localStorage.getItem("manage-students-theme") === "light" ? "light" : "dark");
  const location = useLocation();

  useEffect(() => {
    window.localStorage.setItem("manage-students-theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-50 pt-[66px]" data-theme={theme}>
      {/* Navbar */}
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userRole={userRole}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          userRole={userRole}
          theme={theme}
          onThemeToggle={() => setTheme((current) => current === "dark" ? "light" : "dark")}
        />

        {/* Main Content */}
        <main
          className={`min-w-0 flex-1 transition-all duration-300 ${
            sidebarOpen ? "lg:ml-64" : "lg:ml-20"
          }`}
        >
          <div className="min-w-0 w-full p-6">
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

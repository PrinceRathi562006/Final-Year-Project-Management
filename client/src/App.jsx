import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";

// Auth Pages
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));

// Dashboard Layouts
import DashboardLayout from "./components/layout/DashboardLayout";

// Student Pages
// Teacher Pages
// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageStudents = lazy(() => import("./pages/admin/ManageStudents"));
const ManageTeachers = lazy(() => import("./pages/admin/ManageTeachers"));
const AssignSupervisor = lazy(() => import("./pages/admin/AssignSupervisor"));
const DeadlinesPage = lazy(() => import("./pages/admin/DeadlinesPage"));
const ProjectsPage = lazy(() => import("./pages/admin/ProjectsPage"));
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "./store/slices/authSlice";
import { ToastContainer } from "react-toastify";
import { Loader } from "lucide-react";
import BowArrowClickEffect from "./components/BowArrowClickEffect";
import { getAllUsers } from "./store/slices/adminSlice";

const App = () => {
  const { authUser, isCheckingAuth } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  // if user is already login then it will redirect to page based on role, user not have to login again. If token already exist in browser then user will login automatically till he will not logout.
  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if(authUser?.role === "Admin"){
      dispatch(getAllUsers());
    }
  });

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!authUser) {
      return <Navigate to="/login" replace />;
    }

    if (
      allowedRoles?.length &&
      authUser?.role &&
      !allowedRoles.includes(authUser.role)
    ) {
      const redirectPath =
        authUser.role === "Admin"
          ? "/admin"
          : authUser.role === "Teacher"
            ? "/teacher"
            : "/student";

            return <Navigate to={redirectPath} replace/>
    }

    return children;
  };

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <BowArrowClickEffect />
      <Suspense fallback={<div className="route-loading" role="status" aria-live="polite"><Loader className="route-loading__icon" aria-hidden="true" /><span>Opening workspace…</span></div>}>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/forgot-password" element={<ForgotPasswordPage />}></Route>
        <Route path="/reset-password" element={<ResetPasswordPage />}></Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <DashboardLayout userRole={"Admin"}/>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<ManageStudents/>} />
          <Route path="teachers" element={<ManageTeachers/>} />
          <Route path="assign-supervisor" element={<AssignSupervisor />} />
          <Route path="deadlines" element={<DeadlinesPage />} />
          <Route path="projects" element={<ProjectsPage />} />
        </Route>

      </Routes>
      </Suspense>
      <ToastContainer
        theme="dark"
        autoClose={2500}
        closeButton
        closeOnClick
        pauseOnFocusLoss={false}
      />
    </BrowserRouter>
  );
};

export default App;

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
const TeacherDashboard = lazy(() => import("./pages/teacher/TeacherDashboard"));
const PendingRequests = lazy(() => import("./pages/teacher/PendingRequests"));
const AssignedStudents = lazy(() => import("./pages/teacher/AssignedStudents"));
const TeacherFiles = lazy(() => import("./pages/teacher/TeacherFiles"));
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const SubmitProposal = lazy(() => import("./pages/student/SubmitProposal"));
const UploadFiles = lazy(() => import("./pages/student/UploadFiles"));
const SupervisorPage = lazy(() => import("./pages/student/SupervisorPage"));
const FeedbackPage = lazy(() => import("./pages/student/FeedbackPage"));
const NotificationsPage = lazy(() => import("./pages/student/NotificationsPage"));
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "./store/slices/authSlice";
import { ToastContainer } from "react-toastify";
import { Loader } from "lucide-react";
import BowArrowClickEffect from "./components/BowArrowClickEffect";
import { getAllUsers } from "./store/slices/adminSlice";

const getDashboardPath = (role) => {
  switch (role) {
    case "Admin": return "/admin";
    case "Teacher": return "/teacher";
    case "Student": return "/student";
    default: return "/login";
  }
};

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
  }, [authUser?.role, dispatch]);

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!authUser) {
      return <Navigate to="/login" replace />;
    }

    if (
      allowedRoles?.length &&
      authUser?.role &&
      !allowedRoles.includes(authUser.role)
    ) {
      return <Navigate to={getDashboardPath(authUser.role)} replace />;
    }

    return children;
  };

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <BowArrowClickEffect />
      <Suspense fallback={<div className="route-loading" role="status" aria-live="polite"><Loader className="route-loading__icon" aria-hidden="true" /><span>Opening workspace…</span></div>}>
      <Routes>
        <Route path="/" element={<Navigate to={authUser ? getDashboardPath(authUser.role) : "/login"} replace />} />

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

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["Teacher"]}>
              <DashboardLayout userRole="Teacher" />
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherDashboard />} />
          <Route path="requests" element={<PendingRequests />} />
          <Route path="students" element={<AssignedStudents />} />
          <Route path="files" element={<TeacherFiles />} />
        </Route>

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <DashboardLayout userRole="Student" />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="submit-proposal" element={<SubmitProposal />} />
          <Route path="upload-files" element={<UploadFiles />} />
          <Route path="supervisor" element={<SupervisorPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        <Route path="*" element={<Navigate to={authUser ? getDashboardPath(authUser.role) : "/login"} replace />} />

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

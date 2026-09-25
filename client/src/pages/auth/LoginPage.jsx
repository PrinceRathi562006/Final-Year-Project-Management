import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// import { use } from "react";
import { BookOpen, Eye, EyeOff, Loader, Mail, ShieldCheck, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { login } from "../../store/slices/authSlice";
import "./AuthPages.css";

const LoginPage = () => {
  const dispatch = useDispatch();

  const { isLoggingIn, authUser } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Student",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data = new FormData();

    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("role", formData.role);

    dispatch(login(formData));
  };

  useEffect(() => {
    if (authUser) {
      switch (authUser.role) {
        case "Student":
          navigate("/student");
          break;

        case "Teacher":
          navigate("/teacher");
          break;

        case "Admin":
          navigate("/admin");
          break;

        default:
          navigate("/login");
      }
    }
  }, [authUser, navigate]);

  return (
    <main className="auth-page auth-page--login min-h-screen px-4">
      <div className="auth-page__ambient auth-page__ambient--one" />
      <div className="auth-page__ambient auth-page__ambient--two" />
      <div className="auth-shell">
        <aside className="auth-context-panel" aria-hidden="true">
          <div className="auth-context-panel__brand">
            <span className="auth-context-panel__brand-mark"><BookOpen /></span>
            <span>Educational Project Management</span>
          </div>
          <div className="auth-context-panel__content">
            <span className="auth-context-panel__eyebrow">Academic workspace</span>
            <h2>Every great project starts with a clear path.</h2>
            <p>Bring students, faculty, and final-year work together in one focused workspace.</p>
          </div>
          <div className="auth-context-panel__signals">
            <span><UsersRound /> Connected teams</span>
            <span><ShieldCheck /> Secure access</span>
          </div>
          <div className="auth-context-panel__grid" />
        </aside>
        <div className="auth-form-wrap max-w-md w-full">
          {/* Header */}
          <div className="auth-page__header text-center mb-8">
            <div className="auth-page__icon inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <span className="auth-page__kicker">Welcome back</span>
            <h1 className="text-2xl font-bold text-slate-800">
              Educational Project Management
            </h1>
            <p className="text-slate-600 mt-2">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <div className="auth-card card">
            <form onSubmit={handleSubmit} className="auth-form space-y-6">
              {errors.general && (
                <div className="auth-alert p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="auth-label label">Select Role</label>
                <div className="auth-select-wrap">
                  <UsersRound aria-hidden="true" />
                  <select
                  className="auth-input auth-select input"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                </select>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="auth-label label">Email Address</label>
                <div className="auth-input-wrap">
                  <Mail aria-hidden="true" />
                  <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`auth-input input border-b border-slate-600 focus:outline-none ${errors.email ? "input-error" : ""}`}
                  placeholder="Enter your email"
                />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="auth-label label">Password</label>
                <div className="auth-input-wrap relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`auth-input input border-b border-slate-600 pr-10 focus:outline-none ${errors.password ? "input-error" : ""}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-password-toggle absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="auth-page__link-row text-right">
                <Link
                  to={"/forgot-password"}
                  className="auth-text-link text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot your Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={isLoggingIn} className="auth-submit w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                {
                  isLoggingIn ? (
                    <div className="flex justify-center items-center">
                      <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"/>
                      Signing in...
                    </div>
                  ) : "Sign In"
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;

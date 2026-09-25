import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, KeyRound, Loader, ShieldCheck } from "lucide-react";
import { resetPassword } from "../../store/slices/authSlice";
import "./AuthPages.css";

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Anchor: Fetch reset password token include in link

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { isUpdatingPassword } = useSelector((state) => state.auth);
  const token = searchParams.get("token");

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

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password and Confirm do not match!...";
    }

    // Token validation
    if (!token) {
      newErrors.general = "Invalid or missing password reset token.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(
        resetPassword({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      ).unwrap();

      navigate("/login");
    } catch (error) {
      setErrors({
        general: error || "Failed to reset Password. Please try again.",
      });
    }
  };

  return (
    <main className="auth-page auth-page--reset min-h-screen px-4">
      <div className="auth-page__ambient auth-page__ambient--one" />
      <div className="auth-page__ambient auth-page__ambient--two" />
      <div className="auth-compact-shell max-w-md w-full">
          {/* Header */}
          <div className="auth-page__header text-center mb-8">
            <div className="auth-page__icon inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <span className="auth-page__kicker">Account recovery &middot; Step 2 of 2</span>
            <h1 className="text-2xl font-bold text-slate-800">
              Reset Password
            </h1>
            <p className="text-slate-600 mt-2">
              Enter your new Password below.
            </p>
          </div>

          {/* Reset Password Form */}
          <div className="auth-card card">
            <div className="auth-security-note"><ShieldCheck aria-hidden="true" /> Choose a secure password you do not use elsewhere.</div>
            <form onSubmit={handleSubmit} className="auth-form space-y-6">
              {errors.general && (
                <div className="auth-alert p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="auth-label label">New Password</label>
                <div className="auth-input-wrap relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`auth-input input border-b border-slate-600 pr-10 focus:outline-none ${errors.password ? "input-error" : ""}`}
                    placeholder="Enter new password"
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

              {/* Confirm Password */}
              <div>
                <label className="auth-label label">Confirm Password</label>
                <div className="auth-input-wrap relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`auth-input input border-b border-slate-600 pr-10 focus:outline-none ${errors.confirmPassword ? "input-error" : ""}`}
                    placeholder="Enter your Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="auth-password-toggle absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="auth-submit w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingPassword ? (
                  <div className="flex justify-center items-center">
                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Resetting...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>

            <div className="auth-page__return mt-6 text-center">
              <p className="text-sm text-slate-600">
                Remember your Password?{" "}
                <Link
                  to={"/login"}
                  className="auth-text-link text-blue-600 hover:text-blue-500 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
      </div>
    </main>
  );
};

export default ResetPasswordPage;

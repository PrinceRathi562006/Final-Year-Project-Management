import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle2, KeyRound, Loader, Mail } from "lucide-react";
import { forgotPassword } from "../../store/slices/authSlice"
import "./AuthPages.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState("");
  const [error, setError] = useState("");
  const {isRequestingForToken} = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email is invalid");
      return;
    }

    setError("");

    try {
      await dispatch(forgotPassword({ email })).unwrap();
      setIsSubmitted(true);
    } catch (error) {
      setError(error || "Failed to send reset link. Please try again.");
    }
  };

  if (isSubmitted) {
    return (
      <main className="auth-page auth-page--recovery min-h-screen px-4">
        <div className="auth-page__ambient auth-page__ambient--one" />
        <div className="auth-page__ambient auth-page__ambient--two" />
        <div className="auth-compact-shell max-w-md w-full">
          <div className="text-center mb-8">
            <div className="auth-page__icon auth-page__icon--success inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>

            <span className="auth-page__kicker">Recovery request received</span>
            <h1 className="text-2xl font-bold text-slate-800 mt-4">
              Check Your Email
            </h1>

            <p className="text-slate-600 mt-2">
              We've sent a password reset link to your email address.
            </p>
          </div>

          {/* Card */}
          <div className="auth-card auth-card--success card bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="text-center">
              <p className="text-slate-700 mb-4">
                If an account with <strong>{email}</strong> exists, you will
                receive a password reset email shortly.
              </p>

              <div className="space-y-3">
                <Link
                  to="/login"
                  className="auth-submit w-full btn-primary inline-block text-center"
                >
                  Back to Login
                </Link>

                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  className="auth-secondary-action w-full btn-outline"
                >
                  Send Another Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page auth-page--recovery min-h-screen px-4">
      <div className="auth-page__ambient auth-page__ambient--one" />
      <div className="auth-page__ambient auth-page__ambient--two" />
      <div className="auth-compact-shell max-w-md w-full">
          {/* Header */}
          <div className="auth-page__header text-center mb-8">
            <div className="auth-page__icon inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <span className="auth-page__kicker">Account recovery &middot; Step 1 of 2</span>
            <h1 className="text-2xl font-bold text-slate-800">
              Forgot Password?
            </h1>
            <p className="text-slate-600 mt-2">Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          {/* Forgot Password Form */}
          <div className="auth-card card">
            <form onSubmit={handleSubmit} className="auth-form space-y-6">
              {error && (
                <div className="auth-alert p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="auth-label label">Email Address</label>
                <div className="auth-input-wrap">
                  <Mail aria-hidden="true" />
                  <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if(error) setError("");
                  }}
                  className={`auth-input input border-b border-slate-600 focus:outline-none ${error ? "input-error" : ""}`}
                  placeholder="Enter your email"
                  disabled={isRequestingForToken}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isRequestingForToken}
                className="auth-submit w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRequestingForToken ? (
                  <div className="flex justify-center items-center">
                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Sending...
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <div className="auth-page__return mt-6 text-center">
                <p className="text-sm text-slate-600">
                  Remember your Password?  <Link
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

export default ForgotPasswordPage;

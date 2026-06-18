import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  MailCheck,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
} from "../services/authService";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [message]);

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
  };

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      showMessage("Please enter your registered email.", "error");
      return;
    }

    try {
      setLoading(true);
      clearMessage();

      await sendForgotPasswordOtp(email);

      setOtpSent(true);
      setOtpVerified(false);
      showMessage("Password reset OTP sent successfully.", "success");
    } catch (error) {
      console.error(error);

      showMessage(
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to send OTP.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      showMessage("Please enter OTP.", "error");
      return;
    }

    try {
      setLoading(true);
      clearMessage();

      await verifyForgotPasswordOtp(email, otp);

      setOtpVerified(true);
      showMessage("OTP verified successfully.", "success");
    } catch (error) {
      console.error(error);

      showMessage(
        error.response?.data?.message ||
        error.response?.data ||
        "OTP verification failed.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      showMessage("Please verify OTP first.", "error");
      return;
    }

    if (!newPassword.trim()) {
      showMessage("Please enter your new password.", "error");
      return;
    }

    try {
      setLoading(true);
      clearMessage();

      await resetPassword({
        email,
        newPassword,
      });

      showMessage("Password reset successfully. Redirecting to login...", "success");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error(error);

      showMessage(
        error.response?.data?.message ||
        error.response?.data ||
        "Password reset failed.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-5 sm:px-8 py-7 sm:py-8 text-center">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <ShieldCheck className="text-white" size={34} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              FraudShield
            </h1>

            <p className="text-slate-300 mt-2 text-xs sm:text-sm">
              Secure password recovery for your banking account
            </p>
          </div>

          <div className="p-5 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Forgot Password
              </h2>

              <p className="text-slate-500 mt-1 text-sm">
                Verify your registered email and reset your password safely.
              </p>
            </div>

            {message && (
              <div
                className={`mb-5 rounded-xl p-4 text-sm font-medium ${messageType === "success"
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                  }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Registered Email
                </label>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="Enter registered email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setOtpSent(false);
                      setOtpVerified(false);
                      setOtp("");
                      setNewPassword("");
                      clearMessage();
                    }}
                    disabled={otpVerified}
                    className="flex-1 border border-slate-300 rounded-xl p-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 disabled:bg-slate-100"
                    required
                  />

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || otpVerified}
                    className="px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading && !otpSent
                      ? "Sending..."
                      : otpVerified
                        ? "Verified"
                        : "Send OTP"}
                  </button>
                </div>
              </div>

              {otpSent && !otpVerified && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email OTP
                  </label>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value);
                        clearMessage();
                      }}
                      className="flex-1 border border-slate-300 rounded-xl p-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />

                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={loading}
                      className="px-4 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                </div>
              )}

              {otpVerified && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700 flex items-start gap-3">
                  <MailCheck size={20} className="shrink-0 mt-0.5" />
                  <span>OTP verified successfully. Create your new password.</span>
                </div>
              )}

              {otpVerified && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    New Password
                  </label>

                  <div className="relative">
                    <KeyRound
                      size={18}
                      className="absolute left-3 top-3.5 text-slate-400"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        clearMessage();
                      }}
                      className="w-full border border-slate-300 rounded-xl p-3 pl-10 pr-12 text-sm sm:text-base outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !otpVerified}
                className="w-full bg-slate-900 text-white rounded-xl p-3 font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Remember password?{" "}
              <Link
                to="/login"
                className="font-semibold text-slate-900 hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Protected password recovery by FraudShield Security
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
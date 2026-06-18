import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  MailCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { registerUser, sendOtp, verifyOtp } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    clearMessage();

    if (e.target.name === "email") {
      setOtp("");
      setOtpSent(false);
      setOtpVerified(false);
    }
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    clearMessage();
  };

  const handleSendOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      showMessage("Please enter your registered email first.", "error");
      return;
    }

    if (!emailRegex.test(formData.email)) {
      showMessage("Please enter a valid email address.", "error");

      setFormData((prev) => ({
        ...prev,
        email: "",
      }));

      setOtp("");
      setOtpSent(false);
      setOtpVerified(false);
      return;
    }

    try {
      setOtpLoading(true);
      clearMessage();

      await sendOtp(formData.email);

      setOtpSent(true);
      setOtpVerified(false);

      showMessage("OTP sent successfully. Please check your email.", "success");
    } catch (error) {
      console.error(error);

      showMessage(
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to send OTP.",
        "error"
      );

      setOtp("");
      setOtpSent(false);
      setOtpVerified(false);

      setFormData((prev) => ({
        ...prev,
        email: "",
      }));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      showMessage("Please enter the OTP sent to your email.", "error");
      return;
    }

    try {
      setVerifyLoading(true);
      clearMessage();

      await verifyOtp(formData.email, otp);

      setOtpVerified(true);
      showMessage("Email verified successfully.", "success");
    } catch (error) {
      console.error(error);
      setOtpVerified(false);

      showMessage(
        error.response?.data?.message ||
        error.response?.data ||
        "OTP verification failed.",
        "error"
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      showMessage("Please verify your email with OTP before registration.", "error");
      return;
    }

    try {
      setLoading(true);
      clearMessage();

      await registerUser(formData);

      showMessage("Registration successful. Redirecting to login...", "success");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error(error);

      showMessage(
        error.response?.data?.message ||
        error.response?.data ||
        "Registration failed.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-8 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <ShieldCheck className="text-white" size={34} />
            </div>

            <h1 className="text-3xl font-bold text-white">FraudShield</h1>

            <p className="text-slate-300 mt-2 text-sm">
              Secure banking login access registration
            </p>
          </div>

          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Create Login Access
              </h2>

              <p className="text-slate-500 mt-1 text-sm">
                Verify your registered bank email before creating access.
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

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Registered Email
                </label>

                <div className="flex gap-2">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter registered email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={otpVerified}
                    className="flex-1 border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 disabled:bg-slate-100"
                    required
                  />

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || otpVerified}
                    className="px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {otpLoading
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

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={handleOtpChange}
                      className="flex-1 border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />

                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyLoading}
                      className="px-4 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {verifyLoading ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                </div>
              )}

              {otpVerified && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700 flex items-start gap-3">
                  <MailCheck size={20} />
                  <span>Email verified successfully. You can now register.</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Create Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create secure password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl p-3 pr-12 outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !otpVerified}
                className="w-full bg-slate-900 text-white rounded-xl p-3 font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Access..." : "Create Secure Login"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have login access?{" "}
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
          Registration allowed only for bank-created accounts
        </p>
      </div>
    </div>
  );
}

export default Register;
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
    setMessageType("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setMessageType("");

      const data = await loginUser(formData);

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("email", data.email);
      sessionStorage.setItem("role", data.role);

      sessionStorage.setItem(
        "fullName",
        data.fullName || data.name || data.email
      );

      navigate("/");
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Invalid email or password.");
      setMessageType("error");
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
              Secure banking fraud monitoring system
            </p>
          </div>

          <div className="p-5 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Welcome back
              </h2>

              <p className="text-slate-500 mt-1 text-sm">
                Secure access to your FraudShield banking dashboard.
              </p>
            </div>

            {message && (
              <div
                className={`mb-5 rounded-xl p-4 text-sm font-medium ${
                  messageType === "success"
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter registered email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  required
                />
              </div>

              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-slate-900 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white rounded-xl p-3 font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Login Securely"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Don't have login access?{" "}
              <Link
                to="/register"
                className="font-semibold text-slate-900 hover:underline"
              >
                Register
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Protected by FraudShield Banking Security
        </p>
      </div>
    </div>
  );
}

export default Login;
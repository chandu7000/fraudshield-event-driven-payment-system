import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Shield,
  CreditCard,
  CheckCircle,
  Lock,
} from "lucide-react";
import { getProfile, changePassword } from "../services/profileService";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);

  const loadProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("New password and confirm password do not match.");
      setMessageType("error");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setMessage("Password changed successfully. Redirecting to login...");
      setMessageType("success");

      setTimeout(() => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("email");
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("fullName");

        window.location.replace("/login");
      }, 2500);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Password change failed.");
      setMessageType("error");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        Loading profile...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-2">
          View your account information and manage your password.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="bg-slate-900 text-white p-8">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-full">
              <User size={40} />
            </div>

            <div>
              <h2 className="text-2xl font-bold">{profile?.fullName}</h2>
              <p className="text-slate-300">{profile?.role}</p>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <User size={20} />
              <h3 className="font-semibold">Full Name</h3>
            </div>
            <p className="text-slate-600">{profile?.fullName}</p>
          </div>

          <div className="border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Mail size={20} />
              <h3 className="font-semibold">Email</h3>
            </div>
            <p className="text-slate-600">{profile?.email}</p>
          </div>

          <div className="border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Shield size={20} />
              <h3 className="font-semibold">Role</h3>
            </div>
            <p className="text-slate-600">{profile?.role}</p>
          </div>

          <div className="border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard size={20} />
              <h3 className="font-semibold">Account Number</h3>
            </div>
            <p className="text-slate-600">{profile?.accountNumber}</p>
          </div>

          <div className="border rounded-xl p-5 md:col-span-2">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle size={20} />
              <h3 className="font-semibold">Account Status</h3>
            </div>

            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700">
              {profile?.accountStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-3 rounded-xl">
              <Lock size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">Security</h2>
              <p className="text-sm text-slate-500">
                Manage your account password
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="
                bg-slate-900
                text-white
                px-4
                py-2
                sm:px-5
                sm:py-3
                rounded-xl
                hover:bg-slate-800
                text-sm
                sm:text-base
                font-medium
                whitespace-nowrap
              "
          >
            {showChangePassword ? "Hide Password Form" : "Change Password"}
          </button>
        </div>
      </div>

      {showChangePassword && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-slate-100 p-3 rounded-xl">
              <Lock size={22} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Change Password
            </h2>
          </div>

          <form
            onSubmit={handleChangePassword}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900"
              required
            />

            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900"
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900"
              required
            />

            {message && (
              <div
                className={`md:col-span-3 rounded-xl p-4 text-sm font-medium ${messageType === "success"
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-red-100 text-red-700 border border-red-200"
                  }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="md:col-span-3 bg-slate-900 text-white rounded-xl p-3 hover:bg-slate-800"
            >
              Update Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Profile;
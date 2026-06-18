import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  ShieldAlert,
  ClipboardList,
  Bell,
  User,
  UserPlus,
  LogOut,
  UserCog,
  BarChart3,
} from "lucide-react";

function Sidebar({ onNavigate }) {
  const navigate = useNavigate();

  const role = sessionStorage.getItem("role");
  const name =
    sessionStorage.getItem("fullName") || sessionStorage.getItem("email");

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");

    if (!confirmLogout) return;

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("fullName");
    sessionStorage.removeItem("role");

    if (onNavigate) {
      onNavigate();
    }

    navigate("/login");
  };

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const linkClass =
    "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition text-sm font-medium";

  return (
    <aside className="w-72 h-full bg-slate-950 text-white flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-800 shrink-0">
        <h1 className="text-2xl font-bold">FraudShield</h1>
        <p className="text-sm text-slate-400 mt-1">Payment Fraud System</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <Link onClick={handleNavigate} className={linkClass} to="/">
          <LayoutDashboard size={20} className="shrink-0" />
          <span className="truncate">
            {role === "ADMIN" ? "Admin Dashboard" : "Dashboard"}
          </span>
        </Link>

        <Link onClick={handleNavigate} className={linkClass} to="/accounts">
          <Users size={20} className="shrink-0" />
          <span className="truncate">
            {role === "ADMIN" ? "Accounts Management" : "My Accounts"}
          </span>
        </Link>

        {role === "ADMIN" && (
          <Link onClick={handleNavigate} className={linkClass} to="/users">
            <UserCog size={20} className="shrink-0" />
            <span className="truncate">Users Management</span>
          </Link>
        )}

        <Link onClick={handleNavigate} className={linkClass} to="/transactions">
          <ArrowLeftRight size={20} className="shrink-0" />
          <span className="truncate">
            {role === "ADMIN" ? "Transactions Management" : "My Transactions"}
          </span>
        </Link>

        <Link onClick={handleNavigate} className={linkClass} to="/notifications">
          <Bell size={20} className="shrink-0" />
          <span className="truncate">Notifications</span>
        </Link>

        {role !== "ADMIN" && (
          <Link onClick={handleNavigate} className={linkClass} to="/beneficiaries">
            <UserPlus size={20} className="shrink-0" />
            <span className="truncate">Beneficiaries</span>
          </Link>
        )}

        <Link onClick={handleNavigate} className={linkClass} to="/profile">
          <User size={20} className="shrink-0" />
          <span className="truncate">Profile</span>
        </Link>

        {role === "ADMIN" && (
          <>
            <Link onClick={handleNavigate} className={linkClass} to="/fraud-alerts">
              <ShieldAlert size={20} className="shrink-0" />
              <span className="truncate">Fraud Alerts</span>
            </Link>

            <Link onClick={handleNavigate} className={linkClass} to="/audit-logs">
              <ClipboardList size={20} className="shrink-0" />
              <span className="truncate">Audit Logs</span>
            </Link>

            <Link onClick={handleNavigate} className={linkClass} to="/reports">
              <BarChart3 size={20} className="shrink-0" />
              <span className="truncate">Reports & Analytics</span>
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
        <div className="mb-4">
          <p className="font-semibold break-words text-sm">{name}</p>
          <p className="text-sm text-slate-400">{role}</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-400 hover:text-red-300 transition text-sm font-medium"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
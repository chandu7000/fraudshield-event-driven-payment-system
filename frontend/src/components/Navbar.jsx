import { Bell, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Navbar() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const response = await api.get("/api/notifications/my/unread");
      setUnreadCount(response.data.length);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="min-h-16 sm:min-h-20 bg-white border-b border-slate-200 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3">
      <div className="min-w-0">
        <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-slate-900 truncate">
          Payment Fraud Dashboard
        </h2>

        <p className="hidden sm:block text-xs lg:text-sm text-slate-500 truncate">
          Monitor accounts, transactions, and fraud alerts
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button
          onClick={() => navigate("/notifications")}
          className="relative p-2 sm:p-3 rounded-xl bg-slate-100 hover:bg-slate-200"
        >
          <Bell size={20} />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-5 px-1 rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-3 lg:px-4 py-2 rounded-xl">
          <ShieldCheck size={20} className="text-emerald-600" />

          <span className="text-xs lg:text-sm font-semibold text-emerald-700">
            Secured
          </span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
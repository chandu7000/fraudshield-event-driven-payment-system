import { useEffect, useState } from "react";
import { Bell, CheckCircle } from "lucide-react";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../services/notificationService";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const loadNotifications = async () => {
    try {
      const response = await getMyNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load notifications.");
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      await loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
        <p className="text-slate-500 mt-2">
          View your latest banking and transaction alerts.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 bg-red-100 text-red-700 border border-red-200 p-4 rounded-xl">
          {errorMessage}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="bg-red-100 text-red-600 p-3 rounded-xl">
            <Bell size={22} />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            My Notifications
          </h2>
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No notifications found.
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-5 flex items-start justify-between gap-4 ${
                  notification.readStatus ? "bg-white" : "bg-blue-50"
                }`}
              >
                <div>
                  <h3 className="font-bold text-slate-900">
                    {notification.title}
                  </h3>

                  <p className="text-slate-600 mt-1">
                    {notification.message}
                  </p>

                  <p className="text-xs text-slate-400 mt-2">
                    {notification.createdAt}
                  </p>
                </div>

                {!notification.readStatus && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    <CheckCircle size={18} />
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
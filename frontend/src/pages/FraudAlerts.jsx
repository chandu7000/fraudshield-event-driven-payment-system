import { useEffect, useState } from "react";
import { ShieldAlert, Search, CheckCircle } from "lucide-react";
import {
  getAllFraudAlerts,
  resolveFraudAlert,
} from "../services/fraudAlertService";

function FraudAlerts() {
  const role = sessionStorage.getItem("role");

  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadFraudAlerts = async () => {
    try {
      const response = await getAllFraudAlerts();

      const sortedAlerts = [...response.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setAlerts(sortedAlerts);
      setErrorMessage("");
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load fraud alerts.");
    }
  };

  useEffect(() => {
    loadFraudAlerts();
  }, []);

  const handleResolve = async (alertId) => {
    try {
      await resolveFraudAlert(alertId);
      setMessage("Fraud alert resolved successfully.");
      setErrorMessage("");
      await loadFraudAlerts();
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to resolve fraud alert.");
      setMessage("");
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const search = searchTerm.toLowerCase();

    return (
      alert.accountNumber?.toLowerCase().includes(search) ||
      String(alert.transactionId || "").includes(search) ||
      alert.alertReason?.toLowerCase().includes(search) ||
      alert.severity?.toLowerCase().includes(search) ||
      alert.status?.toLowerCase().includes(search)
    );
  });

  const highSeverityCount = filteredAlerts.filter(
    (alert) => alert.severity === "HIGH" || alert.severity === "CRITICAL"
  ).length;

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Fraud Alerts
        </h1>

        <p className="text-sm sm:text-base text-slate-500 mt-2">
          Monitor suspicious transactions and fraud detection results.
        </p>
      </div>

      {message && (
        <div className="mb-4 bg-emerald-100 text-emerald-700 border border-emerald-200 p-4 rounded-xl text-sm">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 bg-red-100 text-red-700 border border-red-200 p-4 rounded-xl text-sm">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <p className="text-sm text-slate-500">Showing Fraud Alerts</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {filteredAlerts.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <p className="text-sm text-slate-500">High / Critical Alerts</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mt-2">
            {highSeverityCount}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 text-red-600 p-3 rounded-xl shrink-0">
              <ShieldAlert size={22} />
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Fraud Alert List
            </h2>
          </div>

          <div className="relative w-full md:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search fraud alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-sm sm:text-base outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4 text-sm text-slate-500">
                  Account
                </th>
                <th className="text-left p-4 text-sm text-slate-500">
                  Transaction ID
                </th>
                <th className="text-left p-4 text-sm text-slate-500">
                  Reason
                </th>
                <th className="text-left p-4 text-sm text-slate-500">
                  Severity
                </th>
                <th className="text-left p-4 text-sm text-slate-500">
                  Status
                </th>
                <th className="text-left p-4 text-sm text-slate-500">
                  Created At
                </th>
                {role === "ADMIN" && (
                  <th className="text-left p-4 text-sm text-slate-500">
                    Action
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td
                    colSpan={role === "ADMIN" ? "7" : "6"}
                    className="p-8 text-center text-slate-500"
                  >
                    No matching fraud alerts found.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="border-t hover:bg-slate-50">
                    <td className="p-4 text-slate-700 whitespace-nowrap">
                      {alert.accountNumber}
                    </td>

                    <td className="p-4 text-slate-700 whitespace-nowrap">
                      {alert.transactionId}
                    </td>

                    <td className="p-4 text-slate-700 min-w-[260px]">
                      {alert.alertReason}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${alert.severity === "CRITICAL"
                            ? "bg-red-200 text-red-800"
                            : alert.severity === "HIGH"
                              ? "bg-red-100 text-red-700"
                              : alert.severity === "MEDIUM"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {alert.severity}
                      </span>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${alert.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {alert.status}
                      </span>
                    </td>

                    <td className="p-4 text-slate-500 text-sm whitespace-nowrap">
                      {alert.createdAt}
                    </td>

                    {role === "ADMIN" && (
                      <td className="p-4 whitespace-nowrap">
                        {alert.status === "OPEN" ? (
                          <button
                            type="button"
                            onClick={() => handleResolve(alert.id)}
                            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 text-sm font-semibold"
                          >
                            <CheckCircle size={16} />
                            Resolve
                          </button>
                        ) : (
                          <span className="text-sm text-slate-400">
                            Completed
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="block sm:hidden px-4 py-3 bg-slate-50 border-t">
          <p className="text-xs text-slate-500">
            Swipe left/right to view full fraud alert details and resolve button.
          </p>
        </div>
      </div>
    </div>
  );
}

export default FraudAlerts;
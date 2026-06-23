import { useEffect, useState } from "react";
import { ClipboardList, Search } from "lucide-react";
import { getAllAuditLogs } from "../services/auditService";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadAuditLogs = async () => {
    try {
      const response = await getAllAuditLogs();

      const sortedLogs = [...response.data].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setLogs(sortedLogs);
      setErrorMessage("");
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load audit logs.");
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const search = searchTerm.toLowerCase();

    return (
      log.action?.toLowerCase().includes(search) ||
      log.email?.toLowerCase().includes(search) ||
      log.details?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Audit Logs
        </h1>

        <p className="text-sm sm:text-base text-slate-500 mt-2">
          Track user activity, money transfers, and fraud events.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 bg-red-100 text-red-700 border border-red-200 p-4 rounded-xl text-sm">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <p className="text-sm text-slate-500">Showing Audit Logs</p>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {filteredLogs.length}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 text-slate-700 p-3 rounded-xl shrink-0">
              <ClipboardList size={22} />
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Audit History
            </h2>
          </div>

          <div className="relative w-full md:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search audit logs..."
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
                  Action
                </th>
                <th className="text-left p-4 text-sm text-slate-500">
                  Email
                </th>
                <th className="text-left p-4 text-sm text-slate-500">
                  Details
                </th>
                <th className="text-left p-4 text-sm text-slate-500">
                  Time
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    No matching audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-t hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-900 whitespace-nowrap">
                      {log.action}
                    </td>

                    <td className="p-4 text-slate-700 whitespace-nowrap">
                      {log.email}
                    </td>

                    <td className="p-4 text-slate-600 min-w-[380px]">
                      {log.details}
                    </td>

                    <td className="p-4 text-slate-500 text-sm whitespace-nowrap">
                      {log.timestamp}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="block sm:hidden px-4 py-3 bg-slate-50 border-t">
          <p className="text-xs text-slate-500">
            Swipe left/right to view full audit log details.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuditLogs;
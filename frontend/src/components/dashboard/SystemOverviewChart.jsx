import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

function SystemOverviewChart({ stats }) {
  const data = [
    {
      name: "Accounts",
      value: stats.totalAccounts,
      color: "#2563eb",
    },
    {
      name: "Transactions",
      value: stats.totalTransactions,
      color: "#7c3aed",
    },
    {
      name: "Fraud Alerts",
      value: stats.fraudAlerts,
      color: "#dc2626",
    },
    {
      name: "Audit Logs",
      value: stats.auditLogs,
      color: "#f97316",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold text-slate-900 mb-4">
        System Overview
      </h2>

      <div className="h-72 sm:h-80 overflow-x-auto">
        <div className="min-w-[420px] h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default SystemOverviewChart;
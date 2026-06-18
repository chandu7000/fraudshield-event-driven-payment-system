import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function RiskDistributionChart({ stats }) {
  const safeTransactions = Math.max(
    stats.totalTransactions - stats.fraudAlerts,
    0
  );

  const data = [
    {
      name: "Safe Transactions",
      value: safeTransactions,
      color: "#16a34a",
    },
    {
      name: "Fraud Alerts",
      value: stats.fraudAlerts,
      color: "#dc2626",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold text-slate-900 mb-4">
        Risk Distribution
      </h2>

      <div className="h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              innerRadius={55}
              paddingAngle={4}
              label
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RiskDistributionChart;
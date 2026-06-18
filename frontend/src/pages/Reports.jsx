import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Calendar,
  IndianRupee,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Users,
  UserCheck,
  Lock,
  ShieldX,
  FileText,
  Download,
} from "lucide-react";

import html2pdf from "html2pdf.js";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import {
  getTransactionSummaryReport,
  getFraudAnalyticsReport,
  getAccountAnalyticsReport,
  getMonthlyTransactionTrend,
} from "../services/reportService";

function Reports() {
  const [transactionReport, setTransactionReport] = useState(null);
  const [fraudReport, setFraudReport] = useState(null);
  const [accountReport, setAccountReport] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  const reportRef = useRef();

  const loadReports = async () => {
    try {
      const [transactionData, fraudData, accountData, trendData] =
        await Promise.all([
          getTransactionSummaryReport(),
          getFraudAnalyticsReport(),
          getAccountAnalyticsReport(),
          getMonthlyTransactionTrend(),
        ]);

      setTransactionReport(transactionData);
      setFraudReport(fraudData);
      setAccountReport(accountData);
      setMonthlyTrend(trendData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const formatMoney = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const fraudSeverityData = [
    { name: "High Severity", value: fraudReport?.highSeverityAlerts || 0 },
    { name: "Medium Severity", value: fraudReport?.mediumSeverityAlerts || 0 },
    { name: "Open Alerts", value: fraudReport?.openAlerts || 0 },
    { name: "Resolved Alerts", value: fraudReport?.resolvedAlerts || 0 },
  ];

  const fraudColors = ["#dc2626", "#f59e0b", "#2563eb", "#22c55e"];

  const hasFraudChartData = fraudSeverityData.some((item) => item.value > 0);

  const downloadCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Accounts", accountReport?.totalAccounts ?? 0],
      ["Active Accounts", accountReport?.activeAccounts ?? 0],
      ["Frozen Accounts", accountReport?.frozenAccounts ?? 0],
      ["High Risk Accounts", accountReport?.highRiskAccounts ?? 0],
      ["Total Transactions", transactionReport?.totalTransactions ?? 0],
      ["Total Transfer Amount", transactionReport?.totalTransferAmount ?? 0],
      ["Today Transactions", transactionReport?.todayTransactions ?? 0],
      ["Today Transfer Amount", transactionReport?.todayTransferAmount ?? 0],
      ["Monthly Transactions", transactionReport?.monthTransactions ?? 0],
      ["Monthly Transfer Amount", transactionReport?.monthTransferAmount ?? 0],
      ["Total Fraud Alerts", fraudReport?.totalFraudAlerts ?? 0],
      ["High Severity Alerts", fraudReport?.highSeverityAlerts ?? 0],
      ["Medium Severity Alerts", fraudReport?.mediumSeverityAlerts ?? 0],
      ["Open Alerts", fraudReport?.openAlerts ?? 0],
      ["Resolved Alerts", fraudReport?.resolvedAlerts ?? 0],
    ];

    const csvContent = rows.map((row) => row.join(",")).join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "fraudshield-reports.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const riskLevel =
      fraudReport?.highSeverityAlerts > 0 || fraudReport?.openAlerts > 0
        ? "HIGH"
        : "LOW";

    const riskReason =
      riskLevel === "HIGH"
        ? `${fraudReport?.highSeverityAlerts ?? 0} high severity alerts and ${fraudReport?.openAlerts ?? 0
        } open fraud alerts require review.`
        : "No major fraud risk detected currently.";

    const pdfContent = document.createElement("div");

    pdfContent.innerHTML = `
    <div style="font-family: Arial, sans-serif; padding: 28px; color: #111827;">
      
      <div style="text-align:center; border-bottom: 3px solid #111827; padding-bottom: 12px; margin-bottom: 20px;">
        <h1 style="margin:0; font-size:26px;">FRAUDSHIELD BANK</h1>
        <p style="margin:6px 0 0; font-size:14px;">Payment Fraud Detection System</p>
        <p style="margin:4px 0 0; font-size:13px;">Reports & Analytics Summary</p>
      </div>

      <p><strong>Generated On:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Report Type:</strong> Bank Fraud & Transaction Analytics Report</p>

      <h2 style="margin-top:24px; margin-bottom: 12px;">Account Analytics</h2>
      <table style="width:100%; border-collapse:collapse; page-break-inside:avoid;">
        <tr><th style="border:1px solid #999; padding:8px; text-align:left;">Metric</th><th style="border:1px solid #999; padding:8px;">Value</th></tr>
        <tr><td style="border:1px solid #999; padding:8px;">Total Accounts</td><td style="border:1px solid #999; padding:8px; text-align:center;">${accountReport?.totalAccounts ?? 0}</td></tr>
        <tr><td style="border:1px solid #999; padding:8px;">Active Accounts</td><td style="border:1px solid #999; padding:8px; text-align:center;">${accountReport?.activeAccounts ?? 0}</td></tr>
        <tr><td style="border:1px solid #999; padding:8px;">Frozen Accounts</td><td style="border:1px solid #999; padding:8px; text-align:center;">${accountReport?.frozenAccounts ?? 0}</td></tr>
        <tr><td style="border:1px solid #999; padding:8px;">High Risk Accounts</td><td style="border:1px solid #999; padding:8px; text-align:center;">${accountReport?.highRiskAccounts ?? 0}</td></tr>
      </table>

      <h2 style="margin-top:24px; margin-bottom: 12px;">Transaction Analytics</h2>
      <table style="width:100%; border-collapse:collapse; page-break-inside:avoid;">
        <tr><th style="border:1px solid #999; padding:8px; text-align:left;">Metric</th><th style="border:1px solid #999; padding:8px;">Value</th></tr>
        <tr><td style="border:1px solid #999; padding:8px;">Total Transactions</td><td style="border:1px solid #999; padding:8px; text-align:center;">${transactionReport?.totalTransactions ?? 0}</td></tr>
        <tr><td style="border:1px solid #999; padding:8px;">Total Transfer Amount</td><td style="border:1px solid #999; padding:8px; text-align:center;">${formatMoney(transactionReport?.totalTransferAmount)}</td></tr>
        <tr><td style="border:1px solid #999; padding:8px;">Today's Transactions</td><td style="border:1px solid #999; padding:8px; text-align:center;">${transactionReport?.todayTransactions ?? 0}</td></tr>
        <tr><td style="border:1px solid #999; padding:8px;">Today's Transfer Amount</td><td style="border:1px solid #999; padding:8px; text-align:center;">${formatMoney(transactionReport?.todayTransferAmount)}</td></tr>
        <tr><td style="border:1px solid #999; padding:8px;">Monthly Transactions</td><td style="border:1px solid #999; padding:8px; text-align:center;">${transactionReport?.monthTransactions ?? 0}</td></tr>
        <tr><td style="border:1px solid #999; padding:8px;">Monthly Transfer Amount</td><td style="border:1px solid #999; padding:8px; text-align:center;">${formatMoney(transactionReport?.monthTransferAmount)}</td></tr>
      </table>

      <h2 style="margin-top:24px; margin-bottom: 12px;">Fraud Analytics</h2>
      <table style="width:100%; border-collapse:collapse; page-break-inside:avoid;">
        <tr><th style="border:1px solid #999; padding:8px; text-align:left;">Metric</th><th style="border:1px solid #999; padding:8px;">Value</th></tr>
        <tr><td style="border:1px solid #999; padding:8px;">Total Fraud Alerts</td><td style="border:1px solid #999; padding:8px; text-align:center;">${fraudReport?.totalFraudAlerts ?? 0}</td></tr>
        <tr><td style="border:1px solid #999; padding:8px;">High Severity Alerts</td><td style="border:1px solid #999; padding:8px; text-align:center;">${fraudReport?.highSeverityAlerts ?? 0}</td></tr>
        <tr><td style="border:1px solid #999; padding:8px;">Medium Severity Alerts</td><td style="border:1px solid #999; padding:8px; text-align:center;">${fraudReport?.mediumSeverityAlerts ?? 0}</td></tr>
        <tr><td style="border:1px solid #999; padding:8px;">Open Alerts</td><td style="border:1px solid #999; padding:8px; text-align:center;">${fraudReport?.openAlerts ?? 0}</td></tr>
        <tr><td style="border:1px solid #999; padding:8px;">Resolved Alerts</td><td style="border:1px solid #999; padding:8px; text-align:center;">${fraudReport?.resolvedAlerts ?? 0}</td></tr>
      </table>

      <h2 style="margin-top:24px; margin-bottom: 12px;">Risk Assessment Summary</h2>
      <div style="border:1px solid #999; padding:12px;">
        <p><strong>Current System Risk Level:</strong> ${riskLevel}</p>
        <p><strong>Reason:</strong> ${riskReason}</p>
      </div>

      <div style="margin-top:30px; border-top:2px solid #111827; padding-top:10px; font-size:12px; text-align:center;">
        Generated By FraudShield Analytics Engine<br/>
        Confidential Banking Report
      </div>
    </div>
  `;

    html2pdf()
      .set({
        margin: 8,
        filename: "fraudshield-bank-analytics-report.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(pdfContent)
      .save();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border">Loading Reports...</div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Reports & Analytics
        </h1>

        <p className="text-slate-500 mt-2">
          Transaction statistics, fraud insights, and business reports.
        </p>
      </div>

      <div ref={reportRef}>
        <div className="mb-8 bg-white rounded-2xl p-6 border shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            FraudShield Analytics Report
          </h2>
          <p className="text-slate-500 mt-2">
            Generated Date: {new Date().toLocaleString()}
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={downloadCSV}
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl hover:bg-emerald-700"
          >
            <Download size={18} />
            Export CSV
          </button>

          <button
            onClick={downloadPDF}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700"
          >
            <FileText size={18} />
            Export PDF
          </button>
        </div>

        <section className="mb-10 mt-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Account Analytics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <Users className="text-blue-600 mb-4" size={30} />
              <p className="text-slate-500">Total Accounts</p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2 break-words">
                {accountReport.totalAccounts}
              </h2>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <UserCheck className="text-emerald-600 mb-4" size={30} />
              <p className="text-slate-500">Active Accounts</p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2 break-words">
                {accountReport.activeAccounts}
              </h2>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <Lock className="text-orange-500 mb-4" size={30} />
              <p className="text-slate-500">Frozen Accounts</p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2 break-words">
                {accountReport.frozenAccounts}
              </h2>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <ShieldX className="text-red-600 mb-4" size={30} />
              <p className="text-slate-500">High Risk Accounts</p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2 break-words">
                {accountReport.highRiskAccounts}
              </h2>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Transaction Analytics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <div className="flex justify-between">
                <div>
                  <p className="text-slate-500">Total Transactions</p>
                  <h2 className="text-2xl sm:text-3xl font-bold mt-2 break-words">
                    {transactionReport.totalTransactions}
                  </h2>
                </div>
                <ArrowLeftRight className="text-blue-600" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <div className="flex justify-between">
                <div>
                  <p className="text-slate-500">Total Transfer Amount</p>
                  <h2 className="text-2xl sm:text-3xl font-bold mt-2 break-words">
                    {formatMoney(transactionReport.totalTransferAmount)}
                  </h2>
                </div>
                <IndianRupee className="text-emerald-600" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <div className="flex justify-between">
                <div>
                  <p className="text-slate-500">Today's Transactions</p>
                  <h2 className="text-2xl sm:text-3xl font-bold mt-2 break-words">
                    {transactionReport.todayTransactions}
                  </h2>
                </div>
                <Calendar className="text-purple-600" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <p className="text-slate-500">Today's Transfer Amount</p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2 break-words">
                {formatMoney(transactionReport.todayTransferAmount)}
              </h2>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <p className="text-slate-500">Monthly Transactions</p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2 break-words">
                {transactionReport.monthTransactions}
              </h2>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <p className="text-slate-500">Monthly Transfer Amount</p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2 break-words">
                {formatMoney(transactionReport.monthTransferAmount)}
              </h2>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Fraud Analytics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <ShieldAlert className="text-red-600 mb-4" size={30} />
              <p className="text-slate-500">Total Fraud Alerts</p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2 break-words">
                {fraudReport.totalFraudAlerts}
              </h2>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <AlertTriangle className="text-red-600 mb-4" size={30} />
              <p className="text-slate-500">High Severity</p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2 break-words">
                {fraudReport.highSeverityAlerts}
              </h2>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <AlertTriangle className="text-yellow-500 mb-4" size={30} />
              <p className="text-slate-500">Medium Severity</p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2 break-words">
                {fraudReport.mediumSeverityAlerts}
              </h2>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <ShieldAlert className="text-blue-600 mb-4" size={30} />
              <p className="text-slate-500">Open Alerts</p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2 break-words">
                {fraudReport.openAlerts}
              </h2>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <CheckCircle className="text-emerald-600 mb-4" size={30} />
              <p className="text-slate-500">Resolved Alerts</p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2 break-words">
                {fraudReport.resolvedAlerts}
              </h2>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Fraud Severity Chart
          </h2>

          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            {!hasFraudChartData ? (
              <p className="text-slate-500">
                No fraud severity data available.
              </p>
            ) : (
              <div className="h-72 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fraudSeverityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={4}
                      label
                    >
                      {fraudSeverityData.map((entry, index) => (
                        <Cell key={entry.name} fill={fraudColors[index]} />
                      ))}
                    </Pie>

                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Monthly Transaction Trend
          </h2>

          <div className="bg-white rounded-2xl p-6 border shadow-sm overflow-x-auto">
            {monthlyTrend.length === 0 ? (
              <p className="text-slate-500">
                No monthly transaction trend data available.
              </p>
            ) : (
              <div className="h-72 sm:h-80 min-w-[600px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />

                    <YAxis
                      yAxisId="left"
                      label={{
                        value: "Transactions",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />

                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      label={{
                        value: "Amount (₹)",
                        angle: 90,
                        position: "insideRight",
                      }}
                    />

                    <Tooltip />
                    <Legend />

                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="transactionCount"
                      stroke="#2563eb"
                      strokeWidth={3}
                      name="Transactions"
                    />

                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="totalAmount"
                      stroke="#16a34a"
                      strokeWidth={3}
                      name="Transfer Amount"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Reports;
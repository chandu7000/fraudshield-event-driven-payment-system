import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  ArrowLeftRight,
  ShieldAlert,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  FileText,
  UserPlus,
} from "lucide-react";

import SystemOverviewChart from "../components/dashboard/SystemOverviewChart";
import RiskDistributionChart from "../components/dashboard/RiskDistributionChart";

import { getAllAccounts, getMyAccounts } from "../services/accountService";
import {
  getAllTransactions,
  getMyTransactions,
} from "../services/transactionService";
import { getAllFraudAlerts } from "../services/fraudAlertService";
import { getAllAuditLogs } from "../services/auditService";

function Dashboard() {
  const role = sessionStorage.getItem("role");
  const fullName = sessionStorage.getItem("fullName") || "User";

  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [stats, setStats] = useState({
    totalAccounts: 0,
    totalTransactions: 0,
    fraudAlerts: 0,
    auditLogs: 0,
    totalBalance: 0,
    monthlySent: 0,
    monthlyReceived: 0,
    netCashFlow: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatMoney = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("en-IN");
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");

      if (role === "ADMIN") {
        const [
          accountsResponse,
          transactionsResponse,
          fraudAlertsResponse,
          auditLogsResponse,
        ] = await Promise.all([
          getAllAccounts(),
          getAllTransactions(),
          getAllFraudAlerts(),
          getAllAuditLogs(),
        ]);

        const allAccounts = accountsResponse.data;
        const allTransactions = transactionsResponse.data;
        const fraudAlerts = fraudAlertsResponse.data;
        const auditLogs = auditLogsResponse.data;

        const totalBalance = allAccounts.reduce(
          (sum, account) => sum + Number(account.balance || 0),
          0
        );

        setAccounts(allAccounts);
        setTransactions(allTransactions);

        setStats({
          totalAccounts: allAccounts.length,
          totalTransactions: allTransactions.length,
          fraudAlerts: fraudAlerts.length,
          auditLogs: auditLogs.length,
          totalBalance,
          monthlySent: 0,
          monthlyReceived: 0,
          netCashFlow: 0,
        });
      } else {
        const [accountsResponse, transactionsResponse] = await Promise.all([
          getMyAccounts(),
          getMyTransactions(),
        ]);

        const myAccounts = accountsResponse.data;
        const myTransactions = transactionsResponse.data;

        const myAccountNumbers = myAccounts.map(
          (account) => account.accountNumber
        );

        const totalBalance = myAccounts.reduce(
          (sum, account) => sum + Number(account.balance || 0),
          0
        );

        const today = new Date();

        const currentMonthTransactions = myTransactions.filter((transaction) => {
          const transactionDate = new Date(transaction.transactionTime);

          return (
            transactionDate.getMonth() === today.getMonth() &&
            transactionDate.getFullYear() === today.getFullYear()
          );
        });

        const monthlySent = currentMonthTransactions.reduce(
          (sum, transaction) =>
            myAccountNumbers.includes(transaction.fromAccountNumber)
              ? sum + Number(transaction.amount || 0)
              : sum,
          0
        );

        const monthlyReceived = currentMonthTransactions.reduce(
          (sum, transaction) =>
            myAccountNumbers.includes(transaction.toAccountNumber)
              ? sum + Number(transaction.amount || 0)
              : sum,
          0
        );

        setAccounts(myAccounts);
        setTransactions(myTransactions);

        setStats({
          totalAccounts: myAccounts.length,
          totalTransactions: myTransactions.length,
          fraudAlerts: 0,
          auditLogs: 0,
          totalBalance,
          monthlySent,
          monthlyReceived,
          netCashFlow: monthlyReceived - monthlySent,
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.transactionTime) - new Date(a.transactionTime))
    .slice(0, 5);

  const myAccountNumbers = accounts.map((account) => account.accountNumber);

  const getTransactionType = (transaction) => {
    if (myAccountNumbers.includes(transaction.fromAccountNumber)) return "DEBIT";
    if (myAccountNumbers.includes(transaction.toAccountNumber)) return "CREDIT";
    return "TRANSFER";
  };

  const accountStatus = accounts[0]?.status || "UNKNOWN";

  const activeAccounts = accounts.filter(
    (account) => account.status === "ACTIVE"
  ).length;

  const frozenAccounts = accounts.filter(
    (account) => account.status === "FROZEN"
  ).length;

  const adminCards = [
    {
      title: "Total Accounts",
      value: stats.totalAccounts,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Total Transactions",
      value: stats.totalTransactions,
      icon: ArrowLeftRight,
      color: "bg-purple-500",
    },
    {
      title: "Fraud Alerts",
      value: stats.fraudAlerts,
      icon: ShieldAlert,
      color: "bg-red-500",
    },
    {
      title: "Audit Logs",
      value: stats.auditLogs,
      icon: ClipboardList,
      color: "bg-orange-500",
    },
  ];

  const userCards = [
    {
      title: "Monthly Sent",
      value: formatMoney(stats.monthlySent),
      icon: TrendingDown,
      color: "bg-red-500",
    },
    {
      title: "Monthly Received",
      value: formatMoney(stats.monthlyReceived),
      icon: TrendingUp,
      color: "bg-blue-500",
    },
    {
      title: "Net Cash Flow",
      value: formatMoney(stats.netCashFlow),
      icon: ArrowLeftRight,
      color: stats.netCashFlow >= 0 ? "bg-purple-500" : "bg-orange-500",
    },
  ];

  const dashboardCards = role === "ADMIN" ? adminCards : userCards;

  return (
    <div className="w-full">
      {role !== "ADMIN" && (
        <div className="mb-6 sm:mb-8 bg-slate-950 text-white rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm">
          <p className="text-slate-300 text-sm">Welcome back,</p>

          <h1 className="text-2xl sm:text-3xl font-bold mt-1 break-words">
            {fullName}
          </h1>

          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Your account is secure and your banking activity is protected.
          </p>
        </div>
      )}

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {role === "ADMIN" ? "Admin Dashboard" : "My Dashboard"}
        </h1>

        <p className="text-sm sm:text-base text-slate-500 mt-2">
          {role === "ADMIN"
            ? "Real-time summary of payment and fraud detection activity."
            : "Your personal banking summary, transactions, and quick actions."}
        </p>
      </div>

      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 text-slate-600">
          Loading dashboard statistics...
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 rounded-xl p-4 sm:p-5">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${role === "ADMIN"
              ? "xl:grid-cols-4"
              : "xl:grid-cols-3"
              } gap-4 sm:gap-6`}
          >
            {dashboardCards.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm text-slate-500">{item.title}</p>

                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 break-words">
                        {item.value}
                      </h2>
                    </div>

                    <div
                      className={`${item.color} p-3 sm:p-4 rounded-2xl text-white shrink-0`}
                    >
                      <Icon size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {role !== "ADMIN" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 sm:p-6 border-b">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    Recent Transactions
                  </h2>

                  <p className="text-sm sm:text-base text-slate-500 mt-1">
                    Your latest 5 transactions.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-[720px] w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-4 text-sm text-slate-500">
                          Date
                        </th>
                        <th className="text-left p-4 text-sm text-slate-500">
                          Type
                        </th>
                        <th className="text-left p-4 text-sm text-slate-500">
                          Amount
                        </th>
                        <th className="text-left p-4 text-sm text-slate-500">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentTransactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="p-8 text-center text-slate-500"
                          >
                            No transactions found.
                          </td>
                        </tr>
                      ) : (
                        recentTransactions.map((transaction) => {
                          const type = getTransactionType(transaction);
                          const isCredit = type === "CREDIT";

                          return (
                            <tr
                              key={transaction.id}
                              className="border-t hover:bg-slate-50"
                            >
                              <td className="p-4 text-sm text-slate-500">
                                {formatDateTime(transaction.transactionTime)}
                              </td>

                              <td className="p-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${isCredit
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-700"
                                    }`}
                                >
                                  {type}
                                </span>
                              </td>

                              <td
                                className={`p-4 font-semibold ${isCredit ? "text-emerald-600" : "text-red-600"
                                  }`}
                              >
                                {isCredit ? "+" : "-"}
                                {formatMoney(transaction.amount)}
                              </td>

                              <td className="p-4">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                  {transaction.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="block sm:hidden px-4 py-3 bg-slate-50 border-t">
                  <p className="text-xs text-slate-500">
                    Swipe left/right to view full transaction table.
                  </p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    Account Status
                  </h2>

                  <div className="mt-5">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${accountStatus === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700"
                        : accountStatus === "FROZEN"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-700"
                        }`}
                    >
                      {accountStatus}
                    </span>

                    <p className="text-sm sm:text-base text-slate-500 mt-3">
                      Current status of your primary account.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    Account Security
                  </h2>

                  <div className="mt-5 space-y-3">
                    <div className="flex justify-between gap-4 border-b pb-3">
                      <span className="text-slate-500">Access Level</span>
                      <span className="font-semibold text-slate-900">
                        {role}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 border-b pb-3">
                      <span className="text-slate-500">Authentication</span>
                      <span className="font-semibold text-emerald-600">
                        JWT Secured
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Protection</span>
                      <span
                        className={`font-semibold ${accountStatus === "FROZEN"
                          ? "text-red-600"
                          : "text-emerald-600"
                          }`}
                      >
                        {accountStatus === "FROZEN" ? "Frozen" : "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    Quick Actions
                  </h2>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Link
                      to="/transactions"
                      className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 hover:bg-slate-50 font-semibold text-slate-800"
                    >
                      <ArrowLeftRight size={20} className="shrink-0" />
                      <span>Transfer Money</span>
                    </Link>

                    <Link
                      to="/beneficiaries"
                      className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 hover:bg-slate-50 font-semibold text-slate-800"
                    >
                      <UserPlus size={20} className="shrink-0" />
                      <span>Manage Beneficiaries</span>
                    </Link>

                    <Link
                      to="/accounts"
                      className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 hover:bg-slate-50 font-semibold text-slate-800"
                    >
                      <FileText size={20} className="shrink-0" />
                      <span>Generate Statement</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {role === "ADMIN" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
                  <p className="text-slate-500 text-sm">Active Accounts</p>

                  <h2 className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2">
                    {activeAccounts}
                  </h2>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
                  <p className="text-slate-500 text-sm">Frozen Accounts</p>

                  <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mt-2">
                    {frozenAccounts}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
                <SystemOverviewChart stats={stats} />
                <RiskDistributionChart stats={stats} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
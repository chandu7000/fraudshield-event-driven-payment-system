import { useEffect, useState } from "react";
import {
  getAllAccounts,
  getMyAccounts,
  createAccount,
  freezeAccount,
  unfreezeAccount,
} from "../services/accountService";
import { getMyStatement } from "../services/statementService";
import { Users, Search, Eye, EyeOff, FileText } from "lucide-react";
import html2pdf from "html2pdf.js";

function Accounts() {
  const role = sessionStorage.getItem("role");

  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showBalance, setShowBalance] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statement, setStatement] = useState(null);
  const [statementLoading, setStatementLoading] = useState(false);
  const [statementError, setStatementError] = useState("");

  const [formData, setFormData] = useState({
    accountHolderName: "",
    balance: "",
    userEmail: "",
  });

  const loadAccounts = async () => {
    try {
      const response =
        role === "ADMIN" ? await getAllAccounts() : await getMyAccounts();

      setAccounts(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load accounts.");
      setMessageType("error");
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const filteredAccounts = accounts.filter((account) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      account.accountHolderName?.toLowerCase().includes(search) ||
      account.accountNumber?.toLowerCase().includes(search) ||
      account.userEmail?.toLowerCase().includes(search) ||
      account.status?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "ALL" || account.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalAccounts = accounts.length;

  const activeAccounts = accounts.filter(
    (account) => account.status === "ACTIVE"
  ).length;

  const frozenAccounts = accounts.filter(
    (account) => account.status === "FROZEN"
  ).length;

  const totalBalance = filteredAccounts.reduce(
    (sum, account) => sum + Number(account.balance || 0),
    0
  );

  const formatBalance = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("en-IN");
  };

  const maskedBalance = "₹••••••";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createAccount({
        accountHolderName: formData.accountHolderName,
        balance: Number(formData.balance),
        userEmail: formData.userEmail,
      });

      setFormData({
        accountHolderName: "",
        balance: "",
        userEmail: "",
      });

      setMessage("Account created successfully.");
      setMessageType("success");

      await loadAccounts();
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Account creation failed.");
      setMessageType("error");
    }
  };

  const handleFreeze = async (accountNumber) => {
    const confirmFreeze = window.confirm(`Freeze account ${accountNumber}?`);

    if (!confirmFreeze) return;

    try {
      await freezeAccount(accountNumber);

      setMessage(`Account ${accountNumber} frozen successfully.`);
      setMessageType("success");

      await loadAccounts();
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to freeze account.");
      setMessageType("error");
    }
  };

  const handleUnfreeze = async (accountNumber) => {
    const confirmUnfreeze = window.confirm(`Unfreeze account ${accountNumber}?`);

    if (!confirmUnfreeze) return;

    try {
      await unfreezeAccount(accountNumber);

      setMessage(`Account ${accountNumber} activated successfully.`);
      setMessageType("success");

      await loadAccounts();
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to unfreeze account.");
      setMessageType("error");
    }
  };

  const generateStatement = async () => {
    if (!fromDate || !toDate) {
      setStatementError("Please select both from date and to date.");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setStatementError("From date cannot be greater than to date.");
      return;
    }

    try {
      setStatementLoading(true);
      setStatementError("");

      const response = await getMyStatement(fromDate, toDate);
      setStatement(response.data);
    } catch (error) {
      console.error(error);
      setStatementError("Failed to generate statement.");
    } finally {
      setStatementLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!statement) return;

    const rows = [
      ["FraudShield Account Statement"],
      ["Account Number", statement.accountNumber],
      ["Account Holder", statement.accountHolderName],
      ["From Date", statement.fromDate],
      ["To Date", statement.toDate],
      ["Current Balance", statement.currentBalance],
      ["Total Credits", statement.totalCredits],
      ["Total Debits", statement.totalDebits],
      ["Net Amount", statement.netAmount],
      ["Transaction Count", statement.transactionCount],
      [],
      ["Date", "Type", "From Account", "To Account", "Amount", "Status"],
    ];

    statement.transactions.forEach((transaction) => {
      rows.push([
        formatDateTime(transaction.transactionTime),
        transaction.type,
        transaction.fromAccountNumber,
        transaction.toAccountNumber,
        transaction.amount,
        transaction.status,
      ]);
    });

    const csvContent = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `statement_${statement.accountNumber}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };
  const downloadPDF = () => {
    if (!statement) return;

    const confirmDownload = window.confirm(
      `Are you sure you want to download statement from ${statement.fromDate} to ${statement.toDate}?`
    );

    if (!confirmDownload) return;

    const element = document.createElement("div");

    element.innerHTML = `
      <div style="font-family: Arial; padding: 30px; color: #0f172a;">
        <h1 style="text-align:center;">FraudShield Account Statement</h1>
        <p style="text-align:center;color:#64748b;">Generated statement for selected date range</p>

        <p><strong>Account Holder:</strong> ${statement.accountHolderName}</p>
        <p><strong>Account Number:</strong> ${statement.accountNumber}</p>
        <p><strong>From:</strong> ${statement.fromDate}</p>
        <p><strong>To:</strong> ${statement.toDate}</p>
        <p><strong>Current Balance:</strong> Rs. ${statement.currentBalance}</p>
        <p><strong>Total Credits:</strong> Rs. ${statement.totalCredits}</p>
        <p><strong>Total Debits:</strong> Rs. ${statement.totalDebits}</p>
        <p><strong>Net Amount:</strong> Rs. ${statement.netAmount}</p>
        <p><strong>Transaction Count:</strong> ${statement.transactionCount}</p>

        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <thead>
            <tr>
              <th style="border:1px solid #ccc;padding:8px;">Date</th>
              <th style="border:1px solid #ccc;padding:8px;">Type</th>
              <th style="border:1px solid #ccc;padding:8px;">From</th>
              <th style="border:1px solid #ccc;padding:8px;">To</th>
              <th style="border:1px solid #ccc;padding:8px;">Amount</th>
              <th style="border:1px solid #ccc;padding:8px;">Status</th>
            </tr>
          </thead>

          <tbody>
            ${statement.transactions.length === 0
        ? `<tr><td colspan="6" style="border:1px solid #ccc;padding:8px;text-align:center;">No transactions found</td></tr>`
        : statement.transactions
          .map(
            (t) => `
                        <tr>
                          <td style="border:1px solid #ccc;padding:8px;">${formatDateTime(
              t.transactionTime
            )}</td>
                          <td style="border:1px solid #ccc;padding:8px;">${t.type}</td>
                          <td style="border:1px solid #ccc;padding:8px;">${t.fromAccountNumber}</td>
                          <td style="border:1px solid #ccc;padding:8px;">${t.toAccountNumber}</td>
                          <td style="border:1px solid #ccc;padding:8px;">Rs. ${t.amount}</td>
                          <td style="border:1px solid #ccc;padding:8px;">${t.status}</td>
                        </tr>
                      `
          )
          .join("")
      }
          </tbody>
        </table>
      </div>
    `;

    html2pdf()
      .set({
        margin: 10,
        filename: `statement_${statement.accountNumber}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  };

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {role === "ADMIN" ? "Accounts Management" : "My Accounts"}
        </h1>

        <p className="text-sm sm:text-base text-slate-500 mt-2">
          {role === "ADMIN"
            ? "Manage customer accounts and monitor account status."
            : "View your account details, balance, and account statement."}
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-xl p-4 text-sm font-medium ${messageType === "success"
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
              : "bg-red-100 text-red-700 border border-red-200"
            }`}
        >
          {message}
        </div>
      )}

      <div
        className={`grid grid-cols-1 md:grid-cols-2 ${role === "ADMIN" ? "xl:grid-cols-4" : "xl:grid-cols-2"
          } gap-4 sm:gap-6 mb-6`}
      >
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <p className="text-sm text-slate-500">
            {role === "ADMIN" ? "Total Accounts" : "My Accounts"}
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {role === "ADMIN" ? totalAccounts : filteredAccounts.length}
          </h2>
        </div>

        {role === "ADMIN" && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <p className="text-sm text-slate-500">Active Accounts</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2">
                {activeAccounts}
              </h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <p className="text-sm text-slate-500">Frozen Accounts</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mt-2">
                {frozenAccounts}
              </h2>
            </div>
          </>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {role === "ADMIN" ? "Showing Total Balance" : "My Total Balance"}
            </p>

            <button
              type="button"
              onClick={() => setShowBalance(!showBalance)}
              className="text-slate-500 hover:text-slate-900 shrink-0"
            >
              {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2 break-words">
            {showBalance ? formatBalance(totalBalance) : maskedBalance}
          </h2>
        </div>
      </div>

      {role === "ADMIN" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">
            Create Account
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-4 gap-4"
          >
            <input
              type="text"
              name="accountHolderName"
              placeholder="Account Holder Name"
              value={formData.accountHolderName}
              onChange={handleChange}
              className="border border-slate-300 rounded-xl p-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
            <input
              type="number"
              name="balance"
              placeholder="Initial Balance"
              value={formData.balance}
              onChange={handleChange}
              className="border border-slate-300 rounded-xl p-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-slate-900"
              required
            />

            <input
              type="email"
              name="userEmail"
              placeholder="User Email"
              value={formData.userEmail}
              onChange={handleChange}
              className="border border-slate-300 rounded-xl p-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-slate-900"
              required
            />

            <button
              type="submit"
              className="bg-slate-900 text-white rounded-xl p-3 text-sm sm:text-base font-semibold hover:bg-slate-800"
            >
              Create Account
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-4 sm:p-6 border-b flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl shrink-0">
              <Users size={22} />
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {role === "ADMIN" ? "Account List" : "My Account List"}
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
            {role === "ADMIN" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-300 rounded-xl py-3 px-4 text-sm sm:text-base outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="FROZEN">Frozen</option>
              </select>
            )}

            <div className="relative w-full md:w-80">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-sm sm:text-base outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4 text-sm text-slate-500">
                  Holder Name
                </th>
                <th className="text-left p-4 text-sm text-slate-500">
                  Account Number
                </th>
                {role === "ADMIN" && (
                  <th className="text-left p-4 text-sm text-slate-500">
                    Email
                  </th>
                )}
                <th className="text-left p-4 text-sm text-slate-500">
                  Balance
                </th>
                <th className="text-left p-4 text-sm text-slate-500">
                  Status
                </th>
                {role === "ADMIN" && (
                  <th className="text-left p-4 text-sm text-slate-500">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={role === "ADMIN" ? "6" : "4"}
                    className="p-8 text-center text-slate-500"
                  >
                    No matching accounts found.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr key={account.id} className="border-t hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-900 whitespace-nowrap">
                      {account.accountHolderName}
                    </td>

                    <td className="p-4 text-slate-600 whitespace-nowrap">
                      {account.accountNumber}
                    </td>

                    {role === "ADMIN" && (
                      <td className="p-4 text-slate-600 whitespace-nowrap">
                        {account.userEmail}
                      </td>
                    )}

                    <td className="p-4 font-semibold text-emerald-600 whitespace-nowrap">
                      {showBalance
                        ? formatBalance(account.balance)
                        : maskedBalance}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${account.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                          }`}
                      >
                        {account.status}
                      </span>
                    </td>

                    {role === "ADMIN" && (
                      <td className="p-4 whitespace-nowrap">
                        {account.status === "ACTIVE" ? (
                          <button
                            type="button"
                            onClick={() => handleFreeze(account.accountNumber)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-semibold"
                          >
                            Freeze
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleUnfreeze(account.accountNumber)
                            }
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-semibold"
                          >
                            Unfreeze
                          </button>
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
            Swipe left/right to view full account details and actions.
          </p>
        </div>
      </div>

      {role !== "ADMIN" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl shrink-0">
                <FileText size={22} />
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Account Statement
                </h2>

                <p className="text-sm text-slate-500">
                  Generate your statement by selecting date range.
                </p>
              </div>
            </div>

            {statementError && (
              <div className="mb-4 bg-red-100 text-red-700 border border-red-200 p-4 rounded-xl text-sm">
                {statementError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border border-slate-300 rounded-xl p-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-slate-900"
              />

              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border border-slate-300 rounded-xl p-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-slate-900"
              />

              <button
                type="button"
                onClick={generateStatement}
                disabled={statementLoading}
                className="bg-slate-900 text-white rounded-xl p-3 text-sm sm:text-base font-semibold hover:bg-slate-800 disabled:opacity-60"
              >
                {statementLoading ? "Generating..." : "Generate Statement"}
              </button>

              <button
                type="button"
                onClick={downloadCSV}
                disabled={!statement}
                className="bg-emerald-600 text-white rounded-xl p-3 text-sm sm:text-base font-semibold hover:bg-emerald-700 disabled:opacity-60"
              >
                Download CSV
              </button>

              <button
                type="button"
                onClick={downloadPDF}
                disabled={!statement}
                className="bg-blue-600 text-white rounded-xl p-3 text-sm sm:text-base font-semibold hover:bg-blue-700 disabled:opacity-60"
              >
                Download PDF
              </button>
            </div>
          </div>

          {statement && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 p-4 sm:p-6 border-b bg-slate-50">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Current Balance</p>
                  <h3 className="text-lg sm:text-xl font-bold text-blue-600 mt-2 break-words">
                    {formatBalance(statement.currentBalance)}
                  </h3>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Total Credits</p>
                  <h3 className="text-lg sm:text-xl font-bold text-emerald-600 mt-2 break-words">
                    {formatBalance(statement.totalCredits)}
                  </h3>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Total Debits</p>
                  <h3 className="text-lg sm:text-xl font-bold text-red-600 mt-2 break-words">
                    {formatBalance(statement.totalDebits)}
                  </h3>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Net Amount</p>
                  <h3 className="text-lg sm:text-xl font-bold text-purple-600 mt-2 break-words">
                    {formatBalance(statement.netAmount)}
                  </h3>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Transactions</p>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                    {statement.transactionCount}
                  </h3>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[1000px] w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-4 text-sm text-slate-500">
                        Date
                      </th>
                      <th className="text-left p-4 text-sm text-slate-500">
                        Type
                      </th>
                      <th className="text-left p-4 text-sm text-slate-500">
                        From
                      </th>
                      <th className="text-left p-4 text-sm text-slate-500">
                        To
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
                    {statement.transactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="p-8 text-center text-slate-500"
                        >
                          No transactions found for this date range.
                        </td>
                      </tr>
                    ) : (
                      statement.transactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="border-t hover:bg-slate-50"
                        >
                          <td className="p-4 text-slate-500 text-sm whitespace-nowrap">
                            {formatDateTime(transaction.transactionTime)}
                          </td>

                          <td className="p-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${transaction.type === "CREDIT"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                                }`}
                            >
                              {transaction.type}
                            </span>
                          </td>

                          <td className="p-4 text-slate-700 whitespace-nowrap">
                            {transaction.fromAccountNumber}
                          </td>

                          <td className="p-4 text-slate-700 whitespace-nowrap">
                            {transaction.toAccountNumber}
                          </td>

                          <td
                            className={`p-4 font-semibold whitespace-nowrap ${transaction.type === "CREDIT"
                                ? "text-emerald-600"
                                : "text-red-600"
                              }`}
                          >
                            {transaction.type === "CREDIT" ? "+" : "-"}
                            {formatBalance(transaction.amount)}
                          </td>

                          <td className="p-4 whitespace-nowrap">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="block sm:hidden px-4 py-3 bg-slate-50 border-t">
                <p className="text-xs text-slate-500">
                  Swipe left/right to view full statement transaction details.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Accounts;
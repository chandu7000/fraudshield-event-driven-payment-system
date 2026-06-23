import { useEffect, useState } from "react";
import { ArrowLeftRight, Search } from "lucide-react";
import {
  getAllTransactions,
  getMyTransactions,
  createTransaction,
  createMyTransfer,
} from "../services/transactionService";
import { getMyAccounts, lookupAccount } from "../services/accountService";
import { getMyBeneficiaries } from "../services/beneficiaryService";

function Transactions() {
  const role = sessionStorage.getItem("role");

  const [transactions, setTransactions] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [myAccountNumbers, setMyAccountNumbers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [transferMode, setTransferMode] = useState("BENEFICIARY");

  const [formData, setFormData] = useState({
    fromAccountNumber: "",
    toAccountNumber: "",
    amount: "",
  });

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const getBackendErrorMessage = (error) => {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data ||
      "Transfer failed. Please try again."
    );
  };

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleString("en-IN");
  };

  const loadTransactions = async () => {
    try {
      const response =
        role === "ADMIN" ? await getAllTransactions() : await getMyTransactions();
      setTransactions(response.data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load transactions.");
    }
  };

  const loadMyAccounts = async () => {
    if (role === "ADMIN") return;
    try {
      const response = await getMyAccounts();
      setMyAccountNumbers(response.data.map((account) => account.accountNumber));
    } catch (error) {
      console.error(error);
    }
  };

  const loadBeneficiaries = async () => {
    if (role === "ADMIN") return;
    try {
      const response = await getMyBeneficiaries();
      setBeneficiaries(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadTransactions();
    loadMyAccounts();
    loadBeneficiaries();
  }, []);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!errorMessage) return;

    const timer = setTimeout(() => {
      setErrorMessage("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [errorMessage]);

  const handleTransferModeChange = (mode) => {
    setTransferMode(mode);
    setFormData({ ...formData, toAccountNumber: "" });
    setReceiverName("");
    setMessage("");
    setErrorMessage("");
  };

  const handleBeneficiarySelect = (e) => {
    const selectedAccountNumber = e.target.value;

    const selectedBeneficiary = beneficiaries.find(
      (beneficiary) =>
        beneficiary.beneficiaryAccountNumber === selectedAccountNumber
    );

    if (selectedBeneficiary?.status !== "ACTIVE") {
      setFormData({ ...formData, toAccountNumber: "" });
      setReceiverName("");
      setErrorMessage(
        selectedBeneficiary?.activatedAt
          ? `Beneficiary is pending activation. You can transfer after ${formatDateTime(
            selectedBeneficiary.activatedAt
          )}`
          : "Beneficiary is pending activation."
      );
      setMessage("");
      return;
    }

    setFormData({ ...formData, toAccountNumber: selectedAccountNumber });
    setReceiverName(selectedBeneficiary?.beneficiaryName || "");
    setMessage("");
    setErrorMessage("");
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
    setMessage("");
    setErrorMessage("");

    if (name === "toAccountNumber") {
      try {
        if (value.trim().length > 0) {
          const response = await lookupAccount(value);
          setReceiverName(response.data.accountHolderName);
        } else {
          setReceiverName("");
        }
      } catch (error) {
        setReceiverName("");
      }
    }
  };

  const getUserTransactionType = (transaction) => {
    if (myAccountNumbers.includes(transaction.fromAccountNumber)) return "SENT";
    if (myAccountNumbers.includes(transaction.toAccountNumber)) return "RECEIVED";
    return "TRANSFER";
  };

  const getUserRelatedAccount = (transaction) => {
    const type = getUserTransactionType(transaction);
    if (type === "SENT") return transaction.toAccountNumber;
    if (type === "RECEIVED") return transaction.fromAccountNumber;
    return "-";
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const search = searchTerm.toLowerCase();
    const userType = getUserTransactionType(transaction);
    const relatedAccount = getUserRelatedAccount(transaction);

    return (
      transaction.fromAccountNumber?.toLowerCase().includes(search) ||
      transaction.toAccountNumber?.toLowerCase().includes(search) ||
      relatedAccount?.toLowerCase().includes(search) ||
      userType?.toLowerCase().includes(search) ||
      transaction.transactionType?.toLowerCase().includes(search) ||
      transaction.status?.toLowerCase().includes(search) ||
      String(transaction.amount || "").includes(search)
    );
  });

  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.transactionTime) - new Date(a.transactionTime)
  );

  const sentAmount = filteredTransactions.reduce((sum, transaction) => {
    return getUserTransactionType(transaction) === "SENT"
      ? sum + Number(transaction.amount || 0)
      : sum;
  }, 0);

  const receivedAmount = filteredTransactions.reduce((sum, transaction) => {
    return getUserTransactionType(transaction) === "RECEIVED"
      ? sum + Number(transaction.amount || 0)
      : sum;
  }, 0);

  const totalAmount = filteredTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0
  );

  const currentMonthTransactions = filteredTransactions.filter((transaction) => {
    const transactionDate = new Date(transaction.transactionTime);
    const today = new Date();

    return (
      transactionDate.getMonth() === today.getMonth() &&
      transactionDate.getFullYear() === today.getFullYear()
    );
  });

  const monthlyTransferAmount = currentMonthTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0
  );

  const getDeviceId = () => {
    let deviceId = localStorage.getItem("fraudShieldDeviceId");

    if (!deviceId) {
      deviceId = "DEVICE-" + crypto.randomUUID();
      localStorage.setItem("fraudShieldDeviceId", deviceId);
    }

    return deviceId;
  };

  const getUserLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve("UNKNOWN");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(
            position.coords.latitude + "," + position.coords.longitude
          );
        },
        () => {
          resolve("UNKNOWN");
        }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (
        role !== "ADMIN" &&
        transferMode === "BENEFICIARY"
      ) {
        const selectedBeneficiary = beneficiaries.find(
          (beneficiary) =>
            beneficiary.beneficiaryAccountNumber === formData.toAccountNumber
        );

        if (selectedBeneficiary?.status !== "ACTIVE") {
          setErrorMessage(
            selectedBeneficiary?.activatedAt
              ? `Beneficiary is pending activation. You can transfer after ${formatDateTime(
                selectedBeneficiary.activatedAt
              )}`
              : "Beneficiary is pending activation."
          );
          setMessage("");
          return;
        }
      }

      if (role === "ADMIN") {
        await createTransaction({
          fromAccountNumber: formData.fromAccountNumber,
          toAccountNumber: formData.toAccountNumber,
          amount: Number(formData.amount),
        });
      } else {
        const deviceId = getDeviceId();
        const location = await getUserLocation();

        await createMyTransfer({
          toAccountNumber: formData.toAccountNumber,
          amount: Number(formData.amount),
          deviceId,
          location,
        });
      }

      setFormData({
        fromAccountNumber: "",
        toAccountNumber: "",
        amount: "",
      });

      setReceiverName("");
      setMessage("Transfer completed successfully!");
      setErrorMessage("");

      await loadTransactions();
      await loadBeneficiaries();
    } catch (error) {
      console.error(error);

      const backendMessage = getBackendErrorMessage(error);

      setErrorMessage(
        typeof backendMessage === "string"
          ? backendMessage
          : "Transfer failed. Please try again."
      );

      setMessage("");
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {role === "ADMIN" ? "Transactions Management" : "My Transactions"}
        </h1>
        <p className="text-slate-500 mt-2">
          {role === "ADMIN"
            ? "Monitor all money transfers and transaction history."
            : "View your sent and received transactions."}
        </p>
      </div>

      {message && (
        <div className="mb-4 bg-emerald-100 text-emerald-700 border border-emerald-200 p-4 rounded-xl">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 bg-red-100 text-red-700 border border-red-200 p-4 rounded-xl">
          {errorMessage}
        </div>
      )}

      {role === "ADMIN" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-500">Showing Transactions</p>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              {filteredTransactions.length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-500">Showing Total Amount</p>
            <h2 className="text-3xl font-bold text-emerald-600 mt-2">
              ₹{totalAmount.toLocaleString("en-IN")}
            </h2>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-500">My Transactions</p>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              {filteredTransactions.length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-500">Sent Amount</p>
            <h2 className="text-3xl font-bold text-red-600 mt-2">
              ₹{sentAmount.toLocaleString("en-IN")}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-500">Received Amount</p>
            <h2 className="text-3xl font-bold text-emerald-600 mt-2">
              ₹{receivedAmount.toLocaleString("en-IN")}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-500">This Month Transfers</p>
            <h2 className="text-3xl font-bold text-blue-600 mt-2">
              ₹{monthlyTransferAmount.toLocaleString("en-IN")}
            </h2>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Transfer Money
        </h2>

        {role !== "ADMIN" && (
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button
              type="button"
              onClick={() => handleTransferModeChange("BENEFICIARY")}
              className={`px-5 py-3 rounded-xl ${transferMode === "BENEFICIARY"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700"
                }`}
            >
              Saved Beneficiary
            </button>

            <button
              type="button"
              onClick={() => handleTransferModeChange("NEW_ACCOUNT")}
              className={`px-5 py-3 rounded-xl ${transferMode === "NEW_ACCOUNT"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700"
                }`}
            >
              New Account
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`grid grid-cols-1 ${role === "ADMIN"
            ? "md:grid-cols-2 xl:grid-cols-5"
            : "md:grid-cols-2 xl:grid-cols-4"
            } gap-4`}
        >
          {role === "ADMIN" && (
            <input
              type="text"
              name="fromAccountNumber"
              placeholder="From Account"
              value={formData.fromAccountNumber}
              onChange={handleChange}
              className="border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
          )}

          {role === "ADMIN" ? (
            <input
              type="text"
              name="toAccountNumber"
              placeholder="To Account Number"
              value={formData.toAccountNumber}
              onChange={handleChange}
              className="border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
          ) : transferMode === "BENEFICIARY" ? (
            <select
              name="toAccountNumber"
              value={formData.toAccountNumber}
              onChange={handleBeneficiarySelect}
              className="border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900"
              required
            >
              <option value="">Select Beneficiary</option>
              {beneficiaries.map((beneficiary) => (
                <option
                  key={beneficiary.id}
                  value={beneficiary.beneficiaryAccountNumber}
                  disabled={beneficiary.status !== "ACTIVE"}
                >
                  {beneficiary.beneficiaryName} (
                  {beneficiary.beneficiaryAccountNumber}) -{" "}
                  {beneficiary.status}
                  {beneficiary.status !== "ACTIVE" && beneficiary.activatedAt
                    ? ` | Active after ${formatDateTime(
                      beneficiary.activatedAt
                    )}`
                    : ""}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name="toAccountNumber"
              placeholder="To Account Number"
              value={formData.toAccountNumber}
              onChange={handleChange}
              className="border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
          )}

          <input
            type="text"
            value={receiverName}
            placeholder="Receiver Name"
            readOnly
            className="bg-slate-100 border border-slate-300 rounded-xl p-3 outline-none"
          />

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            className="border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900"
            required
          />

          <button
            type="submit"
            className="bg-slate-900 text-white rounded-xl p-3 hover:bg-slate-800"
          >
            Send Money
          </button>
        </form>

        {role !== "ADMIN" &&
          transferMode === "BENEFICIARY" &&
          beneficiaries.length === 0 && (
            <p className="text-sm text-slate-500 mt-4">
              No saved beneficiaries found. Add one from the Beneficiaries page
              before transferring.
            </p>
          )}

        {role !== "ADMIN" &&
          transferMode === "BENEFICIARY" &&
          beneficiaries.some((beneficiary) => beneficiary.status !== "ACTIVE") && (
            <p className="text-sm text-orange-600 mt-4">
              Pending beneficiaries cannot receive transfer until activation time.
            </p>
          )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
              <ArrowLeftRight size={22} />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              {role === "ADMIN"
                ? "Transaction History"
                : "My Transaction History"}
            </h2>
          </div>

          <div className="relative w-full md:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-slate-300 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {role === "ADMIN" ? (
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-4 text-sm text-slate-500">From</th>
                  <th className="text-left p-4 text-sm text-slate-500">To</th>
                  <th className="text-left p-4 text-sm text-slate-500">Amount</th>
                  <th className="text-left p-4 text-sm text-slate-500">Type</th>
                  <th className="text-left p-4 text-sm text-slate-500">Status</th>
                  <th className="text-left p-4 text-sm text-slate-500">Time</th>
                </tr>
              </thead>

              <tbody>
                {sortedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">
                      No matching transactions found.
                    </td>
                  </tr>
                ) : (
                  sortedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-t hover:bg-slate-50">
                      <td className="p-4 text-slate-700">
                        {transaction.fromAccountNumber}
                      </td>
                      <td className="p-4 text-slate-700">
                        {transaction.toAccountNumber}
                      </td>
                      <td className="p-4 font-semibold text-slate-900">
                        ₹{Number(transaction.amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-4 text-slate-700">
                        {transaction.transactionType}
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                          {transaction.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 text-sm">
                        {transaction.transactionTime}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-4 text-sm text-slate-500">Type</th>
                  <th className="text-left p-4 text-sm text-slate-500">Account</th>
                  <th className="text-left p-4 text-sm text-slate-500">Amount</th>
                  <th className="text-left p-4 text-sm text-slate-500">Status</th>
                  <th className="text-left p-4 text-sm text-slate-500">Time</th>
                </tr>
              </thead>

              <tbody>
                {sortedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">
                      No matching transactions found.
                    </td>
                  </tr>
                ) : (
                  sortedTransactions.map((transaction) => {
                    const userType = getUserTransactionType(transaction);
                    const relatedAccount = getUserRelatedAccount(transaction);
                    const isSent = userType === "SENT";

                    return (
                      <tr key={transaction.id} className="border-t hover:bg-slate-50">
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${isSent
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                              }`}
                          >
                            {userType}
                          </span>
                        </td>
                        <td className="p-4 text-slate-700">{relatedAccount}</td>
                        <td
                          className={`p-4 font-semibold ${isSent ? "text-red-600" : "text-emerald-600"
                            }`}
                        >
                          {isSent ? "-" : "+"}₹
                          {Number(transaction.amount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            {transaction.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 text-sm">
                          {transaction.transactionTime}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Transactions;
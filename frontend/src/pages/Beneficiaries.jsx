import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Search, Users, Trash2 } from "lucide-react";
import {
  getMyBeneficiaries,
  addBeneficiary,
  deleteBeneficiary,
  lookupAccount,
} from "../services/beneficiaryService";

function Beneficiaries() {
  const navigate = useNavigate();
  const role = sessionStorage.getItem("role");

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [formData, setFormData] = useState({
    beneficiaryName: "",
    beneficiaryAccountNumber: "",
  });

  useEffect(() => {
    if (role === "ADMIN") {
      navigate("/", { replace: true });
    }
  }, [role, navigate]);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [message]);

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  const formatDateTime = (value) => {
    if (!value) return "Pending";
    return new Date(value).toLocaleString("en-IN");
  };

  const loadBeneficiaries = async () => {
    if (role === "ADMIN") return;

    try {
      const response = await getMyBeneficiaries();
      setBeneficiaries(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load beneficiaries.");
      setMessageType("error");
    }
  };

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const filteredBeneficiaries = beneficiaries.filter((beneficiary) => {
    const search = searchTerm.toLowerCase();

    return (
      beneficiary.beneficiaryName?.toLowerCase().includes(search) ||
      beneficiary.beneficiaryAccountNumber?.toLowerCase().includes(search) ||
      beneficiary.status?.toLowerCase().includes(search)
    );
  });

  const activeCount = beneficiaries.filter(
    (beneficiary) => beneficiary.status === "ACTIVE"
  ).length;

  const pendingCount = beneficiaries.filter(
    (beneficiary) => beneficiary.status === "PENDING"
  ).length;

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    clearMessage();

    if (name === "beneficiaryAccountNumber" && value.length >= 4) {
      try {
        const response = await lookupAccount(value);

        setFormData((prev) => ({
          ...prev,
          beneficiaryAccountNumber: value,
          beneficiaryName: response.data.accountHolderName,
        }));
      } catch (error) {
        setFormData((prev) => ({
          ...prev,
          beneficiaryAccountNumber: value,
          beneficiaryName: "",
        }));
      }
    }

    if (name === "beneficiaryAccountNumber" && value.length < 4) {
      setFormData((prev) => ({
        ...prev,
        beneficiaryName: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.beneficiaryAccountNumber.trim()) {
      setMessage("Please enter beneficiary account number.");
      setMessageType("error");
      return;
    }

    if (!formData.beneficiaryName.trim()) {
      setMessage("Please enter a valid beneficiary account number.");
      setMessageType("error");
      return;
    }

    try {
      await addBeneficiary({
        beneficiaryName: formData.beneficiaryName,
        beneficiaryAccountNumber: formData.beneficiaryAccountNumber,
      });

      setFormData({
        beneficiaryName: "",
        beneficiaryAccountNumber: "",
      });

      setMessage(
        "Beneficiary added successfully. It will be active after activation time."
      );
      setMessageType("success");

      await loadBeneficiaries();
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to add beneficiary.");
      setMessageType("error");
    }
  };

  const handleDelete = async (beneficiary) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${beneficiary.beneficiaryName}?`
    );

    if (!confirmDelete) return;

    try {
      await deleteBeneficiary(beneficiary.id);

      setMessage("Beneficiary deleted successfully.");
      setMessageType("success");

      await loadBeneficiaries();
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "Failed to delete beneficiary."
      );
      setMessageType("error");
    }
  };

  if (role === "ADMIN") {
    return null;
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
          Beneficiaries
        </h1>

        <p className="text-sm sm:text-base text-slate-500 mt-2">
          Manage your saved transfer recipients and activation status.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-xl p-4 text-sm font-medium ${
            messageType === "success"
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
              : "bg-red-100 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
          <p className="text-sm text-slate-500">Saved Beneficiaries</p>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {beneficiaries.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
          <p className="text-sm text-slate-500">Active Beneficiaries</p>

          <h2 className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2">
            {activeCount}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
          <p className="text-sm text-slate-500">Pending Beneficiaries</p>

          <h2 className="text-2xl sm:text-3xl font-bold text-orange-600 mt-2">
            {pendingCount}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-slate-100 text-slate-700 p-3 rounded-xl">
            <UserPlus size={22} />
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Add Beneficiary
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Enter account number to auto-fetch beneficiary name.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          <input
            type="text"
            name="beneficiaryName"
            placeholder="Beneficiary Name (Auto Filled)"
            value={formData.beneficiaryName}
            readOnly
            className="border border-slate-300 rounded-xl p-3 text-sm sm:text-base bg-slate-100 text-slate-600 outline-none"
          />

          <input
            type="text"
            name="beneficiaryAccountNumber"
            placeholder="Beneficiary Account Number"
            value={formData.beneficiaryAccountNumber}
            onChange={handleChange}
            className="border border-slate-300 rounded-xl p-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            required
          />

          <button
            type="submit"
            className="bg-slate-900 text-white rounded-xl p-3 text-sm sm:text-base font-semibold hover:bg-slate-800"
          >
            Add Beneficiary
          </button>
        </form>

        <p className="text-xs sm:text-sm text-slate-500 mt-4">
          Newly added beneficiaries stay in PENDING status until activation time.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-xl shrink-0">
              <Users size={22} />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Saved Beneficiaries
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                View active and pending transfer recipients.
              </p>
            </div>
          </div>

          <div className="relative w-full xl:w-96">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search beneficiaries..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                clearMessage();
              }}
              className="w-full border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-sm sm:text-base outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[950px] w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4 text-xs sm:text-sm font-semibold text-slate-500">
                  Name
                </th>

                <th className="text-left p-4 text-xs sm:text-sm font-semibold text-slate-500">
                  Account Number
                </th>

                <th className="text-left p-4 text-xs sm:text-sm font-semibold text-slate-500">
                  Status
                </th>

                <th className="text-left p-4 text-xs sm:text-sm font-semibold text-slate-500">
                  Added On
                </th>

                <th className="text-left p-4 text-xs sm:text-sm font-semibold text-slate-500">
                  Activated At
                </th>

                <th className="text-left p-4 text-xs sm:text-sm font-semibold text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBeneficiaries.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-8 text-center text-sm text-slate-500"
                  >
                    No beneficiaries found.
                  </td>
                </tr>
              ) : (
                filteredBeneficiaries.map((beneficiary) => (
                  <tr
                    key={beneficiary.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="p-4 font-medium text-slate-900 text-sm">
                      {beneficiary.beneficiaryName || "-"}
                    </td>

                    <td className="p-4 text-slate-600 text-sm whitespace-nowrap">
                      {beneficiary.beneficiaryAccountNumber}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          beneficiary.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {beneficiary.status || "PENDING"}
                      </span>
                    </td>

                    <td className="p-4 text-slate-600 text-sm whitespace-nowrap">
                      {formatDateTime(beneficiary.createdAt)}
                    </td>

                    <td className="p-4 text-slate-600 text-sm whitespace-nowrap">
                      {formatDateTime(beneficiary.activatedAt)}
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleDelete(beneficiary)}
                        className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-red-200"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="block sm:hidden px-4 py-3 bg-slate-50 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Swipe left/right to view full beneficiary table.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Beneficiaries;
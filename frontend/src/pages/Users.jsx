import { useEffect, useState } from "react";
import { Search, Users as UsersIcon } from "lucide-react";
import {
  getAllUsersForAdmin,
  disableUser,
  enableUser,
} from "../services/userService";

function Users() {
  const currentEmail = sessionStorage.getItem("email");

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadUsers = async () => {
    try {
      const response = await getAllUsersForAdmin();
      setUsers(response.data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load users.");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDisable = async (userId) => {
    try {
      await disableUser(userId);
      setMessage("User disabled successfully.");
      setErrorMessage("");
      await loadUsers();
    } catch (error) {
      console.error(error);
      setErrorMessage(error.response?.data?.message || "Failed to disable user.");
      setMessage("");
    }
  };

  const handleEnable = async (userId) => {
    try {
      await enableUser(userId);
      setMessage("User enabled successfully.");
      setErrorMessage("");
      await loadUsers();
    } catch (error) {
      console.error(error);
      setErrorMessage(error.response?.data?.message || "Failed to enable user.");
      setMessage("");
    }
  };

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();

    return (
      user.fullName?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search) ||
      user.accountNumber?.toLowerCase().includes(search) ||
      user.accountStatus?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Users Management
        </h1>

        <p className="text-sm sm:text-base text-slate-500 mt-2">
          View users, roles, account mapping, and enable or disable access.
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <p className="text-sm text-slate-500">Total Users</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {users.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <p className="text-sm text-slate-500">Enabled Users</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2">
            {users.filter((user) => user.enabled).length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <p className="text-sm text-slate-500">Disabled Users</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mt-2">
            {users.filter((user) => !user.enabled).length}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl shrink-0">
              <UsersIcon size={22} />
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Registered Users
            </h2>
          </div>

          <div className="relative w-full md:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-sm sm:text-base outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1150px] w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4 text-sm text-slate-500">Name</th>
                <th className="text-left p-4 text-sm text-slate-500">Email</th>
                <th className="text-left p-4 text-sm text-slate-500">Role</th>
                <th className="text-left p-4 text-sm text-slate-500">
                  User Status
                </th>
                <th className="text-left p-4 text-sm text-slate-500">
                  Account No
                </th>
                <th className="text-left p-4 text-sm text-slate-500">
                  Account Status
                </th>
                <th className="text-left p-4 text-sm text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrentAdmin = user.email === currentEmail;

                  return (
                    <tr key={user.id} className="border-t hover:bg-slate-50">
                      <td className="p-4 font-semibold text-slate-900 whitespace-nowrap">
                        {user.fullName}
                      </td>

                      <td className="p-4 text-slate-700 whitespace-nowrap">
                        {user.email}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.enabled
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.enabled ? "ENABLED" : "DISABLED"}
                        </span>
                      </td>

                      <td className="p-4 text-slate-700 whitespace-nowrap">
                        {user.accountNumber}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.accountStatus === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : user.accountStatus === "FROZEN"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {user.accountStatus}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {isCurrentAdmin ? (
                          <span className="text-sm text-slate-400">
                            Current Admin
                          </span>
                        ) : user.enabled ? (
                          <button
                            type="button"
                            onClick={() => handleDisable(user.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 text-sm font-semibold"
                          >
                            Disable
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleEnable(user.id)}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 text-sm font-semibold"
                          >
                            Enable
                          </button>
                        )}
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
            Swipe left/right to view full user details and actions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Users;
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import FraudAlerts from "./pages/FraudAlerts";
import AuditLogs from "./pages/AuditLogs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Beneficiaries from "./pages/Beneficiaries";
import Users from "./pages/Users";
import Reports from "./pages/Reports";

function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const role = sessionStorage.getItem("role");

  if (role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/beneficiaries" element={<Beneficiaries />} />
                <Route path="/profile" element={<Profile />} />

                <Route
                  path="/users"
                  element={
                    <AdminRoute>
                      <Users />
                    </AdminRoute>
                  }
                />

                <Route
                  path="/fraud-alerts"
                  element={
                    <AdminRoute>
                      <FraudAlerts />
                    </AdminRoute>
                  }
                />

                <Route
                  path="/audit-logs"
                  element={
                    <AdminRoute>
                      <AuditLogs />
                    </AdminRoute>
                  }
                />

                <Route
                  path="/reports"
                  element={
                    <AdminRoute>
                      <Reports />
                    </AdminRoute>
                  }
                />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
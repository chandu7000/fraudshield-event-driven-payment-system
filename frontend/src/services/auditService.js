import api from "../api/axios";

export const getAllAuditLogs = () => {
  return api.get("/api/audit-logs");
};
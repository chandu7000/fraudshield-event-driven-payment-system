import api from "../api/axios";

export const getAllFraudAlerts = () => {
  return api.get("/api/fraud-alerts");
};

export const resolveFraudAlert = (alertId) => {
  return api.put(`/api/fraud-alerts/${alertId}/resolve`);
};
import axiosInstance from "../api/axios";

export const getTransactionSummaryReport = async () => {
  const response = await axiosInstance.get(
    "/api/reports/transaction-summary"
  );

  return response.data;
};

export const getFraudAnalyticsReport = async () => {
  const response = await axiosInstance.get(
    "/api/reports/fraud-analytics"
  );

  return response.data;
};

export const getAccountAnalyticsReport = async () => {
  const response = await axiosInstance.get(
    "/api/reports/account-analytics"
  );

  return response.data;
};

export const getMonthlyTransactionTrend = async () => {
  const response = await axiosInstance.get(
    "/api/reports/monthly-transaction-trend"
  );

  return response.data;
};
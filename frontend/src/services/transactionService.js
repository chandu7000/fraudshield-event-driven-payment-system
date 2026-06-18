import api from "../api/axios";

export const getAllTransactions = () => {
  return api.get("/api/transactions");
};

export const getMyTransactions = () => {
  return api.get("/api/transactions/my");
};

export const createTransaction = (transactionData) => {
  return api.post("/api/transactions", transactionData);
};

export const createMyTransfer = (transferData) => {
  return api.post("/api/transactions/my-transfer", transferData);
};
import api from "../api/axios";

export const getAllAccounts = () => {
  return api.get("/api/accounts");
};

export const getMyAccounts = () => {
  return api.get("/api/accounts/my");
};

export const lookupAccount = (accountNumber) => {
  return api.get(`/api/accounts/lookup/${accountNumber}`);
};

export const createAccount = (accountData) => {
  return api.post("/api/accounts", accountData);
};

export const freezeAccount = (accountNumber) => {
  return api.put(`/api/accounts/${accountNumber}/freeze`);
};

export const unfreezeAccount = (accountNumber) => {
  return api.put(`/api/accounts/${accountNumber}/unfreeze`);
};
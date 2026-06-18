import api from "../api/axios";

export const getMyBeneficiaries = () => {
  return api.get("/api/beneficiaries");
};

export const addBeneficiary = (data) => {
  return api.post("/api/beneficiaries", data);
};

export const deleteBeneficiary = (id) => {
  return api.delete(`/api/beneficiaries/${id}`);
};

export const lookupAccount = (accountNumber) => {
  return api.get(`/api/accounts/lookup/${accountNumber}`);
};
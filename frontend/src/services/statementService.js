import api from "../api/axios";

export const getMyStatement = (from, to) => {
  return api.get(`/api/statements/my?from=${from}&to=${to}`);
};
import api from "../api/axios";

export const getProfile = () => {
  return api.get("/api/profile");
};

export const changePassword = (passwordData) => {
  return api.post("/api/profile/change-password", passwordData);
};
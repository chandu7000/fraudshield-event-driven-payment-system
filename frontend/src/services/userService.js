import api from "../api/axios";

export const getAllUsersForAdmin = () => {
  return api.get("/api/auth/admin/users");
};

export const disableUser = (userId) => {
  return api.put(`/api/auth/admin/users/${userId}/disable`);
};

export const enableUser = (userId) => {
  return api.put(`/api/auth/admin/users/${userId}/enable`);
};
import api from "../api/axios";

export const getMyNotifications = () => {
  return api.get("/api/notifications/my");
};

export const getUnreadNotifications = () => {
  return api.get("/api/notifications/my/unread");
};

export const markNotificationAsRead = (id) => {
  return api.put(`/api/notifications/${id}/read`);
};
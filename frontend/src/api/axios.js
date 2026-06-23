import axios from "axios";

const api = axios.create({
  baseURL:
    "https://fraudshield-event-driven-payment-system-production.up.railway.app",
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("fullName");

      alert("Your session has expired. Please login again.");

      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

export default api;
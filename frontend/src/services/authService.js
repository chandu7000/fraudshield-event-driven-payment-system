import axiosInstance from "../api/axios";

export const loginUser = async (loginData) => {
  const response = await axiosInstance.post("/api/auth/login", loginData);
  return response.data;
};

export const registerUser = async (registerData) => {
  const response = await axiosInstance.post("/api/auth/register", registerData);
  return response.data;
};

export const sendOtp = async (email) => {
  const response = await axiosInstance.post("/api/auth/send-otp", {
    email,
  });
  return response.data;
};

export const verifyOtp = async (email, otp) => {
  const response = await axiosInstance.post("/api/auth/verify-otp", {
    email,
    otp,
  });
  return response.data;
};

export const sendForgotPasswordOtp = async (email) => {
  const response = await axiosInstance.post("/api/auth/forgot-password/send-otp", {
    email,
  });
  return response.data;
};

export const verifyForgotPasswordOtp = async (email, otp) => {
  const response = await axiosInstance.post("/api/auth/forgot-password/verify-otp", {
    email,
    otp,
  });
  return response.data;
};

export const resetPassword = async (resetData) => {
  const response = await axiosInstance.post("/api/auth/reset-password", resetData);
  return response.data;
};
import axios from "axios";

const API = axios.create({
  baseURL: "/api/auth",
});

export const requestPasswordResetOTP = async (email, role) => {
  const { data } = await API.post("/forgot-password", { email, role });
  return data;
};

export const verifyPasswordResetOTP = async (email, role, otp) => {
  const { data } = await API.post("/verify-otp", { email, role, otp });
  return data;
};

export const resetPasswordWithOTP = async (email, role, otp, newPassword) => {
  const { data } = await API.post("/reset-password", { email, role, otp, newPassword });
  return data;
};

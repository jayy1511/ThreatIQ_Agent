import axios from "axios";
import { auth } from "./firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the Firebase token
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      // Use the set method to properly set headers in Axios
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  } catch (error) {
    console.error("Error attaching token:", error);
  }
  return config;
});

export const analyzeMessage = async (
  message: string,
  userGuess: string,
  userId: string
) => {
  const response = await api.post("/api/analyze", {
    message,
    user_guess: userGuess,
    user_id: userId,
  });
  return response.data;
};

export const analyzePublicMessage = async (
  message: string,
  userGuess: string,
  userId: string
) => {
  const response = await api.post("/api/analyze-public", {
    message,
    user_guess: userGuess,
    user_id: userId,
  });
  return response.data;
};

export const getUserProfile = async (userId: string) => {
  const response = await api.get(`/api/profile/${userId}`);
  return response.data.profile;
};

export const getUserSummary = async (userId: string) => {
  const response = await api.get(`/api/profile/${userId}/summary`);
  return response.data;
};

export const getUserHistory = async (userId: string) => {
  const response = await api.get(`/api/profile/${userId}/history`);
  return response.data.history;
};

export const getGmailStatus = async () => {
  const response = await api.get("/api/gmail/status");
  return response.data;
};

export const getGmailConnectUrl = async () => {
  const response = await api.get("/api/gmail/connect");
  return response.data;
};

export const disconnectGmail = async () => {
  const response = await api.post("/api/gmail/disconnect");
  return response.data;
};

export const runGmailTriage = async (params: {
  limit?: number;
  mark_spam?: boolean;
  archive_safe?: boolean;
}) => {
  const response = await api.post("/api/gmail/triage", params);
  return response.data;
};

export const getGmailHistory = async (limit: number = 50) => {
  const response = await api.get(`/api/gmail/history?limit=${limit}`);
  return response.data;
};

export default api;


import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export const fetchUsers = async () =>
  axios.get(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("chat-token")}`,
    },
  });

export const fetchMessages = (userId, recipientId) =>
  axios.get(`${API_URL}/messages?userId=${userId}&recipientId=${recipientId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("chat-token")}`,
    },
  });

export const login = async (userData) =>
  axios.post(`${API_URL}/auth/login`, userData);

export const register = async (userData) =>
  axios.post(`${API_URL}/auth/register`, userData);

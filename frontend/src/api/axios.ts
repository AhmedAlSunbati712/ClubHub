/**
 * axios.ts   Ahmed Al Sunbati
 * CS61     Spring 26
 * 
 * Description: Defines a custom axios object, with an api interceptor that attaches bearer token on each request if available
 */
import axios from "axios";
import { SERVER_URL } from "../constants/server_url";

const api = axios.create({
  baseURL: SERVER_URL || "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;

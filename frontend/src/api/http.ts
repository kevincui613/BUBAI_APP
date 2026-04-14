import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const http = axios.create({
  baseURL,
  timeout: 60000  // 增加超时时间
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  const userNickname = localStorage.getItem("userNickname");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (userNickname) {
    // 对中文进行 URL 编码，避免报错
    config.headers["X-User-Nickname"] = encodeURIComponent(userNickname);
  }
  
  return config;
});
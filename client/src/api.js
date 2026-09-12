import axios from "axios";

// const api = axios.create({ baseURL: "http://localhost:5000/api" });

const api = axios.create({
  baseURL: "https://resolvehub-backend-ns1u.onrender.com/api"
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("helpdesk_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

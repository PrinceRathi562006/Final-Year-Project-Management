import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV
      ? "http://localhost:4000/api/v1"
      : "https://final-year-project-management-jm2a.onrender.com/api/v1"),
  withCredentials: true,
});

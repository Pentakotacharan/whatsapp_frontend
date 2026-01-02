import axios from "axios";

const api = axios.create({
  baseURL: "https://whatsapp-backend-rho-sepia.vercel.app//api", // Your Backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
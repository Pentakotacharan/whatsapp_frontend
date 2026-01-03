import axios from "axios";
// https://whatsapp-backend-rho-sepia.vercel.app
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Your Backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
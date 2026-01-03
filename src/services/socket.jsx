import io from "socket.io-client";

// Replace with your actual backend URL
const ENDPOINT = "https://whatsapp-backend-rho-sepia.vercel.app"; 

// Create a socket instance
export const socket = io(ENDPOINT, {
  autoConnect: false, // Wait until we manually call .connect()
});
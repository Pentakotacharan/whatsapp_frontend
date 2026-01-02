import io from "socket.io-client";

// Replace with your actual backend URL
const ENDPOINT = "http://localhost:5000"; 

// Create a socket instance
export const socket = io(ENDPOINT, {
  autoConnect: false, // Wait until we manually call .connect()
});
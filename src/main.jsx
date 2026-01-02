import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ChatProvider from "./context/ChatProvider";
import "./index.css"; 

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // Add the future flags prop here
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ChatProvider>
      <App />
    </ChatProvider>
  </BrowserRouter>
);
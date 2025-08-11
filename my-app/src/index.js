import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

// Wrap App in BrowserRouter so routing works
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // Temporarily comment out StrictMode to test if it's causing the issue
  // <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  // </React.StrictMode>
);
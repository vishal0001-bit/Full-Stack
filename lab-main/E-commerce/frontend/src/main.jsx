import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { StoreProvider } from "./context/StoreContext.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <App />
        <Toaster position="top-center" toastOptions={{ duration: 2800 }} />
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

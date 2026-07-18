import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { UserProvider } from "./modules/user/context/UserContext";
import { CaretakerProvider } from "./modules/caretaker/context/CaretakerContext.jsx";
import { AdminProvider } from "./modules/admin/context/AdminContext.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <UserProvider>
      <CaretakerProvider>
        <AdminProvider>
          <App />
        </AdminProvider>
      </CaretakerProvider>
    </UserProvider>
  </BrowserRouter>
);

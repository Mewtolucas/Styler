import React from "react";
import { createRoot } from "react-dom/client";
import YijingApp from "./yijing/YijingApp.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <YijingApp />
  </React.StrictMode>
);

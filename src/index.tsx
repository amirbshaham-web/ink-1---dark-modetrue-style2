import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DarkModeTrueStyle } from "./screens/DarkModeTrueStyle";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <DarkModeTrueStyle />
  </StrictMode>,
);

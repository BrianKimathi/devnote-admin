import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { ThemeProvider } from "./context/ThemeContext";
import { BrowserRouter } from "react-router-dom";
import store from "./redux/store";
import "./index.css";
import App from "./App.jsx";
import AuthInitializer from "./AuthInitializer"; // Import here

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthInitializer>
            <App />
          </AuthInitializer>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>
);

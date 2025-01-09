import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Devlogs from "./pages/Devlogs";
import Devnotes from "./pages/Devnotes";
import Login from "./pages/Login";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  return isLoggedIn ? children : <Navigate to="/login" />;
};

const App = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  return (
    <Router>
      <div
        className={`min-h-screen ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
        {isLoggedIn && <Navbar />}
        <div className="flex pt-12">
          {isLoggedIn && <Sidebar />}
          <div className="flex-grow ml-0 md:ml-64 p-4">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/devlogs"
                element={
                  <ProtectedRoute>
                    <Devlogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/devnotes"
                element={
                  <ProtectedRoute>
                    <Devnotes />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;

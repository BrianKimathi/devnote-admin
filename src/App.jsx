// App.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Devlogs from "./pages/Devlogs";
import Devnotes from "./pages/Devnotes";
import Profile from "./pages/Profile";
import Login from "./pages/Login";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  return isLoggedIn ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => (
  <div className="flex pt-12">
    <Sidebar />
    <div className="flex-grow ml-0 md:ml-64 p-4">{children}</div>
  </div>
);

const UnauthLayout = ({ children }) => (
  <div className="flex items-center justify-center min-h-screen">
    {children}
  </div>
);

const App = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const location = useLocation();

  // Decide layout based on auth state and current route
  const isAuthRoute = location.pathname === "/login";

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {isLoggedIn && <Navbar />}
      {isLoggedIn || !isAuthRoute ? (
        <AppLayout>
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
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
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
        </AppLayout>
      ) : (
        // Unauthenticated layout: centered content
        <UnauthLayout>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* You could add other public routes here */}
          </Routes>
        </UnauthLayout>
      )}
    </div>
  );
};

export default App;

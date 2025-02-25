import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/themeSlice";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

const Navbar = ({ toggleSidebar }) => {
  const darkMode = useSelector((state) => state.theme.darkMode); // Get dark mode state from Redux
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleToggleDarkMode = () => dispatch(toggleTheme());

  const handleLogout = async () => {
    try {
      await signOut(auth);       // Sign out from Firebase
      dispatch(logout());         // Update Redux state
      navigate("/login");         // Redirect to login page
    } catch (error) {
      console.error("Error during logout:", error);
      // Optionally show an error message to the user
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full px-4 py-3 z-50 flex justify-between items-center shadow-md ${
        darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      }`}
    >
      <button
        onClick={toggleSidebar}
        className="text-2xl p-2 rounded-full border border-gray-500 hover:bg-gray-500 hover:text-white transition md:hidden"
      >
        ☰
      </button>
      <div className="text-lg font-bold">Admin Panel</div>
      <div className="flex items-center space-x-4">
        <button
          onClick={handleToggleDarkMode}
          className="p-2 rounded-full border border-gray-500 hover:bg-gray-500 hover:text-white transition"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
        <div className="relative">
          <div
            className="w-8 h-8 bg-gray-700 rounded-full cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          ></div>
          {dropdownOpen && (
            <div
              className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg py-2 ${
                darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800"
              }`}
            >
              <a
                href="/profile"
                className="block px-4 py-2 hover:bg-gray-600 hover:text-white"
              >
                Profile
              </a>
              <button
                onClick={handleLogout}
                className="w-full text-left block px-4 py-2 hover:bg-gray-600 hover:text-white"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;

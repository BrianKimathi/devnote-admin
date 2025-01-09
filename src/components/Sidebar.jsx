import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Sidebar = ({ isVisible, closeSidebar }) => {
  const darkMode = useSelector((state) => state.theme.darkMode); // Get dark mode state from Redux

  return (
    <div
      className={`w-64 h-screen fixed top-[64px] left-0 flex flex-col shadow-lg transition-transform transform ${
        isVisible ? "translate-x-0" : "-translate-x-full"
      } ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"} md:translate-x-0`}
    >
      <nav className="flex-grow">
        <ul className="space-y-2">
          <li>
            <Link
              to="/"
              className={`block py-2 px-4 ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
              }`}
              onClick={closeSidebar}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/users"
              className={`block py-2 px-4 ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
              }`}
              onClick={closeSidebar}
            >
              Users
            </Link>
          </li>
          <li>
            <Link
              to="/devlogs"
              className={`block py-2 px-4 ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
              }`}
              onClick={closeSidebar}
            >
              Devlogs
            </Link>
          </li>
          <li>
            <Link
              to="/devnotes"
              className={`block py-2 px-4 ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
              }`}
              onClick={closeSidebar}
            >
              Devnotes
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

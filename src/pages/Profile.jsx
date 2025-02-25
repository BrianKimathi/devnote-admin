import React, { useState } from "react";
import { useSelector } from "react-redux";
import { auth, db } from "../config/firebase";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { ref, update } from "firebase/database";

const Profile = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode); // Access dark/light mode state from Redux
  const [userDetails, setUserDetails] = useState({
    name: auth.currentUser?.displayName || "Unknown User",
    email: auth.currentUser?.email || "Unknown Email",
    role: "User",
  });

  const [changePassword, setChangePassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [newName, setNewName] = useState(userDetails.name); // State for changing name

  // Handle password change input
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setChangePassword((prev) => ({ ...prev, [name]: value }));
  };

  // Handle name change input
  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };

  // Submit updated name
  const handleNameSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!newName.trim()) {
        alert("Name cannot be empty!");
        return;
      }

      // Update Firebase Auth Profile
      await updateProfile(auth.currentUser, { displayName: newName });

      // Update the user's name in the Realtime Database (optional)
      const userRef = ref(db, `users/${auth.currentUser.uid}`);
      await update(userRef, { name: newName });

      setUserDetails((prev) => ({ ...prev, name: newName })); // Update UI
      alert("Name successfully updated!");
    } catch (error) {
      console.error("Error updating name:", error);
      alert("Failed to update name. Please try again.");
    }
  };

  // Submit updated password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      if (changePassword.newPassword !== changePassword.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      // Reauthenticate user before updating password
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        changePassword.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, changePassword.newPassword);

      alert("Password successfully updated!");
      setChangePassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password. Please try again.");
    }
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      alert("Logged out successfully!");
    });
  };

  return (
    <div
      className={`p-4 sm:p-8 max-w-4xl mx-auto transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      {/* User Details */}
      <div
        className={`shadow-md rounded-lg p-4 mb-6 transition-colors ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">User Details</h2>
        <div className="space-y-2">
          <p>
            <strong>Name:</strong> {userDetails.name}
          </p>
          <p>
            <strong>Email:</strong> {userDetails.email}
          </p>
          <p>
            <strong>Role:</strong> {userDetails.role}
          </p>
        </div>
      </div>

      {/* Change Name */}
      <div
        className={`shadow-md rounded-lg p-4 mb-6 transition-colors ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">Update Name</h2>
        <form onSubmit={handleNameSubmit}>
          <div className="mb-4">
            <label
              htmlFor="newName"
              className="block text-sm font-medium mb-2"
            >
              New Name
            </label>
            <input
              type="text"
              id="newName"
              value={newName}
              onChange={handleNameChange}
              className={`w-full p-2 border rounded-lg focus:outline-none transition-colors ${
                isDarkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Update Name
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div
        className={`shadow-md rounded-lg p-4 mb-6 transition-colors ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit}>
          <div className="mb-4">
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium mb-2"
            >
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={changePassword.currentPassword}
              onChange={handlePasswordChange}
              className={`w-full p-2 border rounded-lg focus:outline-none transition-colors ${
                isDarkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium mb-2"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={changePassword.newPassword}
              onChange={handlePasswordChange}
              className={`w-full p-2 border rounded-lg focus:outline-none transition-colors ${
                isDarkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={changePassword.confirmPassword}
              onChange={handlePasswordChange}
              className={`w-full p-2 border rounded-lg focus:outline-none transition-colors ${
                isDarkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Profile;
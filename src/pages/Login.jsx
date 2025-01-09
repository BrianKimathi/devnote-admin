import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get, set, update, push } from "firebase/database"; // Import push
import { auth, db } from "../config/firebase";
import { loginSuccess } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Authenticate user
      await signInWithEmailAndPassword(auth, email, password);

      // Reference to the adminList in Firebase
      const adminRef = ref(db, "devnote/adminList");

      // Check if the email already exists in the adminList
      const snapshot = await get(adminRef);
      if (snapshot.exists()) {
        const adminList = snapshot.val();
        if (!Object.values(adminList).includes(email)) {
          // Add the email to adminList if it doesn't already exist
          const newAdminKey = push(adminRef).key; // Generate a unique key for the email
          await update(adminRef, { [newAdminKey]: email });
        }
      } else {
        // If adminList doesn't exist, initialize it with the current email
        await set(adminRef, { [push(adminRef).key]: email });
      }

      // Dispatch login success and navigate to the dashboard
      dispatch(loginSuccess({ email }));
      navigate("/");
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h1 className="text-xl font-bold mb-4">Login</h1>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "../config/firebase";
import { loginSuccess } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  // Redirect already logged-in users to the dashboard
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const handleError = (error) => {
    switch (error.code) {
      case "auth/user-not-found":
        return "User not found. Please check your email.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/too-many-requests":
        return "Too many login attempts. Please try again later.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Authenticate user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { email: authenticatedEmail } = userCredential.user;

      // Reference to the adminList in Firebase
      const adminRef = ref(db, "devnote/adminList");

      // Check if the user exists in adminList
      const snapshot = await get(adminRef);
      if (snapshot.exists()) {
        const adminList = Object.values(snapshot.val());
        if (!adminList.includes(authenticatedEmail)) {
          setError("You do not have admin privileges.");
          return;
        }
      } else {
        setError("No admin privileges found in the system.");
        return;
      }

      // Dispatch login success
      dispatch(loginSuccess({ email: authenticatedEmail }));
      navigate("/");
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
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
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;

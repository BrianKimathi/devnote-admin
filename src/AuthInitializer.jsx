// src/AuthInitializer.jsx
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { useDispatch } from "react-redux";
import { loginSuccess } from "./redux/authSlice";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(loginSuccess({ email: user.email }));
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  return children;
};

export default AuthInitializer;

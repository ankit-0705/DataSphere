"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Image from "next/image";
import Logo from "@/public/DataSphere.png";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface LoginModalProps {
  onClose: () => void;
  onSwitchToSignup: () => void;
  onLoginSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  onClose,
  onSwitchToSignup,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);

      const token = await auth.currentUser?.getIdToken();

      // Set secure session cookie
      await fetch("/api/session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      onLoginSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);

      const token = await auth.currentUser?.getIdToken();

      await fetch("/api/session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      onLoginSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new OAuthProvider("apple.com");
      await signInWithPopup(auth, provider);

      const token = await auth.currentUser?.getIdToken();

      await fetch("/api/session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      onLoginSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Apple login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-md sm:max-w-lg p-8 rounded-2xl shadow-lg bg-white/5 border border-white/10 backdrop-blur-xl transition-all"
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl cursor-pointer"
            aria-label="Close login form"
          >
            &times;
          </button>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src={Logo}
              alt="Logo"
              width={48}
              height={48}
              className="rounded-md shadow-sm drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            />
          </div>

          <h2 className="text-center text-white text-2xl font-semibold mb-1">
            Welcome back
          </h2>
          <p className="text-center text-white/60 mb-6">
            Please enter your details to sign in.
          </p>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-transparent border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white focus:outline-none cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <motion.span
                  key={showPassword ? "eye-off" : "eye"}
                  initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotate: 15 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </motion.span>
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition cursor-pointer"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="flex items-center my-6 text-white/40 text-sm">
            <span className="border-b border-white/20 w-full mr-4" />
            OR
            <span className="border-b border-white/20 w-full ml-4" />
          </div>

          {/* Social */}
          <div className="mt-6 space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 flex items-center justify-center space-x-3 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 transition cursor-pointer"
            >
              <FcGoogle className="text-xl" />
              <span>Continue with Google</span>
            </button>

            <button
              onClick={handleAppleLogin}
              className="w-full py-3 flex items-center justify-center space-x-3 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 transition cursor-pointer"
            >
              <FaApple className="text-xl" />
              <span>Continue with Apple</span>
            </button>
          </div>

          {/* Switch */}
          <p className="mt-6 text-sm text-center text-white/70">
            Don’t have an account?{" "}
            <button
              onClick={onSwitchToSignup}
              className="underline text-white hover:text-white/90 font-medium cursor-pointer"
            >
              Create account
            </button>
          </p>

          {/* Optional error display */}
          {error && (
            <p className="text-red-400 text-sm text-center mt-4">{error}</p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginModal;

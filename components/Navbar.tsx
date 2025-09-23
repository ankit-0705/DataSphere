"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type NavbarProps = {
  onLoginClick: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setMenuOpen(false); // close mobile menu after clicking link
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-6 z-30"
    >
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-md shadow-white/10 flex items-center justify-between px-6 py-2 text-gray-200">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            setMenuOpen(false);
          }}
        >
          <Image
            src="/DataSphere.png"
            alt="DataSphere Logo"
            width={35}
            height={35}
            className="rounded-md shadow-sm drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          />
        </div>

        {/* Desktop Links */}
        <ul className="hidden md:flex gap-8 text-sm font-light">
          {[
            { id: "works", label: "How it works" },
            { id: "features", label: "Features" },
            { id: "community", label: "Community" },
            { id: "usecase", label: "UseCase" },
            { id: "dataset", label: "Dataset Info" },
          ].map(({ id, label }) => (
            <li
              key={id}
              className="cursor-pointer text-gray-300 hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.5)] transition"
              onClick={() => handleScrollTo(id)}
            >
              {label}
            </li>
          ))}
        </ul>

        {/* Mobile Hamburger & Login Button */}
        <div className="flex items-center gap-4">
          {/* Login button desktop */}
          <button
            onClick={onLoginClick}
            className="hidden md:inline-block px-4 py-1.5 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/20 hover:shadow-[0_0_10px_rgba(255,255,255,0.3)] transition cursor-pointer"
          >
            Login
          </button>

          {/* Hamburger menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="md:hidden flex flex-col justify-center items-center gap-1 w-8 h-8"
          >
            <span
              className={`block w-6 h-0.5 bg-white rounded transition-transform duration-300 ${
                menuOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-white rounded transition-opacity duration-300 ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-white rounded transition-transform duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            ></span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/10 backdrop-blur-md border border-white/20 rounded-b-lg mt-1 px-6 py-4 flex flex-col gap-4 text-gray-200 text-base font-light"
          >
            {[
              { id: "works", label: "How it works" },
              { id: "features", label: "Features" },
              { id: "community", label: "Community" },
              { id: "usecase", label: "UseCase" },
              { id: "dataset", label: "Dataset Info" },
            ].map(({ id, label }) => (
              <li
                key={id}
                className="cursor-pointer hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.5)] transition"
                onClick={() => handleScrollTo(id)}
              >
                {label}
              </li>
            ))}
            <button
              onClick={() => {
                onLoginClick();
                setMenuOpen(false);
              }}
              className="px-4 py-2 rounded-full border border-white/30 text-white font-semibold hover:bg-white/20 hover:shadow-[0_0_10px_rgba(255,255,255,0.3)] transition cursor-pointer"
            >
              Login
            </button>
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;

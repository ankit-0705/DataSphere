"use client";

import React, { useRef, useState, FormEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { sendForm } from "@emailjs/browser";
import { StarrySkyBackground } from "@/components/StarrySkyBackground";
import FloatingDock from "@/components/ui/floating-dock";
import { Button } from "@/components/ui/stateful-button";
import LandingGlobe from "../../components/LandingGlobe";

// Tabler icons
import {
  IconLayoutDashboard,
  IconDatabase,
  IconUserCircle,
  IconInfoCircle,
  IconTrophy,
  IconMail,
  IconBrandLinkedin,
  IconBrandInstagram,
  IconBrandGithub
} from "@tabler/icons-react";

const templateId = process.env.NEXT_PUBLIC_TEMPLATE_ID!;
const serviceId = process.env.NEXT_PUBLIC_SERVICE_ID!;
const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY!;

const links = [
  { title: "Dashboard", icon: <IconLayoutDashboard />, href: "/dashboard" },
  { title: "Datasets", icon: <IconDatabase />, href: "/datasets" },
  { title: "Profile", icon: <IconUserCircle />, href: "/profile" },
  { title: "Leaderboard", icon: <IconTrophy />, href: "/leaderboard" },
  { title: "About Us", icon: <IconInfoCircle />, href: "/about" },
  { title: "Contact", icon: <IconMail />, href: "/contact" },
];

const Contact = () => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  if (!formRef.current) return;

  // Check if form is valid
  if (!formRef.current.checkValidity()) {
    // This will trigger the native HTML validation UI
    formRef.current.reportValidity();
    return; // Stop here, don't proceed or show loading
  }

  setLoading(true);
  setMessage("");

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await sendForm(serviceId, templateId, formRef.current, publicKey);
    formRef.current.reset();
    setMessage("Message sent successfully!");
    setTimeout(() => setMessage(""), 3000);
  } catch (error) {
    console.error(error);
    setMessage("Failed to send message. Please try again later.");
    setTimeout(() => setMessage(""), 4000);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Background */}
      <StarrySkyBackground />

      {/* Globe */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-0"
        initial={{ opacity: 0, scale: 0.9, x: 0 }}
        animate={{ opacity: 1, scale: 1.05, x: 75 }}  // shift right by 20px
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <LandingGlobe />
      </motion.div>


      {/* Main Content */}
      <div className="relative flex items-center justify-center min-h-screen px-6 md:px-16 lg:px-24 z-10">
        <motion.div
          className="relative w-full max-w-6xl bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.1)] p-8 flex flex-col space-y-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Top Header */}
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <Image
                src="/DataSphere.png"
                alt="DataSphere Logo"
                width={35}
                height={35}
                className="rounded shadow drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
              />
              <h1 className="text-lg font-extrabold bg-gradient-to-r from-gray-200 via-gray-400 to-white bg-clip-text text-transparent tracking-wide drop-shadow-md">
                DataSphere
              </h1>
            </div>

            <h2 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-extrabold bg-gradient-to-r from-gray-200 via-gray-400 to-white bg-clip-text text-transparent tracking-wide">
              Contact
            </h2>
          </div>

          {/* Horizontal Layout */}
          <div className="flex flex-col md:flex-row gap-10">
            {/* Left Side - Info */}
            <div className="w-full md:w-1/2 space-y-6">
              <p className="text-gray-300 text-lg">
                Have a question, suggestion, or just an idea to share? We’d love to hear from you. Whether you’re a student searching for the perfect dataset or a developer contributing your own, DataSphere is built for and by people like you. We believe in the power of community, and your feedback doesn’t just help us improve it helps shape the future of this platform. So if you’re stuck, inspired, or simply curious, don’t hesitate to reach out. We’re here to listen, support, and build DataSphere together with you. Your insights and experiences are invaluable in making this platform better every day.
              </p>



              <div className="flex flex-col gap-3 text-gray-300 pt-6">
                {/* Email */}
                <div className="flex items-center gap-2">
                  <IconMail className="text-white w-5 h-5" />
                  <span className="text-white">ankitsangwan0705@gmail.com</span>
                </div>

                {/* Social Links Row */}
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <IconBrandLinkedin className="text-white w-5 h-5" />
                    <a
                      href="https://www.linkedin.com/in/ankit-sangwan-0786b5293/"
                      className="text-white hover:underline"
                      target="_blank"
                    >
                      LinkedIn
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconBrandGithub className="text-white w-5 h-5" />
                    <a
                      href="https://github.com/ankit-0705"
                      className="text-white hover:underline"
                      target="_blank"
                    >
                      Github
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconBrandInstagram className="text-white w-5 h-5" />
                    <a
                      href="https://www.instagram.com/ankitsangwan0705/"
                      className="text-white hover:underline"
                      target="_blank"
                    >
                      Instagram
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <motion.form
              ref={formRef}
              onSubmit={handleSubmit}
              className="w-full md:w-1/2 space-y-6"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                required
                className="w-full px-5 py-3 rounded-md border border-white/10 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                autoComplete="name"
                disabled={loading}
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                required
                className="w-full px-5 py-3 rounded-md border border-white/10 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                autoComplete="email"
                disabled={loading}
              />
              <textarea
                name="message"
                rows={5}
                placeholder="Your Message"
                required
                className="w-full px-5 py-3 rounded-md border border-white/10 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white resize-none transition-all"
                disabled={loading}
              ></textarea>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-gray-200 font-semibold py-3 rounded-md transition-all duration-300 cursor-pointer shadow-md border border-gray-600 select-none"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </Button>


              {message && (
                <p
                  className={`mt-2 text-sm ${
                    message.toLowerCase().includes("success")
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                  role="alert"
                >
                  {message}
                </p>
              )}
            </motion.form>
          </div>
        </motion.div>
      </div>

      {/* Floating Dock */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <FloatingDock items={links} />
      </div>
    </div>
  );
};

export default Contact;

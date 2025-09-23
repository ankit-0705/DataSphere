"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { StarrySkyBackground } from "@/components/StarrySkyBackground";
import FloatingDock from "@/components/ui/floating-dock";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import LandingGlobe from "@/components/LandingGlobe";

// Tabler icons
import {
  IconLayoutDashboard,
  IconDatabase,
  IconUserCircle,
  IconInfoCircle,
  IconTrophy,
  IconMail,
} from "@tabler/icons-react";

const links = [
  { title: "Dashboard", icon: <IconLayoutDashboard />, href: "/dashboard" },
  { title: "Datasets", icon: <IconDatabase />, href: "/datasets" },
  { title: "Profile", icon: <IconUserCircle />, href: "/profile" },
  { title: "Leaderboard", icon: <IconTrophy />, href: "/leaderboard" },
  { title: "About Us", icon: <IconInfoCircle />, href: "/about" },
  { title: "Contact", icon: <IconMail />, href: "/contact" },
];

const testimonials = [
  {
    quote:
      "DataSphere is a community-driven platform designed to help developers and students find, share, and explore datasets for coding and machine learning projects. Our mission is to make quality datasets accessible and easy to discover, so your ideas don’t get stuck because of missing data.",
    name: "DataSphere Platform",
    designation: "Introduction",
    src: "/DataSphereBG.jpg",
  },
  {
    quote:
      "The inspiration behind DataSphere comes from real challenges I faced during my college projects. From struggling to find a number plate dataset in my second year to hunting for disease outbreak data in my third year, accessing the right data was always a frustrating and time-consuming process.",
    name: "Ankit Sangwan",
    designation: "Founder’s Story",
    src: "/profile.jpg",
  },
  {
    quote:
      "Many students and developers face this same issue, sometimes abandoning promising projects due to a lack of accessible datasets. DataSphere was created to solve this problem by building a community where everyone can contribute and discover datasets easily.",
    name: "Student Developer",
    designation: "Common Challenges",
    src: "/Developer.jpg",
  },
  {
    quote:
      "DataSphere is not meant to compete with large platforms like Kaggle or Hugging Face. Instead, it’s tailored for students, indie developers, and early learners who need quick access to relevant datasets for their projects.",
    name: "DataSphere Vision",
    designation: "Why We Exist",
    src: "/Vision.jpg",
  },
  {
    quote:
      "Whether you’re searching for datasets or want to contribute your own, DataSphere welcomes you to be part of a growing community dedicated to making data more accessible. Together, we can support each other and fuel creativity in the world of coding and machine learning.",
    name: "Contributor",
    designation: "Join Us",
    src: "/Community.jpg",
  },
];

const About = () => {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Backgrounds */}
      <StarrySkyBackground />

      {/* Main Content */}
      <div className="relative flex items-center justify-center min-h-screen px-6 md:px-16 lg:px-24 z-10">
        <motion.div
          className="relative w-full max-w-5xl bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.1)] p-8 flex flex-col"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Header */}
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

            <h2 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-extrabold bg-gradient-to-r from-gray-200 via-gray-400 to-white bg-clip-text text-transparent tracking-wide">
              About Us
            </h2>
          </div>

          {/* Testimonials Section */}
          <div>
            <AnimatedTestimonials testimonials={testimonials} />
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

export default About;

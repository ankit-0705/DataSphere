"use client";

import React, { useState } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { Send } from "lucide-react";
import LandingGlobe from "../../components/LandingGlobe";
import { StarrySkyBackground } from "../../components/StarrySkyBackground";
import { InfiniteMovingCards } from "../../components/ui/infinite-moving-card";
import Navbar from "../../components/Navbar";
import Section from "../../components/Section";
import LoginModal from "../../components/Login";
import SignupModal from "../../components/Signup";
import { useRouter } from "next/navigation";

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.5, ease: "easeIn" } },
};

const testimonials = [
  {
    quote: "It was the best of times, it was the worst of times...",
    name: "Charles Dickens",
    title: "A Tale of Two Cities",
  },
  {
    quote: "To be, or not to be, that is the question...",
    name: "William Shakespeare",
    title: "Hamlet",
  },
  {
    quote: "All that we see or seem is but a dream within a dream.",
    name: "Edgar Allan Poe",
    title: "A Dream Within a Dream",
  },
  {
    quote: "It is a truth universally acknowledged...",
    name: "Jane Austen",
    title: "Pride and Prejudice",
  },
  {
    quote: "Call me Ishmael...",
    name: "Herman Melville",
    title: "Moby-Dick",
  },
];

const LandingPage = () => {
  const [hovered, setHovered] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const router = useRouter();

  return (
    <div className="relative bg-black overflow-x-hidden">
      <StarrySkyBackground />
      <Navbar onLoginClick={() => setShowLoginModal(true)} />

      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col md:flex-row items-center justify-center px-6 sm:px-10 md:px-16 lg:px-24 overflow-hidden z-20">
        <motion.div
          className="w-full md:w-3/5 text-center md:text-left"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-wide">
            DataSphere — Your Community-Powered Dataset Hub
          </h1>
          <p className="mt-6 text-gray-300 text-base sm:text-lg max-w-md mx-auto md:mx-0">
            Finding quality datasets for coding or ML projects can be frustrating.
            DataSphere connects students and developers worldwide, letting you find,
            share, and explore datasets easily — so great ideas don&#39;t get stuck.
          </p>
        </motion.div>

        <motion.div
          className="mt-12 md:mt-0 relative w-full md:w-2/5 h-60 sm:h-80 md:h-[32rem] pointer-events-none z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1.15 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <LandingGlobe />
        </motion.div>
      </div>

      {/* Sections */}
      <Section
        id="works"
        title="How It Works"
        imgSrc="/mockup.png"
        imgAlt="How It Works Mockup"
      >
        Ever been stuck on a great idea just because you couldn&#39;t find the right
        dataset? You&#39;re not alone.
        <br />
        DataSphere was born from that frustration — a place where anyone can
        upload and share the datasets they used in their projects.
        <br />
        Whether it&#39;s a Google Drive link or GitHub repo, it&#39;s all indexed,
        tagged, and made searchable.
        <br />
        No more dead ends. Just endless possibilities.
      </Section>

      <Section
        id="features"
        title="Features Overview"
        imgSrc="/features.png"
        imgAlt="Features Overview UI"
        reverse
      >
        <ul className="list-disc list-inside space-y-2">
          <li> Search & filter datasets by category, size, format, or tags</li>
          <li> Upload datasets with metadata and contributor credits</li>
          <li> Sign in via email or Google</li>
          <li> (Coming Soon) Like, comment, and request specific datasets</li>
          <li> (Future) Showcase projects built using shared datasets</li>
        </ul>
        <p className="mt-4">Everything you need. Nothing you don&#39;t.</p>
      </Section>

      <Section
        id="community"
        title="Community & Trust"
        imgSrc="/community.png"
        imgAlt="Community & Trust Img"
      >
        What makes DataSphere different from Kaggle or Hugging Face?
        <br />
        <strong>It&#39;s not about scale. It&#39;s about care.</strong>
        <br />
        We&#39;re building a space where developers help each other grow — not just
        compete.
        <br />
        Every contribution helps someone out there build their next project.
        <br />
        You&#39;re not just uploading data — you&#39;re creating opportunities.
      </Section>

      <Section
        id="usecase"
        title="Use Cases & Showcase"
        imgSrc="/usage.png"
        imgAlt="Use Cases Showcase"
        reverse
      >
        Here&#39;s how developers are already using DataSphere:
        <br />
        - Disease outbreak prediction using shared medical data
        <br />
        - License plate detection project powered by community datasets
        <br />
        - OCR on ancient scripts built from curated resources
        <br />
        Every download tells a story. What will yours be?
      </Section>

      <div
        className="h-[40rem] rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden"
        id="dataset"
      >
        <InfiniteMovingCards items={testimonials} direction="right" speed="slow" />
      </div>

      {/* Call to Action */}
      <section className="max-w-3xl mx-auto py-20 px-6 text-center text-white">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
          Ready to Join DataSphere?
        </h2>
        <p className="text-gray-300 text-base sm:text-lg mb-10">
          DataSphere is for you — the student with a weekend project, the dev with an idea,
          the builder who just needs <em>that one dataset</em>.
          <br />
          Dive in, discover, and contribute today.
        </p>

        <button
          onClick={() => setShowLoginModal(true)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-md shadow-white/10 cursor-pointer text-gray-200 hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.5)] transition-colors duration-300 w-48 h-12 py-2.5 text-md font-medium flex items-center justify-center relative overflow-hidden mx-auto whitespace-nowrap"
        >
          <span
            className={`absolute left-1/2 top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-transform duration-500 ease-in-out ${
              hovered ? "-translate-x-full opacity-0" : "translate-x-[-50%] opacity-100"
            } pointer-events-none select-none`}
          >
            Get Started
          </span>

          <span
            className={`absolute top-1/2 right-1/2 transform -translate-y-1/2 translate-x-1/2 transition-transform duration-500 ease-in-out ${
              hovered ? "translate-x-[50%] opacity-100" : "translate-x-full opacity-0"
            } pointer-events-none`}
            aria-hidden="true"
          >
            <Send size={20} strokeWidth={2.5} className="text-white/80" />
          </span>
        </button>
      </section>

      <AnimatePresence mode="wait">
        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onSwitchToSignup={() => {
              setShowLoginModal(false);
              setShowSignupModal(true);
            }}
            onLoginSuccess={() => {
              setShowLoginModal(false);
              router.push("/dashboard");
            }}
          />
        )}

        {showSignupModal && (
          <SignupModal
            onClose={() => setShowSignupModal(false)}
            onSwitchToLogin={() => {
              setShowSignupModal(false);
              setShowLoginModal(true);
            }}
            onSignupSuccess={() => {
              setShowSignupModal(false);
              router.push("/dashboard");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;

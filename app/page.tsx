'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';

import SplashGlobe from '../components/SplashGlobe';
import { StarrySkyBackground } from '../components/StarrySkyBackground';
import { Spotlight } from '../components/ui/spotlight-new';

// Animation Variants
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 1.5,
      staggerChildren: 0.3,
    },
  },
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const pageVariants: Variants = {
  initial: { opacity: 1 },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.8, ease: 'easeInOut' },
  },
};

const SplashPage = () => {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const countdown = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      setShow(false);
    }, 5000);

    return () => {
      clearInterval(countdown);
      clearTimeout(timeout);
    };
  }, []);

  const handleExitComplete = () => {
    router.push('/landing');
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {show && (
        <motion.div
          className="relative h-screen w-screen overflow-hidden bg-black text-gray-300"
          initial="initial"
          animate="visible"
          exit="exit"
          variants={pageVariants}
        >
          {/* Starry Background */}
          <StarrySkyBackground />

          {/* Spotlight Glow */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <Spotlight
              translateY={-350}
              width={560}
              height={1380}
              smallWidth={240}
              xOffset={100}
              duration={7}
            />
          </div>

          {/* 3D Globe */}
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            animate={{ scale: 1 }}
            initial={{ scale: 1 }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <SplashGlobe />
          </motion.div>

          {/* Center Text */}
          <motion.div
            className="relative z-30 flex flex-col items-center justify-center h-full text-center px-4 max-w-3xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.h1
              variants={childVariants}
              className="text-[7vw] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-[#CCCCCC]"
            >
              Welcome To
            </motion.h1>

            <motion.h1
              variants={childVariants}
              className="text-[7vw] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mt-1 text-[#CCCCCC] pl-4"
            >
              DataSphere
            </motion.h1>

            <motion.p
              variants={childVariants}
              className="text-[3.5vw] sm:text-base md:text-lg mt-4 max-w-xl text-[#999999] opacity-90"
            >
              A dataset hub for students and developers. Discover, share, and build smarter.
            </motion.p>

            <motion.p
              variants={childVariants}
              className="text-[3vw] sm:text-sm sm:mt-6 mt-4 text-[#777777] opacity-80"
            >
              Redirecting in {secondsLeft} second{secondsLeft !== 1 ? 's' : ''}...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashPage;

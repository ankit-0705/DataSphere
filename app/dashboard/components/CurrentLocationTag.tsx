// components/CurrentLocationTag.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const routeNameMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/datasets": "Datasets",
  "/profile": "Profile",
  "/about": "About Us",
  "/privacy": "Privacy & Policy",
  "/contact": "Contact",
  // fallback
  "/": "Home",
};

export const CurrentLocationTag = () => {
  const pathname = usePathname();
  const [displayedPath, setDisplayedPath] = useState(pathname);

  useEffect(() => {
    // Trigger re-render to animate out and in
    const timeout = setTimeout(() => {
      setDisplayedPath(pathname);
    }, 200); // Small delay for exit to complete

    return () => clearTimeout(timeout);
  }, [pathname]);

  const label = routeNameMap[displayedPath] || "Unknown";

  return (
    <div className="absolute top-4 right-4 z-30">
      <AnimatePresence mode="wait">
        <motion.div
          key={displayedPath}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            duration: 0.4,
          }}
          className="rounded-md bg-white/10 px-4 py-1 text-xs font-semibold text-white shadow-md backdrop-blur-md border border-white/20"
        >
          {label}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

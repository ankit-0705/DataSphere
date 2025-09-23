// components/ui/AnimatedPageContent.tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const AnimatedPageContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 30 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("w-full h-full", className)}
    >
      {children}
    </motion.div>
  );
};

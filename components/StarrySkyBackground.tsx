"use client";

import React from "react";
import { ShootingStars } from "./ui/shooting-stars";
import { StarsBackground } from "./ui/stars-background";

/**
 * Full-screen animated starry sky background
 */
export const StarrySkyBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0">
      <StarsBackground />
      <ShootingStars />
    </div>
  );
};

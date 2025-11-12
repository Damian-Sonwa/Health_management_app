import React from "react";

interface AnimatedLogoProps {
  size?: number;
  className?: string;
}

const LOGO_SRC = "/images/heart-droplet-logo.png";

export default function AnimatedLogo({ size = 80, className = "" }: AnimatedLogoProps) {
  return (
    <img
      src={LOGO_SRC}
      alt="NuviaCare logo"
      style={{ width: size, height: size }}
      className={`object-contain ${className}`}
      loading="lazy"
    />
  );
}

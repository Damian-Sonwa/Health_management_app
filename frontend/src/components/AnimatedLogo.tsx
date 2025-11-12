import React from "react";

interface AnimatedLogoProps {
  size?: number;
  className?: string;
}

const LOGO_SRC = "/images/Gemini_Generated_Image_3t89cu3t89cu3t89.png";

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

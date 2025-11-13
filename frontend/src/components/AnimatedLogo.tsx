import React from "react";

interface AnimatedLogoProps {
  size?: number;
  className?: string;
}

const LOGO_IMAGE = '/images/heart-droplet-logo.png';

export default function AnimatedLogo({ size = 60, className = "" }: AnimatedLogoProps) {
  const combinedClassName = [
    "relative inline-flex items-center justify-center rounded-full overflow-visible transition-transform duration-500",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={combinedClassName}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        animation: "logoPulse 3.5s ease-in-out infinite",
        filter: "drop-shadow(0 12px 28px rgba(14, 116, 144, 0.28))",
      }}
    >
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.5), rgba(12, 74, 110, 0))",
          animation: "glowPulse 4s ease-in-out infinite",
        }}
      />
      <div className="relative h-full w-full select-none pointer-events-none">
        <img
          src={LOGO_IMAGE}
          alt="NuviaCare logo"
          className="h-full w-full object-contain"
          draggable={false}
          loading="lazy"
          style={{
            mixBlendMode: 'multiply',
          }}
        />
      </div>

      <style>{`
        @keyframes logoPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}


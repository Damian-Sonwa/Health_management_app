import React from "react";

interface AnimatedLogoProps {
  size?: number;
  className?: string;
}

const LOGO_IMAGE = '/images/heart-droplet-logo.png';

export default function AnimatedLogo({ size = 90, className = "" }: AnimatedLogoProps) {
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
      <div
        className="relative h-full w-full select-none pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(135deg, rgba(14, 165, 233, 0.95) 0%, rgba(16, 185, 129, 0.9) 100%)',
          WebkitMaskImage: `url(${LOGO_IMAGE})`,
          maskImage: `url(${LOGO_IMAGE})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
      <img
        src={LOGO_IMAGE}
        alt="NuviaCare logo silhouette"
        className="sr-only"
        draggable={false}
        aria-hidden="true"
      />

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


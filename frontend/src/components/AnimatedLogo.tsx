import React from "react";

interface AnimatedLogoProps {
  size?: number;
  className?: string;
}

export default function AnimatedLogo({ size = 100, className = "" }: AnimatedLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        animation: "logoPulse 3.5s ease-in-out infinite",
        filter: "drop-shadow(0 10px 24px rgba(15, 118, 110, 0.35))",
      }}
    >
      <defs>
        {/* Gradient for heart glow */}
        <radialGradient id="heartGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#dc2626" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
        </radialGradient>
        
        {/* Gradient for droplet glow */}
        <radialGradient id="dropletGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.6" />
          <stop offset="70%" stopColor="#0891b2" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0e7490" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Heart shape - Left side */}
      <g className="heart-group">
        {/* Glow effect */}
        <ellipse
          cx="45"
          cy="50"
          rx="25"
          ry="20"
          fill="url(#heartGlow)"
          style={{
            animation: "heartGlow 2s ease-in-out infinite",
          }}
        />
        
        {/* Heart path */}
        <path
          d="M45,35 C38,25 25,25 25,35 C25,45 35,55 45,65 C55,55 65,45 65,35 C65,25 52,25 45,35 Z"
          fill="#ef4444"
          style={{
            filter: "drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))",
            animation: "heartPulse 2s ease-in-out infinite",
            transformOrigin: "45px 50px",
          }}
        />
      </g>

      {/* Droplet - Right side */}
      <g className="droplet-group">
        {/* Glow effect */}
        <ellipse
          cx="85"
          cy="65"
          rx="12"
          ry="15"
          fill="url(#dropletGlow)"
          style={{
            animation: "dropletGlow 3s ease-in-out infinite",
            animationDelay: "0.5s",
          }}
        />
        
        {/* Droplet path */}
        <path
          d="M85,50 C88,50 93,53 93,58 C93,65 85,72 85,72 C85,72 77,65 77,58 C77,53 82,50 85,50 Z"
          fill="#14b8a6"
          style={{
            filter: "drop-shadow(0 0 6px rgba(20, 184, 166, 0.5))",
            animation: "dropletDrop 3s ease-in-out infinite",
            animationDelay: "0.5s",
            transformOrigin: "85px 61px",
          }}
        />
      </g>

      <style>{`
        @keyframes logoPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.07);
          }
        }

        @keyframes heartPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.9;
          }
        }
        
        @keyframes heartGlow {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.2);
          }
        }
        
        @keyframes dropletDrop {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translateY(5px) scale(1.05);
            opacity: 1;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.8;
          }
        }
        
        @keyframes dropletGlow {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.15);
          }
        }
      `}</style>
    </svg>
  );
}


import React from "react";

interface AnimatedLogoProps {
  size?: number;
  className?: string;
}

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
      <svg
        viewBox="0 0 120 120"
        className="relative h-full w-full select-none pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="logo-heart-gradient" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#f97373" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#ef4444" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#991b1b" stopOpacity="0.6" />
          </radialGradient>
          <radialGradient id="logo-drop-gradient" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#5eead4" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#14b8a6" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0f766e" stopOpacity="0.75" />
          </radialGradient>
          <radialGradient id="logo-heart-glow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgba(248, 113, 113, 0.65)" />
            <stop offset="60%" stopColor="rgba(248, 113, 113, 0.2)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="logo-drop-glow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgba(45, 212, 191, 0.6)" />
            <stop offset="60%" stopColor="rgba(45, 212, 191, 0.2)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <g transform="translate(10 10)">
          <g className="logo-heart">
            <ellipse
              cx="38"
              cy="44"
              rx="26"
              ry="22"
              fill="url(#logo-heart-glow)"
            />
            <path
              d="M38 20c-9-11-24-11-31 0-7 11 0 28 31 52 31-24 38-41 31-52-7-11-22-11-31 0z"
              fill="url(#logo-heart-gradient)"
              style={{
                filter: "drop-shadow(0 6px 12px rgba(248, 113, 113, 0.35))",
              }}
            />
          </g>

          <g className="logo-drop" transform="translate(36 6)">
            <ellipse
              cx="32"
              cy="56"
              rx="17"
              ry="20"
              fill="url(#logo-drop-glow)"
            />
            <path
              d="M32 16c9 0 19 7 19 20s-19 27-19 27S13 49 13 36s10-20 19-20z"
              fill="url(#logo-drop-gradient)"
              style={{
                filter: "drop-shadow(0 6px 12px rgba(13, 148, 136, 0.35))",
              }}
            />
            <path
              d="M30 24c4-3 10-3 14 1"
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.8"
            />
          </g>
        </g>
      </svg>

      <style>{`
        .logo-heart {
          animation: heartBeat 2.8s ease-in-out infinite;
          transform-origin: 48px 54px;
        }

        .logo-drop {
          animation: dropFloat 3.6s ease-in-out infinite;
          transform-origin: 74px 62px;
        }

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

        @keyframes heartBeat {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes dropFloat {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(4px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}


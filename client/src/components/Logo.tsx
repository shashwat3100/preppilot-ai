import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

/**
 * PrepPilot Platform Logo
 * Merges Pilot Aviator Wings + Compass Navigation + Audio Soundwaves + Intelligent Core
 */
export const PrepPilotLogo: React.FC<LogoProps & { animated?: boolean; active?: boolean }> = ({
  size = 'md',
  showText = true,
  animated = false,
  active = false,
  className = ''
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg', sub: 'text-[9px]' },
    md: { icon: 36, text: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 48, text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 64, text: 'text-3xl', sub: 'text-sm' }
  };

  const dim = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Precision Pilot SVG Symbol */}
      <div className={`relative flex items-center justify-center flex-shrink-0 ${active ? 'animate-voice-pulse' : ''}`}>
        <svg
          width={dim.icon}
          height={dim.icon}
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0"
        >
          <defs>
            <linearGradient id="ppGrad" x1="2" y1="2" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#818CF8" />
              <stop offset="0.5" stopColor="#6366F1" />
              <stop offset="1" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id="ppMic" x1="18" y1="14" x2="26" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#818CF8" />
            </linearGradient>
          </defs>

          {/* Outer Compass / Voice Radar Ring */}
          <circle
            cx="22"
            cy="22"
            r="19"
            stroke="url(#ppGrad)"
            strokeWidth="1.5"
            strokeDasharray={active ? "4 3" : "none"}
            className={animated || active ? "animate-spin origin-center" : ""}
            style={{ animationDuration: '10s' }}
          />

          {/* Pilot Wings (Aerodynamic Left & Right Navigation Fins) */}
          <path
            d="M7 22C11 18 16 19 18 22C16 23.5 12 24.5 7 22Z"
            fill="#4F46E5"
            opacity="0.9"
          />
          <path
            d="M37 22C33 18 28 19 26 22C28 23.5 32 24.5 37 22Z"
            fill="#06B6D4"
            opacity="0.9"
          />

          {/* Central AI Voice Microphone Capsule */}
          <rect x="19" y="14" width="6" height="11" rx="3" fill="url(#ppMic)" />
          {/* Mic Stand / Compass Needle Base */}
          <path d="M16.5 21C16.5 24 18.5 26.5 22 26.5C25.5 26.5 27.5 24 27.5 21" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M22 26.5V30" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M19 30H25" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />

          {/* Core Pulsing Beacon */}
          <circle cx="22" cy="18" r="1.5" fill="#FFFFFF" />
        </svg>

        {active && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className={`font-extrabold tracking-tight text-white flex items-center gap-1.5 ${dim.text}`}>
            <span>PrepPilot</span>
            <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-300 bg-clip-text text-transparent">AI</span>
          </div>
          <span className={`text-slate-400 font-medium tracking-wide uppercase ${dim.sub}`}>
            B.Tech Placement & Recommendation
          </span>
        </div>
      )}
    </div>
  );
};

// CareerPrepLogo is an alias to PrepPilotLogo for unified platform branding
export const CareerPrepLogo = PrepPilotLogo;
export default PrepPilotLogo;

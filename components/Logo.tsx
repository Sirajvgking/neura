import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="shieldGradient" x1="15" y1="2" x2="85" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>
      
      {/* Shield Outline */}
      <path 
        d="M50 5 L85 18 V45 C85 70 50 95 50 95 C50 95 15 70 15 45 V18 L50 5Z" 
        stroke="currentColor" 
        strokeWidth="5" 
        strokeLinejoin="round"
        fill="none"
      />

      {/* Internal Brain/Circuit Structure */}
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        {/* Central Hexagon */}
        <path d="M50 38 L58 43 V53 L50 58 L42 53 V43 L50 38Z" fill="none" strokeWidth="3"/>
        
        {/* Play Icon inside Hexagon */}
        <path d="M48 44 L54 48 L48 52 V44Z" fill="currentColor" stroke="none"/>

        {/* Circuit Lines - Right Lobe */}
        <path d="M58 43 L65 35 M65 35 L75 35 M65 35 L70 25" />
        <path d="M58 53 L65 60 M65 60 L75 60 M65 60 L70 70" />
        <path d="M58 48 L78 48" />

        {/* Circuit Lines - Left Lobe */}
        <path d="M42 43 L35 35 M35 35 L25 35 M35 35 L30 25" />
        <path d="M42 53 L35 60 M35 60 L25 60 M35 60 L30 70" />
        <path d="M42 48 L22 48" />

        {/* Connection Nodes */}
        <circle cx="75" cy="35" r="2" fill="currentColor" stroke="none"/>
        <circle cx="70" cy="25" r="2" fill="currentColor" stroke="none"/>
        <circle cx="78" cy="48" r="2" fill="currentColor" stroke="none"/>
        <circle cx="75" cy="60" r="2" fill="currentColor" stroke="none"/>
        <circle cx="70" cy="70" r="2" fill="currentColor" stroke="none"/>

        <circle cx="25" cy="35" r="2" fill="currentColor" stroke="none"/>
        <circle cx="30" cy="25" r="2" fill="currentColor" stroke="none"/>
        <circle cx="22" cy="48" r="2" fill="currentColor" stroke="none"/>
        <circle cx="25" cy="60" r="2" fill="currentColor" stroke="none"/>
        <circle cx="30" cy="70" r="2" fill="currentColor" stroke="none"/>
      </g>
    </svg>
  );
};
import React from 'react';

export const JiGongIllustration: React.FC = () => {
  return (
    <div className="absolute bottom-0 left-2 sm:left-6 md:left-10 w-[30%] sm:w-[32%] md:w-[30%] h-[90%] sm:h-[95%] flex items-end justify-center pointer-events-none opacity-95 z-10">
      <svg
        viewBox="0 0 400 680"
        className="w-full h-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="robeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="35%" stopColor="#854d0e" />
            <stop offset="70%" stopColor="#713f12" />
            <stop offset="100%" stopColor="#3f2305" />
          </linearGradient>
          <linearGradient id="fanGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <linearGradient id="faceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Golden Halo around Master */}
        <circle cx="200" cy="190" r="140" fill="#f59e0b" opacity="0.14" filter="blur(20px)" />

        {/* Robe Body with Ragged Patches */}
        <path
          d="M120 230 C90 300 70 420 60 620 C110 640 310 640 340 620 C330 450 310 300 280 230 Z"
          fill="url(#robeGrad)"
        />

        {/* Cloth Patches */}
        <polygon
          points="110,380 150,370 145,430 100,420"
          fill="#6b7280"
          opacity="0.6"
          stroke="#451a03"
          strokeWidth="1.5"
        />
        <polygon
          points="230,470 280,460 270,520 220,500"
          fill="#7c3aed"
          opacity="0.5"
          stroke="#451a03"
          strokeWidth="1.5"
        />
        <polygon
          points="150,490 200,480 195,540 140,530"
          fill="#047857"
          opacity="0.5"
          stroke="#451a03"
          strokeWidth="1.5"
        />
        <polygon
          points="250,340 295,350 285,400 240,390"
          fill="#b91c1c"
          opacity="0.4"
          stroke="#451a03"
          strokeWidth="1.5"
        />

        {/* Big Buddhist Prayer Beads (Mala) */}
        <path
          d="M145 230 Q200 400 255 230"
          stroke="#78350f"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="2 15"
        />

        {/* Happy Smiling Face */}
        <ellipse cx="200" cy="180" rx="44" ry="52" fill="url(#faceGrad)" />
        {/* Eyes & Kind Smile */}
        <path
          d="M172 172 Q184 165 192 172"
          stroke="#592507"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M208 172 Q216 165 228 172"
          stroke="#592507"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M182 195 Q200 215 218 195"
          stroke="#7f1d1d"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="#fff"
        />

        {/* Ji-Gong Hat with "佛" */}
        <path d="M148 150 C148 70 252 70 252 150 Z" fill="#78350f" />
        <path d="M136 150 C136 138 264 138 264 150 L252 160 L148 160 Z" fill="#451a03" />
        <text
          x="189"
          y="128"
          fontFamily="'Noto Serif TC', serif"
          fontWeight="900"
          fontSize="26"
          fill="#fef08a"
          textAnchor="middle"
        >
          佛
        </text>

        {/* Tattered Fan in Hand */}
        <g transform="rotate(28 290 230)">
          <path
            d="M260 160 C310 110 360 160 330 260 C295 300 265 280 250 260 Z"
            fill="url(#fanGrad)"
            stroke="#78350f"
            strokeWidth="2"
          />
          <line x1="260" y1="260" x2="315" y2="170" stroke="#78350f" strokeWidth="2" />
          <line x1="270" y1="265" x2="330" y2="200" stroke="#78350f" strokeWidth="2" />
        </g>

        {/* Wine Gourd in Hand */}
        <g transform="translate(65, 410)">
          <ellipse cx="25" cy="22" rx="15" ry="15" fill="#b45309" stroke="#78350f" strokeWidth="2" />
          <ellipse cx="25" cy="50" rx="22" ry="24" fill="#d97706" stroke="#78350f" strokeWidth="2" />
          <rect x="22" y="4" width="6" height="6" fill="#451a03" />
          <path d="M15 36 Q25 39 35 36" stroke="#451a03" strokeWidth="2" fill="none" />
        </g>
      </svg>
    </div>
  );
};

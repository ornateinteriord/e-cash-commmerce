import React from 'react';
import { Box } from '@mui/material';

interface BitcoinCoinProps {
  size?: number;
}

export const BitcoinCoin: React.FC<BitcoinCoinProps> = ({ size = 44 }) => {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        filter: 'drop-shadow(0 4px 12px rgba(245, 158, 11, 0.5)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.45))',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px) scale(1.08) rotate(6deg)',
          filter: 'drop-shadow(0 6px 18px rgba(245, 158, 11, 0.75)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6))'
        }
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          {/* Outer milled rim metallic gradient */}
          <linearGradient id="btcGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF59D" />
            <stop offset="20%" stopColor="#FFD54F" />
            <stop offset="45%" stopColor="#FFA000" />
            <stop offset="70%" stopColor="#FF8F00" />
            <stop offset="90%" stopColor="#FFE082" />
            <stop offset="100%" stopColor="#E65100" />
          </linearGradient>

          {/* Coin body inner radial gradient */}
          <radialGradient id="btcBody" cx="36%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="35%" stopColor="#FFA000" />
            <stop offset="75%" stopColor="#E65100" />
            <stop offset="100%" stopColor="#7F2600" />
          </radialGradient>

          {/* Deep bezel edge */}
          <linearGradient id="btcInnerRim" x1="15%" y1="15%" x2="85%" y2="85%">
            <stop offset="0%" stopColor="#7F2600" />
            <stop offset="40%" stopColor="#FFB300" />
            <stop offset="70%" stopColor="#FFF9C4" />
            <stop offset="100%" stopColor="#E65100" />
          </linearGradient>

          {/* Symbol embossed relief gradient */}
          <linearGradient id="btcSymbolGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#FFF9C4" />
            <stop offset="65%" stopColor="#FFD54F" />
            <stop offset="100%" stopColor="#FF8F00" />
          </linearGradient>

          {/* Specular gloss sheen overlay */}
          <linearGradient id="btcSheen" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.15" />
            <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* 3D coin drop shadow */}
          <filter id="btcShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#3E1400" floodOpacity="0.85" />
          </filter>
        </defs>

        {/* 1. Outer 3D Coin Edge (Milled Edge) */}
        <circle cx="50" cy="50" r="48" fill="url(#btcGoldRim)" stroke="#5D1B00" strokeWidth="0.8" />

        {/* Milled serrations / coin teeth dashes */}
        <circle
          cx="50"
          cy="50"
          r="46.5"
          fill="none"
          stroke="#7F2600"
          strokeWidth="1.8"
          strokeDasharray="1.2 2"
          opacity="0.8"
        />

        {/* 2. Raised Outer Bezel */}
        <circle cx="50" cy="50" r="43.5" fill="none" stroke="url(#btcInnerRim)" strokeWidth="2.4" />

        {/* 3. Coin Main Surface / Face */}
        <circle cx="50" cy="50" r="41" fill="url(#btcBody)" />

        {/* 4. Fine Concentric Coin Ridges */}
        <circle cx="50" cy="50" r="34" fill="none" stroke="#FFE082" strokeWidth="0.75" opacity="0.6" strokeDasharray="3 1.5" />
        <circle cx="50" cy="50" r="32" fill="none" stroke="#5D1B00" strokeWidth="0.75" opacity="0.45" />

        {/* 5. Crypto Circuit Board Micro Traces (Authentic Coin Texture) */}
        <g stroke="#FFE082" strokeWidth="0.8" opacity="0.38" strokeLinecap="round">
          <path d="M 22 40 L 29 40 L 32 35" fill="none" />
          <circle cx="22" cy="40" r="1.3" fill="#FFE082" />
          <path d="M 22 60 L 28 60 L 32 65" fill="none" />
          <circle cx="22" cy="60" r="1.3" fill="#FFE082" />
          <path d="M 78 40 L 71 40 L 68 35" fill="none" />
          <circle cx="78" cy="40" r="1.3" fill="#FFE082" />
          <path d="M 78 60 L 72 60 L 68 65" fill="none" />
          <circle cx="78" cy="60" r="1.3" fill="#FFE082" />
          <path d="M 50 17 L 50 23" fill="none" />
          <circle cx="50" cy="17" r="1" fill="#FFE082" />
          <path d="M 50 77 L 50 83" fill="none" />
          <circle cx="50" cy="83" r="1" fill="#FFE082" />
        </g>

        {/* 6. Iconic Bitcoin ₿ Symbol (3D Embossed Relief) */}
        {/* Under shadow for 3D depth */}
        <path
          d="M 45 22 V 27 M 55 22 V 27 M 45 73 V 78 M 55 73 V 78
             M 35 32 H 52 C 58 32 63 35 63 41 C 63 45 60 48 55 49 C 61 50 65 54 65 60 C 65 67 59 70 52 70 H 35
             M 45 32 V 70 M 51 38 H 45 V 47 H 51 C 54 47 56 45 56 42.5 C 56 40 54 38 51 38 Z
             M 52 53 H 45 V 64 H 52 C 55 64 57 62 57 58.5 C 57 55 55 53 52 53 Z"
          fill="none"
          stroke="#3E1400"
          strokeWidth="4.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        />

        {/* Main ₿ Symbol */}
        <path
          d="M 45 23 V 28 M 55 23 V 28 M 45 72 V 77 M 55 72 V 77
             M 36 32 H 52 C 57.5 32 62 35 62 40.5 C 62 44.5 59 47.5 54.5 48.5 C 60 49.5 64 53.5 64 59.5 C 64 66 58.5 69 52 69 H 36
             M 45 32 V 69 M 51 38 H 45 V 46.5 H 51 C 53.5 46.5 55.5 44.5 55.5 42.2 C 55.5 40 53.5 38 51 38 Z
             M 52 52.5 H 45 V 63.5 H 52 C 54.5 63.5 56.5 61.5 56.5 58 C 56.5 54.5 54.5 52.5 52 52.5 Z"
          fill="none"
          stroke="url(#btcSymbolGrad)"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#btcShadow)"
        />

        {/* 7. Curved Metallic Specular Sheen */}
        <path
          d="M 16 35 C 22 20 40 12 60 14 C 44 15 28 25 22 42 Z"
          fill="url(#btcSheen)"
          opacity="0.85"
        />
        <circle cx="50" cy="50" r="41" fill="url(#btcSheen)" opacity="0.3" pointerEvents="none" />
      </svg>
    </Box>
  );
};

export default BitcoinCoin;


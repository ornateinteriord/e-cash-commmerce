import React from 'react';
import { Box, Typography } from '@mui/material';

interface TokenCoinProps {
  value?: number | string;
  size?: number;
}

export const TokenCoin: React.FC<TokenCoinProps> = ({ value = 0, size = 36 }) => {
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
        filter: 'drop-shadow(0 3px 10px rgba(245, 158, 11, 0.45)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px) scale(1.08)',
          filter: 'drop-shadow(0 6px 16px rgba(245, 158, 11, 0.7)) drop-shadow(0 3px 6px rgba(0, 0, 0, 0.55))'
        }
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', overflow: 'visible', position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          {/* Outer milled rim metallic gradient */}
          <linearGradient id="tokenGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF59D" />
            <stop offset="20%" stopColor="#FFD54F" />
            <stop offset="45%" stopColor="#FFA000" />
            <stop offset="70%" stopColor="#FF8F00" />
            <stop offset="90%" stopColor="#FFE082" />
            <stop offset="100%" stopColor="#E65100" />
          </linearGradient>

          {/* Coin body inner radial gradient */}
          <radialGradient id="tokenBody" cx="36%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="35%" stopColor="#FFA000" />
            <stop offset="70%" stopColor="#FF8F00" />
            <stop offset="95%" stopColor="#E65100" />
            <stop offset="100%" stopColor="#BF360C" />
          </radialGradient>

          {/* Inner ring relief */}
          <linearGradient id="tokenInnerRim" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FFF59D" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#FFA000" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#BF360C" stopOpacity="0.9" />
          </linearGradient>

          {/* Specular sheen overlay */}
          <linearGradient id="tokenSheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.15" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Outer Coin Base */}
        <circle cx="50" cy="50" r="48" fill="url(#tokenGoldRim)" stroke="#8D2B00" strokeWidth="1.2" />

        {/* 2. Raised Outer Bezel */}
        <circle cx="50" cy="50" r="43.5" fill="none" stroke="url(#tokenInnerRim)" strokeWidth="2.4" />

        {/* 3. Coin Main Surface / Face */}
        <circle cx="50" cy="50" r="41" fill="url(#tokenBody)" />

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

        {/* 6. Curved Metallic Specular Sheen */}
        <path
          d="M 16 35 C 22 20 40 12 60 14 C 44 15 28 25 22 42 Z"
          fill="url(#tokenSheen)"
          opacity="0.85"
        />
        <circle cx="50" cy="50" r="41" fill="url(#tokenSheen)" opacity="0.25" pointerEvents="none" />
      </svg>

      {/* Center Number inside the Coin */}
      <Typography
        sx={{
          position: 'relative',
          zIndex: 2,
          color: '#FFFFFF',
          fontWeight: 900,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: typeof value === 'number' && value > 999 
            ? `${size * 0.28}px` 
            : `${size * 0.42}px`,
          lineHeight: 1,
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.75), 0 0 10px rgba(255, 235, 59, 0.7)',
          letterSpacing: '-0.3px',
          userSelect: 'none'
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

export default TokenCoin;


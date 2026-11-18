import React from 'react';
import { Box, CircularProgress } from '@mui/material';

export const LoadingComponent: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(248, 250, 252, 0.7)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <CircularProgress sx={{ color: '#FE8001' }} />
    </Box>
  );
};

export default LoadingComponent;

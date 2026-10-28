import React, { useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import UserContext from '../../../context/user/userContext';
import { useGetWalletOverview } from '../../../api/Memeber';
import { useGetMemberAddOns } from '../../../api/Packages';

const ProductsContainer: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const memberId = user?.Member_id || '';

  const { data: walletOverview } = useGetWalletOverview(memberId);
  const { data: memberAddons } = useGetMemberAddOns(memberId);

  // Most recent vendor package amount
  const getMostRecentPackageAmount = (): number => {
    if (Array.isArray(memberAddons) && memberAddons.length > 0) {
      const sorted = [...memberAddons].sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.roi_start_date || a.date || 0).getTime();
        const dateB = new Date(b.createdAt || b.roi_start_date || b.date || 0).getTime();
        return dateB - dateA;
      });
      const topAmount = Number(sorted[0]?.amount || sorted[0]?.requested_amount || 0);
      if (topAmount > 0) return topAmount;
    }
    return Number(walletOverview?.primaryPackage ?? user?.package_value ?? 0);
  };

  const recentPackageAmount = getMostRecentPackageAmount();
  const isPackageActive = recentPackageAmount > 0;

  return (
    <Box sx={{ mb: 3.5, width: '100%' }}>
      {/* ── COMPACT VENDOR PACKAGE BAR (CARDS REMOVED, SHOWN ON SEPARATE PAGE) ── */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        p: { xs: 2.2, sm: 2.8 },
        bgcolor: '#FFFFFF',
        borderRadius: '20px',
        border: '1.5px solid #FED7AA',
        boxShadow: '0 4px 18px rgba(254, 128, 1, 0.06)'
      }}>
        {/* Left Side: Icon & Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 44,
            height: 44,
            borderRadius: '14px',
            bgcolor: '#FFF7ED',
            border: '1.5px solid #FED7AA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 24, color: '#FE8001' }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ color: '#1F333B', fontWeight: 900, fontSize: { xs: '1.05rem', sm: '1.2rem' }, lineHeight: 1.2 }}>
                Vendor Package
              </Typography>
              {isPackageActive && (
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: '13px !important', color: '#059669' }} />}
                  label="Activated"
                  size="small"
                  sx={{
                    bgcolor: '#ECFDF5',
                    color: '#059669',
                    border: '1px solid #A7F3D0',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    height: '22px'
                  }}
                />
              )}
            </Box>
            <Typography variant="caption" sx={{ color: '#7A5060', fontWeight: 600, display: 'block', mt: 0.3 }}>
              {isPackageActive
                ? 'Your vendor package is activated and active'
                : 'Choose a package plan to activate your store and earnings'}
            </Typography>
          </Box>
        </Box>

        {/* Right Side: Vendor Pkg Box & Select Button (Aligned together) */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: { xs: 'stretch', sm: 'flex-end' },
          gap: 1,
          flexShrink: 0
        }}>
          {/* Vendor Pkg Box */}
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            bgcolor: isPackageActive ? 'rgba(5, 150, 105, 0.06)' : '#FFFDF9',
            px: 2,
            py: 0.8,
            borderRadius: '14px',
            border: isPackageActive ? '1.5px solid rgba(5, 150, 105, 0.3)' : '1.5px solid #FED7AA',
            boxShadow: '0 2px 8px rgba(254, 128, 1, 0.06)',
            width: { xs: '100%', sm: '190px' }
          }}>
            <Typography variant="caption" sx={{ color: isPackageActive ? '#059669' : '#7A5060', fontWeight: 700 }}>
              Vendor Pkg:
            </Typography>
            <Typography variant="body2" sx={{ color: isPackageActive ? '#059669' : '#FE8001', fontWeight: 900 }}>
              ₹{recentPackageAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>

          {/* Select Button: ONLY SHOWN IF PACKAGE IS NOT ACTIVATED */}
          {!isPackageActive ? (
            <Button
              variant="contained"
              onClick={() => navigate('/user/packages')}
              sx={{
                background: 'linear-gradient(135deg, #FE8001 0%, #FFA033 100%)',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.84rem',
                textTransform: 'none',
                py: 0.75,
                px: 2,
                width: { xs: '100%', sm: '190px' },
                boxShadow: '0 4px 12px rgba(254, 128, 1, 0.28)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #E06F00 0%, #FE8001 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(254, 128, 1, 0.4)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Select
            </Button>
          ) : (
            <Button
              variant="text"
              size="small"
              onClick={() => navigate(`/user/earnings/package-detail?package=${recentPackageAmount}`)}
              endIcon={<ArrowForwardIosIcon sx={{ fontSize: '11px !important' }} />}
              sx={{
                color: '#FE8001',
                fontWeight: 700,
                fontSize: '0.74rem',
                textTransform: 'none',
                p: 0,
                width: { xs: '100%', sm: '190px' },
                justifyContent: { xs: 'center', sm: 'flex-end' },
                '&:hover': { background: 'none', color: '#E06F00' }
              }}
            >
              View Plan Details
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProductsContainer;

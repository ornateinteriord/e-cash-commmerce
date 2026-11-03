import React from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TokenService from '../../../api/token/tokenService';
import { useGetWalletOverview } from '../../../api/Memeber';

interface PackageConfig {
  title: string;
  tag: string;
  color: string;
}

const PACKAGES: Record<string, PackageConfig> = {
  '10000': {
    title: 'Mini Store',
    tag: 'Mini Store',
    color: '#0D9488',
  },
  '25000': {
    title: 'Starter Store',
    tag: 'Starter',
    color: '#EA580C',
  },
  '50000': {
    title: 'Prime Merchant',
    tag: 'Prime',
    color: '#0284C7',
  },
  '100000': {
    title: 'Power Seller Hub',
    tag: 'Power Seller',
    color: '#059669',
  },
  '200000': {
    title: 'Super Store Partner',
    tag: 'Super Store',
    color: '#7C3AED',
  },
  '500000': {
    title: 'Mega Flagship Store',
    tag: 'Mega Flagship',
    color: '#D97706',
  },
};

const PackageDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const packageFilter = searchParams.get('package') || '25000';
  const pkgAmountNum = Number(packageFilter) || 25000;

  const memberId = TokenService.getMemberId();
  const { data: walletOverview } = useGetWalletOverview(memberId || '');

  const pkgInfo: PackageConfig = PACKAGES[packageFilter] || {
    title: `Package ₹${pkgAmountNum.toLocaleString()}`,
    tag: 'Store Plan',
    color: '#FE8001',
  };

  const packageIncome = walletOverview?.singleLevelIncomeByPackage?.[packageFilter] || 0;

  const commissionCards = [
    {
      title: 'Referral Bonus',
      amount: Number(walletOverview?.directBenefits || 0),
      description: 'Instant direct referral rewards for onboarding new members and active stores.',
      icon: <PaymentsIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: '#FE8001' }} />,
      bgColor: '#FFF7ED',
      accentColor: '#FE8001',
      path: '/user/earnings/referral-bonus',
    },
    {
      title: 'Level Bonus',
      amount: Number(walletOverview?.levelBenefits || 0),
      description: 'Multi-tier commissions earned across team affiliate levels in your network.',
      icon: <AccountTreeIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: '#0284C7' }} />,
      bgColor: '#F0F9FF',
      accentColor: '#0284C7',
      path: '/user/earnings/level-benefits',
    },
    {
      title: 'Level Daily ROI',
      amount: Number(walletOverview?.levelDailyRoi ?? walletOverview?.roiLevelBenefits ?? 0),
      description: 'Daily level team returns distributed over 100 days from active packages.',
      icon: <TrendingUpIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: '#059669' }} />,
      bgColor: '#ECFDF5',
      accentColor: '#059669',
      path: '/user/earnings/level-daily-roi',
    },
    {
      title: 'Daily Incentive',
      amount: Number(packageIncome || parseFloat(walletOverview?.singleLineIncome) || 0),
      description: 'Daily Incentive earned from active package performance and store activity.',
      icon: <TrendingUpIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: '#D97706' }} />,
      bgColor: '#FFFBEB',
      accentColor: '#D97706',
      path: '/user/earnings/single-level-income-history',
    },
    {
      title: 'Product Level Bonus',
      amount: Number(walletOverview?.productLevelBalance ?? walletOverview?.levelBenefits ?? 0),
      description: 'Earnings from product listings and catalog tier sales commissions.',
      icon: <StorefrontIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: '#7C3AED' }} />,
      bgColor: '#F5F3FF',
      accentColor: '#7C3AED',
      path: '/user/product-level-wallet',
    },
  ];

  return (
    <Box
      sx={{
        pb: { xs: 8, sm: 10 },
        bgcolor: '#F8FAFC',
        minHeight: '100vh',
        px: { xs: 1.5, sm: 3 },
        pt: { xs: 1.5, sm: 3 },
      }}
    >
      {/* Top Bar with Back Button */}
      <Box
        sx={{
          maxWidth: '520px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: { xs: 2, sm: 2.5 },
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1.5px solid #FED7AA',
            color: '#FE8001',
            p: 1,
            '&:hover': { bgcolor: '#FFF7ED' },
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              color: '#1E293B',
              lineHeight: 1.2,
              fontSize: { xs: '1.05rem', sm: '1.25rem' },
            }}
          >
            Package & Commissions
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            ₹{pkgAmountNum.toLocaleString()} Plan Overview & Benefit Streams
          </Typography>
        </Box>
      </Box>

      {/* Package Header Card - Clean & Mobile Responsive */}
      <Box
        sx={{
          maxWidth: '520px',
          margin: '0 auto',
          mb: { xs: 2, sm: 2.5 },
          p: { xs: 2, sm: 2.5 },
          bgcolor: '#FFFFFF',
          borderRadius: { xs: '20px', sm: '24px' },
          border: `1.5px solid ${pkgInfo.color}35`,
          boxShadow: `0 6px 24px ${pkgInfo.color}14`,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Brand Logo */}
        <Box
          sx={{
            width: { xs: 68, sm: 76 },
            height: { xs: 68, sm: 76 },
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#FFFFFF',
            borderRadius: '50%',
            p: 1,
            boxShadow: `0 4px 16px ${pkgInfo.color}20`,
            border: `1.5px solid ${pkgInfo.color}40`,
          }}
        >
          <Box
            component="img"
            src="/e-shopy.jpeg"
            alt="E-shopy"
            sx={{
              maxHeight: { xs: 28, sm: 32 },
              maxWidth: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </Box>

        {/* Package Title & Tag */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.8,
            flexWrap: 'wrap',
            justifyContent: 'center',
            mb: 0.8,
          }}
        >
          <Chip
            label={pkgInfo.tag}
            size="small"
            sx={{
              bgcolor: `${pkgInfo.color}15`,
              color: pkgInfo.color,
              fontWeight: 800,
              fontSize: '0.68rem',
              height: 22,
              borderRadius: '6px',
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color: '#0F172A',
              fontWeight: 900,
              letterSpacing: '-0.3px',
              fontSize: { xs: '1.15rem', sm: '1.35rem' },
            }}
          >
            {pkgInfo.title}
          </Typography>
        </Box>

        {/* Package Price */}
        <Typography
          variant="h4"
          sx={{
            color: pkgInfo.color,
            fontWeight: 900,
            letterSpacing: '-0.5px',
            fontSize: { xs: '1.75rem', sm: '2.1rem' },
            m: 0,
          }}
        >
          ₹{pkgAmountNum.toLocaleString()}
        </Typography>
      </Box>

      {/* Section Header */}
      <Box sx={{ maxWidth: '520px', margin: '0 auto 12px', px: { xs: 0.5, sm: 0 } }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 900, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.4px', fontSize: { xs: '0.8rem', sm: '0.88rem' } }}
        >
          Earning Streams & Commissions
        </Typography>
      </Box>

      {/* Commission Cards Stack */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 1.2, sm: 1.5 },
          maxWidth: '520px',
          margin: '0 auto',
        }}
      >
        {commissionCards.map((card, idx) => (
          <Box
            key={idx}
            onClick={() => navigate(card.path)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              p: { xs: 1.8, sm: 2.2 },
              borderRadius: { xs: '16px', sm: '18px' },
              bgcolor: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                borderColor: card.accentColor,
                boxShadow: `0 6px 20px ${card.accentColor}18`,
              },
              '&:active': {
                transform: 'scale(0.99)',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                mb: 0.8,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    p: { xs: 0.8, sm: 1 },
                    borderRadius: '10px',
                    bgcolor: card.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {card.icon}
                </Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: '#1E293B',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    fontSize: { xs: '0.82rem', sm: '0.92rem' },
                  }}
                >
                  {card.title}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography
                  sx={{
                    color: '#0F172A',
                    fontWeight: 900,
                    fontSize: { xs: '1.15rem', sm: '1.35rem' },
                    letterSpacing: '-0.4px',
                  }}
                >
                  ₹{card.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
                <ArrowForwardIosIcon sx={{ fontSize: 11, color: '#94A3B8' }} />
              </Box>
            </Box>

            <Typography
              variant="caption"
              sx={{
                color: '#64748B',
                display: 'block',
                lineHeight: 1.35,
                fontSize: { xs: '0.74rem', sm: '0.8rem' },
                pl: { xs: 0.5, sm: 0 },
              }}
            >
              {card.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default PackageDetail;

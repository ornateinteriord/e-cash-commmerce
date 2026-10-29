import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Typography, Box, CircularProgress, Paper, Button, IconButton, Avatar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Chip } from '@mui/material';

import SettingsIcon from '@mui/icons-material/Settings';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import PaymentsIcon from '@mui/icons-material/Payments';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import BoltIcon from '@mui/icons-material/Bolt';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { toast } from 'react-toastify';

import TokenService from '../../../api/token/tokenService';
import { useVerifyPayment, parsePaymentRedirectParams, useGetTransactionDetails, useGetWalletOverview, useGetMemberDetails, useGetDailyPayout } from '../../../api/Memeber';

import ProductsContainer from './ProductsContainer';
import BitcoinCoin from '../../../components/common/BitcoinCoin';


const UserDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const memberId = TokenService.getMemberId();
  const { data: walletOverview } = useGetWalletOverview(memberId);
  const { data: memberDetails, refetch: refetchMemberDetails } = useGetMemberDetails(memberId);
  const referralCode = memberDetails?.Member_id || memberDetails?.member_id || memberId || '';
  const { mutate: verifyPayment, isPending: isVerifyingPayment } = useVerifyPayment();
  const { refetch: refetchTransactions } = useGetTransactionDetails("all");
  useGetDailyPayout(memberId);

  /*
  // Backend provides whether user has an initial investment (canReTopup / hasInvestment)
  const hasInvestment = Boolean(
    walletOverview?.hasInvestment ??
    walletOverview?.data?.hasInvestment ??
    memberDetails?.hasInvestment ??
    memberDetails?.data?.hasInvestment ??
    ((Number(walletOverview?.totalPackages ?? walletOverview?.data?.totalPackages ?? memberDetails?.totalPackages ?? memberDetails?.package_value ?? 0)) > 0)
  );

  // Total investment amount made by the user
  const totalInvested = Number(
    walletOverview?.totalInvested ??
    walletOverview?.data?.totalInvested ??
    walletOverview?.totalPackages ??
    walletOverview?.data?.totalPackages ??
    memberDetails?.totalPackages ??
    memberDetails?.package_value ??
    0
  );

  // Total earnings of user across all benefit streams
  const totalEarnings = Math.max(
    Number(walletOverview?.totalEarnings ?? walletOverview?.data?.totalEarnings ?? 0),
    Number(walletOverview?.totalBenefits ?? walletOverview?.data?.totalBenefits ?? 0),
    (
      Number(walletOverview?.directBenefits || 0) +
      Number(walletOverview?.levelBenefits || 0) +
      Number(walletOverview?.singleLineIncome || 0) +
      Number(walletOverview?.roiBenefits || 0) +
      Number(walletOverview?.roiLevelBenefits || 0) +
      Number(walletOverview?.repaymentCommission || 0)
    )
  );

  // Re-invest container & button is only displayed once earnings become at least double of investment amount
  const canShowReinvest = hasInvestment && totalInvested > 0 && totalEarnings >= (2 * totalInvested);
  */

  const handleCopyReferralLink = () => {
    const code = memberDetails?.Member_id || memberDetails?.member_id || memberId;
    if (!code) return;
    const referralLink = `${window.location.origin}/register?ref=${code}`;
    navigator.clipboard.writeText(referralLink)
      .then(() => toast.success('Referral link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const handleShareReferral = async () => {
    const code = memberDetails?.Member_id || memberDetails?.member_id || memberId;
    if (!code) return;
    const referralLink = `${window.location.origin}/register?ref=${code}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join E shopy & Start Earning',
          text: `Join E shopy with my referral code ${code} and unlock direct commissions & brokerage rewards!`,
          url: referralLink,
        });
      } catch (err) {
        // User dismissed share dialog
      }
    } else {
      handleCopyReferralLink();
    }
  };

  const handleLogout = () => {
    setLogoutDialogOpen(false);
    TokenService.removeToken();
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  useEffect(() => {
    const paymentParams = parsePaymentRedirectParams(searchParams);
    if (paymentParams.order_id && paymentParams.payment_status && !paymentProcessed) {
      setPaymentProcessed(true);
      verifyPayment(paymentParams.order_id, {
        onSuccess: () => {
          setSearchParams({});
          refetchTransactions();
          refetchMemberDetails();
        },
        onError: () => setSearchParams({})
      });
    }
  }, [searchParams, paymentProcessed, verifyPayment, setSearchParams, refetchTransactions, refetchMemberDetails]);

  const quickAccessGroups = [
    {
      title: "PROFILE & SECURITY",
      items: [
        { label: "Settings", icon: <SettingsIcon />, route: "/user/account/profile", color: '#2563EB' },
        { label: "KYC", icon: <VerifiedUserIcon />, route: "/user/account/kyc", color: "#0D9488" },
        { label: "Privacy", icon: <LockIcon />, route: "/user/account/change-password", color: "#EA580C" },
      ]
    }
  ];

  const quickAccessServices = [
    // { label: "Transfer", icon: <SyncAltIcon />, route: "/user/transfer", color: "#FE8001" },
    // { label: "Scan & Pay", icon: <QrCode2Icon />, route: "/user/my-qr", color: "#FE8001" },
    // { label: "P2P Transfer", icon: <SendIcon />, route: "/user/p2p-transfer", color: "#FE8001" },
    { label: "New Vendor", icon: <PersonAddAltIcon />, route: "/user/team/new-register", color: "#8B5CF6" },
    { label: "Purchase Amount", icon: <InventoryIcon />, route: "/user/new-subscription", color: "#FE8001" },
    { label: "Vendor Sale Value", icon: <ReceiptLongIcon />, route: "/user/my-subscriptions", color: "#FE8001" },
  ];

  return (
    <Box sx={{
      pb: 8,
      bgcolor: '#FFFFFF',
      minHeight: '100vh',
      px: { xs: 2, sm: 3, md: 5, lg: 8 },
      pt: { xs: 2, md: 3 },
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {isVerifyingPayment && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(45,15,30,0.7)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#F4C95D', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700 }}>Verifying payment...</Typography>
        </Box>
      )}

      {/* ── TOP EXECUTIVE WELCOME & IDENTITY BAR ────────────────── */}
      <Box sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: { xs: 1.8, sm: 2.2 },
        mb: 3.5,
        mt: 1,
        p: { xs: 2.2, sm: 2.8 },
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #15242A 0%, #1F333B 65%, #2B444E 100%)',
        boxShadow: '0 12px 32px rgba(21, 36, 42, 0.35)',
        border: '1px solid rgba(254, 128, 1, 0.3)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle decorative golden ambient glow */}
        <Box sx={{
          position: 'absolute', top: -45, right: -45,
          width: 170, height: 170, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(254, 128, 1, 0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -35, left: -35,
          width: 120, height: 120, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 160, 51, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Top Row: User Identity (Left) & Official E-shopy Brand Logo (Right) */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          zIndex: 1
        }}>
          {/* User Identity: Avatar, Name, Member ID & User ID badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.8, sm: 2.5 } }}>
            <Avatar
              src={(memberDetails as any)?.profile_image || (memberDetails as any)?.photo || (memberDetails as any)?.avatar || undefined}
              onClick={() => navigate('/user/account/profile')}
              sx={{
                width: { xs: 54, sm: 62 },
                height: { xs: 54, sm: 62 },
                background: 'linear-gradient(135deg, #FE8001 0%, #FFA033 100%)',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: { xs: '1.45rem', sm: '1.7rem' },
                cursor: 'pointer',
                boxShadow: '0 8px 22px rgba(254, 128, 1, 0.45)',
                border: '2.5px solid rgba(255, 255, 255, 0.25)',
                transition: 'transform 0.25s ease',
                '&:hover': { transform: 'scale(1.05)' },
                '& .MuiAvatar-img': {
                  objectFit: 'cover'
                }
              }}
            >
              {(memberDetails?.Name || 'V').trim().charAt(0).toUpperCase()}
            </Avatar>

            <Box>
              <Typography sx={{
                fontSize: { xs: '1.1rem', sm: '1.2rem' },
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.2,
                letterSpacing: '0.4px',
                mt: 0.2
              }}>
                {memberDetails?.Name || 'Member'}
              </Typography>

              {/* Clickable ID Badges (Stacked: Login ID, Vendor ID below) */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7, mt: 0.8 }}>
                {/* Member / Login ID */}
                <Box
                  onClick={() => {
                    const id = memberDetails?.Member_id || memberDetails?.member_id || memberId;
                    if (id) {
                      navigator.clipboard.writeText(id);
                      toast.success(`Copied Login ID: ${id}`);
                    }
                  }}
                  title="Click to copy Login ID"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.7,
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(254, 128, 1, 0.35)',
                    px: 1.3,
                    py: 0.35,
                    borderRadius: '999px',
                    cursor: 'pointer',
                    width: 'fit-content',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(254, 128, 1, 0.18)',
                      borderColor: '#FE8001',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  <Typography sx={{ color: '#94A3B8', fontSize: '0.72rem', fontWeight: 600 }}>
                    LOGIN ID:
                  </Typography>
                  <Typography sx={{
                    color: '#FE8001',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    fontSize: { xs: '0.8rem', sm: '0.85rem' },
                    letterSpacing: '0.5px'
                  }}>
                    {memberDetails?.Member_id || memberDetails?.member_id || memberId || 'N/A'}
                  </Typography>
                  <ContentCopyIcon sx={{ fontSize: '0.85rem', color: '#FFA033', opacity: 0.85 }} />
                </Box>

                {/* Vendor ID Badge (below Login ID) */}
                <Box
                  onClick={() => {
                    const vendorId = memberDetails?.member_code || memberDetails?.user_id || (memberDetails as any)?.reference_id || 'N/A';
                    if (vendorId !== 'N/A') {
                      navigator.clipboard.writeText(vendorId);
                      toast.success(`Copied Vendor ID: ${vendorId}`);
                    }
                  }}
                  title="Click to copy Vendor ID"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.7,
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    px: 1.3,
                    py: 0.35,
                    borderRadius: '999px',
                    cursor: 'pointer',
                    width: 'fit-content',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  <Typography sx={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600 }}>
                    VENDOR ID:
                  </Typography>
                  <Typography sx={{ color: '#F8FAFC', fontFamily: 'monospace', fontWeight: 700, fontSize: { xs: '0.78rem', sm: '0.82rem' } }}>
                    {memberDetails?.member_code || memberDetails?.user_id || (memberDetails as any)?.reference_id || 'N/A'}
                  </Typography>
                  <ContentCopyIcon sx={{ fontSize: '0.8rem', color: '#94A3B8', opacity: 0.8 }} />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Official E-shopy Brand Logo (sm+ screens) */}
          
        </Box>

        {/* Bottom Row: Bitcoin Coin UI (Left Corner Below) & Level Badge (Right Corner) */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          pt: { xs: 0.8, sm: 1 },
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 1
        }}>
          {/* Left Corner Below: 3D Gold Bitcoin Coin UI */}
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.1,
            bgcolor: 'rgba(255, 179, 0, 0.1)',
            border: '1.5px solid rgba(255, 179, 0, 0.35)',
            borderRadius: '999px',
            pl: 0.5,
            pr: 1.4,
            py: 0.35,
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(6px)',
            transition: 'all 0.25s ease',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'rgba(255, 179, 0, 0.18)',
              borderColor: '#F59E0B',
              transform: 'translateY(-1px)'
            }
          }}>
            <BitcoinCoin size={34} />
            <Box>
              <Typography sx={{ color: '#FCD34D', fontSize: '0.74rem', fontWeight: 900, letterSpacing: '0.6px', lineHeight: 1.1 }}>
                BITCOIN
              </Typography>
              {/* <Typography sx={{ color: '#94A3B8', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.3px' }}>
                CRYPTO COIN
              </Typography> */}
            </Box>
          </Box>

          {/* Right Corner: Level Badge */}
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            bgcolor: 'rgba(254, 128, 1, 0.16)',
            border: '1.5px solid rgba(254, 128, 1, 0.45)',
            px: { xs: 1.3, sm: 1.6 },
            py: { xs: 0.45, sm: 0.55 },
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(254, 128, 1, 0.2)'
          }}>
            <Typography sx={{ color: '#FFA033', fontSize: { xs: '0.74rem', sm: '0.8rem' }, fontWeight: 800, letterSpacing: '0.6px' }}>
              LEVEL {memberDetails?.level ?? 0}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── PACKAGE CONTAINER DIRECTLY BELOW NAME & ID ─────────── */}
      <ProductsContainer />

      {/* Profile Settings (Quick Access Grid) immediately after Card */}
      <Box sx={{ mb: 3.5, width: '100%' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: { xs: 1.5, sm: 2.5 } }}>
          {quickAccessGroups.flatMap(group => group.items).map((item: any, i: number) => (
            <Box
              key={i}
              onClick={() => item.onClick ? item.onClick() : navigate(item.route)}
              sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                cursor: 'pointer', p: 1, borderRadius: '16px', transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{
                width: { xs: 54, sm: 62 },
                height: { xs: 54, sm: 62 },
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(254, 128, 1, 0.3)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #E06F00 0%, #FE8001 100%)',
                  boxShadow: '0 6px 18px rgba(254, 128, 1, 0.45)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}>
                {React.cloneElement(item.icon, { sx: { fontSize: { xs: 26, sm: 30 }, color: '#FFFFFF' } })}
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: { xs: '0.72rem', sm: '0.8rem' }, textAlign: 'center', color: '#1F333B' }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Quick Access (Out of container) below Profile Settings */}
      <Box sx={{ mb: 4, width: '100%' }}>
        {/* Quick Access 3-Column Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: { xs: 1.5, sm: 2.5 } }}>
          {quickAccessServices.map((item, i) => (
            <Box
              key={i}
              onClick={() => navigate(item.route)}
              sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                cursor: 'pointer', p: 1, borderRadius: '16px', transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{
                width: { xs: 54, sm: 62 },
                height: { xs: 54, sm: 62 },
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(254, 128, 1, 0.3)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #E06F00 0%, #FE8001 100%)',
                  boxShadow: '0 6px 18px rgba(254, 128, 1, 0.45)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}>
                {React.cloneElement(item.icon, { sx: { fontSize: { xs: 26, sm: 30 }, color: '#FFFFFF' } })}
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: { xs: '0.72rem', sm: '0.8rem' }, textAlign: 'center', color: '#1F333B' }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>


      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
            bgcolor: '#ffffff',
            boxShadow: '0 16px 40px rgba(109,33,79,0.18)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1F333B' }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#7a5060' }}>
            Are you sure you want to log out of your E shopy account?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setLogoutDialogOpen(false)}
            sx={{ color: '#7a5060', fontWeight: 700, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            variant="contained"
            sx={{
              bgcolor: '#FE8001',
              color: '#FFFFFF',
              fontWeight: 800,
              borderRadius: '12px',
              textTransform: 'none',
              '&:hover': { bgcolor: '#E06F00' }
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>


      {/* ── UNIFIED WALLETS CONTAINER (LIGHT GREEN BG) ── */}
      <Paper elevation={0} sx={{
        p: { xs: 2.2, sm: 2.8, md: 3.2 },
        mb: 4,
        borderRadius: { xs: '24px', sm: '28px' },
        background: 'linear-gradient(180deg, #F0FDF4 0%, #E8F8F0 100%)',
        border: '1.5px solid #BBF7D0',
        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.08)',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 2.2, sm: 2.8 }
      }}>
        {/* 1. Main Wallet Section */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          gap: { xs: 2, sm: 3, md: 4 },
          width: '100%'
        }}>
          {/* Left Side: Wallet Balance & Credits info (Parallel Left) */}
          <Box 
            onClick={() => navigate('/user/transactions?type=credits')}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minWidth: 0,
              gap: { xs: 1.2, sm: 1.6, md: 2 },
              bgcolor: '#FFFFFF',
              border: '1.5px solid #D1FAE5',
              borderRadius: { xs: '20px', sm: '24px' },
              p: { xs: 2.2, sm: 3.2, md: 3.8 },
              minHeight: { xs: '170px', sm: '200px', md: '220px' },
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.05)',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.12)',
                borderColor: '#10B981'
              }
            }}
          >
            {/* Icon + Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.2, sm: 1.6 } }}>
              <Box sx={{
                p: { xs: 0.5, sm: 1.1 },
                borderRadius: '12px',
                bgcolor: 'rgba(254, 128, 1, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(254, 128, 1, 0.4)',
                flexShrink: 0
              }}>
                <PaymentsIcon sx={{ fontSize: { xs: 22, sm: 26, md: 30 }, color: '#FE8001' }} />
              </Box>
              <Typography sx={{
                color: '#FE8001',
                fontWeight: 900,
                fontSize: { xs: '1.05rem', sm: '1.2rem', md: '1.35rem' },
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                letterSpacing: '0.8px'
              }}>
                Wallet
              </Typography>
            </Box>

            {/* Rupee Balance (Main Wallet: for Add Credit, Withdrawal, New Subscription) */}
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: { xs: 0.5, sm: 0.8 }, my: { xs: 0.5, sm: 0.8 } }}>
              <Typography sx={{
                color: '#FE8001',
                fontWeight: 800,
                fontSize: { xs: '1.45rem', sm: '1.85rem', md: '2.2rem' },
                lineHeight: 1.1,
                letterSpacing: '-0.5px'
              }}>
                ₹{Number(walletOverview?.balance ?? walletOverview?.availableForWithdrawal ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Typography>
            </Box>

            <Typography sx={{
              color: '#475569',
              lineHeight: 1.5,
              fontSize: { xs: '0.88rem', sm: '0.96rem', md: '1.05rem' },
              fontWeight: 500,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              Fund your wallet to invest, unlock returns, and start growing your earnings.
            </Typography>
          </Box>

          {/* Right Side: 3 Action Buttons Stacked Parallel on Right */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 1.2, sm: 1.6, md: 2 },
            width: { xs: '135px', sm: '175px', md: '210px' },
            flexShrink: 0,
            justifyContent: 'space-between'
          }}>
            {/* 1. Add (Light Mint/Green) */}
            <Button
              variant="contained"
              onClick={() => navigate('/user/load-fund')}
              startIcon={<AddIcon sx={{ fontSize: { xs: '20px !important', sm: '23px !important' }, color: '#15803D' }} />}
              fullWidth
              sx={{
                flex: 1,
                minHeight: { xs: '46px', sm: '54px', md: '60px' },
                background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
                color: '#15803D',
                border: '1.5px solid #86EFAC',
                borderRadius: { xs: '12px', sm: '16px' },
                px: { xs: 1.5, sm: 2.2 },
                py: { xs: 1, sm: 1.3 },
                fontWeight: 800,
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.05rem' },
                textTransform: 'none',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #BBF7D0 0%, #86EFAC 100%)',
                  boxShadow: '0 6px 16px rgba(34, 197, 94, 0.25)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Add
            </Button>

            {/* 2. Withdraw (Light Sky Blue) */}
            <Button
              variant="contained"
              onClick={() => navigate('/user/wallet?type=withdrawal')}
              startIcon={<PaymentsIcon sx={{ fontSize: { xs: '20px !important', sm: '23px !important' }, color: '#0369A1' }} />}
              fullWidth
              sx={{
                flex: 1,
                minHeight: { xs: '46px', sm: '54px', md: '60px' },
                background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
                color: '#0369A1',
                border: '1.5px solid #7DD3FC',
                borderRadius: { xs: '12px', sm: '16px' },
                px: { xs: 1.5, sm: 2.2 },
                py: { xs: 1, sm: 1.3 },
                fontWeight: 800,
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.05rem' },
                textTransform: 'none',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.15)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #BAE6FD 0%, #7DD3FC 100%)',
                  boxShadow: '0 6px 16px rgba(14, 165, 233, 0.25)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Withdraw
            </Button>

            {/* 3. Activation (Light Warm Amber) */}
            <Button
              variant="contained"
              onClick={() => navigate('/user/new-subscription')}
              startIcon={<BoltIcon sx={{ fontSize: { xs: '20px !important', sm: '23px !important' }, color: '#B45309' }} />}
              fullWidth
              sx={{
                flex: 1,
                minHeight: { xs: '46px', sm: '54px', md: '60px' },
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                color: '#B45309',
                border: '1.5px solid #FCD34D',
                borderRadius: { xs: '12px', sm: '16px' },
                px: { xs: 1.5, sm: 2.2 },
                py: { xs: 1, sm: 1.3 },
                fontWeight: 800,
                fontSize: { xs: '0.88rem', sm: '0.98rem', md: '1.02rem' },
                textTransform: 'none',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FDE68A 0%, #FBBF24 100%)',
                  boxShadow: '0 6px 16px rgba(245, 158, 11, 0.25)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Activation
            </Button>
          </Box>
        </Box>

        {/* Elegant subtle separator line */}
        <Box sx={{
          width: '100%',
          height: '1px',
          background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.25) 50%, rgba(16, 185, 129, 0.05) 100%)'
        }} />

        {/* 2. Sale Value & Product Level Wallets (Strictly Side-by-Side) */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: { xs: 1.4, sm: 2.2, md: 3 },
          width: '100%'
        }}>
          {/* Sale Value Card */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minWidth: 0,
              bgcolor: '#FFFFFF',
              border: '1.5px solid #D1FAE5',
              borderRadius: { xs: '16px', sm: '22px' },
              p: { xs: 1.6, sm: 2.5, md: 3 },
              minHeight: { xs: '160px', sm: '190px' },
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.05)',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.12)',
                borderColor: '#10B981'
              }
            }}
          >
            {/* Top: Icon + Title */}
            <Box 
              onClick={() => navigate('/user/vendor-wallet')}
              sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.4 }, cursor: 'pointer' }}
            >
              <Box sx={{
                p: { xs: 0.5, sm: 0.8 },
                borderRadius: '10px',
                bgcolor: 'rgba(254, 128, 1, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(254, 128, 1, 0.4)',
                flexShrink: 0
              }}>
                <StorefrontIcon sx={{ fontSize: { xs: 18, sm: 24, md: 26 }, color: '#FE8001' }} />
              </Box>
              <Typography sx={{
                color: '#FE8001',
                fontWeight: 900,
                fontSize: { xs: '0.86rem', sm: '1.1rem', md: '1.25rem' },
                lineHeight: 1.2,
                letterSpacing: '0.4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                Sale Value
              </Typography>
            </Box>

            {/* Sale Value Balance */}
            <Box 
              onClick={() => navigate('/user/vendor-wallet')}
              sx={{ my: { xs: 1, sm: 1.5 }, cursor: 'pointer' }}
            >
              <Typography sx={{
                color: '#1F333B',
                fontWeight: 900,
                fontSize: { xs: '1.18rem', sm: '1.65rem', md: '2rem' },
                lineHeight: 1.1,
                letterSpacing: '-0.5px'
              }}>
                ₹{Number(walletOverview?.vendorWalletBalance ?? memberDetails?.vendor_wallet ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>

            {/* Withdraw Button below balance */}
            <Button
              variant="contained"
              onClick={() => navigate('/user/vendor-wallet')}
              startIcon={<PaymentsIcon sx={{ fontSize: { xs: '16px !important', sm: '20px !important' }, color: '#6D28D9' }} />}
              fullWidth
              sx={{
                mt: 'auto',
                minHeight: { xs: '38px', sm: '44px', md: '48px' },
                background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)',
                color: '#6D28D9',
                border: '1.5px solid #C4B5FD',
                borderRadius: { xs: '10px', sm: '14px' },
                px: { xs: 1, sm: 1.8 },
                py: { xs: 0.6, sm: 1 },
                fontWeight: 900,
                fontSize: { xs: '0.8rem', sm: '0.92rem', md: '0.98rem' },
                textTransform: 'none',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(109, 40, 217, 0.15)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)',
                  boxShadow: '0 6px 20px rgba(109, 40, 217, 0.25)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Withdraw
            </Button>
          </Box>

          {/* Product Level Card */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minWidth: 0,
              bgcolor: '#FFFFFF',
              border: '1.5px solid #D1FAE5',
              borderRadius: { xs: '16px', sm: '22px' },
              p: { xs: 1.6, sm: 2.5, md: 3 },
              minHeight: { xs: '160px', sm: '190px' },
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.05)',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.12)',
                borderColor: '#10B981'
              }
            }}
          >
            {/* Top: Icon + Title */}
            <Box 
              onClick={() => navigate('/user/product-level-wallet')}
              sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.4 }, cursor: 'pointer' }}
            >
              <Box sx={{
                p: { xs: 0.5, sm: 0.8 },
                borderRadius: '10px',
                bgcolor: 'rgba(14, 165, 233, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(14, 165, 233, 0.4)',
                flexShrink: 0
              }}>
                <InventoryIcon sx={{ fontSize: { xs: 18, sm: 24, md: 26 }, color: '#0284C7' }} />
              </Box>
              <Typography sx={{
                color: '#0284C7',
                fontWeight: 900,
                fontSize: { xs: '0.86rem', sm: '1.1rem', md: '1.25rem' },
                lineHeight: 1.2,
                letterSpacing: '0.4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                Product Level
              </Typography>
            </Box>

            {/* Product Level Balance */}
            <Box 
              onClick={() => navigate('/user/product-level-wallet')}
              sx={{ my: { xs: 1, sm: 1.5 }, cursor: 'pointer' }}
            >
              <Typography sx={{
                color: '#1F333B',
                fontWeight: 900,
                fontSize: { xs: '1.18rem', sm: '1.65rem', md: '2rem' },
                lineHeight: 1.1,
                letterSpacing: '-0.5px'
              }}>
                ₹{Number(walletOverview?.productLevelBalance ?? walletOverview?.levelBenefits ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>

            {/* Withdraw Button below balance */}
            <Button
              variant="contained"
              onClick={() => navigate('/user/product-level-wallet')}
              startIcon={<PaymentsIcon sx={{ fontSize: { xs: '16px !important', sm: '20px !important' }, color: '#0369A1' }} />}
              fullWidth
              sx={{
                mt: 'auto',
                minHeight: { xs: '38px', sm: '44px', md: '48px' },
                background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
                color: '#0369A1',
                border: '1.5px solid #7DD3FC',
                borderRadius: { xs: '10px', sm: '14px' },
                px: { xs: 1, sm: 1.8 },
                py: { xs: 0.6, sm: 1 },
                fontWeight: 900,
                fontSize: { xs: '0.8rem', sm: '0.92rem', md: '0.98rem' },
                textTransform: 'none',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.15)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #BAE6FD 0%, #7DD3FC 100%)',
                  boxShadow: '0 6px 20px rgba(14, 165, 233, 0.25)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Withdraw
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Modern Redesigned Refer & Earn Bar (Royal Indigo-Violet Gradient) */}
      <Box sx={{ mt: 2.5, mb: 3.5 }}>
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            p: { xs: '14px 18px', sm: '16px 24px' },
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #8B5CF6 100%)',
            boxShadow: '0 10px 28px rgba(99, 102, 241, 0.28)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle background ambient lights */}
          <Box sx={{
            position: 'absolute', top: -30, right: -30,
            width: 100, height: 100, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Left: Icon + Title & Code */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, zIndex: 1 }}>
            <Box
              sx={{
                width: { xs: 40, sm: 46 },
                height: { xs: 40, sm: 46 },
                borderRadius: '14px',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <CardGiftcardIcon sx={{ fontSize: { xs: 24, sm: 26 } }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '0.98rem', sm: '1.1rem' },
                    color: '#FFFFFF',
                    lineHeight: 1.2,
                  }}
                >
                  Refer & Earn
                </Typography>
                {referralCode && (
                  <Chip
                    label={`Code: ${referralCode}`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      height: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.35)'
                    }}
                  />
                )}
              </Box>
              <Typography
                noWrap
                sx={{
                  fontSize: { xs: '0.74rem', sm: '0.82rem' },
                  color: '#E0E7FF',
                  fontWeight: 600,
                  mt: 0.3,
                }}
              >
                Share your referral link with friends and earn rewards
              </Typography>
            </Box>
          </Box>

          {/* Right: Copy & Share Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, zIndex: 1 }}>
            <Button
              onClick={handleCopyReferralLink}
              startIcon={<ContentCopyIcon sx={{ fontSize: '16px !important' }} />}
              sx={{
                bgcolor: '#FFFFFF',
                color: '#4338CA',
                borderRadius: '12px',
                fontWeight: 850,
                fontSize: { xs: '0.8rem', sm: '0.88rem' },
                textTransform: 'none',
                px: { xs: 1.5, sm: 2 },
                py: 0.8,
                boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                '&:hover': {
                  bgcolor: '#F5F3FF',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.22)'
                },
                transition: 'all 0.2s ease',
              }}
            >
              Copy Link
            </Button>
            <IconButton
              onClick={handleShareReferral}
              title="Share"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                borderRadius: '12px',
                width: 40,
                height: 40,
                border: '1px solid rgba(255, 255, 255, 0.35)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.32)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <ShareIcon sx={{ fontSize: 19 }} />
            </IconButton>
          </Box>
        </Paper>
      </Box>

      {/* Team & Referral Stats (Compact) */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: { xs: 1.5, sm: 2 },
        mb: 3.5
      }}>
        {/* 1. My Team Card */}
        <Box
          onClick={() => navigate('/user/team')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            p: { xs: 1.4, sm: 1.8 },
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            border: '1px solid #BFDBFE',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.08)',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(59, 130, 246, 0.16)'
            }
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{
              color: '#1e3a8a',
              fontWeight: 800,
              fontSize: { xs: '0.82rem', sm: '0.92rem' },
              lineHeight: 1.2,
              mb: 0.4
            }}>
              My Team
            </Typography>
            <Typography sx={{
              fontWeight: 900,
              color: '#1e3a8a',
              fontSize: { xs: '1.25rem', sm: '1.45rem' },
              lineHeight: 1
            }}>
              {Math.max(memberDetails?.registration_stats?.total || 0, memberDetails?.total_team || 0)}
            </Typography>
          </Box>
          <Box sx={{
            width: { xs: 40, sm: 46 },
            height: { xs: 40, sm: 46 },
            borderRadius: '12px',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(30, 58, 138, 0.1)'
          }}>
            <GroupsIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: '#2563eb' }} />
          </Box>
        </Box>

        {/* 2. My Referral Card */}
        <Box 
          onClick={() => navigate('/user/team/direct')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            p: { xs: 1.4, sm: 1.8 },
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
            border: '1px solid #FED7AA',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.08)',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(234, 88, 12, 0.16)'
            }
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{
              color: '#7c2d12',
              fontWeight: 800,
              fontSize: { xs: '0.82rem', sm: '0.92rem' },
              lineHeight: 1.2,
              mb: 0.4
            }}>
              My Referral
            </Typography>
            <Typography sx={{
              fontWeight: 900,
              color: '#7c2d12',
              fontSize: { xs: '1.25rem', sm: '1.45rem' },
              lineHeight: 1
            }}>
              {Math.max(memberDetails?.registration_stats?.direct || 0, memberDetails?.direct_referrals?.length || 0)}
            </Typography>
          </Box>
          <Box sx={{
            width: { xs: 40, sm: 46 },
            height: { xs: 40, sm: 46 },
            borderRadius: '12px',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(124, 45, 18, 0.1)'
          }}>
            <PersonAddAltIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: '#ea580c' }} />
          </Box>
        </Box>
      </Box>

      {/* Earnings Summary - Compact 3 in Row Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ color: '#1F333B', fontWeight: 900, mb: 1.4, fontSize: { xs: '1rem', sm: '1.15rem' }, letterSpacing: '-0.3px' }}>
          Earnings Summary
        </Typography>

        {/* Scrollable Container (3 cards in row) */}
        <Box sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: { xs: 1, sm: 1.5 },
          pb: 1.2,
          pt: 0.2,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {/* Card 1: Referral Commission */}
          <Box
            onClick={() => navigate('/user/earnings/referral-bonus')}
            sx={{
              flex: { xs: '0 0 calc(33.33% - 7px)', sm: '0 0 calc(33.33% - 10px)', md: '0 0 160px' },
              minWidth: { xs: '115px', sm: '135px' },
              scrollSnapAlign: 'start',
              borderRadius: { xs: '20px', sm: '22px' },
              background: 'linear-gradient(180deg, #E8F8F0 0%, #D5F5E3 100%)',
              border: '1px solid #B7E8D6',
              p: { xs: 1.4, sm: 1.8 },
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: { xs: '165px', sm: '185px' },
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.08)',
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 18px rgba(16, 185, 129, 0.14)' }
            }}
          >
            <Box>
              <Typography sx={{ color: '#064e3b', fontWeight: 900, fontSize: { xs: '0.85rem', sm: '0.95rem' }, lineHeight: 1.2, mb: 0.2 }}>
                Referral Bonus
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '9.5px', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                Instant bonus
              </Typography>
            </Box>

            <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: { xs: 52, sm: 62 },
                height: { xs: 52, sm: 62 },
                borderRadius: '18px',
                bgcolor: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
                boxShadow: '0 4px 12px rgba(6, 78, 59, 0.06)'
              }}>
                <PaymentsIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#059669' }} />
              </Box>
              <Box sx={{
                bgcolor: '#ffffff',
                border: '1px solid #a7f3d0',
                borderRadius: '10px',
                py: 0.4,
                px: 0.8,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.08)'
              }}>
                <Typography sx={{ color: '#065f46', fontWeight: 900, fontSize: { xs: '0.8rem', sm: '0.92rem' }, letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  ₹{Number(walletOverview?.directBenefits || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Card: Product Level Bonus */}
          <Box
            onClick={() => navigate('/user/product-level-wallet')}
            sx={{
              flex: { xs: '0 0 calc(33.33% - 7px)', sm: '0 0 calc(33.33% - 10px)', md: '0 0 160px' },
              minWidth: { xs: '115px', sm: '135px' },
              scrollSnapAlign: 'start',
              borderRadius: { xs: '20px', sm: '22px' },
              background: 'linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 100%)',
              border: '1px solid #BAE6FD',
              p: { xs: 1.4, sm: 1.8 },
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: { xs: '165px', sm: '185px' },
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08)',
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 18px rgba(2, 132, 199, 0.14)' }
            }}
          >
            <Box>
              <Typography sx={{ color: '#0369A1', fontWeight: 900, fontSize: { xs: '0.85rem', sm: '0.95rem' }, lineHeight: 1.2, mb: 0.2 }}>
                Product Level Bonus
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '9.5px', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                Product level earnings
              </Typography>
            </Box>

            <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: { xs: 52, sm: 62 },
                height: { xs: 52, sm: 62 },
                borderRadius: '18px',
                bgcolor: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.06)'
              }}>
                <InventoryIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#0284C7' }} />
              </Box>
              <Box sx={{
                bgcolor: '#ffffff',
                border: '1px solid #BAE6FD',
                borderRadius: '10px',
                py: 0.4,
                px: 0.8,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.08)'
              }}>
                <Typography sx={{ color: '#0369A1', fontWeight: 900, fontSize: { xs: '0.8rem', sm: '0.92rem' }, letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  ₹{Number(walletOverview?.productLevelBalance ?? walletOverview?.levelBenefits ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Card 2: Brokerage Override */}
          <Box
            onClick={() => navigate('/user/earnings/level-benefits')}
            sx={{
              flex: { xs: '0 0 calc(33.33% - 7px)', sm: '0 0 calc(33.33% - 10px)', md: '0 0 160px' },
              minWidth: { xs: '115px', sm: '135px' },
              scrollSnapAlign: 'start',
              borderRadius: { xs: '20px', sm: '22px' },
              background: 'linear-gradient(180deg, #FEF9E7 0%, #FEF3C7 100%)',
              border: '1px solid #FDE68A',
              p: { xs: 1.4, sm: 1.8 },
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: { xs: '165px', sm: '185px' },
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.08)',
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 18px rgba(217, 119, 6, 0.14)' }
            }}
          >
            <Box>
              <Typography sx={{ color: '#78350f', fontWeight: 900, fontSize: { xs: '0.85rem', sm: '0.95rem' }, lineHeight: 1.2, mb: 0.2 }}>
                Level Bonus
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '9.5px', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                Level progression
              </Typography>
            </Box>

            <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: { xs: 52, sm: 62 },
                height: { xs: 52, sm: 62 },
                borderRadius: '18px',
                bgcolor: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
                boxShadow: '0 4px 12px rgba(120, 53, 15, 0.06)'
              }}>
                <AccountTreeIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#d97706' }} />
              </Box>
              <Box sx={{
                bgcolor: '#ffffff',
                border: '1px solid #fde68a',
                borderRadius: '10px',
                py: 0.4,
                px: 0.8,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(217, 119, 6, 0.08)'
              }}>
                <Typography sx={{ color: '#92400e', fontWeight: 900, fontSize: { xs: '0.8rem', sm: '0.92rem' }, letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  ₹{Number(walletOverview?.levelBenefits || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Card: Level Daily ROI (50-Day ROI) */}
          <Box
            onClick={() => navigate('/user/earnings/level-daily-roi')}
            sx={{
              flex: { xs: '0 0 calc(33.33% - 7px)', sm: '0 0 calc(33.33% - 10px)', md: '0 0 160px' },
              minWidth: { xs: '115px', sm: '135px' },
              scrollSnapAlign: 'start',
              borderRadius: { xs: '20px', sm: '22px' },
              background: 'linear-gradient(180deg, #EEF2FF 0%, #E0E7FF 100%)',
              border: '1px solid #C7D2FE',
              p: { xs: 1.4, sm: 1.8 },
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: { xs: '165px', sm: '185px' },
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.08)',
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 18px rgba(79, 70, 229, 0.14)' }
            }}
          >
            <Box>
              <Typography sx={{ color: '#312e81', fontWeight: 900, fontSize: { xs: '0.85rem', sm: '0.95rem' }, lineHeight: 1.2, mb: 0.2 }}>
                Level Daily ROI
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '9.5px', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                50-day payout
              </Typography>
            </Box>

            <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: { xs: 52, sm: 62 },
                height: { xs: 52, sm: 62 },
                borderRadius: '18px',
                bgcolor: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
                boxShadow: '0 4px 12px rgba(49, 46, 129, 0.06)'
              }}>
                <ShowChartIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#4f46e5' }} />
              </Box>
              <Box sx={{
                bgcolor: '#ffffff',
                border: '1px solid #c7d2fe',
                borderRadius: '10px',
                py: 0.4,
                px: 0.8,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.08)'
              }}>
                <Typography sx={{ color: '#3730a3', fontWeight: 900, fontSize: { xs: '0.8rem', sm: '0.92rem' }, letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  ₹{Number(walletOverview?.levelDailyRoi ?? walletOverview?.roiLevelBenefits ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Card 3: Direct Commission */}
          <Box
            onClick={() => navigate('/user/earnings/single-level-income-history')}
            sx={{
              flex: { xs: '0 0 calc(33.33% - 7px)', sm: '0 0 calc(33.33% - 10px)', md: '0 0 160px' },
              minWidth: { xs: '115px', sm: '135px' },
              scrollSnapAlign: 'start',
              borderRadius: { xs: '20px', sm: '22px' },
              background: 'linear-gradient(180deg, #FDF2F4 0%, #FEE2E2 100%)',
              border: '1px solid #FECACA',
              p: { xs: 1.4, sm: 1.8 },
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: { xs: '165px', sm: '185px' },
              boxShadow: '0 4px 14px rgba(225, 29, 72, 0.08)',
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 18px rgba(225, 29, 72, 0.14)' }
            }}
          >
            <Box>
              <Typography sx={{ color: '#850d31ff', fontWeight: 900, fontSize: { xs: '0.85rem', sm: '0.95rem' }, lineHeight: 1.2, mb: 0.2 }}>
                Daily Incentive
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '9.5px', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                Structure earnings
              </Typography>
            </Box>

            <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: { xs: 52, sm: 62 },
                height: { xs: 52, sm: 62 },
                borderRadius: '18px',
                bgcolor: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
                boxShadow: '0 4px 12px rgba(136, 19, 55, 0.06)'
              }}>
                <TrendingUpIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#e11d48' }} />
              </Box>
              <Box sx={{
                bgcolor: '#ffffff',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                py: 0.4,
                px: 0.8,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(225, 29, 72, 0.08)'
              }}>
                <Typography sx={{ color: '#9f1239', fontWeight: 900, fontSize: { xs: '0.8rem', sm: '0.92rem' }, letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  ₹{Number((parseFloat(walletOverview?.singleLineIncome) || 0)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Card 4: Total Withdrawal */}
          <Box
            onClick={() => navigate('/user/transactions?type=Withdrawal')}
            sx={{
              flex: { xs: '0 0 calc(33.33% - 7px)', sm: '0 0 calc(33.33% - 10px)', md: '0 0 160px' },
              minWidth: { xs: '115px', sm: '135px' },
              scrollSnapAlign: 'start',
              borderRadius: { xs: '20px', sm: '22px' },
              background: 'linear-gradient(180deg, #F5F3FF 0%, #EDE9FE 100%)',
              border: '1px solid #DDD6FE',
              p: { xs: 1.4, sm: 1.8 },
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: { xs: '165px', sm: '185px' },
              boxShadow: '0 4px 14px rgba(109, 33, 79, 0.08)',
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 18px rgba(109, 33, 79, 0.14)' }
            }}
          >
            <Box>
              <Typography sx={{ color: '#4c1d95', fontWeight: 900, fontSize: { xs: '0.85rem', sm: '0.95rem' }, lineHeight: 1.2, mb: 0.2 }}>
                Withdrawals
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '9.5px', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                Processed payouts
              </Typography>
            </Box>

            <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: { xs: 52, sm: 62 },
                height: { xs: 52, sm: 62 },
                borderRadius: '18px',
                bgcolor: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
                boxShadow: '0 4px 12px rgba(76, 29, 149, 0.06)'
              }}>
                <AttachMoneyIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#7c3aed' }} />
              </Box>
              <Box sx={{
                bgcolor: '#ffffff',
                border: '1px solid #ddd6fe',
                borderRadius: '10px',
                py: 0.4,
                px: 0.8,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.08)'
              }}>
                <Typography sx={{ color: '#5b21b6', fontWeight: 900, fontSize: { xs: '0.8rem', sm: '0.92rem' }, letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  ₹{Number(walletOverview?.totalWithdrawal || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Re-Invest / Re-Topup Section - Commented out */}
      {/* {canShowReinvest && (
        <>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.4 }}>
              <Typography sx={{ color: '#1F333B', fontWeight: 900, fontSize: { xs: '1rem', sm: '1.15rem' }, letterSpacing: '-0.3px' }}>
                Re-Invest
              </Typography>
            </Box>

            <Box
              sx={{
                borderRadius: { xs: '20px', sm: '22px' },
                background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                border: '1.5px solid #BAE6FD',
                p: { xs: 2, sm: 2.5 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                boxShadow: '0 4px 16px rgba(0, 186, 242, 0.08)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(0, 186, 242, 0.14)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                <Box sx={{
                  width: { xs: 46, sm: 52 },
                  height: { xs: 46, sm: 52 },
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 186, 242, 0.3)',
                  flexShrink: 0
                }}>
                  <AutorenewIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: '#FFFFFF' }} />
                </Box>
                <Box>
                  <Typography sx={{ color: '#0369a1', fontWeight: 900, fontSize: { xs: '0.85rem', sm: '0.95rem' }, lineHeight: 1.2 }}>
                    Re-Invest
                  </Typography>
                  <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.82rem' }, mt: 0.3 }}>
                    Wallet Balance: <strong style={{ color: '#0284c7' }}>₹{Number(walletOverview?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </Typography>
                </Box>
              </Box>

              <Button
                size="small"
                variant="contained"
                onClick={() => setReTopupDialogOpen(true)}
                startIcon={<AutorenewIcon sx={{ fontSize: 18 }} />}
                sx={{
                  background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: { xs: '0.8rem', sm: '0.88rem' },
                  borderRadius: '12px',
                  px: { xs: 2, sm: 2.8 },
                  py: { xs: 0.8, sm: 1 },
                  textTransform: 'none',
                  boxShadow: '0 3px 10px rgba(0, 186, 242, 0.35)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FF9933 0%, #E06F00 100%)',
                    boxShadow: '0 5px 14px rgba(0, 186, 242, 0.45)'
                  }
                }}
              >
                Re-Invest
              </Button>
            </Box>
          </Box>

          <ReTopupDialog open={reTopupDialogOpen} onClose={() => setReTopupDialogOpen(false)} />
        </>
      )} */}
    </Box>
  );
};

export default UserDashboard;

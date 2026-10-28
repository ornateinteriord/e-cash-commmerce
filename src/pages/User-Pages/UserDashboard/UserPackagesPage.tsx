import React, { useState, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Container,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarsIcon from '@mui/icons-material/Stars';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import UserContext from '../../../context/user/userContext';
import { useGetWalletOverview } from '../../../api/Memeber';
import { useBuyPackageDirectlyMutation, useGetMemberAddOns } from '../../../api/Packages';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

interface PackagePlan {
  id: number;
  amount: number;
  title: string;
  tag: string;
  color: string;
  lightBg: string;
  borderHover: string;
  description: string;
  features: string[];
}

export const PACKAGES: PackagePlan[] = [
  {
    id: 1,
    amount: 25000,
    title: 'Starter Store',
    tag: 'Starter',
    color: '#EA580C',
    lightBg: '#FFF7ED',
    borderHover: '#FED7AA',
    description: 'Essential product catalog listings to launch your vendor store on E-shopy',
    features: [
      '10 Product Listings',
      'Selected Category Access',
      'Verified Vendor Badge'
    ]
  },
  {
    id: 2,
    amount: 50000,
    title: 'Prime Merchant',
    tag: 'Prime',
    color: '#0284C7',
    lightBg: '#F0F9FF',
    borderHover: '#BAE6FD',
    description: 'Scale your store with higher product capacity and buyer inquiry priority',
    features: [
      '25 Product Listings',
      'Selected Category Access',
      'Priority Buyer Inquiries'
    ]
  },
  {
    id: 3,
    amount: 100000,
    title: 'Power Seller Hub',
    tag: 'Power Seller',
    color: '#059669',
    lightBg: '#ECFDF5',
    borderHover: '#A7F3D0',
    description: 'Accelerate your sales with high-volume listings and featured search rankings',
    features: [
      '60 Product Listings',
      'Multi-Category Access',
      'Featured Search Ranking'
    ]
  },
  {
    id: 4,
    amount: 200000,
    title: 'Super Store Partner',
    tag: 'Super Store',
    color: '#7C3AED',
    lightBg: '#F5F3FF',
    borderHover: '#DDD6FE',
    description: 'Comprehensive vendor package with all categories unlocked and brand storefront spotlight',
    features: [
      '150 Product Listings',
      'All Categories Unlocked',
      'Homepage Brand Spotlight'
    ]
  },
  {
    id: 5,
    amount: 500000,
    title: 'Mega Flagship Store',
    tag: 'Mega Flagship',
    color: '#D97706',
    lightBg: '#FFFBEB',
    borderHover: '#FDE68A',
    description: 'Premier vendor tier with maximum 500 product catalog listings, omni-channel promotion, and dedicated vendor support',
    features: [
      '500 Product Listings',
      'All Categories Unlocked',
      'Top Brand Promotion & Dedicated Support'
    ]
  }
];

const UserPackagesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const memberId = user?.Member_id || '';

  const { data: walletOverview } = useGetWalletOverview(memberId);
  const { data: memberAddons } = useGetMemberAddOns(memberId);
  const { mutate: buyPackage, isPending } = useBuyPackageDirectlyMutation();

  const [confirmPkg, setConfirmPkg] = useState<PackagePlan | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState<boolean>(false);
  const [purchasedPkg, setPurchasedPkg] = useState<PackagePlan | null>(null);

  const creditBalance = Number(walletOverview?.balance ?? walletOverview?.availableForWithdrawal ?? 0);

  const isPurchased = (pkgAmount: number): boolean => {
    if (Number(walletOverview?.primaryPackage) === pkgAmount) return true;
    if (Number(user?.package_value) === pkgAmount) return true;
    if (Array.isArray(memberAddons) && memberAddons.length > 0) {
      if (memberAddons.some((addon: any) => Number(addon.amount) === pkgAmount)) return true;
    }
    return false;
  };

  const handleCardClick = (pkgAmount: number) => {
    if (isPurchased(pkgAmount)) {
      navigate(`/user/earnings/package-detail?package=${pkgAmount}`);
    }
  };

  const handleBuyClick = (e: React.MouseEvent, pkg: PackagePlan) => {
    e.stopPropagation();
    setConfirmPkg(pkg);
  };

  const executeBuy = () => {
    if (!confirmPkg || !memberId) {
      toast.error('User information not found');
      return;
    }

    if (creditBalance < confirmPkg.amount) {
      toast.error(`Insufficient Wallet Balance! You have ₹${creditBalance.toLocaleString('en-IN')} but need ₹${confirmPkg.amount.toLocaleString('en-IN')}`);
      return;
    }

    buyPackage(
      { member_id: memberId, requested_amount: confirmPkg.amount },
      {
        onSuccess: () => {
          setPurchasedPkg(confirmPkg);
          setConfirmPkg(null);
          setSuccessDialogOpen(true);
          queryClient.invalidateQueries({ queryKey: ['walletOverview'] });
          queryClient.invalidateQueries({ queryKey: ['memberDetails'] });
          queryClient.invalidateQueries({ queryKey: ['addOns'] });
          queryClient.invalidateQueries({ queryKey: ['member-addons'] });
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || err?.message || 'Purchase failed');
        }
      }
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2.5, sm: 4 }, px: { xs: 2, sm: 3 } }}>
      {/* Top Header Bar */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', md: 'center' },
        gap: 2,
        mb: 3.5
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            onClick={() => navigate('/user/dashboard')}
            sx={{
              bgcolor: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: '14px',
              p: 1.2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              '&:hover': { bgcolor: '#F8FAFC', transform: 'translateX(-2px)' },
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowBackIcon sx={{ color: '#1F333B', fontSize: 22 }} />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#1F333B', lineHeight: 1.2 }}>
              Vendor Packages
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, mt: 0.3 }}>
              Select a suitable plan to activate and scale your online business
            </Typography>
          </Box>
        </Box>

        {/* Credit Balance & Deposit Pill */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: '#FFFFFF',
          px: 2.2,
          py: 1,
          borderRadius: '16px',
          border: '1.5px solid #FED7AA',
          boxShadow: '0 4px 16px rgba(254, 128, 1, 0.08)'
        }}>
          <AccountBalanceWalletIcon sx={{ color: '#FE8001', fontSize: 24 }} />
          <Box>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', lineHeight: 1 }}>
              Available Balance
            </Typography>
            <Typography variant="body1" sx={{ color: '#1F333B', fontWeight: 900 }}>
              ₹{creditBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
          {/* <Button
            size="small"
            variant="outlined"
            onClick={() => navigate('/user/transactions?type=credits')}
            startIcon={<AddCardIcon sx={{ fontSize: '15px !important' }} />}
            sx={{
              ml: 1,
              borderColor: '#FED7AA',
              color: '#FE8001',
              fontWeight: 800,
              fontSize: '0.74rem',
              borderRadius: '10px',
              textTransform: 'none',
              '&:hover': { borderColor: '#FE8001', bgcolor: 'rgba(254, 128, 1, 0.08)' }
            }}
          >
            Add Funds
          </Button> */}
        </Box>
      </Box>

      {/* Package Grid */}
      <Grid container spacing={3}>
        {PACKAGES.map((pkg) => {
          const purchased = isPurchased(pkg.amount);

          return (
            <Grid item xs={12} sm={6} lg={4} key={pkg.id}>
              <Card
                onClick={() => handleCardClick(pkg.amount)}
                sx={{
                  height: '100%',
                  bgcolor: '#FFFFFF',
                  borderRadius: '24px',
                  border: purchased ? `2px solid ${pkg.color}` : '1.5px solid #FED7AA',
                  boxShadow: purchased
                    ? `0 12px 32px ${pkg.color}25`
                    : '0 6px 22px rgba(109, 33, 79, 0.06)',
                  cursor: purchased ? 'pointer' : 'default',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 16px 36px ${pkg.color}30`,
                    borderColor: pkg.color
                  }
                }}
              >
                {/* Accent Strip */}
                <Box sx={{ height: '6px', width: '100%', bgcolor: pkg.color }} />

                <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Tag & Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Chip
                      label={pkg.tag}
                      size="small"
                      sx={{
                        bgcolor: pkg.lightBg,
                        color: pkg.color,
                        border: `1px solid ${pkg.borderHover}`,
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        height: '26px'
                      }}
                    />
                    {purchased && (
                      <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: '15px !important', color: '#059669' }} />}
                        label="Active Plan"
                        size="small"
                        sx={{
                          bgcolor: '#ECFDF5',
                          color: '#059669',
                          border: '1px solid #A7F3D0',
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          height: '26px'
                        }}
                      />
                    )}
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      color: '#1F333B',
                      fontWeight: 900,
                      fontSize: '1.15rem',
                      lineHeight: 1.3,
                      mb: 1
                    }}
                  >
                    {pkg.title}
                  </Typography>

                  {/* Price */}
                  <Box sx={{ my: 1.5, pb: 1.5, borderBottom: '1px dashed #FED7AA' }}>
                    <Typography
                      variant="h4"
                      sx={{
                        color: pkg.color,
                        fontWeight: 950,
                        fontSize: '1.9rem',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 0.5
                      }}
                    >
                      ₹{pkg.amount.toLocaleString('en-IN')}
                      <Typography component="span" sx={{ fontSize: '0.8rem', color: '#7A5060', fontWeight: 700 }}>
                        / one-time
                      </Typography>
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748B',
                      fontSize: '0.84rem',
                      lineHeight: 1.5,
                      minHeight: '44px',
                      mb: 2.5
                    }}
                  >
                    {pkg.description}
                  </Typography>

                  {/* Feature List */}
                  <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1.2, flex: 1 }}>
                    {pkg.features.map((feature, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                        <CheckCircleOutlineIcon
                          sx={{
                            fontSize: '18px',
                            color: pkg.color,
                            mt: '2px',
                            flexShrink: 0
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#1F333B',
                            fontWeight: 600,
                            fontSize: '0.84rem',
                            lineHeight: 1.4
                          }}
                        >
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Action Button */}
                  <Box sx={{ mt: 'auto', pt: 1 }}>
                    {purchased ? (
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate(`/user/earnings/package-detail?package=${pkg.amount}`)}
                        sx={{
                          py: 1.15,
                          borderRadius: '14px',
                          borderColor: '#A7F3D0',
                          bgcolor: '#ECFDF5',
                          color: '#059669',
                          fontWeight: 800,
                          textTransform: 'none',
                          fontSize: '0.9rem',
                          '&:hover': {
                            bgcolor: '#D1FAE5',
                            borderColor: '#059669'
                          }
                        }}
                      >
                        View Plan Details →
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={(e) => handleBuyClick(e, pkg)}
                        disabled={isPending}
                        sx={{
                          py: 1.2,
                          borderRadius: '14px',
                          background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          textTransform: 'none',
                          boxShadow: '0 6px 18px rgba(254, 128, 1, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #E06F00 0%, #FE8001 100%)',
                            boxShadow: '0 8px 24px rgba(254, 128, 1, 0.45)',
                            transform: 'translateY(-1.5px)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Activate Plan
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Confirmation Modal */}
      <Dialog
        open={Boolean(confirmPkg)}
        onClose={() => setConfirmPkg(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '24px', p: 1 }
        }}
      >
        <DialogTitle sx={{ pb: 1, textAlign: 'center' }}>
          <Box sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: '#FFF7ED',
            color: '#FE8001',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1.5
          }}>
            <StarsIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#1F333B' }}>
            Confirm Package Activation
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            You are activating <strong>{confirmPkg?.title}</strong> for your vendor store.
          </Typography>

          <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '16px', mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Plan Amount:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#1F333B' }}>₹{confirmPkg?.amount.toLocaleString('en-IN')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Wallet Balance:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: creditBalance >= (confirmPkg?.amount ?? 0) ? '#059669' : '#DC2626' }}>
                ₹{creditBalance.toLocaleString('en-IN')}
              </Typography>
            </Box>
          </Paper>

          {creditBalance < (confirmPkg?.amount ?? 0) && (
            <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 700 }}>
              Insufficient wallet balance! Please add funds to proceed.
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setConfirmPkg(null)}
            sx={{ flex: 1, color: '#64748B', fontWeight: 700, borderRadius: '12px', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={executeBuy}
            disabled={isPending || creditBalance < (confirmPkg?.amount ?? 0)}
            sx={{
              flex: 1,
              bgcolor: '#FE8001',
              fontWeight: 800,
              borderRadius: '12px',
              textTransform: 'none',
              '&:hover': { bgcolor: '#E06F00' }
            }}
          >
            {isPending ? <CircularProgress size={20} sx={{ color: '#FFF' }} /> : 'Confirm & Buy'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Modal */}
      <Dialog
        open={successDialogOpen}
        onClose={() => {
          setSuccessDialogOpen(false);
          navigate('/user/dashboard');
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '24px', p: 1.5, textAlign: 'center' }
        }}
      >
        <DialogTitle>
          <Box sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: '#ECFDF5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1
          }}>
            <CheckCircleIcon sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#1F333B' }}>
            Package Activated!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Congratulations! You have successfully activated <strong>{purchasedPkg?.title}</strong> for ₹{purchasedPkg?.amount.toLocaleString('en-IN')}.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setSuccessDialogOpen(false);
              navigate('/user/dashboard');
            }}
            sx={{
              bgcolor: '#059669',
              fontWeight: 800,
              borderRadius: '14px',
              py: 1,
              textTransform: 'none',
              '&:hover': { bgcolor: '#047857' }
            }}
          >
            Go to Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserPackagesPage;


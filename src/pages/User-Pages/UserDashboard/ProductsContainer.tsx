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
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
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

const PACKAGES: PackagePlan[] = [
  {
    id: 1,
    amount: 25000,
    title: 'Smart Saver Plan',
    tag: 'Smart Saver',
    color: '#EA580C',
    lightBg: '#FFF7ED',
    borderHover: '#FED7AA',
    description: 'The Smart Saver Plan helps you explore enhanced features and expand your trading potential',
    features: [
      'Up to 2x Response Rate',
      '160 Days Ad Validity',
      '50 Buyer Notifications',
      'Verified Property Tag'
    ]
  },
  {
    id: 2,
    amount: 50000,
    title: 'Wealth Builder Plan',
    tag: 'Wealth Builder',
    color: '#0284C7',
    lightBg: '#F0F9FF',
    borderHover: '#BAE6FD',
    description: 'Explore the Wealth Builder Plan designed for advanced financial management and growth opportunities',
    features: [
      'Up to 5x Response Rate',
      '180 Days Ad Validity',
      '100 Buyer Notifications',
      '250 Email Promotions'
    ]
  },
  {
    id: 3,
    amount: 100000,
    title: 'Future Secure Deposit',
    tag: 'Future Secure',
    color: '#059669',
    lightBg: '#ECFDF5',
    borderHover: '#A7F3D0',
    description: 'Take your forex journey further with the Future Secure Deposit and higher returns',
    features: [
      'Up to 7x Response Rate',
      '250 Days Ad Validity',
      '100 Buyer Notifications',
      '1500 Email Promotions'
    ]
  },
  {
    id: 4,
    amount: 200000,
    title: 'Prosper Plus Plan',
    tag: 'Prosper Plus',
    color: '#7C3AED',
    lightBg: '#F5F3FF',
    borderHover: '#DDD6FE',
    description: 'A premium package built to support smarter trading decisions and long-term capital growth',
    features: [
      'Up to 10x Response Rate',
      '300 Days Ad Validity',
      '150 Buyer Notifications',
      '2000 Email Promotions'
    ]
  },
  {
    id: 5,
    amount: 500000,
    title: 'Golden Growth Investment Plan',
    tag: 'Golden Growth',
    color: '#D97706',
    lightBg: '#FFFBEB',
    borderHover: '#FDE68A',
    description: 'Experience a higher level of financial flexibility with the Golden Growth Investment Plan',
    features: [
      'Premium Response Rate',
      '365 Days Ad Validity',
      'Unlimited Notifications',
      'Dedicated Support'
    ]
  }
];

const ProductsContainer: React.FC = () => {
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

  // Credit balance available
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
      toast.error(`Insufficient Credit Balance! You have ₹${creditBalance.toLocaleString('en-IN')} but need ₹${confirmPkg.amount.toLocaleString('en-IN')}`);
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
          toast.error(err?.response?.data?.message || err?.message || 'Investment failed');
        }
      }
    );
  };

  return (
    <Box sx={{ mb: 4, width: '100%' }}>
      {/* Header section with Balance */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 1.5,
        mb: 2.5,
        px: 0.5
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            bgcolor: '#FFF7ED',
            border: '1.5px solid #FED7AA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 22, color: '#FE8001' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: '#1F333B', fontWeight: 900, fontSize: { xs: '1.1rem', sm: '1.25rem' }, lineHeight: 1.2 }}>
              Investment Packages
            </Typography>
            <Typography variant="caption" sx={{ color: '#7A5060', fontWeight: 600 }}>
              Choose a package plan to activate your earnings
            </Typography>
          </Box>
        </Box>

        <Box sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: '#FFFFFF',
          px: 2,
          py: 0.8,
          borderRadius: '14px',
          border: '1.5px solid #FED7AA',
          boxShadow: '0 2px 8px rgba(254, 128, 1, 0.08)'
        }}>
          <Typography variant="caption" sx={{ color: '#7A5060', fontWeight: 700 }}>
            Credit Balance:
          </Typography>
          <Typography variant="body2" sx={{ color: '#FE8001', fontWeight: 900 }}>
            ₹{creditBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        </Box>
      </Box>

      {/* 5 Fixed Package Cards (Horizontal scroll on smaller screens) */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          gap: 2.5,
          pb: 2,
          pt: 0.5,
          px: 0.5,
          '&::-webkit-scrollbar': { height: '8px' },
          '&::-webkit-scrollbar-track': { bgcolor: '#F8FAFC', borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#FED7AA', borderRadius: '4px' },
          justifyContent: 'flex-start'
        }}
      >
        {PACKAGES.map((pkg) => {
          const purchased = isPurchased(pkg.amount);

          return (
            <Card
              key={pkg.id}
              onClick={() => handleCardClick(pkg.amount)}
              sx={{
                minWidth: { xs: '270px', sm: '290px' },
                maxWidth: { xs: '270px', sm: '290px' },
                flex: '0 0 auto',
                bgcolor: '#FFFFFF',
                borderRadius: '22px',
                border: purchased ? `2px solid ${pkg.color}` : '1.5px solid #FED7AA',
                boxShadow: purchased
                  ? `0 10px 28px ${pkg.color}25`
                  : '0 6px 20px rgba(109, 33, 79, 0.05)',
                cursor: purchased ? 'pointer' : 'default',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 14px 32px ${pkg.color}30`,
                  borderColor: pkg.color
                }
              }}
            >
              {/* Top Accent Strip */}
              <Box sx={{ height: '5px', width: '100%', bgcolor: pkg.color }} />

              <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Tag & Plan Name */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Chip
                    label={pkg.tag}
                    size="small"
                    sx={{
                      bgcolor: pkg.lightBg,
                      color: pkg.color,
                      border: `1px solid ${pkg.borderHover}`,
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      height: '24px'
                    }}
                  />
                  {purchased && (
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#059669' }} />}
                      label="Active"
                      size="small"
                      sx={{
                        bgcolor: '#ECFDF5',
                        color: '#059669',
                        border: '1px solid #A7F3D0',
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        height: '24px'
                      }}
                    />
                  )}
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    color: '#1F333B',
                    fontWeight: 900,
                    fontSize: '1.05rem',
                    lineHeight: 1.3,
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {pkg.title}
                </Typography>

                {/* Amount */}
                <Box sx={{ my: 1.5, pb: 1, borderBottom: '1px dashed #FED7AA' }}>
                  <Typography
                    variant="h4"
                    sx={{
                      color: pkg.color,
                      fontWeight: 950,
                      fontSize: '1.65rem',
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 0.5
                    }}
                  >
                    ₹{pkg.amount.toLocaleString('en-IN')}
                    <Typography component="span" sx={{ fontSize: '0.75rem', color: '#7A5060', fontWeight: 700 }}>
                      / plan
                    </Typography>
                  </Typography>
                </Box>

                {/* Description */}
                <Typography
                  variant="body2"
                  sx={{
                    color: '#7A5060',
                    fontSize: '0.75rem',
                    lineHeight: 1.4,
                    minHeight: '42px',
                    mb: 2
                  }}
                >
                  {pkg.description}
                </Typography>

                {/* 4 Small Points */}
                <Box sx={{ mb: 2.5, display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                  {pkg.features.map((feature, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <CheckCircleOutlineIcon
                        sx={{
                          fontSize: '16px',
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
                          fontSize: '0.78rem',
                          lineHeight: 1.35
                        }}
                      >
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Action button */}
                <Box sx={{ mt: 'auto', pt: 1 }}>
                  {purchased ? (
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{
                        py: 1,
                        borderRadius: '12px',
                        borderColor: '#A7F3D0',
                        bgcolor: '#ECFDF5',
                        color: '#059669',
                        fontWeight: 800,
                        textTransform: 'none',
                        fontSize: '0.85rem',
                        '&:hover': {
                          bgcolor: '#D1FAE5',
                          borderColor: '#059669'
                        }
                      }}
                    >
                      View Details →
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={(e) => handleBuyClick(e, pkg)}
                      disabled={isPending}
                      sx={{
                        py: 1.1,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        textTransform: 'none',
                        boxShadow: '0 4px 12px rgba(254, 128, 1, 0.25)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #E06F00 0%, #FE8001 100%)',
                          boxShadow: '0 6px 16px rgba(254, 128, 1, 0.35)',
                          transform: 'translateY(-1px)'
                        },
                        '&:disabled': {
                          backgroundColor: '#FED7AA',
                          color: '#FFFFFF'
                        }
                      }}
                    >
                      Invest Now
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Confirm Investment Dialog */}
      <Dialog
        open={!!confirmPkg}
        onClose={() => !isPending && setConfirmPkg(null)}
        PaperProps={{
          sx: {
            bgcolor: '#FFFFFF',
            borderRadius: '24px',
            border: '1.5px solid #FED7AA',
            boxShadow: '0 20px 48px rgba(109,33,79,0.15)',
            p: 1,
            maxWidth: '440px',
            width: '100%'
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
          <Box sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: '#FFF7ED',
            border: '2px solid #FED7AA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1.5
          }}>
            <StarsIcon sx={{ fontSize: 32, color: '#FE8001' }} />
          </Box>
          <Typography variant="h6" sx={{ color: '#1F333B', fontWeight: 900 }}>
            Confirm Investment
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pb: 1, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#7A5060', mb: 2 }}>
            Are you sure you want to invest in this package plan?
          </Typography>

          <Box sx={{ bgcolor: '#FFFDF9', p: 2.5, borderRadius: '16px', border: '1.5px solid #FED7AA', mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#7A5060', fontWeight: 700, display: 'block' }}>
              Selected Plan
            </Typography>
            <Typography variant="h6" sx={{ color: '#1F333B', fontWeight: 900, mt: 0.5 }}>
              {confirmPkg?.title}
            </Typography>
            <Typography variant="h5" sx={{ color: confirmPkg?.color || '#FE8001', fontWeight: 950, mt: 1 }}>
              ₹{confirmPkg?.amount.toLocaleString('en-IN')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#7A5060', fontWeight: 700 }}>
              Available Credit Balance:
            </Typography>
            <Typography variant="body2" sx={{ color: '#1F333B', fontWeight: 900 }}>
              ₹{creditBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>

          {confirmPkg && creditBalance < confirmPkg.amount ? (
            <Alert severity="error" sx={{ borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
              Insufficient Credit Balance! You need ₹{confirmPkg.amount.toLocaleString('en-IN')} but only have ₹{creditBalance.toLocaleString('en-IN')}.
            </Alert>
          ) : (
            <Alert severity="info" sx={{ borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
              ₹{confirmPkg?.amount.toLocaleString('en-IN')} will be deducted from your Credit Balance.
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setConfirmPkg(null)}
            disabled={isPending}
            variant="outlined"
            fullWidth
            sx={{
              py: 1.1,
              borderRadius: '12px',
              borderColor: '#FED7AA',
              color: '#7A5060',
              fontWeight: 800,
              textTransform: 'none',
              '&:hover': {
                borderColor: '#E5989B',
                bgcolor: '#FFF7ED'
              }
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={executeBuy}
            disabled={isPending || !confirmPkg || creditBalance < confirmPkg.amount}
            variant="contained"
            fullWidth
            sx={{
              py: 1.1,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(254, 128, 1, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #E06F00 0%, #FE8001 100%)'
              },
              '&:disabled': {
                backgroundColor: '#FED7AA',
                color: '#FFFFFF'
              }
            }}
          >
            {isPending ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : 'Confirm & Invest'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #fce8ec',
            boxShadow: '0 20px 48px rgba(109,33,79,0.15)',
            maxWidth: '420px',
            width: '100%',
            p: 1
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3.5, color: '#FE8001', fontWeight: 900 }}>
          Investment Successful! 🎉
        </DialogTitle>
        <DialogContent sx={{ pb: 1, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#7A5060', mb: 2 }}>
            Your investment request has been processed successfully.
          </Typography>
          <Box sx={{ bgcolor: '#FFFDF9', p: 2.5, borderRadius: '16px', border: '1.5px solid #FED7AA' }}>
            <Typography variant="caption" sx={{ color: '#7A5060', display: 'block', fontWeight: 600 }}>
              Activated Package
            </Typography>
            <Typography variant="h6" sx={{ color: '#1F333B', fontWeight: 900, mt: 0.5 }}>
              {purchasedPkg?.title}
            </Typography>
            <Typography variant="h5" sx={{ color: '#059669', fontWeight: 950, mt: 1 }}>
              ₹{Number(purchasedPkg?.amount || 0).toLocaleString('en-IN')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1, justifyContent: 'center' }}>
          <Button
            onClick={() => setSuccessDialogOpen(false)}
            variant="contained"
            fullWidth
            sx={{
              py: 1.2,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(254, 128, 1, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #E06F00 0%, #FE8001 100%)'
              }
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsContainer;

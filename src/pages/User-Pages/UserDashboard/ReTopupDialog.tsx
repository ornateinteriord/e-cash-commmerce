import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentsIcon from '@mui/icons-material/Payments';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import BoltIcon from '@mui/icons-material/Bolt';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../../context/user/userContext';
import { useGetWalletOverview, useGetMemberDetails } from '../../../api/Memeber';
import { useGetMemberAddOns, useBuyPackageDirectlyMutation } from '../../../api/Packages';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

interface ReTopupDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ReTopupDialog: React.FC<ReTopupDialogProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);
  const memberId = user?.Member_id || '';

  const { data: walletOverview } = useGetWalletOverview(memberId);
  const { data: memberDetails } = useGetMemberDetails(memberId);
  const { data: addOns = [] } = useGetMemberAddOns(memberId);
  const { mutate: buyPackage, isPending } = useBuyPackageDirectlyMutation();

  const [investAmount, setInvestAmount] = useState<string>('');
  const [successDialogOpen, setSuccessDialogOpen] = useState<boolean>(false);
  const [confirmedAmount, setConfirmedAmount] = useState<number | null>(null);

  const creditBalance = Number(walletOverview?.balance ?? walletOverview?.availableForWithdrawal ?? 0);

  // Compute highest previous investment
  const primaryVal = Number(memberDetails?.package_value || user?.package_value || 0);
  const addonVals = (addOns || []).map((a: any) => Number(a.amount || a.requested_amount || 0)).filter((v: number) => v > 0);
  const allInvestments = primaryVal > 0 ? [primaryVal, ...addonVals] : [...addonVals];
  const lastInvestedAmount = allInvestments.length > 0 ? Math.max(...allInvestments) : 0;
  const minAllowed = lastInvestedAmount > 0 ? lastInvestedAmount + 100 : 100;

  // Compute total investment and earnings to check 2X rule
  const totalInvested = Number(
    walletOverview?.totalInvested ??
    walletOverview?.data?.totalInvested ??
    walletOverview?.totalPackages ??
    walletOverview?.data?.totalPackages ??
    memberDetails?.totalPackages ??
    memberDetails?.package_value ??
    lastInvestedAmount
  );

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

  const requiredEarnings = 2 * totalInvested;
  const isEligibleForReinvest = totalInvested <= 0 || totalEarnings >= requiredEarnings;

  // Validation rules: multiples of 100, more than earlier amount, and balance check
  const amountNum = Number(investAmount);
  const isEntered = investAmount.trim() !== '' && !isNaN(amountNum);
  const isMultipleOf100 = isEntered && amountNum % 100 === 0;
  const isHigherThanLast = isEntered && amountNum >= minAllowed;
  const isBalanceSufficient = isEntered && amountNum <= creditBalance;
  const isValid = isEntered && isMultipleOf100 && isHigherThanLast && isBalanceSufficient && isEligibleForReinvest;

  // Validation error string
  let validationError: string | null = null;
  if (!isEligibleForReinvest) {
    validationError = `Re-investment unlocks when your total earnings reach at least ₹${requiredEarnings.toLocaleString()} (double of ₹${totalInvested.toLocaleString()}). Current earnings: ₹${totalEarnings.toLocaleString()}.`;
  } else if (isEntered) {
    if (amountNum % 100 !== 0) {
      validationError = 'Amount must be in multiples of ₹100 only.';
    } else if (amountNum < minAllowed) {
      validationError = lastInvestedAmount > 0
        ? `Amount must be greater than previous investment of ₹${lastInvestedAmount.toLocaleString()}.`
        : 'Minimum invest amount is ₹100.';
    } else if (amountNum > creditBalance) {
      validationError = `Insufficient Credit Balance! You have ₹${creditBalance.toLocaleString()} but need ₹${amountNum.toLocaleString()}.`;
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEligibleForReinvest) {
      toast.error(`Re-investment is unlocked only when total earnings reach at least ₹${requiredEarnings.toLocaleString()} (double of ₹${totalInvested.toLocaleString()} investment).`);
      return;
    }

    if (!investAmount || isNaN(amountNum)) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amountNum % 100 !== 0) {
      toast.error('Invest amount must be in multiples of ₹100 only');
      return;
    }

    if (amountNum < minAllowed) {
      toast.error(`Amount must be higher than previous investment of ₹${lastInvestedAmount.toLocaleString()}`);
      return;
    }

    if (amountNum > creditBalance) {
      toast.error(`Insufficient Credit Balance! You have ₹${creditBalance.toLocaleString()} but need ₹${amountNum.toLocaleString()}`);
      return;
    }

    if (!memberId) {
      toast.error('User information not found');
      return;
    }

    buyPackage(
      { member_id: memberId, requested_amount: amountNum },
      {
        onSuccess: () => {
          setConfirmedAmount(amountNum);
          setSuccessDialogOpen(true);
          setInvestAmount('');
          queryClient.invalidateQueries({ queryKey: ['walletOverview'] });
          queryClient.invalidateQueries({ queryKey: ['memberDetails'] });
          queryClient.invalidateQueries({ queryKey: ['addOns'] });
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || err?.message || 'Investment failed');
        }
      }
    );
  };

  const handleCloseAll = () => {
    setSuccessDialogOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: 'transparent',
            boxShadow: 'none',
            m: { xs: 1.5, sm: 2 }
          }
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 540,
            mx: 'auto',
            boxShadow: '0 12px 36px rgba(109, 33, 79, 0.16)',
            borderRadius: '24px',
            border: '1.5px dashed #E5989B',
            backgroundColor: '#ffffff',
            p: { xs: 2.5, sm: 3.5 },
            position: 'relative'
          }}
        >
          {/* Top Bar: Icon + Title + Close Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 26, color: '#FE8001' }} />
              <Typography variant="body2" sx={{ color: '#1F333B', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
                Re-Invest
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: '#64748B',
                bgcolor: '#FFFFFF',
                border: '1px solid #FED7AA',
                '&:hover': { bgcolor: '#ffeef0' }
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* Re-Investment 2X Earnings Notice if not eligible */}
          {!isEligibleForReinvest && (
            <Alert
              severity="warning"
              sx={{
                mb: 2,
                borderRadius: '14px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: '1px solid #fde68a',
                bgcolor: '#fffbeb',
                color: '#92400e',
                '& .MuiAlert-icon': { color: '#d97706' }
              }}
            >
              Re-investment is unlocked only after your total earnings reach at least double of your investment amount (<strong>₹{requiredEarnings.toLocaleString()}</strong>).
              <br />
              Current Total Earnings: <strong>₹{totalEarnings.toLocaleString()}</strong>.
            </Alert>
          )}

          {/* Earlier Investment & Total Earnings Info */}
          <Box
            sx={{
              mb: 2,
              p: 1.4,
              px: 1.6,
              borderRadius: '14px',
              bgcolor: '#FFFFFF',
              border: '1px solid #FED7AA',
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            {lastInvestedAmount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.78rem', color: '#7a5060', fontWeight: 700 }}>
                  Earlier Investment:
                </Typography>
                <Typography sx={{ fontSize: '0.88rem', color: '#FE8001', fontWeight: 900 }}>
                  ₹{lastInvestedAmount.toLocaleString()}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#065F46', fontWeight: 700 }}>
                Total Earnings:
              </Typography>
              <Typography sx={{ fontSize: '0.92rem', color: '#059669', fontWeight: 900 }}>
                ₹{totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              required
              fullWidth
              label="Amount (₹) *"
              variant="outlined"
              size="medium"
              type="text"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              value={investAmount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d+$/.test(val)) {
                  setInvestAmount(val);
                }
              }}
              placeholder={`Min ${minAllowed}`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PaymentsIcon sx={{ color: '#FE8001', fontSize: 20 }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  bgcolor: '#FFFFFF',
                  '& fieldset': { borderColor: validationError ? '#ef4444' : '#FED7AA', borderWidth: '1.5px' },
                  '&:hover fieldset': { borderColor: validationError ? '#dc2626' : '#E5989B' },
                  '&.Mui-focused fieldset': { borderColor: validationError ? '#dc2626' : '#FE8001', borderWidth: '2px' }
                },
                '& .MuiInputLabel-root': {
                  color: validationError ? '#ef4444' : '#7a5060',
                  fontWeight: 600
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: validationError ? '#dc2626' : '#FE8001'
                },
                '& input': {
                  MozAppearance: 'textfield',
                  color: '#1F333B',
                  fontWeight: 700,
                  fontSize: '1.05rem'
                },
                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                  WebkitAppearance: 'none',
                  display: 'none',
                  margin: 0
                }
              }}
            />

            {/* Live Error Warning */}
            {validationError && (
              <Alert
                severity="error"
                sx={{
                  mt: 1.5,
                  borderRadius: '12px',
                  py: 0.3,
                  px: 1.5,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  bgcolor: '#fee2e2',
                  color: '#991b1b',
                  '& .MuiAlert-icon': { fontSize: '18px', color: '#dc2626' }
                }}
              >
                {validationError}
              </Alert>
            )}

            {/* Credit Balance Display */}
            <Box sx={{ mt: 1.8, mb: 2 }}>
              <Typography sx={{ color: '#7a5060', fontSize: '0.82rem', fontWeight: 600 }}>
                Credit Balance: <span style={{ color: '#1F333B', fontWeight: 800 }}>₹{creditBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </Typography>
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isPending || !isValid}
              sx={{
                py: 1.3,
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.98rem',
                textTransform: 'none',
                background: isValid
                  ? 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)'
                  : '#FED7AA',
                color: isValid ? '#FFFFFF' : '#64748B',
                boxShadow: isValid ? '0 4px 14px rgba(109, 33, 79, 0.24)' : 'none',
                '&:hover': {
                  background: isValid ? 'linear-gradient(135deg, #E06F00 0%, #FE8001 100%)' : '#FED7AA',
                  boxShadow: isValid ? '0 8px 20px rgba(109, 33, 79, 0.35)' : 'none',
                  transform: isValid ? 'translateY(-1px)' : 'none'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {isPending ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
                  <span>Processing...</span>
                </Box>
              ) : (
                'Invest Amount'
              )}
            </Button>
          </Box>

          {/* Credits Container with Action Buttons */}
          <Box
            sx={{
              mt: 2.5,
              bgcolor: '#FFFFFF',
              border: '1.5px solid #FED7AA',
              borderRadius: '20px',
              p: { xs: 2, sm: 2.5 },
              boxShadow: '0 4px 16px rgba(109, 33, 79, 0.04)'
            }}
          >
            {/* Icon + Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box sx={{
                p: 0.8,
                borderRadius: '12px',
                bgcolor: 'rgba(254, 128, 1,  )',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(244, 201, 93, 0.6)',
                flexShrink: 0
              }}>
                <PaymentsIcon sx={{ fontSize: 22, color: '#FE8001' }} />
              </Box>
              <Typography sx={{
                color: '#FE8001',
                fontWeight: 900,
                fontSize: '1.1rem',
                letterSpacing: '0.5px'
              }}>
                Credits
              </Typography>
            </Box>

            {/* Rupee Balance */}
            <Box sx={{ my: 1 }}>
              <Typography sx={{
                color: '#FE8001',
                fontWeight: 800,
                fontSize: { xs: '1.5rem', sm: '1.85rem' },
                lineHeight: 1.1,
                letterSpacing: '-0.5px'
              }}>
                ₹{Number(creditBalance).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Typography>
            </Box>

            {/* Action Buttons: First row 2 buttons, 3rd button below that */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, width: '100%', mt: 0.5 }}>
              {/* Row 1: + Add and Withdraw */}
              <Box sx={{ display: 'flex', gap: 1.2, width: '100%' }}>
                {/* 1. + Add */}
                <Button
                  variant="contained"
                  onClick={() => { onClose(); navigate('/user/load-fund'); }}
                  startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                  fullWidth
                  sx={{
                    flex: 1,
                    py: 1.1,
                    background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    textTransform: 'none',
                    justifyContent: 'center',
                    boxShadow: '0 3px 10px rgba(109, 33, 79, 0.24)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #E06F00 0%, #FE8001 100%)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  + Add
                </Button>

                {/* 2. Withdraw */}
                <Button
                  variant="contained"
                  onClick={() => { onClose(); navigate('/user/wallet?type=withdrawal'); }}
                  startIcon={<PaymentsIcon sx={{ fontSize: 18 }} />}
                  fullWidth
                  sx={{
                    flex: 1,
                    py: 1.1,
                    background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    textTransform: 'none',
                    justifyContent: 'center',
                    boxShadow: '0 3px 10px rgba(109, 33, 79, 0.24)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #E06F00 0%, #FE8001 100%)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Withdraw
                </Button>
              </Box>

              {/* Row 2: 3rd button (Activation) below */}
              <Button
                variant="contained"
                onClick={() => { onClose(); navigate('/user/new-subscription'); }}
                startIcon={<BoltIcon sx={{ fontSize: 18 }} />}
                fullWidth
                sx={{
                  py: 1.1,
                  background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  textTransform: 'none',
                  justifyContent: 'center',
                  boxShadow: '0 3px 10px rgba(109, 33, 79, 0.24)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #E06F00 0%, #FE8001 100%)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Activation
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* Success Confirmation Modal */}
      <Dialog
        open={successDialogOpen}
        onClose={handleCloseAll}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: 3,
            textAlign: 'center',
            bgcolor: '#ffffff',
            boxShadow: '0 12px 36px rgba(109, 33, 79, 0.2)'
          }
        }}
      >
        <DialogContent sx={{ p: 1 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'rgba(5, 150, 105, 0.12)',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 38 }} />
          </Box>
          <Typography variant="h6" sx={{ color: '#1F333B', fontWeight: 900, mb: 1 }}>
            Investment Successful!
          </Typography>
          <Typography variant="body2" sx={{ color: '#7a5060', mb: 2.5, lineHeight: 1.6 }}>
            You have successfully invested{' '}
            <strong style={{ color: '#FE8001' }}>₹{confirmedAmount?.toLocaleString()}</strong> from your Credits Wallet. Daily Incentive will be credited daily.
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={handleCloseAll}
            sx={{
              py: 1.2,
              borderRadius: '12px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
              color: '#FFFFFF',
              textTransform: 'none'
            }}
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReTopupDialog;

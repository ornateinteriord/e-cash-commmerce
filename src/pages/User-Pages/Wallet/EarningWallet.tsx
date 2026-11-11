import React, { useState } from 'react';
import {
  Card,
  TextField,
  Typography,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Divider,
  InputAdornment,
  Alert,
  Collapse,
  Chip
} from '@mui/material';
import DataTable from "react-data-table-component";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentsIcon from '@mui/icons-material/Payments';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TokenService from "../../../api/token/tokenService";
import { useGetEarningWalletOverview, useEarningWalletWithdraw, useGetMemberDetails } from '../../../api/Memeber';
import { getEarningWalletColumns } from '../../../utils/DataTableColumnsProvider';

const EarningWallet: React.FC = () => {
  const navigate = useNavigate();
  const memberId = TokenService.getMemberId() || '';

  const { data: earningData, isLoading, refetch } = useGetEarningWalletOverview(memberId);
  const { data: memberDetails } = useGetMemberDetails(memberId);
  const withdrawMutation = useEarningWalletWithdraw(memberId);

  const [amount, setAmount] = useState<string>("");
  const [deduction, setDeduction] = useState<number>(0);
  const [netAmount, setNetAmount] = useState<number>(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const availableBalance = parseFloat(earningData?.balance || earningData?.earningWalletBalance || "0");
  const transactions: any[] = earningData?.transactions || [];

  const packageAmount = parseFloat(earningData?.packageAmount || earningData?.packagePurchased || "0");
  const maxLimit = parseFloat(earningData?.maxWithdrawalLimit || String(packageAmount * 1));
  const remainingLimit = parseFloat(earningData?.remainingWithdrawalLimit !== undefined ? earningData?.remainingWithdrawalLimit : String(Math.max(0, maxLimit - parseFloat(earningData?.totalWithdrawal || "0"))));
  const effectiveMaxWithdrawal = Math.min(availableBalance, remainingLimit > 0 ? remainingLimit : availableBalance);

  // 3X Re-Topup logic: Combines Sale Value 2X (Vendor Wallet) + Earning Wallet 1X
  const totalIncome = parseFloat(earningData?.totalIncome || "0");
  const saleValueLimit = parseFloat(earningData?.saleValueLimit || String(packageAmount * 2));
  const saleValueRoiIncome = parseFloat(earningData?.saleValueRoiIncome || "0");
  const combinedTotalEarnings = parseFloat(earningData?.combinedTotalEarnings || String(totalIncome + saleValueRoiIncome));
  const threeXLimit = parseFloat(earningData?.threeXLimit || String(packageAmount * 3));
  const canReTopup = Boolean(
    earningData?.canReTopup || 
    (packageAmount > 0 && (combinedTotalEarnings >= threeXLimit || (totalIncome + availableBalance) >= threeXLimit))
  );

  const dashboardTableCustomStyles = {
    table: {
      style: {
        backgroundColor: '#ffffff',
        minWidth: '650px',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#059669',
        background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
        minHeight: '44px',
        borderBottom: 'none',
      },
    },
    headCells: {
      style: {
        color: '#FFFFFF',
        fontWeight: 800,
        fontSize: '0.84rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
        paddingLeft: '14px',
        paddingRight: '14px',
        borderRight: '1px solid rgba(255, 255, 255, 0.25)',
        '&:last-child': {
          borderRight: 'none',
        },
      },
    },
    rows: {
      style: {
        fontSize: '0.85rem',
        fontWeight: 500,
        color: '#1F333B',
        minHeight: '46px',
        borderBottom: '1px solid #D1FAE5',
        '&:nth-of-type(even)': {
          backgroundColor: '#F0FDF4',
        },
        '&:hover': {
          backgroundColor: 'rgba(5, 150, 105, 0.08) !important',
          cursor: 'pointer',
        },
      },
    },
    pagination: {
      style: {
        backgroundColor: '#ffffff',
        borderTop: '1px solid #A7F3D0',
        color: '#1F333B',
        fontWeight: 600,
        minHeight: '46px',
      },
      pageButtonsStyle: {
        fill: '#059669',
        '&:disabled': {
          fill: '#A7F3D0',
        },
        '&:hover:not(:disabled)': {
          backgroundColor: 'rgba(5, 150, 105, 0.1)',
        },
      },
    },
  };

  const filteredTransactions = transactions.filter((tx: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (tx.transaction_id && tx.transaction_id.toLowerCase().includes(q)) ||
      (tx.tx_no && tx.tx_no.toLowerCase().includes(q)) ||
      (tx.description && tx.description.toLowerCase().includes(q)) ||
      (tx.status && tx.status.toLowerCase().includes(q)) ||
      (tx.amount && tx.amount.toString().includes(q))
    );
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;

    setAmount(value);
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      const ded = num * 0.05;
      setDeduction(ded);
      setNetAmount(num - ded);
    } else {
      setDeduction(0);
      setNetAmount(0);
    }
  };

  const handleQuickPercent = (percent: number) => {
    if (effectiveMaxWithdrawal <= 0) return;
    const calculated = Math.floor((effectiveMaxWithdrawal * percent) / 100);
    setAmount(String(calculated));
    const ded = calculated * 0.05;
    setDeduction(ded);
    setNetAmount(calculated - ded);
  };

  const handleWithdraw = () => {
    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      toast.error("Please enter a valid withdrawal amount");
      return;
    }
    if (withdrawalAmount > availableBalance) {
      toast.error("Insufficient Earning Wallet balance");
      return;
    }

    if (remainingLimit > 0 && withdrawalAmount > remainingLimit) {
      toast.error(`Withdrawal amount exceeds remaining 1X package limit of ₹${remainingLimit.toFixed(2)}`);
      return;
    }

    withdrawMutation.mutate(
      { memberId, amount: String(withdrawalAmount) },
      {
        onSuccess: () => {
          setAmount("");
          setDeduction(0);
          setNetAmount(0);
          refetch();
        }
      }
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#059669' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 3 }, maxWidth: '1200px', margin: '0 auto', bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header with Back Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <IconButton
          onClick={() => navigate('/user/dashboard')}
          sx={{
            bgcolor: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            border: '1px solid #E2E8F0',
            '&:hover': { bgcolor: '#F1F5F9' }
          }}
        >
          <ArrowBackIcon sx={{ color: '#1E293B', fontSize: 20 }} />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
            Earning Wallet
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
            Dedicated to Referral Earnings (Pure Earnings Only - Deposits Excluded)
          </Typography>
        </Box>
      </Box>

      {/* Top Cards: Balance & Summary Stats */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' },
        gap: { xs: 2, md: 2.5 },
        mb: 3
      }}>
        {/* Main Available Balance Card */}
        <Card sx={{
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
          color: '#FFFFFF',
          p: { xs: 2.5, sm: 3 },
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(5, 150, 105, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MonetizationOnIcon sx={{ fontSize: 22, color: 'rgba(255, 255, 255, 0.9)' }} />
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.9)' }}>
                Available Earning Balance
              </Typography>
            </Box>
            <Typography sx={{ fontSize: { xs: '2rem', sm: '2.6rem' }, fontWeight: 900, letterSpacing: '-1px', lineHeight: 1.1, mb: 2 }}>
              ₹{availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.85)', display: 'block', fontWeight: 500 }}>
              Direct Referral Commission (Pure Earnings Only - Deposits Excluded)
            </Typography>
          </Box>
        </Card>

        {/* Stats Grid */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1.5
        }}>
          <Card sx={{ p: 2, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
              Total Earnings
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#059669', mt: 0.5 }}>
              ₹{parseFloat(earningData?.totalIncome || "0").toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Card>

          <Card sx={{ p: 2, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
              Total Withdrawn
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
              ₹{parseFloat(earningData?.totalWithdrawal || "0").toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Card>

          <Card sx={{ p: 2, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
              Pending Payouts
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#D97706', mt: 0.5 }}>
              ₹{parseFloat(earningData?.pendingWithdrawals || "0").toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Card>

          <Card sx={{ p: 2, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
              Transactions
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0284C7', mt: 0.5 }}>
              {earningData?.transactionsCount || transactions.length}
            </Typography>
          </Card>
        </Box>
      </Box>

      {/* 3X Re-Topup Banner: Shows when Earning Wallet gets 3X of package amount */}
      {canReTopup && (
        <Card sx={{
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #FEF9E7 0%, #FEF3C7 100%)',
          border: '2px solid #F59E0B',
          p: { xs: 2.5, sm: 3 },
          mb: 3,
          boxShadow: '0 8px 25px rgba(245, 158, 11, 0.18)',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 52,
              height: 52,
              borderRadius: '16px',
              bgcolor: '#D97706',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)'
            }}>
              <AutorenewIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                <Chip
                  label="3X Limit Reached"
                  size="small"
                  sx={{ bgcolor: '#D97706', color: '#FFF', fontWeight: 800, fontSize: '0.72rem' }}
                />
                <Typography sx={{ fontWeight: 900, color: '#78350F', fontSize: '1.15rem' }}>
                  Re-Top Up Available
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#92400E', fontWeight: 600 }}>
                Your combined earnings (Sale Value 2X: ₹{saleValueLimit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} + Earning Wallet 1X: ₹{maxLimit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) have reached the 3X threshold (₹{threeXLimit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}). Re-top up now to reactivate and scale your limits!
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate('/user/packages')}
            startIcon={<AutorenewIcon />}
            sx={{
              py: 1.3,
              px: 3.5,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #FE8001 0%, #EA580C 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.95rem',
              textTransform: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                boxShadow: '0 6px 18px rgba(234, 88, 12, 0.45)'
              }
            }}
          >
            Re-Top Up Now
          </Button>
        </Card>
      )}

      {/* Withdrawal Action Section */}
      <Card sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: '20px',
        bgcolor: '#FFFFFF',
        border: '1.5px solid #D1FAE5',
        boxShadow: '0 4px 20px rgba(5, 150, 105, 0.06)',
        mb: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
          <PaymentsIcon sx={{ color: '#059669', fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Request Earning Withdrawal
          </Typography>
        </Box>

        {availableBalance <= 0 ? (
          <Alert severity="info" sx={{ borderRadius: '12px', bgcolor: '#F0FDF4', color: '#065F46', border: '1px solid #A7F3D0' }}>
            No Earning Wallet balance is currently available for withdrawal.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Combined 3X Info Box: Sale Value (2X) + Earning Wallet (1X) = Combined (3X) */}
            <Box sx={{
              p: 2,
              borderRadius: '16px',
              bgcolor: '#F0FDF4',
              border: '1.5px solid #A7F3D0',
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
              gap: 1.5
            }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#065F46', fontWeight: 700, display: 'block' }}>Package Amount</Typography>
                <Typography variant="body1" sx={{ fontWeight: 900, color: '#1F333B' }}>₹{packageAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#065F46', fontWeight: 700, display: 'block' }}>Earning 1X Limit (Rem: ₹{remainingLimit.toFixed(0)})</Typography>
                <Typography variant="body1" sx={{ fontWeight: 900, color: '#047857' }}>₹{maxLimit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#065F46', fontWeight: 700, display: 'block' }}>Sale Value 2X Limit</Typography>
                <Typography variant="body1" sx={{ fontWeight: 900, color: '#047857' }}>₹{saleValueLimit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#065F46', fontWeight: 700, display: 'block' }}>Combined 3X Re-Topup</Typography>
                <Typography variant="body1" sx={{ fontWeight: 900, color: canReTopup ? '#D97706' : '#047857' }}>
                  ₹{threeXLimit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {canReTopup ? ' (Ready)' : ''}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 1 }}>
                Enter Withdrawal Amount
              </Typography>
              <TextField
                fullWidth
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                variant="outlined"
                error={parseFloat(amount) > availableBalance || (remainingLimit > 0 && parseFloat(amount) > remainingLimit)}
                helperText={
                  parseFloat(amount) > availableBalance
                    ? `Amount exceeds available earning balance (₹${availableBalance.toFixed(2)})`
                    : remainingLimit > 0 && parseFloat(amount) > remainingLimit
                      ? `Amount exceeds remaining 1X package limit (₹${remainingLimit.toFixed(2)})`
                      : "Standard 5% processing deduction applies"
                }
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Typography sx={{ fontWeight: 800, color: '#059669' }}>₹</Typography></InputAdornment>,
                }}
                sx={{
                  bgcolor: '#F8FAFC',
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }
                }}
              />
            </Box>

            {/* Quick Percentage Chips */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[25, 50, 75, 100].map((pct) => (
                <Button
                  key={pct}
                  size="small"
                  onClick={() => handleQuickPercent(pct)}
                  sx={{
                    px: 1.8,
                    py: 0.5,
                    borderRadius: '20px',
                    border: '1px solid #A7F3D0',
                    color: '#059669',
                    bgcolor: '#F0FDF4',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: '#D1FAE5'
                    }
                  }}
                >
                  {pct}%
                </Button>
              ))}
            </Box>

            {/* Calculation Breakdown */}
            {parseFloat(amount) > 0 && (
              <Box sx={{
                p: 2,
                borderRadius: '14px',
                bgcolor: '#F0FDF4',
                border: '1px solid #A7F3D0',
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <Typography sx={{ color: '#065F46', fontWeight: 600 }}>Requested Amount:</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#065F46' }}>₹{parseFloat(amount).toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <Typography sx={{ color: '#065F46', fontWeight: 600 }}>Deduction (5%):</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#DC2626' }}>- ₹{deduction.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 0.5, borderColor: '#A7F3D0' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                  <Typography sx={{ color: '#059669', fontWeight: 800 }}>Net Payout to Bank:</Typography>
                  <Typography sx={{ fontWeight: 900, color: '#059669', fontSize: '1.15rem' }}>₹{netAmount.toFixed(2)}</Typography>
                </Box>
              </Box>
            )}

            {/* Bank Info confirmation */}
            <Box sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <AccountBalanceIcon sx={{ color: '#64748B', fontSize: 22 }} />
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                Payout will be disbursed to your linked bank account ({memberDetails?.bank_name || 'Bank'} - {memberDetails?.account_number ? `A/C ending in ...${String(memberDetails.account_number).slice(-4)}` : 'Bank Account'}).
              </Typography>
            </Box>

            {/* Re-Topup Button (Shown when 3X reached) */}
            {canReTopup && (
              <Button
                variant="outlined"
                onClick={() => navigate('/user/packages')}
                startIcon={<AutorenewIcon />}
                fullWidth
                sx={{
                  py: 1.3,
                  borderRadius: '14px',
                  borderColor: '#F59E0B',
                  color: '#B45309',
                  bgcolor: '#FFFBEB',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px',
                    borderColor: '#D97706',
                    bgcolor: '#FEF3C7'
                  }
                }}
              >
                Re-Top Up Account (3X Limit Reached)
              </Button>
            )}

            {/* Submit Button */}
            <Button
              variant="contained"
              onClick={handleWithdraw}
              disabled={withdrawMutation.isPending || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance}
              fullWidth
              sx={{
                py: 1.4,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.95rem',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                  boxShadow: '0 6px 18px rgba(5, 150, 105, 0.35)'
                }
              }}
            >
              {withdrawMutation.isPending ? "Submitting Request..." : "Confirm Earning Withdrawal"}
            </Button>
          </Box>
        )}
      </Card>

      {/* Transaction History Section */}
      <Card sx={{
        borderRadius: '20px',
        bgcolor: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
      }}>
        <Box
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            bgcolor: '#FFFFFF',
            borderBottom: isHistoryOpen ? '1px solid #E2E8F0' : 'none'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <MonetizationOnIcon sx={{ color: '#059669' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Earning Transaction History
            </Typography>
          </Box>
          <IconButton size="small">
            {isHistoryOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </Box>

        <Collapse in={isHistoryOpen}>
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 2, maxWidth: '350px' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  bgcolor: '#F8FAFC',
                  borderRadius: '10px',
                  '& .MuiOutlinedInput-root': { borderRadius: '10px' }
                }}
              />
            </Box>

            <DataTable
              columns={getEarningWalletColumns()}
              data={filteredTransactions}
              pagination
              responsive
              customStyles={dashboardTableCustomStyles}
              noDataComponent={
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                    No Earning transactions found
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Collapse>
      </Card>
    </Box>
  );
};

export default EarningWallet;


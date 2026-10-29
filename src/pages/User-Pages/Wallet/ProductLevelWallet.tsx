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
  Collapse
} from '@mui/material';
import DataTable from "react-data-table-component";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentsIcon from '@mui/icons-material/Payments';
import InventoryIcon from '@mui/icons-material/Inventory';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TokenService from "../../../api/token/tokenService";
import { useGetProductLevelWalletOverview, useProductLevelWalletWithdraw } from '../../../api/Memeber';
import { getProductLevelWalletColumns } from '../../../utils/DataTableColumnsProvider';

const ProductLevelWallet: React.FC = () => {
  const navigate = useNavigate();
  const memberId = TokenService.getMemberId() || '';

  const { data: levelData, isLoading, refetch } = useGetProductLevelWalletOverview(memberId);
  const withdrawMutation = useProductLevelWalletWithdraw(memberId);

  const [amount, setAmount] = useState<string>("");
  const [deduction, setDeduction] = useState<number>(0);
  const [netAmount, setNetAmount] = useState<number>(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const availableBalance = parseFloat(levelData?.balance || levelData?.productLevelBalance || "0");
  const transactions: any[] = levelData?.transactions || [];

  const dashboardTableCustomStyles = {
    table: {
      style: {
        backgroundColor: '#ffffff',
        minWidth: '650px',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#0284C7',
        background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
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
        borderBottom: '1px solid #E0F2FE',
        '&:nth-of-type(even)': {
          backgroundColor: '#F8FAFC',
        },
        '&:hover': {
          backgroundColor: 'rgba(2, 132, 199, 0.08) !important',
          cursor: 'pointer',
        },
      },
    },
    pagination: {
      style: {
        backgroundColor: '#ffffff',
        borderTop: '1px solid #BAE6FD',
        color: '#1F333B',
        fontWeight: 600,
        minHeight: '46px',
      },
      pageButtonsStyle: {
        fill: '#0284C7',
        '&:disabled': {
          fill: '#BAE6FD',
        },
        '&:hover:not(:disabled)': {
          backgroundColor: 'rgba(2, 132, 199, 0.1)',
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
      const ded = num * 0.10;
      setDeduction(ded);
      setNetAmount(num - ded);
    } else {
      setDeduction(0);
      setNetAmount(0);
    }
  };

  const handleQuickPercent = (percent: number) => {
    if (availableBalance <= 0) return;
    const calculated = Math.floor((availableBalance * percent) / 100);
    setAmount(String(calculated));
    const ded = calculated * 0.10;
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
      toast.error(`Withdrawal amount exceeds available balance of ₹${availableBalance.toFixed(2)}`);
      return;
    }

    withdrawMutation.mutate(
      { memberId, amount },
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', bgcolor: '#FFFFFF' }}>
        <CircularProgress sx={{ color: "#0284C7" }} />
      </Box>
    );
  }

  return (
    <Box sx={{
      pb: 10,
      background: '#FFFFFF',
      minHeight: '100vh',
      px: { xs: 2, sm: 3, md: 5 },
      pt: { xs: 2.5, sm: 3.5 },
      maxWidth: '720px',
      margin: '0 auto'
    }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <IconButton
          onClick={() => navigate('/user/dashboard')}
          sx={{
            bgcolor: '#ffffff',
            border: '1.5px solid #BAE6FD',
            color: '#0284C7',
            p: 1,
            borderRadius: '14px',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.1)',
            '&:hover': { bgcolor: '#F0F9FF' }
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#1F333B', letterSpacing: '-0.3px', fontSize: { xs: '1.25rem', sm: '1.45rem' } }}>
            Product Level Wallet
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            Strictly dedicated to Product Level Income earnings & withdrawals
          </Typography>
        </Box>
      </Box>

      {/* Hero Balance Card */}
      <Card sx={{
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #0369A1 0%, #0284C7 50%, #38BDF8 100%)',
        color: '#FFFFFF',
        p: { xs: 2.5, sm: 3.5 },
        mb: 3,
        boxShadow: '0 12px 32px rgba(2, 132, 199, 0.28)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ambient Glows */}
        <Box sx={{
          position: 'absolute', top: -40, right: -40,
          width: 140, height: 140, borderRadius: '50%',
          bgcolor: 'rgba(255, 255, 255, 0.15)',
          filter: 'blur(30px)'
        }} />
        <Box sx={{
          position: 'absolute', bottom: -40, left: -40,
          width: 120, height: 120, borderRadius: '50%',
          bgcolor: 'rgba(2, 132, 199, 0.3)',
          filter: 'blur(25px)'
        }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <InventoryIcon sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.9)' }} />
            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.95 }}>
              Available Product Level Balance
            </Typography>
          </Box>

          <Typography sx={{
            fontSize: { xs: '2.2rem', sm: '2.8rem' },
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-1px',
            my: 1.2
          }}>
            ₹{availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2, pt: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <Box>
              <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600 }}>
                Total Level Income
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 800 }}>
                ₹{parseFloat(levelData?.totalIncome || "0").toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
            <Box sx={{ borderLeft: '1px solid rgba(255, 255, 255, 0.2)', pl: 2 }}>
              <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600 }}>
                Total Withdrawn
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 800 }}>
                ₹{parseFloat(levelData?.totalWithdrawal || "0").toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
            {parseFloat(levelData?.pendingWithdrawals || "0") > 0 && (
              <Box sx={{ borderLeft: '1px solid rgba(255, 255, 255, 0.2)', pl: 2 }}>
                <Typography sx={{ fontSize: '0.72rem', color: '#FEF08A', fontWeight: 600 }}>
                  Pending Requests
                </Typography>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#FEF08A' }}>
                  ₹{parseFloat(levelData?.pendingWithdrawals || "0").toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Card>

      {/* Withdrawal Form Card */}
      <Card sx={{
        borderRadius: '20px',
        bgcolor: '#FFFFFF',
        border: '1.5px solid #BAE6FD',
        boxShadow: '0 6px 20px rgba(2, 132, 199, 0.08)',
        p: { xs: 2.2, sm: 3 },
        mb: 3
      }}>
        <Typography sx={{ fontWeight: 800, color: '#1F333B', fontSize: '1.05rem', mb: 2 }}>
          Request Product Level Withdrawal
        </Typography>

        {availableBalance <= 0 && (
          <Alert severity="info" sx={{ mb: 2.5, borderRadius: '12px', fontSize: '0.84rem' }}>
            No Product Level Income is currently available for withdrawal.
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', mb: 0.8 }}>
            Withdrawal Amount (₹)
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter amount to withdraw"
            value={amount}
            onChange={handleAmountChange}
            type="text"
            disabled={availableBalance <= 0 || withdrawMutation.isPending}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ fontWeight: 800, color: '#0284C7', fontSize: '1.1rem' }}>₹</Typography>
                </InputAdornment>
              ),
              sx: {
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '1.05rem',
                bgcolor: '#F8FAFC',
                '& fieldset': { borderColor: '#BAE6FD' },
                '&:hover fieldset': { borderColor: '#0284C7' },
                '&.Mui-focused fieldset': { borderColor: '#0284C7' }
              }
            }}
          />
        </Box>

        {/* Quick Percent Buttons */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
          {[25, 50, 75, 100].map((pct) => (
            <Button
              key={pct}
              onClick={() => handleQuickPercent(pct)}
              disabled={availableBalance <= 0 || withdrawMutation.isPending}
              size="small"
              sx={{
                flex: 1,
                py: 0.8,
                bgcolor: '#F0F9FF',
                color: '#0284C7',
                border: '1px solid #BAE6FD',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.82rem',
                textTransform: 'none',
                '&:hover': { bgcolor: '#E0F2FE' }
              }}
            >
              {pct === 100 ? 'Max (100%)' : `${pct}%`}
            </Button>
          ))}
        </Box>

        {/* Breakdown preview */}
        {parseFloat(amount) > 0 && (
          <Box sx={{
            bgcolor: '#F0F9FF',
            border: '1px solid #BAE6FD',
            borderRadius: '14px',
            p: 2,
            mb: 2.5
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
              <Typography sx={{ fontSize: '0.84rem', color: '#64748B' }}>Requested Amount:</Typography>
              <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#1F333B' }}>
                ₹{parseFloat(amount).toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
              <Typography sx={{ fontSize: '0.84rem', color: '#DC2626' }}>Standard Deduction (10% TDS / Admin):</Typography>
              <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#DC2626' }}>
                - ₹{deduction.toFixed(2)}
              </Typography>
            </Box>
            <Divider sx={{ my: 1, borderColor: '#BAE6FD' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#0369A1' }}>Net Payout Amount:</Typography>
              <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: '#0284C7' }}>
                ₹{netAmount.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        )}

        <Button
          fullWidth
          variant="contained"
          disabled={availableBalance <= 0 || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance || withdrawMutation.isPending}
          onClick={handleWithdraw}
          startIcon={withdrawMutation.isPending ? <CircularProgress size={18} color="inherit" /> : <PaymentsIcon />}
          sx={{
            py: 1.4,
            borderRadius: '14px',
            bgcolor: '#0284C7',
            background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.95rem',
            textTransform: 'none',
            boxShadow: '0 6px 18px rgba(2, 132, 199, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0369A1 0%, #075985 100%)',
            },
            '&:disabled': {
              bgcolor: '#CBD5E1',
              color: '#94A3B8'
            }
          }}
        >
          {withdrawMutation.isPending ? "Submitting Request..." : "Confirm Product Level Withdrawal"}
        </Button>
      </Card>

      {/* Transaction History Section */}
      <Card sx={{
        borderRadius: '20px',
        bgcolor: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        <Box
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2.2,
            cursor: 'pointer',
            bgcolor: '#F8FAFC',
            borderBottom: isHistoryOpen ? '1px solid #E2E8F0' : 'none'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontWeight: 800, color: '#1F333B', fontSize: '0.98rem' }}>
              Product Level Transaction History
            </Typography>
            <Typography sx={{
              bgcolor: '#E0F2FE',
              color: '#0284C7',
              fontSize: '0.72rem',
              fontWeight: 800,
              px: 1,
              py: 0.2,
              borderRadius: '8px'
            }}>
              {filteredTransactions.length}
            </Typography>
          </Box>
          <IconButton size="small">
            {isHistoryOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </Box>

        <Collapse in={isHistoryOpen}>
          <Box sx={{ p: 2 }}>
            <TextField
              size="small"
              placeholder="Search by ID, type, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC'
                }
              }}
            />

            <DataTable
              columns={getProductLevelWalletColumns()}
              data={filteredTransactions}
              customStyles={dashboardTableCustomStyles}
              pagination
              paginationPerPage={5}
              paginationRowsPerPageOptions={[5, 10, 20]}
              noDataComponent={
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.88rem' }}>
                    No Product Level transactions found
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

export default ProductLevelWallet;

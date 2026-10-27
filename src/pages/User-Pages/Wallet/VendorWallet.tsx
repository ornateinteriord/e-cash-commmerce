import React, { useState } from 'react';
import {
  Card,
  CardContent,
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
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TokenService from "../../../api/token/tokenService";
import { useGetVendorWalletOverview, useVendorWalletWithdraw, useGetMemberDetails } from '../../../api/Memeber';
import { getVendorWalletColumns } from '../../../utils/DataTableColumnsProvider';

const VendorWallet: React.FC = () => {
  const navigate = useNavigate();
  const memberId = TokenService.getMemberId() || '';

  const { data: vendorData, isLoading, refetch } = useGetVendorWalletOverview(memberId);
  const { data: memberDetails } = useGetMemberDetails(memberId);
  const withdrawMutation = useVendorWalletWithdraw(memberId);

  const [amount, setAmount] = useState<string>("");
  const [deduction, setDeduction] = useState<number>(0);
  const [netAmount, setNetAmount] = useState<number>(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const availableBalance = parseFloat(vendorData?.balance || vendorData?.vendorWalletBalance || "0");
  const transactions: any[] = vendorData?.transactions || [];

  const dashboardTableCustomStyles = {
    table: {
      style: {
        backgroundColor: '#ffffff',
        minWidth: '650px',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#FE8001',
        background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
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
        borderBottom: '1px solid #FED7AA',
        '&:nth-of-type(even)': {
          backgroundColor: '#FFFDF9',
        },
        '&:hover': {
          backgroundColor: 'rgba(254, 128, 1, 0.08) !important',
          cursor: 'pointer',
        },
      },
    },
    pagination: {
      style: {
        backgroundColor: '#ffffff',
        borderTop: '1px solid #FED7AA',
        color: '#1F333B',
        fontWeight: 600,
        minHeight: '46px',
      },
      pageButtonsStyle: {
        fill: '#FE8001',
        '&:disabled': {
          fill: '#FED7AA',
        },
        '&:hover:not(:disabled)': {
          backgroundColor: 'rgba(254, 128, 1, 0.1)',
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
        <CircularProgress sx={{ color: "#FE8001" }} />
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
            border: '1.5px solid #FED7AA',
            color: '#FE8001',
            p: 1,
            borderRadius: '14px',
            '&:hover': { bgcolor: '#FFF7ED' }
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#1F333B', letterSpacing: '-0.5px' }}>
            Vendor Wallet
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            Dedicated vendor earnings & withdrawal management
          </Typography>
        </Box>
      </Box>

      {/* WITHDRAWAL CARD (ONLY OPTION) */}
      <Card sx={{
        mb: 3.5,
        borderRadius: '24px',
        bgcolor: '#ffffff',
        border: '1.5px solid #FED7AA',
        boxShadow: '0 8px 24px rgba(254, 128, 1, 0.08)',
        overflow: 'hidden'
      }}>
        <Box sx={{
          p: { xs: 2, sm: 2.5 },
          background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <PaymentsIcon />
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.15rem' } }}>
              Withdraw Funds
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', px: 1.2, py: 0.4, borderRadius: '8px', fontWeight: 700 }}>
            Instant Request
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 2.2, sm: 3 } }}>
          <Alert severity="info" sx={{ mb: 2.5, borderRadius: '14px', bgcolor: '#FFF7ED', color: '#9A3412', border: '1px solid #FED7AA' }}>
            Withdrawals are credited directly to your verified bank account.
          </Alert>

          {/* Available Balance Display */}
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#1F333B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.8, display: 'block' }}>
              Available Vendor Balance
            </Typography>
            <TextField
              fullWidth
              value={`₹${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              InputProps={{ readOnly: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  bgcolor: '#FFFDF9',
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  color: '#FE8001',
                  '& fieldset': { borderColor: '#FED7AA', borderWidth: '1.5px' },
                }
              }}
            />
          </Box>

          {/* Amount Field */}
          <Typography variant="caption" sx={{ color: '#1F333B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.8, display: 'block' }}>
            Enter Withdrawal Amount
          </Typography>

          <TextField
            fullWidth
            type="text"
            placeholder="0.00"
            value={amount}
            onChange={handleAmountChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ color: '#FE8001', fontWeight: 900, fontSize: '1.2rem' }}>₹</Typography>
                </InputAdornment>
              ),
            }}
            error={parseFloat(amount) > availableBalance}
            helperText={
              parseFloat(amount) > availableBalance
                ? `Amount exceeds available vendor balance (₹${availableBalance.toFixed(2)})`
                : "Standard 10% processing deduction applies"
            }
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                bgcolor: '#FFFFFF',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#1F333B',
                '& fieldset': { borderColor: '#FED7AA', borderWidth: '1.5px' },
                '&:hover fieldset': { borderColor: '#FE8001' },
                '&.Mui-focused fieldset': { borderColor: '#FE8001', borderWidth: '2px' },
              }
            }}
          />

          {/* Quick Preset Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            {[25, 50, 75, 100].map((pct) => (
              <Button
                key={pct}
                size="small"
                onClick={() => handleQuickPercent(pct)}
                disabled={availableBalance <= 0}
                sx={{
                  flex: 1,
                  minWidth: '60px',
                  bgcolor: '#FFF7ED',
                  border: '1px solid #FED7AA',
                  color: '#EA580C',
                  fontWeight: 800,
                  borderRadius: '10px',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#FFEDD5', borderColor: '#FE8001' }
                }}
              >
                {pct === 100 ? 'MAX' : `${pct}%`}
              </Button>
            ))}
          </Box>

          {/* Calculation Breakdown Preview */}
          {parseFloat(amount) > 0 && (
            <Box sx={{
              p: 2,
              borderRadius: '16px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              mb: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>Gross Amount</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#1F333B' }}>₹{parseFloat(amount).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>Deduction (10%)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#DC2626' }}>- ₹{deduction.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ color: '#059669', fontWeight: 800 }}>Net Payout Amount</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#059669' }}>₹{netAmount.toFixed(2)}</Typography>
              </Box>
            </Box>
          )}

          {/* Bank Account Details Hint */}
          {(memberDetails?.account_number || memberDetails?.data?.account_number) && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              mb: 3,
              p: 1.5,
              borderRadius: '12px',
              bgcolor: '#F0FDF4',
              border: '1px solid #BBF7D0'
            }}>
              <AccountBalanceIcon sx={{ color: '#16A34A', fontSize: 22 }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, display: 'block' }}>
                  Payout Destination
                </Typography>
                <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 600 }}>
                  A/C: {memberDetails?.account_number || memberDetails?.data?.account_number} | IFSC: {memberDetails?.ifsc_code || memberDetails?.data?.ifsc_code}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Submit Withdrawal Button */}
          <Button
            variant="contained"
            fullWidth
            disabled={
              withdrawMutation.isPending ||
              !amount ||
              parseFloat(amount) <= 0 ||
              parseFloat(amount) > availableBalance
            }
            onClick={handleWithdraw}
            sx={{
              py: 1.6,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: '0 6px 18px rgba(254, 128, 1, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #E06F00 0%, #FE8001 100%)',
                boxShadow: '0 8px 24px rgba(254, 128, 1, 0.45)'
              },
              '&:disabled': {
                bgcolor: '#CBD5E1',
                color: '#94A3B8'
              }
            }}
          >
            {withdrawMutation.isPending ? (
              <CircularProgress size={24} sx={{ color: '#FFFFFF' }} />
            ) : (
              "Submit Withdrawal Request"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Transaction History Section - matching dashboard orange theme */}
      <Box sx={{ mb: 2 }}>
        <Card sx={{
          borderRadius: '16px',
          bgcolor: '#ffffff',
          border: '1.5px solid #FED7AA',
          boxShadow: '0 4px 16px rgba(109, 33, 79, 0.05)',
          overflow: 'hidden'
        }}>
          {/* Dashboard Orange Gradient Header Bar */}
          <Box
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            sx={{
              background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
              color: '#FFFFFF',
              px: { xs: 2, sm: 2.5 },
              py: 1.4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.95rem', sm: '1.05rem' }, color: '#FFFFFF', letterSpacing: '0.3px' }}>
              Vendor Wallet History
            </Typography>
            <IconButton size="small" sx={{ color: '#FFFFFF', p: 0.5 }}>
              {isHistoryOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Box>

          <Collapse in={isHistoryOpen}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              {/* Search Box */}
              <Box sx={{ mb: 1.8 }}>
                <TextField
                  fullWidth
                  placeholder="Search..."
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: '#FFFFFF',
                      fontSize: '0.88rem',
                      '& fieldset': { borderColor: '#FED7AA' },
                      '&:hover fieldset': { borderColor: '#FE8001' },
                      '&.Mui-focused fieldset': { borderColor: '#FE8001', borderWidth: '1.5px' }
                    }
                  }}
                />
              </Box>

              <Box sx={{ width: '100%', overflowX: 'auto', border: '1px solid #FED7AA', borderRadius: '12px' }}>
                <DataTable
                  columns={getVendorWalletColumns()}
                  data={filteredTransactions}
                  pagination
                  customStyles={dashboardTableCustomStyles}
                  paginationPerPage={25}
                  paginationRowsPerPageOptions={[10, 25, 50, 100]}
                  highlightOnHover
                  responsive
                  noHeader
                  noDataComponent={
                    <Box sx={{ p: 4, textAlign: 'center', width: '100%' }}>
                      <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.88rem' }}>
                        {searchQuery ? `No transactions match "${searchQuery}"` : "No data available in table"}
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </CardContent>
          </Collapse>
        </Card>
      </Box>
    </Box>
  );
};

export default VendorWallet;

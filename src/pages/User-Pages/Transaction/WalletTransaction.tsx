import React, { useState, useEffect, useMemo } from 'react';
import DataTable from "react-data-table-component";
import {
  Card,
  CardContent,
  TextField,
  CircularProgress,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CallMadeIcon from '@mui/icons-material/CallMade';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { exportToExcel } from '../../../utils/excelExport';
import { getFormattedDate } from '../../../utils/common';
import { useGetTransactionDetails, useGetWalletOverview } from '../../../api/Memeber';
import TokenService from '../../../api/token/tokenService';

const getSourceMemberId = (tx: any): string | null => {
  if (!tx) return null;
  const rawId = tx.related_member_id || tx.member_id_from || tx.from_member_id || tx.sender_id;
  if (rawId && String(rawId).trim()) {
    return String(rawId).trim();
  }
  if (tx.description && typeof tx.description === 'string') {
    const match = tx.description.match(/from\s+member\s+([A-Za-z0-9_-]+)/i) ||
                  tx.description.match(/from\s+(U\w+|\d{6,})/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
};

const WalletTransaction: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams] = useSearchParams();
  
  const type = searchParams.get("type") || "all";
  const status = searchParams.get("status") || "all";

  const memberId = TokenService.getMemberId();
  const { data: walletOverview } = useGetWalletOverview(memberId);

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

  const creditBalance = Number(walletOverview?.balance ?? walletOverview?.data?.balance ?? walletOverview?.availableForWithdrawal ?? 0);

  const {
    data: transactionsResponse,
    isLoading,
    isError,
    error,
  } = useGetTransactionDetails(status, type);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<'all' | 'credit' | 'debit'>('all');
  const [filteredData, setFilteredData] = useState<any[]>([]);

  useEffect(() => {
    if (isError) {
      const err = error as any;
      toast.error(
        err?.response?.data?.message || "Failed to fetch transactions"
      );
    }
  }, [isError, error]);

  const rawTransactions = useMemo(() => {
    return transactionsResponse?.data || [];
  }, [transactionsResponse]);

  useEffect(() => {
    if (Array.isArray(rawTransactions)) {
      let data = [...rawTransactions];

      // 1. Filter by credit / debit mode
      if (filterMode === 'credit') {
        data = data.filter((tx: any) => {
          const ew = parseFloat(tx.ew_credit || 0);
          const tw = parseFloat(tx.tw_credit || 0);
          const credit = parseFloat(tx.credit || 0);
          return (ew > 0 || tw > 0 || credit > 0);
        });
      } else if (filterMode === 'debit') {
        data = data.filter((tx: any) => {
          const ew = parseFloat(tx.ew_debit || 0);
          const tw = parseFloat(tx.tw_debit || 0);
          const debit = parseFloat(tx.debit || 0);
          return (ew > 0 || tw > 0 || debit > 0);
        });
      }

      // 2. Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        data = data.filter((tx: any) =>
          Object.values(tx).some(value =>
            value?.toString().toLowerCase().includes(query)
          )
        );
      }

      setFilteredData(data);
    } else {
      setFilteredData([]);
    }
  }, [rawTransactions, searchQuery, filterMode]);

  const isCreditsView = type?.toLowerCase() === 'credits' || type?.toLowerCase() === 'credit';
  const isReTopupView = type?.toLowerCase() === 'retopup' || type?.toLowerCase() === 'topup';

  const pageTitle = isCreditsView 
    ? 'Credits Wallet Statement' 
    : isReTopupView 
      ? 'Re-Topup Wallet Statement' 
      : (type !== 'all' ? `${type} History` : 'Wallet Transactions');

  const pageSubtitle = isCreditsView
    ? ''
    : isReTopupView
      ? 'Record of account balances and transactions'
      : 'All account inflows, outflows, and wallet balances';

  // Custom table styling matching theme
  const customStyles = {
    table: {
      style: {
        backgroundColor: '#ffffff',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#FFFFFF',
        borderBottom: '2px solid #FED7AA',
        minHeight: '48px',
      },
    },
    headCells: {
      style: {
        color: '#FE8001',
        fontWeight: 800,
        fontSize: '0.85rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
    rows: {
      style: {
        fontSize: '0.9rem',
        fontWeight: 500,
        color: '#1F333B',
        minHeight: '56px',
        '&:hover': {
          backgroundColor: '#FFFDF9 !important',
          cursor: 'pointer',
        },
        borderBottom: '1px solid #f8e8ec',
      },
    },
    pagination: {
      style: {
        backgroundColor: '#ffffff',
        borderTop: '1px solid #FED7AA',
        color: '#FE8001',
        fontWeight: 700,
      },
      pageButtonsStyle: {
        fill: '#FE8001',
        '&:disabled': {
          fill: '#CBD5E1',
        },
      },
    },
  };

  const desktopColumns = [
    {
      name: "Date",
      selector: (row: any) => getFormattedDate(row.transaction_date || row.createdAt),
      sortable: true,
      width: "125px",
      cell: (row: any) => (
        <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#64748B' }}>
          {getFormattedDate(row.transaction_date || row.createdAt)}
        </Typography>
      )
    },
    {
      name: "Type",
      selector: (row: any) => row.transaction_type || row.benefit_type || "Transaction",
      sortable: true,
      width: "160px",
      cell: (row: any) => (
        <Box sx={{
          px: 1.2,
          py: 0.4,
          borderRadius: '8px',
          bgcolor: '#F0F9FF',
          border: '1px solid #BAE6FD',
          display: 'inline-block'
        }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#0369A1' }}>
            {row.transaction_type || row.benefit_type || "Transaction"}
          </Typography>
        </Box>
      )
    },
    {
      name: "Description",
      selector: (row: any) => row.description || "-",
      sortable: true,
      wrap: true,
      cell: (row: any) => {
        const sourceMemberId = getSourceMemberId(row);
        return (
          <Box sx={{ py: 0.5 }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#2D0F1E' }}>
              {row.description || "-"}
            </Typography>
            {row.transaction_id && (
              <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, fontFamily: 'monospace' }}>
                ID: {row.transaction_id}
              </Typography>
            )}
            {sourceMemberId && (
              <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, fontFamily: 'monospace' }}>
                User ID: {sourceMemberId}
              </Typography>
            )}
          </Box>
        );
      }
    },
    {
      name: "Credit",
      selector: (row: any) => parseFloat(row.ew_credit || row.tw_credit || row.credit || 0),
      sortable: true,
      width: "120px",
      cell: (row: any) => {
        const amt = parseFloat(row.ew_credit || row.tw_credit || row.credit || 0);
        return amt > 0 ? (
          <Typography sx={{ color: '#059669', fontWeight: 900, fontSize: '0.9rem' }}>
            +₹{amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        ) : (
          <Typography sx={{ color: '#94A3B8' }}>-</Typography>
        );
      }
    },
    {
      name: "Debit",
      selector: (row: any) => parseFloat(row.ew_debit || row.tw_debit || row.debit || 0),
      sortable: true,
      width: "120px",
      cell: (row: any) => {
        const amt = parseFloat(row.ew_debit || row.tw_debit || row.debit || 0);
        return amt > 0 ? (
          <Typography sx={{ color: '#E11D48', fontWeight: 900, fontSize: '0.9rem' }}>
            -₹{amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        ) : (
          <Typography sx={{ color: '#94A3B8' }}>-</Typography>
        );
      }
    },
    {
      name: "Balance",
      selector: (row: any) => parseFloat(row.balance || row.previous_balance || 0),
      sortable: true,
      width: "120px",
      cell: (row: any) => {
        const amt = row.balance || row.previous_balance;
        return amt !== undefined && amt !== null ? (
          <Typography sx={{ fontWeight: 800, color: '#2D0F1E', fontSize: '0.88rem' }}>
            ₹{parseFloat(amt).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        ) : (
          <Typography sx={{ color: '#94A3B8' }}>-</Typography>
        );
      }
    },
    {
      name: "Status",
      selector: (row: any) => row.status,
      sortable: true,
      width: "120px",
      cell: (row: any) => {
        const status = (row.status || 'Completed').toLowerCase();
        const isSuccess = status === 'completed' || status === 'approved' || status === 'active';
        const isPending = status === 'pending' || status === 'processing';

        return (
          <Box
            sx={{
              color: isSuccess ? "#059669" : isPending ? "#D97706" : "#DC2626",
              backgroundColor: isSuccess ? "#ECFDF5" : isPending ? "#FEF3C7" : "#FEF2F2",
              border: `1px solid ${isSuccess ? "#A7F3D0" : isPending ? "#FDE68A" : "#FECACA"}`,
              padding: "4px 10px",
              borderRadius: "10px",
              fontSize: "11px",
              fontWeight: 800,
              textTransform: 'uppercase',
              display: 'inline-block'
            }}
          >
            {row.status || 'Completed'}
          </Box>
        );
      },
    },
  ];

  const handleExport = () => {
    exportToExcel({
      fileName: `Statement_${type}_${new Date().toLocaleDateString('en-GB')}`,
      title: `${pageTitle}`,
      columns: [
        { header: 'Date', key: 'transaction_date', width: 20 },
        { header: 'ID', key: 'transaction_id', width: 20 },
        { header: 'Type', key: 'transaction_type', width: 20 },
        { header: 'Description', key: 'description', width: 40 },
        { header: 'Credit (₹)', key: 'credit', width: 15 },
        { header: 'Debit (₹)', key: 'debit', width: 15 },
        { header: 'Balance (₹)', key: 'balance', width: 15 },
        { header: 'Status', key: 'status', width: 14 },
      ],
      data: filteredData.map(tx => ({
        ...tx,
        transaction_date: tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString('en-GB') : (tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-GB') : ''),
        transaction_type: tx.transaction_type || tx.benefit_type || 'Transaction',
        credit: parseFloat(tx.ew_credit || tx.tw_credit || tx.credit || 0) || 0,
        debit: parseFloat(tx.ew_debit || tx.tw_debit || tx.debit || 0) || 0,
        balance: tx.balance || tx.previous_balance || 0,
        status: tx.status || 'Completed'
      })),
      statusField: 'status'
    });
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#FFFFFF',
      px: { xs: 1.8, sm: 3, md: 5 },
      py: { xs: 2, sm: 3.5 },
      maxWidth: '1280px',
      margin: '0 auto',
      pb: { xs: 10, md: 6 }
    }}>
      {/* Top Header with Back Navigation */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        mb: 2.5
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            onClick={() => navigate('/user/dashboard')}
            sx={{
              bgcolor: '#ffffff',
              border: '1.5px solid #FED7AA',
              color: '#FE8001',
              p: 1,
              borderRadius: '14px',
              boxShadow: '0 2px 8px rgba(109, 33, 79, 0.05)',
              '&:hover': { bgcolor: '#fdf2f4' }
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{
              fontWeight: 900,
              color: '#2D0F1E',
              letterSpacing: '-0.5px',
              fontSize: { xs: '1.25rem', sm: '1.55rem' }
            }}>
              {pageTitle}
            </Typography>
            {pageSubtitle ? (
              <Typography sx={{
                color: '#7A5060',
                fontWeight: 600,
                fontSize: { xs: '0.78rem', sm: '0.85rem' },
                lineHeight: 1.3
              }}>
                {pageSubtitle}
              </Typography>
            ) : null}
          </Box>
        </Box>

        {/* Action Button: Export */}
        <Button
          variant="contained"
          size="small"
          startIcon={<DownloadIcon sx={{ fontSize: 18 }} />}
          onClick={handleExport}
          sx={{
            background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.85rem',
            borderRadius: '12px',
            px: 2.2,
            py: 0.9,
            textTransform: 'none',
            boxShadow: '0 4px 14px rgba(0, 186, 242, 0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #FF9933 0%, #E06F00 100%)',
              boxShadow: '0 6px 18px rgba(0, 186, 242, 0.45)'
            }
          }}
        >
          Export Statement
        </Button>
      </Box>

      {/* Summary Stat Cards (Total Earnings & Credit Balance) */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: { xs: 1.5, sm: 2 },
        mb: 2.5
      }}>
        {/* Total Earnings Card */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.6, sm: 2 },
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            border: '1.5px solid #A7F3D0',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1.2, sm: 1.8 }
          }}
        >
          <Box sx={{
            width: { xs: 42, sm: 48 },
            height: { xs: 42, sm: 48 },
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
          }}>
            <TrendingUpIcon sx={{ fontSize: { xs: 22, sm: 26 } }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{
              color: '#065F46',
              fontSize: { xs: '0.68rem', sm: '0.75rem' },
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Total Earnings
            </Typography>
            <Typography sx={{
              color: '#064E3B',
              fontSize: { xs: '1.05rem', sm: '1.3rem' },
              fontWeight: 900,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              ₹{Number(totalEarnings).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Paper>

        {/* Credit Balance Card */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.6, sm: 2 },
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
            border: '1.5px solid #BAE6FD',
            boxShadow: '0 4px 16px rgba(0, 186, 242, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1.2, sm: 1.8 }
          }}
        >
          <Box sx={{
            width: { xs: 42, sm: 48 },
            height: { xs: 42, sm: 48 },
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(0, 186, 242, 0.3)'
          }}>
            <AccountBalanceWalletIcon sx={{ fontSize: { xs: 22, sm: 26 } }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{
              color: '#0369A1',
              fontSize: { xs: '0.68rem', sm: '0.75rem' },
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Credit Balance
            </Typography>
            <Typography sx={{
              color: '#0C4A6E',
              fontSize: { xs: '1.05rem', sm: '1.3rem' },
              fontWeight: 900,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              ₹{Number(creditBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Filter & Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: '20px',
          bgcolor: '#ffffff',
          border: '1.5px solid #FED7AA',
          boxShadow: '0 4px 16px rgba(109, 33, 79, 0.05)',
          mb: 2.5,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'stretch',
          justifyContent: 'space-between',
          gap: 1.5
        }}
      >
        {/* Search Field */}
        <TextField
          fullWidth
          placeholder="Search by ID, type, description, amount..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#FE8001', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: { xs: '100%', sm: '380px' },
            bgcolor: '#FFFFFF',
            borderRadius: '14px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#FED7AA',
              borderRadius: '14px',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#FE8001',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#FE8001',
            },
            '& .MuiInputBase-input': {
              fontSize: '0.88rem',
              fontWeight: 600,
              color: '#2D0F1E',
            }
          }}
        />

        {/* Filter Chips */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          overflowX: 'auto',
          pb: { xs: 0.5, sm: 0 }
        }}>
          <FilterAltIcon sx={{ color: '#7A5060', fontSize: 18, display: { xs: 'none', sm: 'block' } }} />
          <Chip
            label="All"
            onClick={() => setFilterMode('all')}
            sx={{
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              bgcolor: filterMode === 'all' ? '#FE8001' : '#FFFFFF',
              color: filterMode === 'all' ? '#FFFFFF' : '#FE8001',
              border: '1px solid #FED7AA',
              '&:hover': { bgcolor: filterMode === 'all' ? '#E06F00' : '#fce8ec' }
            }}
          />
          <Chip
            label="Credits (+)"
            onClick={() => setFilterMode('credit')}
            sx={{
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              bgcolor: filterMode === 'credit' ? '#059669' : '#ECFDF5',
              color: filterMode === 'credit' ? '#FFFFFF' : '#059669',
              border: '1px solid #A7F3D0',
              '&:hover': { bgcolor: filterMode === 'credit' ? '#047857' : '#D1FAE5' }
            }}
          />
          <Chip
            label="Debits (-)"
            onClick={() => setFilterMode('debit')}
            sx={{
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              bgcolor: filterMode === 'debit' ? '#E11D48' : '#FEF2F2',
              color: filterMode === 'debit' ? '#FFFFFF' : '#E11D48',
              border: '1px solid #FECACA',
              '&:hover': { bgcolor: filterMode === 'debit' ? '#BE123C' : '#FEE2E2' }
            }}
          />
        </Box>
      </Paper>

      {/* Main Content Area */}
      {isLoading ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 12,
          gap: 2
        }}>
          <CircularProgress size={44} sx={{ color: '#FE8001' }} />
          <Typography sx={{ color: '#7A5060', fontWeight: 700, fontSize: '0.95rem' }}>
            Loading wallet transactions...
          </Typography>
        </Box>
      ) : filteredData.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            textAlign: 'center',
            bgcolor: '#ffffff',
            borderRadius: '24px',
            border: '1.5px solid #FED7AA',
            boxShadow: '0 4px 16px rgba(109, 33, 79, 0.04)'
          }}
        >
          <Box sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: '#FFFFFF',
            color: '#FE8001',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
            border: '1px solid #FED7AA'
          }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#2D0F1E', mb: 0.5 }}>
            No Transactions Found
          </Typography>
          <Typography sx={{ color: '#7A5060', fontSize: '0.88rem', maxWidth: 400, mx: 'auto' }}>
            {searchQuery 
              ? `No transactions match your search query "${searchQuery}". Try clearing the search.`
              : `There are currently no transactions recorded for this wallet.`}
          </Typography>
          {searchQuery && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSearchQuery('');
                setFilterMode('all');
              }}
              sx={{
                mt: 2,
                borderRadius: '12px',
                borderColor: '#FE8001',
                color: '#FE8001',
                fontWeight: 700,
                textTransform: 'none'
              }}
            >
              Clear Filters
            </Button>
          )}
        </Paper>
      ) : isMobile ? (
        /* MOBILE VIEW: High quality card list */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filteredData.map((tx: any, idx: number) => {
            const creditAmt = parseFloat(tx.ew_credit || tx.tw_credit || tx.credit || 0);
            const debitAmt = parseFloat(tx.ew_debit || tx.tw_debit || tx.debit || 0);
            const isCredit = creditAmt > 0;
            const amountVal = isCredit ? creditAmt : debitAmt;
            const status = (tx.status || 'Completed').toLowerCase();
            const isSuccess = status === 'completed' || status === 'approved' || status === 'active';
            const isPending = status === 'pending' || status === 'processing';

            return (
              <Paper
                key={tx._id || tx.transaction_id || idx}
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: '#ffffff',
                  borderRadius: '20px',
                  border: '1.5px solid #FED7AA',
                  boxShadow: '0 4px 14px rgba(109, 33, 79, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 6px 18px rgba(109, 33, 79, 0.08)',
                    borderColor: '#E5989B'
                  }
                }}
              >
                {/* Top Row: Type Badge + Date */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{
                    px: 1.2,
                    py: 0.35,
                    borderRadius: '8px',
                    bgcolor: isCredit ? '#ECFDF5' : '#FEF2F2',
                    border: `1px solid ${isCredit ? '#A7F3D0' : '#FECACA'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                    {isCredit ? (
                      <CallReceivedIcon sx={{ fontSize: 13, color: '#059669' }} />
                    ) : (
                      <CallMadeIcon sx={{ fontSize: 13, color: '#E11D48' }} />
                    )}
                    <Typography sx={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      color: isCredit ? '#047857' : '#BE123C'
                    }}>
                      {tx.transaction_type || tx.benefit_type || (isCredit ? 'Credit' : 'Debit')}
                    </Typography>
                  </Box>

                  <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
                    {getFormattedDate(tx.transaction_date || tx.createdAt)}
                  </Typography>
                </Box>

                {/* Middle Row: Description & Amount */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: '#2D0F1E',
                      lineHeight: 1.3,
                      mb: 0.3
                    }}>
                      {tx.description || tx.transaction_type || 'Wallet Transaction'}
                    </Typography>
                    {tx.transaction_id && (
                      <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, fontFamily: 'monospace' }}>
                        ID: {tx.transaction_id}
                      </Typography>
                    )}
                    {getSourceMemberId(tx) && (
                      <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, fontFamily: 'monospace' }}>
                        User ID: {getSourceMemberId(tx)}
                      </Typography>
                    )}
                  </Box>

                  {/* Big Bold Amount */}
                  <Typography sx={{
                    fontWeight: 900,
                    fontSize: '1.15rem',
                    color: isCredit ? '#059669' : '#E11D48',
                    letterSpacing: '-0.3px',
                    textAlign: 'right',
                    whiteSpace: 'nowrap'
                  }}>
                    {isCredit ? '+' : '-'}₹{amountVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>

                {/* Bottom Row: Balance & Status Pill */}
                <Box sx={{
                  pt: 1,
                  borderTop: '1px dashed #FED7AA',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography sx={{ fontSize: '0.78rem', color: '#7A5060', fontWeight: 700 }}>
                    Balance: <span style={{ color: '#2D0F1E', fontWeight: 800 }}>₹{parseFloat(tx.balance || tx.previous_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </Typography>

                  <Box sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: '8px',
                    bgcolor: isSuccess ? "#ECFDF5" : isPending ? "#FEF3C7" : "#FEF2F2",
                    border: `1px solid ${isSuccess ? "#A7F3D0" : isPending ? "#FDE68A" : "#FECACA"}`,
                    color: isSuccess ? "#059669" : isPending ? "#D97706" : "#DC2626",
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}>
                    {tx.status || 'Completed'}
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      ) : (
        /* DESKTOP / TABLET VIEW: Modern Full DataTable */
        <Card
          elevation={0}
          sx={{
            borderRadius: '24px',
            border: '1.5px solid #FED7AA',
            boxShadow: '0 8px 24px rgba(109, 33, 79, 0.05)',
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <DataTable
              columns={desktopColumns}
              data={filteredData}
              pagination
              customStyles={customStyles}
              paginationPerPage={25}
              paginationRowsPerPageOptions={[25, 50, 100]}
              highlightOnHover
              progressPending={false}
              noDataComponent={
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography sx={{ color: '#7A5060', fontWeight: 700 }}>
                    No transactions available
                  </Typography>
                </Box>
              }
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default WalletTransaction;

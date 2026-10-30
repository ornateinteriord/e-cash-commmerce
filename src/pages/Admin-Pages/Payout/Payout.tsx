import { Box, Card, CardContent, Tab, Tabs, TextField, Typography, Chip, Stack } from '@mui/material';
import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import "./Payout.scss";
import DataTable from "react-data-table-component";
import { DASHBOARD_CUTSOM_STYLE, getProccessedColumns, getRequestColumns } from '../../../utils/DataTableColumnsProvider';
import { useApproveWithdrawal, useGetApprovedWithdrawals, useGetPendingWithdrawals } from '../../../api/Memeber';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StorefrontIcon from '@mui/icons-material/Storefront';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AppsIcon from '@mui/icons-material/Apps';

export type WalletFilterType = 'ALL' | 'MAIN' | 'VENDOR' | 'PRODUCT_LEVEL';

interface PayoutTableProps {
  data: any[];
  columns: any;
  tabTitle: any;
  loading?: boolean;
  walletFilter: WalletFilterType;
  setWalletFilter: (val: WalletFilterType) => void;
  walletCounts: {
    all: number;
    main: number;
    vendor: number;
    productLevel: number;
  };
}

const isVendorWithdrawal = (tx: any): boolean => {
  const type = String(tx.transaction_type || '').toLowerCase();
  const desc = String(tx.description || '').toLowerCase();
  return type.includes('vendor') || desc.includes('vendor');
};

const isProductLevelWithdrawal = (tx: any): boolean => {
  const type = String(tx.transaction_type || '').toLowerCase();
  const desc = String(tx.description || '').toLowerCase();
  return type.includes('product level') || desc.includes('product level');
};

const isMainWalletWithdrawal = (tx: any): boolean => {
  return !isVendorWithdrawal(tx) && !isProductLevelWithdrawal(tx);
};

const Payout = () => {
  const location = useLocation();
  const [value, setValue] = useState(0);

  // Initialize wallet filter from query params if passed (e.g., ?wallet=VENDOR)
  const initialWalletFilter: WalletFilterType = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const w = (params.get('wallet') || '').toUpperCase();
    if (w === 'MAIN') return 'MAIN';
    if (w === 'VENDOR' || w === 'SALE') return 'VENDOR';
    if (w === 'PRODUCT_LEVEL' || w === 'PRODUCTLEVEL') return 'PRODUCT_LEVEL';
    return 'ALL';
  }, [location.search]);

  const [walletFilter, setWalletFilter] = useState<WalletFilterType>(initialWalletFilter);

  const handleChange = (_e: any, newValue: any) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#FFFFFF', minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#0F172A', fontWeight: 900, letterSpacing: '-0.5px' }}>
          Withdrawal Requests & Payouts
        </Typography>
       
      </Box>

      <Card sx={{ bgcolor: '#FFFFFF', borderRadius: '20px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box className="tabs-list">
            <Tabs
              value={value}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: '1px solid #E2E8F0',
                mb: 3,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: '#64748B',
                  '&.Mui-selected': {
                    color: '#FE8001'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#FE8001',
                  height: 3
                }
              }}
            >
              <Tab label="Pending Withdrawal Requests" />
              <Tab label="Processed Withdrawals" />
            </Tabs>
            <Box className="tab-content">
              {value === 0 ? (
                <Requests
                  tabTitle="Pending Withdrawal Requests"
                  walletFilter={walletFilter}
                  setWalletFilter={setWalletFilter}
                />
              ) : (
                <Proccessed
                  tabTitle="Processed Withdrawals"
                  walletFilter={walletFilter}
                  setWalletFilter={setWalletFilter}
                />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Payout;

const PayoutTable = ({
  data,
  columns,
  tabTitle,
  loading,
  walletFilter,
  setWalletFilter,
  walletCounts
}: PayoutTableProps) => {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    let result = data;

    // Filter by selected wallet
    if (walletFilter === 'MAIN') {
      result = result.filter(isMainWalletWithdrawal);
    } else if (walletFilter === 'VENDOR') {
      result = result.filter(isVendorWithdrawal);
    } else if (walletFilter === 'PRODUCT_LEVEL') {
      result = result.filter(isProductLevelWithdrawal);
    }

    // Filter by search string
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row: any) => {
        return (
          String(row.member_id || '').toLowerCase().includes(q) ||
          String(row.transaction_id || '').toLowerCase().includes(q) ||
          String(row.memberDetails?.mobileno || '').toLowerCase().includes(q) ||
          String(row.memberDetails?.account_number || '').toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [data, walletFilter, search]);

  return (
    <>
      {/* Wallet Filter Buttons Row */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', mb: 1.2 }}>
          Filter By Dedicated Wallet:
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
          <Chip
            icon={<AppsIcon style={{ fontSize: 18, color: walletFilter === 'ALL' ? '#FFFFFF' : '#64748B' }} />}
            label={`All Wallets (${walletCounts.all})`}
            clickable
            onClick={() => setWalletFilter('ALL')}
            sx={{
              fontWeight: 800,
              fontSize: '0.85rem',
              p: 1.5,
              borderRadius: '12px',
              bgcolor: walletFilter === 'ALL' ? '#0F172A' : '#F1F5F9',
              color: walletFilter === 'ALL' ? '#FFFFFF' : '#0F172A',
              border: walletFilter === 'ALL' ? '1.5px solid #0F172A' : '1.5px solid #E2E8F0',
              '&:hover': { bgcolor: walletFilter === 'ALL' ? '#1E293B' : '#E2E8F0' }
            }}
          />

          <Chip
            icon={<AccountBalanceWalletIcon style={{ fontSize: 18, color: walletFilter === 'MAIN' ? '#FFFFFF' : '#10B981' }} />}
            label={`First / Deposit Wallet (${walletCounts.main})`}
            clickable
            onClick={() => setWalletFilter('MAIN')}
            sx={{
              fontWeight: 800,
              fontSize: '0.85rem',
              p: 1.5,
              borderRadius: '12px',
              bgcolor: walletFilter === 'MAIN' ? '#10B981' : '#ECFDF5',
              color: walletFilter === 'MAIN' ? '#FFFFFF' : '#065F46',
              border: walletFilter === 'MAIN' ? '1.5px solid #10B981' : '1.5px solid #A7F3D0',
              '&:hover': { bgcolor: walletFilter === 'MAIN' ? '#059669' : '#D1FAE5' }
            }}
          />

          <Chip
            icon={<StorefrontIcon style={{ fontSize: 18, color: walletFilter === 'VENDOR' ? '#FFFFFF' : '#FE8001' }} />}
            label={`Sale Value Wallet (${walletCounts.vendor})`}
            clickable
            onClick={() => setWalletFilter('VENDOR')}
            sx={{
              fontWeight: 800,
              fontSize: '0.85rem',
              p: 1.5,
              borderRadius: '12px',
              bgcolor: walletFilter === 'VENDOR' ? '#FE8001' : '#FFF7ED',
              color: walletFilter === 'VENDOR' ? '#FFFFFF' : '#C2410C',
              border: walletFilter === 'VENDOR' ? '1.5px solid #FE8001' : '1.5px solid #FFEDD5',
              '&:hover': { bgcolor: walletFilter === 'VENDOR' ? '#EA580C' : '#FED7AA' }
            }}
          />

          <Chip
            icon={<Inventory2Icon style={{ fontSize: 18, color: walletFilter === 'PRODUCT_LEVEL' ? '#FFFFFF' : '#0284C7' }} />}
            label={`Product Level Wallet (${walletCounts.productLevel})`}
            clickable
            onClick={() => setWalletFilter('PRODUCT_LEVEL')}
            sx={{
              fontWeight: 800,
              fontSize: '0.85rem',
              p: 1.5,
              borderRadius: '12px',
              bgcolor: walletFilter === 'PRODUCT_LEVEL' ? '#0284C7' : '#F0F9FF',
              color: walletFilter === 'PRODUCT_LEVEL' ? '#FFFFFF' : '#0369A1',
              border: walletFilter === 'PRODUCT_LEVEL' ? '1.5px solid #0284C7' : '1.5px solid #BAE6FD',
              '&:hover': { bgcolor: walletFilter === 'PRODUCT_LEVEL' ? '#0369A1' : '#E0F2FE' }
            }}
          />
        </Stack>
      </Box>

      {/* Header & Search */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: 'column', sm: 'row' },
          gap: "1rem",
          justifyContent: "space-between",
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 2,
        }}
      >
        <Typography sx={{ color: "#0F172A", fontWeight: 800, fontSize: "1.1rem" }}>
          {tabTitle} {walletFilter !== 'ALL' && (
            <span style={{ color: '#FE8001', fontSize: '0.95rem' }}>
              • {walletFilter === 'MAIN' ? 'First / Deposit Wallet' : walletFilter === 'VENDOR' ? 'Sale Value Wallet' : 'Product Level Wallet'} ({filteredData.length})
            </span>
          )}
        </Typography>

        <TextField
          size="small"
          placeholder="Search by vendor, mobile, A/C..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 260, bgcolor: '#FFFFFF' }}
        />
      </Box>

      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        customStyles={DASHBOARD_CUTSOM_STYLE}
        paginationPerPage={25}
        progressPending={loading}
        paginationComponentOptions={{ noRowsPerPage: true }}
        highlightOnHover
        noDataComponent={<div style={{ padding: '2rem', color: '#64748B', fontWeight: 600 }}>No withdrawal requests found for this wallet.</div>}
      />
    </>
  );
};

export const Requests = ({
  tabTitle,
  walletFilter,
  setWalletFilter
}: {
  tabTitle: any;
  walletFilter: WalletFilterType;
  setWalletFilter: (val: WalletFilterType) => void;
}) => {
  const { data: pending = [], isFetching } = useGetPendingWithdrawals();
  const { mutate: approveTransaction, isPending } = useApproveWithdrawal();

  // Filter only withdrawal requests
  const withdrawalRequests = useMemo(() => {
    return (pending || []).filter((transaction: any) => {
      const transactionType = String(transaction.transaction_type || '').toLowerCase();
      const description = String(transaction.description || '').toLowerCase();

      return (
        transactionType.includes('withdrawal') ||
        description.includes('withdrawal request') ||
        description.includes('withdrawal')
      );
    });
  }, [pending]);

  const walletCounts = useMemo(() => {
    let main = 0;
    let vendor = 0;
    let productLevel = 0;

    withdrawalRequests.forEach((tx: any) => {
      if (isProductLevelWithdrawal(tx)) {
        productLevel++;
      } else if (isVendorWithdrawal(tx)) {
        vendor++;
      } else {
        main++;
      }
    });

    return {
      all: withdrawalRequests.length,
      main,
      vendor,
      productLevel
    };
  }, [withdrawalRequests]);

  return (
    <PayoutTable
      data={withdrawalRequests}
      columns={getRequestColumns(approveTransaction)}
      tabTitle={tabTitle}
      loading={isFetching || isPending}
      walletFilter={walletFilter}
      setWalletFilter={setWalletFilter}
      walletCounts={walletCounts}
    />
  );
};

export const Proccessed = ({
  tabTitle,
  walletFilter,
  setWalletFilter
}: {
  tabTitle: any;
  walletFilter: WalletFilterType;
  setWalletFilter: (val: WalletFilterType) => void;
}) => {
  const { data: Approved = [], isFetching } = useGetApprovedWithdrawals();

  // Filter only processed withdrawals
  const filteredData = useMemo(() => {
    return (Approved || []).filter((transaction: any) => {
      const description = String(transaction.description || '').toLowerCase();
      const transactionType = String(transaction.transaction_type || '').toLowerCase();

      const isWithdrawal = (
        transactionType.includes('withdrawal') ||
        description.includes('withdrawal request') ||
        description.includes('withdrawal')
      );

      const isLevelBenefits = description.includes('level benefit') ||
        description.includes('level benefits') ||
        transactionType.includes('level benefit') ||
        transactionType.includes('level benefits');

      const isDirectBenefits = description.includes('direct benefit') ||
        description.includes('direct benefits') ||
        transactionType.includes('direct benefit') ||
        transactionType.includes('direct benefits');

      return isWithdrawal && !isLevelBenefits && !isDirectBenefits;
    });
  }, [Approved]);

  const walletCounts = useMemo(() => {
    let main = 0;
    let vendor = 0;
    let productLevel = 0;

    filteredData.forEach((tx: any) => {
      if (isProductLevelWithdrawal(tx)) {
        productLevel++;
      } else if (isVendorWithdrawal(tx)) {
        vendor++;
      } else {
        main++;
      }
    });

    return {
      all: filteredData.length,
      main,
      vendor,
      productLevel
    };
  }, [filteredData]);

  return (
    <PayoutTable
      data={filteredData}
      columns={getProccessedColumns()}
      tabTitle={tabTitle}
      loading={isFetching}
      walletFilter={walletFilter}
      setWalletFilter={setWalletFilter}
      walletCounts={walletCounts}
    />
  );
};

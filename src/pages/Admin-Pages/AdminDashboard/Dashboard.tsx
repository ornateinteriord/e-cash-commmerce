import { Grid, Typography, Box, Paper, Avatar, CircularProgress, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import '../../Dashboard/dashboard.scss';
import DashboardTable from '../../Dashboard/DashboardTable';
import { getAdminDashboardTableColumns } from '../../../utils/DataTableColumnsProvider';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HistoryIcon from '@mui/icons-material/History';
import PaymentsIcon from '@mui/icons-material/Payments';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StorefrontIcon from '@mui/icons-material/Storefront';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useGetAllMembersDetails, useGetROISummary, useGetLevelRoiSchedules } from '../../../api/Admin';
import { useGetPendingWithdrawals, useGetApprovedWithdrawals } from '../../../api/Memeber';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: members = [], isLoading: membersLoading, error: membersError } = useGetAllMembersDetails();
  const { data: roiSummary, isLoading: roiLoading } = useGetROISummary();
  const { data: levelRoiSchedules = [] } = useGetLevelRoiSchedules();
  const { data: pendingWithdrawals = [] } = useGetPendingWithdrawals();
  const { data: approvedWithdrawals = [] } = useGetApprovedWithdrawals();

  const activeSchedulesCount = Array.isArray(levelRoiSchedules)
    ? levelRoiSchedules.filter((s: any) => s.status === 'Active').length
    : 0;

  const isLoading = membersLoading || roiLoading;
  const error = membersError;

  const sortedMembers = [...members].sort((a, b) => {
    return new Date(b.createdAt || b.Date_of_joining).getTime() -
      new Date(a.createdAt || a.Date_of_joining).getTime();
  });

  const totalMembers = members.length;
  const activeMembers = members.filter((member: any) =>
    member.status?.toLowerCase() === 'active'
  ).length;

  const pendingMembers = members.filter((member: any) =>
    member.status?.toLowerCase() === 'pending'
  ).length;

  // Wallet 1: First / Deposit Wallet calculations across members & withdrawals
  const totalDepositWalletBalance = members.reduce((acc: number, m: any) => acc + (parseFloat(m.wallet_balance) || 0), 0);
  const pendingMainWithdrawals = (pendingWithdrawals || []).filter((tx: any) => {
    const type = String(tx.transaction_type || '').toLowerCase();
    const desc = String(tx.description || '').toLowerCase();
    return !type.includes('vendor') && !desc.includes('vendor') && !type.includes('product level') && !desc.includes('product level');
  });
  const pendingMainAmount = pendingMainWithdrawals.reduce((acc: number, tx: any) => acc + (parseFloat(tx.ew_debit) || parseFloat(tx.gross_amount) || 0), 0);

  // Wallet 2: Sale Value Wallet calculations
  const totalVendorWalletBalance = members.reduce((acc: number, m: any) => acc + (parseFloat(m.vendor_wallet) || 0), 0);
  const pendingVendorWithdrawals = (pendingWithdrawals || []).filter((tx: any) => {
    const type = String(tx.transaction_type || '').toLowerCase();
    const desc = String(tx.description || '').toLowerCase();
    return type.includes('vendor') || desc.includes('vendor');
  });
  const pendingVendorAmount = pendingVendorWithdrawals.reduce((acc: number, tx: any) => acc + (parseFloat(tx.vw_debit) || parseFloat(tx.gross_amount) || 0), 0);

  // Wallet 3: Product Level Wallet calculations
  const pendingProductLevelWithdrawals = (pendingWithdrawals || []).filter((tx: any) => {
    const type = String(tx.transaction_type || '').toLowerCase();
    const desc = String(tx.description || '').toLowerCase();
    return type.includes('product level') || desc.includes('product level');
  });
  const pendingProductLevelAmount = pendingProductLevelWithdrawals.reduce((acc: number, tx: any) => acc + (parseFloat(tx.gross_amount) || parseFloat(tx.ew_debit) || 0), 0);

  // Approved totals by wallet
  const completedVendorAmount = (approvedWithdrawals || []).filter((tx: any) => {
    const type = String(tx.transaction_type || '').toLowerCase();
    const desc = String(tx.description || '').toLowerCase();
    return type.includes('vendor') || desc.includes('vendor');
  }).reduce((acc: number, tx: any) => acc + (parseFloat(tx.vw_debit) || parseFloat(tx.net_amount) || parseFloat(tx.gross_amount) || 0), 0);

  const completedProductLevelAmount = (approvedWithdrawals || []).filter((tx: any) => {
    const type = String(tx.transaction_type || '').toLowerCase();
    const desc = String(tx.description || '').toLowerCase();
    return type.includes('product level') || desc.includes('product level');
  }).reduce((acc: number, tx: any) => acc + (parseFloat(tx.net_amount) || parseFloat(tx.gross_amount) || parseFloat(tx.ew_debit) || 0), 0);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '64vh', bgcolor: '#FFFFFF' }}>
        <CircularProgress sx={{ color: '#FE8001' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '64vh', bgcolor: '#FFFFFF', p: 3 }}>
        <Typography color="error" sx={{ fontWeight: 700 }}>
          Error loading dashboard data: {error.message}
        </Typography>
      </Box>
    );
  }

  const StatCard = ({ title, amount, subTitle, icon, onClick, color }: any) => (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.8,
        borderRadius: '22px',
        bgcolor: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: onClick ? 'translateY(-3px)' : 'none',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
          border: `1.5px solid ${color || '#FE8001'}`
        },
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ 
          width: 48, 
          height: 48, 
          borderRadius: '16px', 
          bgcolor: color ? `${color}15` : 'rgba(254, 128, 1, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color || '#FE8001'
        }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.8, fontSize: '0.78rem' }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ color: '#0F172A', fontWeight: 900, mb: 0.8, fontSize: { xs: '1.5rem', md: '1.85rem' } }}>
        {amount}
      </Typography>
      {subTitle && (
        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
          {subTitle}
        </Typography>
      )}
    </Paper>
  );

  return (
    <Box sx={{
      pb: 6,
      background: '#FFFFFF',
      minHeight: '100vh',
      px: { xs: 2.5, md: 5, lg: 8, xl: 12 },
      pt: { xs: 2, md: 4 },
      maxWidth: '1800px',
      margin: '0 auto'
    }}>
      {/* Header Section */}
      <Paper elevation={0} sx={{
        mb: 4,
        p: { xs: 2.5, md: 3.5 },
        borderRadius: '24px',
        bgcolor: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: 3
      }}>
        {/* Welcome Text */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar
            sx={{
              width: { xs: 58, md: 68 },
              height: { xs: 58, md: 68 },
              bgcolor: 'rgba(254, 128, 1, 0.12)',
              border: '2px solid rgba(254, 128, 1, 0.35)',
            }}
          >
            <AdminPanelSettingsIcon sx={{ fontSize: { xs: 32, md: 38 }, color: '#FE8001' }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ color: '#0F172A', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1.2, mb: 0.5, fontSize: { xs: '1.35rem', md: '1.75rem' } }}>
              Admin Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
              Complete network oversight and 3-Wallet payout separation
            </Typography>
          </Box>
        </Box>

        {/* Quick Stats in Header */}
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 2.5, md: 4.5 }, 
          alignItems: 'center',
          alignSelf: { xs: 'stretch', md: 'auto' },
          justifyContent: { xs: 'space-between', md: 'center' },
          bgcolor: '#F8FAFC',
          p: { xs: 1.5, md: 2 },
          borderRadius: '18px',
          border: '1px solid #E2E8F0'
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#0F172A', fontWeight: 900, lineHeight: 1 }}>{totalMembers}</Typography>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: '#64748B', fontWeight: 700, mt: 0.5 }}>
              <PeopleIcon sx={{ fontSize: 14 }} /> Total
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 900, lineHeight: 1 }}>{activeMembers}</Typography>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: '#64748B', fontWeight: 700, mt: 0.5 }}>
              <PersonAddIcon sx={{ fontSize: 14 }} /> Active
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#f59e0b', fontWeight: 900, lineHeight: 1 }}>{pendingMembers}</Typography>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: '#64748B', fontWeight: 700, mt: 0.5 }}>
              <HistoryIcon sx={{ fontSize: 14 }} /> Pending
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#FE8001', fontWeight: 900, lineHeight: 1 }}>₹{(roiSummary?.totalROIDistributed || 0).toLocaleString()}</Typography>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: '#64748B', fontWeight: 700, mt: 0.5 }}>
              <PaymentsIcon sx={{ fontSize: 14 }} /> Incentive
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* 3-WALLET DEDICATED ADMIN SECTION */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '0.8px', fontSize: '0.95rem' }}>
              3-WALLET PLATFORM MANAGEMENT
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              Separate oversight, live pool balances, and independent withdrawal request queues
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate('/admin/payout')}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderColor: '#FE8001',
              color: '#FE8001',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: '12px',
              '&:hover': { borderColor: '#E07100', bgcolor: 'rgba(254, 128, 1, 0.05)' }
            }}
          >
            All Payout Requests
          </Button>
        </Box>

        <Grid container spacing={2.5}>
          {/* Card 1: Deposit / First Wallet */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '24px',
                bgcolor: '#FFFFFF',
                border: '1.5px solid #A7F3D0',
                boxShadow: '0 4px 18px rgba(16, 185, 129, 0.08)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '16px', bgcolor: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 26 }} />
                </Box>
                <Chip
                  label="Wallet 1: Deposits"
                  size="small"
                  sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 800, fontSize: '0.72rem', borderRadius: '8px' }}
                />
              </Box>

              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5, fontSize: '0.78rem' }}>
                First / Deposit Wallet
              </Typography>
              <Typography variant="h4" sx={{ color: '#0F172A', fontWeight: 900, mb: 1, fontSize: '1.75rem' }}>
                ₹{totalDepositWalletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', mb: 2 }}>
                Live user funds for package activation & deposits
              </Typography>

              <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Pending Requests:</Typography>
                  <Typography variant="caption" sx={{ color: pendingMainWithdrawals.length > 0 ? '#DC2626' : '#10B981', fontWeight: 900 }}>
                    {pendingMainWithdrawals.length} request(s)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Pending Amount:</Typography>
                  <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 900 }}>
                    ₹{pendingMainAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate('/admin/payout?wallet=MAIN')}
                sx={{
                  bgcolor: '#10B981',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  borderRadius: '12px',
                  textTransform: 'none',
                  py: 1,
                  '&:hover': { bgcolor: '#059669' }
                }}
              >
                Manage Deposit Withdrawals ({pendingMainWithdrawals.length})
              </Button>
            </Paper>
          </Grid>

          {/* Card 2: Sale Value Wallet */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '24px',
                bgcolor: '#FFFFFF',
                border: '1.5px solid #FFEDD5',
                boxShadow: '0 4px 18px rgba(254, 128, 1, 0.08)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '16px', bgcolor: 'rgba(254, 128, 1, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FE8001' }}>
                  <StorefrontIcon sx={{ fontSize: 26 }} />
                </Box>
                <Chip
                  label="Wallet 2: Vendor Earnings"
                  size="small"
                  sx={{ bgcolor: '#FFF7ED', color: '#C2410C', fontWeight: 800, fontSize: '0.72rem', borderRadius: '8px' }}
                />
              </Box>

              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5, fontSize: '0.78rem' }}>
                Sale Value Wallet
              </Typography>
              <Typography variant="h4" sx={{ color: '#0F172A', fontWeight: 900, mb: 1, fontSize: '1.75rem' }}>
                ₹{totalVendorWalletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', mb: 2 }}>
                Vendor incentives, ROI, referral & daily income
              </Typography>

              <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Pending Requests:</Typography>
                  <Typography variant="caption" sx={{ color: pendingVendorWithdrawals.length > 0 ? '#DC2626' : '#10B981', fontWeight: 900 }}>
                    {pendingVendorWithdrawals.length} request(s)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Pending Amount:</Typography>
                  <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 900 }}>
                    ₹{pendingVendorAmount.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Total Paid Payouts:</Typography>
                  <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 900 }}>
                    ₹{completedVendorAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate('/admin/payout?wallet=VENDOR')}
                sx={{
                  bgcolor: '#FE8001',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  borderRadius: '12px',
                  textTransform: 'none',
                  py: 1,
                  '&:hover': { bgcolor: '#EA580C' }
                }}
              >
                Manage Sale Value Payouts ({pendingVendorWithdrawals.length})
              </Button>
            </Paper>
          </Grid>

          {/* Card 3: Product Level Wallet */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '24px',
                bgcolor: '#FFFFFF',
                border: '1.5px solid #BAE6FD',
                boxShadow: '0 4px 18px rgba(2, 132, 199, 0.08)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '16px', bgcolor: 'rgba(2, 132, 199, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7' }}>
                  <Inventory2Icon sx={{ fontSize: 26 }} />
                </Box>
                <Chip
                  label="Wallet 3: Level Commissions"
                  size="small"
                  sx={{ bgcolor: '#F0F9FF', color: '#0369A1', fontWeight: 800, fontSize: '0.72rem', borderRadius: '8px' }}
                />
              </Box>

              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5, fontSize: '0.78rem' }}>
                Product Level Wallet
              </Typography>
              <Typography variant="h4" sx={{ color: '#0F172A', fontWeight: 900, mb: 1, fontSize: '1.75rem' }}>
                ₹{((roiSummary?.totalROIDistributed || 0) * 0.45).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', mb: 2 }}>
                Dedicated multi-tier product level MLM bonus pool
              </Typography>

              <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Pending Requests:</Typography>
                  <Typography variant="caption" sx={{ color: pendingProductLevelWithdrawals.length > 0 ? '#DC2626' : '#10B981', fontWeight: 900 }}>
                    {pendingProductLevelWithdrawals.length} request(s)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Pending Amount:</Typography>
                  <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 900 }}>
                    ₹{pendingProductLevelAmount.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Total Paid Payouts:</Typography>
                  <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 900 }}>
                    ₹{completedProductLevelAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate('/admin/payout?wallet=PRODUCT_LEVEL')}
                sx={{
                  bgcolor: '#0284C7',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  borderRadius: '12px',
                  textTransform: 'none',
                  py: 1,
                  '&:hover': { bgcolor: '#0369A1' }
                }}
              >
                Manage Product Level Payouts ({pendingProductLevelWithdrawals.length})
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Main Stats Grid */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A', mb: 2, letterSpacing: '0.8px', fontSize: '0.92rem' }}>
          PLATFORM OVERVIEW
        </Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              amount={totalMembers}
              title="Total Vendors"
              subTitle={`${totalMembers} vendors in total`}
              icon={<PeopleIcon />}
              color="#FE8001"
              onClick={() => navigate('/admin/members')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              amount={activeMembers}
              title="Active Vendors"
              subTitle={`${activeMembers} active vendors`}
              icon={<PersonAddIcon />}
              color="#10b981"
              onClick={() => navigate('/admin/members/active')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              amount={pendingMembers}
              title="Pending Vendors"
              subTitle={`${pendingMembers} pending activation`}
              icon={<HistoryIcon />}
              color="#f59e0b"
              onClick={() => navigate('/admin/members/pending')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              amount={`₹${(roiSummary?.totalROIDistributed || 0).toLocaleString()}`}
              title="Daily Incentive"
              subTitle={`Today: ₹${(roiSummary?.todaysTotal || 0).toLocaleString()} (${roiSummary?.todaysCount || 0} payouts)`}
              icon={<PaymentsIcon />}
              color="#0284C7"
              onClick={() => navigate('/admin/income/daily-payouts')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              amount={activeSchedulesCount}
              title="Level Daily ROI"
              subTitle={`${activeSchedulesCount} Active 50-Day Schedules`}
              icon={<TrendingUpIcon />}
              color="#6366f1"
              onClick={() => navigate('/admin/income/level-daily-roi')}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Member Statistics Table */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A', mb: 2, letterSpacing: '0.8px', fontSize: '0.92rem' }}>
          VENDOR STATISTICS ({sortedMembers.length} VENDORS)
        </Typography>
        <Paper elevation={0} sx={{ 
          p: { xs: 1.5, sm: 2.5 }, 
          borderRadius: '24px', 
          bgcolor: '#FFFFFF', 
          border: '1.5px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}>
          <Box sx={{ width: '100%', overflowX: 'auto', bgcolor: '#FFFFFF', borderRadius: '16px' }}>
            <DashboardTable
              data={sortedMembers}
              columns={getAdminDashboardTableColumns()}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminDashboard;

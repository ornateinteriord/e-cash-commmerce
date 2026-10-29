import { Grid, Typography, Box, Paper, Avatar, CircularProgress } from '@mui/material';
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
import { useGetAllMembersDetails, useGetROISummary, useGetLevelRoiSchedules } from '../../../api/Admin';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: members = [], isLoading: membersLoading, error: membersError } = useGetAllMembersDetails();
  const { data: roiSummary, isLoading: roiLoading } = useGetROISummary();
  const { data: levelRoiSchedules = [] } = useGetLevelRoiSchedules();

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
              Manage your network and track your success
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

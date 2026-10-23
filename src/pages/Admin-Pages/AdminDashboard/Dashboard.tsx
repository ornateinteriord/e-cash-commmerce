import { Grid, Typography, Box, Paper, Avatar } from '@mui/material';
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '64vh' }}>
        <Typography sx={{ color: 'white' }}>Loading dashboard data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '64vh' }}>
        <Typography color="error">
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
        p: 3,
        borderRadius: '24px',
        bgcolor: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: onClick ? 'translateY(-4px)' : 'none',
          bgcolor: 'rgba(255, 255, 255, 0.06)',
          border: `1px solid ${color || 'rgba(255, 255, 255, 0.15)'}`
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
          bgcolor: 'rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color || '#FFD700'
        }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ color: 'white', fontWeight: 800, mb: 1 }}>
        {amount}
      </Typography>
      {subTitle && (
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
          {subTitle}
        </Typography>
      )}
    </Paper>
  );

  return (
    <Box sx={{
      pb: 6,
      background: 'linear-gradient(180deg, #050916 0%, #0f1e36 100%)',
      minHeight: '100vh',
      px: { xs: 2.5, md: 5, lg: 10, xl: 16 },
      pt: { xs: 1.5, md: 4 },
      maxWidth: '1800px',
      margin: '0 auto'
    }}>
      {/* Header Section */}
      <Paper elevation={0} sx={{
        mb: 4,
        p: { xs: 3, md: 4 },
        borderRadius: '28px',
        bgcolor: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
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
              width: { xs: 62, md: 80 },
              height: { xs: 62, md: 80 },
              bgcolor: 'rgba(255,255,255,0.06)',
              border: '2px solid rgba(255,255,255,0.1)',
            }}
          >
            <AdminPanelSettingsIcon sx={{ fontSize: { xs: 36, md: 46 }, color: '#FFD700' }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1.2, mb: 0.5, fontSize: { xs: '1.4rem', md: '1.8rem' } }}>
              Admin Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              Manage your network and track your success
            </Typography>
          </Box>
        </Box>

        {/* Quick Stats in Header */}
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 3, md: 5 }, 
          alignItems: 'center',
          alignSelf: { xs: 'stretch', md: 'auto' },
          justifyContent: { xs: 'space-between', md: 'center' }
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 900, lineHeight: 1 }}>{totalMembers}</Typography>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>
              <PeopleIcon sx={{ fontSize: 14 }} /> Total
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 900, lineHeight: 1 }}>{activeMembers}</Typography>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>
              <PersonAddIcon sx={{ fontSize: 14 }} /> Active
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#f59e0b', fontWeight: 900, lineHeight: 1 }}>{pendingMembers}</Typography>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>
              <HistoryIcon sx={{ fontSize: 14 }} /> Pending
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#FFD700', fontWeight: 900, lineHeight: 1 }}>₹{(roiSummary?.totalROIDistributed || 0).toLocaleString()}</Typography>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>
              <PaymentsIcon sx={{ fontSize: 14 }} /> Incentive
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Main Stats Grid */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'white', mb: 2, letterSpacing: '1px' }}>
          PLATFORM OVERVIEW
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              amount={totalMembers}
              title="Total Vendors"
              subTitle={`${totalMembers} vendors in total`}
              icon={<PeopleIcon />}
              color="#FFD700"
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
              color="#FFD700"
              onClick={() => navigate('/admin/income/daily-payouts')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              amount={activeSchedulesCount}
              title="Level Daily ROI"
              subTitle={`${activeSchedulesCount} Active 50-Day Schedules`}
              icon={<TrendingUpIcon />}
              color="#818cf8"
              onClick={() => navigate('/admin/income/level-daily-roi')}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Member Statistics Table */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'white', mb: 2, letterSpacing: '1px' }}>
          VENDOR STATISTICS ({sortedMembers.length} VENDORS)
        </Typography>
        <Paper elevation={0} sx={{ 
          p: 3, 
          borderRadius: '28px', 
          bgcolor: 'rgba(255, 255, 255, 0.04)', 
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}>
          <Box sx={{ width: '100%', overflowX: 'auto', bgcolor: 'white', borderRadius: '16px', p: 1 }}>
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

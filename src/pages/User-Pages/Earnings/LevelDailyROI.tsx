import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  LinearProgress,
  Paper,
  Pagination,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DataTable from 'react-data-table-component';
import { DASHBOARD_CUTSOM_STYLE, extractTransactionAmount } from '../../../utils/DataTableColumnsProvider';
import { getFormattedDate } from '../../../utils/common';
import { useGetTransactionDetails, useGetMemberLevelRoiSchedules } from '../../../api/Memeber';

const getLevelBadgeStyles = (level: number) => {
  switch (level) {
    case 1:
      return { bgcolor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' };
    case 2:
      return { bgcolor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' };
    case 3:
      return { bgcolor: '#ede9fe', color: '#6d28d9', border: '1px solid #ddd6fe' };
    case 4:
      return { bgcolor: '#fce7f3', color: '#be185d', border: '1px solid #fbcfe8' };
    case 5:
      return { bgcolor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' };
    case 6:
      return { bgcolor: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3' };
    case 7:
    default:
      return { bgcolor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' };
  }
};

const LevelDailyROI = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'transactions' | 'schedules'>('transactions');
  const [mobilePage, setMobilePage] = useState(1);
  const mobilePageSize = 10;

  const memberId = localStorage.getItem('memberId') || '';

  const { data: transactionsData, isLoading: isTxLoading, isError: isTxError } = useGetTransactionDetails();
  const { data: schedulesData, isLoading: isSchLoading, isError: isSchError } = useGetMemberLevelRoiSchedules(memberId);

  const transactions = Array.isArray(transactionsData?.data)
    ? transactionsData.data
    : Array.isArray(transactionsData)
    ? transactionsData
    : [];

  // Filter for Level Daily ROI transactions
  const levelRoiTxs: any[] = transactions.filter((tx: any) => {
    if (!tx || typeof tx !== 'object') return false;
    const txType = (tx.transaction_type || '').toLowerCase();
    const desc = (tx.description || '').toLowerCase();
    return txType === 'level daily roi' || desc.includes('level daily roi') || tx.benefit_type === 'Level ROI';
  });

  const schedules: any[] = Array.isArray(schedulesData) ? schedulesData : [];

  // Totals
  const totalEarned = levelRoiTxs.reduce(
    (sum, t) => sum + extractTransactionAmount(t),
    0
  );

  const activeSchedules = schedules.filter((s: any) => s.status === 'Active');
  const todayDailyIncome = activeSchedules.reduce(
    (sum, s) => sum + parseFloat(s.daily_amount || 0),
    0
  );

  // Filtered transactions
  const filteredTxs = levelRoiTxs.filter((tx: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (tx.description && tx.description.toLowerCase().includes(q)) ||
      (tx.related_member_id && tx.related_member_id.toLowerCase().includes(q)) ||
      (tx.level && tx.level.toString().includes(q)) ||
      (tx.transaction_id && tx.transaction_id.toLowerCase().includes(q))
    );
  });

  // Filtered schedules
  const filteredSchedules = schedules.filter((s: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.from_member_id && s.from_member_id.toLowerCase().includes(q)) ||
      (s.from_member_name && s.from_member_name.toLowerCase().includes(q)) ||
      (s.level && s.level.toString().includes(q))
    );
  });

  // Pagination for mobile card view
  const currentMobileList = viewMode === 'transactions' ? filteredTxs : filteredSchedules;
  const totalMobilePages = Math.max(1, Math.ceil(currentMobileList.length / mobilePageSize));
  const paginatedMobileList = currentMobileList.slice(
    (mobilePage - 1) * mobilePageSize,
    mobilePage * mobilePageSize
  );

  const transactionColumns = [
    {
      name: 'Date',
      selector: (row: any) => getFormattedDate(row.transaction_date || row.createdAt),
      sortable: true,
      width: '120px',
    },
    {
      name: 'Level',
      cell: (row: any) => (
        <Chip
          label={`Level ${row.level || 1}`}
          size="small"
          sx={{
            fontWeight: 800,
            ...getLevelBadgeStyles(row.level || 1),
          }}
        />
      ),
      sortable: true,
      width: '110px',
    },
    {
      name: 'From Member',
      selector: (row: any) => row.related_member_id || '-',
      sortable: true,
      width: '140px',
    },
    {
      name: 'Description',
      selector: (row: any) => row.description || '-',
      sortable: true,
      grow: 2,
    },
    {
      name: 'Amount (₹)',
      selector: (row: any) => extractTransactionAmount(row),
      cell: (row: any) => (
        <Typography sx={{ fontWeight: 800, color: '#059669' }}>
          +₹{extractTransactionAmount(row).toFixed(2)}
        </Typography>
      ),
      sortable: true,
      width: '130px',
    },
    {
      name: 'Status',
      cell: (row: any) => (
        <Chip
          label={row.status || 'Completed'}
          size="small"
          color="success"
          variant="outlined"
          sx={{ fontWeight: 700 }}
        />
      ),
      width: '110px',
    },
  ];

  const scheduleColumns = [
    {
      name: 'Tier / Level',
      cell: (row: any) => (
        <Chip
          label={`Level ${row.level} (${row.total_percentage}%)`}
          size="small"
          sx={{ fontWeight: 800, bgcolor: '#e0e7ff', color: '#4338ca' }}
        />
      ),
      width: '130px',
      sortable: true,
    },
    {
      name: 'From Investor',
      selector: (row: any) => `${row.from_member_name || '-'} (${row.from_member_id})`,
      sortable: true,
      minWidth: '160px',
    },
    {
      name: 'Downline Package',
      selector: (row: any) => row.package_amount,
      format: (row: any) => `₹${parseFloat(row.package_amount || 0).toLocaleString()}`,
      sortable: true,
      width: '140px',
    },
    {
      name: 'Daily Earning',
      cell: (row: any) => (
        <Typography sx={{ fontWeight: 800, color: '#2563eb' }}>
          ₹{parseFloat(row.daily_amount || 0).toFixed(2)} / day
        </Typography>
      ),
      sortable: true,
      width: '130px',
    },
    {
      name: '100-Day Progress',
      cell: (row: any) => {
        const count = row.payout_count || 0;
        const target = row.target_days || 100;
        const percent = Math.min(100, Math.round((count / target) * 100));
        return (
          <Box sx={{ width: '100%', pr: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                Day {count} / {target}
              </Typography>
              <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#2563eb' }}>
                {percent}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={percent}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: '#e2e8f0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: percent >= 100 ? '#10b981' : '#3b82f6',
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        );
      },
      minWidth: '160px',
    },
    {
      name: 'Total Received / Target',
      cell: (row: any) => (
        <Box>
          <Typography sx={{ fontWeight: 800, color: '#059669', fontSize: '0.85rem' }}>
            ₹{parseFloat(row.total_paid || 0).toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: '11px', color: '#94a3b8' }}>
            of ₹{parseFloat(row.total_amount || 0).toLocaleString()}
          </Typography>
        </Box>
      ),
      sortable: true,
      width: '150px',
    },
    {
      name: 'Status',
      cell: (row: any) => (
        <Chip
          label={row.status || 'Active'}
          size="small"
          color={row.status === 'Completed' ? 'success' : 'primary'}
          sx={{ fontWeight: 800 }}
        />
      ),
      width: '110px',
    },
  ];

  if (isTxLoading || isSchLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      p: { xs: 1.5, sm: 2.5, md: 3 },
      mt: { xs: 4, md: 9 },
      maxWidth: '1600px',
      mx: 'auto',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography sx={{
          fontWeight: 900,
          color: '#1e293b',
          fontSize: { xs: '1.55rem', sm: '1.6rem', md: '1.9rem' },
          lineHeight: 1.2
        }}>
          Level Daily ROI (50 Days)
        </Typography>
        <Typography sx={{
          color: '#64748b',
          mt: 0.5,
          fontSize: { xs: '0.78rem', sm: '0.88rem' }
        }}>
          Your 50-day multi-tier daily earnings generated from your downline members' package investments
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 2.5, sm: 3 } }}>
        {/* Card 1: Total Earned */}
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{
            borderRadius: { xs: '16px', sm: '18px' },
            border: '1px solid #d1fae5',
            background: 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)',
            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.05)',
            p: { xs: 1.8, sm: 2.2 }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
              <Box sx={{
                width: { xs: 44, sm: 50 },
                height: { xs: 44, sm: 50 },
                borderRadius: '14px',
                bgcolor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(22, 163, 74, 0.12)'
              }}>
                <PaymentsIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: { xs: '0.72rem', sm: '0.78rem' }, color: '#047857', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  Total Earned
                </Typography>
                <Typography sx={{
                  fontSize: { xs: '1.2rem', sm: '1.35rem', md: '1.5rem' },
                  fontWeight: 900,
                  color: '#065f46',
                  letterSpacing: '-0.4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  ₹{totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Card 2: Active Daily Stream */}
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{
            borderRadius: { xs: '16px', sm: '18px' },
            border: '1px solid #bfdbfe',
            background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
            boxShadow: '0 2px 10px rgba(37, 99, 235, 0.05)',
            p: { xs: 1.8, sm: 2.2 }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
              <Box sx={{
                width: { xs: 44, sm: 50 },
                height: { xs: 44, sm: 50 },
                borderRadius: '14px',
                bgcolor: '#dbeafe',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.12)'
              }}>
                <TrendingUpIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: { xs: '0.72rem', sm: '0.78rem' }, color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  Active Daily Stream
                </Typography>
                <Typography sx={{
                  fontSize: { xs: '1.2rem', sm: '1.35rem', md: '1.5rem' },
                  fontWeight: 900,
                  color: '#1e40af',
                  letterSpacing: '-0.4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  ₹{todayDailyIncome.toFixed(2)} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>/ day</span>
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Card 3: Active Contracts */}
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{
            borderRadius: { xs: '16px', sm: '18px' },
            border: '1px solid #e9d5ff',
            background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
            boxShadow: '0 2px 10px rgba(147, 51, 234, 0.05)',
            p: { xs: 1.8, sm: 2.2 }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
              <Box sx={{
                width: { xs: 44, sm: 50 },
                height: { xs: 44, sm: 50 },
                borderRadius: '14px',
                bgcolor: '#f3e8ff',
                color: '#9333ea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(147, 51, 234, 0.12)'
              }}>
                <AutorenewIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: { xs: '0.72rem', sm: '0.78rem' }, color: '#7e22ce', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  Active 100-Day Contracts
                </Typography>
                <Typography sx={{
                  fontSize: { xs: '1.2rem', sm: '1.35rem', md: '1.5rem' },
                  fontWeight: 900,
                  color: '#581c87',
                  letterSpacing: '-0.4px'
                }}>
                  {activeSchedules.length}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Container */}
      <Card elevation={0} sx={{
        borderRadius: { xs: '18px', sm: '22px' },
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2.5, md: 3 } }}>
          {/* Controls Bar: Responsive Tabs + Search */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 1.5,
            mb: 2.5
          }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, val) => {
                if (val) {
                  setViewMode(val);
                  setMobilePage(1);
                }
              }}
              size="small"
              sx={{
                bgcolor: '#f1f5f9',
                p: '3px',
                borderRadius: '12px',
                width: { xs: '100%', sm: 'auto' },
                display: 'flex',
                '& .MuiToggleButton-root': {
                  flex: { xs: 1, sm: 'none' },
                  border: 'none',
                  borderRadius: '9px',
                  px: { xs: 1.2, sm: 2 },
                  py: 0.85,
                  fontWeight: 700,
                  fontSize: { xs: '0.74rem', sm: '0.82rem' },
                  textTransform: 'none',
                  color: '#64748b',
                  whiteSpace: 'nowrap',
                  '&.Mui-selected': {
                    bgcolor: '#ffffff',
                    color: '#0f172a',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  },
                },
              }}
            >
              <ToggleButton value="transactions">
                {isMobile ? `Payouts (${filteredTxs.length})` : `Daily Payout Transactions (${filteredTxs.length})`}
              </ToggleButton>
              <ToggleButton value="schedules">
                {isMobile ? `Schedules (${filteredSchedules.length})` : `My 100-Day Active Schedules (${filteredSchedules.length})`}
              </ToggleButton>
            </ToggleButtonGroup>

            <TextField
              size="small"
              placeholder={viewMode === 'transactions' ? "Search member, level, tx..." : "Search investor, level..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setMobilePage(1);
              }}
              sx={{
                width: { xs: '100%', sm: 260 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '11px',
                  bgcolor: '#ffffff',
                  fontSize: '0.85rem'
                },
              }}
            />
          </Box>

          {/* Conditional Layout: Mobile Cards vs Desktop DataTable */}
          {isMobile ? (
            /* MOBILE VIEW: Ultra-Crisp Responsive Cards */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.4 }}>
              {paginatedMobileList.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', color: '#64748b' }}>
                  {isTxError || isSchError ? 'Error loading data' : 'No Level Daily ROI records found'}
                </Box>
              ) : viewMode === 'transactions' ? (
                /* Mobile Daily Payout Transaction Cards */
                paginatedMobileList.map((tx: any, idx: number) => (
                  <Paper
                    key={tx.transaction_id || tx._id || idx}
                    elevation={0}
                    sx={{
                      p: 1.8,
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      bgcolor: '#ffffff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.2,
                    }}
                  >
                    {/* Top Row: Level & Date */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={`Level ${tx.level || 1}`}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          height: 24,
                          ...getLevelBadgeStyles(tx.level || 1),
                        }}
                      />
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                        {getFormattedDate(tx.transaction_date || tx.createdAt)}
                      </Typography>
                    </Box>

                    {/* Middle Row: Description & Amount */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.2 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.3 }}>
                          {tx.description || 'Level Daily ROI'}
                        </Typography>
                        {tx.related_member_id && (
                          <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.3 }}>
                            From: <strong style={{ color: '#0f172a' }}>{tx.related_member_id}</strong>
                          </Typography>
                        )}
                        {tx.transaction_id && (
                          <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace', mt: 0.2 }}>
                            ID: {tx.transaction_id}
                          </Typography>
                        )}
                      </Box>

                      <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#059669', whiteSpace: 'nowrap' }}>
                        +₹{extractTransactionAmount(tx).toFixed(2)}
                      </Typography>
                    </Box>

                    {/* Bottom Row: Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.8, borderTop: '1px dashed #f1f5f9' }}>
                      <Chip
                        label={tx.status || 'Completed'}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontWeight: 800, height: 22, fontSize: '0.68rem' }}
                      />
                    </Box>
                  </Paper>
                ))
              ) : (
                /* Mobile 100-Day Schedule Cards */
                paginatedMobileList.map((sch: any, idx: number) => {
                  const count = sch.payout_count || 0;
                  const target = sch.target_days || 100;
                  const percent = Math.min(100, Math.round((count / target) * 100));

                  return (
                    <Paper
                      key={sch.schedule_id || sch._id || idx}
                      elevation={0}
                      sx={{
                        p: 1.8,
                        borderRadius: '16px',
                        border: '1px solid #e0e7ff',
                        bgcolor: '#ffffff',
                        boxShadow: '0 2px 8px rgba(79, 70, 229, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.4,
                      }}
                    >
                      {/* Top Row: Level & Status */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={`Level ${sch.level} (${sch.total_percentage}%)`}
                          size="small"
                          sx={{ fontWeight: 800, bgcolor: '#e0e7ff', color: '#4338ca', fontSize: '0.74rem' }}
                        />
                        <Chip
                          label={sch.status || 'Active'}
                          size="small"
                          color={sch.status === 'Completed' ? 'success' : 'primary'}
                          sx={{ fontWeight: 800, height: 24, fontSize: '0.72rem' }}
                        />
                      </Box>

                      {/* Investor Info & Daily Amount */}
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: '#f8fafc',
                        p: 1.2,
                        borderRadius: '12px'
                      }}>
                        <Box sx={{ minWidth: 0, pr: 1 }}>
                          <Typography sx={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                            Downline Investor
                          </Typography>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {sch.from_member_name || '-'} ({sch.from_member_id})
                          </Typography>
                          <Typography sx={{ fontSize: '0.74rem', color: '#64748b', mt: 0.2 }}>
                            Package: <strong style={{ color: '#0f172a' }}>₹{parseFloat(sch.package_amount || 0).toLocaleString()}</strong>
                          </Typography>
                        </Box>

                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                          <Typography sx={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                            Daily Payout
                          </Typography>
                          <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: '#2563eb' }}>
                            ₹{parseFloat(sch.daily_amount || 0).toFixed(2)}
                          </Typography>
                          <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8' }}>/ day</Typography>
                        </Box>
                      </Box>

                      {/* Progress Bar & Contract Totals */}
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                            Day {count} of {target}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb' }}>
                            {percent}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percent}
                          sx={{
                            height: 7,
                            borderRadius: 4,
                            bgcolor: '#e2e8f0',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: percent >= 100 ? '#10b981' : '#3b82f6',
                              borderRadius: 4,
                            },
                          }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.8 }}>
                          <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                            Paid: <strong style={{ color: '#059669' }}>₹{parseFloat(sch.total_paid || 0).toLocaleString()}</strong>
                          </Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                            Target: <strong style={{ color: '#1e293b' }}>₹{parseFloat(sch.total_amount || 0).toLocaleString()}</strong>
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })
              )}

              {/* Mobile Pagination */}
              {totalMobilePages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5 }}>
                  <Pagination
                    count={totalMobilePages}
                    page={mobilePage}
                    onChange={(_, page) => setMobilePage(page)}
                    color="primary"
                    size="small"
                  />
                </Box>
              )}
            </Box>
          ) : (
            /* DESKTOP / TABLET VIEW: Full DataTable with Horizontal Overflow Support */
            <Box sx={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
              <DataTable
                columns={viewMode === 'transactions' ? transactionColumns : scheduleColumns}
                data={viewMode === 'transactions' ? filteredTxs : filteredSchedules}
                customStyles={DASHBOARD_CUTSOM_STYLE}
                pagination
                paginationPerPage={15}
                paginationRowsPerPageOptions={[10, 15, 25, 50]}
                responsive
                highlightOnHover
                noDataComponent={
                  <Box sx={{ p: 4, textAlign: 'center', color: '#64748b' }}>
                    {isTxError || isSchError ? 'Error loading data' : 'No Level Daily ROI records found'}
                  </Box>
                }
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default LevelDailyROI;

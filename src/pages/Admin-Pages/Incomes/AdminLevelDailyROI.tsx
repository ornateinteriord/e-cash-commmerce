import { useState, useMemo } from 'react';
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
} from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DataTable from 'react-data-table-component';
import { DASHBOARD_CUTSOM_STYLE, formatVendorDescription, extractTransactionAmount } from '../../../utils/DataTableColumnsProvider';
import { getFormattedDate } from '../../../utils/common';
import { useGetAllTransactionDetails, useGetLevelRoiSchedules, useGetAllMembersDetails } from '../../../api/Admin';
import { TriggerMissingROIButton } from '../../../components/Dialogs/TriggerMissingROIDialog';

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

const AdminLevelDailyROI = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'transactions' | 'schedules'>('transactions');

  const { data: allTransactions, isLoading: isTxLoading, isError: isTxError } = useGetAllTransactionDetails();
  const { data: allSchedules, isLoading: isSchLoading, isError: isSchError } = useGetLevelRoiSchedules();
  const { data: members = [] } = useGetAllMembersDetails();

  // Create lookup dictionary for real registration member_code
  const memberCodeMap = useMemo(() => {
    const map = new Map<string, string>();
    (members || []).forEach((m: any) => {
      const code = String(m.member_code || '').trim();
      if (code) {
        if (m.Member_id) map.set(String(m.Member_id).trim(), code);
        if (m.member_id) map.set(String(m.member_id).trim(), code);
        if (m.mobileno) map.set(String(m.mobileno).trim(), code);
        map.set(code, code);
      }
    });
    return map;
  }, [members]);

  // Resolves the real original member_code created at the time of registration
  const getOriginalMemberCode = (id: any, code?: any): string => {
    const codeStr = String(code || '').trim();
    if (codeStr && !/^[6-9]\d{9}$/.test(codeStr)) {
      return codeStr;
    }
    const idStr = String(id || '').trim();
    if (!idStr || idStr === '-' || idStr === 'N/A') return '-';
    // Match in all registered members
    const matched = memberCodeMap.get(idStr);
    if (matched) return matched;
    // If id itself is a 6-digit vendor code
    if (/^56\d{4}$/.test(idStr)) return idStr;
    return idStr;
  };

  // Filter transactions for Vendor Level Benefits
  const levelRoiTransactions: any[] = (allTransactions || []).filter((tx: any) => {
    if (!tx || typeof tx !== 'object') return false;
    const txType = (tx.transaction_type || '').toLowerCase();
    const desc = (tx.description || '').toLowerCase();
    return txType === 'level daily roi' || txType.includes('vendor level benefit') || desc.includes('level daily roi') || desc.includes('vendor level benefit') || tx.benefit_type === 'Level ROI' || tx.benefit_type === 'Vendor Level Benefits';
  });

  const schedules: any[] = Array.isArray(allSchedules) ? allSchedules : [];

  // Summary statistics
  const totalDistributed = levelRoiTransactions.reduce(
    (sum, t) => sum + extractTransactionAmount(t),
    0
  );
  const activeSchedulesCount = schedules.filter((s: any) => s.status === 'Active').length;
  const completedSchedulesCount = schedules.filter((s: any) => s.status === 'Completed').length;
  const totalCommitted = schedules.reduce(
    (sum, s) => sum + parseFloat(s.total_amount || 0),
    0
  );

  // Filter transactions
  const filteredTransactions = levelRoiTransactions.filter((tx: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const amtStr = extractTransactionAmount(tx).toString();
    return (
      (tx.transaction_id && tx.transaction_id.toLowerCase().includes(q)) ||
      (tx.member_id && tx.member_id.toLowerCase().includes(q)) ||
      (tx.Name && tx.Name.toLowerCase().includes(q)) ||
      (tx.related_member_id && tx.related_member_id.toLowerCase().includes(q)) ||
      (tx.level && tx.level.toString().includes(q)) ||
      (tx.description && tx.description.toLowerCase().includes(q)) ||
      amtStr.includes(q)
    );
  });

  // Filter schedules
  const filteredSchedules = schedules.filter((s: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.schedule_id && s.schedule_id.toLowerCase().includes(q)) ||
      (s.sponsor_id && s.sponsor_id.toLowerCase().includes(q)) ||
      (s.sponsor_name && s.sponsor_name.toLowerCase().includes(q)) ||
      (s.from_member_id && s.from_member_id.toLowerCase().includes(q)) ||
      (s.from_member_name && s.from_member_name.toLowerCase().includes(q)) ||
      (s.level && s.level.toString().includes(q))
    );
  });

  // Transaction Table Columns (Desktop)
  const transactionColumns = [
    {
      name: 'Date',
      selector: (row: any) => getFormattedDate(row.transaction_date || row.createdAt),
      sortable: true,
      width: '120px',
    },
    {
      name: 'Beneficiary (Sponsor)',
      selector: (row: any) => `${row.Name || '-'} (${getOriginalMemberCode(row.member_id, row.member_code)})`,
      sortable: true,
      minWidth: '180px',
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
      width: '100px',
    },
    {
      name: 'Downline Vendor',
      selector: (row: any) => getOriginalMemberCode(row.related_member_id, row.related_member_code),
      sortable: true,
      width: '140px',
    },
    {
      name: 'Description',
      selector: (row: any) => formatVendorDescription(row.description),
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

  // Schedule Table Columns (Desktop)
  const scheduleColumns = [
    {
      name: 'Level',
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
      name: 'Sponsor (Beneficiary)',
      selector: (row: any) => `${row.sponsor_name || '-'} (${getOriginalMemberCode(row.sponsor_id, row.sponsor_code)})`,
      sortable: true,
      minWidth: '170px',
    },
    {
      name: 'From Vendor (Investor)',
      selector: (row: any) => `${row.from_member_name || '-'} (${getOriginalMemberCode(row.from_member_id, row.from_member_code)})`,
      sortable: true,
      minWidth: '170px',
    },
    {
      name: 'Package Amount',
      selector: (row: any) => row.package_amount,
      format: (row: any) => `₹${parseFloat(row.package_amount || 0).toLocaleString()}`,
      sortable: true,
      width: '140px',
    },
    {
      name: 'Daily Payout',
      cell: (row: any) => (
        <Typography sx={{ fontWeight: 800, color: '#2563eb' }}>
          ₹{parseFloat(row.daily_amount || 0).toFixed(2)} / day
        </Typography>
      ),
      sortable: true,
      width: '130px',
    },
    {
      name: 'Progress',
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
      name: 'Total Paid / Target',
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
      mt: { xs: 4, sm: 10, md: 11 },
      maxWidth: '1600px',
      mx: 'auto',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography sx={{
            fontWeight: 700,
            color: '#1e293b',
            fontSize: { xs: '1.35rem', sm: '1.55rem', md: '1.75rem' },
            letterSpacing: '-0.02em',
            lineHeight: 1.25
          }}>
            Vendor Level Benefits (100 Days)
          </Typography>
          <Typography sx={{
            color: '#64748b',
            mt: 0.5,
            fontSize: { xs: '0.78rem', sm: '0.88rem' }
          }}>
            Multi-level daily revenue share distributed across 10 upline tiers for 100 days (Levels 1 to 10, Level Matching: Level ≥ N)
          </Typography>
        </Box>
        <TriggerMissingROIButton defaultType="level_roi" pageTitle="Vendor Level Benefits" label="Trigger Missing Benefits" />
      </Box>

      {/* KPI Summary Cards: 2x2 grid on mobile, 4 in row on desktop */}
      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 2.5, sm: 3 } }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card elevation={0} sx={{
            borderRadius: { xs: '16px', sm: '18px' },
            border: '1px solid #d1fae5',
            background: 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)',
            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.05)',
            p: { xs: 1.5, sm: 2 }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.2, sm: 1.6 } }}>
              <Box sx={{
                width: { xs: 38, sm: 46 },
                height: { xs: 38, sm: 46 },
                borderRadius: '12px',
                bgcolor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <PaymentsIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: { xs: '0.68rem', sm: '0.75rem' }, color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Distributed
                </Typography>
                <Typography sx={{
                  fontSize: { xs: '1rem', sm: '1.25rem', md: '1.35rem' },
                  fontWeight: 900,
                  color: '#065f46',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  ₹{totalDistributed.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card elevation={0} sx={{
            borderRadius: { xs: '16px', sm: '18px' },
            border: '1px solid #bfdbfe',
            background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
            boxShadow: '0 2px 10px rgba(37, 99, 235, 0.05)',
            p: { xs: 1.5, sm: 2 }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.2, sm: 1.6 } }}>
              <Box sx={{
                width: { xs: 38, sm: 46 },
                height: { xs: 38, sm: 46 },
                borderRadius: '12px',
                bgcolor: '#dbeafe',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <AutorenewIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: { xs: '0.68rem', sm: '0.75rem' }, color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Active (100d)
                </Typography>
                <Typography sx={{
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.35rem' },
                  fontWeight: 900,
                  color: '#1e40af'
                }}>
                  {activeSchedulesCount}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card elevation={0} sx={{
            borderRadius: { xs: '16px', sm: '18px' },
            border: '1px solid #e9d5ff',
            background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
            boxShadow: '0 2px 10px rgba(147, 51, 234, 0.05)',
            p: { xs: 1.5, sm: 2 }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.2, sm: 1.6 } }}>
              <Box sx={{
                width: { xs: 38, sm: 46 },
                height: { xs: 38, sm: 46 },
                borderRadius: '12px',
                bgcolor: '#f3e8ff',
                color: '#9333ea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CheckCircleIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: { xs: '0.68rem', sm: '0.75rem' }, color: '#7e22ce', fontWeight: 700, textTransform: 'uppercase' }}>
                  Completed
                </Typography>
                <Typography sx={{
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.35rem' },
                  fontWeight: 900,
                  color: '#581c87'
                }}>
                  {completedSchedulesCount}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card elevation={0} sx={{
            borderRadius: { xs: '16px', sm: '18px' },
            border: '1px solid #fef3c7',
            background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
            boxShadow: '0 2px 10px rgba(217, 119, 6, 0.05)',
            p: { xs: 1.5, sm: 2 }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.2, sm: 1.6 } }}>
              <Box sx={{
                width: { xs: 38, sm: 46 },
                height: { xs: 38, sm: 46 },
                borderRadius: '12px',
                bgcolor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ReceiptLongIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: { xs: '0.68rem', sm: '0.75rem' }, color: '#b45309', fontWeight: 700, textTransform: 'uppercase' }}>
                  Committed
                </Typography>
                <Typography sx={{
                  fontSize: { xs: '1rem', sm: '1.25rem', md: '1.35rem' },
                  fontWeight: 900,
                  color: '#92400e',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  ₹{totalCommitted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Main Table Card */}
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
                {`Daily Transactions (${filteredTransactions.length})`}
              </ToggleButton>
              <ToggleButton value="schedules">
                {`100-Day Active Schedules (${filteredSchedules.length})`}
              </ToggleButton>
            </ToggleButtonGroup>

            <TextField
              size="small"
              placeholder={viewMode === 'transactions' ? "Search sponsor, vendor, tx..." : "Search sponsor, investor..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: { xs: '100%', sm: 280 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '11px',
                  bgcolor: '#ffffff',
                  fontSize: '0.85rem'
                },
              }}
            />
          </Box>

          {/* Table View with Horizontal Scroll */}
          <Box sx={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
            <DataTable
              columns={viewMode === 'transactions' ? transactionColumns : scheduleColumns}
              data={viewMode === 'transactions' ? filteredTransactions : filteredSchedules}
              customStyles={DASHBOARD_CUTSOM_STYLE}
              pagination
              paginationPerPage={15}
              paginationRowsPerPageOptions={[10, 15, 25, 50]}
              responsive
              highlightOnHover
              noDataComponent={
                <Box sx={{ p: 4, textAlign: 'center', color: '#64748b' }}>
                  {isTxError || isSchError ? 'Error loading data' : 'No Vendor Level Benefits records found'}
                </Box>
              }
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminLevelDailyROI;

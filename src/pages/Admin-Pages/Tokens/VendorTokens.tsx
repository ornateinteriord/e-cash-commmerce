import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
  Grid,
  Button,
  Chip,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SyncIcon from '@mui/icons-material/Sync';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DataTable, { TableColumn } from 'react-data-table-component';
import { DASHBOARD_CUTSOM_STYLE } from '../../../utils/DataTableColumnsProvider';
import { useGetAllMembersDetails, useSyncReferralTokens } from '../../../api/Admin';
import TokenCoin from '../../../components/common/TokenCoin';

export const VendorTokens: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: allMembers = [], isLoading, refetch } = useGetAllMembersDetails();
  const { mutate: syncTokens, isPending: isSyncing } = useSyncReferralTokens();

  // Filter for vendors
  const vendorsList = useMemo(() => {
    if (!Array.isArray(allMembers)) return [];
    return allMembers.filter((m: any) => {
      // Filter non-admin accounts or those identified as vendors
      const role = String(m.role || '').toUpperCase();
      return role !== 'ADMIN' && role !== 'ADMIN_01';
    });
  }, [allMembers]);

  // Search filtered vendors
  const filteredVendors = useMemo(() => {
    if (!searchQuery.trim()) return vendorsList;
    const q = searchQuery.toLowerCase().trim();
    return vendorsList.filter((m: any) => {
      const id = String(m.Member_id || m.member_id || '').toLowerCase();
      const code = String(m.member_code || '').toLowerCase();
      const name = String(m.Name || m.name || '').toLowerCase();
      const mobile = String(m.mobileno || m.contactno || '').toLowerCase();
      return id.includes(q) || code.includes(q) || name.includes(q) || mobile.includes(q);
    });
  }, [vendorsList, searchQuery]);

  // Helper to extract token value
  const getTokenVal = (m: any) => (m?.token !== undefined && m?.token !== null ? Number(m.token) : Number(m?.tokens || 0));

  // Compute summary stats
  const totalTokens = useMemo(() => {
    return vendorsList.reduce((acc: number, m: any) => acc + getTokenVal(m), 0);
  }, [vendorsList]);

  const vendorsWithTokens = useMemo(() => {
    return vendorsList.filter((m: any) => getTokenVal(m) > 0).length;
  }, [vendorsList]);

  const topTokenVendor = useMemo(() => {
    if (!vendorsList.length) return null;
    return [...vendorsList].sort((a: any, b: any) => getTokenVal(b) - getTokenVal(a))[0];
  }, [vendorsList]);

  const handleSyncTokens = () => {
    syncTokens(undefined, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  const columns: TableColumn<any>[] = [
    {
      name: '#',
      selector: (_row: any, index?: number) => (index ?? 0) + 1,
      width: '60px',
      center: true,
    },
    {
      name: 'Vendor Code / ID',
      selector: (row: any) => row.member_code || row.Member_id || row.member_id || 'N/A',
      sortable: true,
      cell: (row: any) => (
        <Box>
          <Typography sx={{ fontWeight: 800, color: '#0284c7', fontSize: '0.88rem' }}>
            {row.member_code || row.Member_id || row.member_id}
          </Typography>
          {row.member_code && row.Member_id && row.member_code !== row.Member_id && (
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
              ID: {row.Member_id}
            </Typography>
          )}
        </Box>
      ),
      minWidth: '150px',
    },
    {
      name: 'Vendor Name',
      selector: (row: any) => row.Name || row.name || 'N/A',
      sortable: true,
      cell: (row: any) => (
        <Box>
          <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
            {row.Name || row.name || 'N/A'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            {row.email || row.emailid || ''}
          </Typography>
        </Box>
      ),
      minWidth: '180px',
    },
    {
      name: 'Mobile Number',
      selector: (row: any) => row.mobileno || row.contactno || 'N/A',
      sortable: true,
      minWidth: '130px',
    },
    {
      name: 'Referrals (Direct)',
      selector: (row: any) => (Array.isArray(row.direct_referrals) ? row.direct_referrals.length : 0),
      sortable: true,
      center: true,
      width: '140px',
      cell: (row: any) => (
        <Chip
          label={`${Array.isArray(row.direct_referrals) ? row.direct_referrals.length : 0} Direct`}
          size="small"
          sx={{
            bgcolor: '#f1f5f9',
            color: '#334155',
            fontWeight: 700,
            fontSize: '0.78rem'
          }}
        />
      ),
    },
    {
      name: 'Level',
      selector: (row: any) => row.level || 0,
      sortable: true,
      center: true,
      width: '100px',
      cell: (row: any) => (
        <Chip
          label={`Lvl ${row.level || 0}`}
          size="small"
          sx={{
            bgcolor: '#e0f2fe',
            color: '#0369a1',
            fontWeight: 800,
            fontSize: '0.78rem',
            border: '1px solid #bae6fd'
          }}
        />
      ),
    },
    {
      name: 'Token Balance',
      selector: (row: any) => getTokenVal(row),
      sortable: true,
      center: true,
      minWidth: '160px',
      cell: (row: any) => {
        const tokens = getTokenVal(row);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
            <TokenCoin value={tokens} size={32} />
            <Box
              sx={{
                px: 1.2,
                py: 0.3,
                borderRadius: '8px',
                bgcolor: tokens > 0 ? 'rgba(255, 179, 0, 0.12)' : '#f8fafc',
                border: tokens > 0 ? '1px solid rgba(255, 179, 0, 0.4)' : '1px solid #e2e8f0',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  color: tokens > 0 ? '#b45309' : '#64748b'
                }}
              >
                {tokens}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      name: 'Status',
      selector: (row: any) => row.status || 'Pending',
      sortable: true,
      center: true,
      width: '120px',
      cell: (row: any) => {
        const status = String(row.status || '').toLowerCase();
        const isActive = status === 'active';
        return (
          <Chip
            label={row.status || 'Pending'}
            size="small"
            color={isActive ? 'success' : 'warning'}
            variant={isActive ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700, fontSize: '0.74rem', textTransform: 'capitalize' }}
          />
        );
      },
    },
    {
      name: 'Joined Date',
      selector: (row: any) => row.Date_of_joining || row.createdAt || 'N/A',
      sortable: true,
      width: '130px',
      cell: (row: any) => (
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.82rem' }}>
          {row.Date_of_joining || (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A')}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TokenCoin value={totalTokens} size={36} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Vendor Tokens Management
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Track and monitor referral tokens awarded to vendors across all 20 upline referral tiers.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleSyncTokens}
          disabled={isSyncing}
          startIcon={isSyncing ? <CircularProgress size={18} color="inherit" /> : <SyncIcon />}
          sx={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#fff',
            fontWeight: 700,
            borderRadius: '10px',
            textTransform: 'none',
            px: 2.5,
            py: 1,
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
            '&:hover': {
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            }
          }}
        >
          {isSyncing ? 'Recalculating...' : 'Recalculate & Sync Tokens'}
        </Button>
      </Box>

      {/* Summary KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Total Tokens Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: '14px',
              border: '1.5px solid #fed7aa',
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.08)',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Tokens Issued
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#b45309', mt: 0.5 }}>
                    {totalTokens.toLocaleString()}
                  </Typography>
                </Box>
                <TokenCoin value={totalTokens} size={48} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Vendors with Tokens Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Token Earners
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#0369a1', mt: 0.5 }}>
                    {vendorsWithTokens}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: '12px', bgcolor: '#e0f2fe', color: '#0284c7' }}>
                  <CheckCircleIcon sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Vendors Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Vendors
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#334155', mt: 0.5 }}>
                    {vendorsList.length}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: '12px', bgcolor: '#f1f5f9', color: '#64748b' }}>
                  <GroupIcon sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Token Holder Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ minWidth: 0, pr: 1 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Top Earner
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#16a34a', mt: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {topTokenVendor?.Name || topTokenVendor?.name || 'None'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    {topTokenVendor ? `${topTokenVendor.tokens || 0} Tokens` : '-'}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: '12px', bgcolor: '#dcfce7', color: '#16a34a', flexShrink: 0 }}>
                  <EmojiEventsIcon sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Table Card */}
      <Card
        sx={{
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {/* Controls Bar */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2,
              mb: 2.5,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
              Vendor Tokens Breakdown
            </Typography>

            <TextField
              size="small"
              placeholder="Search by vendor ID, name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: '100%', sm: 340 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                },
              }}
            />
          </Box>

          {/* Data Table */}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={36} sx={{ color: '#f59e0b' }} />
            </Box>
          ) : (
            <DataTable
              columns={columns}
              data={filteredVendors}
              customStyles={DASHBOARD_CUTSOM_STYLE}
              pagination
              paginationPerPage={15}
              paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
              highlightOnHover
              responsive
              noDataComponent={
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ color: '#64748b' }}>
                    No vendors found matching your criteria.
                  </Typography>
                </Box>
              }
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default VendorTokens;


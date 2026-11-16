import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
  Grid,
  Chip,
  InputAdornment,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme,
  Stack,
  Switch,
  FormControlLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DataTable, { TableColumn } from 'react-data-table-component';
import { DASHBOARD_CUTSOM_STYLE } from '../../../utils/DataTableColumnsProvider';
import {
  useGetCustomers,
  useUpdateCustomerStatus,
  useGetCustomerUplines,
  useGetCustomerTokenContributors,
} from '../../../api/Admin';
import TokenCoin from '../../../components/common/TokenCoin';
import UplinerDialog from '../../../components/common/UplinerDialog';

interface CustomerViewProps {
  initialStatusFilter?: 'all' | 'active' | 'inactive';
  pageTitle?: string;
  pageSubtitle?: string;
}

export const CustomerBase: React.FC<CustomerViewProps> = ({
  initialStatusFilter = 'all',
  pageTitle = 'Customer Directory',
  pageSubtitle = 'Manage and monitor all platform customer accounts',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(initialStatusFilter);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(isMobile ? 'cards' : 'table');

  // Customer Detail Dialog State
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Upliner / Hierarchy Dialog State
  const [isUplinerOpen, setIsUplinerOpen] = useState(false);

  // Queries & Mutations
  const { data: rawCustomers = [], isLoading, refetch, isRefetching } = useGetCustomers();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateCustomerStatus();

  // Upliner & contributor queries for selected customer
  const customerIdToQuery =
    selectedCustomer?.customerId || selectedCustomer?.customer_id || selectedCustomer?._id || null;
  const { data: contributorsData, isLoading: isContributorsLoading } =
    useGetCustomerTokenContributors(isUplinerOpen ? customerIdToQuery : null);
  const { data: uplinesData, isLoading: isUplinesLoading } =
    useGetCustomerUplines(isUplinerOpen ? customerIdToQuery : null);

  const customersList = useMemo(() => {
    if (!Array.isArray(rawCustomers)) return [];
    return rawCustomers;
  }, [rawCustomers]);

  // Overall Counts
  const totalCount = customersList.length;
  const activeCount = useMemo(
    () => customersList.filter((c: any) => c.status?.toLowerCase() === 'active' || c.isActive === true).length,
    [customersList]
  );
  const inactiveCount = totalCount - activeCount;
  const totalTokens = useMemo(
    () =>
      customersList.reduce(
        (sum: number, c: any) => sum + Number(c.token !== undefined && c.token !== null ? c.token : c.tokens || 0),
        0
      ),
    [customersList]
  );

  // Filtered Customers based on status and search
  const filteredCustomers = useMemo(() => {
    let list = customersList;

    // Status filter
    if (statusFilter === 'active') {
      list = list.filter((c: any) => c.status?.toLowerCase() === 'active' || c.isActive === true);
    } else if (statusFilter === 'inactive') {
      list = list.filter((c: any) => c.status?.toLowerCase() !== 'active' && c.isActive === false);
    }

    // Search query filter
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((c: any) => {
      const id = String(c.customerId || c.customer_id || c._id || '').toLowerCase();
      const name = String(c.name || c.fullName || '').toLowerCase();
      const mobile = String(c.mobileNumber || c.phone || '').toLowerCase();
      const email = String(c.email || '').toLowerCase();
      const refCode = String(c.referralCode || '').toLowerCase();
      const refName = String(c.referralName || '').toLowerCase();
      const vendorName = String(c.vendor_name || '').toLowerCase();
      const vendorId = String(c.vendor_id || '').toLowerCase();
      return (
        id.includes(q) ||
        name.includes(q) ||
        mobile.includes(q) ||
        email.includes(q) ||
        refCode.includes(q) ||
        refName.includes(q) ||
        vendorName.includes(q) ||
        vendorId.includes(q)
      );
    });
  }, [customersList, statusFilter, searchQuery]);

  const handleOpenDetail = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const handleOpenUpliner = (customer: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedCustomer(customer);
    setIsUplinerOpen(true);
  };

  const handleToggleStatus = (customer: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentIsActive = customer.status?.toLowerCase() === 'active' || customer.isActive === true;
    const newStatus = currentIsActive ? 'Inactive' : 'Active';
    const id = customer.customerId || customer.customer_id || customer._id;

    updateStatus(
      { id, status: newStatus, isActive: !currentIsActive },
      {
        onSuccess: () => {
          if (selectedCustomer && (selectedCustomer.customerId === id || selectedCustomer._id === id)) {
            setSelectedCustomer((prev: any) => ({
              ...prev,
              status: newStatus,
              isActive: !currentIsActive,
            }));
          }
        },
      }
    );
  };

  // Columns for Desktop/Tablet DataTable
  const columns: TableColumn<any>[] = [
    {
      name: '#',
      selector: (_row: any, index?: number) => (index ?? 0) + 1,
      width: '55px',
      center: true,
    },
    {
      name: 'Customer ID',
      selector: (row: any) => row.customerId || row.customer_id || 'N/A',
      sortable: true,
      minWidth: '150px',
      wrap: true,
      cell: (row: any) => (
        <Box sx={{ cursor: 'pointer', whiteSpace: 'normal', wordBreak: 'break-word' }} onClick={() => handleOpenDetail(row)}>
          <Typography sx={{ fontWeight: 800, color: '#0d9488', fontSize: '0.88rem', whiteSpace: 'normal', wordBreak: 'break-word' }}>
            {row.customerId || row.customer_id || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      name: 'Customer Name',
      selector: (row: any) => row.name || row.fullName || 'N/A',
      sortable: true,
      minWidth: '220px',
      wrap: true,
      cell: (row: any) => (
        <Box sx={{ cursor: 'pointer', py: 0.5, whiteSpace: 'normal', wordBreak: 'break-word' }} onClick={() => handleOpenDetail(row)}>
          <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem', whiteSpace: 'normal', wordBreak: 'break-word' }}>
            {row.name || row.fullName || 'N/A'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5, whiteSpace: 'normal', wordBreak: 'break-word' }}>
            <PhoneIcon sx={{ fontSize: '12px', flexShrink: 0 }} />
            {row.mobileNumber || row.phone || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      name: 'Referred By / Vendor',
      selector: (row: any) => row.referralName || row.vendor_name || 'Direct',
      sortable: true,
      minWidth: '160px',
      cell: (row: any) => {
        const vendor = row.vendor_name || row.vendor_id;
        const referrer = row.referralName || row.referralCode;
        return (
          <Box>
            <Typography sx={{ fontWeight: 600, color: '#334155', fontSize: '0.82rem' }}>
              {referrer || vendor || 'Direct'}
            </Typography>
            {vendor && (
              <Chip
                icon={<StorefrontIcon sx={{ fontSize: '11px !important' }} />}
                label={row.vendor_name || row.vendor_id}
                size="small"
                sx={{
                  mt: 0.3,
                  height: '18px',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  bgcolor: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                }}
              />
            )}
          </Box>
        );
      },
    },
    {
      name: 'Tokens',
      selector: (row: any) => Number(row.token !== undefined && row.token !== null ? row.token : row.tokens || 0),
      sortable: true,
      center: true,
      width: '110px',
      cell: (row: any) => {
        const val = Number(row.token !== undefined && row.token !== null ? row.token : row.tokens || 0);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TokenCoin value={val} size={22} />
            <Typography sx={{ fontWeight: 800, color: val > 0 ? '#0d9488' : '#94a3b8', fontSize: '0.85rem' }}>
              {val}
            </Typography>
          </Box>
        );
      },
    },
    {
      name: 'Status',
      selector: (row: any) => row.status || (row.isActive ? 'Active' : 'Inactive'),
      sortable: true,
      center: true,
      width: '115px',
      cell: (row: any) => {
        const isActive = row.status?.toLowerCase() === 'active' || row.isActive === true;
        return (
          <Chip
            label={isActive ? 'Active' : 'Inactive'}
            size="small"
            color={isActive ? 'success' : 'default'}
            variant={isActive ? 'filled' : 'outlined'}
            sx={{
              fontWeight: 800,
              fontSize: '0.72rem',
              height: '24px',
              bgcolor: isActive ? '#dcfce7' : '#f1f5f9',
              color: isActive ? '#15803d' : '#64748b',
              border: isActive ? '1px solid #86efac' : '1px solid #cbd5e1',
            }}
          />
        );
      },
    },
    {
      name: 'Joined',
      selector: (row: any) => row.createdAt,
      sortable: true,
      width: '110px',
      cell: (row: any) => (
        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}
        </Typography>
      ),
    },
    {
      name: 'Actions',
      center: true,
      width: '120px',
      cell: (row: any) => {
        const isActive = row.status?.toLowerCase() === 'active' || row.isActive === true;
        return (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Tooltip title="View Hierarchy & Upliners">
              <IconButton
                size="small"
                onClick={(e) => handleOpenUpliner(row, e)}
                sx={{
                  color: '#0284c7',
                  bgcolor: '#f0f9ff',
                  p: 0.6,
                  '&:hover': { bgcolor: '#e0f2fe' },
                }}
              >
                <AccountTreeIcon sx={{ fontSize: '16px' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={isActive ? 'Deactivate Customer' : 'Activate Customer'}>
              <IconButton
                size="small"
                disabled={isUpdatingStatus}
                onClick={(e) => handleToggleStatus(row, e)}
                sx={{
                  color: isActive ? '#16a34a' : '#dc2626',
                  bgcolor: isActive ? '#f0fdf4' : '#fef2f2',
                  p: 0.6,
                  '&:hover': { bgcolor: isActive ? '#dcfce7' : '#fee2e2' },
                }}
              >
                {isActive ? <CheckCircleIcon sx={{ fontSize: '16px' }} /> : <CancelIcon sx={{ fontSize: '16px' }} />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Customer Profile">
              <IconButton
                size="small"
                onClick={() => handleOpenDetail(row)}
                sx={{
                  color: '#64748b',
                  bgcolor: '#f8fafc',
                  p: 0.6,
                  '&:hover': { bgcolor: '#f1f5f9' },
                }}
              >
                <VisibilityIcon sx={{ fontSize: '16px' }} />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2.5, md: 3 },
        maxWidth: '1600px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Page Header ── */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                letterSpacing: '-0.02em',
              }}
            >
              {pageTitle}
            </Typography>
            <Chip
              label={`${filteredCustomers.length} Records`}
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: '#e6fffa',
                color: '#0d9488',
                border: '1px solid #99f6e4',
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            {pageSubtitle}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: { xs: 'stretch', sm: 'auto' } }}>
          {/* View Mode Toggle (Cards vs Table) */}
          <Box
            sx={{
              display: 'flex',
              bgcolor: '#f1f5f9',
              p: 0.4,
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
            }}
          >
            <IconButton
              size="small"
              onClick={() => setViewMode('table')}
              sx={{
                borderRadius: '8px',
                bgcolor: viewMode === 'table' ? '#fff' : 'transparent',
                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                color: viewMode === 'table' ? '#0d9488' : '#64748b',
                p: 0.6,
              }}
            >
              <ViewListIcon sx={{ fontSize: '18px' }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewMode('cards')}
              sx={{
                borderRadius: '8px',
                bgcolor: viewMode === 'cards' ? '#fff' : 'transparent',
                boxShadow: viewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                color: viewMode === 'cards' ? '#0d9488' : '#64748b',
                p: 0.6,
              }}
            >
              <ViewModuleIcon sx={{ fontSize: '18px' }} />
            </IconButton>
          </Box>

          {/* Refresh Button */}
          <Button
            variant="outlined"
            size="small"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            startIcon={
              isRefetching ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon sx={{ fontSize: 16 }} />
            }
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              py: 0.8,
              px: 1.5,
              borderColor: '#cbd5e1',
              color: '#334155',
              bgcolor: '#fff',
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* ── Summary KPI Cards (Responsive 2x2 on Mobile) ── */}
      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 2.5 }}>
        {/* Total Customers */}
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Total Customers
                </Typography>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.4rem', sm: '1.75rem' }, color: '#1e293b' }}>
                {totalCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Customers */}
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              border: '1px solid #bbf7d0',
              bgcolor: '#f0fdf4',
              height: '100%',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
            onClick={() => setStatusFilter('active')}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                  Active Customers
                </Typography>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.4rem', sm: '1.75rem' }, color: '#15803d' }}>
                {activeCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Inactive Customers */}
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              border: '1px solid #fed7aa',
              bgcolor: '#fffbeb',
              height: '100%',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
            onClick={() => setStatusFilter('inactive')}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#9a3412', textTransform: 'uppercase' }}>
                  Inactive Customers
                </Typography>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: '#ffedd5',
                    color: '#ea580c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CancelIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.4rem', sm: '1.75rem' }, color: '#c2410c' }}>
                {inactiveCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Tokens */}
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              border: '1px solid #ccfbf1',
              bgcolor: '#f0fdfa',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f766e', textTransform: 'uppercase' }}>
                  Total Tokens
                </Typography>
                <TokenCoin value={totalTokens} size={28} />
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.4rem', sm: '1.75rem' }, color: '#0d9488' }}>
                {totalTokens}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Filters & Search Bar ── */}
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          border: '1px solid #e2e8f0',
          mb: 2.5,
          bgcolor: '#ffffff',
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
          >
            {/* Quick Status Filter Tabs */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                pb: { xs: 0.5, sm: 0 },
                '::-webkit-scrollbar': { display: 'none' },
              }}
            >
              <Chip
                label={`All (${totalCount})`}
                clickable
                onClick={() => setStatusFilter('all')}
                color={statusFilter === 'all' ? 'primary' : 'default'}
                variant={statusFilter === 'all' ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderRadius: '10px',
                  bgcolor: statusFilter === 'all' ? '#0f172a' : 'transparent',
                }}
              />
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: '15px !important' }} />}
                label={`Active (${activeCount})`}
                clickable
                onClick={() => setStatusFilter('active')}
                color={statusFilter === 'active' ? 'success' : 'default'}
                variant={statusFilter === 'active' ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderRadius: '10px',
                  bgcolor: statusFilter === 'active' ? '#16a34a' : 'transparent',
                  color: statusFilter === 'active' ? '#fff' : '#166534',
                }}
              />
              <Chip
                icon={<CancelIcon sx={{ fontSize: '15px !important' }} />}
                label={`Inactive (${inactiveCount})`}
                clickable
                onClick={() => setStatusFilter('inactive')}
                color={statusFilter === 'inactive' ? 'error' : 'default'}
                variant={statusFilter === 'inactive' ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderRadius: '10px',
                  bgcolor: statusFilter === 'inactive' ? '#dc2626' : 'transparent',
                  color: statusFilter === 'inactive' ? '#fff' : '#991b1b',
                }}
              />
            </Box>

            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Search by name, ID, phone, vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <ClearIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  bgcolor: '#f8fafc',
                  minWidth: { xs: '100%', sm: '320px' },
                },
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* ── Main Data View (Cards View for Mobile or by Toggle, Table View for Desktop) ── */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#0d9488' }} />
        </Box>
      ) : filteredCustomers.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <PeopleIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#475569' }}>
            No customers found
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
            {searchQuery ? 'Try adjusting your search criteria' : 'No customer records available for this filter.'}
          </Typography>
        </Card>
      ) : viewMode === 'cards' || (isMobile && viewMode !== 'table') ? (
        /* ── Mobile & Card Grid View ── */
        <Grid container spacing={1.5}>
          {filteredCustomers.map((cust: any) => {
            const isActive = cust.status?.toLowerCase() === 'active' || cust.isActive === true;
            const tokenVal = Number(cust.token !== undefined && cust.token !== null ? cust.token : cust.tokens || 0);

            return (
              <Grid item xs={12} sm={6} md={4} key={cust.customerId || cust._id}>
                <Card
                  sx={{
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    bgcolor: '#fff',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(0,0,0,0.07)',
                      borderColor: '#cbd5e1',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    {/* Top Row: Name, ID & Status Badge */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ pr: 1 }}>
                        <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem', lineHeight: 1.2 }}>
                          {cust.name || cust.fullName || 'Customer'}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            color: '#0d9488',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                          }}
                        >
                          ID: {cust.customerId || cust.customer_id || 'N/A'}
                        </Typography>
                      </Box>
                      <Chip
                        label={isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={isActive ? 'success' : 'default'}
                        variant={isActive ? 'filled' : 'outlined'}
                        sx={{
                          height: '22px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          bgcolor: isActive ? '#dcfce7' : '#f1f5f9',
                          color: isActive ? '#15803d' : '#64748b',
                        }}
                      />
                    </Box>

                    <Divider sx={{ my: 1, borderColor: '#f1f5f9' }} />

                    {/* Middle Info Grid */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, my: 1 }}>
                      {/* Mobile */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: '15px', color: '#64748b' }} />
                        <Typography sx={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                          {cust.mobileNumber || cust.phone || 'N/A'}
                        </Typography>
                      </Box>

                      {/* Email if present */}
                      {cust.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon sx={{ fontSize: '15px', color: '#64748b' }} />
                          <Typography
                            sx={{
                              fontSize: '0.78rem',
                              color: '#64748b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {cust.email}
                          </Typography>
                        </Box>
                      )}

                      {/* Referred Vendor Info */}
                      {(cust.vendor_name || cust.vendor_id || cust.referralName) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <StorefrontIcon sx={{ fontSize: '15px', color: '#0284c7' }} />
                          <Typography sx={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: 700 }}>
                            Vendor: {cust.vendor_name || cust.vendor_id || cust.referralName}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Bottom Action Footer */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mt: 1.5,
                        pt: 1.2,
                        borderTop: '1px solid #f1f5f9',
                      }}
                    >
                      {/* Tokens Coin Indicator */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <TokenCoin value={tokenVal} size={20} />
                        <Typography sx={{ fontWeight: 900, color: '#0f766e', fontSize: '0.85rem' }}>
                          {tokenVal} Tokens
                        </Typography>
                      </Box>

                      {/* Quick Action Buttons */}
                      <Box sx={{ display: 'flex', gap: 0.8 }}>
                        <Tooltip title="View Hierarchy & Upliners">
                          <IconButton
                            size="small"
                            onClick={(e) => handleOpenUpliner(cust, e)}
                            sx={{
                              bgcolor: '#f0f9ff',
                              color: '#0284c7',
                              p: 0.7,
                              borderRadius: '8px',
                              '&:hover': { bgcolor: '#e0f2fe' },
                            }}
                          >
                            <AccountTreeIcon sx={{ fontSize: '16px' }} />
                          </IconButton>
                        </Tooltip>

                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenDetail(cust)}
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            py: 0.4,
                            px: 1.2,
                            borderColor: '#cbd5e1',
                            color: '#1e293b',
                          }}
                        >
                          Details
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        /* ── Full Responsive DataTable View (for desktop / tablet) ── */
        <Card
          sx={{
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              '& .rdt_Table': { minWidth: '780px' },
            }}
          >
            <DataTable
              columns={columns}
              data={filteredCustomers}
              pagination
              paginationPerPage={15}
              paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
              customStyles={DASHBOARD_CUTSOM_STYLE}
              highlightOnHover
              pointerOnHover
              onRowClicked={handleOpenDetail}
              responsive
            />
          </Box>
        </Card>
      )}

      {/* ── Customer Detail Dialog (Mobile-Optimized Modal) ── */}
      <Dialog
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: '20px 20px 0 0', sm: '20px' },
            m: { xs: 0, sm: 2 },
            position: { xs: 'fixed', sm: 'static' },
            bottom: { xs: 0, sm: 'auto' },
            width: { xs: '100%', sm: 'auto' },
            maxHeight: { xs: '88vh', sm: '90vh' },
          },
        }}
      >
        {selectedCustomer && (
          <>
            <DialogTitle
              sx={{
                p: { xs: 2, sm: 2.5 },
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    bgcolor: '#ccfbf1',
                    color: '#0d9488',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                    {selectedCustomer.name || selectedCustomer.fullName || 'Customer Profile'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0d9488', fontWeight: 800, fontFamily: 'monospace' }}>
                    ID: {selectedCustomer.customerId || selectedCustomer.customer_id || 'N/A'}
                  </Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={() => setIsDetailOpen(false)}>
                <ClearIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              {/* Status & Quick Toggle Strip */}
              <Box
                sx={{
                  p: 1.5,
                  mb: 2.5,
                  borderRadius: '12px',
                  bgcolor:
                    selectedCustomer.status?.toLowerCase() === 'active' || selectedCustomer.isActive === true
                      ? '#f0fdf4'
                      : '#fef2f2',
                  border:
                    selectedCustomer.status?.toLowerCase() === 'active' || selectedCustomer.isActive === true
                      ? '1px solid #bbf7d0'
                      : '1px solid #fecaca',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {selectedCustomer.status?.toLowerCase() === 'active' || selectedCustomer.isActive === true ? (
                    <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 22 }} />
                  ) : (
                    <CancelIcon sx={{ color: '#dc2626', fontSize: 22 }} />
                  )}
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        color:
                          selectedCustomer.status?.toLowerCase() === 'active' || selectedCustomer.isActive === true
                            ? '#166534'
                            : '#991b1b',
                      }}
                    >
                      Account Status:{' '}
                      {selectedCustomer.status?.toLowerCase() === 'active' || selectedCustomer.isActive === true
                        ? 'Active'
                        : 'Inactive'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                      Click switch to toggle active or inactive status
                    </Typography>
                  </Box>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={
                        selectedCustomer.status?.toLowerCase() === 'active' || selectedCustomer.isActive === true
                      }
                      onChange={() => handleToggleStatus(selectedCustomer)}
                      disabled={isUpdatingStatus}
                      color="success"
                    />
                  }
                  label=""
                  sx={{ m: 0 }}
                />
              </Box>

              {/* Information Cards Grid */}
              <Grid container spacing={1.5}>
                {/* Mobile Number */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                      Mobile Number
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem', mt: 0.3 }}>
                      {selectedCustomer.mobileNumber || selectedCustomer.phone || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Email Address */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                      Email Address
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem', mt: 0.3 }}>
                      {selectedCustomer.email || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Sponsoring Vendor */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 600 }}>
                      Sponsoring Vendor
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: '#0c4a6e', fontSize: '0.92rem', mt: 0.3 }}>
                      {selectedCustomer.vendor_name || selectedCustomer.vendor_id || 'Direct'}
                    </Typography>
                    {selectedCustomer.vendor_id && (
                      <Typography variant="caption" sx={{ color: '#0284c7', display: 'block', mt: 0.2 }}>
                        Vendor ID: {selectedCustomer.vendor_id}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Referral Code */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                      Referral Code
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem', mt: 0.3 }}>
                      {selectedCustomer.referralCode || 'None'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Token Balance */}
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#f0fdfa', border: '1px solid #99f6e4' }}>
                    <Typography variant="caption" sx={{ color: '#0f766e', fontWeight: 600 }}>
                      Token Balance
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.3 }}>
                      <TokenCoin
                        value={Number(
                          selectedCustomer.token !== undefined && selectedCustomer.token !== null
                            ? selectedCustomer.token
                            : selectedCustomer.tokens || 0
                        )}
                        size={22}
                      />
                      <Typography sx={{ fontWeight: 900, color: '#0f766e', fontSize: '1.1rem' }}>
                        {Number(
                          selectedCustomer.token !== undefined && selectedCustomer.token !== null
                            ? selectedCustomer.token
                            : selectedCustomer.tokens || 0
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Level */}
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                      Account Level
                    </Typography>
                    <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem', mt: 0.3 }}>
                      Level {selectedCustomer.level || 0}
                    </Typography>
                  </Box>
                </Grid>

                {/* Registration Date */}
                <Grid item xs={12}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                      Registration Date
                    </Typography>
                    <Typography sx={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', mt: 0.3 }}>
                      {selectedCustomer.createdAt
                        ? new Date(selectedCustomer.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                gap: 1,
              }}
            >
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setIsDetailOpen(false);
                  setIsUplinerOpen(true);
                }}
                startIcon={<AccountTreeIcon />}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  py: 1,
                  textTransform: 'none',
                  borderColor: '#0d9488',
                  color: '#0d9488',
                  '&:hover': { bgcolor: '#f0fdfa', borderColor: '#0f766e' },
                }}
              >
                View Upliners & Tree
              </Button>
              <Button
                variant="contained"
                onClick={() => setIsDetailOpen(false)}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  py: 1,
                  px: 3,
                  textTransform: 'none',
                  bgcolor: '#0f172a',
                  color: '#fff',
                  '&:hover': { bgcolor: '#1e293b' },
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ── Upliner & Token Contributors Dialog ── */}
      {selectedCustomer && (
        <UplinerDialog
          open={isUplinerOpen}
          onClose={() => setIsUplinerOpen(false)}
          target={
            selectedCustomer
              ? {
                  id: selectedCustomer.customerId || selectedCustomer.customer_id,
                  member_code: selectedCustomer.customerId || selectedCustomer.customer_id,
                  name: selectedCustomer.name || selectedCustomer.fullName,
                  mobile: selectedCustomer.mobileNumber || selectedCustomer.phone,
                  token: Number(
                    selectedCustomer.token !== undefined && selectedCustomer.token !== null
                      ? selectedCustomer.token
                      : selectedCustomer.tokens || 0
                  ),
                  status: selectedCustomer.status,
                }
              : null
          }
          entityType="Customer"
          contributors={contributorsData?.contributors || []}
          isContributorsLoading={isContributorsLoading}
          uplines={uplinesData?.uplines || []}
          isUplinesLoading={isUplinesLoading}
        />
      )}
    </Box>
  );
};

// Sub-menu components
export const AllCustomers: React.FC = () => {
  return (
    <CustomerBase
      initialStatusFilter="all"
      pageTitle="All Customer"
      pageSubtitle="Complete customer directory across platform and network"
    />
  );
};

export const ActiveCustomers: React.FC = () => {
  return (
    <CustomerBase
      initialStatusFilter="active"
      pageTitle="Active Customer"
      pageSubtitle="List of actively registered and approved platform customers"
    />
  );
};

export const InactiveCustomers: React.FC = () => {
  return (
    <CustomerBase
      initialStatusFilter="inactive"
      pageTitle="Inactive Customer"
      pageSubtitle="Customers with deactivated or suspended account status"
    />
  );
};

export default AllCustomers;

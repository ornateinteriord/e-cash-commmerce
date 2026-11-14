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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DataTable, { TableColumn } from 'react-data-table-component';
import { DASHBOARD_CUTSOM_STYLE } from '../../../utils/DataTableColumnsProvider';
import { useGetCustomerTokens, useGetCustomerUplines, useGetCustomerTokenContributors } from '../../../api/Admin';
import TokenCoin from '../../../components/common/TokenCoin';
import UplinerDialog from '../../../components/common/UplinerDialog';

export const CustomerTokens: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: rawCustomers = [], isLoading } = useGetCustomerTokens();

  // Selected customer uplines & token contributors query
  const customerIdToQuery = selectedCustomer?.customerId || selectedCustomer?.customer_id || selectedCustomer?._id || null;
  const { data: contributorsData, isLoading: isContributorsLoading } = useGetCustomerTokenContributors(isDialogOpen ? customerIdToQuery : null);
  const { data: uplinesData, isLoading: isUplinesLoading } = useGetCustomerUplines(isDialogOpen ? customerIdToQuery : null);

  const handleRowClick = (row: any) => {
    setSelectedCustomer(row);
    setIsDialogOpen(true);
  };

  // Customer list from DB (db.customers / ornate_auth.customers)
  const customersList = useMemo(() => {
    if (!Array.isArray(rawCustomers)) return [];
    return rawCustomers;
  }, [rawCustomers]);

  // Search filtered customers
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customersList;
    const q = searchQuery.toLowerCase().trim();
    return customersList.filter((m: any) => {
      const id = String(m.customerId || m.customer_id || m.Member_id || m.member_id || '').toLowerCase();
      const name = String(m.name || m.fullName || m.Name || '').toLowerCase();
      const mobile = String(m.mobileNumber || m.phone || m.mobileno || '').toLowerCase();
      const email = String(m.email || '').toLowerCase();
      const referral = String(m.referralName || m.referralCode || m.Sponsor_name || m.sponsor_id || '').toLowerCase();
      const vendor = String(m.vendor_name || m.vendor_id || '').toLowerCase();
      return (
        id.includes(q) ||
        name.includes(q) ||
        mobile.includes(q) ||
        email.includes(q) ||
        referral.includes(q) ||
        vendor.includes(q)
      );
    });
  }, [customersList, searchQuery]);

  // Summary statistics
  const totalCustomerTokens = useMemo(() => {
    return customersList.reduce(
      (acc: number, m: any) =>
        acc + Number(m.token !== undefined && m.token !== null ? m.token : (m.tokens || m.customer_tokens || 0)),
      0
    );
  }, [customersList]);

  const activeCustomers = useMemo(() => {
    return customersList.filter((m: any) => String(m.status || '').toLowerCase() === 'active').length;
  }, [customersList]);

  const columns: TableColumn<any>[] = [
    {
      name: '#',
      selector: (_row: any, index?: number) => (index ?? 0) + 1,
      width: '60px',
      center: true,
    },
    {
      name: 'Customer ID',
      selector: (row: any) => row.customerId || row.customer_id || 'N/A',
      sortable: true,
      cell: (row: any) => (
        <Box sx={{ cursor: 'pointer' }}>
          <Typography sx={{ fontWeight: 800, color: '#0d9488', fontSize: '0.88rem' }}>
            {row.customerId || row.customer_id || 'N/A'}
          </Typography>
        </Box>
      ),
      minWidth: '130px',
    },
    {
      name: 'Customer Name',
      selector: (row: any) => row.name || row.fullName || 'N/A',
      sortable: true,
      cell: (row: any) => (
        <Box sx={{ cursor: 'pointer' }}>
          <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
            {row.name || row.fullName || 'N/A'}
          </Typography>
          {row.email && (
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
              {row.email}
            </Typography>
          )}
        </Box>
      ),
      minWidth: '180px',
    },
    {
      name: 'Mobile Number',
      selector: (row: any) => row.mobileNumber || row.phone || 'N/A',
      sortable: true,
      minWidth: '130px',
    },
    {
      name: 'Referred By',
      selector: (row: any) => row.referralName || row.referralCode || row.vendor_name || 'Direct',
      sortable: true,
      cell: (row: any) => (
        <Box>
          <Typography sx={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
            {row.referralName || row.vendor_name || 'Direct'}
          </Typography>
          {(row.referralCode || row.vendor_id) && (
            <Typography variant="caption" sx={{ color: '#0284c7', display: 'block' }}>
              Code: {row.referralCode || row.vendor_id}
            </Typography>
          )}
        </Box>
      ),
      minWidth: '160px',
    },
    {
      name: 'Level',
      selector: (row: any) => Number(row.level || 0),
      sortable: true,
      center: true,
      width: '90px',
      cell: (row: any) => (
        <Chip
          label={`Lvl ${row.level || 0}`}
          size="small"
          sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: '#f1f5f9', color: '#475569' }}
        />
      ),
    },
    {
      name: 'Tokens Balance',
      selector: (row: any) => Number(row.token !== undefined && row.token !== null ? row.token : (row.tokens || 0)),
      sortable: true,
      center: true,
      minWidth: '160px',
      cell: (row: any) => {
        const tokens = Number(row.token !== undefined && row.token !== null ? row.token : (row.tokens || 0));
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
            <TokenCoin value={tokens} size={32} />
            <Box
              sx={{
                px: 1.2,
                py: 0.3,
                borderRadius: '8px',
                bgcolor: tokens > 0 ? 'rgba(13, 148, 136, 0.12)' : '#f8fafc',
                border: tokens > 0 ? '1px solid rgba(13, 148, 136, 0.4)' : '1px solid #e2e8f0',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  color: tokens > 0 ? '#0f766e' : '#64748b',
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
      name: 'Account Status',
      selector: (row: any) => row.status || 'Active',
      sortable: true,
      center: true,
      width: '130px',
      cell: (row: any) => {
        const status = String(row.status || '').toLowerCase();
        const isActive = status === 'active';
        return (
          <Chip
            label={row.status || 'Active'}
            size="small"
            color={isActive ? 'success' : 'default'}
            variant={isActive ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700, fontSize: '0.74rem', textTransform: 'capitalize' }}
          />
        );
      },
    },
    {
      name: 'Upliners',
      center: true,
      width: '130px',
      cell: (row: any) => (
        <Chip
          icon={<AccountTreeIcon sx={{ fontSize: '14px !important' }} />}
          label="Upliners"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(row);
          }}
          sx={{
            fontWeight: 800,
            fontSize: '0.74rem',
            bgcolor: 'rgba(13, 148, 136, 0.12)',
            color: '#0f766e',
            border: '1px solid rgba(13, 148, 136, 0.35)',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: '#0d9488',
              color: '#ffffff',
            },
          }}
        />
      ),
    },
    {
      name: 'Registered Date',
      selector: (row: any) => row.createdAt || 'N/A',
      sortable: true,
      width: '140px',
      cell: (row: any) => (
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.82rem' }}>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <TokenCoin value={totalCustomerTokens} size={32} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
            Customer Tokens Management
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
          Monitor customer rewards, shopping token balances, and click any row to view upliner hierarchy.
        </Typography>
      </Box>

      {/* Summary KPI Cards */}
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        {/* Total Tokens Card */}
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: '14px',
              border: '1.5px solid #99f6e4',
              background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.08)',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: { xs: 1.8, sm: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#115e59', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Total Customer Tokens
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f766e', mt: 0.5, fontSize: { xs: '1.4rem', sm: '2rem' } }}>
                    {totalCustomerTokens.toLocaleString()}
                  </Typography>
                </Box>
                <TokenCoin value={totalCustomerTokens} size={40} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Customers Card */}
        <Grid item xs={6} sm={4}>
          <Card
            sx={{
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: { xs: 1.8, sm: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: { xs: '0.68rem', sm: '0.75rem' } }}
                  >
                    Total Customers
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#0284c7', mt: 0.5, fontSize: { xs: '1.25rem', sm: '2rem' } }}>
                    {customersList.length}
                  </Typography>
                </Box>
                <Box sx={{ p: { xs: 0.8, sm: 1.2 }, borderRadius: '10px', bgcolor: '#e0f2fe', color: '#0284c7' }}>
                  <PeopleIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Customers Card */}
        <Grid item xs={6} sm={4}>
          <Card
            sx={{
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: { xs: 1.8, sm: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: { xs: '0.68rem', sm: '0.75rem' } }}
                  >
                    Active Shoppers
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#16a34a', mt: 0.5, fontSize: { xs: '1.25rem', sm: '2rem' } }}>
                    {activeCustomers}
                  </Typography>
                </Box>
                <Box sx={{ p: { xs: 0.8, sm: 1.2 }, borderRadius: '10px', bgcolor: '#dcfce7', color: '#16a34a' }}>
                  <ShoppingBagIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />
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
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
                Customer Tokens List
              </Typography>
              <Typography variant="caption" sx={{ color: '#0d9488', fontWeight: 600 }}>
                💡 Click any row to view that customer's complete upliner tree
              </Typography>
            </Box>

            <TextField
              size="small"
              placeholder="Search by customer ID, name or phone..."
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
              <CircularProgress size={36} sx={{ color: '#0d9488' }} />
            </Box>
          ) : (
            <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <DataTable
                columns={columns}
                data={filteredCustomers}
                customStyles={DASHBOARD_CUTSOM_STYLE}
                pagination
                paginationPerPage={15}
                paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                highlightOnHover
                pointerOnHover
                onRowClicked={handleRowClick}
                responsive
                noDataComponent={
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ color: '#64748b' }}>
                      No customer records found in DB.
                    </Typography>
                  </Box>
                }
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Upliner Hierarchy Dialog */}
      <UplinerDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedCustomer(null);
        }}
        entityType="Customer"
        target={
          selectedCustomer
            ? {
                id: selectedCustomer.customerId || selectedCustomer.customer_id,
                member_code: selectedCustomer.customerId || selectedCustomer.customer_id,
                name: selectedCustomer.name || selectedCustomer.fullName,
                mobile: selectedCustomer.mobileNumber || selectedCustomer.phone,
                token: Number(
                  selectedCustomer.token !== undefined
                    ? selectedCustomer.token
                    : (selectedCustomer.tokens || 0)
                ),
                status: selectedCustomer.status,
              }
            : null
        }
        contributors={contributorsData?.contributors || []}
        isContributorsLoading={isContributorsLoading}
        uplines={uplinesData?.uplines || []}
        isUplinesLoading={isUplinesLoading}
      />
    </Box>
  );
};

export default CustomerTokens;

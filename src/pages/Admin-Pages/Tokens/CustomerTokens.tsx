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
import DataTable, { TableColumn } from 'react-data-table-component';
import { DASHBOARD_CUTSOM_STYLE } from '../../../utils/DataTableColumnsProvider';
import { useGetAllMembersDetails } from '../../../api/Admin';
import TokenCoin from '../../../components/common/TokenCoin';

export const CustomerTokens: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: allMembers = [], isLoading } = useGetAllMembersDetails();

  // In this system, customers are registered members with role 'CUSTOMER' or referred via customer referral links
  const customersList = useMemo(() => {
    if (!Array.isArray(allMembers)) return [];
    return allMembers.filter((m: any) => {
      const role = String(m.role || '').toUpperCase();
      return role === 'CUSTOMER' || role === 'USER';
    });
  }, [allMembers]);

  // Search filtered customers
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customersList;
    const q = searchQuery.toLowerCase().trim();
    return customersList.filter((m: any) => {
      const id = String(m.Member_id || m.member_id || '').toLowerCase();
      const code = String(m.member_code || '').toLowerCase();
      const name = String(m.Name || m.name || '').toLowerCase();
      const mobile = String(m.mobileno || m.contactno || '').toLowerCase();
      const sponsor = String(m.Sponsor_name || m.sponsor_id || '').toLowerCase();
      return id.includes(q) || code.includes(q) || name.includes(q) || mobile.includes(q) || sponsor.includes(q);
    });
  }, [customersList, searchQuery]);

  // Summary statistics
  const totalCustomerTokens = useMemo(() => {
    return customersList.reduce((acc: number, m: any) => acc + (Number(m.customer_tokens || m.tokens || 0)), 0);
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
      selector: (row: any) => row.member_code || row.Member_id || row.member_id || 'N/A',
      sortable: true,
      cell: (row: any) => (
        <Box>
          <Typography sx={{ fontWeight: 800, color: '#0d9488', fontSize: '0.88rem' }}>
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
      name: 'Customer Name',
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
      name: 'Referred by Vendor',
      selector: (row: any) => row.Sponsor_name || row.sponsor_id || 'Direct',
      sortable: true,
      cell: (row: any) => (
        <Box>
          <Typography sx={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
            {row.Sponsor_name || row.sponsor_id || 'Direct'}
          </Typography>
          {row.sponsor_id && (
            <Typography variant="caption" sx={{ color: '#0284c7' }}>
              Vendor ID: {row.sponsor_id}
            </Typography>
          )}
        </Box>
      ),
      minWidth: '160px',
    },
    {
      name: 'Tokens Balance',
      selector: (row: any) => Number(row.customer_tokens || row.tokens || 0),
      sortable: true,
      center: true,
      minWidth: '160px',
      cell: (row: any) => {
        const tokens = Number(row.customer_tokens || row.tokens || 0);
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
                alignItems: 'center'
              }}
            >
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  color: tokens > 0 ? '#0f766e' : '#64748b'
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
      name: 'Registered Date',
      selector: (row: any) => row.Date_of_joining || row.createdAt || 'N/A',
      sortable: true,
      width: '140px',
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
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <TokenCoin value={totalCustomerTokens} size={36} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Customer Tokens Management
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
          Monitor customer rewards, shopping token balances, and referral incentives.
        </Typography>
      </Box>

      {/* Summary KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Total Tokens Card */}
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: '14px',
              border: '1.5px solid #99f6e4',
              background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.08)',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#115e59', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Customer Tokens
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f766e', mt: 0.5 }}>
                    {totalCustomerTokens.toLocaleString()}
                  </Typography>
                </Box>
                <TokenCoin value={totalCustomerTokens} size={48} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Customers Card */}
        <Grid item xs={12} sm={4}>
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
                    Total Customers
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#0284c7', mt: 0.5 }}>
                    {customersList.length}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: '12px', bgcolor: '#e0f2fe', color: '#0284c7' }}>
                  <PeopleIcon sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Customers Card */}
        <Grid item xs={12} sm={4}>
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
                    Active Shoppers
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#16a34a', mt: 0.5 }}>
                    {activeCustomers}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: '12px', bgcolor: '#dcfce7', color: '#16a34a' }}>
                  <ShoppingBagIcon sx={{ fontSize: 32 }} />
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
              Customer Tokens List
            </Typography>

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
            <DataTable
              columns={columns}
              data={filteredCustomers}
              customStyles={DASHBOARD_CUTSOM_STYLE}
              pagination
              paginationPerPage={15}
              paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
              highlightOnHover
              responsive
              noDataComponent={
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ color: '#64748b' }}>
                    No customer records found.
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

export default CustomerTokens;


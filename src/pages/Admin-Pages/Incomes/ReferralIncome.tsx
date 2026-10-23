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
} from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import DataTable from "react-data-table-component";
import {
  DASHBOARD_CUTSOM_STYLE,
  getAdminReferralIncomeColumns,
  getAdminAggregatedIncomeColumns,
} from '../../../utils/DataTableColumnsProvider';
import { useGetAllTransactionDetails } from '../../../api/Admin';

const ReferralIncome = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"detailed" | "summary">("detailed");

  const { data: allTransactions, isLoading, isError } = useGetAllTransactionDetails();

  // Filter transactions for Referral Bonus
  const referralBenefits: any[] = (allTransactions || []).filter((transaction: any) => {
    if (!transaction || typeof transaction !== 'object') return false;
    const txType = (transaction.transaction_type || "").toLowerCase();
    return txType.includes('referral bonus');
  });

  // Calculate summary statistics
  const totalAmount = referralBenefits.reduce(
    (sum, t) => sum + parseFloat(t.ew_credit || t.amount || 0),
    0
  );
  const uniqueSponsors = new Set(
    referralBenefits.map((t) => t.member_id).filter(Boolean)
  ).size;

  // Aggregate by member for Summary view
  const aggregatedData = referralBenefits.reduce((acc: any, curr: any) => {
    const memberId = curr.member_id || curr.related_member_id || 'N/A';
    if (!acc[memberId]) {
      acc[memberId] = {
        member_id: memberId,
        name: curr.Name || curr.name || curr.memberName || curr.member_name || '-',
        totalAmount: 0,
        txCount: 0,
      };
    }
    acc[memberId].totalAmount += parseFloat(curr.ew_credit || curr.amount || 0);
    acc[memberId].txCount += 1;
    return acc;
  }, {});
  const summaryList = Object.values(aggregatedData);

  // Filtered detailed transactions
  const filteredDetailedData = referralBenefits.filter((item: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.transaction_id && item.transaction_id.toLowerCase().includes(q)) ||
      (item.member_id && item.member_id.toLowerCase().includes(q)) ||
      (item.Name && item.Name.toLowerCase().includes(q)) ||
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.related_member_id && item.related_member_id.toLowerCase().includes(q)) ||
      (item.related_member_name && item.related_member_name.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.status && item.status.toLowerCase().includes(q)) ||
      (item.ew_credit && item.ew_credit.toString().includes(q))
    );
  });

  // Filtered summary data
  const filteredSummaryData = summaryList.filter((item: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.member_id && item.member_id.toLowerCase().includes(q)) ||
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.totalAmount && item.totalAmount.toString().includes(q))
    );
  });

  const noDataComponent = (
    <div style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>
      {isError ? "Error loading referral commission data" : "No referral commission records found"}
    </div>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, mt: 8 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
          Referral Commission
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
          Track all direct sponsor commission earnings, downline investors, rates, and transaction details
        </Typography>
      </Box>

      {/* Summary KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2.5 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '10px',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}
              >
                <PaymentsIcon />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Total Commission Paid
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#16a34a', mt: 0.2 }}>
                  ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2.5 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '10px',
                  backgroundColor: '#dbeafe',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}
              >
                <ReceiptLongIcon />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Total Transactions
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.2 }}>
                  {referralBenefits.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2.5 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '10px',
                  backgroundColor: '#f3e8ff',
                  color: '#9333ea',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}
              >
                <PeopleAltIcon />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Earning Sponsors
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.2 }}>
                  {uniqueSponsors}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Table Card */}
      <Card
        sx={{
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {/* Controls Bar: Toggle & Search */}
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
            {/* View Mode Toggle */}
            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(_, nextView) => {
                if (nextView) setViewMode(nextView);
              }}
              sx={{
                '& .MuiToggleButton-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '13px',
                  px: 2,
                  py: 0.6,
                },
                '& .Mui-selected': {
                  backgroundColor: '#6D214F !important',
                  color: '#ffffff !important',
                },
              }}
            >
              <ToggleButton value="detailed">
                Detailed Records ({referralBenefits.length})
              </ToggleButton>
              <ToggleButton value="summary">
                Vendor Summary ({summaryList.length})
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Search Input */}
            <TextField
              size="small"
              placeholder={
                viewMode === "detailed"
                  ? "Search by Sponsor Name, Sponsor ID, Vendor..."
                  : "Search by Vendor ID or Name..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 300 } }}
            />
          </Box>

          {/* DataTable */}
          <DataTable
            columns={
              viewMode === "detailed"
                ? getAdminReferralIncomeColumns()
                : getAdminAggregatedIncomeColumns()
            }
            data={viewMode === "detailed" ? filteredDetailedData : filteredSummaryData}
            pagination
            customStyles={DASHBOARD_CUTSOM_STYLE}
            paginationPerPage={25}
            paginationRowsPerPageOptions={[25, 50, 100]}
            highlightOnHover
            noDataComponent={noDataComponent}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReferralIncome;

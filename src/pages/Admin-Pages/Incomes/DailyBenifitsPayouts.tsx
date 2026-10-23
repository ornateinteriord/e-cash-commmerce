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
  getAdminDailyIncentiveColumns,
  getAdminAggregatedIncomeColumns,
} from '../../../utils/DataTableColumnsProvider';
import { useGetAllDailyPayouts } from '../../../api/Admin';
import { TriggerMissingROIButton } from '../../../components/Dialogs/TriggerMissingROIDialog';

const SingleLevelIncomeAdmin = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"detailed" | "summary">("detailed");

  const { data: dailyBenefits, isLoading, isError } = useGetAllDailyPayouts();

  const benefitsList: any[] = Array.isArray(dailyBenefits) ? dailyBenefits : [];

  // Calculate summary statistics
  const totalAmount = benefitsList.reduce(
    (sum, t) => sum + parseFloat(t.ew_credit || t.amount || 0),
    0
  );
  const uniqueMembers = new Set(
    benefitsList.map((t) => t.member_id).filter(Boolean)
  ).size;

  // Aggregate daily benefits by member for Summary view
  const aggregatedData = benefitsList.reduce((acc: any, curr: any) => {
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
  const filteredDetailedData = benefitsList.filter((item: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.transaction_id && item.transaction_id.toLowerCase().includes(q)) ||
      (item.member_id && item.member_id.toLowerCase().includes(q)) ||
      (item.Name && item.Name.toLowerCase().includes(q)) ||
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.mobileno && item.mobileno.toLowerCase().includes(q)) ||
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
      {isError ? "Error loading daily incentive data" : "No daily incentive records found"}
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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Daily Incentive
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Track all daily return payouts (1% Daily), vendor details, cycle progress, and transaction statuses
          </Typography>
        </Box>
        <TriggerMissingROIButton defaultType="daily_incentive" pageTitle="Daily Incentive" label="Trigger Missing Incentive" />
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
                  Total Incentive Paid
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
                  Total Payout Records
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.2 }}>
                  {benefitsList.length}
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
                  Active Investors
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.2 }}>
                  {uniqueMembers}
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
                Detailed Records ({benefitsList.length})
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
                  ? "Search by Vendor Name, Vendor ID, Mobile..."
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
                ? getAdminDailyIncentiveColumns()
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

export default SingleLevelIncomeAdmin;

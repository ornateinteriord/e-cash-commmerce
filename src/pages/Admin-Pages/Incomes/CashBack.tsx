import { Box, Button, Card, CardContent, Grid, TextField, Typography, CircularProgress } from '@mui/material';
import { MuiDatePicker } from '../../../components/common/DateFilterComponent';
import './CashBack.scss';
import DataTable from "react-data-table-component";
import { DASHBOARD_CUTSOM_STYLE, getCashBackColumns } from '../../../utils/DataTableColumnsProvider';
import { useState, useMemo } from 'react';
import useSearch from '../../../hooks/SearchQuery';
import { useGetAllDailyPayouts } from '../../../api/Admin';

const CashBack = () => {
  const { data: rawPayouts, isLoading } = useGetAllDailyPayouts();
  const data = useMemo(() => (Array.isArray(rawPayouts) ? rawPayouts : []), [rawPayouts]);

  const [memberId, setMemberId] = useState("");
  const [appliedMemberId, setAppliedMemberId] = useState("");

  const {
    searchQuery,
    setSearchQuery,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    appliedDates,
    handleDateSearch,
    handleDateReset,
    filteredData,
  } = useSearch(data);

  const onSearchClick = () => {
    setAppliedMemberId(memberId.trim());
    handleDateSearch();
  };

  const onResetClick = () => {
    setMemberId("");
    setAppliedMemberId("");
    handleDateReset();
  };

  const finalData = useMemo(() => {
    if (!filteredData || !Array.isArray(filteredData)) return [];
    if (!appliedMemberId) return filteredData;

    const q = appliedMemberId.toLowerCase();
    return filteredData.filter((item: any) => {
      const mId = String(item.member_id || item.Member_id || item.Member || '').toLowerCase();
      const mCode = String(item.member_code || '').toLowerCase();
      return mId.includes(q) || mCode.includes(q);
    });
  }, [filteredData, appliedMemberId]);

  const noDataComponent = (
    <Box sx={{
      padding: "40px",
      textAlign: "center",
      color: "text.secondary"
    }}>
      <Typography variant="h6" gutterBottom>
        No Data Found
      </Typography>
      <Typography variant="body2">
        No daily benefits data available to display.
      </Typography>
    </Box>
  );

  return (
    <>
      <Grid
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        className="Cashback-container"
        sx={{ margin: "1rem", mt: 12 }}
      >
        <Typography variant="h4">Daily Benefits</Typography>
        <Grid className="Cashback-content" sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Member Id"
            className="member-id"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSearchClick(); }}
          />
          <MuiDatePicker date={fromDate} setDate={setFromDate} label="From Date" />
          <MuiDatePicker date={toDate} setDate={setToDate} label="To Date" />
          <Button
            variant="contained"
            onClick={onSearchClick}
            sx={{
              backgroundColor: "#0a2558",
              "&:hover": { backgroundColor: "#0a2558" },
            }}
          >
            Search
          </Button>
          {(fromDate || toDate || memberId || appliedDates.from || appliedDates.to || appliedMemberId) && (
            <Button
              variant="outlined"
              onClick={onResetClick}
              sx={{
                borderColor: '#0a2558',
                color: '#0a2558',
                '&:hover': { borderColor: '#0a2558', backgroundColor: 'rgba(10, 37, 88, 0.04)' },
              }}
            >
              Reset
            </Button>
          )}
        </Grid>
      </Grid>
      <Card sx={{ margin: "1rem", mt: 2 }}>
        <CardContent>
          <div style={{ marginBottom: "1rem", color: "#000", fontWeight: "bold", fontSize: "1.25rem" }}>
            List of Daily Benefits Payouts
          </div>
          <Box
            sx={{
              display: "flex",
              gap: "1rem",
              justifyContent: "flex-end",
              marginBottom: "1rem",
            }}
          >
            <TextField
              size="small"
              placeholder="Search..."
              sx={{ minWidth: 200 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>
          <DataTable
            columns={getCashBackColumns()}
            data={finalData}
            pagination
            customStyles={DASHBOARD_CUTSOM_STYLE}
            paginationPerPage={25}
            paginationRowsPerPageOptions={[25, 50, 100]}
            highlightOnHover
            progressPending={isLoading}
            progressComponent={<CircularProgress size={"4rem"} sx={{ color: "#0a2558" }} />}
            noDataComponent={noDataComponent}
            subHeader
            subHeaderComponent={
              <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                p: 1
              }}>
                <Typography variant="body2" color="textSecondary">
                  {finalData.length === 0 ? "No records found" : `Showing ${finalData.length} records`}
                </Typography>
              </Box>
            }
          />
        </CardContent>
      </Card>
    </>
  );
};

export default CashBack;

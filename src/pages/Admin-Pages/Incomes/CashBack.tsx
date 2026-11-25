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
        className="Cashback-container"
        sx={{
          margin: { xs: "0.75rem", sm: "1rem", md: "1.5rem" },
          mt: { xs: 4, sm: 10, md: 11 },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: '1.35rem', sm: '1.55rem', md: '1.75rem' },
            fontWeight: 700,
            color: '#1e293b',
            letterSpacing: '-0.02em',
          }}
        >
          Daily Benefits
        </Typography>
        <Grid className="Cashback-content">
          <TextField
            size="small"
            placeholder="Member Id"
            className="member-id"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSearchClick(); }}
          />
          <Box className="date-filter-group">
            <MuiDatePicker date={fromDate} setDate={setFromDate} label="From Date" />
            <MuiDatePicker date={toDate} setDate={setToDate} label="To Date" />
          </Box>
          <Box className="btn-group">
            <Button
              variant="contained"
              onClick={onSearchClick}
              sx={{
                backgroundColor: "#0a2558",
                "&:hover": { backgroundColor: "#0a2558" },
                whiteSpace: "nowrap",
                minWidth: "80px",
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
                  whiteSpace: "nowrap",
                  minWidth: "80px",
                }}
              >
                Reset
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
      <Card
        sx={{
          margin: { xs: "0.75rem", sm: "1rem", md: "1.5rem" },
          mt: 2,
          borderRadius: 2,
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 1.5,
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#1e293b",
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
              }}
            >
              List of Daily Benefits Payouts
            </Typography>
            <TextField
              size="small"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: { xs: "100%", sm: 220, md: 260 },
              }}
            />
          </Box>
          <Box sx={{ width: "100%", overflowX: "auto" }}>
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
              responsive
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
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

export default CashBack;

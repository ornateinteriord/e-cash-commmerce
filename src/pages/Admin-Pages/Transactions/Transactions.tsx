import DataTable from "react-data-table-component";
import { Card, CardContent, TextField, Typography, Button, Grid, CircularProgress, Box } from '@mui/material';
import './Transactions.scss';
import { DASHBOARD_CUTSOM_STYLE, getAdminPageTransactionColumns } from '../../../utils/DataTableColumnsProvider';
import { MuiDatePicker } from '../../../components/common/DateFilterComponent';
import { useGetAllTransactionDetails } from '../../../api/Admin';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import useSearch from "../../../hooks/SearchQuery";

const Transactions = () => {
  const {
    data: transactions,
    isLoading,
    isError,
    error,
  } = useGetAllTransactionDetails();

  useEffect(() => {
    if (isError) {
      const err = error as any;
      toast.error(
        err?.response?.data?.message || "Failed to fetch Transaction details"
      );
    }
  }, [isError, error]);

  return (
    <TransactionDataTable
      title="Transactions"
      summaryTitle="List of Transactions"
      data={transactions}
      columns={getAdminPageTransactionColumns()}
      isLoading={isLoading}
    />
  );
};

export default Transactions;

export const TransactionDataTable = ({
  title,
  summaryTitle,
  data,
  columns,
  isLoading,
  searchQuery: externalSearchQuery,
  setSearchQuery: externalSetSearchQuery,
}: {
  title: string;
  summaryTitle: string;
  data: any;
  columns: any;
  isLoading?: boolean;
  searchQuery?: string;
  setSearchQuery?: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [vendorId, setVendorId] = useState<string>('');
  const [appliedVendorId, setAppliedVendorId] = useState<string>('');

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

  const activeSearchQuery = externalSearchQuery !== undefined ? externalSearchQuery : searchQuery;
  const handleSearchChange = (val: string) => {
    if (externalSetSearchQuery) {
      externalSetSearchQuery(val);
    }
    setSearchQuery(val);
  };

  const onSearchClick = () => {
    setAppliedVendorId(vendorId.trim());
    handleDateSearch();
  };

  const onResetClick = () => {
    setVendorId('');
    setAppliedVendorId('');
    handleDateReset();
  };

  const finalData = useMemo(() => {
    if (!filteredData || !Array.isArray(filteredData)) return [];
    if (!appliedVendorId) return filteredData;

    const q = appliedVendorId.toLowerCase();
    return filteredData.filter((item: any) => {
      const vId = String(item.member_id || item.Member_id || '').toLowerCase();
      const vCode = String(item.member_code || '').toLowerCase();
      return vId.includes(q) || vCode.includes(q);
    });
  }, [filteredData, appliedVendorId]);

  return (
    <>
      <Grid
        className="transaction-container"
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
          {title}
        </Typography>
        <Grid className="transaction-content">
          <TextField
            size="small"
            placeholder="Vendor Id"
            className="member-id"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearchClick();
            }}
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
            {(fromDate || toDate || vendorId || appliedDates.from || appliedDates.to || appliedVendorId) && (
              <Button
                variant="outlined"
                onClick={onResetClick}
                sx={{
                  borderColor: "#0a2558",
                  color: "#0a2558",
                  "&:hover": { borderColor: "#0a2558", backgroundColor: "rgba(10, 37, 88, 0.04)" },
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
              {summaryTitle}
            </Typography>
            <TextField
              size="small"
              placeholder="Search..."
              value={activeSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              sx={{
                width: { xs: "100%", sm: 220, md: 260 },
              }}
            />
          </Box>
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <DataTable
              columns={columns}
              data={finalData}
              pagination
              customStyles={DASHBOARD_CUTSOM_STYLE}
              paginationPerPage={25}
              progressPending={isLoading}
              progressComponent={
                <CircularProgress size={"4rem"} sx={{ color: "#0a2558" }} />
              }
              paginationRowsPerPageOptions={[25, 50, 100]}
              highlightOnHover
              responsive
            />
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

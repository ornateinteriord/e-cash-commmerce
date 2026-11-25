import DataTable from "react-data-table-component";
import { Card, CardContent, TextField, Typography, Button, Grid, CircularProgress } from '@mui/material';
import './Transactions.scss'
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
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        className="transaction-container"
        sx={{ margin: "1rem", mt: 12 }}
      >
        <Typography variant="h4">{title}</Typography>
        <Grid className="transaction-content" sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Vendor Id"
            className="member-id"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
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
          {(fromDate || toDate || vendorId || appliedDates.from || appliedDates.to || appliedVendorId) && (
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
            {summaryTitle}
          </div>
          <div
            style={{
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
              value={activeSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
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
          />
        </CardContent>
      </Card>
    </>
  );
};

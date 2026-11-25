import { useState, useMemo } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, InputAdornment, Card, CardContent, Grid, CircularProgress, Button } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { getPendingLoansColumns } from '../../../utils/DataTableColumnsProvider';
import { MuiDatePicker, isWithinDateRange, getItemDateValue } from '../../../components/common/DateFilterComponent';
import { useGetRewardLoansByStatus, useUpdateRewardLoanStatus } from '../../../api/Admin';
import { toast } from 'react-toastify';

export default function PendingLoans() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [appliedDates, setAppliedDates] = useState<{ from: string | null; to: string | null }>({ from: null, to: null });

  const {
    data: pendingLoansData,
    isLoading,
    error,
    refetch
  } = useGetRewardLoansByStatus("Processing");

  const updateLoanMutation = useUpdateRewardLoanStatus();

  const pendingLoans = pendingLoansData?.loans || [];

  const handleProcessLoan = async (memberId: string, action: 'approve' | 'reject') => {
    try {
      await updateLoanMutation.mutateAsync({
        memberId,
        action
      });
      toast.success(`Loan ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      refetch();
    } catch (err) {
      console.error('Error processing loan:', err);
    }
  };

  const columns = getPendingLoansColumns(handleProcessLoan);

  const handleDateSearch = () => {
    setAppliedDates({ from: fromDate || null, to: toDate || null });
    setPage(0);
  };

  const handleDateReset = () => {
    setFromDate(null);
    setToDate(null);
    setAppliedDates({ from: null, to: null });
    setPage(0);
  };

  const filteredLoans = useMemo(() => {
    if (!pendingLoans || !Array.isArray(pendingLoans)) return [];
    const q = searchTerm.toLowerCase().trim();
    const activeFrom = appliedDates.from;
    const activeTo = appliedDates.to;
    const hasDateFilter = Boolean(activeFrom || activeTo);

    return pendingLoans.filter((item: any) => {
      // 1. Text Search
      if (q) {
        const matches = Object.values(item).some(v => v && String(v).toLowerCase().includes(q));
        if (!matches) return false;
      }

      // 2. Date Filter
      if (hasDateFilter) {
        const itemDate = getItemDateValue(item);
        if (!isWithinDateRange(itemDate, activeFrom, activeTo)) {
          return false;
        }
      }

      return true;
    });
  }, [pendingLoans, searchTerm, appliedDates]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = filteredLoans.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const renderCellContent = (row: any, column: any) => {
    if (column.cell) {
      return column.cell(row);
    }

    if (column.selector) {
      const value = column.selector(row);

      if (column.name === 'Loan Amount') {
        return `${(value || 0).toLocaleString()}`;
      }

      return value || '-';
    }

    return '-';
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ margin: '2rem', mt: 12 }}>
        <Typography color="error">
          Error loading pending loans
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid className="filter-container" sx={{ margin: '2rem', mt: 12 }}>
        <Typography variant="h4">
          Pending Loans
        </Typography>
        <Grid className="filter-actions" sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
          <MuiDatePicker date={fromDate} setDate={setFromDate} label="From Date" />
          <MuiDatePicker date={toDate} setDate={setToDate} label="To Date" />
          <Button
            variant="contained"
            onClick={handleDateSearch}
            sx={{
              backgroundColor: '#0a2558',
              '&:hover': { backgroundColor: '#0a2558' }
            }}
          >
            Search
          </Button>
          {(fromDate || toDate || appliedDates.from || appliedDates.to) && (
            <Button
              variant="outlined"
              onClick={handleDateReset}
              sx={{
                borderColor: '#0a2558',
                color: '#0a2558',
                '&:hover': { borderColor: '#0a2558', backgroundColor: 'rgba(10, 37, 88, 0.04)' }
              }}
            >
              Reset
            </Button>
          )}
        </Grid>
      </Grid>

      <Card sx={{ margin: '2rem', mt: 2 }}>
        <CardContent>
          <div style={{ marginBottom: "1rem", color: "#000", fontWeight: "bold", fontSize: "1.25rem" }}>
            <Typography variant="h6">
              List of Pending Loans ({filteredLoans.length})
            </Typography>
          </div>
          <Box sx={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <TextField
              size="small"
              placeholder="Search..."
              sx={{ minWidth: 200 }}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#0a2558' }}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.name}
                      sx={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
                    >
                      {column.name}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row: any) => (
                    <TableRow
                      key={row._id}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                        '&:hover': { backgroundColor: 'action.selected' }
                      }}
                    >
                      {columns.map((column) => (
                        <TableCell key={`${row._id}-${column.name}`}>
                          {renderCellContent(row, column)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      No pending loans found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredLoans.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>
    </>
  );
}

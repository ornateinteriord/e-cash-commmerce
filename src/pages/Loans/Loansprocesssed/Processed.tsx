import { useState, useMemo } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, InputAdornment, Card, CardContent, Grid, Button, Chip } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { getProcessedLoansColumns } from '../../../utils/DataTableColumnsProvider';
import { MuiDatePicker, isWithinDateRange, getItemDateValue } from '../../../components/common/DateFilterComponent';
import { useGetRewardLoansByStatus } from '../../../api/Admin';

export default function Processed() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [appliedDates, setAppliedDates] = useState<{ from: string | null; to: string | null }>({ from: null, to: null });

  const { data: processedData, isLoading: processedLoading } = useGetRewardLoansByStatus("Approved");

  const columns = getProcessedLoansColumns();

  const loans = processedData?.loans || [];

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
    if (!loans || !Array.isArray(loans)) return [];
    const q = searchTerm.toLowerCase().trim();
    const activeFrom = appliedDates.from;
    const activeTo = appliedDates.to;
    const hasDateFilter = Boolean(activeFrom || activeTo);

    return loans.filter((item: any) => {
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
  }, [loans, searchTerm, appliedDates]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = filteredLoans.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getStatusChipColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const renderCellContent = (row: any, column: any) => {
    if (column.name === 'Status' && column.cell) {
      return column.cell(row);
    }
    return column.selector ? column.selector(row) : '-';
  };

  if (processedLoading) {
    return <Typography>Loading processed loans...</Typography>;
  }

  return (
    <>
      <Grid className="filter-container" sx={{ margin: '2rem', mt: 12 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Processed Loans
              </Typography>
            </Box>
          </Box>
        </Box>
        <Grid className="filter-actions" sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
            List of Processed Loans (Total: {filteredLoans.length})
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
                      key={row.id || row._id}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                        '&:hover': { backgroundColor: 'action.selected' }
                      }}
                    >
                      {columns.map((column) => (
                        <TableCell key={`${row.id || row._id}-${column.name}`}>
                          {column.name === 'Status' ? (
                            <Chip
                              label={row.status}
                              color={getStatusChipColor(row.status)}
                              size="small"
                            />
                          ) : (
                            renderCellContent(row, column)
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      No processed loans found
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

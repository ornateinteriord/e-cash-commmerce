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
      <Grid
        className="filter-container"
        sx={{
          margin: { xs: '0.75rem', sm: '1rem', md: '1.5rem' },
          mt: { xs: 8, sm: 10, md: 12 },
        }}
      >
        <Typography variant="h4">
          Processed Loans
        </Typography>
        <Grid className="filter-actions">
          <Box className="date-filter-group">
            <MuiDatePicker date={fromDate} setDate={setFromDate} label="From Date" />
            <MuiDatePicker date={toDate} setDate={setToDate} label="To Date" />
          </Box>
          <Box className="btn-group">
            <Button
              variant="contained"
              onClick={handleDateSearch}
              sx={{
                backgroundColor: '#0a2558',
                '&:hover': { backgroundColor: '#0a2558' },
                whiteSpace: "nowrap",
                minWidth: "80px",
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
          margin: { xs: '0.75rem', sm: '1rem', md: '1.5rem' },
          mt: 2,
          borderRadius: 2,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 1.5,
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              List of Processed Loans (Total: {filteredLoans.length})
            </Typography>
            <TextField
              size="small"
              placeholder="Search..."
              sx={{ width: { xs: '100%', sm: 220, md: 260 } }}
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

          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#0a2558' }}>
                    {columns.map((column) => (
                      <TableCell
                        key={column.name}
                        sx={{
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          whiteSpace: 'nowrap',
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
          </Box>

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

import { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TableSortLabel, TextField, InputAdornment, Card, CardContent, Grid, Button, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, DialogContentText, Tabs, Tab,  } from '@mui/material';
import { Search as SearchIcon,  } from '@mui/icons-material';

import { MuiDatePicker, isWithinDateRange } from '../../../components/common/DateFilterComponent';
import { getLoansListColumns } from '../../../utils/DataTableColumnsProvider';
import { useGetAllTransactionDetails } from '../../../api/Admin';
import { useCreatePaymentOrder } from '../../../api/Memeber';
import { toast } from 'react-toastify';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`repayment-tabpanel-${index}`}
      aria-labelledby={`repayment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export default function LoansList() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [repayDialogOpen, setRepayDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [repayAmount, setRepayAmount] = useState<number>(500);
  const [tabValue, setTabValue] = useState(0);
  const [manualAmount, setManualAmount] = useState<string>('');

  const {
    data: transactionsResponse,
    isLoading,
    error,
    refetch
  } = useGetAllTransactionDetails();

  const { mutate: createPaymentOrder, isPending: isCreatingOrder } = useCreatePaymentOrder();

  const allTransactions = transactionsResponse || [];
  const loanTransactions = allTransactions
    .filter((transaction: any) =>
      (transaction.transaction_type?.toLowerCase().includes('loan') ||
        transaction.benefit_type === 'loan') &&
      transaction.status === 'Approved'
    )
    .map((transaction: any) => ({
      id: transaction.id || transaction.transaction_id,
      transaction_date: transaction.transaction_date || transaction.created_at,
      member_id: transaction.member_id,
      Name: transaction.Name || 'N/A',
      mobileno: transaction.mobileno || 'N/A',
      // Fix for backend issue: If Unpaid, use ew_credit (full amount) as net_amount (due), otherwise trust net_amount
      net_amount: transaction.repayment_status === 'Unpaid' && parseFloat(transaction.ew_credit) > 0
        ? parseFloat(transaction.ew_credit)
        : parseFloat(transaction.net_amount) || 0,
      ew_debit: parseFloat(transaction.ew_debit) || 0,
      ew_credit: parseFloat(transaction.ew_credit) || 0,
      status: transaction.status || 'Approved',
      originalData: transaction
    }));

  const handleRepayClick = (row: any) => {
    setSelectedLoan(row);
    setRepayAmount(500);
    setManualAmount('');
    setTabValue(0);
    setRepayDialogOpen(true);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleManualAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*/.test(value)) {
      setManualAmount(value);
    }
  };

  const getFinalRepayAmount = (): number => {
    if (tabValue === 0) {
      return repayAmount;
    } else {
      return manualAmount ? parseFloat(manualAmount) : 0;
    }
  };

  const handleRepayment = () => {
    if (!selectedLoan) return;

    const memberId = selectedLoan.member_id;
    const finalAmount = getFinalRepayAmount();
    const dueAmount = selectedLoan.net_amount;

    if (finalAmount <= 0) {
      toast.error('Please enter a valid repayment amount');
      return;
    }

    if (finalAmount > dueAmount) {
      toast.error(`Repayment exceeds due amount ${dueAmount}`);
      return;
    }

    if (finalAmount < 500) {
      toast.error('Minimum repayment amount is 500');
      return;
    }

    // Create payment order instead of direct repayment
    createPaymentOrder({
      amount: finalAmount,
      currency: "USD",
      customer: {
        customer_id: memberId.toString(),
        customer_email: selectedLoan.email || "",
        customer_phone: selectedLoan.mobileno || "",
        customer_name: selectedLoan.Name || ""
      }
    }, {
      onSuccess: () => {
        setRepayDialogOpen(false);
        setManualAmount('');
        refetch();
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to initialize payment');
      },
    });
  };

  const [appliedDates, setAppliedDates] = useState<{ from: string | null; to: string | null }>({ from: null, to: null });

  const handleSearch = () => {
    setAppliedDates({ from: fromDate || null, to: toDate || null });
    setPage(0);
    refetch();
  };

  const handleReset = () => {
    setFromDate(null);
    setToDate(null);
    setAppliedDates({ from: null, to: null });
    setPage(0);
  };

  const columns = getLoansListColumns(handleRepayClick);

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const filteredData = loanTransactions.filter((row: any) => {
    if (searchTerm) {
      const matches = Object.values(row).some(v => v?.toString().toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matches) return false;
    }
    if (appliedDates.from || appliedDates.to) {
      const itemDate = row.transaction_date || row.created_at || row.originalData?.createdAt || row.originalData?.transaction_date;
      if (!isWithinDateRange(itemDate, appliedDates.from, appliedDates.to)) {
        return false;
      }
    }
    return true;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!orderBy) return 0;
    const aValue = a[orderBy as keyof typeof a];
    const bValue = b[orderBy as keyof typeof b];
    return order === 'asc' ? (aValue < bValue ? -1 : aValue > bValue ? 1 : 0)
      : (aValue > bValue ? -1 : aValue < bValue ? 1 : 0);
  });

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const renderCellContent = (row: any, column: any) =>
    column.selector ? column.selector(row) : '-';

  if (error) {
    return (
      <Box sx={{ margin: '2rem', mt: 12 }}>
        <Alert severity="error">Error loading loan data: {error.message}</Alert>
      </Box>
    );
  }

  return (
    <>
      <Grid sx={{ margin: '2rem', mt: 12 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            Loans List
          </Typography>
        </Box>
        <Grid sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <MuiDatePicker date={fromDate} setDate={setFromDate} label="From Date" />
          <MuiDatePicker date={toDate} setDate={setToDate} label="To Date" />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{
              textTransform: 'capitalize',
              backgroundColor: '#0a2558',
              '&:hover': { backgroundColor: '#0a2558' },
            }}
          >
            Search
          </Button>
          {(fromDate || toDate || appliedDates.from || appliedDates.to) && (
            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{
                textTransform: 'capitalize',
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

      <Card sx={{ margin: '2rem', mt: 2 }}>
        <CardContent>
          <div style={{ marginBottom: "1rem", color: "#000", fontWeight: "bold", fontSize: "1.25rem"     }}>List of Approved Loan Transactions {isLoading && <CircularProgress size={16} sx={{ color: '#fff', ml: 2 }} />}</div>
          {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : loanTransactions.length === 0 ? (
                <Typography textAlign="center" color="textSecondary" py={4}>
                  No approved loan transactions found
                </Typography>
              ) : (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <TextField
                      size="small"
                      placeholder="Search loans..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#0a2558' }}>
                          {columns.map((col) => (
                            <TableCell key={col.name} sx={{ color: 'white', fontWeight: 'bold' }}>
                              {col.sortable ? (
                                <TableSortLabel
                                  active={orderBy === col.name}
                                  onClick={() => handleSort(col.name)}
                                  sx={{ color: 'white !important' }}
                                >
                                  {col.name}
                                </TableSortLabel>
                              ) : (
                                col.name
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedData.map((row) => (
                          <TableRow key={row.id}>
                            {columns.map((col) => (
                              <TableCell key={`${row.id}-${col.name}`}>
                                {col.cell ? col.cell(row) : renderCellContent(row, col)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </>
              )}
        </CardContent>
      </Card>

      {/* Enhanced Repay Dialog */}
      <Dialog
        open={repayDialogOpen}
        onClose={() => !isCreatingOrder && setRepayDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            minWidth: { xs: '320px', sm: '450px' },
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            color: '#0a2558',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            pb: 1
          }}
        >
          Loan Repayment
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            sx={{
              textAlign: 'center',
              mb: 3,
              fontSize: '1rem',
              color: '#4b5563',
              lineHeight: 1.6,
            }}
          >
            Choose the repayment amount and confirm to proceed.
          </DialogContentText>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: '#6b7280',
                mb: 1.5,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Loan Summary
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                p: 1.5,
                backgroundColor: '#f8fafc',
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}>
                <Typography sx={{ color: '#64748b' }}>Member ID</Typography>
                <Typography sx={{ fontWeight: 600 }}>{selectedLoan?.member_id}</Typography>
              </Box>

              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                p: 1.5,
                backgroundColor: '#f8fafc',
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}>
                <Typography sx={{ color: '#64748b' }}>Due Amount</Typography>
                <Typography sx={{ fontWeight: 700, color: '#dc2626' }}>
                  ${selectedLoan?.net_amount?.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            sx={{
              mb: 2,
              '& .MuiTab-root': {
                textTransform: 'capitalize',
                fontWeight: 600,
                minWidth: 'auto',
                px: 3,
              }
            }}
          >
            <Tab label="Quick Pay" disabled={isCreatingOrder} />
            <Tab label="Manual Pay" disabled={isCreatingOrder} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <FormControl fullWidth size="medium">
              <InputLabel sx={{ fontWeight: 500 }}>Repayment Amount</InputLabel>
              <Select
                value={repayAmount}
                label="Repayment Amount"
                onChange={(e) => setRepayAmount(Number(e.target.value))}
                disabled={isCreatingOrder}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d1d5db',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0a2558',
                  },
                }}
              >
                {[500, 1000, 2000, 5000]
                  .filter(amount => amount <= (selectedLoan?.net_amount || 0))
                  .map((amount) => (
                    <MenuItem
                      key={amount}
                      value={amount}
                      sx={{ fontWeight: amount === selectedLoan?.net_amount ? 600 : 400 }}
                    >
                      ${amount} {amount === selectedLoan?.net_amount && '(Full Payment)'}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <TextField
              fullWidth
              label="Enter Amount"
              value={manualAmount}
              onChange={handleManualAmountChange}
              disabled={isCreatingOrder}
              placeholder="Enter repayment amount"
              InputProps={{
                startAdornment: <InputAdornment position="start"></InputAdornment>,
              }}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
              helperText="Minimum amount: 500"
            />
          </TabPanel>

          {isCreatingOrder && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <CircularProgress size={20} sx={{ color: '#0a2558' }} />
              <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
                Processing your payment...
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{
          justifyContent: 'center',
          pb: 2,
          pt: 1,
          gap: 1,
        }}>
          <Button
            onClick={() => setRepayDialogOpen(false)}
            variant="outlined"
            disabled={isCreatingOrder}
            sx={{
              borderColor: '#d1d5db',
              color: '#6b7280',
              fontWeight: 600,
              textTransform: 'capitalize',
              borderRadius: 2,
              px: 3,
              '&:hover': {
                backgroundColor: '#f3f4f6',
                borderColor: '#9ca3af',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRepayment}
            variant="contained"
            disabled={isCreatingOrder || getFinalRepayAmount() === 0 || getFinalRepayAmount() < 500}
            sx={{
              background: 'linear-gradient(135deg, #0a2558 0%, #a855f7 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #581c87 0%, #9333ea 100%)',
                boxShadow: '0 4px 12px rgba(107, 33, 168, 0.3)',
              },
              textTransform: 'capitalize',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              boxShadow: 'none',
            }}
          >
            {isCreatingOrder ? 'Processing...' : `Pay ${getFinalRepayAmount()}`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

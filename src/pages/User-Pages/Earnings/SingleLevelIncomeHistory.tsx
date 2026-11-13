import { useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { Card, CardContent, TextField, Box, Typography } from '@mui/material';
import { DASHBOARD_CUTSOM_STYLE, extractTransactionAmount } from '../../../utils/DataTableColumnsProvider';
import { useGetTransactionDetails } from '../../../api/Memeber';
import { getFormattedDate } from '../../../utils/common';

const SingleLevelIncomeHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: transactionsData,
    isLoading,
    isError,
    error,
  } = useGetTransactionDetails();

  // Ensure transactions is always an array
  const transactions = Array.isArray(transactionsData?.data)
    ? transactionsData.data
    : Array.isArray(transactionsData)
      ? transactionsData
      : [];

  const singleLevelData = useMemo(() => {
    return transactions
      .filter((transaction: any) => {
        if (!transaction || typeof transaction !== 'object') return false;

        const txType = transaction.transaction_type?.toLowerCase() || "";
        const descStr = transaction.description?.toLowerCase() || "";
        const benefitType = transaction.benefit_type?.toLowerCase() || "";

        // Match ONLY Daily Incentive transactions
        const isDailyIncentive =
          descStr.includes('daily incentive') ||
          txType.includes('daily incentive') ||
          benefitType.includes('daily incentive');

        const isNotWithdrawal = !txType.includes('withdrawal') && !descStr.includes('withdrawal');

        return isDailyIncentive && isNotWithdrawal;
      })
      .map((transaction: any) => {
        let extractedMemberId = 'N/A';
        if (transaction.related_member_id) {
          extractedMemberId = transaction.related_member_id;
        } else if (transaction.description && transaction.description.includes('from ')) {
          const fromPart = transaction.description.split('from ')[1];
          extractedMemberId = fromPart ? fromPart.split("'")[0] : 'N/A';
        }

        const totalAmount =
          (parseFloat(transaction.ew_credit) || 0) +
          (parseFloat(transaction.uw_credit) || 0) +
          (parseFloat(transaction.fd_credit) || 0) +
          (parseFloat(transaction.pw_credit) || 0) ||
          parseFloat(transaction.gross_amount) ||
          parseFloat(transaction.net_amount) ||
          parseFloat(transaction.amount) ||
          extractTransactionAmount(transaction) ||
          0;

        return {
          id: transaction._id || transaction.transaction_id,
          date: transaction.transaction_date || transaction.createdAt,
          payoutLevel: transaction.transaction_type || 'Daily Incentive',
          memberName: transaction.related_member_name || (transaction.member_id ? 'Self' : '-'),
          memberId: transaction.related_member_id || (extractedMemberId !== 'N/A' ? extractedMemberId : (transaction.member_id || '-')),
          amount: totalAmount.toFixed(2),
          description: transaction.description || transaction.transaction_type || 'Daily Incentive',
          transactionType: transaction.transaction_type || 'Daily Incentive',
          status: transaction.status || 'Completed',
        };
      });
  }, [transactions]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return singleLevelData;
    const query = searchQuery.toLowerCase();
    return singleLevelData.filter((row: any) => {
      return (
        row.description?.toLowerCase().includes(query) ||
        row.payoutLevel?.toLowerCase().includes(query) ||
        row.amount?.toString().includes(query) ||
        row.status?.toLowerCase().includes(query) ||
        row.memberId?.toLowerCase().includes(query) ||
        row.memberName?.toLowerCase().includes(query)
      );
    });
  }, [singleLevelData, searchQuery]);

  const columns = [
    {
      name: "Date",
      selector: (row: any) => getFormattedDate(row.date),
      sortable: true,
      minWidth: "120px",
    },
    {
      name: "Description",
      selector: (row: any) => row.description,
      sortable: true,
      minWidth: "220px",
      cell: (row: any) => (
        <span style={{ color: "#334155" }}>
          {row.description}
        </span>
      ),
    },
    {
      name: "Amount",
      selector: (row: any) => parseFloat(row.amount || 0),
      sortable: true,
      cell: (row: any) => (
        <span style={{ fontWeight: 700, color: "#16a34a" }}>
          ₹{parseFloat(row.amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row: any) => row.status,
      sortable: true,
      cell: (row: any) => (
        <span
          style={{
            color: row.status?.toLowerCase() === "completed" || row.status?.toLowerCase() === "approved" ? "#16a34a" : "#e11d48",
            fontWeight: 700,
            background: row.status?.toLowerCase() === "completed" || row.status?.toLowerCase() === "approved" ? "rgba(22, 163, 74, 0.1)" : "rgba(225, 29, 72, 0.1)",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "12px",
            textTransform: "capitalize",
          }}
        >
          {row.status || "Completed"}
        </span>
      ),
    },
  ];

  const noDataComponent = (
    <div style={{ padding: '24px', color: '#64748B', textAlign: 'center', width: '100%', fontSize: '1rem' }}>
      No transactions found
    </div>
  );

  if (isError) {
    return (
      <Card sx={{ margin: '2rem', mt: 10 }}>
        <CardContent>
          <div style={{ padding: '24px', textAlign: 'center', color: 'red' }}>
            Error loading daily incentive data: {(error as any)?.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ margin: { xs: '1rem', md: '2rem' }, mt: { xs: 8, md: 10 }, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 2 }}>
          <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            List of Daily Incentive ({filteredData.length})
          </Typography>
          <TextField
            placeholder="Search transactions..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              maxWidth: { xs: '100%', sm: 260 },
              input: { color: '#0F172A', py: 1 },
              '& .MuiOutlinedInput-root': {
                bgcolor: '#FFFFFF',
                borderRadius: '10px',
                '& fieldset': { borderColor: '#E2E8F0' },
                '&:hover fieldset': { borderColor: '#CBD5E1' }
              }
            }}
          />
        </Box>
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          customStyles={DASHBOARD_CUTSOM_STYLE}
          paginationPerPage={25}
          paginationRowsPerPageOptions={[25, 50, 100]}
          noDataComponent={noDataComponent}
          highlightOnHover
          progressPending={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default SingleLevelIncomeHistory;

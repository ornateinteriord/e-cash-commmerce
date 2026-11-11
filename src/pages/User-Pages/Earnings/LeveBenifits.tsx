import DataTable from 'react-data-table-component';
import { Card, CardContent, TextField } from '@mui/material';
import { DASHBOARD_CUTSOM_STYLE, getLevelBenifitsColumns } from '../../../utils/DataTableColumnsProvider';
import { useGetTransactionDetails } from '../../../api/Memeber';

const LevelBenifits = () => {
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

  const levelBenefitsData = transactions
    .filter((transaction: any) => {
      if (!transaction || typeof transaction !== 'object') return false;

      const txType = transaction.transaction_type?.toLowerCase() || "";
      const benefitType = transaction.benefit_type?.toLowerCase() || "";
      const descStr = transaction.description?.toLowerCase() || "";

      // Match Level Income (Levels 2-10)
      const isLevelIncome = (
        txType.includes('level income') ||
        descStr.includes('level income') ||
        txType.includes('product level') ||
        descStr.includes('product level') ||
        txType.includes('level benefit') ||
        descStr.includes('level benefit') ||
        txType.includes('level bonus') ||
        descStr.includes('level bonus') ||
        benefitType.includes('level income')
      ) && 
      !txType.includes('roi') && !descStr.includes('roi') &&
      !txType.includes('referral') && !descStr.includes('referral') &&
      !txType.includes('daily incentive') && !descStr.includes('daily incentive') &&
      !txType.includes('order margin') && !descStr.includes('order margin');
      
      return isLevelIncome;
    })
    .map((transaction: any) => {
      let levelStr = transaction.description && transaction.description.trim()
          ? transaction.description
          : transaction.level
            ? `Level ${transaction.level} Vendor Benefits`
            : 'N/A';

      if (levelStr) {
        levelStr = levelStr.replace(/Product\s*Level/gi, 'Level');
        // Handle Level Daily ROI -> Vendor Level Benefits
        levelStr = levelStr.replace(/\bLevel\s*(\d+)?\s*(?:Daily\s*)?ROI\b/gi, (_m: string, lvl?: string) => lvl ? `Level ${lvl} Vendor Level Benefits` : 'Vendor Level Benefits');
        levelStr = levelStr.replace(/\bLevel\s*Daily\s*ROI\b/gi, 'Vendor Level Benefits');
        // Replace "Level Benefits/Bonus/Income" only when NOT preceded by "Vendor "
        levelStr = levelStr.replace(/(?<!Vendor\s)Level\s*(?:Benefits?|Bonus|Income)/gi, 'Vendor Benefits');
        // Clean up any double "Vendor Vendor"
        levelStr = levelStr.replace(/Vendor\s+Vendor\s+Benefits/gi, 'Vendor Level Benefits');
        levelStr = levelStr.replace(/\bVendor\s+Vendor\b/gi, 'Vendor');
      }

      return {
        id: transaction._id || transaction.transaction_id,
        date: transaction.transaction_date,
        payoutLevel: levelStr,
        memberName: transaction.related_member_name || 'N/A',
        memberId: transaction.related_member_code || transaction.member_code || (transaction.related_member_id === '9004478100' ? '564080' : transaction.related_member_id?.length === 10 ? ('56' + transaction.related_member_id.slice(-4)) : transaction.related_member_id) || 'N/A',
        memberCode: transaction.related_member_code || transaction.member_code || (transaction.related_member_id === '9004478100' ? '564080' : transaction.related_member_id?.length === 10 ? ('56' + transaction.related_member_id.slice(-4)) : transaction.related_member_id) || 'N/A',
        amount: `${((parseFloat(transaction.vw_credit) || 0) + (parseFloat(transaction.ew_credit) || 0) + (parseFloat(transaction.uw_credit) || 0) + (parseFloat(transaction.fd_credit) || 0) + (parseFloat(transaction.pw_credit) || 0) || (parseFloat(transaction.amount) || 0) || (parseFloat(transaction.gross_amount) || 0) || (parseFloat(transaction.net_amount) || 0)).toFixed(2)}`,
        description: transaction.description,
        transactionType: transaction.transaction_type
      };
    });


  const noDataComponent = (
    <div style={{ padding: '24px' }}>
      No level income data available
    </div>
  );

  if (isError) {
    return (
      <Card sx={{ margin: '2rem', mt: 10 }}>
        <CardContent>
          <div style={{ padding: '24px', textAlign: 'center', color: 'red' }}>
            Error loading level income data: {error?.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ margin: '2rem', mt: 10 }}>
      <CardContent>
        <div style={{ marginBottom: "1rem", color: "#000", fontWeight: "bold", fontSize: "1.25rem" }}>List of Vendor Benefits ({levelBenefitsData.length})</div>
          <DataTable
              columns={getLevelBenifitsColumns()}
              data={levelBenefitsData}
              pagination
              customStyles={DASHBOARD_CUTSOM_STYLE}
              paginationPerPage={25}
              paginationRowsPerPageOptions={[25, 50, 100]}
              noDataComponent={noDataComponent}
              highlightOnHover
              progressPending={isLoading}
              subHeader
              subHeaderComponent={
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', padding: '0.5rem' }}>
                  <TextField
                    placeholder="Search"
                    variant="outlined"
                    size="small"
                  />
                </div>
              }
            />
      </CardContent>
    </Card>
  );
};

export default LevelBenifits;

import { useState } from 'react';
import { Box, Card, CardContent, TextField, Typography, CircularProgress } from '@mui/material';
import DataTable from "react-data-table-component";
import { DASHBOARD_CUTSOM_STYLE, getAdminAggregatedIncomeColumns,  } from '../../../utils/DataTableColumnsProvider';
import { useGetROIBenefits } from '../../../api/Admin';

const ROIBenifits = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: roiBenefits, isLoading, isError, error } = useGetROIBenefits();

  const benefits = Array.isArray(roiBenefits) ? roiBenefits : [];

  // Aggregate ROI benefits by user
  const aggregatedData = benefits.reduce((acc: any, curr: any) => {
    const memberId = curr.member_id || curr.related_member_id || 'N/A';
    if (!acc[memberId]) {
      acc[memberId] = {
        member_id: memberId,
        name: curr.Name || curr.name || curr.memberName || curr.member_name || '-',
        totalAmount: 0,
      };
    }
    acc[memberId].totalAmount += parseFloat(curr.ew_credit || curr.amount || 0);
    return acc;
  }, {});

  const finalData = Object.values(aggregatedData);

  const filteredData = finalData.filter((benefit: any) =>
    Object.values(benefit).some(
      value =>
        value &&
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const noDataComponent = (
    <div style={{ padding: "24px" }}>
      {isError ? `Error: ${error?.message}` : "No ROI benefits data available"}
    </div>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ margin: { xs: "0.75rem", sm: "1rem", md: "1.5rem" }, mt: { xs: 4, sm: 10, md: 11 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#1e293b',
            fontSize: { xs: '1.35rem', sm: '1.55rem', md: '1.75rem' },
            letterSpacing: '-0.02em',
          }}
        >
          ROI Benefits
        </Typography>
      </Box>

      <Card sx={{ margin: "1rem", mt: 2 }}>
        <CardContent>
          <div style={{ marginBottom: "1rem", color: "#000", fontWeight: "bold", fontSize: "1.25rem"     }}>List of ROI Benefits ({filteredData.length})</div>
          <Box
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ minWidth: 200 }}
                />
              </Box>
              <DataTable
                columns={getAdminAggregatedIncomeColumns()}
                data={filteredData}
                pagination
                customStyles={DASHBOARD_CUTSOM_STYLE}
                paginationPerPage={25}
                paginationRowsPerPageOptions={[25, 50, 100]}
                highlightOnHover
                noDataComponent={noDataComponent}
              />
        </CardContent>
      </Card>
    </>
  );
};

export default ROIBenifits;

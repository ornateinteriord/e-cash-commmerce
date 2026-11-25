import { useEffect, useState } from 'react';
import DataTable from "react-data-table-component";
import { Card, CardContent, TextField, Typography, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,  } from '@mui/material';
import { DASHBOARD_CUTSOM_STYLE, getHolidaysColumns,  } from '../../../utils/DataTableColumnsProvider';
import { MuiDatePicker } from '../../../components/common/DateFilterComponent';
import { useAddHoliday, useGetHoliday } from '../../../api/Admin';
import { toast } from 'react-toastify';
import useSearch from "../../../hooks/SearchQuery";
import { getFormattedDate } from '../../../utils/common';

const Holidays = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHoliday, setNewHoliday] = useState<{
    date: string | null;
    description: string;
  }>({
    date: null,
    description: "",
  });
  const { data: holidays, isLoading, isError, error } = useGetHoliday();
  useEffect(() => {
    if (isError) {
      toast.error(error.message);
    }
  }, [isError, error]);

  const { searchQuery, setSearchQuery, filteredData } = useSearch(holidays)

  const updateHoliday = useAddHoliday()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateHoliday.mutate({ holiday_desc: newHoliday.description, holiday_date: getFormattedDate(newHoliday.date!) })
    setIsModalOpen(false);
    console.log(newHoliday)
  };

  return (
    <>
      <Grid
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          margin: { xs: "0.75rem", sm: "1rem", md: "1.5rem" },
          mt: { xs: 4, sm: 10, md: 11 },
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#1e293b',
            fontSize: { xs: '1.35rem', sm: '1.55rem', md: '1.75rem' },
            letterSpacing: '-0.02em',
          }}
        >
          Holiday Details
        </Typography>
        <Button
          variant="contained"
          onClick={() => setIsModalOpen(true)}
          sx={{
            backgroundColor: "#0a2558",
            "&:hover": { backgroundColor: "#0a2558" },
          }}
        >
          Add Holiday
        </Button>
      </Grid>

      <Card sx={{ margin: { xs: "0.75rem", sm: "1rem", md: "1.5rem" }, mt: 2 }}>
        <CardContent>
          <div style={{ marginBottom: "1rem", color: "#000", fontWeight: "bold", fontSize: "1.25rem"     }}>List of Holidays</div>
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DataTable
                columns={getHolidaysColumns()}
                data={filteredData}
                pagination
                progressPending={isLoading || updateHoliday.isPending}
                progressComponent={
                  <CircularProgress size={"4rem"} sx={{ color: "#0a2558" }} />
                }
                customStyles={DASHBOARD_CUTSOM_STYLE}
                paginationPerPage={25}
                paginationRowsPerPageOptions={[25, 50, 100]}
                highlightOnHover
              />
        </CardContent>
      </Card>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sx={{ zIndex: 1200 }}
      >
        <DialogTitle>Add Holiday</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1, zIndex: 1300 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                onChange={(e) =>
                  setNewHoliday({ ...newHoliday, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <MuiDatePicker
                date={newHoliday.date}
                setDate={(date) => setNewHoliday({ ...newHoliday, date })}
                label="Holiday Date"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Holidays;

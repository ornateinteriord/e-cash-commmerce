import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Card, CardContent, TextField, Typography, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { DASHBOARD_CUTSOM_STYLE, getNewsColumns } from '../../../utils/DataTableColumnsProvider';
import { MuiDatePicker } from '../../../components/common/DateFilterComponent';
import { useAddNews, useGetNews } from '../../../api/Admin';
import { toast } from 'react-toastify';
import useSearch from '../../../hooks/SearchQuery';
import './News.scss'
import { getFormattedDate } from '../../../utils/common';



const News = () => {
  const { data: news, isLoading, isError, error } = useGetNews()

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNews, setNewNews] = useState<{
    fromDate: string | null;
    toDate: string | null;
    content: string;
  }>({
    fromDate: null,
    toDate: null,
    content: '',
  });

  useEffect(() => {
    if (isError) {
      toast.error(error.message);
    }
  }, [isError, error]);

  const { searchQuery, setSearchQuery, filteredData } = useSearch(news)


  const updateNews = useAddNews()

  const handleSubmit = (e: React.FormEvent) => {
    if (newNews.fromDate && newNews.toDate && newNews.content) {
      try {
        e.preventDefault();
        const NewsData = {
          from_date: newNews.fromDate ? getFormattedDate(newNews.fromDate) : "-",
          to_date: newNews.toDate ? getFormattedDate(newNews.fromDate) : "-",
          news_details: newNews.content,
        }
        updateNews.mutate(NewsData)
        setIsModalOpen(false);
      } catch (error) {
        console.error("Failed to create News", error);
      } finally {
        setNewNews({ fromDate: null, toDate: null, content: '' });
      }

    }
  };

  return (
    <>
      <Grid
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          margin: { xs: '0.75rem', sm: '1rem', md: '1.5rem' },
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
          News Details
        </Typography>
        <Button
          variant="contained"
          onClick={() => setIsModalOpen(true)}
          sx={{
            backgroundColor: '#0a2558',
            '&:hover': { backgroundColor: '#0a2558' }
          }}
        >
          Add News
        </Button>
      </Grid>

      <Card sx={{ margin: { xs: '0.75rem', sm: '1rem', md: '1.5rem' }, mt: 2 }}>
        <CardContent>
          <div style={{ marginBottom: "1rem", color: "#000", fontWeight: "bold", fontSize: "1.25rem"     }}>List of News</div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <TextField
                  size="small"
                  placeholder="Search..."
                  sx={{ minWidth: 200 }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DataTable
                columns={getNewsColumns()}
                data={filteredData}
                pagination
                progressPending={isLoading || updateNews.isPending}
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
        <DialogTitle>Add News</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1, zIndex: 1300 }} >
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Content"
                value={newNews.content}
                onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
              />
            </Grid>
            <Grid className='addnews-container'>
              <Grid item className='date-container'>
                <Typography className="date-label">From:</Typography>
                <MuiDatePicker
                  date={newNews.fromDate}
                  setDate={(date) => setNewNews({ ...newNews, fromDate: date })}
                  label="From Date"
                />
              </Grid>
              <Grid item xs={6} className='date-container'>
                <Typography className="date-label">To:</Typography>
                <MuiDatePicker
                  date={newNews.toDate}
                  setDate={(date) => setNewNews({ ...newNews, toDate: date })}
                  label="To Date"
                />
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default News;

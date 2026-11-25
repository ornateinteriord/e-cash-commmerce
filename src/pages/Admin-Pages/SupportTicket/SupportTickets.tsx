import { useEffect, useState } from 'react';
import { Box, TextField, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,  } from '@mui/material';
import { Typography } from '@mui/material';
import DataTable from 'react-data-table-component';
import { DASHBOARD_CUTSOM_STYLE, getSupportTicketColumns } from '../../../utils/DataTableColumnsProvider';
import { useGetAllTickets, useUpdateTickets, useTriggerAutoUpgrades } from '../../../api/Admin';
import { toast } from 'react-toastify';
import useSearch from '../../../hooks/SearchQuery';

interface Ticket {
  _id: string;
  ticket_date: string;
  ticket_no: string;
  reference_id: string;
  type_of_ticket: string;
  SUBJECT: string;
  ticket_status: "pending" | "solved" | "answered";

}


const SupportTickets = () => {
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { data: tickets, isLoading, isError, error } = useGetAllTickets()

  const handleReplyClick = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsReplyDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsReplyDialogOpen(false);
    setReplyText('');
  };

  const replyTicketMutation = useUpdateTickets()
  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    const replyTicket = {
      id: selectedTicket._id,
      reply_details: replyText,
    }

    replyTicketMutation.mutate(replyTicket, {
      onSuccess: () => {
        handleCloseDialog();
      },
      onError: (error) => {
        console.error("Failed to update ticket", error);
        // Error toast is already handled in the hook
      }
    });

  };

  useEffect(() => {
    if (isError) {
      toast.error(
        error.message
      );
    }
  }, [isError, error]);

  const { searchQuery, setSearchQuery, filteredData } = useSearch(tickets)
  const triggerAutoUpgradesMutation = useTriggerAutoUpgrades();

  const handleTriggerAutoUpgrades = () => {
    if (window.confirm('Are you sure you want to run the Auto Upgrade process for all eligible members now?')) {
      triggerAutoUpgradesMutation.mutate();
    }
  };



  return (
    <>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: { xs: '0.75rem', sm: '1rem', md: '1.5rem' },
        mt: { xs: 4, sm: 10, md: 11 },
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#1e293b',
            fontSize: { xs: '1.35rem', sm: '1.55rem', md: '1.75rem' },
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Support Tickets
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={handleTriggerAutoUpgrades}
          disabled={triggerAutoUpgradesMutation.isPending}
          sx={{ 
            backgroundColor: '#ffff', 
            color: '#fff', 
            textTransform: 'capitalize', 
            fontWeight: 'bold',
            '&.Mui-disabled': {
              backgroundColor: '#ffff',
              color: '#000'
            }
          }}
        >
        {triggerAutoUpgradesMutation.isPending ? "Processing..." : "Trigger Auto Upgrades"}
        </Button>
      </Box>
      <Card sx={{ margin: { xs: '0.75rem', sm: '1rem', md: '1.5rem' }, mt: 2 }}>
        <CardContent>
          <div style={{ marginBottom: "1rem", color: "#000", fontWeight: "bold", fontSize: "1.25rem"     }}>List of Support Tickets</div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '1rem', alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Search..."
                  sx={{ minWidth: 200 }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DataTable
                columns={getSupportTicketColumns(handleReplyClick)}
                data={filteredData}
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

      <Dialog open={isReplyDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#0a2558', color: '#fff' }}>
          Reply to Ticket #{selectedTicket?.ticket_no}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Ticket Date:</strong> {selectedTicket?.ticket_date}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Type of Ticket:</strong> {selectedTicket?.type_of_ticket}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Subject:</strong> {selectedTicket?.SUBJECT}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Status:</strong> {selectedTicket?.ticket_status}
          </Typography>
          <TextField
            autoFocus
            multiline
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Type your reply here..."
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#0a2558',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#0a2558',
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="error">
            Cancel
          </Button>

          <Button
            onClick={handleSubmitReply}
            variant="contained"
            sx={{
              backgroundColor: '#0a2558',
              '&:hover': { backgroundColor: '#581c87' }
            }}
            disabled={!selectedTicket || replyTicketMutation.isPending}
          >
            {replyTicketMutation.isPending ? "Submitting..." : "Reply"}
          </Button>

        </DialogActions>
      </Dialog>
    </>
  );
};

export default SupportTickets;

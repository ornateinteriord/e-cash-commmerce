import React, { useState } from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Box, Snackbar, Alert, CircularProgress } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useApproveKYC, useGetKYCSubmissions } from '../../../api/Admin';

// Updated Type
interface KYCSubmission {
  _id: string;
  Member_id: string;
  Name: string;
  mobileno: string;
  email: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  Pan_no: string;
  kycStatus: 'PROCESSING' | 'APPROVED' | 'REJECTED' | 'PENDING';
  beneficiaryStatus: string;
  beneficiaryId: string;
  address: string;
  panImage?: string;
  aadhaarImage?: string;
  profile_image?: string;
  createdAt: string;
  updatedAt: string;
}

const KYCApproval: React.FC = () => {
  const [selectedKYC, setSelectedKYC] = useState<KYCSubmission | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const queryClient = useQueryClient();

  // Fetch KYC submissions
  const { data: kycResponse, isLoading } = useGetKYCSubmissions("ALL");
  const kycSubmissions: KYCSubmission[] = Array.isArray(kycResponse)
    ? kycResponse
    : (Array.isArray(kycResponse?.data) ? kycResponse.data : []);

  // Handle approval
  const approveKYC = useApproveKYC();

  const handleApprove = () => {
    if (selectedKYC) {
      approveKYC.mutate(selectedKYC?.Member_id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['kycSubmissions'] });
          setSnackbar({
            open: true,
            message: 'KYC approved successfully',
            severity: 'success'
          });
          setOpenDialog(false);
        },
        onError: (error: any) => {
          setSnackbar({
            open: true,
            message: error?.response?.data?.message || 'Failed to approve KYC',
            severity: 'error'
          });
        }
      });
    }
  };

  const handleReject = () => {
    setOpenDialog(false);
    setSnackbar({
      open: true,
      message: 'Rejection functionality not implemented yet',
      severity: 'info'
    });
  };

  // Updated Status Chip Color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'processing': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ margin: '2rem', mt: 10, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          KYC Approval
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#0a2558' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vendor ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Account Number</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>IFSC Code</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Bank Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>PAN Number</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Submitted At</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {kycSubmissions.map((submission: KYCSubmission) => (
                <TableRow key={submission._id} hover>
                  <TableCell>{submission.Member_id}</TableCell>
                  <TableCell>{submission.Name}</TableCell>
                  <TableCell>{submission.account_number}</TableCell>
                  <TableCell>{submission.ifsc_code}</TableCell>
                  <TableCell>{submission.bank_name}</TableCell>
                  <TableCell>{submission.Pan_no || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={submission.kycStatus ? submission.kycStatus.charAt(0).toUpperCase() + submission.kycStatus.slice(1).toLowerCase() : 'Unknown'}
                      color={getStatusColor(submission.kycStatus?.toLowerCase() || 'processing') as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {submission.updatedAt ? new Date(submission.updatedAt).toLocaleDateString() : (submission.createdAt ? new Date(submission.createdAt).toLocaleDateString() : 'N/A')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: '#0a2558',
                        '&:hover': { backgroundColor: '#581c87' },
                        mr: 1
                      }}
                      onClick={() => {
                        setSelectedKYC(submission);
                        setOpenDialog(true);
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#0a2558' }} />
            <Typography variant="body2" sx={{ mt: 1, color: '#64748B' }}>Loading KYC submissions...</Typography>
          </Box>
        ) : kycSubmissions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="textSecondary">No KYC submissions found</Typography>
          </Box>
        ) : null}
      </CardContent>

      {/* Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>KYC Submission Details</DialogTitle>
        <DialogContent>
          {selectedKYC && (
            <Box sx={{ py: 2 }}>
              <Typography variant="h6" gutterBottom>Vendor Information</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">Vendor ID</Typography>
                  <Typography>{selectedKYC?.Member_id}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Vendor Name</Typography>
                  <Typography>{selectedKYC?.Name}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Submitted At</Typography>
                  <Typography>{selectedKYC?.updatedAt ? new Date(selectedKYC.updatedAt).toLocaleString() : 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Status</Typography>
                  <Chip
                    label={selectedKYC?.kycStatus ? selectedKYC.kycStatus.charAt(0).toUpperCase() + selectedKYC.kycStatus.slice(1).toLowerCase() : 'Unknown'}
                    color={getStatusColor(selectedKYC?.kycStatus?.toLowerCase() || 'processing') as any}
                    size="small"
                  />
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>Bank Details</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">Account Number</Typography>
                  <Typography>{selectedKYC?.account_number || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">IFSC Code</Typography>
                  <Typography>{selectedKYC?.ifsc_code || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Bank Name</Typography>
                  <Typography>{selectedKYC?.bank_name || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">PAN Number</Typography>
                  <Typography>{selectedKYC?.Pan_no || 'N/A'}</Typography>
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>Address</Typography>
              <Box sx={{ mb: 3 }}>
                <Typography>{selectedKYC?.address || 'N/A'}</Typography>
              </Box>

              <Typography variant="h6" gutterBottom>Uploaded Documents</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                {selectedKYC?.panImage ? (
                  <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '12px', p: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>Identity / PAN</Typography>
                    <a href={selectedKYC.panImage} target="_blank" rel="noopener noreferrer">
                      <img src={selectedKYC.panImage} alt="PAN Document" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: '8px' }} />
                    </a>
                  </Box>
                ) : null}

                {selectedKYC?.profile_image ? (
                  <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '12px', p: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>Profile Photo</Typography>
                    <a href={selectedKYC.profile_image} target="_blank" rel="noopener noreferrer">
                      <img src={selectedKYC.profile_image} alt="Profile" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: '8px' }} />
                    </a>
                  </Box>
                ) : null}

                {selectedKYC?.aadhaarImage ? (
                  <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '12px', p: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>Aadhaar</Typography>
                    <a href={selectedKYC.aadhaarImage} target="_blank" rel="noopener noreferrer">
                      <img src={selectedKYC.aadhaarImage} alt="Aadhaar Document" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: '8px' }} />
                    </a>
                  </Box>
                ) : null}

                {!selectedKYC?.panImage && !selectedKYC?.profile_image && !selectedKYC?.aadhaarImage && (
                  <Typography variant="body2" color="textSecondary">No document images attached</Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedKYC && (selectedKYC.kycStatus === 'PROCESSING' || selectedKYC.kycStatus === 'PENDING') && (
            <>
              <Button
                onClick={handleReject}
                variant="outlined"
                color="error"
              >
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                variant="contained"
                sx={{
                  backgroundColor: '#0a2558',
                  '&:hover': { backgroundColor: '#581c87' }
                }}
              >
                Approve
              </Button>
            </>
          )}
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default KYCApproval;

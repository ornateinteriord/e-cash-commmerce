import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DataTable, { TableColumn } from 'react-data-table-component';
import { useQueryClient } from '@tanstack/react-query';
import { useApproveKYC, useGetKYCSubmissions } from '../../../api/Admin';
import { DASHBOARD_CUTSOM_STYLE } from '../../../utils/DataTableColumnsProvider';

interface KYCSubmission {
  _id: string;
  sNo?: number;
  Member_id: string;
  Name: string;
  mobileno: string;
  email: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  Pan_no: string;
  aadharcard_no?: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const queryClient = useQueryClient();

  // Fetch KYC submissions
  const { data: kycResponse, isLoading } = useGetKYCSubmissions("ALL");
  const rawSubmissions: KYCSubmission[] = useMemo(() => {
    if (Array.isArray(kycResponse)) return kycResponse;
    if (Array.isArray(kycResponse?.data)) return kycResponse.data;
    return [];
  }, [kycResponse]);

  const kycSubmissions = useMemo(() => {
    return rawSubmissions.map((item, idx) => ({
      ...item,
      sNo: idx + 1
    }));
  }, [rawSubmissions]);

  // Search filter
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return kycSubmissions;
    const term = searchQuery.toLowerCase().trim();
    return kycSubmissions.filter(sub => {
      const id = (sub.Member_id || '').toLowerCase();
      const name = (sub.Name || '').toLowerCase();
      const combined = `${id}(${name})`;
      const mobile = (sub.mobileno || '').toLowerCase();
      const pan = (sub.Pan_no || '').toLowerCase();
      const bank = (sub.bank_name || '').toLowerCase();
      const acc = (sub.account_number || '').toLowerCase();
      return (
        id.includes(term) ||
        name.includes(term) ||
        combined.includes(term) ||
        mobile.includes(term) ||
        pan.includes(term) ||
        bank.includes(term) ||
        acc.includes(term)
      );
    });
  }, [kycSubmissions, searchQuery]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'processing': return 'warning';
      default: return 'default';
    }
  };

  const columns: TableColumn<KYCSubmission>[] = [
    {
      name: 'S.No',
      selector: (row) => row.sNo || 0,
      width: '70px',
      sortable: true
    },
    {
      name: 'Vendor (Name)',
      cell: (row) => (
        <span style={{ fontWeight: 700, color: '#0a2558' }}>
          {row.Member_id}({row.Name})
        </span>
      ),
      sortable: true,
      minWidth: '180px'
    },
    {
      name: 'Account Number',
      selector: (row) => row.account_number || '-',
      sortable: true,
      minWidth: '150px'
    },
    {
      name: 'IFSC Code',
      selector: (row) => row.ifsc_code || '-',
      sortable: true,
      minWidth: '120px'
    },
    {
      name: 'Bank Name',
      selector: (row) => row.bank_name || '-',
      sortable: true,
      minWidth: '150px'
    },
    {
      name: 'PAN Number',
      selector: (row) => row.Pan_no || 'N/A',
      sortable: true,
      minWidth: '130px'
    },
    {
      name: 'Status',
      cell: (row) => (
        <Chip
          label={row.kycStatus ? row.kycStatus.charAt(0).toUpperCase() + row.kycStatus.slice(1).toLowerCase() : 'Unknown'}
          color={getStatusColor(row.kycStatus?.toLowerCase() || 'processing') as any}
          size="small"
        />
      ),
      sortable: true,
      minWidth: '120px'
    },
    {
      name: 'Submitted At',
      selector: (row) => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'),
      sortable: true,
      minWidth: '130px'
    },
    {
      name: 'Actions',
      cell: (row) => (
        <Button
          variant="contained"
          size="small"
          sx={{
            backgroundColor: '#0a2558',
            '&:hover': { backgroundColor: '#581c87' },
            textTransform: 'none',
            fontSize: '12px',
            borderRadius: '6px'
          }}
          onClick={() => {
            setSelectedKYC(row);
            setOpenDialog(true);
          }}
        >
          View Details
        </Button>
      ),
      minWidth: '120px',
      center: true
    }
  ];

  return (
    <>
      <Box sx={{ margin: { xs: '0.75rem', sm: '1rem', md: '1.5rem' }, mt: { xs: 4, sm: 10, md: 11 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#1e293b',
            fontSize: { xs: '1.35rem', sm: '1.55rem', md: '1.75rem' },
            letterSpacing: '-0.02em',
          }}
        >
          KYC Approval
        </Typography>
      </Box>

      <Card sx={{ margin: { xs: '0.75rem', sm: '1rem', md: '1.5rem' }, mt: 2, borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '1.25rem' }}>
              List of KYC Submissions
            </Typography>
            <TextField
              size="small"
              placeholder="Search..."
              sx={{ minWidth: 220 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>

          <DataTable
            columns={columns}
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
            responsive
          />
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ backgroundColor: '#0a2558', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
              KYC Submission Details
            </Typography>
            {selectedKYC && (
              <Typography variant="caption" sx={{ color: '#93c5fd' }}>
                {selectedKYC.Member_id}({selectedKYC.Name})
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={() => setOpenDialog(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {selectedKYC && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0a2558', mb: 1.5 }}>
                Vendor Information
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                  p: 2,
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  mb: 3
                }}
              >
                <Box>
                  <Typography variant="caption" color="textSecondary">Vendor (Name)</Typography>
                  <Typography sx={{ fontWeight: 700, color: '#0a2558' }}>{selectedKYC.Member_id}({selectedKYC.Name})</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedKYC.kycStatus ? selectedKYC.kycStatus.charAt(0).toUpperCase() + selectedKYC.kycStatus.slice(1).toLowerCase() : 'Unknown'}
                      color={getStatusColor(selectedKYC.kycStatus?.toLowerCase() || 'processing') as any}
                      size="small"
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Mobile Number</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedKYC.mobileno || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Email Address</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedKYC.email || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Submitted At</Typography>
                  <Typography variant="body2">{selectedKYC.updatedAt ? new Date(selectedKYC.updatedAt).toLocaleString() : 'N/A'}</Typography>
                </Box>
              </Box>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0a2558', mb: 1.5 }}>
                Bank Details
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                  p: 2,
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  mb: 3
                }}
              >
                <Box>
                  <Typography variant="caption" color="textSecondary">Account Number</Typography>
                  <Typography sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedKYC.account_number || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">IFSC Code</Typography>
                  <Typography sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedKYC.ifsc_code || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Bank Name</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{selectedKYC.bank_name || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">PAN Number</Typography>
                  <Typography sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedKYC.Pan_no || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Aadhaar Number</Typography>
                  <Typography sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedKYC.aadharcard_no || 'N/A'}</Typography>
                </Box>
                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                  <Typography variant="caption" color="textSecondary">Address</Typography>
                  <Typography variant="body2">{selectedKYC.address || 'N/A'}</Typography>
                </Box>
              </Box>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0a2558', mb: 1.5 }}>
                Uploaded Documents
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(200px, 1fr))' }, gap: 2 }}>
                {selectedKYC.panImage ? (
                  <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '12px', p: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>Identity / PAN</Typography>
                    <a href={selectedKYC.panImage} target="_blank" rel="noopener noreferrer">
                      <img src={selectedKYC.panImage} alt="PAN Document" style={{ width: '100%', height: 140, objectFit: 'contain', borderRadius: '8px', backgroundColor: '#f8fafc' }} />
                    </a>
                  </Box>
                ) : null}

                {selectedKYC.profile_image ? (
                  <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '12px', p: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>Profile Photo</Typography>
                    <a href={selectedKYC.profile_image} target="_blank" rel="noopener noreferrer">
                      <img src={selectedKYC.profile_image} alt="Profile" style={{ width: '100%', height: 140, objectFit: 'contain', borderRadius: '8px', backgroundColor: '#f8fafc' }} />
                    </a>
                  </Box>
                ) : null}

                {selectedKYC.aadhaarImage ? (
                  <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '12px', p: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>Aadhaar</Typography>
                    <a href={selectedKYC.aadhaarImage} target="_blank" rel="noopener noreferrer">
                      <img src={selectedKYC.aadhaarImage} alt="Aadhaar Document" style={{ width: '100%', height: 140, objectFit: 'contain', borderRadius: '8px', backgroundColor: '#f8fafc' }} />
                    </a>
                  </Box>
                ) : null}

                {!selectedKYC.panImage && !selectedKYC.profile_image && !selectedKYC.aadhaarImage && (
                  <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" color="textSecondary">No document images attached</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {selectedKYC && (selectedKYC.kycStatus === 'PROCESSING' || selectedKYC.kycStatus === 'PENDING') && (
            <>
              <Button
                onClick={handleReject}
                variant="outlined"
                color="error"
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
              >
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                variant="contained"
                sx={{
                  backgroundColor: '#0a2558',
                  '&:hover': { backgroundColor: '#581c87' },
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Approve
              </Button>
            </>
          )}
          <Button onClick={() => setOpenDialog(false)} sx={{ textTransform: 'none' }}>Close</Button>
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
    </>
  );
};

export default KYCApproval;

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
  CircularProgress,
  TextField,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DataTable, { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { useGetKYCSubmissions } from '../../../api/Admin';
import { exportToExcel } from '../../../utils/excelExport';
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
  Pan_no?: string;
  pan_no?: string;
  aadharcard_no?: string;
  kycStatus: string;
  beneficiaryStatus?: string;
  beneficiaryId?: string;
  address?: string;
  panImage?: string;
  aadhaarImage?: string;
  checkImage?: string;
  passbookImage?: string;
  rationCardImage?: string;
  profile_image?: string;
  createdAt?: string;
  updatedAt?: string;
}

const KYCApproved: React.FC = () => {
  const [selectedKYC, setSelectedKYC] = useState<KYCSubmission | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch KYC submissions
  const { data: kycResponse, isLoading } = useGetKYCSubmissions("ALL", "", 1, 2000);
  
  const rawSubmissions: KYCSubmission[] = useMemo(() => {
    if (Array.isArray(kycResponse)) return kycResponse;
    if (Array.isArray(kycResponse?.data)) return kycResponse.data;
    return [];
  }, [kycResponse]);

  // Filter only APPROVED KYC submissions
  const approvedSubmissions = useMemo(() => {
    return rawSubmissions
      .filter((item) => (item.kycStatus || '').toLowerCase() === 'approved')
      .map((item, idx) => ({
        ...item,
        sNo: idx + 1
      }));
  }, [rawSubmissions]);

  // Filter by search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return approvedSubmissions;
    const term = searchQuery.toLowerCase().trim();
    return approvedSubmissions.filter((item) => {
      const memberId = (item.Member_id || '').toLowerCase();
      const name = (item.Name || '').toLowerCase();
      const combined = `${memberId}(${name})`;
      const mobile = (item.mobileno || '').toLowerCase();
      const email = (item.email || '').toLowerCase();
      const bank = (item.bank_name || '').toLowerCase();
      const acc = (item.account_number || '').toLowerCase();
      const pan = (item.Pan_no || item.pan_no || '').toLowerCase();
      const aadhaar = (item.aadharcard_no || '').toLowerCase();

      return (
        memberId.includes(term) ||
        name.includes(term) ||
        combined.includes(term) ||
        mobile.includes(term) ||
        email.includes(term) ||
        bank.includes(term) ||
        acc.includes(term) ||
        pan.includes(term) ||
        aadhaar.includes(term)
      );
    });
  }, [approvedSubmissions, searchQuery]);

  // Export to Excel
  const handleExportToExcel = () => {
    if (filteredData.length === 0) {
      toast.warning('No approved KYC data to export');
      return;
    }

    const exportRows = filteredData.map((item, index) => ({
      sNo: index + 1,
      memberCombined: `${item.Member_id || 'N/A'}(${item.Name || 'N/A'})`,
      Member_id: item.Member_id || 'N/A',
      Name: item.Name || 'N/A',
      mobileno: item.mobileno || 'N/A',
      email: item.email || 'N/A',
      bank_name: item.bank_name || 'N/A',
      account_number: item.account_number || 'N/A',
      ifsc_code: item.ifsc_code || 'N/A',
      Pan_no: item.Pan_no || item.pan_no || 'N/A',
      aadharcard_no: item.aadharcard_no || 'N/A',
      address: item.address || 'N/A',
      status: 'Approved',
      approvedDate: item.updatedAt
        ? new Date(item.updatedAt).toLocaleDateString()
        : (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A')
    }));

    exportToExcel({
      fileName: `KYC_Approved_Members_${new Date().toISOString().split('T')[0]}`,
      title: 'KYC Approved Members List',
      columns: [
        { header: 'S.No', key: 'sNo', width: 8 },
        { header: 'Member (Name)', key: 'memberCombined', width: 28 },
        { header: 'Member ID', key: 'Member_id', width: 16 },
        { header: 'Name', key: 'Name', width: 22 },
        { header: 'Mobile Number', key: 'mobileno', width: 16 },
        { header: 'Email', key: 'email', width: 24 },
        { header: 'Bank Name', key: 'bank_name', width: 20 },
        { header: 'Account Number', key: 'account_number', width: 22 },
        { header: 'IFSC Code', key: 'ifsc_code', width: 16 },
        { header: 'PAN Number', key: 'Pan_no', width: 16 },
        { header: 'Aadhaar Number', key: 'aadharcard_no', width: 18 },
        { header: 'Address', key: 'address', width: 30 },
        { header: 'Status', key: 'status', width: 14 },
        { header: 'Approved Date', key: 'approvedDate', width: 18 }
      ],
      data: exportRows,
      statusField: 'status'
    });

    toast.success('KYC Approved data exported to Excel successfully!');
  };

  const columns: TableColumn<KYCSubmission>[] = [
    {
      name: 'S.No',
      selector: (row) => row.sNo || 0,
      width: '70px',
      sortable: true
    },
    {
      name: 'Member (Name)',
      cell: (row) => (
        <span style={{ fontWeight: 700, color: '#0a2558' }}>
          {row.Member_id}({row.Name})
        </span>
      ),
      sortable: true,
      minWidth: '180px'
    },
    {
      name: 'Mobile Number',
      selector: (row) => row.mobileno || '-',
      sortable: true,
      minWidth: '130px'
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
      selector: (row) => row.Pan_no || row.pan_no || 'N/A',
      sortable: true,
      minWidth: '130px'
    },
    {
      name: 'Status',
      cell: () => (
        <Chip
          label="Approved"
          color="success"
          size="small"
        />
      ),
      sortable: true,
      minWidth: '110px'
    },
    {
      name: 'Approved Date',
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
          KYC Approved
        </Typography>
      </Box>

      <Card sx={{ margin: { xs: '0.75rem', sm: '1rem', md: '1.5rem' }, mt: 2, borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '1.25rem' }}>
              List of Approved Vendors ({approvedSubmissions.length})
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search..."
                sx={{ minWidth: 200 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Button
                variant="contained"
                color="success"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportToExcel}
                disabled={filteredData.length === 0}
                sx={{
                  backgroundColor: '#16a34a',
                  '&:hover': { backgroundColor: '#15803d' },
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '6px'
                }}
              >
                Export to Excel
              </Button>
            </Box>
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
              Approved KYC Profile
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
                    <Chip label="Approved" color="success" size="small" />
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
                  <Typography variant="caption" color="textSecondary">Approved Date</Typography>
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
                  <Typography sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedKYC.Pan_no || selectedKYC.pan_no || 'N/A'}</Typography>
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
          <Button onClick={() => setOpenDialog(false)} sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default KYCApproved;

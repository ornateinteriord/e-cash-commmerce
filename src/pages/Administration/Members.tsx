import React, { useState, useRef } from 'react';
import { Box, Container, Chip, Button, Avatar, Alert, Snackbar, Typography, Stack, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Backdrop, CircularProgress,  } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import { useReactToPrint } from 'react-to-print';
import AdminReusableTable from '../../utils/AdminReusableTable';
import ModifyDialog from '../../utils/MemberModifyDialog';
import TablePDF, { PrintColumn } from '../../components/Print-components/TablePDF';
import { useGetMembers, useCreateMember, useUpdateMember, Member as MemberType } from '../../queries/admin/index';
import { exportToExcel } from '../../utils/excelExport';


interface Member {
  id: string;
  date: string;
  name: string;
  email: string;
  contact: string;
  status: 'Active' | 'Inactive' | 'Blocked';
  membershipType: string;
  action: string;
  member_id: string;
  father_name: string;
  gender: string;
  dob: string;
  age: string;
  address: string;
  pan_no: string;
  aadharcard_no: string;
  voter_id: string;
  nominee: string;
  relation: string;
  occupation: string;
  introducer: string;
  introducer_name: string;
  branch_id: string;
}

const Members: React.FC = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const tablePrintRef = useRef<HTMLDivElement>(null);

  // React Query Hooks
  const { data: membersData, isLoading } = useGetMembers(page, rowsPerPage, searchQuery);
  // Fetch all members for printing (without pagination)
  const { data: allMembersData } = useGetMembers(1, 9999, '');
  const createMemberMutation = useCreateMember();

  // Print columns configuration
  const printColumns: PrintColumn[] = [
    { id: 'member_id', label: 'Vendor ID', width: '10%' },
    { id: 'displayName', label: 'Name', width: '12%' },
    { id: 'email', label: 'Email', width: '15%' },
    { id: 'contact', label: 'Contact', width: '10%' },
    { id: 'father_name', label: 'Father Name', width: '10%' },
    { id: 'gender', label: 'Gender', width: '7%', align: 'center' },
    { id: 'dob', label: 'DOB', width: '10%' },
    { id: 'pan_no', label: 'PAN No', width: '10%' },
    { id: 'occupation', label: 'Occupation', width: '8%' },
    { id: 'status', label: 'Status', width: '8%', align: 'center' },
  ];


  const updateMemberMutation = useUpdateMember();

  // Transform API data to table format
  const members: Member[] = membersData?.data?.map((member: MemberType) => ({
    id: member._id || '',
    member_id: member.member_id,
    date: member.date_of_joining
      ? new Date(member.date_of_joining).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
      : '-',
    name: `${member.name || '-'} (${member.member_id})`,
    email: member.emailid || '-',
    contact: member.contactno || '-',
    status: (member.status === 'active' ? 'Active' : 'Inactive') as 'Active' | 'Inactive' | 'Blocked',
    membershipType: 'Basic',
    action: '',
    father_name: member.father_name || '-',
    gender: member.gender || '-',
    dob: member.dob
      ? new Date(member.dob).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
      : '-',
    age: member.age ? member.age.toString() : '-',
    address: member.address || '-',
    pan_no: member.pan_no || '-',
    aadharcard_no: member.aadharcard_no || '-',
    voter_id: member.voter_id || '-',
    nominee: member.nominee || '-',
    relation: member.relation || '-',
    occupation: member.occupation || '-',
    introducer: member.introducer || '-',
    introducer_name: member.introducer_name || '-',
    branch_id: member.branch_id || '-'
  })) || [];

  const columns = [
    {
      id: 'date',
      label: 'Date',
      sortable: true,
      minWidth: 120,
    },
    {
      id: 'name',
      label: 'Vendor',
      sortable: true,
      minWidth: 200,
      renderCell: (row: Member) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: getAvatarColor(row.name),
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {getInitials(row.name.split(' (')[0])}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
              {row.name.split(' (')[0]}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              {row.name.match(/\((.*?)\)/)?.[1] || ''}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      sortable: true,
      minWidth: 200,
      renderCell: (row: Member) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <EmailIcon sx={{ color: '#64748b', fontSize: 16 }} />
          <Typography variant="body2" sx={{ color: '#475569' }}>
            {row.email}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'contact',
      label: 'Contact No',
      minWidth: 150,
      renderCell: (row: Member) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <PhoneIcon sx={{ color: '#64748b', fontSize: 16 }} />
          <Typography variant="body2" sx={{ color: '#475569' }}>
            {row.contact}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'father_name',
      label: 'Father Name',
      sortable: true,
      minWidth: 150,
      align: 'center' as const,
      renderCell: (row: Member) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.father_name}
        </Typography>
      ),
    },
    {
      id: 'gender',
      label: 'Gender',
      sortable: true,
      minWidth: 100,
      align: 'center' as const,
      renderCell: (row: Member) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.gender}
        </Typography>
      ),
    },
    {
      id: 'dob',
      label: 'Date of Birth',
      sortable: true,
      minWidth: 120,
      align: 'center' as const,
      renderCell: (row: Member) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.dob}
        </Typography>
      ),
    },
    {
      id: 'age',
      label: 'Age',
      sortable: true,
      minWidth: 80,
      align: 'center' as const,
      renderCell: (row: Member) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.age}
        </Typography>
      ),
    },
    {
      id: 'address',
      label: 'Address',
      minWidth: 200,
    },
    {
      id: 'pan_no',
      label: 'PAN No',
      minWidth: 120,
      align: 'center' as const,
      renderCell: (row: Member) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.pan_no}
        </Typography>
      ),
    },
    {
      id: 'aadharcard_no',
      label: 'Aadhar No',
      minWidth: 130,
      align: 'center' as const,
      renderCell: (row: Member) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.aadharcard_no}
        </Typography>
      ),
    },
    {
      id: 'voter_id',
      label: 'Voter ID',
      minWidth: 120,
      align: 'center' as const,
      renderCell: (row: Member) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.voter_id}
        </Typography>
      ),
    },
    {
      id: 'nominee',
      label: 'Nominee',
      minWidth: 150,
      renderCell: (row: Member) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.nominee}
        </Typography>
      ),
    },
    {
      id: 'relation',
      label: 'Relation',
      minWidth: 120,
      align: 'center' as const,
      renderCell: (row: Member) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.relation}
        </Typography>
      ),
    },
    {
      id: 'occupation',
      label: 'Occupation',
      minWidth: 150,
      renderCell: (row: Member) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.occupation}
        </Typography>
      ),
    },
    {
      id: 'introducer',
      label: 'Introducer ID',
      minWidth: 130,
      align: 'center' as const,
      renderCell: (row: Member) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.introducer}
        </Typography>
      ),
    },
    {
      id: 'introducer_name',
      label: 'Introducer Name',
      minWidth: 150,
      renderCell: (row: Member) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.introducer_name}
        </Typography>
      ),
    },
    {
      id: 'branch_id',
      label: 'Branch ID',
      minWidth: 120,
      align: 'center' as const,
      renderCell: (row: Member) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.branch_id}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      minWidth: 100,
      align: 'center' as const,
      renderCell: (row: Member) => (
        <Chip
          label={row.status}
          size="small"
          sx={{
            backgroundColor:
              row.status === 'Active' ? '#d1fae5' :
                row.status === 'Inactive' ? '#f1f5f9' : '#fee2e2',
            color:
              row.status === 'Active' ? '#065f46' :
                row.status === 'Inactive' ? '#64748b' : '#991b1b',
            fontWeight: 600,
            borderRadius: 1,
          }}
        />
      ),
    },
    {
      id: 'modify',
      label: 'Modify',
      minWidth: 100,
      align: 'center' as const,
      renderCell: (row: Member) => (
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleModifyClick(row.member_id);
          }}
          sx={{
            textTransform: 'none',
            borderRadius: 1,
            borderColor: '#cbd5e1',
            color: '#475569',
            fontSize: '0.75rem',
            px: 2,
            '&:hover': {
              borderColor: '#94a3b8',
              backgroundColor: '#f8fafc',
            }
          }}
        >
          Modify
        </Button>
      ),
    },
    {
      id: 'action',
      label: 'Action',
      minWidth: 120,
      align: 'center' as const,
      renderCell: (row: Member) => (
        <Button
          variant="outlined"
          size="small"
          startIcon={<BlockIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleActionClick(row);
          }}
          sx={{
            textTransform: 'none',
            borderRadius: 1,
            borderColor: row.status === 'Active' ? '#ef4444' : '#10b981',
            color: row.status === 'Active' ? '#ef4444' : '#10b981',
            fontSize: '0.75rem',
            px: 2,
            '&:hover': {
              backgroundColor: row.status === 'Active' ? '#fef2f2' : '#d1fae5',
            }
          }}
        >
          {row.status === 'Active' ? 'Inactive' : 'Active'}
        </Button>
      ),
    },
  ];

  const getAvatarColor = (name: string) => {
    const colors = ['#1a237e', '#283593', '#311b92', '#4a148c', '#006064'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleSearchChange = (query: string) => {
    setSearchInput(query);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to first page when changing rows per page
  };

  const handleModifyClick = (memberId: string) => {
    setSelectedMemberId(memberId);
    setModifyDialogOpen(true);
  };

  const handleAddMember = () => {
    setSelectedMemberId(null); // null = create mode
    setModifyDialogOpen(true);
  };

  const handleActionClick = (member: Member) => {
    const newStatus = member.status === 'Active' ? 'Inactive' : 'Active';

    // Call update API to change status
    updateMemberMutation.mutate(
      {
        memberId: member.member_id,
        data: { status: newStatus.toLowerCase() }
      },
      {
        onSuccess: () => {
          setSnackbar({
            open: true,
            message: `${member.name.split(' (')[0]} has been ${newStatus.toLowerCase()}`,
            severity: 'info'
          });
        },
        onError: (error: any) => {
          setSnackbar({
            open: true,
            message: error?.message || 'Failed to update member status',
            severity: 'error'
          });
        }
      }
    );
  };

  // Transform all members data for printing/export
  const allMembersForExport = (allMembersData?.data || []).map((member: MemberType) => ({
    id: member._id || '',
    member_id: member.member_id,
    displayName: member.name || '-',
    email: member.emailid || '-',
    contact: member.contactno || '-',
    father_name: member.father_name || '-',
    gender: member.gender || '-',
    dob: member.dob
      ? new Date(member.dob).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
      : '-',
    pan_no: member.pan_no || '-',
    aadharcard_no: member.aadharcard_no || '-',
    occupation: member.occupation || '-',
    status: member.status === 'active' ? 'Active' : 'Inactive',
  }));

  const handleTablePrint = useReactToPrint({
    contentRef: tablePrintRef,
  });

  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handlePrintClick = () => {
    handleExportMenuClose();
    setPrintDialogOpen(true);
  };

  const handleExcelExport = () => {
    handleExportMenuClose();
    setIsExporting(true);

    setTimeout(() => {
      const dataToExport = (allMembersData?.data || []).map((member: MemberType) => ({
        date: member.date_of_joining ? new Date(member.date_of_joining).toLocaleDateString('en-GB') : '-',
        member_id: member.member_id,
        displayName: member.name || '-',
        email: member.emailid || '-',
        contact: member.contactno || '-',
        father_name: member.father_name || '-',
        gender: member.gender || '-',
        dob: member.dob ? new Date(member.dob).toLocaleDateString('en-GB') : '-',
        age: member.age ? member.age.toString() : '-',
        address: member.address || '-',
        pan_no: member.pan_no || '-',
        aadharcard_no: member.aadharcard_no || '-',
        voter_id: member.voter_id || '-',
        nominee: member.nominee || '-',
        relation: member.relation || '-',
        occupation: member.occupation || '-',
        introducer: member.introducer || '-',
        introducer_name: member.introducer_name || '-',
        branch_id: member.branch_id || '-',
        membershipType: 'Basic',
        status: member.status === 'active' ? 'Active' : 'Inactive'
      }));

      exportToExcel({
        fileName: `Members_List_${new Date().toISOString().split('T')[0]}`,
        title: 'Manipal Society - Members List',
        columns: [
          { header: 'Date', key: 'date', width: 15 },
          { header: 'Vendor ID', key: 'member_id', width: 15 },
          { header: 'Name', key: 'displayName', width: 25 },
          { header: 'Email', key: 'email', width: 25 },
          { header: 'Contact', key: 'contact', width: 15 },
          { header: 'Father Name', key: 'father_name', width: 25 },
          { header: 'Gender', key: 'gender', width: 10 },
          { header: 'DOB', key: 'dob', width: 15 },
          { header: 'Age', key: 'age', width: 8 },
          { header: 'Address', key: 'address', width: 30 },
          { header: 'PAN No', key: 'pan_no', width: 15 },
          { header: 'Aadhar No', key: 'aadharcard_no', width: 15 },
          { header: 'Voter ID', key: 'voter_id', width: 15 },
          { header: 'Nominee', key: 'nominee', width: 20 },
          { header: 'Relation', key: 'relation', width: 15 },
          { header: 'Occupation', key: 'occupation', width: 15 },
          { header: 'Introducer Code', key: 'introducer', width: 15 },
          { header: 'Introducer Name', key: 'introducer_name', width: 20 },
          { header: 'Branch ID', key: 'branch_id', width: 10 },
          { header: 'Vendor Type', key: 'membershipType', width: 15 },
          { header: 'Status', key: 'status', width: 12 }
        ],
        data: dataToExport,
        statusField: 'status'
      });

      setIsExporting(false);
      setSnackbar({
        open: true,
        message: 'Vendors data exported to Excel successfully',
        severity: 'success'
      });
    }, 100);
  };

  const handleModifySave = (data: any, isEdit?: boolean) => {
    if (isEdit && selectedMemberId) {
      // Update existing member
      updateMemberMutation.mutate(
        {
          memberId: selectedMemberId,
          data: data
        },
        {
          onSuccess: () => {
            setSnackbar({
              open: true,
              message: 'Vendor updated successfully',
              severity: 'success'
            });
            setModifyDialogOpen(false);
          },
          onError: (error: any) => {
            setSnackbar({
              open: true,
              message: error?.message || 'Failed to update vendor',
              severity: 'error'
            });
          }
        }
      );
    } else {
      // Create new member
      createMemberMutation.mutate(data, {
        onSuccess: () => {
          setSnackbar({
            open: true,
            message: 'Vendor created successfully',
            severity: 'success'
          });
          setModifyDialogOpen(false);
        },
        onError: (error: any) => {
          setSnackbar({
            open: true,
            message: error?.message || 'Failed to create vendor',
            severity: 'error'
          });
        }
      });
    }
  };

  const tableActions = (
    <Stack direction="row" spacing={1}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddMember}
        sx={{
          textTransform: 'none',
          borderRadius: 1,
          backgroundColor: '#1a237e',
          '&:hover': { backgroundColor: '#283593' }
        }}
      >
        Add Member
      </Button>
      <Button
        variant="outlined"
        startIcon={<FileDownloadIcon />}
        onClick={handleExportMenuOpen}
        sx={{
          textTransform: 'none',
          borderRadius: 1,
          borderColor: '#cbd5e1',
          color: '#475569',
        }}
      >
        Export
      </Button>
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handlePrintClick}>
          <PrintIcon sx={{ mr: 1, fontSize: 20 }} />
          Print
        </MenuItem>
        <MenuItem onClick={handleExcelExport}>
          <FileDownloadIcon sx={{ mr: 1, fontSize: 20 }} />
          Excel
        </MenuItem>
      </Menu>
    </Stack>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Page Header */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 1, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
          List of Vendors
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Manage and monitor all registered vendors in the system
        </Typography>
      </Box>

      {/* Main Table */}
      <AdminReusableTable<Member>
        columns={columns}
        data={members}
        title="Vendor Management"
        isLoading={isLoading}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        searchQuery={searchInput}
        paginationPerPage={rowsPerPage}
        actions={tableActions}
        emptyMessage="No vendors found"
        totalCount={membersData?.pagination?.total}
        currentPage={page - 1}
        onPageChange={(newPage) => setPage(newPage + 1)}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {/* Modify Dialog */}
      <ModifyDialog
        open={modifyDialogOpen}
        onClose={() => {
          setModifyDialogOpen(false);
          setSelectedMemberId(null);
        }}
        onSave={handleModifySave}
        type="member"
        memberId={selectedMemberId}
        isLoading={createMemberMutation.isPending || updateMemberMutation.isPending}
      />

      {/* Export Loader */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isExporting}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress color="inherit" />
          <Typography variant="h6">Exporting to Excel...</Typography>
        </Stack>
      </Backdrop>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: 1,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Print Preview Dialog */}
      <Dialog
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '16px' }
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Vendors Print Preview
          </Typography>
          <IconButton
            onClick={() => setPrintDialogOpen(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, backgroundColor: '#f3f4f6' }}>
          <Box sx={{ maxHeight: '70vh', overflow: 'auto', p: 2 }}>
            <TablePDF
              ref={tablePrintRef}
              title="Vendor Register"
              columns={printColumns}
              data={allMembersForExport}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setPrintDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
            }}
          >
            Close
          </Button>
          <Button
            onClick={handleTablePrint}
            variant="contained"
            startIcon={<PrintIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Members;

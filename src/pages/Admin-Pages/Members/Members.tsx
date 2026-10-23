import DataTable from 'react-data-table-component';
import { Card, CardContent, TextField, Typography, Button, Grid, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Box, Divider, InputAdornment } from '@mui/material';
import { CheckCircle, WarningAmber } from '@mui/icons-material';
import { DASHBOARD_CUTSOM_STYLE, getMembersColumns, getPendingMembersColumns, getPermissionsColumns } from '../../../utils/DataTableColumnsProvider';
import './Members.scss'
import { MuiDatePicker } from '../../../components/common/DateFilterComponent';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useGetAllMembersDetails, useUpdateMemberStatus, useImpersonate } from '../../../api/Admin';
import { useNavigate } from 'react-router-dom';
import useSearch from '../../../hooks/SearchQuery';
import { useActivatePackage } from '../../../api/Memeber';

interface MemberTableProps {
  title: string;
  summaryTitle: string;
  data: any[];
  showEdit?: boolean;
  showView?: boolean;
  showActivate?: boolean;
  isLoading?: boolean;
  onActivate?: (member: any) => void;
  isActivating?: boolean;
  showDashboard?: boolean;
}

const MemberTable = ({
  title,
  summaryTitle,
  data,
  showEdit = false,
  showView = false,
  showActivate = false,
  isLoading = false,
  onActivate,
  isActivating = false,
  showDashboard = false
}: MemberTableProps) => {
  const [isEdit, setIsEdit] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const { searchQuery, setSearchQuery, filteredData } = useSearch(data)

  const [dashboardDialogOpen, setDashboardDialogOpen] = useState(false);
  const [memberToImpersonate, setMemberToImpersonate] = useState<any>(null);
  const { mutate: impersonate, isPending: isImpersonating } = useImpersonate();

  const navigate = useNavigate()

  const handleDashboardClick = (member: any) => {
    setMemberToImpersonate(member);
    setDashboardDialogOpen(true);
  };

  const confirmImpersonation = () => {
    if (!memberToImpersonate) return;

    impersonate(memberToImpersonate.Member_id, {
      onSuccess: (response) => {
        if (response.success && response.token) {
          setDashboardDialogOpen(false);
          // Open the impersonation route in a new tab with the token
          const url = `${window.location.origin}/impersonate?token=${response.token}`;
          window.open(url, '_blank');
          setMemberToImpersonate(null);
        }
      }
    });
  };

  const handleEditClick = (memberId: string) => {
    setIsEdit(true);
    setSelectedMemberId(memberId);
  };

  const handleViewClick = (memberId: string) => {
    navigate(`/admin/members/${memberId}`);
  };

  const handleActivateClick = (member: any) => {
    if (onActivate) {
      onActivate(member);
    }
  };

  useEffect(() => {
    if (isEdit) {
      navigate(`/admin/members/${selectedMemberId}`)
    }
  }, [isEdit])

  // Determine which columns to use based on props
  const getColumns = () => {
    if (showActivate && onActivate) {
      return getPendingMembersColumns(handleActivateClick, isActivating);
    } else {
      return getMembersColumns(
        showEdit, 
        handleEditClick, 
        showView ? handleViewClick : undefined, 
        showDashboard ? handleDashboardClick : undefined
      );
    }
  };

  return (
    <>
      <Grid className="filter-container" sx={{ margin: '2rem', mt: 2 }}>
        <Typography variant="h4">
          {title}
        </Typography>
        <Grid className="filter-actions" >
          <MuiDatePicker date={fromDate} setDate={setFromDate} label="From Date" />
          <MuiDatePicker date={toDate} setDate={setToDate} label="To Date" />
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#0a2558',
              '&:hover': { backgroundColor: '#0a2558' }
            }}
          >
            Search
          </Button>
        </Grid>
      </Grid>
      <Card sx={{ margin: '2rem', mt: 2 }}>
        <CardContent>
          <div style={{ marginBottom: "1rem", color: "#000", fontWeight: "bold", fontSize: "1.25rem"     }}>{summaryTitle}</div>
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
                columns={getColumns()}
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

      {/* ── Go to Dashboard Confirmation Dialog ── */}
      <Dialog
        open={dashboardDialogOpen}
        onClose={() => !isImpersonating && setDashboardDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px', p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0a2558', pb: 1 }}>
          Go to Dashboard?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: '#555', mb: 2 }}>
            Do you want to open the dashboard for member <strong>{memberToImpersonate?.Name} ({memberToImpersonate?.Member_id})</strong> in a new tab?
          </Typography>
          <Typography variant="caption" color="text.secondary">
            This will allow you to view the application as this member.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setDashboardDialogOpen(false)}
            disabled={isImpersonating}
            variant="outlined"
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmImpersonation}
            disabled={isImpersonating}
            variant="contained"
            sx={{
              backgroundColor: '#0a2558',
              '&:hover': { backgroundColor: '#081d47' },
              borderRadius: '8px',
              textTransform: 'none',
              px: 3
            }}
          >
            {isImpersonating ? <CircularProgress size={20} color="inherit" /> : 'Go to Dashboard'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

interface Member {
  Member_id: string;
  Date_of_joining: string;
  password: string;
  Sponsor_name: number | string;
  spackage: number | string;
  mobileno: number | string;
  status: string;
  Name: string;
  package_value?: number | string;
}

type status = "All" | "active" | "Inactive" | "Pending";

const useMembers = (status: status) => {
  const { data: members, isLoading, isError, error } = useGetAllMembersDetails()

  useEffect(() => {
    if (isError) {
      const err = error as any;
      toast.error(
        err?.response.data.message || "Failed to fetch Transaction details"
      );
    }
  }, [isError, error]);

  const memberdata = Array.isArray(members)
    ? members.filter((member: Member) => (status === "All" ? true : member.status?.toLowerCase() === status.toLowerCase())).map((member: Member, index) => ({
      ...member,
      sNo: index + 1,
    }))
    : [];

  return { memberdata, isLoading };
};

export const Members = () => {
  const { memberdata, isLoading } = useMembers("All");
  return (
    <MemberTable
      title="All Vendors"
      summaryTitle="List of All Vendors"
      showEdit
      showView
      data={memberdata}
      isLoading={isLoading}
    />
  );
};

export const ActiveMembers = () => {
  const { memberdata, isLoading } = useMembers("active")
  return (
    <MemberTable
      title="Active Vendors"
      summaryTitle="List of Active Vendors"
      showView
      showDashboard
      data={memberdata}
      isLoading={isLoading}
    />
  )
}

export const InActiveMembers = () => {
  const { memberdata, isLoading } = useMembers("Inactive")
  return (
    <MemberTable
      title="Inactive Vendors"
      summaryTitle="List of Inactive Vendors"
      showView
      data={memberdata}
      isLoading={isLoading}
    />
  )
}

export const PendingMembers = () => {
  const { memberdata, isLoading } = useMembers("Pending");
  const { mutate: activatePackage, isPending: isActivating } = useActivatePackage();


  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [investmentAmount, setInvestmentAmount] = useState<string>('');

  const handleActivateClick = (member: any) => {
    setSelectedMember(member);
    setInvestmentAmount(member?.package_value ? String(member.package_value) : '');
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    if (!selectedMember) return;

    const amt = Number(investmentAmount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid investment amount.');
      return;
    }

    const packageType = `Ecash_${amt}`;

    activatePackage(
      { memberId: selectedMember.Member_id, packageType },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setSelectedMember(null);
          setInvestmentAmount('');
        },
        onError: () => {
          setDialogOpen(false);
        },
      }
    );
  };

  const primaryColor = '#0a2558';

  return (
    <>
      <MemberTable
        title="Pending Vendors"
        summaryTitle="List of Pending Vendors"
        data={memberdata}
        showActivate={true}
        isLoading={isLoading}
        onActivate={handleActivateClick}
        isActivating={isActivating}
      />

      {/* ── Activation Confirmation Dialog ── */}
      <Dialog
        open={dialogOpen}
        onClose={() => !isActivating && setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: primaryColor, color: '#fff', fontWeight: 600 }}>
          Confirm Vendor Activation
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {/* Vendor Details */}
          <Box sx={{ backgroundColor: '#f5f7fa', borderRadius: 2, p: 2, mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Vendor Details
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Vendor ID</Typography>
                <Typography variant="body2" fontWeight={600}>{selectedMember?.Member_id}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Name</Typography>
                <Typography variant="body2" fontWeight={600}>{selectedMember?.Name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Mobile</Typography>
                <Typography variant="body2" fontWeight={600}>{selectedMember?.mobileno}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Sponsor</Typography>
                <Typography variant="body2" fontWeight={600}>{selectedMember?.Sponsor_name ?? '-'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Current Status</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#FFC000' }}>
                  {selectedMember?.status}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Investment Amount Input */}
          <Box sx={{ mt: 1 }}>
            <TextField
              label="Investment Amount"
              fullWidth
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
              placeholder="e.g. 1000"
              helperText="Enter the investment amount to activate this vendor"
              autoFocus
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': { borderColor: primaryColor },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: primaryColor }
              }}
            />
          </Box>

        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            disabled={isActivating}
            variant="outlined"
            sx={{ borderColor: '#ccc', color: '#555' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isActivating}
            variant="contained"
            startIcon={isActivating ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <CheckCircle />}
            sx={{
              backgroundColor: primaryColor,
              '&:hover': { backgroundColor: '#081d47' },
              '&:disabled': { backgroundColor: '#ccc' },
            }}
          >
            {isActivating ? 'Activating...' : 'Confirm Activation'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const PermissionsMembers = () => {
  const { data: members, isLoading } = useGetAllMembersDetails();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateMemberStatus();

  // Confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ id: string, name: string, currentStatus: string } | null>(null);

  const handleToggleClick = (memberId: string, currentStatus: string, name: string) => {
    setSelectedMember({ id: memberId, name: name, currentStatus });
    setConfirmOpen(true);
  };

  const handleConfirmToggle = () => {
    if (!selectedMember) return;

    const isActive = selectedMember.currentStatus.toLowerCase() === 'active';
    const newStatus = isActive ? 'Inactive' : 'Active';

    // Use upgrade_status for this specific ROI permissions page
    updateStatus({ memberId: selectedMember.id, upgrade_status: newStatus }, {
      onSuccess: () => {
        toast.success(`Member ${newStatus === 'Active' ? 'activated' : 'inactive'} success`);
        setConfirmOpen(false);
        setSelectedMember(null);
      },
      onError: () => {
        setConfirmOpen(false);
      }
    });
  };

  // Update handleToggleStatus wrapper for the column definition
  const onToggleRequest = (memberId: string, currentStatus: string) => {
    const member = filteredData.find(m => m.Member_id === memberId);
    handleToggleClick(memberId, currentStatus, member?.Name || 'Member');
  };

  // Filter members who are "ROI Active" (have a package)
  const filteredData = Array.isArray(members)
    ? members.filter((member: any) => member.upgrade_status === 'Active' || member.upgrade_status === 'Inactive' || member.package_value > 0)
      .map((member: any, index: number) => ({
        ...member,
        sNo: index + 1,
      }))
    : [];

  return (
    <>
      <Grid className="filter-container" sx={{ margin: '2rem', mt: 2 }}>
        <Typography variant="h4">Vendor Permissions</Typography>
      </Grid>
      <Card sx={{ margin: '2rem', mt: 2 }}>
        <CardContent>
          <div style={{ marginBottom: "1rem", color: "#000", fontWeight: "bold", fontSize: "1.25rem"     }}>List of ROI Active Vendors</div>
          <DataTable
                columns={getPermissionsColumns(onToggleRequest, isUpdating)}
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

      {/* ── Status Toggle Confirmation Dialog (Modern) ── */}
      <Dialog
        open={confirmOpen}
        onClose={() => !isUpdating && setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            padding: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            overflow: 'visible'
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 2 }}>
          {/* Top Icon Circle */}
          <Box sx={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            backgroundColor: selectedMember?.currentStatus.toLowerCase() === 'active' ? '#fff0f0' : '#f0fff4',
            color: selectedMember?.currentStatus.toLowerCase() === 'active' ? '#ff4d4d' : '#2ecc71',
            boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
          }}>
            {selectedMember?.currentStatus.toLowerCase() === 'active' ?
              <WarningAmber sx={{ fontSize: '40px' }} /> :
              <CheckCircle sx={{ fontSize: '40px' }} />
            }
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a237e', mb: 1.5 }}>
            {selectedMember?.currentStatus.toLowerCase() === 'active' ? 'Inactive Vendor?' : 'Active Vendor?'}
          </Typography>

          <Typography variant="body1" sx={{ color: '#5f6368', px: 2, mb: 4, lineHeight: 1.6 }}>
            Are you sure you want to {selectedMember?.currentStatus.toLowerCase() === 'active' ? 'Inactive' : 'Active'}{' '}
            this vendor <strong>{selectedMember?.name}</strong>?
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, width: '100%', px: 2 }}>
            <Button
              fullWidth
              onClick={() => setConfirmOpen(false)}
              disabled={isUpdating}
              variant="outlined"
              sx={{
                borderRadius: '12px',
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#e0e0e0',
                color: '#5f6368',
                '&:hover': { backgroundColor: '#f8f9fa', borderColor: '#d0d0d0' }
              }}
            >
              No, Keep it
            </Button>
            <Button
              fullWidth
              onClick={handleConfirmToggle}
              disabled={isUpdating}
              variant="contained"
              sx={{
                borderRadius: '12px',
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                backgroundColor: selectedMember?.currentStatus === 'active' ? '#ff4d4d' : '#2ecc71',
                '&:hover': {
                  backgroundColor: selectedMember?.currentStatus === 'active' ? '#e60000' : '#27ae60',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }
              }}
            >
              {isUpdating ? <CircularProgress size={24} color="inherit" /> : `Yes, ${selectedMember?.currentStatus === 'active' ? 'Disable' : 'Enable'}`}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default Members;


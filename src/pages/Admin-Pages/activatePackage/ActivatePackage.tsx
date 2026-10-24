// ActivatePackage.tsx
import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Card, CardContent, Grid, MenuItem, Select, FormControl, InputLabel, Chip, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Paper, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,  } from '@mui/material';
import { Cancel, CheckCircle, Search, Warning, AttachMoney, Person,  } from '@mui/icons-material';
import { useGetMemberDetails } from '../../../api/Admin';
import { useActivatePackage } from '../../../api/Memeber';
import { useLocation } from 'react-router-dom';

interface PackageOption {
  value: string;
  label: string;
  amount: number;
}

interface CommissionData {
  memberId?: string;
  memberName?: string;
  level?: number;
  amount?: number;
  commissionType?: string;
}

interface ActivationResponse {
  success: boolean;
  message: string;
  data?: {
    commissions?: CommissionData[];
    totalCommission?: number;
    commissionDetails?: any;
  };
  commissions?: CommissionData[];
  totalCommission?: number;
}

const ActivatePackage: React.FC = () => {
  const location = useLocation(); // Add hook
  // State management
  const [memberId, setMemberId] = useState<string>('');
  const [searchedMemberId, setSearchedMemberId] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [commissionData, setCommissionData] = useState<CommissionData[]>([]);
  const [totalCommission, setTotalCommission] = useState<number>(0);

  // Stable values to display in success dialog (prevent reset from wiping them)
  const [activatedMember, setActivatedMember] = useState<any>(null);
  const [activatedPackage, setActivatedPackage] = useState<string>('');

  // Handle incoming memberId from navigation
  React.useEffect(() => {
    if (location.state?.memberId) {
      const id = location.state.memberId;
      setMemberId(id);
      setSearchedMemberId(id);
    }
  }, [location.state]);

  // API hooks
  const { data: selectedMember, isLoading: isSearching } = useGetMemberDetails(searchedMemberId);
  // NOTE: your hook returned isPending earlier; keep same mapping
  const { mutate: activatePackage, isPending: isActivating } = useActivatePackage();

  // Old packages (commented out)
  // const packageOptions: PackageOption[] = [
  //   { value: 'RD_1200', label: 'RD Package - 1200', amount: 1200 },
  //   { value: 'RD_600', label: 'RD Package - 600', amount: 600 },
  // ];

  const packageOptions: PackageOption[] = [
    { value: 'Ecash_1000',    label: 'E shopy Plan - 1,000',     amount: 1000 },
    { value: 'Ecash_2000',    label: 'E shopy Plan - 2,000',     amount: 2000 },
    { value: 'Ecash_5000',    label: 'E shopy Plan - 5,000',     amount: 5000 },
    { value: 'Ecash_10000',   label: 'E shopy Plan - 10,000',    amount: 10000 },
    { value: 'Ecash_25000',   label: 'E shopy Plan - 25,000',    amount: 25000 },
    { value: 'Ecash_50000',   label: 'E shopy Plan - 50,000',    amount: 50000 },
    { value: 'Ecash_100000',  label: 'E shopy Plan - 1,000,000',  amount: 100000 },
    { value: 'Ecash_250000',  label: 'E shopy Plan - 2,50,000',  amount: 250000 },
    { value: 'Ecash_500000',  label: 'E shopy Plan - 5,000,000',  amount: 500000 },
    { value: 'Ecash_1000000', label: 'E shopy Plan - 10,00,000', amount: 1000000 },
    { value: 'Ecash_2500000', label: 'E shopy Plan - 25,00,000', amount: 2500000 },
  ];

  // Handle member ID search
  const handleSearchMember = () => {
    if (!memberId.trim()) return;
    setSearchedMemberId(memberId.trim());
  };

  // Handle activation
  const handleActivate = async () => {
    if (!selectedMember) return;

    activatePackage(
      { memberId: selectedMember.Member_id, packageType: selectedPackage },
      {
        onSuccess: (response: ActivationResponse) => {
          if (response.success) {
            // CLOSE confirmation
            setShowConfirmDialog(false);

            // SAVE stable values for success dialog BEFORE resetting form
            setActivatedMember(selectedMember);
            setActivatedPackage(selectedPackage);

            // Extract commission data from response (various shapes supported)
            const commissions = response.data?.commissions || response.commissions || [];
            const total = response.data?.totalCommission || response.totalCommission || 0;

            setCommissionData(commissions);
            setTotalCommission(total);

            // Show success dialog
            setShowSuccessDialog(true);

            // Reset form fields (these are the editable inputs). We DO NOT clear activatedMember / activatedPackage.
            setMemberId('');
            setSearchedMemberId('');
            setSelectedPackage('');
          } else {
            // Optionally handle a failed response shape
            // e.g. show toast or error dialog (not implemented here)
            setShowConfirmDialog(false);
          }
        },
        onError: (_err: any) => {
          // Handle network / server error (you can show a toast here)
          // Keep confirm dialog closed
          setShowConfirmDialog(false);
          // Optionally reset nothing so user can retry
        },
      }
    );
  };

  // Reset form
  const handleReset = () => {
    setMemberId('');
    setSearchedMemberId('');
    setSelectedPackage('');
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearchMember();
  };

  const primaryColor = '#0a2558';
  const backgroundColor = '#ffff';

  return (
    <Box sx={{ minHeight: '100vh', py: 4, backgroundColor: backgroundColor, mt: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" component="h1" fontWeight="bold" color="#000" gutterBottom>
            Activate Package
          </Typography>
          <Typography variant="h6" color="purple.100">
            Activate packages for members
          </Typography>
        </Box>

        {/* Main Card */}
        <Card sx={{ mb: 4, backgroundColor: backgroundColor, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Search Section */}
            <Box mb={4}>
              <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
                Enter Member ID
              </Typography>
              <Box display="flex" gap={2} alignItems="flex-start">
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter member ID"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: primaryColor },
                      '&:hover fieldset': { borderColor: primaryColor },
                      '&.Mui-focused fieldset': { borderColor: primaryColor },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearchMember}
                  disabled={!memberId.trim() || isSearching}
                  startIcon={isSearching ? <CircularProgress size={20} /> : <Search />}
                  sx={{
                    backgroundColor: primaryColor,
                    '&:hover': { backgroundColor: '#581c87' },
                    minWidth: '120px',
                    height: '56px',
                  }}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </Box>
            </Box>

            {selectedMember && (
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  mb: 3,
                  borderColor: primaryColor,
                  backgroundColor: 'background.default',
                }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ color: primaryColor, fontWeight: 'medium' }}
                >
                  Member Details
                </Typography>

                <Grid container spacing={3} mb={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Member ID
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedMember.Member_id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedMember.Name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      icon={
                        selectedMember.status === 'active' ? (
                          <CheckCircle />
                        ) : selectedMember.status === 'Inactive' ? (
                          <Cancel />
                        ) : (
                          <Warning />
                        )
                      }
                      label={
                        selectedMember.status === 'active'
                          ? 'active'
                          : selectedMember.status === 'Inactive'
                            ? 'Inactive'
                            : 'Pending'
                      }
                      color={
                        selectedMember.status === 'active'
                          ? 'success'
                          : selectedMember.status === 'Inactive'
                            ? 'error'
                            : 'warning'
                      }
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Join Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedMember.Date_of_joining}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Package Selection - Always shown regardless of status */}
                <Box mb={3}>
                  <FormControl fullWidth>
                    <InputLabel id="package-select-label">Select Package</InputLabel>
                    <Select
                      labelId="package-select-label"
                      value={selectedPackage}
                      label="Select Package"
                      onChange={(e) => setSelectedPackage(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: primaryColor,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: primaryColor,
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>Select a package</em>
                      </MenuItem>
                      {packageOptions.map((pkg) => (
                        <MenuItem key={pkg.value} value={pkg.value}>
                          {pkg.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: 'block' }}
                  >
                    Select the desired package to activate
                  </Typography>
                </Box>

                {/* Action Buttons */}
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={!selectedPackage}
                    fullWidth
                    sx={{
                      backgroundColor: primaryColor,
                      '&:hover': { backgroundColor: '#581c87' },
                      py: 1.5,
                    }}
                  >
                    Activate Package
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    sx={{
                      borderColor: 'grey.400',
                      color: 'text.primary',
                      minWidth: '120px',
                      py: 1.5,
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Paper>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => !isActivating && setShowConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: backgroundColor },
        }}
      >
        <DialogTitle sx={{ color: primaryColor, fontWeight: 'medium' }}>
          Confirm Activation
        </DialogTitle>
        <DialogContent>
          <Box sx={{ backgroundColor: 'grey.50', borderRadius: 1, p: 2, mb: 2 }}>
            <Typography variant="body1" fontWeight="medium">
              Member ID: {selectedMember?.Member_id}
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              Member Name: {selectedMember?.Name}
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              Current Status: {selectedMember?.status}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Are you sure you want to activate the{' '}
            <strong>
              {packageOptions.find(pkg => pkg.value === selectedPackage)?.label || 'No package selected'}
            </strong>{' '}
            package for this member?
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', fontStyle: 'italic' }}>
            Note: Commission will be automatically distributed to eligible sponsors upon activation.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)} disabled={isActivating} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleActivate}
            disabled={isActivating}
            variant="contained"
            startIcon={isActivating ? <CircularProgress size={20} /> : <CheckCircle />}
            sx={{
              backgroundColor: primaryColor,
              '&:hover': { backgroundColor: '#581c87' },
            }}
          >
            {isActivating ? 'Activating...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog with Commission Details */}
      <Dialog
        open={showSuccessDialog}
        onClose={() => {
          // Close and clear stable activated values and commission data
          setShowSuccessDialog(false);
          setActivatedMember(null);
          setActivatedPackage('');
          setCommissionData([]);
          setTotalCommission(0);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: backgroundColor },
        }}
      >
        <DialogTitle sx={{ color: primaryColor, fontWeight: 'medium', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle sx={{ color: 'success.main' }} />
          Package Activated Successfully!
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" fontWeight="medium" gutterBottom>
              {/* USE the STABLE activatedMember & activatedPackage so dialog doesn't show cleared values */}
              Member: {activatedMember?.Name || 'N/A'} ({activatedMember?.Member_id || 'N/A'})
            </Typography>
            <Typography variant="body1" fontWeight="medium" gutterBottom>
              Package: {packageOptions.find(pkg => pkg.value === activatedPackage)?.label || 'N/A'}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Commission Details Section */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AttachMoney sx={{ color: primaryColor }} />
              <Typography variant="h6" fontWeight="medium" sx={{ color: primaryColor }}>
                Commission Distribution
              </Typography>
            </Box>

            {commissionData && commissionData.length > 0 ? (
              <>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'grey.100' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Level</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Member ID</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Member Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Commission Type</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount ()</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {commissionData.map((commission, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            {commission.level !== undefined ? `Level ${commission.level}` : 'N/A'}
                          </TableCell>
                          <TableCell>{commission.memberId || 'N/A'}</TableCell>
                          <TableCell>{commission.memberName || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={commission.commissionType || 'Commission'}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'medium', color: 'success.main' }}>
                            {typeof commission.amount === 'number' ? `${commission.amount.toFixed(2)}` : '0.00'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {totalCommission > 0 && (
                  <Box
                    sx={{
                      backgroundColor: 'success.light',
                      color: 'success.contrastText',
                      p: 2,
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      Total Commission Distributed:
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      ${totalCommission.toFixed(2)}
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <Box
                sx={{
                  backgroundColor: 'info.light',
                  color: 'info.contrastText',
                  p: 2,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Person />
                <Typography variant="body1">
                  Commission has been processed successfully. Commission details will be reflected in the respective members' accounts.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowSuccessDialog(false);
              setActivatedMember(null);
              setActivatedPackage('');
              setCommissionData([]);
              setTotalCommission(0);
            }}
            variant="contained"
            sx={{
              backgroundColor: primaryColor,
              '&:hover': { backgroundColor: '#581c87' },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActivatePackage;

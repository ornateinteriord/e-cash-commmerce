import React, { useState, useContext, useEffect } from "react";
import { Card, CardContent, CardHeader, TextField, Button, Box, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment, Select, MenuItem, FormControl } from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import UserContext from "../../../context/user/userContext";
import { useGetWalletOverview, useGetMemberDetails } from '../../../api/Memeber';
import TokenService from '../../../api/token/tokenService';
import { useBuyPackageDirectlyMutation } from '../../../api/Packages';
import { toast } from 'react-toastify';
import { get } from '../../../api/Api';
import { PACKAGES } from './UserPackagesPage';

const NewSubscription: React.FC = () => {
  const { user } = useContext(UserContext);
  const currentMemberId = TokenService.getMemberId() || user?.Member_id || user?.Vendor_id || '';
  const { data: memberDetails } = useGetMemberDetails(currentMemberId);
  const { data: walletOverview } = useGetWalletOverview(currentMemberId);
  const { mutate: buyPackage, isPending: isSubmitting } = useBuyPackageDirectlyMutation();

  // Determine available First / Deposit Wallet balance reliably
  const availableWalletBalance = Number(
    walletOverview?.balance ??
    walletOverview?.data?.balance ??
    walletOverview?.availableForWithdrawal ??
    (memberDetails as any)?.wallet_balance ??
    (user as any)?.wallet_balance ??
    0
  );

  const [formData, setFormData] = useState({
    targetVendorId: "",
    package: "",
  });

  const [targetName, setTargetName] = useState(user?.Name || "");
  const [isSearching, setIsSearching] = useState(false);
  const [isTargetActive, setIsTargetActive] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [purchasedPkgDetails, setPurchasedPkgDetails] = useState<any>(null);

  // Removed auto-fill of targetVendorId to allow entering anyone's user ID

  useEffect(() => {
    if (!formData.targetVendorId) {
      setTargetName("");
      setIsTargetActive(false);
      return;
    }
    
    if (formData.targetVendorId === user?.Vendor_id) {
      setTargetName(user?.Name || "");
      setIsTargetActive(false);
      return;
    }

    const fetchName = async () => {
      setIsSearching(true);
      try {
        const res = await get(`/auth/get-sponsor/${formData.targetVendorId}`);
        if (res && res.success) {
          setTargetName(res.name || "Name not available");
          if (res.status === 'active' || res.status === 'Active') {
            setIsTargetActive(true);
            toast.error("Already active");
          } else {
            setIsTargetActive(false);
          }
        } else {
          setTargetName("Vendor Not Found");
          setIsTargetActive(false);
        }
      } catch (e) {
        setTargetName("Vendor Not Found");
        setIsTargetActive(false);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchName, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.targetVendorId, user?.Vendor_id, user?.Name]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.package) {
      toast.error("Please select a package option");
      return;
    }

    const packageAmt = Number(formData.package);
    if (isNaN(packageAmt) || packageAmt < 100) {
      toast.error("Minimum purchase amount is ₹100");
      return;
    }

    if (packageAmt > availableWalletBalance) {
      toast.error(`Insufficient Wallet Balance! You have ₹${availableWalletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} but need ₹${packageAmt.toLocaleString()}`);
      return;
    }

    if (targetName === "Vendor Not Found" || isTargetActive || isSearching) {
      toast.error("Please provide a valid pending Vendor ID");
      return;
    }

    const activeBuyerId = currentMemberId || user?.Member_id || user?.Vendor_id || '';
    
    buyPackage({
      member_id: activeBuyerId,
      target_member_id: formData.targetVendorId || activeBuyerId,
      requested_amount: packageAmt,
    }, {
      onSuccess: () => {
        let packageName = `₹${packageAmt.toLocaleString()} Investment`;
        
        setPurchasedPkgDetails({
          targetVendorId: formData.targetVendorId || activeBuyerId,
          targetName: targetName,
          amount: formData.package,
          packageName: packageName
        });
        setSuccessDialogOpen(true);
        setFormData(prev => ({ ...prev, package: "", targetVendorId: "" }));
        setTargetName("");
      }
    });
  };

  const inputStyles = {
    bgcolor: '#F8FAFC',
    borderRadius: '8px',
    color: '#0F172A',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E2E8F0',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E2E8F0',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      bordercolor: '#0284C7',
    },
    '& .MuiInputBase-input': {
      color: '#0F172A',
      WebkitTextFillcolor: '#0F172A',
    },
    '& .MuiInputBase-input.Mui-disabled': {
      color: '#0F172A',
      WebkitTextFillcolor: '#0F172A',
      opacity: 0.8,
    },
    '& .MuiSelect-icon': {
      color: '#475569',
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'center', bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Card sx={{ maxWidth: 600, width: '100%', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', boxShadow: "0 15px 35px rgba(0,0,0,0.2)", borderRadius: '28px', color: '#0F172A', alignSelf: 'flex-start' }}>
        <CardHeader 
          title="PURCHASE AMOUNT" 
          sx={{ bgcolor: '#F8FAFC', color: '#0F172A', py: 2.5, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          titleTypographyProps={{ variant: 'subtitle1', fontWeight: 900, letterSpacing: '1px' }}
        />
        <CardContent sx={{ p: 2 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1 }}>
              <Typography sx={{ width: '150px', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>Vendor ID <span style={{color: '#ef4444'}}>*</span></Typography>
              <TextField
                name="targetVendorId"
                value={formData.targetVendorId}
                onChange={handleInputChange}
                fullWidth
                size="small"
                placeholder="Enter vendor ID"
                sx={inputStyles}
                required
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1 }}>
              <Typography sx={{ width: '150px', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>Vendor Name</Typography>
              <TextField
                value={targetName}
                fullWidth
                size="small"
                disabled
                InputProps={{
                  endAdornment: isSearching ? <CircularProgress size={20} color="inherit" sx={{color: '#475569'}} /> : null
                }}
                sx={{ 
                  ...inputStyles, 
                  bgcolor: targetName === 'Vendor Not Found' ? 'rgba(239, 68, 68, 0.1)' : '#F8FAFC',
                  '& .MuiInputBase-input.Mui-disabled': {
                    color: targetName === 'Vendor Not Found' ? '#ef4444' : '#121010ff',
                    WebkitTextFillColor: targetName === 'Vendor Not Found' ? '#ef4444' : '#0f0e0eff',
                  }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1 }}>
              <Typography sx={{ width: '150px', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>Wallet Balance</Typography>
              <TextField
                value={`₹${availableWalletBalance.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`}
                fullWidth
                size="small"
                disabled
                sx={{ ...inputStyles, opacity: 0.9, '& .MuiInputBase-input.Mui-disabled': { color: '#0F172A', WebkitTextFillColor: '#0F172A', fontWeight: 700 } }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1 }}>
              <Typography sx={{ width: '150px', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>Purchase Amount (₹) <span style={{color: '#ef4444'}}>*</span></Typography>
              <FormControl fullWidth size="small">
                <Select
                  name="package"
                  value={formData.package}
                  onChange={(e) => setFormData((prev) => ({ ...prev, package: String(e.target.value) }))}
                  displayEmpty
                  startAdornment={
                    <InputAdornment position="start">
                      <PaymentsIcon sx={{ color: '#FE8001', fontSize: 20 }} />
                    </InputAdornment>
                  }
                  sx={{
                    ...inputStyles,
                    '& .MuiSelect-select': {
                      py: 1,
                      fontWeight: 700,
                      color: formData.package ? '#0F172A' : '#94A3B8'
                    }
                  }}
                  required
                >
                  <MenuItem value="" disabled>
                    <em>Select Package Option</em>
                  </MenuItem>
                  {PACKAGES.map((pkg) => (
                    <MenuItem key={pkg.id} value={String(pkg.amount)}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>{pkg.title}</span>
                        <span style={{ fontWeight: 800, color: '#FE8001' }}>₹{pkg.amount.toLocaleString()}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1 }}>
              <Typography sx={{ width: '150px', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>Date</Typography>
              <TextField
                value={new Date().toLocaleDateString('en-GB')}
                fullWidth
                size="small"
                disabled
                sx={{ ...inputStyles, opacity: 0.8 }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifySelf: 'center', mt: 3, pt: 3, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || targetName === "Vendor Not Found" || isTargetActive || targetName === "" || isSearching}
                sx={{
                  bgcolor: '#0284C7',
                  color: '#FFFFFF',
                  px: 5,
                  py: 1.2,
                  fontWeight: 800,
                  textTransform: 'none',
                  borderRadius: '999px',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                  width: { xs: '100%', sm: 'auto' },
                  "&:hover": { 
                    bgcolor: '#0369A1',
                    boxShadow: '0 6px 20px rgba(2, 132, 199, 0.6)'
                  },
                  "&:disabled": {
                    bgcolor: 'rgba(2, 132, 199, 0.3)',
                    color: '#475569'
                  }
                }}
              >
                {isSubmitting ? "Processing..." : "Purchase Amount"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#ffffff',
            borderRadius: '24px',
            border: '1.5px solid #FED7AA',
            boxShadow: '0 24px 48px rgba(109, 33, 79, 0.12)',
            p: { xs: 1, sm: 2 },
            maxWidth: '460px',
            width: '100%',
            mx: 2
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
          <Box sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: '#ECFDF5',
            border: '2px solid #A7F3D0',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
            boxShadow: '0 8px 20px rgba(5, 150, 105, 0.15)'
          }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h6" sx={{ color: '#2D0F1E', fontWeight: 900, fontSize: '1.4rem' }}>
            Investment Successful!
          </Typography>
          <Typography variant="body2" sx={{ color: '#7A5060', fontWeight: 600, mt: 0.5, fontSize: '0.85rem' }}>
            Investment has been successfully activated for the vendor.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 1 }}>
          <Box sx={{
            bgcolor: '#FFFFFF',
            p: 2.5,
            borderRadius: '18px',
            border: '1.5px solid #FED7AA',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }}>
            {/* Amount Banner */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pb: 1.5,
              borderBottom: '1px dashed #FED7AA'
            }}>
              <Typography sx={{ color: '#7A5060', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Amount Paid
              </Typography>
              <Typography sx={{ color: '#059669', fontWeight: 900, fontSize: '1.35rem' }}>
                ₹{Number(purchasedPkgDetails?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>

            {/* Vendor ID */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ color: '#7A5060', fontSize: '0.82rem', fontWeight: 600 }}>Vendor ID</Typography>
              <Typography sx={{ color: '#FE8001', fontWeight: 800, fontSize: '0.9rem', fontFamily: 'monospace' }}>
                {purchasedPkgDetails?.targetVendorId || '-'}
              </Typography>
            </Box>

            {/* Vendor Name */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ color: '#7A5060', fontSize: '0.82rem', fontWeight: 600 }}>Vendor Name</Typography>
              <Typography sx={{ color: '#2D0F1E', fontWeight: 700, fontSize: '0.88rem' }}>
                {purchasedPkgDetails?.targetName || '-'}
              </Typography>
            </Box>

            {/* Status */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ color: '#7A5060', fontSize: '0.82rem', fontWeight: 600 }}>Status</Typography>
              <Box sx={{
                bgcolor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#059669',
                fontSize: '0.72rem',
                fontWeight: 800,
                px: 1,
                py: 0.25,
                borderRadius: '6px',
                textTransform: 'uppercase'
              }}>
                Active
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 1 }}>
          <Button
            onClick={() => setSuccessDialogOpen(false)}
            variant="contained"
            fullWidth
            sx={{
              py: 1.3,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: '0 4px 14px rgba(109, 33, 79, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #E06F00 0%, #FE8001 100%)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s'
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NewSubscription;

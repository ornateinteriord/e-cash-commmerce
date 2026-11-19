import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, CardContent, Box, Typography, Grid, CircularProgress, LinearProgress, IconButton, TextField, InputAdornment } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BadgeIcon from '@mui/icons-material/Badge';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../../context/user/userContext';
import LoadingComponent from '../../../components/common/LoadingComponent';
import { useSubmitKYC, useUploadKYCDocument, useGetMemberKycDetails } from '../../../api/Memeber';
import TokenService from '../../../api/token/tokenService';
import { toast } from 'react-toastify';

const PaytmIconBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      width: 32,
      height: 32,
      borderRadius: '9px',
      background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF',
      boxShadow: '0 2px 6px rgba(0, 186, 242, 0.35)',
      mr: 0.5,
      flexShrink: 0,
      '& svg': {
        color: '#FFFFFF',
        fontSize: 18,
      }
    }}
  >
    {children}
  </Box>
);

const formatImageUrl = (url: any): string | null => {
  if (!url || typeof url !== 'string' || url === 'null' || url === 'undefined' || url.trim() === '' || url === '[object Object]') {
    return null;
  }
  const cleanUrl = url.trim();
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('data:') || cleanUrl.startsWith('blob:')) {
    return cleanUrl;
  }
  if (cleanUrl.startsWith('/kyc-documents/') || cleanUrl.startsWith('kyc-documents/')) {
    return `https://ik.imagekit.io/ornateassets/${cleanUrl.replace(/^\//, '')}`;
  }
  const apiBase = (import.meta.env.VITE_MLM_API_URL || 'http://localhost:8080/').replace(/\/+$/, '');
  return `${apiBase}/${cleanUrl.replace(/^\//, '')}`;
};

interface DocumentUploadProps {
  label: string;
  icon: React.ReactNode;
  value: string | null;
  onUpload: (file: File) => void;
  onDelete: () => void;
  uploading: boolean;
  optional?: boolean;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  label,
  icon,
  value,
  onUpload,
  onDelete,
  uploading,
  optional = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const formattedUrl = formatImageUrl(value);

  useEffect(() => {
    setImgError(false);
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      onUpload(file);
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        position: 'relative', 
        bgcolor: '#F8FAFC', 
        borderRadius: '16px', 
        border: '1.5px solid #E2E8F0',
        boxShadow: 'none',
        transition: 'all 0.25s ease',
        '&:hover': {
          borderColor: '#FE8001',
          boxShadow: '0 4px 14px rgba(0, 186, 242, 0.12)'
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
          <Box display="flex" alignItems="center">
            {icon}
            <Typography variant="subtitle2" fontWeight="800" ml={1} sx={{ color: '#0F172A' }}>
              {label}
            </Typography>
            {optional && (
              <Typography sx={{ ml: 1, fontSize: '0.68rem', fontWeight: 700, color: '#64748B', bgcolor: '#E2E8F0', px: 0.8, py: 0.1, borderRadius: '6px' }}>
                Optional
              </Typography>
            )}
          </Box>
          {formattedUrl && !imgError && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#E0F2FE', px: 1, py: 0.2, borderRadius: '20px' }}>
              <CheckCircleIcon sx={{ fontSize: 13, color: '#0284C7' }} />
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#0369A1' }}>Attached</Typography>
            </Box>
          )}
        </Box>

        <AnimatePresence mode="wait">
          {formattedUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Box sx={{ position: 'relative', width: '100%', height: 180, borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #FE8001', bgcolor: '#FFFFFF' }}>
                {!imgError ? (
                  <img
                    src={formattedUrl}
                    alt={label}
                    onError={() => setImgError(true)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                      backgroundColor: '#F8FAFC'
                    }}
                  />
                ) : (
                  <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', bgcolor: '#FEF2F2' }}>
                    <ErrorOutlineIcon sx={{ fontSize: 32, color: '#EF4444', mb: 0.5 }} />
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#991B1B' }}>
                      Image Preview Not Available
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748B', mt: 0.3, mb: 1.5 }}>
                      File attached. Tap below to upload a clear replacement.
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      sx={{
                        background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
                        color: '#FFFFFF',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        borderRadius: '8px'
                      }}
                    >
                      Replace Image
                      <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                    </Button>
                  </Box>
                )}
                <IconButton
                  onClick={onDelete}
                  title="Remove document"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: '#EF4444',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    '&:hover': {
                      bgcolor: '#DC2626',
                    },
                  }}
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                {!imgError && (
                  <Button
                    size="small"
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      bgcolor: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(4px)',
                      color: '#FFFFFF',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      py: 0.3,
                      px: 1,
                      textTransform: 'none',
                      borderRadius: '8px',
                      '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.9)' }
                    }}
                  >
                    Change
                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                  </Button>
                )}
              </Box>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              whileHover={{ scale: 1.008 }}
              whileTap={{ scale: 0.992 }}
            >
              <Box
                component="label"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  border: '2px dashed #CBD5E1',
                  borderRadius: '14px',
                  p: { xs: 2.5, sm: 3 },
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: '#FFFFFF',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#FE8001',
                    bgcolor: '#F0F9FF',
                  },
                }}
              >
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                {uploading ? (
                  <Box sx={{ py: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress size={30} sx={{ color: '#FE8001', mb: 1 }} />
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#FF9933' }}>Uploading document...</Typography>
                  </Box>
                ) : (
                  <>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1,
                        boxShadow: '0 2px 8px rgba(0, 186, 242, 0.35)'
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: 24, color: '#FFFFFF' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 800, mb: 0.3 }}>
                      Tap to upload {label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Supports PNG, JPG, JPEG (Max 5MB)
                    </Typography>
                  </>
                )}
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

const KYC: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser, getUser } = useContext(UserContext) || {};
  const submitKYC = useSubmitKYC();
  const uploadKYCDocument = useUploadKYCDocument();

  const currentMemberId = (user as any)?.Member_id || (user as any)?.member_id || (user as any)?.member_code || TokenService.getMemberId() || TokenService.getUserId() || localStorage.getItem("memberId") || '';
  const { data: memberDetails, isLoading: isDetailsLoading } = useGetMemberKycDetails(currentMemberId);
  const currentUser = memberDetails || user;

  const [formData, setFormData] = useState({
    accountName: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    upi_id: '',
    pan_no: '',
    aadharcard_no: '',
  });

  const [documents, setDocuments] = useState({
    panImage: null as string | null,
    profileImage: null as string | null,
  });

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      const kyc = (currentUser as any).kyc_details || {};
      const anyUser = currentUser as any;
      setFormData({
        accountName: kyc.accountName || anyUser.accountName || anyUser.Name || anyUser.name || '',
        account_number: kyc.account_number || anyUser.account_number || anyUser.bank_account_number || anyUser.bankAccount || '',
        ifsc_code: kyc.ifsc_code || anyUser.ifsc_code || anyUser.ifsc || '',
        bank_name: kyc.bank_name || anyUser.bank_name || anyUser.bankName || '',
        upi_id: kyc.upi_id || anyUser.upi_id || anyUser.upiId || '',
        pan_no: kyc.pan_no || kyc.Pan_no || anyUser.pan_no || anyUser.Pan_no || anyUser.pan || '',
        aadharcard_no: kyc.aadharcard_no || anyUser.aadharcard_no || anyUser.aadhar_no || anyUser.adhaar || '',
      });
      setDocuments({
        panImage: kyc.panImage || anyUser.panImage || anyUser.pan_image || null,
        profileImage: kyc.profileImage || anyUser.profile_image || anyUser.profileImage || anyUser.member_image || null,
      });
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDocumentUpload = (docType: string, file: File) => {
    setUploadingDoc(docType);
    uploadKYCDocument.mutate(
      { documentType: docType, file },
      {
        onSuccess: (data: any) => {
          const docUrl = data?.url || data?.documentUrl || data?.fileUrl || null;
          setDocuments((prev) => ({
            ...prev,
            [docType]: docUrl,
          }));
          toast.success(`${docType === 'panImage' ? 'ID Document' : 'Photo'} uploaded successfully`);
          setUploadingDoc(null);
        },
        onError: () => {
          setUploadingDoc(null);
        },
      }
    );
  };

  const handleDocumentDelete = (docType: string) => {
    setDocuments((prev) => ({
      ...prev,
      [docType]: null,
    }));
    toast.info('Document removed');
  };

  const handleSubmit = () => {
    if (!formData.accountName || !formData.account_number || !formData.ifsc_code || !formData.bank_name) {
      toast.error('Please fill in all required bank details');
      return;
    }

    if (!formData.pan_no.trim()) {
      toast.error('Please enter your PAN Card number');
      return;
    }

    if (!formData.aadharcard_no.trim()) {
      toast.error('Please enter your Aadhaar card number');
      return;
    }

    // Document upload validation commented out per user request
    /*
    const missingDocs: string[] = [];
    if (!documents.panImage) missingDocs.push('Identity / PAN Document');
    // Passport photo is explicitly optional as requested

    if (missingDocs.length > 0) {
      toast.error(`Please upload required documents: ${missingDocs.join(', ')}`);
      return;
    }
    */

    const memberIdentifier = (user as any)?.Member_id || (user as any)?.member_id || (user as any)?.member_code || (user as any)?.mobileno || localStorage.getItem("memberId") || '';

    submitKYC.mutate(
      {
        ref_no: memberIdentifier,
        Member_id: memberIdentifier,
        member_id: memberIdentifier,
        memberId: memberIdentifier,
        accountName: formData.accountName,
        bankAccount: formData.account_number,
        account_number: formData.account_number,
        ifsc: formData.ifsc_code,
        ifsc_code: formData.ifsc_code,
        bankName: formData.bank_name,
        bank_name: formData.bank_name,
        upiId: formData.upi_id,
        upi_id: formData.upi_id,
        pan_no: formData.pan_no.trim().toUpperCase(),
        Pan_no: formData.pan_no.trim().toUpperCase(),
        pan: formData.pan_no.trim().toUpperCase(),
        aadharcard_no: formData.aadharcard_no.trim(),
        aadhar_no: formData.aadharcard_no.trim(),
        panImage: documents.panImage,
        profileImage: documents.profileImage,
        profile_image: documents.profileImage,
      },
      {
        onSuccess: () => {
          if (memberIdentifier && getUser) {
            getUser(memberIdentifier).then((res: any) => {
              if (res?.data && setUser) {
                setUser(res.data);
              }
            }).catch(() => {});
          }
        }
      }
    );
  };

  const documentConfigs = [
    { key: 'panImage', label: 'PAN / Aadhaar / National ID Document', icon: <PaytmIconBadge><BadgeIcon /></PaytmIconBadge>, optional: false },
    { key: 'profileImage', label: 'Passport Size Photo', icon: <PaytmIconBadge><ImageIcon /></PaytmIconBadge>, optional: true },
  ];

  const modernInputStyles = {
    bgcolor: '#F8FAFC',
    borderRadius: '14px',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E2E8F0',
      borderWidth: '1.5px',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#FE8001',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#FE8001',
      borderWidth: '2px',
      boxShadow: '0 0 0 4px rgba(0, 186, 242, 0.12)',
    },
    '& .MuiInputBase-input': {
      color: '#0F172A',
      padding: '13px 14px',
      fontSize: '0.95rem',
      fontWeight: 600,
    },
  };

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      bgcolor: '#F1F5F9', 
      minHeight: '100vh',
      maxWidth: '520px',
      margin: '0 auto',
      pb: 10
    }}>
      {/* Animated Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{ 
              bgcolor: '#FFFFFF', 
              border: '1.5px solid #E2E8F0',
              color: '#0F172A',
              p: 1,
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              '&:hover': { bgcolor: '#F8FAFC', transform: 'translateX(-2px)' },
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
              KYC Verification
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              Submit bank details & identity verification documents
            </Typography>
          </Box>
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <Card sx={{ 
          width: '100%', 
          bgcolor: '#FFFFFF', 
          border: '1px solid #E2E8F0', 
          boxShadow: "0 12px 32px rgba(15, 23, 42, 0.06)", 
          borderRadius: '24px', 
          overflow: 'hidden'
        }}>
          {isDetailsLoading && !currentUser && (
            <LinearProgress sx={{ height: 3, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#FE8001' } }} />
          )}
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            
            {/* Top Verification Status Banner */}
            {(() => {
              const status = String((currentUser as any)?.kycStatus || (currentUser as any)?.kyc_details?.kycStatus || 'PENDING').toUpperCase();
              const isApproved = status === 'APPROVED';
              const isProcessing = status === 'PROCESSING';
              const isRejected = status === 'REJECTED';

              const gradient = isApproved
                ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                : isProcessing
                ? 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)'
                : isRejected
                ? 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)'
                : 'linear-gradient(135deg, #002970 0%, #E06F00 60%, #FE8001 100%)';

              const IconComponent = isApproved
                ? VerifiedUserIcon
                : isProcessing
                ? HourglassEmptyIcon
                : isRejected
                ? ErrorOutlineIcon
                : VerifiedUserIcon;

              const titleText = isApproved
                ? 'KYC Verified & Approved'
                : isProcessing
                ? 'KYC Under Review (Processing)'
                : isRejected
                ? 'KYC Verification Rejected'
                : 'Identity & Bank Verification';

              const subtitleText = isApproved
                ? 'Your bank account and identity documents have been approved.'
                : isProcessing
                ? 'Your KYC documents have been submitted and are under verification.'
                : isRejected
                ? 'Your previous submission was rejected. Please re-upload verified details.'
                : 'Required for payout settlements and account security';

              return (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2.2,
                  borderRadius: '18px',
                  background: gradient,
                  color: '#FFFFFF',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  mb: 3
                }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '14px',
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <IconComponent sx={{ fontSize: 28, color: '#FFFFFF' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#FFFFFF', lineHeight: 1.2 }}>
                      {titleText}
                    </Typography>
                    <Typography sx={{ fontSize: '0.76rem', color: '#E0F2FE', mt: 0.3 }}>
                      {subtitleText}
                    </Typography>
                  </Box>
                </Box>
              );
            })()}

            {/* Identity & Government ID Details */}
            <Box sx={{ mb: 3.5 }}>
              <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 900, mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Identity & Tax Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <Box>
                  <Typography variant="caption" sx={{ mb: 0.8, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    PAN Card Number *
                  </Typography>
                  <TextField
                    name="pan_no"
                    value={formData.pan_no}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setFormData(prev => ({ ...prev, pan_no: val }));
                    }}
                    fullWidth
                    variant="outlined"
                    placeholder="e.g. ABCDE1234F"
                    inputProps={{ maxLength: 10 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PaytmIconBadge>
                            <BadgeIcon />
                          </PaytmIconBadge>
                        </InputAdornment>
                      ),
                    }}
                    sx={modernInputStyles}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ mb: 0.8, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Aadhaar Card Number *
                  </Typography>
                  <TextField
                    name="aadharcard_no"
                    value={formData.aadharcard_no}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setFormData(prev => ({ ...prev, aadharcard_no: val }));
                    }}
                    fullWidth
                    variant="outlined"
                    placeholder="12-digit Aadhaar number"
                    inputProps={{ maxLength: 12 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PaytmIconBadge>
                            <ConfirmationNumberIcon />
                          </PaytmIconBadge>
                        </InputAdornment>
                      ),
                    }}
                    sx={modernInputStyles}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 900, mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Bank Settlement Account Details
              </Typography>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <Box>
                  <Typography variant="caption" sx={{ mb: 0.8, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Bank Beneficiary Name
                  </Typography>
                  <TextField
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    placeholder="Enter name exactly as printed in bank"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PaytmIconBadge>
                            <PersonIcon />
                          </PaytmIconBadge>
                        </InputAdornment>
                      ),
                    }}
                    sx={modernInputStyles}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ mb: 0.8, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Bank Account Number
                  </Typography>
                  <TextField
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    placeholder="Enter bank account number"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PaytmIconBadge>
                            <AccountBalanceWalletIcon />
                          </PaytmIconBadge>
                        </InputAdornment>
                      ),
                    }}
                    sx={modernInputStyles}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ mb: 0.8, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    IFSC / Branch Code
                  </Typography>
                  <TextField
                    name="ifsc_code"
                    value={formData.ifsc_code}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    placeholder="e.g. SBIN0001234"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PaytmIconBadge>
                            <ConfirmationNumberIcon />
                          </PaytmIconBadge>
                        </InputAdornment>
                      ),
                    }}
                    sx={modernInputStyles}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ mb: 0.8, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Bank Name & Branch
                  </Typography>
                  <TextField
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    placeholder="e.g. State Bank of India"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PaytmIconBadge>
                            <AccountBalanceIcon />
                          </PaytmIconBadge>
                        </InputAdornment>
                      ),
                    }}
                    sx={modernInputStyles}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ mb: 0.8, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    UPI ID (Optional for Instant Payout)
                  </Typography>
                  <TextField
                    name="upi_id"
                    value={formData.upi_id}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    placeholder="e.g. yourname@upi"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PaytmIconBadge>
                            <QrCodeIcon />
                          </PaytmIconBadge>
                        </InputAdornment>
                      ),
                    }}
                    sx={modernInputStyles}
                  />
                </Box>
              </form>
            </Box>

            {/* KYC Documents - commented out per user request */}
            {/*
            <Box sx={{ mt: 3.5 }}>
              <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 900, mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Upload Identity Documents
              </Typography>
              <Grid container spacing={2}>
                {documentConfigs.map((config) => (
                  <Grid item xs={12} key={config.key}>
                    <DocumentUpload
                      label={config.label}
                      icon={config.icon}
                      value={documents[config.key as keyof typeof documents]}
                      onUpload={(file) => handleDocumentUpload(config.key, file)}
                      onDelete={() => handleDocumentDelete(config.key)}
                      uploading={uploadingDoc === config.key}
                      optional={config.optional}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
            */}

            {(() => {
              void DocumentUpload;
              void Grid;
              void documentConfigs;
              void uploadingDoc;
              void handleDocumentUpload;
              void handleDocumentDelete;
              return null;
            })()}

            <Box mt={3.5}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitKYC.isPending}
                  fullWidth
                    sx={{
                      background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
                      color: '#FFFFFF',
                      padding: '14px',
                      fontWeight: 900,
                      fontSize: '1rem',
                      borderRadius: '14px',
                      textTransform: 'none',
                      boxShadow: '0 8px 20px rgba(0, 186, 242, 0.35)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #FF9933 0%, #E06F00 100%)',
                        boxShadow: '0 10px 24px rgba(0, 186, 242, 0.45)',
                      },
                      '&:disabled': {
                        bgcolor: '#CBD5E1',
                        color: '#94A3B8'
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    {submitKYC.isPending ? 'Submitting KYC...' : 'Submit KYC Verification'}
                  </Button>
                </motion.div>
              </Box>
          </CardContent>
          {submitKYC.isPending && <LoadingComponent />}
        </Card>
      </motion.div>
    </Box>
  );
};

export default KYC;

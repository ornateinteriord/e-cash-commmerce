import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, CardContent, Box, Typography, Grid, CircularProgress, IconButton, TextField, InputAdornment } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BadgeIcon from '@mui/icons-material/Badge';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../../context/user/userContext';
import { LoadingComponent } from '../../../App';
import { useSubmitKYC, useUploadKYCDocument } from '../../../api/Memeber';
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

interface DocumentUploadProps {
  label: string;
  icon: React.ReactNode;
  value: string | null;
  onUpload: (file: File) => void;
  onDelete: () => void;
  uploading: boolean;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  label,
  icon,
  value,
  onUpload,
  onDelete,
  uploading,
}) => {
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
          </Box>
          {value && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#E0F2FE', px: 1, py: 0.2, borderRadius: '20px' }}>
              <CheckCircleIcon sx={{ fontSize: 13, color: '#FF9933' }} />
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#0369A1' }}>Attached</Typography>
            </Box>
          )}
        </Box>

        <AnimatePresence mode="wait">
          {value ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Box sx={{ position: 'relative', width: '100%', height: 160, borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #FE8001' }}>
                <img
                  src={value}
                  alt={label}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <IconButton
                  onClick={onDelete}
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
  const { user } = useContext(UserContext);
  const submitKYC = useSubmitKYC();
  const uploadKYCDocument = useUploadKYCDocument();

  const [formData, setFormData] = useState({
    accountName: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    upi_id: '',
  });

  const [documents, setDocuments] = useState({
    panImage: null as string | null,
    profileImage: null as string | null,
  });

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  useEffect(() => {
    if (user?.kyc_details) {
      setFormData({
        accountName: user.kyc_details.accountName || user.Name || '',
        account_number: user.kyc_details.account_number || '',
        ifsc_code: user.kyc_details.ifsc_code || '',
        bank_name: user.kyc_details.bank_name || '',
        upi_id: user.kyc_details.upi_id || '',
      });
      setDocuments({
        panImage: user.kyc_details.panImage || null,
        profileImage: user.kyc_details.profileImage || null,
      });
    } else if (user) {
      setFormData((prev) => ({
        ...prev,
        accountName: user.Name || '',
      }));
      setDocuments({
        panImage: user.panImage || null,
        profileImage: user.profileImage || null,
      });
    }
  }, [user]);

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
        onSuccess: (data) => {
          setDocuments((prev) => ({
            ...prev,
            [docType]: data.url,
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

    const missingDocs: string[] = [];
    if (!documents.panImage) missingDocs.push('Identity / PAN Document');
    if (!documents.profileImage) missingDocs.push('Profile Photo');

    if (missingDocs.length > 0) {
      toast.error(`Please upload required documents: ${missingDocs.join(', ')}`);
      return;
    }

    submitKYC.mutate({
      accountName: formData.accountName,
      account_number: formData.account_number,
      ifsc_code: formData.ifsc_code,
      bank_name: formData.bank_name,
      upi_id: formData.upi_id,
      panImage: documents.panImage,
      profileImage: documents.profileImage,
    });
  };

  const documentConfigs = [
    { key: 'panImage', label: 'PAN / Aadhaar / National ID', icon: <PaytmIconBadge><BadgeIcon /></PaytmIconBadge> },
    { key: 'profileImage', label: 'Passport Photo', icon: <PaytmIconBadge><ImageIcon /></PaytmIconBadge> },
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
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            
            {/* Top Verification Status Banner */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2.2,
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #002970 0%, #E06F00 60%, #FE8001 100%)',
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(0, 186, 242, 0.22)',
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
                <VerifiedUserIcon sx={{ fontSize: 28, color: '#FFFFFF' }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#FFFFFF', lineHeight: 1.2 }}>
                  Identity & Bank Verification
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: '#E0F2FE', mt: 0.3 }}>
                  Required for payout settlements and account security
                </Typography>
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

            {/* KYC Documents */}
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
                    />
                  </Grid>
                ))}
              </Grid>

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
            </Box>
          </CardContent>
          {submitKYC.isPending && <LoadingComponent />}
        </Card>
      </motion.div>
    </Box>
  );
};

export default KYC;

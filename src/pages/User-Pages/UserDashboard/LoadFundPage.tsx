import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { useNavigate } from 'react-router-dom';
import TokenService from '../../../api/token/tokenService';
import { useGetWalletOverview } from '../../../api/Memeber';
import { useRequestAddOnMutation, useGetLoadFundConfig, useUploadPaymentScreenshot } from '../../../api/Packages';
import { toast } from 'react-toastify';

import newEcashScannerImage from '../../../assets/newE-cash.jpeg';

const LoadFundPage: React.FC = () => {
  const navigate = useNavigate();
  const memberId = TokenService.getMemberId();
  const { isLoading: isConfigLoading } = useGetLoadFundConfig();
  const { data: walletOverview } = useGetWalletOverview(memberId || '');

  const requestAddOn = useRequestAddOnMutation();
  const uploadScreenshot = useUploadPaymentScreenshot(memberId || '');

  const [paymentOption, setPaymentOption] = useState<'UPI' | 'BANK'>('UPI');
  const [amount, setAmount] = useState<string>('');
  const [txNo, setTxNo] = useState<string>('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Copy helper
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Dialogs
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!txNo.trim()) {
      toast.error(
        paymentOption === 'UPI'
          ? 'Please enter the UPI UTR / Transaction reference number'
          : 'Please enter the Bank UTR / IMPS reference number'
      );
      return;
    }

    if (!screenshotFile) {
      toast.error(
        paymentOption === 'UPI'
          ? 'Please upload your UPI payment screenshot'
          : 'Please upload your bank transfer receipt'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const uploadRes = await uploadScreenshot.mutateAsync(screenshotFile);
      const screenshotUrl = uploadRes?.url || '';

      await requestAddOn.mutateAsync({
        member_id: memberId || '',
        requested_amount: Number(amount),
        tx_no: txNo.trim(),
        screenshot_url: screenshotUrl,
        payment_method: paymentOption === 'UPI' ? 'UPI/QR' : 'Bank Transfer',
      });

      setAmount('');
      setTxNo('');
      setScreenshotFile(null);
      setScreenshotPreview(null);
    } catch (err: any) {
      console.error('Load fund error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        pb: 8,
        bgcolor: '#FFFFFF',
        minHeight: '100vh',
        px: { xs: 2, sm: 3 },
        pt: { xs: 2.5, sm: 3.5 },
        maxWidth: '520px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            bgcolor: '#ffffff',
            border: '1.5px solid #FED7AA',
            color: '#FE8001',
            p: 1,
            '&:hover': { bgcolor: '#fdf2f4' },
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#FE8001', letterSpacing: '-0.5px' }}>
            Load Funds
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            Top up your wallet via QR Scanner or Direct Bank Transfer
          </Typography>
        </Box>
      </Box>

      {isConfigLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#FE8001' }} />
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            bgcolor: '#ffffff',
            borderRadius: '24px',
            border: '1.5px solid #FED7AA',
            boxShadow: '0 4px 20px rgba(109,33,79,0.06)',
          }}
        >
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Balance Badge */}
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: '#FFF8F1',
                border: '1px solid #FED7AA',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Current Top Up Balance
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#FE8001', fontWeight: 900 }}>
                ₹{Number(walletOverview?.topUpBalance || 0).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Box>

            {/* Payment Method Selector Tabs */}
            <Box sx={{ display: 'flex', gap: 1, p: 0.5, bgcolor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <Button
                fullWidth
                variant={paymentOption === 'UPI' ? 'contained' : 'text'}
                onClick={() => setPaymentOption('UPI')}
                startIcon={<QrCode2Icon />}
                sx={{
                  py: 1,
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  bgcolor: paymentOption === 'UPI' ? '#FE8001' : 'transparent',
                  color: paymentOption === 'UPI' ? '#FFFFFF' : '#64748B',
                  boxShadow: paymentOption === 'UPI' ? '0 4px 12px rgba(254, 128, 1, 0.3)' : 'none',
                  '&:hover': {
                    bgcolor: paymentOption === 'UPI' ? '#E06F00' : '#F1F5F9',
                  },
                }}
              >
                1. UPI / QR Scanner
              </Button>
              <Button
                fullWidth
                variant={paymentOption === 'BANK' ? 'contained' : 'text'}
                onClick={() => setPaymentOption('BANK')}
                startIcon={<AccountBalanceIcon />}
                sx={{
                  py: 1,
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  bgcolor: paymentOption === 'BANK' ? '#002B49' : 'transparent',
                  color: paymentOption === 'BANK' ? '#FFFFFF' : '#64748B',
                  boxShadow: paymentOption === 'BANK' ? '0 4px 12px rgba(0, 43, 73, 0.3)' : 'none',
                  '&:hover': {
                    bgcolor: paymentOption === 'BANK' ? '#001A2C' : '#F1F5F9',
                  },
                }}
              >
                2. Bank Transfer
              </Button>
            </Box>

            {/* ============================================================== */}
            {/* OPTION 1: SCANNER WITH PERFECT FIT & ZOOM                      */}
            {/* ============================================================== */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                p: { xs: 2, sm: 2.5 },
                bgcolor: '#FFFFFF',
                borderRadius: '20px',
                border: paymentOption === 'UPI' ? '2px solid #FE8001' : '1.5px dashed #FED7AA',
                boxShadow: paymentOption === 'UPI' ? '0 6px 20px rgba(254, 128, 1, 0.12)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <QrCode2Icon sx={{ color: '#FE8001' }} />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      color: '#FE8001',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Option 1: Scan & Pay via UPI / PhonePe
                  </Typography>
                </Box>
                <Chip
                  label="Instant"
                  size="small"
                  sx={{ bgcolor: '#FEF3C7', color: '#D97706', fontWeight: 800, fontSize: '0.7rem' }}
                />
              </Box>

              {/* Scanner Box with Perfect Zoom on the QR Standee */}
              <Box
                onClick={() => setSelectedScreenshot(newEcashScannerImage)}
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: { xs: 300, sm: 330 },
                  height: 380,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  bgcolor: '#FFFFFF',
                  border: '2px solid #FED7AA',
                  boxShadow: '0 8px 24px rgba(254, 128, 1, 0.15)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 12px 32px rgba(254, 128, 1, 0.25)',
                  },
                }}
              >
                <Box
                  component="img"
                  src={newEcashScannerImage}
                  alt="E-Cash QR Code Scanner"
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    objectFit: 'cover',
                    objectPosition: 'center 46%',
                    transform: 'scale(1.18)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                    color: '#FFFFFF',
                    px: 1,
                    py: 0.4,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  <ZoomInIcon sx={{ fontSize: 15 }} /> Tap to Zoom
                </Box>
              </Box>

              <Typography variant="caption" sx={{ color: '#64748B', mt: 1.2, fontWeight: 600 }}>
                Scan above QR via PhonePe / GPay / Paytm to pay instantly
              </Typography>
            </Box>

            {/* ============================================================== */}
            {/* OPTION 2: DIRECT BANK TRANSFER (YES BANK)                      */}
            {/* ============================================================== */}
            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                bgcolor: '#F8FAFC',
                borderRadius: '20px',
                border: paymentOption === 'BANK' ? '2px solid #002B49' : '1.5px solid #E2E8F0',
                boxShadow: paymentOption === 'BANK' ? '0 6px 20px rgba(0, 43, 73, 0.12)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AccountBalanceIcon sx={{ color: '#002B49', fontSize: 24 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#002B49', lineHeight: 1.2 }}>
                    Option 2: Direct Bank Transfer
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                    NEFT / RTGS / IMPS
                  </Typography>
                </Box>
              </Box>

              {/* Bank Details Rows with Copy Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                {/* Bank Name */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.2,
                    bgcolor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block' }}>
                      Bank Name
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: '#002B49' }}>
                      YES BANK
                    </Typography>
                  </Box>
                  <Chip
                    label="Current Account"
                    size="small"
                    sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 800, fontSize: '0.7rem' }}
                  />
                </Box>

                {/* Account Number */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.2,
                    bgcolor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block' }}>
                      Account Number
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#FE8001', letterSpacing: '0.5px' }}>
                      060988700001106
                    </Typography>
                  </Box>
                  <Tooltip title="Copy Account Number">
                    <IconButton
                      size="small"
                      onClick={() => handleCopy('060988700001106', 'Account Number')}
                      sx={{ color: '#FE8001' }}
                    >
                      {copiedField === 'Account Number' ? (
                        <CheckCircleOutlineIcon fontSize="small" sx={{ color: '#10B981' }} />
                      ) : (
                        <ContentCopyIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* IFSC Code */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.2,
                    bgcolor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block' }}>
                      IFSC Code
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#002B49', letterSpacing: '0.5px' }}>
                      YESB0000609
                    </Typography>
                  </Box>
                  <Tooltip title="Copy IFSC Code">
                    <IconButton
                      size="small"
                      onClick={() => handleCopy('YESB0000609', 'IFSC Code')}
                      sx={{ color: '#FE8001' }}
                    >
                      {copiedField === 'IFSC Code' ? (
                        <CheckCircleOutlineIcon fontSize="small" sx={{ color: '#10B981' }} />
                      ) : (
                        <ContentCopyIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>

            {/* Amount Field */}
            <TextField
              fullWidth
              label="Deposit Amount (₹)"
              variant="outlined"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              placeholder="e.g. 5000"
              slotProps={{
                inputLabel: {
                  sx: { color: '#64748B', '&.Mui-focused': { color: '#FE8001' } },
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#1F333B',
                  fontWeight: 700,
                  bgcolor: '#FFFFFF',
                  borderRadius: '16px',
                  '& fieldset': { borderColor: '#FED7AA' },
                  '&:hover fieldset': { borderColor: '#E5989B' },
                  '&.Mui-focused fieldset': { borderColor: '#FE8001', borderWidth: '2px' },
                },
              }}
            />

            {/* UTR / Reference Field */}
            <TextField
              fullWidth
              label={paymentOption === 'UPI' ? 'UPI UTR / Reference No.' : 'Bank IMPS / NEFT UTR Number'}
              variant="outlined"
              value={txNo}
              onChange={(e) => setTxNo(e.target.value)}
              placeholder={
                paymentOption === 'UPI' ? 'Enter 12-digit UPI UTR Number' : 'Enter Bank Ref / UTR Number'
              }
              helperText={
                paymentOption === 'UPI'
                  ? 'Enter the 12-digit transaction reference (UTR) from your payment app'
                  : 'Enter the bank transfer UTR / IMPS reference number'
              }
              slotProps={{
                inputLabel: {
                  sx: { color: '#64748B', '&.Mui-focused': { color: '#FE8001' } },
                },
                formHelperText: {
                  sx: { color: '#64748B', fontWeight: 600, fontSize: '0.72rem', mt: 0.5 },
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#1F333B',
                  fontWeight: 700,
                  bgcolor: '#FFFFFF',
                  borderRadius: '16px',
                  '& fieldset': { borderColor: '#FED7AA' },
                  '&:hover fieldset': { borderColor: '#E5989B' },
                  '&.Mui-focused fieldset': { borderColor: '#FE8001', borderWidth: '2px' },
                },
              }}
            />

            {/* Receipt Image upload */}
            <Box>
              <Typography
                variant="caption"
                sx={{ color: '#FE8001', mb: 1, fontWeight: 800, display: 'block', textTransform: 'uppercase' }}
              >
                {paymentOption === 'UPI'
                  ? 'Upload UPI Payment Screenshot'
                  : 'Upload Bank Transfer Receipt'}
              </Typography>

              {screenshotPreview ? (
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 180,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1.5px solid #E5989B',
                    bgcolor: '#FFFFFF',
                  }}
                >
                  <Box
                    component="img"
                    src={screenshotPreview}
                    alt="Screenshot Preview"
                    sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                  <IconButton
                    onClick={handleRemoveScreenshot}
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      bgcolor: '#FE8001',
                      color: '#FFFFFF',
                      '&:hover': { bgcolor: '#E06F00' },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon sx={{ color: '#FE8001' }} />}
                  sx={{
                    width: '100%',
                    py: 3,
                    borderRadius: '16px',
                    border: '2px dashed #E5989B',
                    color: '#FE8001',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    bgcolor: '#FFFFFF',
                    '&:hover': {
                      borderColor: '#FE8001',
                      bgcolor: '#fdf2f4',
                    },
                  }}
                >
                  {paymentOption === 'UPI'
                    ? 'Upload UPI Payment Screenshot'
                    : 'Upload Bank Transfer Receipt'}
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Button>
              )}
            </Box>

            <Button
              type="submit"
              disabled={isSubmitting}
              sx={{
                background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
                color: '#FFFFFF',
                textTransform: 'none',
                fontWeight: 900,
                fontSize: '1rem',
                py: 1.5,
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(254, 128, 1, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #E06F00 0%, #FE8001 100%)',
                  transform: 'translateY(-1px)',
                },
                '&.Mui-disabled': {
                  bgcolor: '#FED7AA',
                  color: '#64748B',
                },
                transition: 'all 0.2s',
              }}
            >
              {isSubmitting ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
                  Submitting...
                </Box>
              ) : (
                'Submit Load Request'
              )}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Screenshot / Scanner Fullscreen Dialog */}
      <Dialog
        open={!!selectedScreenshot}
        onClose={() => setSelectedScreenshot(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid #FED7AA',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#FE8001',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            E-Cash QR Code Scanner
          </Typography>
          <IconButton onClick={() => setSelectedScreenshot(null)} sx={{ color: '#64748B', '&:hover': { color: '#FE8001' } }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, display: 'flex', justifyContent: 'center', bgcolor: '#FFFFFF', maxHeight: '75vh' }}>
          {selectedScreenshot && (
            <Box
              component="img"
              src={selectedScreenshot}
              alt="E-Cash QR Scanner"
              sx={{ width: '100%', height: 'auto', maxHeight: '70vh', objectFit: 'contain', borderRadius: '12px' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LoadFundPage;

import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Typography, TextField, Button, IconButton, Chip, CircularProgress, Stack, ToggleButton, ToggleButtonGroup,  } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import TokenService from '../../../api/token/tokenService';
import { useRequestAddOnMutation, useGetLoadFundConfig, useUploadPaymentScreenshot } from '../../../api/Packages';import { toast } from 'react-toastify';

interface LoadFundModalProps {
  open: boolean;
  onClose: () => void;
}

const PRESET_AMOUNTS = [1000, 2000, 5000, 10000];

const LoadFundModal: React.FC<LoadFundModalProps> = ({ open, onClose }) => {
  const memberId = TokenService.getMemberId();
  const { data: config, isLoading: isConfigLoading } = useGetLoadFundConfig();
  const requestAddOn = useRequestAddOnMutation();
  const uploadScreenshot = useUploadPaymentScreenshot(memberId || '');

  const [amount, setAmount] = useState<string>('');
  const [txNo, setTxNo] = useState<string>('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'wallet'>('crypto');

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

    if (paymentMethod === 'crypto') {
      if (!txNo.trim()) {
        toast.error('Please enter the transaction number (TX No / Hash)');
        return;
      }

      if (!screenshotFile) {
        toast.error('Please upload a payment screenshot');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let url = null;
      if (paymentMethod === 'crypto') {
        const uploadResult = await uploadScreenshot.mutateAsync(screenshotFile as File);
        url = uploadResult.url;
      }
      
      await requestAddOn.mutateAsync({
        member_id: memberId || '',
        requested_amount: Number(amount),
        tx_no: txNo.trim(),
        screenshot_url: url || undefined,
        payment_method: paymentMethod,
      });

      // Clear form and close
      setAmount('');
      setTxNo('');
      setScreenshotFile(null);
      setScreenshotPreview(null);
      onClose();
    } catch (err: any) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          bgcolor: '#FFFFFF',
          backgroundImage: 'none',
          color: '#0F172A',
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          p: 2,
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>
          Load Fund
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#475569',
            '&:hover': { color: '#0F172A', bgcolor: '#F8FAFC' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2, overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
        {isConfigLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#0284C7' }} />
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <ToggleButtonGroup
                color="primary"
                value={paymentMethod}
                exclusive
                onChange={(_, newMethod) => { if (newMethod) setPaymentMethod(newMethod); }}
                sx={{
                  bgcolor: '#F8FAFC',
                  '& .MuiToggleButton-root': {
                    color: '#475569',
                    borderColor: '#E2E8F0',
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 700,
                    '&.Mui-selected': {
                      color: '#FFFFFF',
                      bgcolor: '#0284C7',
                      '&:hover': { bgcolor: '#0369A1' }
                    }
                  }
                }}
              >
                <ToggleButton value="crypto">Crypto Deposit</ToggleButton>
                <ToggleButton value="wallet">Wallet Balance</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Payment Details Container */}
            {paymentMethod === 'crypto' && (
              <Box
                sx={{
                  bgcolor: '#F8FAFC',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  p: 3,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Typography variant="subtitle2" sx={{ color: '#0284C7', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Deposit Network: {config?.network_text || 'BEP20'}
                </Typography>

                {/* QR Code Container */}
                {/* 
                <Box
                  sx={{
                    width: 180,
                    height: 180,
                    bgcolor: '#F1F5F9',
                    borderRadius: '16px',
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                  }}
                >
                  {config?.qr_code_url ? (
                    <Box
                      component="img"
                      src={config.qr_code_url}
                      alt="E shopy QR Code"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e: any) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const parent = e.target.parentNode;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.innerText = 'QR Code';
                          fallback.style.color = '#000000';
                          fallback.style.fontWeight = 'bold';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                      QR Code Not Configured
                    </Typography>
                  )}
                </Box>
                */}

                {/* Wallet Address Copy */}
                {/* 
                <Box sx={{ width: '100%' }}>
                  <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 0.5 }}>
                    Deposit Address
                  </Typography>
                  <Box
                    onClick={handleCopyAddress}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      px: 2,
                      py: 1.25,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: '#F8FAFC',
                        bordercolor: '#0284C7',
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        color: '#475569',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        mr: 1,
                        textAlign: 'left',
                        fontSize: '0.85rem',
                        width: '85%',
                      }}
                    >
                      {config?.wallet_address || 'No wallet address configured'}
                    </Typography>
                    <ContentCopyIcon sx={{ color: '#0284C7', fontSize: '1.1rem' }} />
                  </Box>
                </Box>
                */}
              </Box>
            )}

            {/* Fields Form */}
            <Stack spacing={2.5}>
              <Box>
                <TextField
                  fullWidth
                  label="Amount (E shopy / ₹)"
                  variant="outlined"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  placeholder="Enter deposit amount"
                  slotProps={{
                    inputLabel: {
                      sx: { color: '#475569', '&.Mui-focused': { color: '#0284C7' } }
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#0F172A',
                      borderRadius: '12px',
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#E2E8F0' },
                      '&.Mui-focused fieldset': { bordercolor: '#0284C7' },
                    },
                  }}
                />
                
                {/* Preset Chips */}
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                  {PRESET_AMOUNTS.map((val) => (
                    <Chip
                      key={val}
                      label={`+${val}`}
                      onClick={() => setAmount(val.toString())}
                      sx={{
                        bgcolor: '#F8FAFC',
                        color: '#475569',
                        border: '1px solid #E2E8F0',
                        fontWeight: 700,
                        '&:hover': {
                          bgcolor: 'rgba(2, 132, 199, 0.1)',
                          color: '#0284C7',
                          bordercolor: '#0284C7',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {paymentMethod === 'crypto' && (
                <>
                  <TextField
                    fullWidth
                    label="TX No / Transaction Hash"
                    variant="outlined"
                    value={txNo}
                    onChange={(e) => setTxNo(e.target.value)}
                    placeholder="Enter Transaction ID"
                    helperText="Must be a unique transaction reference number / TX hash"
                    slotProps={{
                      inputLabel: {
                        sx: { color: '#475569', '&.Mui-focused': { color: '#0284C7' } }
                      },
                      formHelperText: {
                        sx: { color: '#64748B', fontWeight: 600, fontSize: '0.72rem', mt: 0.5 }
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#0F172A',
                        borderRadius: '12px',
                        '& fieldset': { borderColor: '#E2E8F0' },
                        '&:hover fieldset': { borderColor: '#E2E8F0' },
                        '&.Mui-focused fieldset': { bordercolor: '#0284C7' },
                      },
                    }}
                  />

                  {/* Upload Screenshot */}
                  <Box>
                    <Typography variant="body2" sx={{ color: '#475569', mb: 1, fontWeight: 700 }}>
                      Upload Payment Screenshot
                    </Typography>
                    
                    {screenshotPreview ? (
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          height: 180,
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <Box
                          component="img"
                          src={screenshotPreview}
                          alt="Payment Preview"
                          sx={{ width: '100%', height: '100%', objectFit: 'contain', bgcolor: '#F8FAFC' }}
                        />
                        <IconButton
                          onClick={handleRemoveScreenshot}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(239, 68, 68, 0.9)',
                            color: '#0F172A',
                            '&:hover': { bgcolor: 'rgba(239, 68, 68, 1)' },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        sx={{
                          width: '100%',
                          py: 3,
                          borderRadius: '12px',
                          border: '2px dashed rgba(255, 255, 255, 0.15)',
                          color: '#475569',
                          textTransform: 'none',
                          '&:hover': {
                            bordercolor: '#0284C7',
                            color: '#0284C7',
                            bgcolor: 'rgba(2, 132, 199, 0.02)',
                          },
                        }}
                      >
                        Click to upload receipt image
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </Button>
                    )}
                  </Box>
                </>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                sx={{
                  bgcolor: '#0284C7',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  fontWeight: 900,
                  fontSize: '1rem',
                  py: 1.5,
                  borderRadius: '12px',
                  boxShadow: '0 6px 16px rgba(2, 132, 199, 0.35)',
                  '&:hover': {
                    bgcolor: '#0369A1',
                    boxShadow: '0 8px 24px rgba(2, 132, 199, 0.5)',
                  },
                  '&.Mui-disabled': {
                    bgcolor: '#F1F5F9',
                    color: '#64748B',
                  },
                }}
              >
                {isSubmitting ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
                    Submitting Request...
                  </Box>
                ) : (
                  'Submit Load Fund Request'
                )}
              </Button>
            </Stack>

          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoadFundModal;

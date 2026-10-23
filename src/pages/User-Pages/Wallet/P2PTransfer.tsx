import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Paper, TextField, CircularProgress, Stack, Avatar, Divider, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGetWalletOverview, useGetMemberDetails, useLookupMemberForTransfer, useTransferP2PWallet } from '../../../api/Memeber';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';
import jsQR from 'jsqr';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import TokenService from '../../../api/token/tokenService';

const decoder = (jsQR as any).default || jsQR;

const getCurrentUserId = () => {
  try {
    const token = TokenService.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      return decoded.Member_id || decoded.memberId || decoded.id || '';
    }
  } catch (e) {}
  return '';
};

const P2PTransfer: React.FC = () => {
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();
  const { data: walletOverview, isLoading: isWalletLoading } = useGetWalletOverview(currentUserId);
  const { data: memberDetails } = useGetMemberDetails(currentUserId);
  const lookupMutation = useLookupMemberForTransfer();
  const transferMutation = useTransferP2PWallet();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState<string>('');
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [manualId, setManualId] = useState<string>('');
  const [recipient, setRecipient] = useState<any>(null);

  // Camera Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const maxBalance = Number(walletOverview?.balance || 0);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error('Please enter a valid transfer amount greater than 0');
      return;
    }
    if (numAmount > maxBalance) {
      toast.error('Insufficient balance in your Credits Wallet');
      return;
    }
    setStep(2);
  };

  const startCamera = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        requestAnimationFrame(tick);
      }
    } catch (err) {
      toast.error('Unable to access camera. Please allow camera permissions or enter ID manually.');
      setScanMode('manual');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.height = videoRef.current.videoHeight;
          canvas.width = videoRef.current.videoWidth;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = decoder(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });
          if (code && code.data) {
            stopCamera();
            handleLookup(code.data);
            return;
          }
        }
      }
    }
    if (isScanning) {
      requestAnimationFrame(tick);
    }
  };

  useEffect(() => {
    if (step === 2 && scanMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step, scanMode]);

  const handleLookup = async (memberIdToLookup: string) => {
    const cleanId = memberIdToLookup.trim();
    if (!cleanId) {
      toast.error('Please enter a valid Vendor ID');
      return;
    }

    if (cleanId.toUpperCase() === (memberDetails?.Member_id || memberDetails?.member_id || '').toUpperCase()) {
      toast.error('You cannot transfer to yourself!');
      return;
    }

    try {
      const result = await lookupMutation.mutateAsync({ identifier: cleanId });
      if (result) {
        setRecipient(result);
        setStep(3);
      } else {
        toast.error('Vendor not found. Please verify the ID/QR.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Vendor not found. Please verify the ID/QR.');
    }
  };

  const handleManualLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup(manualId);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = decoder(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });
          if (code && code.data) {
            handleLookup(code.data);
          } else {
            toast.error('No valid QR code found in image. Please make sure the QR code is clear.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleConfirmTransfer = async () => {
    if (!recipient) return;
    try {
      let idToken = 'BYPASS_TOKEN';
      await transferMutation.mutateAsync({
        senderId: memberDetails?.Member_id || memberDetails?.member_id || '',
        recipientId: recipient.Member_id || recipient.member_id || '',
        sourceWallet: 'Credits',
        amount: parseFloat(amount),
        idToken,
      });
      setStep(1);
      setAmount('');
      setRecipient(null);
      setManualId('');
    } catch (err) {
      // Error handled by mutation onError
    }
  };

  if (isWalletLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', bgcolor: '#FFF8F0' }}>
        <CircularProgress sx={{ color: '#6D214F' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      px: { xs: 2, sm: 3 }, 
      py: { xs: 2.5, sm: 3.5 }, 
      maxWidth: '480px', 
      mx: 'auto', 
      width: '100%', 
      minHeight: '100vh', 
      bgcolor: '#FFF8F0',
      pb: 10 
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <IconButton 
          onClick={() => {
            if (step > 1) {
              stopCamera();
              setStep((prev) => (prev - 1) as any);
            } else {
              navigate(-1);
            }
          }}
          sx={{ 
            bgcolor: '#ffffff', 
            border: '1.5px solid #f0d0d8',
            color: '#6D214F',
            p: 1,
            '&:hover': { bgcolor: '#fdf2f4' }
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#6D214F', letterSpacing: '-0.5px' }}>
            P2P Transfer
          </Typography>
          <Typography variant="caption" sx={{ color: '#8c6b7d', fontWeight: 600 }}>
            Instant vendor-to-vendor wallet transfer
          </Typography>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: '24px',
          bgcolor: '#ffffff',
          border: '1.5px solid #f0d0d8',
          boxShadow: '0 8px 24px rgba(109, 33, 79, 0.06)',
        }}
      >
        {/* STEP 1: CHOOSE WALLET & AMOUNT */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6D214F', mb: 0.8, fontWeight: 800, display: 'block', textTransform: 'uppercase' }}>
                  Source Wallet
                </Typography>
                <Box
                  sx={{
                    p: 1.8,
                    borderRadius: '16px',
                    border: '1.5px solid #f0d0d8',
                    bgcolor: '#FFF8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: '#6D214F', fontSize: '0.9rem' }}>
                      Credits Wallet
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8c6b7d' }}>
                      Available for Transfer & Withdrawal
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 900, color: '#6D214F', fontSize: '1.1rem' }}>
                    ₹{Number(walletOverview?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#FFF8F0', border: '1px solid #f0d0d8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: '#8c6b7d', fontWeight: 700, textTransform: 'uppercase' }}>
                  Available Balance
                </Typography>
                <Typography variant="h6" sx={{ color: '#6D214F', fontWeight: 900 }}>
                  ₹{maxBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#6D214F', mb: 0.8, fontWeight: 800, display: 'block', textTransform: 'uppercase' }}>
                  Enter Amount (₹)
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputProps={{ step: 'any', min: '0.01', max: maxBalance }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#2d0f1e',
                      bgcolor: '#FFF8F0',
                      borderRadius: '16px',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      '& fieldset': { borderColor: '#f0d0d8' },
                      '&:hover fieldset': { borderColor: '#E5989B' },
                      '&.Mui-focused fieldset': { borderColor: '#6D214F', borderWidth: '2px' },
                    },
                  }}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                endIcon={<QrCodeScannerIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
                  color: '#FFF8F0',
                  borderRadius: '16px',
                  py: 1.5,
                  fontWeight: 900,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 8px 24px rgba(109, 33, 79, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                Proceed to Scan / Lookup
              </Button>
            </Stack>
          </form>
        )}

        {/* STEP 2: SCAN QR OR MANUAL LOOKUP */}
        {step === 2 && (
          <Box sx={{ textAlign: 'center' }}>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 3 }}>
              <Button
                variant={scanMode === 'camera' ? 'contained' : 'outlined'}
                onClick={() => {
                  setScanMode('camera');
                  startCamera();
                }}
                sx={{
                  borderRadius: '12px',
                  px: 2.5,
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  bgcolor: scanMode === 'camera' ? '#6D214F' : 'transparent',
                  color: scanMode === 'camera' ? '#FFF8F0' : '#6D214F',
                  borderColor: '#6D214F',
                  '&:hover': { bgcolor: scanMode === 'camera' ? '#4e1739' : '#fdf2f4', borderColor: '#6D214F' },
                }}
              >
                Scan QR Camera
              </Button>
              <Button
                variant={scanMode === 'manual' ? 'contained' : 'outlined'}
                onClick={() => {
                  stopCamera();
                  setScanMode('manual');
                }}
                sx={{
                  borderRadius: '12px',
                  px: 2.5,
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  bgcolor: scanMode === 'manual' ? '#6D214F' : 'transparent',
                  color: scanMode === 'manual' ? '#FFF8F0' : '#6D214F',
                  borderColor: '#6D214F',
                  '&:hover': { bgcolor: scanMode === 'manual' ? '#4e1739' : '#fdf2f4', borderColor: '#6D214F' },
                }}
              >
                Enter ID / Upload
              </Button>
            </Box>

            {scanMode === 'camera' && (
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: '280px',
                    height: '280px',
                    mx: 'auto',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    border: '2px solid #00BAF2',
                    boxShadow: '0 0 25px rgba(0, 186, 242, 0.25)',
                    position: 'relative',
                    bgcolor: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />

                  {/* Laser Line Scanning Animation */}
                  <motion.div
                    animate={{
                      top: ['5%', '90%', '5%'],
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      position: 'absolute',
                      left: '6%',
                      right: '6%',
                      height: '3px',
                      background: 'linear-gradient(90deg, transparent 0%, #00BAF2 50%, transparent 100%)',
                      boxShadow: '0 0 16px 3px #00BAF2',
                      borderRadius: '50%',
                      zIndex: 2,
                    }}
                  />

                  {/* Corner Brackets */}
                  <Box sx={{ position: 'absolute', top: 0, left: 0, width: 28, height: 28, borderTop: '4px solid #00BAF2', borderLeft: '4px solid #00BAF2', borderTopLeftRadius: '14px', zIndex: 2 }} />
                  <Box sx={{ position: 'absolute', top: 0, right: 0, width: 28, height: 28, borderTop: '4px solid #00BAF2', borderRight: '4px solid #00BAF2', borderTopRightRadius: '14px', zIndex: 2 }} />
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: 28, height: 28, borderBottom: '4px solid #00BAF2', borderLeft: '4px solid #00BAF2', borderBottomLeftRadius: '14px', zIndex: 2 }} />
                  <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderBottom: '4px solid #00BAF2', borderRight: '4px solid #00BAF2', borderBottomRightRadius: '14px', zIndex: 2 }} />

                  {lookupMutation.isPending && (
                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
                      <CircularProgress sx={{ color: '#00BAF2' }} />
                    </Box>
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: '#8c6b7d', mt: 1.5, display: 'block', mb: 2, fontWeight: 600 }}>
                  Align Vendor QR Code inside the camera frame
                </Typography>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    borderColor: '#E5989B',
                    color: '#6D214F',
                    borderRadius: '14px',
                    py: 1,
                    fontSize: '0.85rem',
                    px: 3,
                    fontWeight: 800,
                    textTransform: 'none',
                    '&:hover': { borderColor: '#6D214F', bgcolor: '#fdf2f4' },
                  }}
                >
                  Upload QR Image from Files
                </Button>
              </Box>
            )}

            {scanMode === 'manual' && (
              <form onSubmit={handleManualLookupSubmit}>
                <Stack spacing={2.5} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    placeholder="Enter Vendor ID (e.g. MEM123456)"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#2d0f1e',
                        bgcolor: '#FFF8F0',
                        borderRadius: '16px',
                        fontWeight: 700,
                        '& fieldset': { borderColor: '#f0d0d8' },
                        '&:hover fieldset': { borderColor: '#E5989B' },
                        '&.Mui-focused fieldset': { borderColor: '#6D214F', borderWidth: '2px' },
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={lookupMutation.isPending}
                    sx={{
                      background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
                      color: '#FFF8F0',
                      borderRadius: '16px',
                      py: 1.5,
                      fontWeight: 900,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      boxShadow: '0 6px 20px rgba(109, 33, 79, 0.25)',
                      '&:hover': { background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)' }
                    }}
                  >
                    {lookupMutation.isPending ? <CircularProgress size={24} sx={{ color: '#FFF8F0' }} /> : 'Lookup Vendor'}
                  </Button>

                  <Divider sx={{ borderColor: '#f0d0d8', my: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#8c6b7d', fontWeight: 700 }}>OR</Typography>
                  </Divider>

                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      borderColor: '#f0d0d8',
                      color: '#6D214F',
                      borderRadius: '16px',
                      py: 1.3,
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      textTransform: 'none',
                      '&:hover': { borderColor: '#6D214F', bgcolor: '#fdf2f4' },
                    }}
                  >
                    Upload QR Image
                  </Button>
                </Stack>
              </form>
            )}
          </Box>
        )}

        {/* STEP 3: CONFIRM & SEND */}
        {step === 3 && recipient && (
          <Box>
            <Box
              sx={{
                p: 2.5,
                borderRadius: '20px',
                bgcolor: '#FFF8F0',
                border: '1.5px solid #f0d0d8',
                mb: 3,
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: '#6D214F', color: '#FFF8F0', mx: 'auto', mb: 1, fontWeight: 900, fontSize: '1.5rem', border: '2px solid #F4C95D' }}>
                  {(recipient.name || recipient.username || 'U')[0].toUpperCase()}
                </Avatar>
                <Typography variant="h6" sx={{ color: '#2d0f1e', fontWeight: 900 }}>
                  {recipient.name || recipient.username}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6D214F', fontWeight: 800, display: 'block', mt: 0.2 }}>
                  Vendor ID: {recipient.member_id}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: '#f0d0d8', my: 2 }} />

              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" sx={{ color: '#8c6b7d', fontWeight: 700, textTransform: 'uppercase' }}>
                    Transfer Amount:
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: '#6D214F', fontWeight: 900 }}>
                    ₹{parseFloat(amount).toFixed(2)}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" sx={{ color: '#8c6b7d', fontWeight: 700, textTransform: 'uppercase' }}>
                    From Wallet:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2d0f1e', fontWeight: 800 }}>
                    Credits Wallet
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1, borderTop: '1px dashed #f0d0d8' }}>
                  <Typography variant="caption" sx={{ color: '#8c6b7d', fontWeight: 700, textTransform: 'uppercase' }}>
                    Recipient Gets:
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle1" sx={{ color: '#6D214F', fontWeight: 900 }}>
                      ₹{parseFloat(amount).toFixed(2)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8c6b7d', fontWeight: 700, display: 'block', fontSize: '11px' }}>
                      (Credits Wallet)
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleConfirmTransfer}
              disabled={transferMutation.isPending}
              endIcon={transferMutation.isPending ? null : <CheckCircleOutlineIcon />}
              sx={{
                background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
                color: '#FFF8F0',
                borderRadius: '16px',
                py: 1.6,
                fontWeight: 900,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 8px 24px rgba(109, 33, 79, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s'
              }}
            >
              {transferMutation.isPending ? <CircularProgress size={24} sx={{ color: '#FFF8F0' }} /> : `Confirm & Send ₹${parseFloat(amount).toFixed(2)}`}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default P2PTransfer;

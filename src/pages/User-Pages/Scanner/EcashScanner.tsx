import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Paper,
  Avatar,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ecashScannerImg from '../../../assets/chotu_sc.jpg';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import { toast } from 'react-toastify';
import {
  useGetWalletOverview,
  useGetMemberDetails,
  useLookupMemberForTransfer,
  useTransferP2PWallet,
} from '../../../api/Memeber';
import TokenService from '../../../api/token/tokenService';

const decoder = (jsQR as any).default || jsQR;

const EcashScanner: React.FC = () => {
  const navigate = useNavigate();
  const currentMemberId = TokenService.getMemberId();
  const { data: walletOverview } = useGetWalletOverview(currentMemberId);
  const { data: memberDetails } = useGetMemberDetails(currentMemberId);
  const lookupMutation = useLookupMemberForTransfer();
  const transferMutation = useTransferP2PWallet();

  // Camera & Scanning States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Manual & Payment Dialog States
  const [manualInput, setManualInput] = useState<string>('');
  const [recipient, setRecipient] = useState<any>(null);
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');

  const stopCamera = useCallback(() => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setTorchOn(false);
  }, []);

  const handleLookup = useCallback(async (scannedData: string) => {
    let cleanId = scannedData.trim();
    if (!cleanId) return;

    // Handle Ecash-P2P: / Eshopy-P2P: ID format
    if (cleanId.startsWith('Ecash-P2P:')) {
      cleanId = cleanId.replace('Ecash-P2P:', '').trim();
    } else if (cleanId.startsWith('Eshopy-P2P:')) {
      cleanId = cleanId.replace('Eshopy-P2P:', '').trim();
    } else if (cleanId.startsWith('E-shopy-P2P:')) {
      cleanId = cleanId.replace('E-shopy-P2P:', '').trim();
    }

    const myId = memberDetails?.Member_id || memberDetails?.member_id || currentMemberId || '';
    if (cleanId.toUpperCase() === myId.toUpperCase()) {
      toast.error('You cannot transfer funds to your own account');
      setIsScanning(true);
      return;
    }

    stopCamera();

    try {
      const result = await lookupMutation.mutateAsync({ identifier: cleanId });
      if (result) {
        setRecipient(result);
        setPaymentDialogOpen(true);
      } else {
        toast.error('Member not found. Please try scanning again.');
        setIsScanning(true);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Member lookup failed. Please try again.');
      setIsScanning(true);
    }
  }, [currentMemberId, memberDetails, lookupMutation, stopCamera]);

  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.height = videoRef.current.videoHeight;
          canvas.width = videoRef.current.videoWidth;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = decoder(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });
          if (code && code.data) {
            handleLookup(code.data);
            return;
          }
        }
      }
    }
    animFrameId.current = requestAnimationFrame(tick);
  }, [handleLookup]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();

          // Check if torch is supported
          const track = stream.getVideoTracks()[0];
          const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
          setHasTorch(Boolean(capabilities?.torch));

          animFrameId.current = requestAnimationFrame(tick);
        }
      } else {
        setCameraError('Camera not supported in this browser.');
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please allow camera permissions or upload an image.');
    }
  }, [cameraFacing, tick]);

  useEffect(() => {
    if (isScanning && !paymentDialogOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isScanning, paymentDialogOpen, startCamera, stopCamera]);

  const toggleTorch = async () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      if (track) {
        try {
          await (track as any).applyConstraints({
            advanced: [{ torch: !torchOn }],
          });
          setTorchOn(!torchOn);
        } catch (e) {
          toast.info('Flashlight not available on this device');
        }
      }
    }
  };

  const toggleCameraFacing = () => {
    stopCamera();
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
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
            toast.error('No valid QR code detected in the selected image.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) {
      toast.error('Please enter a Member ID or Phone number');
      return;
    }
    handleLookup(manualInput);
  };

  const handleSendPayment = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    const availableBalance = Number(walletOverview?.balance || 0);

    if (numAmount > availableBalance) {
      toast.error('Insufficient Credits balance');
      return;
    }

    try {
      await transferMutation.mutateAsync({
        senderId: memberDetails?.Member_id || memberDetails?.member_id || currentMemberId || '',
        recipientId: recipient?.Member_id || recipient?.member_id || '',
        sourceWallet: 'Credits',
        amount: numAmount,
        idToken: 'BYPASS_TOKEN',
      });

      toast.success(`₹${numAmount.toLocaleString()} successfully transferred to ${recipient?.Name || 'Member'}!`);
      setPaymentDialogOpen(false);
      setAmount('');
      setRecipient(null);
      navigate('/user/transactions?type=P2P');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Transfer failed. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        bgcolor: '#0A0E17',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />

      {/* Top Navigation Bar */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 2,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.15)',
            color: '#FFFFFF',
            backdropFilter: 'blur(8px)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{
            bgcolor: '#FFFFFF',
            px: 1.5,
            py: 0.4,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Box
              component="img"
              src="/e-shopy.jpeg"
              alt="E-shopy"
              sx={{
                height: 22,
                objectFit: 'contain',
                display: 'block',
                mixBlendMode: 'multiply'
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: '#FE8001', fontWeight: 700, mt: 0.3 }}>
            Scanner
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {hasTorch && (
            <IconButton
              onClick={toggleTorch}
              sx={{
                bgcolor: torchOn ? '#FE8001' : 'rgba(255, 255, 255, 0.15)',
                color: torchOn ? '#FFFFFF' : '#FFFFFF',
                backdropFilter: 'blur(8px)',
                '&:hover': { bgcolor: torchOn ? '#FF9933' : 'rgba(255, 255, 255, 0.25)' },
              }}
            >
              {torchOn ? <FlashOnIcon /> : <FlashOffIcon />}
            </IconButton>
          )}

          <IconButton
            onClick={() => setQrModalOpen(true)}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              backdropFilter: 'blur(8px)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
            }}
            title="View E shopy QR"
          >
            <QrCode2Icon />
          </IconButton>

          <IconButton
            onClick={toggleCameraFacing}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              backdropFilter: 'blur(8px)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
            }}
          >
            <FlipCameraIosIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Main Viewport / Camera Feed */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
        }}
      >
        {/* Real Live Video */}
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
          }}
        />

        {/* Camera error fallback view */}
        {cameraError && (
          <Box
            sx={{
              position: 'relative',
              zIndex: 10,
              bgcolor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              p: 3,
              borderRadius: '20px',
              textAlign: 'center',
              maxWidth: '340px',
              border: '1px solid rgba(0, 186, 242, 0.3)',
            }}
          >
            <Typography variant="body2" sx={{ color: '#F87171', mb: 2, fontWeight: 700 }}>
              {cameraError}
            </Typography>
            <Button
              variant="contained"
              onClick={() => fileInputRef.current?.click()}
              startIcon={<PhotoLibraryIcon />}
              sx={{
                bgcolor: '#FE8001',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontWeight: 800,
                textTransform: 'none',
                '&:hover': { bgcolor: '#FF9933' },
              }}
            >
              Upload QR from Gallery
            </Button>
          </Box>
        )}

        {/* Paytm Style Scanner Framing Box */}
        {!cameraError && (
          <Box
            sx={{
              position: 'relative',
              zIndex: 10,
              width: { xs: '260px', sm: '290px' },
              height: { xs: '260px', sm: '290px' },
              borderRadius: '24px',
              boxShadow: '0 0 0 9999px rgba(10, 14, 23, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* 4 Corner Accents */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: 34, height: 34, borderTop: '4px solid #FE8001', borderLeft: '4px solid #FE8001', borderTopLeftRadius: '16px' }} />
            <Box sx={{ position: 'absolute', top: 0, right: 0, width: 34, height: 34, borderTop: '4px solid #FE8001', borderRight: '4px solid #FE8001', borderTopRightRadius: '16px' }} />
            <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: 34, height: 34, borderBottom: '4px solid #FE8001', borderLeft: '4px solid #FE8001', borderBottomLeftRadius: '16px' }} />
            <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: 34, height: 34, borderBottom: '4px solid #FE8001', borderRight: '4px solid #FE8001', borderBottomRightRadius: '16px' }} />

            {/* Glowing Laser Scan Line Animation */}
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
                background: 'linear-gradient(90deg, transparent 0%, #FE8001 50%, transparent 100%)',
                boxShadow: '0 0 16px 3px #FE8001',
                borderRadius: '50%',
              }}
            />
          </Box>
        )}

        {/* Helper Instructions */}
        <Typography
          sx={{
            position: 'relative',
            zIndex: 10,
            mt: 3.5,
            color: '#FFFFFF',
            fontSize: '0.9rem',
            fontWeight: 700,
            textAlign: 'center',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          }}
        >
          Align any E shopy QR code within frame
        </Typography>
      </Box>

      {/* Bottom Control Bar */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 20,
          background: 'linear-gradient(0deg, #0A0E17 0%, rgba(10, 14, 23, 0.95) 80%, transparent 100%)',
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* Quick Gallery Upload Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
            startIcon={<PhotoLibraryIcon />}
            sx={{
              color: '#FFFFFF',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '999px',
              px: 3,
              py: 1,
              fontWeight: 800,
              fontSize: '0.85rem',
              textTransform: 'none',
              backdropFilter: 'blur(8px)',
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.16)',
                borderColor: '#FE8001',
              },
            }}
          >
            Upload from Gallery
          </Button>
        </Box>

        {/* Manual Member ID Search Bar */}
        <Paper
          component="form"
          onSubmit={handleManualSearch}
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            p: '4px 12px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <TextField
            fullWidth
            placeholder="Or enter Member ID to Pay"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
                color: '#FFFFFF',
                fontSize: '0.9rem',
                fontWeight: 600,
                '& input::placeholder': {
                  color: '#94A3B8',
                  opacity: 1,
                },
              },
            }}
          />
          <Button
            type="submit"
            disabled={lookupMutation.isPending}
            sx={{
              bgcolor: '#FE8001',
              color: '#FFFFFF',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.8rem',
              px: 2,
              py: 0.8,
              textTransform: 'none',
              '&:hover': { bgcolor: '#FF9933' },
            }}
          >
            {lookupMutation.isPending ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : 'Lookup'}
          </Button>
        </Paper>
      </Box>

      {/* Payment / Transfer Modal (Paytm Style Instant Pay) */}
      <AnimatePresence>
        {paymentDialogOpen && recipient && (
          <Dialog
            open={paymentDialogOpen}
            onClose={() => {
              setPaymentDialogOpen(false);
              setIsScanning(true);
            }}
            PaperProps={{
              sx: {
                bgcolor: '#FFFFFF',
                borderRadius: '24px',
                p: 1,
                maxWidth: '420px',
                width: '100%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              },
            }}
          >
            <DialogContent sx={{ p: 2.5 }}>
              {/* Recipient Profile Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #002970 0%, #E06F00 60%, #FE8001 100%)',
                  color: '#FFFFFF',
                  mb: 3,
                }}
              >
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: '#FFFFFF',
                    color: '#002970',
                    fontWeight: 900,
                    fontSize: '1.4rem',
                    border: '2px solid #38BDF8',
                  }}
                >
                  {recipient?.Name ? recipient.Name.charAt(0).toUpperCase() : <PersonIcon />}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2 }}>
                      {recipient?.Name || 'Member'}
                    </Typography>
                    <CheckCircleIcon sx={{ fontSize: 16, color: '#38BDF8' }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#E0F2FE', fontWeight: 700 }}>
                    ID: {recipient?.Member_id || recipient?.member_id || recipient?.id || 'N/A'}
                  </Typography>
                  {recipient?.mobile && (
                    <Typography variant="caption" sx={{ display: 'block', color: '#BAE6FD', fontSize: '0.72rem' }}>
                      📱 {recipient.mobile}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Source Wallet Selector */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 800, mb: 0.8, display: 'block', textTransform: 'uppercase' }}>
                  Pay From Wallet
                </Typography>
                <Box
                  sx={{
                    p: 1.8,
                    borderRadius: '16px',
                    border: '2px solid #FE8001',
                    bgcolor: '#F0F9FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 12px rgba(0, 186, 242, 0.1)',
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#002970', textTransform: 'uppercase' }}>
                      Wallet
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                      Available for Transfer
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#FE8001' }}>
                    ₹{Number(walletOverview?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>

              {/* Amount Input */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 800, mb: 0.8, display: 'block', textTransform: 'uppercase' }}>
                  Enter Amount (₹)
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: '#FE8001' }}>
                          ₹
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
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
                      padding: '14px 16px',
                      fontSize: '1.25rem',
                      fontWeight: 900,
                    },
                  }}
                />
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setPaymentDialogOpen(false);
                  setIsScanning(true);
                }}
                sx={{
                  py: 1.4,
                  borderRadius: '14px',
                  fontWeight: 800,
                  textTransform: 'none',
                  color: '#64748B',
                  borderColor: '#CBD5E1',
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSendPayment}
                disabled={transferMutation.isPending}
                startIcon={<SendIcon />}
                sx={{
                  py: 1.4,
                  borderRadius: '14px',
                  fontWeight: 900,
                  fontSize: '1rem',
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 8px 20px rgba(0, 186, 242, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FF9933 0%, #E06F00 100%)',
                    boxShadow: '0 10px 24px rgba(0, 186, 242, 0.45)',
                  },
                }}
              >
                {transferMutation.isPending ? 'Processing...' : 'Pay Now'}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>

      {/* E shopy Scanner QR Card Modal */}
      <Dialog
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#FFFFFF',
            borderRadius: '24px',
            p: 2.5,
            maxWidth: '360px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 48px rgba(0,0,0,0.3)',
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src={ecashScannerImg}
            alt="Scanner QR Card"
            sx={{
              width: '100%',
              maxWidth: 340,
              height: 'auto',
              borderRadius: '20px',
              boxShadow: '0 8px 24px rgba(109,33,79,0.12)',
              bgcolor: '#0f0f12',
              transform: 'scale(1.08)',
            }}
          />
          <Button
            onClick={() => setQrModalOpen(false)}
            variant="contained"
            fullWidth
            sx={{
              mt: 1,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              textTransform: 'none'
            }}
          >
            Close
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default EcashScanner;
export { EcashScanner };

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Stack,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  useGetMemberDetails,
  useGetWalletOverview,
  useLookupMemberForTransfer,
  useTransferP2PWallet,
} from '../../../api/Memeber';
import {
  useRequestAddOnMutation,
  useGetLoadFundConfig,
  useUploadPaymentScreenshot,
} from '../../../api/Packages';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { motion, AnimatePresence } from 'framer-motion';
import jsQR from 'jsqr';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import TokenService from '../../../api/token/tokenService';
import jeeScImage from '../../../assets/chotu_sc.jpg';

const decoder = (jsQR as any).default || jsQR;

const getCurrentUserId = () => {
  const tId = TokenService.getMemberId();
  if (tId) return tId;
  try {
    const token = TokenService.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      return decoded.Member_id || decoded.memberId || decoded.id || '';
    }
  } catch (e) {}
  return '';
};

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
      },
    }}
  >
    {children}
  </Box>
);

const MyQR: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentUserId = getCurrentUserId();
  const { data: memberDetails, isLoading } = useGetMemberDetails(currentUserId);
  const { data: walletOverview } = useGetWalletOverview(currentUserId);
  const lookupMutation = useLookupMemberForTransfer();
  const transferMutation = useTransferP2PWallet();

  // Load Fund Mutations & Config
  const requestAddOn = useRequestAddOnMutation();
  const uploadScreenshot = useUploadPaymentScreenshot(currentUserId || '');
  useGetLoadFundConfig();

  // Active Tab: 'scanner' | 'my_qr'
  const paramTab = searchParams.get('tab');
  const initialTab: 'scanner' | 'my_qr' = paramTab === 'qr' ? 'my_qr' : 'scanner';
  const [activeTab, setActiveTab] = useState<'scanner' | 'my_qr'>(initialTab);

  // Scanner States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState<string>('');

  // Payment / Transfer Dialog States
  const [recipient, setRecipient] = useState<any>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [sourceWallet, setSourceWallet] = useState<'Top Up Wallet' | 'Earning Wallet'>('Top Up Wallet');

  // Load Fund / Deposit States (Transaction ID / UTR)
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositTxNo, setDepositTxNo] = useState<string>('');
  const [depositScreenshotFile, setDepositScreenshotFile] = useState<File | null>(null);
  const [depositScreenshotPreview, setDepositScreenshotPreview] = useState<string | null>(null);
  const [isDepositSubmitting, setIsDepositSubmitting] = useState<boolean>(false);
  const depositFileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleLookup = useCallback(
    async (scannedData: string) => {
      let cleanId = scannedData.trim();
      if (!cleanId) return;

      if (cleanId.startsWith('Ecash-P2P:')) {
        cleanId = cleanId.replace('Ecash-P2P:', '').trim();
      }

      const myId = memberDetails?.Member_id || memberDetails?.member_id || currentUserId || '';
      if (cleanId.toUpperCase() === myId.toUpperCase()) {
        toast.error('You cannot transfer funds to your own account');
        return;
      }

      stopCamera();

      try {
        const result = await lookupMutation.mutateAsync({ identifier: cleanId });
        if (result) {
          setRecipient(result);
          setPaymentDialogOpen(true);
        } else {
          toast.error('Vendor not found. Please verify the ID/QR.');
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Vendor lookup failed.');
      }
    },
    [currentUserId, memberDetails, lookupMutation, stopCamera]
  );

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

          const track = stream.getVideoTracks()[0];
          const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
          setHasTorch(Boolean(capabilities?.torch));

          animFrameId.current = requestAnimationFrame(tick);
        }
      } else {
        setCameraError('Camera not supported in this browser.');
      }
    } catch (err) {
      setCameraError('Unable to access camera. Please allow permissions or upload an image.');
    }
  }, [cameraFacing, tick]);

  useEffect(() => {
    if (activeTab === 'scanner' && !paymentDialogOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, paymentDialogOpen, startCamera, stopCamera]);

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
      toast.error('Please enter a Vendor ID');
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

    const availableBalance =
      sourceWallet === 'Top Up Wallet'
        ? Number(walletOverview?.topUpBalance || 0)
        : Number(walletOverview?.balance || 0);

    if (numAmount > availableBalance) {
      toast.error(`Insufficient balance in ${sourceWallet}`);
      return;
    }

    try {
      await transferMutation.mutateAsync({
        senderId: memberDetails?.Member_id || memberDetails?.member_id || currentUserId || '',
        recipientId: recipient?.Member_id || recipient?.member_id || '',
        sourceWallet: sourceWallet,
        amount: numAmount,
        idToken: 'BYPASS_TOKEN',
      });

      toast.success(`₹${numAmount.toLocaleString()} successfully transferred to ${recipient?.Name || 'Vendor'}!`);
      setPaymentDialogOpen(false);
      setAmount('');
      setRecipient(null);
      navigate('/user/transactions?type=P2P');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Transfer failed. Please try again.');
    }
  };

  // Load Fund / Deposit Submit Handler with Transaction ID
  const handleDepositScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDepositScreenshotFile(file);
      setDepositScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      toast.error('Please enter a valid deposit amount');
      return;
    }

    if (!depositTxNo.trim()) {
      toast.error('Please enter the UTR / Transaction Reference ID');
      return;
    }

    if (!depositScreenshotFile) {
      toast.error('Please upload your payment screenshot/receipt');
      return;
    }

    try {
      setIsDepositSubmitting(true);
      const uploadRes = await uploadScreenshot.mutateAsync(depositScreenshotFile);
      const screenshotUrl = uploadRes?.url || '';

      await requestAddOn.mutateAsync({
        member_id: currentUserId || '',
        requested_amount: Number(depositAmount),
        tx_no: depositTxNo.trim(),
        screenshot_url: screenshotUrl,
        payment_method: 'UPI/QR',
      });

      setDepositAmount('');
      setDepositTxNo('');
      setDepositScreenshotFile(null);
      setDepositScreenshotPreview(null);
    } catch (err: any) {
      console.error('Deposit error:', err);
    } finally {
      setIsDepositSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', bgcolor: '#F1F5F9' }}>
        <CircularProgress sx={{ color: '#FE8001' }} />
      </Box>
    );
  }

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
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        maxWidth: '520px',
        mx: 'auto',
        minHeight: '100vh',
        bgcolor: '#F1F5F9',
        pb: 10,
      }}
    >
      {/* Hidden processing canvas & file input */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />

      {/* Header Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            bgcolor: '#ffffff',
            border: '1.5px solid #E2E8F0',
            color: '#0F172A',
            p: 1,
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            '&:hover': { bgcolor: '#F8FAFC' },
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
            E-cash Scanner & QR
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            Scan & Pay, Receive Money, or Deposit via UTR
          </Typography>
        </Box>
      </Box>

      {/* 2-Tab Switcher: Scan & Pay | My QR */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          bgcolor: '#E2E8F0',
          borderRadius: '16px',
          p: 0.6,
          mb: 3,
          gap: 0.5,
        }}
      >
        <Button
          fullWidth
          onClick={() => setActiveTab('scanner')}
          startIcon={<QrCodeScannerIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
          sx={{
            py: 1.2,
            px: { xs: 0.5, sm: 1.5 },
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 800,
            fontSize: '0.88rem',
            bgcolor: activeTab === 'scanner' ? '#FE8001' : 'transparent',
            color: activeTab === 'scanner' ? '#FFFFFF' : '#475569',
            boxShadow: activeTab === 'scanner' ? '0 4px 12px rgba(0, 186, 242, 0.35)' : 'none',
            '&:hover': {
              bgcolor: activeTab === 'scanner' ? '#FF9933' : 'rgba(255,255,255,0.4)',
            },
            transition: 'all 0.2s',
          }}
        >
          Scan & Pay
        </Button>

        <Button
          fullWidth
          onClick={() => setActiveTab('my_qr')}
          startIcon={<QrCode2Icon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
          sx={{
            py: 1.2,
            px: { xs: 0.5, sm: 1.5 },
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 800,
            fontSize: '0.88rem',
            bgcolor: activeTab === 'my_qr' ? '#FE8001' : 'transparent',
            color: activeTab === 'my_qr' ? '#FFFFFF' : '#475569',
            boxShadow: activeTab === 'my_qr' ? '0 4px 12px rgba(0, 186, 242, 0.35)' : 'none',
            '&:hover': {
              bgcolor: activeTab === 'my_qr' ? '#FF9933' : 'rgba(255,255,255,0.4)',
            },
            transition: 'all 0.2s',
          }}
        >
          My QR
        </Button>
      </Box>

      {/* TAB 1: SCANNER VIEWPORT */}
      {activeTab === 'scanner' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {/* Live Scanner Card */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: '24px',
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              border: '1px solid #1E293B',
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.15)',
              overflow: 'hidden',
              p: { xs: 2.5, sm: 3 },
              textAlign: 'center',
            }}
          >
            {/* Top Camera Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#38BDF8' }}>
                📷 Live QR Scanner
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {hasTorch && (
                  <IconButton
                    size="small"
                    onClick={toggleTorch}
                    sx={{
                      bgcolor: torchOn ? '#FE8001' : 'rgba(255,255,255,0.15)',
                      color: '#FFFFFF',
                    }}
                  >
                    {torchOn ? <FlashOnIcon fontSize="small" /> : <FlashOffIcon fontSize="small" />}
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  onClick={toggleCameraFacing}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: '#FFFFFF',
                  }}
                >
                  <FlipCameraIosIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Camera Viewport Frame */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: '280px',
                height: '280px',
                mx: 'auto',
                borderRadius: '24px',
                overflow: 'hidden',
                bgcolor: '#000000',
                border: '2px solid #FE8001',
                boxShadow: '0 0 25px rgba(0, 186, 242, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2.5,
              }}
            >
              <video
                ref={videoRef}
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

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
                  background: 'linear-gradient(90deg, transparent 0%, #FE8001 50%, transparent 100%)',
                  boxShadow: '0 0 16px 3px #FE8001',
                  borderRadius: '50%',
                  zIndex: 2,
                }}
              />

              {/* Corner Brackets */}
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: 28, height: 28, borderTop: '4px solid #FE8001', borderLeft: '4px solid #FE8001', borderTopLeftRadius: '14px', zIndex: 2 }} />
              <Box sx={{ position: 'absolute', top: 0, right: 0, width: 28, height: 28, borderTop: '4px solid #FE8001', borderRight: '4px solid #FE8001', borderTopRightRadius: '14px', zIndex: 2 }} />
              <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: 28, height: 28, borderBottom: '4px solid #FE8001', borderLeft: '4px solid #FE8001', borderBottomLeftRadius: '14px', zIndex: 2 }} />
              <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderBottom: '4px solid #FE8001', borderRight: '4px solid #FE8001', borderBottomRightRadius: '14px', zIndex: 2 }} />
            </Box>

            {cameraError && (
              <Typography variant="caption" sx={{ color: '#F87171', display: 'block', mb: 2 }}>
                {cameraError}
              </Typography>
            )}

            {/* Gallery Upload & Direct Member ID Search */}
            <Stack spacing={2}>
              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                startIcon={<PhotoLibraryIcon />}
                fullWidth
                sx={{
                  color: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  borderRadius: '14px',
                  py: 1.2,
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.16)',
                    borderColor: '#FE8001',
                  },
                }}
              >
                Upload QR Image from Gallery
              </Button>

              <Paper
                component="form"
                onSubmit={handleManualSearch}
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  p: '4px 8px 4px 14px',
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Or enter Vendor ID to transfer"
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
                  {lookupMutation.isPending ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : 'Search'}
                </Button>
              </Paper>
            </Stack>
          </Paper>
        </motion.div>
      )}

      {/* TAB 2: ENTER TRANSACTION ID / UTR (MY QR TAB) */}
      {activeTab === 'my_qr' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {/* ENTER TRANSACTION ID / UTR CARD */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: '24px',
              bgcolor: '#ffffff',
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
            }}
          >
            {/* Header with Paytm Icon Badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <PaytmIconBadge>
                <ConfirmationNumberIcon />
              </PaytmIconBadge>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>
                  Enter Transaction ID / UTR
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Enter your unique payment reference number below
                </Typography>
              </Box>
            </Box>

            {/* Top Balance Banner */}
            <Box
              sx={{
                p: 1.8,
                borderRadius: '16px',
                bgcolor: '#F0F9FF',
                border: '1px solid #BAE6FD',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2.5,
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: '#0369A1', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.72rem' }}>
                  Current Top Up Balance
                </Typography>
                <Typography variant="h6" sx={{ color: '#002970', fontWeight: 900, fontSize: '1.1rem' }}>
                  ₹{Number(walletOverview?.topUpBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
              <PaytmIconBadge>
                <AccountBalanceWalletIcon />
              </PaytmIconBadge>
            </Box>

            {/* Company UPI QR Preview Box (E-cash Scanner) */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 1.2,
                mb: 2.5,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#002970', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Scan & Pay via PhonePe / UPI
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: { xs: 300, sm: 330 },
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  bgcolor: '#0f0f12',
                  boxShadow: '0 10px 28px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0, 186, 242, 0.35)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 14px 34px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(0, 186, 242, 0.55)',
                  }
                }}
              >
                <Box
                  component="img"
                  src={jeeScImage}
                  alt="PhonePe Scanner QR"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'contain',
                    transform: 'scale(1.10)',
                    transformOrigin: 'center center',
                  }}
                />
              </Box>
            </Box>

            {/* Deposit Form */}
            <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Field 1: Amount */}
              <Box>
                <Typography variant="caption" sx={{ mb: 0.6, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase' }}>
                  Deposit Amount (₹)
                </Typography>
                <TextField
                  fullWidth
                  name="depositAmount"
                  type="number"
                  placeholder="e.g. 5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PaytmIconBadge>
                          <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: '#FFFFFF' }}>₹</Typography>
                        </PaytmIconBadge>
                      </InputAdornment>
                    ),
                  }}
                  sx={modernInputStyles}
                />
              </Box>

              {/* Field 2: Transaction ID / UTR Unique Number */}
              <Box>
                <Typography variant="caption" sx={{ mb: 0.6, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase' }}>
                  UTR / Unique Transaction ID
                </Typography>
                <TextField
                  fullWidth
                  name="depositTxNo"
                  placeholder="Enter 12-digit UTR or Txn Unique Ref No."
                  value={depositTxNo}
                  onChange={(e) => setDepositTxNo(e.target.value)}
                  helperText="Must be a unique transaction reference number (UTR / Txn ID)"
                  FormHelperTextProps={{
                    sx: { color: '#64748B', fontWeight: 600, fontSize: '0.72rem', mt: 0.5, ml: 0.5 }
                  }}
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

              {/* Field 3: Payment Screenshot Upload */}
              <Box>
                <Typography variant="caption" sx={{ mb: 0.6, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase' }}>
                  Payment Screenshot / Receipt (Optional)
                </Typography>
                <input
                  ref={depositFileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleDepositScreenshotChange}
                />

                {depositScreenshotPreview ? (
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: 150,
                      borderRadius: '14px',
                      overflow: 'hidden',
                      border: '1.5px solid #FE8001',
                      bgcolor: '#F8FAFC',
                    }}
                  >
                    <Box
                      component="img"
                      src={depositScreenshotPreview}
                      alt="Screenshot Preview"
                      sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                    <IconButton
                      onClick={() => {
                        setDepositScreenshotFile(null);
                        setDepositScreenshotPreview(null);
                      }}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: '#EF4444',
                        color: '#FFFFFF',
                        '&:hover': { bgcolor: '#DC2626' },
                      }}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => depositFileInputRef.current?.click()}
                    startIcon={<CloudUploadIcon sx={{ color: '#FE8001' }} />}
                    sx={{
                      border: '1.5px dashed #CBD5E1',
                      borderRadius: '14px',
                      py: 1.5,
                      color: '#002970',
                      bgcolor: '#F8FAFC',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      textTransform: 'none',
                      '&:hover': { borderColor: '#FE8001', bgcolor: '#F0F9FF' },
                    }}
                  >
                    Upload Payment Screenshot
                  </Button>
                )}
              </Box>

              {/* Submit Deposit Request Button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isDepositSubmitting}
                  sx={{
                    mt: 0.5,
                    background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
                    color: '#FFFFFF',
                    py: 1.4,
                    borderRadius: '14px',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    boxShadow: '0 8px 20px rgba(0, 186, 242, 0.35)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #FF9933 0%, #E06F00 100%)',
                      boxShadow: '0 10px 24px rgba(0, 186, 242, 0.45)',
                    },
                    '&:disabled': {
                      bgcolor: '#CBD5E1',
                      color: '#94A3B8',
                    },
                  }}
                >
                  {isDepositSubmitting ? 'Submitting Deposit...' : 'Submit Transaction ID Request'}
                </Button>
              </motion.div>
            </form>
          </Paper>
        </motion.div>
      )}

      {/* Instant Payment Dialog */}
      <AnimatePresence>
        {paymentDialogOpen && recipient && (
          <Dialog
            open={paymentDialogOpen}
            onClose={() => {
              setPaymentDialogOpen(false);
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
                      {recipient?.Name || 'Vendor'}
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
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <Box
                    onClick={() => setSourceWallet('Top Up Wallet')}
                    sx={{
                      p: 1.5,
                      borderRadius: '14px',
                      border: `2px solid ${sourceWallet === 'Top Up Wallet' ? '#FE8001' : '#E2E8F0'}`,
                      bgcolor: sourceWallet === 'Top Up Wallet' ? '#F0F9FF' : '#F8FAFC',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#002970' }}>
                      Top Up Wallet
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#0F172A' }}>
                      ₹{Number(walletOverview?.topUpBalance || 0).toLocaleString()}
                    </Typography>
                  </Box>

                  <Box
                    onClick={() => setSourceWallet('Earning Wallet')}
                    sx={{
                      p: 1.5,
                      borderRadius: '14px',
                      border: `2px solid ${sourceWallet === 'Earning Wallet' ? '#FE8001' : '#E2E8F0'}`,
                      bgcolor: sourceWallet === 'Earning Wallet' ? '#F0F9FF' : '#F8FAFC',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#002970' }}>
                      Payout Balance
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#0F172A' }}>
                      ₹{Number(walletOverview?.balance || 0).toLocaleString()}
                    </Typography>
                  </Box>
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
                onClick={() => setPaymentDialogOpen(false)}
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
    </Box>
  );
};

export default MyQR;

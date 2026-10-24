import React, { useState } from 'react';
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Button,
  Slide,
  useTheme,
  useMediaQuery,
  Fade
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { toast } from 'react-toastify';
import CropFreeIcon from '@mui/icons-material/CropFree';
import { useNavigate } from 'react-router-dom';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface DashboardQRDialogProps {
  open: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
}

const DashboardQRDialog: React.FC<DashboardQRDialogProps> = ({ open, onClose, memberId, memberName }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState<'my_qr' | 'scan_pay'>('my_qr');
  
  const qrData = `Ecash-P2P:${memberId}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&margin=10`;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrData);
    toast.success('QR Code Data copied to clipboard!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Ecash QR',
          text: `Pay me using my QR code! My Member ID is: ${memberId}`,
          url: qrImageUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ecash-QR-${memberId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('QR Code downloaded!');
    } catch (err) {
      toast.error('Failed to download QR code image.');
    }
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          background: 'linear-gradient(145deg, #050916 0%, #0D2658 50%, #0a1b40 100%)',
          borderRadius: { xs: 0, sm: '28px' },
          border: '1px solid rgba(255, 215, 0, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          maxWidth: '460px',
          width: '100%',
          overflow: 'hidden',
          m: { xs: 0, sm: 2 }
        }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2.5, 
        pb: 2,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ 
            background: 'linear-gradient(135deg, #FFD700 0%, #FFDF00 100%)',
            p: 1.2, 
            borderRadius: '14px',
            display: 'flex',
            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
          }}>
            <QrCode2Icon sx={{ color: '#0D2658', fontSize: 24 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#00C851' }} />
              <Typography sx={{ color: '#475569', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                Send / Receive
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ color: '#0F172A', fontWeight: 800, mt: -0.2 }}>
              Smart Transfer
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ 
            color: '#475569',
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            '&:hover': { color: '#0F172A', bgcolor: 'rgba(255,215,0,0.15)', borderColor: 'rgba(255,215,0,0.3)' }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Tabs (Pill Toggle Design) */}
      <Box sx={{ px: 3, pt: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          bgcolor: 'rgba(0,0,0,0.4)', 
          borderRadius: '999px', // Pill shape
          p: 0.75,
          border: '1px solid #E2E8F0',
          position: 'relative'
        }}>
          {/* Animated Background Pill */}
          <Box sx={{
            position: 'absolute',
            top: 6,
            bottom: 6,
            left: activeTab === 'my_qr' ? '6px' : 'calc(50% + 2px)',
            width: 'calc(50% - 8px)',
            bgcolor: '#0284C7',
            borderRadius: '999px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
          }} />

          <Button
            fullWidth
            onClick={() => setActiveTab('my_qr')}
            startIcon={<QrCode2Icon />}
            sx={{
              py: 1.2,
              borderRadius: '999px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              color: activeTab === 'my_qr' ? '#0D2658' : '#64748B',
              zIndex: 1,
              '&:hover': {
                bgcolor: 'transparent'
              }
            }}
          >
            Show QR
          </Button>
          <Button
            fullWidth
            onClick={() => setActiveTab('scan_pay')}
            startIcon={<CropFreeIcon />}
            sx={{
              py: 1.2,
              borderRadius: '999px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              color: activeTab === 'scan_pay' ? '#0D2658' : '#64748B',
              zIndex: 1,
              '&:hover': {
                bgcolor: 'transparent'
              }
            }}
          >
            Scan & Pay
          </Button>
        </Box>
      </Box>

      {/* Tab Content */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ 
          bgcolor: 'rgba(0, 0, 0, 0.2)', 
          borderRadius: '24px', 
          p: 3, 
          border: '1px solid rgba(255,215,0,0.05)',
          minHeight: '360px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {activeTab === 'my_qr' ? (
            <Fade in={true} timeout={400}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                {/* Glowing QR Container */}
                <Box sx={{
                  position: 'relative',
                  padding: '16px',
                  background: 'white',
                  borderRadius: '24px',
                  boxShadow: '0 0 40px rgba(255, 215, 0, 0.15), inset 0 0 20px rgba(0,0,0,0.05)',
                  mb: 3,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}>
                  {/* Neon border effect with Theme Colors */}
                  <Box sx={{ position: 'absolute', inset: -3, borderRadius: '26px', background: 'linear-gradient(45deg, #FFD700, #FFDF00, #FFD700)', zIndex: -1, opacity: 0.8, filter: 'blur(8px)' }} />
                  <Box sx={{ position: 'absolute', inset: -1, borderRadius: '25px', background: 'linear-gradient(45deg, #FFD700, #e6c200)', zIndex: -1 }} />
                  
                  <img src={qrImageUrl} alt="QR Code" style={{ display: 'block', width: '200px', height: '200px', borderRadius: '12px' }} />
                </Box>

                {/* Member Details Box */}
                <Box sx={{ 
                  width: '100%', 
                  bgcolor: 'rgba(255, 215, 0, 0.05)', 
                  borderRadius: '12px', 
                  p: { xs: 1.5, sm: 2 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  border: '1px solid rgba(255, 215, 0, 0.2)',
                  boxShadow: 'inset 0 0 20px rgba(255, 215, 0, 0.05)'
                }}>
                  <Typography sx={{ 
                    color: '#0284C7', 
                    fontSize: { xs: '0.65rem', sm: '0.75rem' }, 
                    fontWeight: 800, 
                    letterSpacing: '2px', 
                    textTransform: 'uppercase', 
                    mb: 0.5,
                    bgcolor: 'rgba(255, 215, 0, 0.1)',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '999px'
                  }}>
                    Member
                  </Typography>
                  <Typography sx={{ 
                    color: '#0F172A', 
                    fontSize: { xs: '1rem', sm: '1.15rem' }, 
                    fontWeight: 800, 
                    letterSpacing: '0.5px',
                    mt: 0.5 
                  }}>
                    {memberName} <span style={{ color: '#64748B', fontWeight: 400, margin: '0 4px' }}>—</span> {memberId}
                  </Typography>
                </Box>
              </Box>
            </Fade>
          ) : (
            <Fade in={true} timeout={400}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', py: 4 }}>
                <Box sx={{ 
                  width: 120, height: 120, 
                  border: '2px dashed rgba(255,215,0,0.3)', 
                  borderRadius: '24px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mb: 3,
                  position: 'relative',
                  bgcolor: 'rgba(255,215,0,0.02)'
                }}>
                  <QrCodeScannerIcon sx={{ fontSize: 48, color: 'rgba(255,215,0,0.5)' }} />
                  {/* Scanner line animation placeholder */}
                  <Box sx={{ position: 'absolute', top: '10%', left: 0, right: 0, height: '2px', bgcolor: '#0284C7', boxShadow: '0 0 10px #FFD700' }} />
                </Box>
                <Typography variant="h6" sx={{ color: '#0F172A', fontWeight: 800, mb: 1 }}>
                  Scan a QR Code
                </Typography>
                <Typography sx={{ color: '#475569', textAlign: 'center', fontSize: '0.9rem' }}>
                  Align the QR code within the frame to scan and pay instantly.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    onClose();
                    navigate('/user/scanner');
                  }}
                  sx={{
                    mt: 3,
                    background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
                    color: '#FFFFFF',
                    borderRadius: '999px',
                    px: 4, py: 1.2,
                    textTransform: 'uppercase',
                    fontWeight: 900,
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 15px rgba(0, 186, 242, 0.35)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #FF9933 0%, #E06F00 100%)',
                      boxShadow: '0 6px 20px rgba(0, 186, 242, 0.5)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Open Camera
                </Button>
              </Box>
            </Fade>
          )}
        </Box>
      </Box>

      {/* Actions (Only show for My QR) */}
      {activeTab === 'my_qr' && (
        <Box sx={{ 
          px: 3, 
          pb: 3,
          display: 'flex', 
          gap: 2 
        }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{
              color: '#0284C7',
              bgcolor: 'rgba(255,215,0,0.02)',
              borderColor: 'rgba(255,215,0,0.3)',
              borderRadius: '16px',
              py: 1.5,
              fontWeight: 800,
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'rgba(255,215,0,0.08)',
                bordercolor: '#0284C7'
              }
            }}
          >
            Download
          </Button>
          <Button
            fullWidth
            variant="contained"
            startIcon={<ShareIcon />}
            onClick={handleShare}
            sx={{
              background: 'linear-gradient(45deg, #0EA5E9 30%, #0284C7 90%)',
              color: '#0D2658',
              borderRadius: '16px',
              py: 1.5,
              fontWeight: 800,
              textTransform: 'none',
              boxShadow: '0 8px 20px rgba(255, 215, 0, 0.2)',
              '&:hover': {
                background: 'linear-gradient(45deg, #0284C7 30%, #0369A1 90%)',
                boxShadow: '0 10px 25px rgba(255, 215, 0, 0.3)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s'
            }}
          >
            Share
          </Button>
        </Box>
      )}
    </Dialog>
  );
};

export default DashboardQRDialog;

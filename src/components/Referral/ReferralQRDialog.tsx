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
  Fade,
  Chip,
  Avatar,
  Paper,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { toast } from 'react-toastify';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export interface ReferralQRDialogProps {
  open: boolean;
  onClose: () => void;
  vendorName: string;
  vendorCode: string;
  initialType?: 'vendor' | 'customer';
}

const ReferralQRDialog: React.FC<ReferralQRDialogProps> = ({
  open,
  onClose,
  vendorName,
  vendorCode,
  initialType = 'vendor',
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeType, setActiveType] = useState<'vendor' | 'customer'>(initialType);
  const [isDownloading, setIsDownloading] = useState(false);

  // Sync initial type when dialog opens
  React.useEffect(() => {
    if (open) {
      setActiveType(initialType);
    }
  }, [open, initialType]);

  const origin = window.location.origin;
  const vendorReferralLink = `${origin}/register?ref=${vendorCode}`;
  const customerReferralLink = `https://www.eshopy.biz/register?referralcode=${vendorCode}`;

  const currentLink = activeType === 'vendor' ? vendorReferralLink : customerReferralLink;
  const currentTitle = activeType === 'vendor' ? 'Vendor Registration' : 'Customer Registration';
  const currentThemeColor = activeType === 'vendor' ? '#6366F1' : '#10B981';
  const currentBgGradient =
    activeType === 'vendor'
      ? 'linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #8B5CF6 100%)'
      : 'linear-gradient(135deg, #059669 0%, #10B981 50%, #14B8A6 100%)';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(
    currentLink
  )}&margin=12`;

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(currentLink)
      .then(() => toast.success(`${currentTitle} link copied to clipboard!`))
      .catch(() => toast.error('Failed to copy link'));
  };

  const handleWhatsAppShare = () => {
    const text =
      activeType === 'vendor'
        ? `*Join E shopy as a Vendor!*\n\nRegister using my referral link and start earning commissions & business rewards:\n${vendorReferralLink}\n\n*Sponsor Code:* ${vendorCode}`
        : `*Welcome to E shopy!*\n\nRegister using my referral link to unlock exclusive customer shopping discounts:\n${customerReferralLink}\n\n*Referral Code:* ${vendorCode}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join E shopy - ${currentTitle}`,
          text: `Scan or click to register with sponsor code ${vendorCode}`,
          url: currentLink,
        });
      } catch (err) {
        // Dismissed share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQR = async () => {
    try {
      setIsDownloading(true);
      // Create off-screen canvas to draw a professional branded QR card
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 760;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // 1. Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 760);
      bgGrad.addColorStop(0, '#FFFFFF');
      bgGrad.addColorStop(1, '#F8FAFC');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 600, 760);

      // Top Header Bar
      const headerGrad = ctx.createLinearGradient(0, 0, 600, 0);
      if (activeType === 'vendor') {
        headerGrad.addColorStop(0, '#4338CA');
        headerGrad.addColorStop(0.5, '#6366F1');
        headerGrad.addColorStop(1, '#8B5CF6');
      } else {
        headerGrad.addColorStop(0, '#059669');
        headerGrad.addColorStop(0.5, '#10B981');
        headerGrad.addColorStop(1, '#14B8A6');
      }
      ctx.fillStyle = headerGrad;
      ctx.fillRect(0, 0, 600, 110);

      // Header Brand text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('E shopy', 300, 50);

      ctx.font = '600 16px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(activeType === 'vendor' ? 'Vendor Registration QR' : 'Customer Registration QR', 300, 85);

      // Vendor Info card area
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(vendorName || 'Valued Member', 300, 155);

      ctx.fillStyle = activeType === 'vendor' ? '#4F46E5' : '#059669';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`Sponsor Code: ${vendorCode}`, 300, 185);

      // Fetch QR Code image and draw on canvas
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.src = qrImageUrl;

      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = () => reject(new Error('Failed to load QR image'));
      });

      // QR Code white card box with subtle shadow
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(120, 215, 360, 360, 20);
      ctx.fill();
      ctx.stroke();

      // Draw QR inside
      ctx.drawImage(qrImg, 140, 235, 320, 320);

      // Instructions bottom
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Scan with any phone camera to register', 300, 620);

      ctx.fillStyle = '#64748B';
      ctx.font = '13px sans-serif';
      ctx.fillText(currentLink, 300, 650);

      // Footer
      ctx.fillStyle = '#94A3B8';
      ctx.font = '12px sans-serif';
      ctx.fillText('Powered by E shopy Business Platform', 300, 715);

      // Export canvas to PNG
      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `Eshopy-${activeType}-QR-${vendorCode}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      toast.success('Referral QR Card downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download QR card. Please try again.');
    } finally {
      setIsDownloading(false);
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
          background: '#FFFFFF',
          borderRadius: { xs: 0, sm: '24px' },
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          maxWidth: '440px',
          width: '100%',
          overflow: 'hidden',
          m: { xs: 0, sm: 2 },
        },
      }}
    >
      {/* Header with Title and Close button */}
      <Box
        sx={{
          background: currentBgGradient,
          p: { xs: 2, sm: 2.5 },
          pb: 2,
          color: '#FFFFFF',
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QrCode2Icon sx={{ fontSize: 24, color: '#FFFFFF' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#FFFFFF', lineHeight: 1.2 }}>
                Referral QR Code
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.85)', mt: 0.2 }}>
                Scan to Register New Users Directly
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: '#FFFFFF',
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Tab Switcher: Vendor vs Customer */}
        <Box
          sx={{
            display: 'flex',
            bgcolor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            p: 0.5,
            mt: 2,
            gap: 0.5,
          }}
        >
          <Button
            fullWidth
            onClick={() => setActiveType('vendor')}
            startIcon={<StorefrontIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: '9px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              py: 0.7,
              bgcolor: activeType === 'vendor' ? '#FFFFFF' : 'transparent',
              color: activeType === 'vendor' ? '#4338CA' : '#FFFFFF',
              boxShadow: activeType === 'vendor' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              '&:hover': {
                bgcolor: activeType === 'vendor' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Refer Vendor
          </Button>
          <Button
            fullWidth
            onClick={() => setActiveType('customer')}
            startIcon={<ShoppingCartIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: '9px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              py: 0.7,
              bgcolor: activeType === 'customer' ? '#FFFFFF' : 'transparent',
              color: activeType === 'customer' ? '#059669' : '#FFFFFF',
              boxShadow: activeType === 'customer' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              '&:hover': {
                bgcolor: activeType === 'customer' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Refer Customer
          </Button>
        </Box>
      </Box>

      {/* Main Dialog Body */}
      <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* User Identity Pill */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            p: 1.5,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: currentThemeColor,
                fontWeight: 800,
                fontSize: '0.9rem',
              }}
            >
              {(vendorName || 'V').trim().charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#1E293B', lineHeight: 1.2 }}>
                {vendorName || 'Vendor'}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, mt: 0.2 }}>
                Sponsor Code: <strong style={{ color: currentThemeColor }}>{vendorCode}</strong>
              </Typography>
            </Box>
          </Box>
          <Chip
            label={activeType === 'vendor' ? 'Vendor Signup' : 'Customer Signup'}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '0.68rem',
              height: '22px',
              bgcolor: activeType === 'vendor' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              color: currentThemeColor,
              border: `1px solid ${activeType === 'vendor' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            }}
          />
        </Box>

        {/* QR Code Card */}
        <Fade in={true} key={activeType} timeout={300}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '20px',
                border: '2px solid',
                borderColor: activeType === 'vendor' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(16, 185, 129, 0.25)',
                boxShadow:
                  activeType === 'vendor'
                    ? '0 12px 30px rgba(99, 102, 241, 0.16)'
                    : '0 12px 30px rgba(16, 185, 129, 0.16)',
                bgcolor: '#FFFFFF',
                mb: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                src={qrImageUrl}
                alt={`${activeType} referral QR code`}
                style={{
                  display: 'block',
                  width: '210px',
                  height: '210px',
                  borderRadius: '12px',
                }}
              />
            </Paper>

            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.85rem',
                color: '#1E293B',
                textAlign: 'center',
                lineHeight: 1.4,
                mb: 0.5,
              }}
            >
              Scan with any Phone Camera or QR Scanner
            </Typography>
            <Typography
              sx={{
                fontSize: '0.74rem',
                color: '#64748B',
                textAlign: 'center',
                maxWidth: '320px',
                mb: 2,
              }}
            >
              Opens the registration form automatically with your sponsor code{' '}
              <strong style={{ color: currentThemeColor }}>{vendorCode}</strong> pre-filled!
            </Typography>
          </Box>
        </Fade>

        {/* Destination Link Box with Copy Button */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            bgcolor: '#F1F5F9',
            borderRadius: '12px',
            p: '8px 12px',
            border: '1px solid #E2E8F0',
            mb: 2.5,
          }}
        >
          <Typography
            noWrap
            sx={{
              fontSize: '0.75rem',
              color: '#475569',
              fontFamily: 'monospace',
              flex: 1,
              mr: 1,
            }}
          >
            {currentLink}
          </Typography>
          <Button
            size="small"
            onClick={handleCopyLink}
            startIcon={<ContentCopyIcon sx={{ fontSize: '14px !important' }} />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.72rem',
              py: 0.4,
              px: 1.2,
              borderRadius: '8px',
              color: currentThemeColor,
              bgcolor: '#FFFFFF',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              '&:hover': { bgcolor: '#F8FAFC' },
              whiteSpace: 'nowrap',
            }}
          >
            Copy
          </Button>
        </Box>

        {/* Action Buttons: Download QR, WhatsApp, and Share */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
          {/* WhatsApp Share Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleWhatsAppShare}
            startIcon={<WhatsAppIcon sx={{ fontSize: 20 }} />}
            sx={{
              bgcolor: '#25D366',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.88rem',
              textTransform: 'none',
              py: 1,
              borderRadius: '12px',
              boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
              '&:hover': {
                bgcolor: '#20BA5A',
                boxShadow: '0 6px 18px rgba(37, 211, 102, 0.45)',
              },
            }}
          >
            Share on WhatsApp
          </Button>

          <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
            {/* Download Branded QR Card */}
            <Button
              variant="outlined"
              fullWidth
              disabled={isDownloading}
              onClick={handleDownloadQR}
              startIcon={<DownloadIcon sx={{ fontSize: 18 }} />}
              sx={{
                borderColor: '#CBD5E1',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'none',
                py: 0.9,
                borderRadius: '12px',
                '&:hover': {
                  borderColor: currentThemeColor,
                  color: currentThemeColor,
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                },
              }}
            >
              {isDownloading ? 'Generating...' : 'Download QR'}
            </Button>

            {/* Native Share */}
            <Button
              variant="outlined"
              fullWidth
              onClick={handleNativeShare}
              startIcon={<ShareIcon sx={{ fontSize: 18 }} />}
              sx={{
                borderColor: '#CBD5E1',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'none',
                py: 0.9,
                borderRadius: '12px',
                '&:hover': {
                  borderColor: currentThemeColor,
                  color: currentThemeColor,
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                },
              }}
            >
              Share Link
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ReferralQRDialog;


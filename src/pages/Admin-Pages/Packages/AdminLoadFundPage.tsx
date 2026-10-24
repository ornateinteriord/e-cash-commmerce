import React, { useState, useEffect } from 'react';
import jsQR from 'jsqr';
import { Box, Card, CardContent, Typography, TextField, Button, CircularProgress, IconButton, Stack, Grid } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { useGetLoadFundConfig, useUpdateLoadFundConfigMutation, useUploadAdminQR } from '../../../api/Packages';
import { toast } from 'react-toastify';

const AdminLoadFundPage: React.FC = () => {
  const { data: config, isLoading: isConfigLoading, refetch } = useGetLoadFundConfig();
  const updateConfigMutation = useUpdateLoadFundConfigMutation();
  const uploadQR = useUploadAdminQR();

  const [walletAddress, setWalletAddress] = useState<string>('');
  const [networkText, setNetworkText] = useState<string>('Eshopy-BEP20');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (config) {
      setWalletAddress(config.wallet_address || '');
      setNetworkText(config.network_text || 'Eshopy-BEP20');
      setQrCodeUrl(config.qr_code_url || '');
      if (config.qr_code_url) {
        setQrPreview(config.qr_code_url);
      }
    }
  }, [config]);



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setQrFile(file);
      setQrPreview(URL.createObjectURL(file));

      // Auto-extract address from QR Code
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) return;
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
            
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            
            // Handle Vite/CommonJS import differences
            const decoder = (jsQR as any).default || jsQR;
            const decodedQR = decoder(imageData.data, imageData.width, imageData.height);
            
            if (decodedQR && decodedQR.data) {
              setWalletAddress(decodedQR.data);
              toast.success("Address automatically extracted from QR code!");
            } else {
              toast.warn("Could not find a valid QR code in the image.");
            }
          } catch (err: any) {
            console.error("QR Scan Error:", err);
            toast.error("Error scanning image: " + err.message);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveQR = () => {
    setQrFile(null);
    setQrPreview(null);
    setQrCodeUrl('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletAddress.trim()) {
      toast.error('Wallet address is required');
      return;
    }

    setIsSaving(true);
    try {
      let finalQrUrl = qrCodeUrl;

      // Upload file to ImageKit first if a new one is selected
      if (qrFile) {
        const uploadResult = await uploadQR.mutateAsync(qrFile);
        finalQrUrl = uploadResult.url;
      }

      await updateConfigMutation.mutateAsync({
        wallet_address: walletAddress,
        network_text: networkText,
        qr_code_url: finalQrUrl
      });

      setQrCodeUrl(finalQrUrl);
      setQrFile(null);
      refetch();
    } catch (err: any) {
      console.error('Save config error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isConfigLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, mt: { xs: 8, md: 8 } }}>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: { xs: 2, md: 4 }, color: '#0a2558', fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
        Deposit Settings & QR Configuration
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ color: '#0a2558', fontWeight: 700, mb: 3 }}>
                Configure Payment Details
              </Typography>

              <Box component="form" onSubmit={handleSave}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="E shopy Wallet Address"
                    variant="outlined"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter wallet destination address"
                    required
                  />

                  <TextField
                    fullWidth
                    label="E shopy Network Label (e.g. Eshopy-BEP20)"
                    variant="outlined"
                    value={networkText}
                    onChange={(e) => setNetworkText(e.target.value)}
                    placeholder="Enter E shopy Network label"
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSaving}
                    startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    sx={{
                      bgcolor: '#0a2558',
                      color: '#ffffff',
                      textTransform: 'none',
                      fontWeight: 700,
                      py: 1.5,
                      borderRadius: '10px',
                      '&:hover': {
                        bgcolor: '#0d3c8c'
                      }
                    }}
                  >
                    {isSaving ? 'Saving Changes...' : 'Save Configuration'}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#0a2558', fontWeight: 700, mb: 3 }}>
                E shopy QR Code Image
              </Typography>

              <Stack spacing={3} alignItems="center">
                {qrPreview ? (
                  <Box
                    sx={{
                      position: 'relative',
                      width: 240,
                      height: 240,
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '12px',
                      p: 1.5,
                      bgcolor: '#ffffff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      component="img"
                      src={qrPreview}
                      alt="QR Code Preview"
                      sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e: any) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const parent = e.target.parentNode;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.innerText = 'Invalid Image URL';
                          fallback.style.color = '#ef4444';
                          fallback.style.fontWeight = 'bold';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                    <IconButton
                      onClick={handleRemoveQR}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(239, 68, 68, 0.9)',
                        color: '#ffffff',
                        '&:hover': { bgcolor: 'rgba(239, 68, 68, 1)' }
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
                      height: 240,
                      borderRadius: '12px',
                      border: '2px dashed rgba(0,0,0,0.15)',
                      color: 'rgba(0,0,0,0.6)',
                      textTransform: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': {
                        borderColor: '#0a2558',
                        color: '#0a2558',
                        bgcolor: 'rgba(10, 37, 88, 0.02)'
                      }
                    }}
                  >
                    Upload QR Code Receipt Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </Button>
                )}
                <Typography variant="caption" color="text.secondary">
                  Please upload a high-resolution payment QR code containing your E shopy wallet address. Only JPG, PNG, or WEBP files are supported.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminLoadFundPage;

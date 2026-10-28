import React, { useState } from 'react';
import { TextField, Button, Card, CardContent, InputAdornment, Box, Typography, IconButton } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import KeyIcon from '@mui/icons-material/Key';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUpdateMember } from '../../../api/Memeber';
import { toast } from 'react-toastify';
import { LoadingComponent } from '../../../App';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const updateMember = useUpdateMember();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error("All fields are required!");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New password and confirm password do not match!");
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }
    updateMember.mutate({ oldPassword: formData.oldPassword, newPassword: formData.newPassword });
  };

  const modernInputStyles = {
    bgcolor: '#F8FAFC',
    borderRadius: '14px',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E2E8F0',
      borderWidth: '1.5px',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#94A3B8',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#4338CA',
      borderWidth: '2px',
      boxShadow: '0 0 0 4px rgba(67, 56, 202, 0.1)',
    },
    '& .MuiInputBase-input': {
      color: '#0F172A',
      padding: '14px 16px',
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
              Security & Password
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              Protect and manage your account authentication credentials
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
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
              
              {/* Top Security Banner */}
              {/* <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2.2,
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #0F172A 0%, #312E81 60%, #4338CA 100%)',
                color: '#FFFFFF',
                boxShadow: '0 8px 24px rgba(67, 56, 202, 0.22)',
              }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '14px',
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(6px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <SecurityIcon sx={{ fontSize: 28, color: '#A5B4FC' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#FFFFFF', lineHeight: 1.2 }}>
                    Password Protection
                  </Typography>
                  <Typography sx={{ fontSize: '0.76rem', color: '#C7D2FE', mt: 0.3 }}>
                    Use a strong, unique password to secure wallet & earnings
                  </Typography>
                </Box>
              </Box> */}

              {/* Field 1: Current Password */}
              <Box>
                <Typography variant="caption" sx={{ mb: 0.8, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Current Master Password
                </Typography>
                <TextField
                  name="oldPassword"
                  type={showOldPassword ? 'text' : 'password'}
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Enter current password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyIcon sx={{ color: '#64748B' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowOldPassword(!showOldPassword)} edge="end" size="small">
                          {showOldPassword ? <VisibilityOff sx={{ color: '#64748B', fontSize: 20 }} /> : <Visibility sx={{ color: '#64748B', fontSize: 20 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={modernInputStyles}
                />
              </Box>

              {/* Field 2: New Password */}
              <Box>
                <Typography variant="caption" sx={{ mb: 0.8, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  New Security Password
                </Typography>
                <TextField
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Enter new strong password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyIcon sx={{ color: '#64748B' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end" size="small">
                          {showNewPassword ? <VisibilityOff sx={{ color: '#64748B', fontSize: 20 }} /> : <Visibility sx={{ color: '#64748B', fontSize: 20 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={modernInputStyles}
                />
              </Box>

              {/* Field 3: Confirm New Password */}
              <Box>
                <Typography variant="caption" sx={{ mb: 0.8, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Confirm New Security Password
                </Typography>
                <TextField
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Re-type new password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#64748B' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                          {showConfirmPassword ? <VisibilityOff sx={{ color: '#64748B', fontSize: 20 }} /> : <Visibility sx={{ color: '#64748B', fontSize: 20 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={modernInputStyles}
                />
              </Box>

              {/* Security Notice Pill */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.5,
                borderRadius: '12px',
                bgcolor: '#EEF2FF',
                border: '1px solid #C7D2FE'
              }}>
                <CheckCircleOutlineIcon sx={{ color: '#4338CA', fontSize: 18, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#3730A3', fontWeight: 600 }}>
                  Password must be at least 6 characters. Do not share your password with anyone.
                </Typography>
              </Box>

              {/* Submit Button */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={updateMember.isPending}
                  sx={{
                    background: 'linear-gradient(135deg, #FF952A 0%, #FF952A 100%)',
                    color: '#FFFFFF',
                    py: 1.5,
                    fontWeight: 900,
                    fontSize: '1rem',
                    textTransform: 'none',
                    borderRadius: '14px',
                    boxShadow: '0 8px 20px rgba(67, 56, 202, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #FF952A 0%, #FF952A 100%)',
                      boxShadow: '0 10px 24px rgba(67, 56, 202, 0.4)',
                    },
                    '&:disabled': {
                      bgcolor: '#CBD5E1',
                      color: '#94A3B8'
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  {updateMember.isPending ? 'Updating Password...' : 'Update Security Password'}
                </Button>
              </motion.div>
            </form>
          </CardContent>
          {updateMember.isPending && <LoadingComponent />}
        </Card>
      </motion.div>
    </Box>
  );
};

export default ChangePassword;

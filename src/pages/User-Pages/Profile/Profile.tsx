import React, { useState, useEffect, useContext } from "react";
import { Box, Typography, TextField, Button, Avatar, Card, CardContent, IconButton, InputAdornment } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import SaveIcon from '@mui/icons-material/Save';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import UserContext from "../../../context/user/userContext";
import { useGetMemberDetails, useUpdateMember } from '../../../api/Memeber';
import TokenService from '../../../api/token/tokenService';
import { LoadingComponent } from '../../../App';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const currentMemberId = TokenService.getMemberId();
  const { data: memberDetails } = useGetMemberDetails(currentMemberId);
  const activeUser = memberDetails || user;

  const [formData, setFormData] = useState({
    Name: "",
    gender: "",
    email: "",
    country: "",
    dob: "",
  });

  useEffect(() => {
    if (activeUser) {
      setFormData({
        Name: activeUser.Name ?? "",
        gender: activeUser.gender ?? "Male",
        email: activeUser.email ?? "",
        country: activeUser.country ?? "India",
        dob: activeUser.dob ?? "",
      });
    }
  }, [activeUser]);

  const updateMember = useUpdateMember();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMember.mutate(formData);
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
      borderColor: '#2563EB',
      borderWidth: '2px',
      boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.1)',
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
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      minHeight: '100vh',
      bgcolor: '#F1F5F9',
      maxWidth: '520px',
      margin: '0 auto',
      pb: 10
    }}>
      {/* Animated Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ width: '100%' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1.5, mb: 3 }}>
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
              Account Profile
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              Manage your personal identity & contact details
            </Typography>
          </Box>
        </Box>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        style={{ width: '100%' }}
      >
        <Card sx={{ 
          width: '100%', 
          bgcolor: '#FFFFFF', 
          border: '1px solid #E2E8F0', 
          borderRadius: '24px', 
          color: '#0F172A',
          boxShadow: "0 12px 32px rgba(15, 23, 42, 0.06)",
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <form onSubmit={handleSubmit}>
              
              {/* Top Identity Hero Card */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'flex-end' },
                background: 'linear-gradient(135deg, #15242A 0%, #1F333B 65%, #2B444E 100%)',
                p: { xs: 2.2, sm: 2.8 },
                borderRadius: '20px',
                border: '1px solid rgba(254, 128, 1, 0.3)',
                mb: 3.5,
                boxShadow: '0 12px 32px rgba(21, 36, 42, 0.35)',
                gap: 2,
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Decorative golden ambient glow */}
                <Box sx={{
                  position: 'absolute', top: -45, right: -45,
                  width: 150, height: 150, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(254, 128, 1, 0.22) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />
                <Box sx={{
                  position: 'absolute', bottom: -35, left: -35,
                  width: 110, height: 110, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255, 160, 51, 0.12) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />

                {/* Left Side: Avatar, Name & Stacked ID Badges */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.8, sm: 2.2 }, zIndex: 1 }}>
                  <motion.div
                    initial={{ scale: 0.85 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Avatar 
                      src={(activeUser as any)?.profile_image || (activeUser as any)?.photo || (activeUser as any)?.avatar || undefined}
                      sx={{ 
                        width: { xs: 58, sm: 64 }, 
                        height: { xs: 58, sm: 64 }, 
                        background: 'linear-gradient(135deg, #FE8001 0%, #FFA033 100%)',
                        boxShadow: '0 8px 22px rgba(254, 128, 1, 0.45)',
                        border: '2.5px solid rgba(255, 255, 255, 0.25)',
                        color: '#FFFFFF',
                        fontSize: { xs: '1.45rem', sm: '1.7rem' },
                        fontWeight: 900
                      }}
                    >
                      {(formData.Name || activeUser?.Name || 'V').trim().charAt(0).toUpperCase()}
                    </Avatar>
                  </motion.div>
                  
                  <Box sx={{ color: '#FFFFFF' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, mb: 0.8, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                      {formData.Name || activeUser?.Name || 'Member Profile'}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7 }}>
                      {/* Member / Login ID */}
                      <Box sx={{ 
                        display: 'inline-flex', 
                        alignItems: 'center',
                        bgcolor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(254, 128, 1, 0.35)',
                        borderRadius: '999px',
                        px: 1.3,
                        py: 0.35,
                        width: 'fit-content'
                      }}>
                        <Typography sx={{ color: '#94A3B8', fontSize: '0.72rem', fontWeight: 600, mr: 0.6 }}>
                          LOGIN ID:
                        </Typography>
                        <Typography sx={{ 
                          color: '#FE8001', 
                          fontFamily: 'monospace', 
                          fontWeight: 800, 
                          fontSize: { xs: '0.8rem', sm: '0.85rem' }, 
                          letterSpacing: '0.5px' 
                        }}>
                          {activeUser?.Member_id || (activeUser as any)?.member_id || activeUser?.mobileno || currentMemberId || 'N/A'}
                        </Typography>
                      </Box>

                      {/* Vendor ID */}
                      <Box sx={{ 
                        display: 'inline-flex', 
                        alignItems: 'center',
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '999px',
                        px: 1.3,
                        py: 0.35,
                        width: 'fit-content'
                      }}>
                        <Typography sx={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600, mr: 0.6 }}>
                          VENDOR ID:
                        </Typography>
                        <Typography sx={{ 
                          color: '#F8FAFC', 
                          fontFamily: 'monospace', 
                          fontWeight: 700, 
                          fontSize: { xs: '0.78rem', sm: '0.82rem' } 
                        }}>
                          {activeUser?.member_code || (activeUser as any)?.user_id || (activeUser as any)?.reference_id || '0101'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Right / Bottom-Right Side: Level Badge (matching User Dashboard) */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  alignSelf: { xs: 'flex-end', sm: 'flex-end' },
                  zIndex: 1,
                  mt: { xs: 1, sm: 0 }
                }}>
                  <Box sx={{ 
                    display: 'inline-flex', 
                    alignItems: 'center',
                    bgcolor: 'rgba(254, 128, 1, 0.16)',
                    border: '1.5px solid rgba(254, 128, 1, 0.45)',
                    px: { xs: 1.3, sm: 1.6 },
                    py: { xs: 0.45, sm: 0.55 },
                    borderRadius: '10px',
                    boxShadow: '0 2px 10px rgba(254, 128, 1, 0.2)'
                  }}>
                    <Typography sx={{ 
                      color: '#FFA033', 
                      fontSize: { xs: '0.74rem', sm: '0.8rem' }, 
                      fontWeight: 800, 
                      letterSpacing: '0.6px' 
                    }}>
                      LEVEL {activeUser?.level ?? 0}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Form Fields Section */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3.5 }}>
                
                {/* Field 1: Full Name */}
                <Box>
                  <Typography variant="caption" sx={{ mb: 0.8, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Account Holder Full Name
                  </Typography>
                  <TextField
                    name="Name"
                    value={formData.Name}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="Enter full name"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeOutlinedIcon sx={{ color: '#64748B' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={modernInputStyles}
                  />
                </Box>

                {/* Field 2: Date of Birth */}
                <Box>
                  <Typography variant="caption" sx={{ mb: 0.8, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Date of Birth (DOB)
                  </Typography>
                  <TextField
                    name="dob"
                    type="text"
                    value={formData.dob}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="DD/MM/YYYY"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CakeOutlinedIcon sx={{ color: '#64748B' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={modernInputStyles}
                  />
                </Box>

                {/* Field 3: Email Address */}
                <Box>
                  <Typography variant="caption" sx={{ mb: 0.8, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Registered Email Address
                  </Typography>
                  <TextField
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="name@example.com"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon sx={{ color: '#64748B' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={modernInputStyles}
                  />
                </Box>

                {/* Field 4: Country */}
                <Box>
                  <Typography variant="caption" sx={{ mb: 0.8, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Country / Region
                  </Typography>
                  <TextField
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="e.g. India"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PublicOutlinedIcon sx={{ color: '#64748B' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={modernInputStyles}
                  />
                </Box>
              </Box>

              {/* Save Button */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  fullWidth
                  disabled={updateMember.isPending}
                  startIcon={<SaveIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #FF952A 0%, #FF952A 100%)',
                    color: '#FFFFFF',
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 900,
                    textTransform: 'none',
                    borderRadius: '14px',
                    boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
                    "&:hover": { 
                      background: 'linear-gradient(135deg, #FF952A 0%, #FF952A 100%)',
                      boxShadow: '0 10px 24px rgba(37, 99, 235, 0.4)',
                    },
                    "&:disabled": { 
                      bgcolor: '#CBD5E1',
                      color: '#94A3B8'
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  {updateMember.isPending ? 'Saving Profile...' : 'Save & Update Profile'}
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

export default Profile;

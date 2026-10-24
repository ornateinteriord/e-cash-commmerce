import { ChevronDown, LogOutIcon, Menu as MenuIcon, Settings, User, Headphones, Home, MessageCircle } from 'lucide-react';
import "./navbar.scss";
import { AppBar, Avatar, Box, Divider, Menu, MenuItem, Toolbar, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import useAuth from "../../hooks/use-auth";
import TokenService from "../../api/token/tokenService";

import { useState } from 'react';
import { useGetMemberDetails } from '../../api/Memeber';


interface NavbarProps {
  shouldHide?: boolean;
  onToggleSidebar?: () => void;
}

const Navbar = ({ shouldHide, onToggleSidebar }: NavbarProps) => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useAuth();
  const isAdmin = userRole === "ADMIN" || userRole === "ADMIN_01" || userRole === "AGENT";
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Always call hooks before any early return (Rules of Hooks)
  const userId = TokenService.getMemberId();
  const { data: memberDetails } = useGetMemberDetails(userId);

  // If we should hide the navbar (on public/auth pages), return null
  if (shouldHide) return null;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
    setAnchorEl(null);
  };

  const confirmLogout = () => {
    setLogoutDialogOpen(false);
    navigate("/");
    TokenService.removeToken();
    window.dispatchEvent(new Event("storage"));
  };

  const cancelLogout = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: "#FFFFFF",
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 2px 12px rgba(31, 51, 59, 0.05)',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ 
          height: { xs: 56, md: 64 }, 
          px: { xs: 2, md: 3 }, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {isLoggedIn && userRole === "USER" ? (
            // USER mobile-app style layout
            <>
              <Box 
                onClick={handleMenuOpen} 
                sx={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  padding: '4px 8px',
                  borderRadius: '12px',
                  transition: 'background 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(254, 128, 1, 0.08)'
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 36, md: 40 },
                    height: { xs: 36, md: 40 },
                    bgcolor: '#FE8001',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: { xs: '0.95rem', md: '1.1rem' },
                    boxShadow: '0 2px 8px rgba(254, 128, 1, 0.25)'
                  }}
                >
                  {memberDetails?.Name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  onClick={() => navigate('/user/support-chat')}
                  sx={{ color: "#1F333B", '&:hover': { bgcolor: 'rgba(254, 128, 1, 0.08)', color: '#FE8001' } }}
                >
                  <Headphones size={22} />
                </IconButton>
                <IconButton
                  onClick={() => navigate('/user/dashboard')}
                  sx={{ color: "#1F333B", '&:hover': { bgcolor: 'rgba(254, 128, 1, 0.08)', color: '#FE8001' } }}
                >
                  <Home size={22} />
                </IconButton>
                <IconButton
                  onClick={handleLogout}
                  sx={{ color: "#EF4444", '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                >
                  <LogOutIcon size={22} />
                </IconButton>
              </Box>
            </>
          ) : (
            // Default Admin/Agent/Admin01/Public layout
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isAdmin && onToggleSidebar && (
                  <IconButton
                    onClick={onToggleSidebar}
                    sx={{ color: "#1E293B", mr: 1, display: { xs: 'flex', md: 'flex' } }}
                  >
                    <MenuIcon size={24} />
                  </IconButton>
                )}
                <Typography
                  variant="h4"
                  onClick={() => navigate("/")}
                  sx={{
                    fontWeight: 950,
                    fontSize: { xs: '1.4rem', md: '1.85rem' },
                    cursor: "pointer",
                    letterSpacing: '0.5px',
                    color: '#1F333B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  <Box component="span" sx={{ color: '#FE8001' }}>E</Box>cash
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
                {isLoggedIn && (
                  <Box 
                    onClick={handleMenuOpen} 
                    sx={{ 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      padding: '4px 8px',
                      borderRadius: '12px',
                      transition: 'background 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(254, 128, 1, 0.08)'
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        width: { xs: 32, md: 38 },
                        height: { xs: 32, md: 38 },
                        bgcolor: '#FE8001',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: { xs: '0.85rem', md: '1rem' },
                        border: '2px solid rgba(254, 128, 1, 0.3)',
                        boxShadow: '0 2px 8px rgba(254, 128, 1, 0.25)'
                      }}
                    >
                      {memberDetails?.Name?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <ChevronDown size={18} color="#1F333B" style={{ opacity: 0.8 }} />
                  </Box>
                )}
                {isLoggedIn && (
                  <IconButton
                    onClick={handleLogout}
                    sx={{ color: "#EF4444", ml: 1, '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                  >
                    <LogOutIcon size={22} />
                  </IconButton>
                )}
              </Box>
            </>
          )}
        </Toolbar>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              bgcolor: '#FFFFFF',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '16px',
              mt: 1.5,
              p: 0.5,
              minWidth: '240px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 30px -5px rgba(31, 51, 59, 0.12), 0 8px 10px -6px rgba(31, 51, 59, 0.06)',
              '& .MuiMenuItem-root': {
                py: 1.2,
                px: 2,
                mx: 1,
                my: 0.2,
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: '#1F333B',
                '&:hover': {
                  bgcolor: 'rgba(254, 128, 1, 0.08)',
                  color: '#FE8001',
                },
              },
              '& .MuiDivider-root': {
                borderColor: '#E2E8F0',
                my: 1,
                mx: 1,
              }
            },
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "16px 0 12px 0",
            }}
          >
            <Avatar
              variant="rounded"
              alt="User"
              sx={{
                width: 60,
                height: 60,
                marginBottom: "12px",
                background: 'linear-gradient(135deg, #FE8001 0%, #FFA033 100%)',
                border: '2px solid #1F333B',
                borderRadius: '14px',
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(254, 128, 1, 0.3)'
              }}
            >
              {memberDetails?.Name
                ? memberDetails.Name.charAt(0).toUpperCase()
                : ""}
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1F333B', fontSize: '1.1rem' }}>
              {memberDetails?.Name || "Member"}
            </Typography>
            <Typography variant="caption" sx={{ color: '#889EA6', fontWeight: 600 }}>
               ID: {memberDetails?.Member_id || ""}
            </Typography>
          </div>

          <Divider />

          <MenuItem onClick={() => {
            if (userRole === "USER") navigate("/user/account/profile");
            else if (userRole === "AGENT") navigate("/agent/profile");
            setAnchorEl(null);
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(37, 99, 235, 0.12)', color: '#2563EB', mr: 1.5 }}>
              <User size={18} />
            </Box>
            Profile
          </MenuItem>

          <MenuItem onClick={() => {
             navigate("/chat");
             setAnchorEl(null);
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(13, 148, 136, 0.12)', color: '#0D9488', mr: 1.5 }}>
              <MessageCircle size={18} />
            </Box>
            Support Chat
          </MenuItem>

          <MenuItem
            onClick={() => {
              if (userRole === "USER") navigate("/user/account/change-password");
              else navigate("/admin/update-password");
              setAnchorEl(null);
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(234, 88, 12, 0.12)', color: '#EA580C', mr: 1.5 }}>
              <Settings size={18} />
            </Box>
            Security & Password
          </MenuItem>
        </Menu>

        <Dialog
          open={logoutDialogOpen}
          onClose={cancelLogout}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              padding: '8px'
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>Confirm Logout</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: '#475569', fontWeight: 500 }}>
              Are you sure you want to log out of your account?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: '0 24px 16px 24px' }}>
            <Button onClick={cancelLogout} sx={{ color: '#64748b', fontWeight: 600 }}>
              Cancel
            </Button>
            <Button 
              onClick={confirmLogout} 
              variant="contained" 
              color="error" 
              sx={{ borderRadius: '8px', fontWeight: 600, textTransform: 'none', boxShadow: 'none' }}
              disableElevation
            >
              Log Out
            </Button>
          </DialogActions>
        </Dialog>
      </AppBar >
    </>
  );
};

export default Navbar;

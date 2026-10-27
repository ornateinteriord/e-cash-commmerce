import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemText, Box, Button, Typography, Container, Collapse } from '@mui/material';
import { Menu as MenuIcon, X as CloseIcon, ChevronDown } from 'lucide-react';

const PublicNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const navLinks: { title: string, path: string, dropdown?: { title: string, path: string }[] }[] = [
    { title: "Home", path: "/" },
    { title: "About Us", path: "/about" },
    { 
      title: "Services", 
      path: "/services",
    },
    { title: "Gallery", path: "/gallery" },
    { title: "Legal", path: "/terms" },
    { title: "Contact", path: "/contact" },
  ];

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={scrolled ? 4 : 0}
        sx={{ 
          bgcolor: scrolled ? "rgba(255, 255, 255, 0.95)" : "#ffffff", 
          backdropFilter: scrolled ? "blur(10px)" : "none",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          color: "#1e293b",
          transition: "all 0.3s ease",
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: "space-between", py: 1, px: { xs: 0, sm: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
              <Box
                component="img"
                src="/e-shopy.jpeg"
                alt="E-shopy Logo"
                sx={{
                  height: { xs: 36, md: 44 },
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </Box>

            {/* Desktop Links */}
            <Box sx={{ display: { xs: "none", lg: "flex" }, gap: 3, alignItems: "center" }}>
              {navLinks.map((link) => (
                <Box key={link.title} sx={{ position: 'relative', '&:hover .dropdown': { display: 'block' } }}>
                  <Typography 
                    onClick={() => !link.dropdown && navigate(link.path)}
                    sx={{ 
                      cursor: 'pointer', 
                      fontWeight: 600, 
                      fontSize: '0.95rem', 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: location.pathname === link.path ? '#1e3a8a' : '#475569', 
                      '&:hover': { color: '#1e3a8a' }, 
                      transition: 'color 0.2s',
                      py: 2
                    }}
                  >
                    {link.title}
                    {link.dropdown && <ChevronDown size={16} />}
                  </Typography>
                  
                  {link.dropdown && (
                    <Box 
                      className="dropdown"
                      sx={{ 
                        display: 'none', 
                        position: 'absolute', 
                        top: '100%', 
                        left: 0, 
                        bgcolor: 'white', 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        borderRadius: '8px',
                        minWidth: '200px',
                        overflow: 'hidden',
                        zIndex: 10
                      }}
                    >
                      {link.dropdown.map(subItem => (
                        <Box 
                          key={subItem.title}
                          onClick={() => navigate(subItem.path)}
                          sx={{ 
                            px: 3, 
                            py: 1.5, 
                            cursor: 'pointer',
                            color: '#475569',
                            borderBottom: '1px solid rgba(0,0,0,0.05)',
                            '&:hover': { bgcolor: '#f1f5f9', color: '#1e3a8a' }
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{subItem.title}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>

            {/* Desktop Auth Buttons */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
              <Button 
                onClick={() => navigate('/login')}
                sx={{ color: "#1e3a8a", fontWeight: 700, '&:hover': { bgcolor: "rgba(30,58,138,0.05)" } }}
              >
                Login
              </Button>
              <Button 
                variant="contained" 
                onClick={() => navigate('/register')}
                sx={{ 
                  bgcolor: "#1e3a8a", color: "#ffffff", fontWeight: 700, px: 3,
                  '&:hover': { bgcolor: "#1e40af", transform: 'translateY(-2px)' }, transition: 'all 0.2s' 
                }}
              >
                Sign Up
              </Button>
            </Box>

            {/* Mobile Menu Icon */}
            <IconButton color="inherit" onClick={handleDrawerToggle} sx={{ display: { lg: "none" } }}>
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        PaperProps={{ sx: { width: 280, bgcolor: "#ffffff", color: "#1e293b", zIndex: (theme) => theme.zIndex.drawer + 2 } }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", p: 2, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => { navigate('/'); handleDrawerToggle(); }}>
            <Box
              component="img"
              src="/e-shopy.jpeg"
              alt="E-shopy Logo"
              sx={{
                height: 36,
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </Box>
          <IconButton onClick={handleDrawerToggle} sx={{ color: "#475569" }}><CloseIcon /></IconButton>
        </Box>
        <List sx={{ px: 2, py: 3 }}>
          {navLinks.map((link) => (
            <Box key={link.title}>
              <ListItem 
                onClick={() => {
                  if (link.dropdown) {
                    setLoanOpen(!loanOpen);
                  } else {
                    navigate(link.path);
                    handleDrawerToggle();
                  }
                }} 
                sx={{ borderRadius: "8px", mb: 0.5, '&:hover': { bgcolor: "#f1f5f9" }, cursor: "pointer" }}
              >
                <ListItemText primary={link.title} primaryTypographyProps={{ fontWeight: 600, color: '#1e293b' }} />
                {link.dropdown && <ChevronDown size={18} style={{ transform: loanOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />}
              </ListItem>
              {link.dropdown && (
                <Collapse in={loanOpen}>
                  <List component="div" disablePadding sx={{ pl: 4 }}>
                    {link.dropdown.map((subItem) => (
                      <ListItem 
                        key={subItem.title} 
                        onClick={() => { navigate(subItem.path); handleDrawerToggle(); }}
                        sx={{ py: 1, '&:hover': { bgcolor: "#f1f5f9" }, cursor: 'pointer', borderRadius: '8px' }}
                      >
                        <ListItemText primary={subItem.title} primaryTypographyProps={{ fontSize: '0.9rem', color: '#475569' }} />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          ))}
          <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2 }}>
            <Button variant="outlined" onClick={() => { navigate('/login'); handleDrawerToggle(); }} sx={{ borderColor: "#e2e8f0", color: "#1e3a8a", py: 1.5, borderRadius: '8px', fontWeight: 700 }}>
              Login
            </Button>
            <Button variant="contained" onClick={() => { navigate('/register'); handleDrawerToggle(); }} sx={{ bgcolor: "#1e3a8a", color: "#ffffff", py: 1.5, borderRadius: '8px', fontWeight: 700 }}>
              Sign Up
            </Button>
          </Box>
        </List>
      </Drawer>
      
      {/* Spacer to push content below fixed navbar */}
      <Box sx={{ height: { xs: 56, sm: 64 } }} />
    </>
  );
};

export default PublicNavbar;

import { Box, Container, Typography, Grid, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, ArrowUpRight } from 'lucide-react';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                bgcolor: '#0f172a',
                color: "#f8fafc",
                position: "relative",
                overflow: "hidden"
            }}
        >
            <Container maxWidth="xl" sx={{ p: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between' }}>
                    
                    {/* Left Section (Main content) */}
                    <Box sx={{ flex: 1, py: { xs: 4, md: 6 }, px: { xs: 2, md: 4, xl: 0 } }}>
                        <Grid container spacing={{ xs: 6, md: 4 }}>
                            
                            {/* Column 1: Logo & Text */}
                            <Grid item xs={12} md={4}>
                                <Box sx={{ mb: 2 }}>
                                    <Box
                                        component="img"
                                        src="/e-shopy-D.jpeg"
                                        alt="E-shopy Logo"
                                        sx={{
                                            height: { xs: 44, md: 52 },
                                            objectFit: 'contain',
                                            display: 'inline-block',
                                        }}
                                    />
                                </Box>
                                <Typography variant="body1" sx={{ color: "#94a3b8", lineHeight: 1.7, pr: { md: 4 } }}>
                                    Highlights the impact of technology on the banking industry,
                                    enabling convenient digital access to financial services.
                                </Typography>
                            </Grid>

                            {/* Column 2: Quick Links */}
                            <Grid item xs={12} md={4}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                    Quick Link
                                </Typography>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    {['About Us', 'Services', 'Gallery', 'Contact Us'].map((text) => (
                                        <Typography 
                                            key={text}
                                            component={Link} 
                                            to={text === 'About Us' ? '/about' : text === 'Services' ? '/services' : text === 'Gallery' ? '/gallery' : '/contact-us'} 
                                            sx={{ 
                                                color: "#94a3b8", 
                                                textDecoration: "none", 
                                                transition: "all 0.3s",
                                                '&:hover': { color: "#38bdf8", letterSpacing: "1px" }
                                            }}
                                        >
                                            {text}
                                        </Typography>
                                    ))}
                                </Box>
                            </Grid>

                            {/* Column 3: Connect with us */}
                            <Grid item xs={12} md={4}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                    Connect with us
                                </Typography>
                                <Typography 
                                    component="a" 
                                    href="mailto:support@eshopy.com" 
                                    sx={{ 
                                        color: "#94a3b8", 
                                        textDecoration: "none",
                                        display: "block",
                                        mb: 4,
                                        '&:hover': { color: "#38bdf8" }
                                    }}
                                >
                                    support@eshopy.com
                                </Typography>
                                
                                <Box sx={{ display: "flex", gap: 1.5 }}>
                                    {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, idx) => (
                                        <IconButton
                                            key={idx}
                                            sx={{
                                                bgcolor: "#1e293b",
                                                color: "#f8fafc",
                                                borderRadius: "12px",
                                                p: 1.5,
                                                transition: "all 0.3s",
                                                "&:hover": {
                                                    bgcolor: "#38bdf8",
                                                    color: "#0f172a",
                                                },
                                            }}
                                        >
                                            <Icon size={20} />
                                        </IconButton>
                                    ))}
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Copyright Area */}
                        <Box sx={{ 
                            mt: { xs: 4, md: 6 }, 
                            pt: 3, 
                            borderTop: "1px solid #1e293b",
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: "center",
                            gap: { xs: 2, sm: 3 }
                        }}>
                            <Typography variant="body2" sx={{ color: "#f8fafc" }}>
                                Copyright @ 2026 E shopy
                            </Typography>
                            <Box sx={{ width: { xs: "40px", sm: "1px" }, height: { xs: "1px", sm: "16px" }, bgcolor: "#334155" }} />
                            <Typography 
                                component="a" 
                                href="#" 
                                variant="body2" 
                                sx={{ color: "#f8fafc", textDecoration: "none", fontWeight: 500, '&:hover': { color: "#38bdf8" } }}
                            >
                                FOUNDATION FOR GROWTH
                            </Typography>
                        </Box>
                    </Box>

                    {/* Right Section (Contact Widget) */}
                    <Box sx={{ 
                        width: { xs: '100%', lg: '350px' }, 
                        bgcolor: "#1e3a8a", // Accent-1 blue
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row", lg: "column" },
                        alignItems: "center",
                        justifyContent: "space-around",
                        py: { xs: 4, lg: 8 },
                        px: { xs: 4, lg: 6 },
                        gap: 3,
                        textAlign: "center"
                    }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: "#ffffff", maxWidth: "250px" }}>
                            Have a query in Your Mind?
                        </Typography>
                        
                        <Box 
                            component={Link}
                            to="/contact-us"
                            sx={{
                                width: { xs: "100px", lg: "130px" },
                                height: { xs: "100px", lg: "130px" },
                                borderRadius: "50%",
                                border: '1px solid #E2E8F0',
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                textDecoration: "none",
                                color: "#ffffff",
                                transition: "all 0.3s",
                                position: "relative",
                                overflow: "hidden",
                                '&:hover': {
                                    borderColor: "#38bdf8",
                                    color: "#0f172a",
                                    bgcolor: "#38bdf8"
                                }
                            }}
                        >
                            <ArrowUpRight size={32} />
                            <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, textTransform: "uppercase" }}>
                                Contact Us
                            </Typography>
                        </Box>

                        <Box sx={{ color: "#ffffff" }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                09 : 00 AM - 10 : 30 PM
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                Saturday - Thursday
                            </Typography>
                        </Box>
                    </Box>

                </Box>
            </Container>
        </Box>
    );
};

export default Footer;

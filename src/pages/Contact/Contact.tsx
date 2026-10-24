import { Container, Typography, Box, Grid, TextField, Button, Paper } from '@mui/material';
import { Phone, Mail, MapPin, Send } from 'lucide-react';

const Contact = () => {
    return (
        <Box sx={{ bgcolor: "#ffffff", minHeight: "100vh", color: "#1e293b", pb: 12 }}>
            
            {/* HERO SECTION */}
            <Box sx={{ bgcolor: '#1e3a8a', color: 'white', py: { xs: 8, md: 10 }, textAlign: 'center' }}>
                <Container maxWidth="md">
                    <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                        Contact <span style={{ color: '#93c5fd' }}>Us</span>
                    </Typography>
                    <Typography sx={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)' }}>
                        We're here to help. Get in touch with us for any inquiries or support.
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: -6 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', bgcolor: 'white', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', height: '100%', border: '1px solid #e2e8f0' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <Box sx={{ display: 'flex', gap: 3 }}>
                                    <Box sx={{ bgcolor: '#eff6ff', color: '#1e3a8a', p: 2, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Phone size={24} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: '#64748b', fontSize: '0.9rem', mb: 0.5 }}>Call Us</Typography>
                                        <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>+91 9004478100</Typography>
                                        <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>0820-7966887</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 3 }}>
                                    <Box sx={{ bgcolor: '#eff6ff', color: '#1e3a8a', p: 2, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Mail size={24} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: '#64748b', fontSize: '0.9rem', mb: 0.5 }}>Email Us</Typography>
                                        <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>support@eshopy.com</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 3 }}>
                                    <Box sx={{ bgcolor: '#eff6ff', color: '#1e3a8a', p: 2, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <MapPin size={24} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: '#64748b', fontSize: '0.9rem', mb: 0.5 }}>Location</Typography>
                                        <Typography sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.6 }}>
                                            Shop No. G6, Asha Chandra Trade Centre, Udupi, Karnataka
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: '16px', bgcolor: 'white', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, color: '#0f172a' }}>Send Us A Message</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Full Name" variant="outlined" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Email Address" variant="outlined" type="email" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Phone Number" variant="outlined" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Subject" variant="outlined" />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Message" variant="outlined" multiline rows={4} />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button 
                                        variant="contained" 
                                        size="large"
                                        endIcon={<Send size={18} />}
                                        sx={{ bgcolor: '#1e3a8a', color: 'white', px: 4, py: 1.5, borderRadius: '8px', fontWeight: 700, '&:hover': { bgcolor: '#1e40af' } }}
                                    >
                                        Send Message
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Contact;

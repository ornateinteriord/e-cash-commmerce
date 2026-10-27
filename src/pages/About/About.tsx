import { Container, Typography, Box, Grid, Button } from '@mui/material';
import { ArrowLeft, Target, Award, ShieldCheck, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const About = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ bgcolor: "#ffffff", minHeight: "100vh", color: "#1e293b" }}>
            
            {/* HERO SECTION */}
            <Box sx={{ bgcolor: '#1e3a8a', color: 'white', py: { xs: 8, md: 12 }, textAlign: 'center' }}>
                <Container maxWidth="md">
                    <Typography sx={{ color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase', mb: 2, letterSpacing: '2px' }}>
                        Who We Are
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                        About <span style={{ color: '#93c5fd' }}>E shopy</span>
                    </Typography>
                    <Typography sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
                        Empowering growth and opportunity through flexible, transparent, and reliable financial solutions for individuals and businesses alike.
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
                <Button
                    startIcon={<ArrowLeft size={20} />}
                    onClick={() => navigate("/")}
                    sx={{ mb: 6, color: "#1e3a8a", fontWeight: 700, "&:hover": { bgcolor: "rgba(30, 58, 138, 0.05)" } }}
                >
                    Back to Home
                </Button>

                <Grid container spacing={8} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <img 
                            src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1950" 
                            alt="About Us Banner" 
                            style={{ 
                                width: "100%", 
                                borderRadius: "20px", 
                                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                            }} 
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 3 }}>
                            <Box
                                component="img"
                                src="/e-shopy.jpeg"
                                alt="E-shopy Logo"
                                sx={{
                                    height: 48,
                                    objectFit: 'contain',
                                    display: 'block'
                                }}
                            />
                        </Box>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: '#475569' }}>
                            <strong>As on: 2024-07-03</strong><br/>
                            E SHOPY (CIN: U65100DL2022NPL407403) is a Private company incorporated on 25 Dec 2022. It is classified as Non-government company and is registered at Registrar of Companies, Delhi.
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: '#475569' }}>
                            We are dedicated to providing comprehensive financial services to our valued members. Established with the vision of financial inclusion and empowerment, we have been serving our community with integrity, transparency, and excellence.
                        </Typography>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 12 }}>
                    <Grid container spacing={4}>
                        {[
                            { icon: <Target size={40} />, title: "Our Mission", desc: "To empower growth and opportunity by providing fast, flexible, and transparent private lending solutions. We believe that access to capital should be straightforward, personalized, and responsive to real-world financial needs." },
                            { icon: <Award size={40} />, title: "Our Vision", desc: "To be the most trusted and preferred financial partner, recognized for excellence, member satisfaction, and contribution to the economic development of our community." },
                            { icon: <ShieldCheck size={40} />, title: "Our Values", desc: "Integrity, Transparency, Member-Centricity, and Innovation. We conduct our business with ethical principles and maintain open communication with all stakeholders." }
                        ].map((item, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <Box sx={{ p: 4, bgcolor: '#f8fafc', borderRadius: '16px', height: '100%', border: '1px solid #e2e8f0', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', borderColor: '#93c5fd' } }}>
                                    <Box sx={{ color: '#1e3a8a', mb: 3 }}>
                                        {item.icon}
                                    </Box>
                                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: '#0f172a' }}>
                                        {item.title}
                                    </Typography>
                                    <Typography sx={{ color: '#475569', lineHeight: 1.7 }}>
                                        {item.desc}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Contact Preview */}
                <Box sx={{ mt: 12, p: { xs: 4, md: 6 }, bgcolor: '#1e3a8a', borderRadius: '24px', color: 'white', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: { xs: 4, md: 0 } }}>
                        <Building2 size={48} color="#93c5fd" />
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Get in Touch with Us</Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Ready to take the next step in your financial journey?</Typography>
                        </Box>
                    </Box>
                    <Button 
                        variant="contained" 
                        onClick={() => navigate('/contact')}
                        sx={{ bgcolor: 'white', color: '#1e3a8a', px: 4, py: 1.5, borderRadius: '50px', fontWeight: 700, '&:hover': { bgcolor: '#f1f5f9' }, whiteSpace: 'nowrap' }}
                    >
                        Contact Us
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default About;

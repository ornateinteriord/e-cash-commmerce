import { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Grid, Card } from '@mui/material';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Smart Banking in Motion",
      tag: "DIGITAL BANKING EXPERIENCE",
      text: "Experience seamless banking and loan services with E shopy.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1950",
    },
    {
      title: "Banking Solutions for Your Business",
      tag: "SAVE AND MANAGE YOUR MONEY",
      text: "Your Financial Universe, One Destination: Complete Banking at E shopy.",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1950",
    },
    {
      title: "Smart Banking. Simple Loans.",
      tag: "TRUSTED FINANCIAL PARTNER",
      text: "We provide secure banking solutions and flexible loan options.",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1950",
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <Box sx={{ bgcolor: "#ffffff", color: "#1e293b", overflowX: 'hidden' }}>
      
      {/* HERO SLIDER */}
      <Box sx={{ position: 'relative', height: { xs: '70vh', md: '80vh' }, width: '100%', overflow: 'hidden' }}>
        {slides.map((slide, index) => (
          <Box 
            key={index}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: currentSlide === index ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.4)), url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'white',
              px: 2
            }}
          >
            <Box sx={{ maxWidth: '800px' }}>
              <Typography sx={{ fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', mb: 2, opacity: 0.9 }}>
                {slide.tag}
              </Typography>
              <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 800, mb: 3, lineHeight: 1.1 }}>
                {slide.title}
              </Typography>
              <Typography sx={{ fontSize: { xs: '1rem', md: '1.25rem' }, mb: 4, opacity: 0.9 }}>
                {slide.text}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button 
                  variant="contained"
                  onClick={() => navigate('/login')}
                  sx={{ bgcolor: 'white', color: '#1e3a8a', px: 4, py: 1.5, borderRadius: '50px', fontWeight: 700, '&:hover': { bgcolor: '#f1f5f9' } }}
                >
                  Login
                </Button>
                <Button 
                  variant="outlined"
                  onClick={() => navigate('/register')}
                  sx={{ borderColor: 'white', color: 'white', px: 4, py: 1.5, borderRadius: '50px', fontWeight: 700, '&:hover': { bgcolor: 'white', color: '#1e3a8a' } }}
                >
                  Register
                </Button>
              </Box>
            </Box>
          </Box>
        ))}

        {/* Slider Dots */}
        <Box sx={{ position: 'absolute', bottom: 30, left: 0, width: '100%', display: 'flex', justifyContent: 'center', gap: 1 }}>
          {slides.map((_, index) => (
            <Box 
              key={index} 
              onClick={() => setCurrentSlide(index)}
              sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: currentSlide === index ? 'white' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }} 
            />
          ))}
        </Box>
      </Box>

      {/* ABOUT US SECTION */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f8fafc' }}>
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={5}>
              <img 
                src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1950" 
                alt="About Us" 
                style={{ width: '100%', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }} 
              />
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography sx={{ color: '#1e3a8a', fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>About Us</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a', mb: 3 }}>E SHOPY</Typography>
              <Typography sx={{ color: '#475569', mb: 3, lineHeight: 1.8 }}>
                As on: 2024-07-03<br/>
                E SHOPY (CIN: U65100DL2022NPL407403) is a Private company incorporated on 25 Dec 2022. It is classified as Non-government company and is registered at Registrar of Companies, Delhi.
              </Typography>
              
              <Grid container spacing={4} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={4}>
                  <Button 
                    onClick={() => navigate('/about')}
                    sx={{ 
                      width: 140, height: 140, borderRadius: '50%', bgcolor: '#1e3a8a', color: 'white', 
                      display: 'flex', flexDirection: 'column', '&:hover': { bgcolor: '#1e40af' }
                    }}
                  >
                    <ArrowRight size={32} />
                    <Typography sx={{ mt: 1, fontWeight: 600, textTransform: 'capitalize' }}>About More</Typography>
                  </Button>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mb: 2 }}>Mission</Typography>
                  <Typography sx={{ color: '#475569', lineHeight: 1.8 }}>
                    To empower growth and opportunity by providing fast, flexible, and transparent private lending solutions. We believe that access to capital should be straightforward, personalized, and responsive to real-world financial needs.
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* SERVICES SECTION */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#1e3a8a', color: 'white' }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography sx={{ color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>SERVICES</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>Our Featured Services.</Typography>
          </Box>
          <Grid container spacing={4}>
            {[
              { title: 'Savings Account', desc: 'Reduced Payments maintenance and processing fees. No hidden fees.' },
              { title: 'Business Lending', desc: 'Helping businesses secure capital for growth, equipment, and working capital.' },
              { title: 'Pay Out & Refund', desc: 'Execute pay outs and refunds straight to your customer’s bank account.' },
              { title: 'Agent Banking', desc: 'Stay updated. Check your bank account to manage funds and track transactions securely.' }
            ].map((service, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card sx={{ p: 4, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', height: '100%' }}>
                  <Box sx={{ mb: 3 }}>
                    <CheckCircle2 size={40} color="#93c5fd" />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>{service.title}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 3, lineHeight: 1.6 }}>{service.desc}</Typography>
                  <Button 
                    onClick={() => navigate('/loan')}
                    endIcon={<ArrowRight size={18} />} 
                    sx={{ color: '#93c5fd', p: 0, '&:hover': { bgcolor: 'transparent', color: 'white' } }}
                  >
                    Read More
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      {/* FOUR SIMPLE STEPS SECTION */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f8fafc' }}>
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography sx={{ color: '#1e3a8a', fontWeight: 700, textTransform: 'uppercase', mb: 1, letterSpacing: '2px' }}>
                FINANCE AT YOUR FINGERTIPS
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a', mb: 3 }}>
                Four Simple Steps to Get the Right Loan
              </Typography>
              <Typography sx={{ color: '#475569', mb: 4, lineHeight: 1.8, fontSize: '1.1rem' }}>
                Access fast, flexible financing through a simple and transparent process designed to support your personal and business financial goals.
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <CheckCircle2 size={24} color="#2563eb" style={{ flexShrink: 0 }} />
                    <Typography sx={{ color: '#1e293b', fontWeight: 600 }}>Transparent loan terms with no hidden charges</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <CheckCircle2 size={24} color="#2563eb" style={{ flexShrink: 0 }} />
                    <Typography sx={{ color: '#1e293b', fontWeight: 600 }}>Secure and encrypted application process</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <CheckCircle2 size={24} color="#2563eb" style={{ flexShrink: 0 }} />
                    <Typography sx={{ color: '#1e293b', fontWeight: 600 }}>Quick eligibility check and fast approvals</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <CheckCircle2 size={24} color="#2563eb" style={{ flexShrink: 0 }} />
                    <Typography sx={{ color: '#1e293b', fontWeight: 600 }}>Flexible loan options to suit your needs</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <CheckCircle2 size={24} color="#2563eb" style={{ flexShrink: 0 }} />
                    <Typography sx={{ color: '#1e293b', fontWeight: 600 }}>Expert financial guidance at every step</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <CheckCircle2 size={24} color="#2563eb" style={{ flexShrink: 0 }} />
                    <Typography sx={{ color: '#1e293b', fontWeight: 600 }}>Reliable support from application to disbursal</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                <img 
                  src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1950" 
                  alt="Finance process" 
                  style={{ width: '100%', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }} 
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

    </Box>
  );
};

export default Home;

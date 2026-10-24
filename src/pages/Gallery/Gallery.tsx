import { Container, Typography, Box, Grid } from '@mui/material';

const Gallery = () => {
    // Generate some placeholder images for the gallery
    const images = [
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1520607162513-aa25e85c1380?auto=format&fit=crop&q=80&w=800"
    ];

    return (
        <Box sx={{ bgcolor: "#ffffff", minHeight: "100vh", color: "#1e293b", pb: 12 }}>
            
            {/* HERO SECTION */}
            <Box sx={{ bgcolor: '#1e3a8a', color: 'white', py: { xs: 8, md: 10 }, textAlign: 'center' }}>
                <Container maxWidth="md">
                    <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                        Our <span style={{ color: '#93c5fd' }}>Gallery</span>
                    </Typography>
                    <Typography sx={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)' }}>
                        A glimpse into our events, achievements, and everyday life at E shopy.
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ mt: 8 }}>
                <Grid container spacing={3}>
                    {images.map((img, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Box 
                                sx={{ 
                                    height: 250, 
                                    borderRadius: '16px', 
                                    overflow: 'hidden', 
                                    cursor: 'pointer',
                                    '&:hover img': {
                                        transform: 'scale(1.05)'
                                    }
                                }}
                            >
                                <img 
                                    src={img} 
                                    alt={`Gallery image ${index + 1}`} 
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover',
                                        transition: 'transform 0.4s ease'
                                    }} 
                                />
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default Gallery;

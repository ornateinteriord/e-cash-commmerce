import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { Shield, Lock, Eye, UserCheck, Database, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Button
                startIcon={<ArrowLeft size={20} />}
                onClick={() => navigate("/")}
                sx={{
                    mt: 3,
                    mb: 3,
                    color: "#6b21a8",
                    "&:hover": {
                        backgroundColor: "rgba(107, 33, 168, 0.1)",
                    },
                }}
            >
                Back to Home
            </Button>
            <Box sx={{ textAlign: "center", mb: 6 }}>
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: "bold",
                        mb: 2,
                        background: "linear-gradient(135deg, #6b21a8 0%, #a855f7 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Privacy Policy
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Last Updated: {new Date().toLocaleDateString()}
                </Typography>
            </Box>

            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Shield size={28} style={{ color: "#6b21a8", marginRight: "12px" }} />
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#6b21a8" }}>
                        Introduction
                    </Typography>
                </Box>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    E shopy (\"E shopy\", \"we\", \"us\", or \"our\") is committed to protecting
                    your privacy and personal information. This Privacy Policy explains how we collect, use, disclose,
                    and safeguard your information when you use our services and platform.
                </Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Database size={28} style={{ color: "#6b21a8", marginRight: "12px" }} />
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#6b21a8" }}>
                        Information We Collect
                    </Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    Personal Information
                </Typography>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    We collect personal information that you voluntarily provide to us when registering as a member,
                    including but not limited to:
                </Typography>
                <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                    <li>Full name, date of birth, and gender</li>
                    <li>Contact information (email address, phone number, physical address)</li>
                    <li>Government-issued identification documents (for KYC purposes)</li>
                    <li>Bank account details and financial information</li>
                    <li>Employment and income information</li>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    Usage Information
                </Typography>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    We automatically collect certain information when you access our platform, including:
                </Typography>
                <Box component="ul" sx={{ pl: 4 }}>
                    <li>Device information and browser type</li>
                    <li>IP address and location data</li>
                    <li>Usage patterns and preferences</li>
                    <li>Transaction history and account activity</li>
                </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Eye size={28} style={{ color: "#6b21a8", marginRight: "12px" }} />
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#6b21a8" }}>
                        How We Use Your Information
                    </Typography>
                </Box>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    We use the collected information for the following purposes:
                </Typography>
                <Box component="ul" sx={{ pl: 4 }}>
                    <li>To provide and maintain our financial services</li>
                    <li>To process transactions and manage your account</li>
                    <li>To comply with legal and regulatory requirements</li>
                    <li>To communicate with you about your account and services</li>
                    <li>To detect and prevent fraud and unauthorized activities</li>
                    <li>To improve our services and user experience</li>
                    <li>To send you updates, newsletters, and promotional materials (with your consent)</li>
                </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Lock size={28} style={{ color: "#6b21a8", marginRight: "12px" }} />
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#6b21a8" }}>
                        Data Security
                    </Typography>
                </Box>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    We implement appropriate technical and organizational security measures to protect your personal
                    information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </Typography>
                <Box component="ul" sx={{ pl: 4 }}>
                    <li>Encryption of sensitive data during transmission and storage</li>
                    <li>Regular security assessments and audits</li>
                    <li>Access controls and authentication mechanisms</li>
                    <li>Employee training on data protection and privacy</li>
                    <li>Secure backup and disaster recovery procedures</li>
                </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <UserCheck size={28} style={{ color: "#6b21a8", marginRight: "12px" }} />
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#6b21a8" }}>
                        Your Rights
                    </Typography>
                </Box>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    You have the following rights regarding your personal information:
                </Typography>
                <Box component="ul" sx={{ pl: 4 }}>
                    <li>Right to access and obtain a copy of your personal data</li>
                    <li>Right to rectify inaccurate or incomplete information</li>
                    <li>Right to request deletion of your personal data (subject to legal obligations)</li>
                    <li>Right to restrict or object to certain processing activities</li>
                    <li>Right to data portability</li>
                    <li>Right to withdraw consent at any time</li>
                </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <AlertCircle size={28} style={{ color: "#6b21a8", marginRight: "12px" }} />
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#6b21a8" }}>
                        Data Retention
                    </Typography>
                </Box>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    We retain your personal information for as long as necessary to fulfill the purposes outlined in
                    this Privacy Policy, unless a longer retention period is required or permitted by law. When we no
                    longer need your information, we will securely delete or anonymize it.
                </Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, background: "linear-gradient(145deg, #f8fafc 0%, #e0e7ff 100%)" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "#6b21a8" }}>
                    Contact Us
                </Typography>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices,
                    please contact us at:
                </Typography>
                <Typography variant="body1">
                    <strong>Email:</strong> support@eshopy.com<br />
                    <strong>Phone:</strong> +91 9004478100, 0820-7966887<br />
                    <strong>Address:</strong> Shop No. G6, Asha Chandra Trade Centre, Udupi, Karnataka
                </Typography>
            </Paper>
        </Container>
    );
};

export default PrivacyPolicy;

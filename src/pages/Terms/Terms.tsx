import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { FileText, UserCheck, Ban, AlertTriangle, Scale, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", color: "#1e293b", pb: 12 }}>
            {/* HERO SECTION */}
            <Box sx={{ bgcolor: '#1e3a8a', color: '#ffffff', py: { xs: 8, md: 10 }, textAlign: 'center' }}>
                <Container maxWidth="md">
                    <Button
                        startIcon={<ArrowLeft size={20} />}
                        onClick={() => navigate("/")}
                        sx={{
                            mb: 4,
                            color: "#93c5fd",
                            "&:hover": {
                                backgroundColor: "rgba(147, 197, 253, 0.1)",
                            },
                        }}
                    >
                        Back to Home
                    </Button>
                    <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem' }, color: '#ffffff' }}>
                        Terms & <span style={{ color: '#93c5fd' }}>Conditions</span>
                    </Typography>
                    <Typography sx={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)' }}>
                        Last Updated: {new Date().toLocaleDateString()}
                    </Typography>
                </Container>
            </Box>
            <Container maxWidth="lg" sx={{ mt: 8 }}>

            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <FileText size={28} style={{ color: "#6b21a8", marginRight: "12px" }} />
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#6b21a8" }}>
                        Introduction
                    </Typography>
                </Box>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    Welcome to E shopy (\"E shopy\", \"we\", \"us\", or \"our\"). These Terms
                    and Conditions govern your use of our services and platform. By accessing or using our services,
                    you agree to be bound by these terms.
                </Typography>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    Please read these terms carefully before using our services. If you do not agree with any part of
                    these terms, you should not use our services.
                </Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <UserCheck size={28} style={{ color: "#6b21a8", marginRight: "12px" }} />
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#6b21a8" }}>
                        Membership and Eligibility
                    </Typography>
                </Box>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    To become a member of E shopy and use our services, you must:
                </Typography>
                <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                    <li>Be at least 18 years of age</li>
                    <li>Provide valid and accurate personal information</li>
                    <li>Complete the KYC (Know Your Customer) verification process</li>
                    <li>Agree to these Terms and Conditions and our Privacy Policy</li>
                    <li>Pay the required membership fee and share capital</li>
                </Box>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    We reserve the right to refuse membership or terminate existing memberships at our discretion,
                    particularly in cases of fraudulent activity or violation of these terms.
                </Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Scale size={28} style={{ color: "#6b21a8", marginRight: "12px" }} />
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#6b21a8" }}>
                        Services and Accounts
                    </Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    Account Usage
                </Typography>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    Members are responsible for:
                </Typography>
                <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                    <li>Maintaining the confidentiality of account credentials</li>
                    <li>All activities that occur under their account</li>
                    <li>Notifying us immediately of any unauthorized access</li>
                    <li>Providing accurate and up-to-date information</li>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    Financial Services
                </Typography>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    E shopy offers various financial services including:
                </Typography>
                <Box component="ul" sx={{ pl: 4 }}>
                    <li>Savings Accounts with competitive interest rates</li>
                    <li>Fixed Deposits and Recurring Deposits</li>
                    <li>Personal Loans and Gold Loans</li>
                    <li>Other cooperative society benefits</li>
                </Box>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    Each service is subject to specific terms, eligibility criteria, interest rates, and fees as
                    communicated at the time of service activation.
                </Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <AlertTriangle size={28} style={{ color: "#6b21a8", marginRight: "12px" }} />
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#6b21a8" }}>
                        Fees and Charges
                    </Typography>
                </Box>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    Members are responsible for paying all applicable fees, charges, and interest as per the prevailing
                    rates. These may include:
                </Typography>
                <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                    <li>Membership fees and share capital</li>
                    <li>Account maintenance charges</li>
                    <li>Loan processing fees and interest</li>
                    <li>Transaction charges and penalties</li>
                </Box>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    We reserve the right to modify our fee structure with prior notice to members. Updated fee schedules
                    will be communicated through our platform or via email.
                </Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Ban size={28} style={{ color: "#6b21a8", marginRight: "12px" }} />
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#6b21a8" }}>
                        Prohibited Activities
                    </Typography>
                </Box>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    Members are strictly prohibited from:
                </Typography>
                <Box component="ul" sx={{ pl: 4 }}>
                    <li>Using the platform for any illegal or unauthorized purpose</li>
                    <li>Providing false or misleading information</li>
                    <li>Attempting to gain unauthorized access to our systems</li>
                    <li>Engaging in fraudulent activities or money laundering</li>
                    <li>Violating any applicable laws or regulations</li>
                    <li>Transferring or selling account credentials to third parties</li>
                    <li>Using automated systems to access the platform</li>
                </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "#6b21a8" }}>
                    Limitation of Liability
                </Typography>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    E shopy shall not be liable for any indirect, incidental, special, or consequential damages arising out
                    of or related to your use of our services. We do not guarantee uninterrupted or error-free service.
                </Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "#6b21a8" }}>
                    Termination
                </Typography>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    We reserve the right to suspend or terminate your account and access to our services at any time,
                    with or without notice, for any violation of these terms or for any other reason we deem appropriate.
                </Typography>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    Upon termination, you remain liable for all outstanding obligations and amounts due to E shopy.
                </Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "#6b21a8" }}>
                    Governing Law
                </Typography>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    These Terms and Conditions shall be governed by and construed in accordance with the laws of India.
                    Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction
                    of the courts in Udupi, Karnataka.
                </Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, background: "linear-gradient(145deg, #f8fafc 0%, #e0e7ff 100%)" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "#6b21a8" }}>
                    Contact Information
                </Typography>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    For questions regarding these Terms and Conditions, please contact us:
                </Typography>
                <Typography variant="body1">
                    <strong>Email:</strong> support@eshopy.com<br />
                    <strong>Phone:</strong> +91 9004478100, 0820-7966887<br />
                    <strong>Address:</strong> Shop No. G6, Asha Chandra Trade Centre, Udupi, Karnataka
                </Typography>
            </Paper>
        </Container>
    </Box>
    );
};

export default Terms;

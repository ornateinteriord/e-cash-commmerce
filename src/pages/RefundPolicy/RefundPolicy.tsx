import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { RefreshCw, Clock, CheckCircle, XCircle, Info, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RefundPolicy = () => {
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
                    Refund Policy
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Last Updated: {new Date().toLocaleDateString()}
                </Typography>
            </Box>

            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <RefreshCw size={28} style={{ color: "#6b21a8", marginRight: "12px" }} />
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#6b21a8" }}>
                        Overview
                    </Typography>
                </Box>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    At E shopy (E shopy), we strive to provide excellent financial services
                    to our members. This Refund Policy outlines the circumstances under which refunds may be requested and
                    processed for various fees and charges.
                </Typography>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    Please read this policy carefully to understand our refund procedures and your rights as a member.
                </Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CheckCircle size={28} style={{ color: "#16a34a", marginRight: "12px" }} />
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#6b21a8" }}>
                        Eligible Refunds
                    </Typography>
                </Box>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    Refunds may be processed in the following situations:
                </Typography>
                <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                    <li>
                        <strong>Duplicate Transactions:</strong> If you have been charged multiple times for the same
                        transaction due to technical errors.
                    </li>
                    <li>
                        <strong>Erroneous Charges:</strong> Fees or charges that were applied incorrectly or in error.
                    </li>
                    <li>
                        <strong>Service Not Delivered:</strong> If a paid service was not provided as per the agreed terms.
                    </li>
                    <li>
                        <strong>Membership Cancellation:</strong> Membership fees may be refunded on a pro-rata basis if
                        membership is cancelled within the first 30 days, subject to deductions for services utilized.
                    </li>
                    <li>
                        <strong>Loan Processing Fees:</strong> If a loan application is rejected before processing begins,
                        the processing fee may be refunded.
                    </li>
                </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <XCircle size={28} style={{ color: "#dc2626", marginRight: "12px" }} />
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#6b21a8" }}>
                        Non-Refundable Items
                    </Typography>
                </Box>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    The following fees and charges are non-refundable:
                </Typography>
                <Box component="ul" sx={{ pl: 4 }}>
                    <li>
                        <strong>Share Capital:</strong> Share capital contribution is non-refundable except upon
                        termination of membership as per society bylaws.
                    </li>
                    <li>
                        <strong>Account Maintenance Charges:</strong> Once the service period has begun.
                    </li>
                    <li>
                        <strong>Transaction Fees:</strong> Fees for completed transactions.
                    </li>
                    <li>
                        <strong>Late Payment Penalties:</strong> Penalties charged for delayed payments.
                    </li>
                    <li>
                        <strong>Third-Party Service Charges:</strong> Fees paid to external service providers.
                    </li>
                    <li>
                        <strong>Processed Loan Interest:</strong> Interest on loans that have been disbursed.
                    </li>
                </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Clock size={28} style={{ color: "#6b21a8", marginRight: "12px" }} />
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#6b21a8" }}>
                        Refund Request Process
                    </Typography>
                </Box>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    To request a refund, please follow these steps:
                </Typography>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                        Step 1: Contact Us
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ lineHeight: 1.8, pl: 2 }}>
                        Reach out to our support team via email at support@eshopy.com or call us at +91 9004478100
                        within 7 days of the transaction.
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                        Step 2: Provide Details
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ lineHeight: 1.8, pl: 2 }}>
                        Include your member ID, transaction details, transaction date, amount, and reason for the refund request.
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                        Step 3: Review
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ lineHeight: 1.8, pl: 2 }}>
                        Our team will review your request within 5-7 business days and contact you with an update.
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                        Step 4: Processing
                    </Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.8, pl: 2 }}>
                        If approved, the refund will be processed within 10-15 business days to your original payment method
                        or account.
                    </Typography>
                </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Info size={28} style={{ color: "#6b21a8", marginRight: "12px" }} />
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#6b21a8" }}>
                        Important Notes
                    </Typography>
                </Box>
                <Box component="ul" sx={{ pl: 4 }}>
                    <li>
                        Refunds will be processed to the original payment method used for the transaction.
                    </li>
                    <li>
                        Bank processing times may vary, and it may take up to 7-10 business days for the refund to reflect
                        in your account after processing.
                    </li>
                    <li>
                        MSI reserves the right to reject refund requests that do not meet the criteria outlined in this policy.
                    </li>
                    <li>
                        In case of disputes, MSI's decision shall be final and binding.
                    </li>
                    <li>
                        This policy is subject to change. Members will be notified of any significant changes.
                    </li>
                </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, background: "linear-gradient(145deg, #f8fafc 0%, #e0e7ff 100%)" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "#6b21a8" }}>
                    Contact Us
                </Typography>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    For refund requests or questions about this policy, please contact:
                </Typography>
                <Typography variant="body1">
                    <strong>Email:</strong> support@eshopy.com<br />
                    <strong>Phone:</strong> +91 9004478100, 0820-7966887<br />
                    <strong>Address:</strong> Shop No. G6, Asha Chandra Trade Centre, Udupi, Karnataka<br />
                    <strong>Office Hours:</strong> Monday - Saturday, 10:00 AM - 5:00 PM
                </Typography>
            </Paper>
        </Container>
    );
};

export default RefundPolicy;

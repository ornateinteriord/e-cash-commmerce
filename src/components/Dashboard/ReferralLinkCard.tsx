import React, { useState } from 'react';
import { Box, Typography, Button, Snackbar, Alert, Link as MuiLink } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import TokenService from '../../queries/token/tokenService';
import ReferralQRDialog from '../Referral/ReferralQRDialog';

const ReferralLinkCard: React.FC = () => {
    const [copied, setCopied] = useState(false);
    const [qrOpen, setQrOpen] = useState(false);
    const memberId = TokenService.getMemberId() || '';

    // Generate referral URL
    const baseUrl = window.location.origin;
    const referralUrl = `${baseUrl}/register?ref=${memberId}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(referralUrl);
            setCopied(true);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleShareLink = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join our platform!',
                    text: 'Register using my referral link and get started!',
                    url: referralUrl,
                });
            } catch (err) {
                // User cancelled or share failed
                console.log('Share cancelled');
            }
        } else {
            // Fallback - copy to clipboard
            handleCopyLink();
        }
    };

    return (
        <Box sx={{ px: { xs: 1.5, sm: 2, md: 3 }, mb: 1 }}>
            <Box
                sx={{
                    background: 'white',
                    borderRadius: '16px',
                    p: { xs: 2, sm: 3 },
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 'bold',
                        color: '#7c3aed',
                        textAlign: 'center',
                        mb: 1,
                    }}
                >
                    Your Referral Link
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                    {/* Clickable Link */}
                    <Box
                        sx={{
                            flex: 1,
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            p: 1.5,
                            textAlign: 'center',
                            overflow: 'hidden',
                        }}
                    >
                        <MuiLink
                            href={referralUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                color: '#7c3aed',
                                textDecoration: 'none',
                                fontWeight: 500,
                                fontSize: '0.875rem',
                                wordBreak: 'break-all',
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            {referralUrl}
                        </MuiLink>
                    </Box>

                    <Button
                        variant="contained"
                        onClick={() => setQrOpen(true)}
                        startIcon={<QrCode2Icon />}
                        sx={{
                            borderRadius: '8px',
                            bgcolor: '#7c3aed',
                            color: '#FFFFFF',
                            textTransform: 'none',
                            fontWeight: 600,
                            minWidth: { xs: '100%', sm: 'auto' },
                            '&:hover': {
                                bgcolor: '#6d28d9',
                            },
                        }}
                    >
                        QR Code
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={handleCopyLink}
                        startIcon={<ContentCopyIcon />}
                        sx={{
                            borderRadius: '8px',
                            borderColor: '#7c3aed',
                            color: '#7c3aed',
                            textTransform: 'none',
                            fontWeight: 600,
                            minWidth: { xs: '100%', sm: 'auto' },
                            '&:hover': {
                                borderColor: '#6d28d9',
                                backgroundColor: 'rgba(124, 58, 237, 0.04)',
                            },
                        }}
                    >
                        Copy Link
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={handleShareLink}
                        startIcon={<ShareIcon />}
                        sx={{
                            borderRadius: '8px',
                            borderColor: '#7c3aed',
                            color: '#7c3aed',
                            textTransform: 'none',
                            fontWeight: 600,
                            minWidth: { xs: '100%', sm: 'auto' },
                            '&:hover': {
                                borderColor: '#6d28d9',
                                backgroundColor: 'rgba(124, 58, 237, 0.04)',
                            },
                        }}
                    >
                        Share Link
                    </Button>
                </Box>

                <Typography
                    variant="body2"
                    sx={{
                        textAlign: 'center',
                        mt: 1,
                        color: '#6b7280',
                        fontSize: '0.875rem',
                    }}
                >
                    Share this QR code or link with friends and earn rewards when they join!
                </Typography>
            </Box>

            <ReferralQRDialog
                open={qrOpen}
                onClose={() => setQrOpen(false)}
                vendorName="Member"
                vendorCode={memberId}
                initialType="vendor"
            />

            <Snackbar
                open={copied}
                autoHideDuration={2000}
                onClose={() => setCopied(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" sx={{ width: '100%' }}>
                    Link copied to clipboard!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ReferralLinkCard;

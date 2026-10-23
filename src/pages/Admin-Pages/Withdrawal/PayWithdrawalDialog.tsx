import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, TextField, CircularProgress, Divider } from '@mui/material';
import { toast } from 'react-toastify';
import { useApproveWithdrawal } from '../../../queries/admin/withdrawal';
import { useGetMemberById } from '../../../queries/Member';

interface PayWithdrawalDialogProps {
    open: boolean;
    onClose: () => void;
    request: any;
}

const PayWithdrawalDialog: React.FC<PayWithdrawalDialogProps> = ({ open, onClose, request }) => {
    const approveMutation = useApproveWithdrawal();
    const [remarks, setRemarks] = useState('');
    const [processing, setProcessing] = useState(false);

    // Fetch member details to get bank info and mobile number
    const { data: memberData, isLoading: memberLoading } = useGetMemberById(request?.member_id || '');
    const member = memberData?.data;

    if (!request) return null;

    const handleAction = async (action: 'Pay' | 'Reject') => {
        if (action === 'Reject' && !remarks) {
            toast.error("Please enter rejection remarks");
            return;
        }

        setProcessing(true);
        try {
            // Auto-generate transaction ID for admin payments
            const autoTransactionId = action === 'Pay' ? `ADM${Date.now()}` : '';

            const response = await approveMutation.mutateAsync({
                request_id: request.withdraw_request_id,
                action,
                transaction_id: autoTransactionId,
                remarks
            });

            if (response.success) {
                toast.success(response.message);
                onClose();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error?.message || "Action failed");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: '#f3f4f6', fontWeight: 'bold' }}>
                Process Withdrawal Request
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                {/* Amount Section */}
                <Box sx={{ textAlign: 'center', py: 2, mb: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #86efac' }}>
                    <Typography variant="caption" color="text.secondary">Withdrawal Amount</Typography>
                    <Typography variant="h4" color="success.main" fontWeight="bold">{request.amount?.toFixed(2)}</Typography>
                </Box>

                {/* Bank Details Section */}
                <Box sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: '#f8fafc',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0'
                }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5, color: '#1e293b' }}>
                        Bank Details
                    </Typography>
                    {memberLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 1.5 }}>
                            <Typography variant="body2" color="text.secondary">Bank Name</Typography>
                            <Typography variant="body2" fontWeight="600">{member?.bank_name || 'Not Provided'}</Typography>

                            <Typography variant="body2" color="text.secondary">Account Number</Typography>
                            <Typography variant="body2" fontWeight="600" sx={{ fontFamily: 'monospace' }}>
                                {member?.account_number || 'Not Provided'}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">IFSC Code</Typography>
                            <Typography variant="body2" fontWeight="600" sx={{ fontFamily: 'monospace' }}>
                                {member?.ifsc_code || 'Not Provided'}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">Account Holder</Typography>
                            <Typography variant="body2" fontWeight="600">{member?.name || 'Not Provided'}</Typography>
                        </Box>
                    )}
                </Box>

                {/* Contact Section */}
                <Box sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: '#eff6ff',
                    borderRadius: 2,
                    border: '1px solid #bfdbfe'
                }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5, color: '#1e293b' }}>
                        Contact Information
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">Mobile Number</Typography>
                        <Typography variant="body2" fontWeight="600">{member?.contactno || 'Not Provided'}</Typography>

                        <Typography variant="body2" color="text.secondary">Vendor ID</Typography>
                        <Typography variant="body2" fontWeight="600" sx={{ fontFamily: 'monospace' }}>{request.member_id}</Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Remarks (Optional / Required for Rejection)"
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                    onClick={() => handleAction('Reject')}
                    color="error"
                    variant="outlined"
                    disabled={processing}
                >
                    Reject
                </Button>
                <Button
                    onClick={() => handleAction('Pay')}
                    color="primary"
                    variant="contained"
                    disabled={processing}
                >
                    {processing ? <CircularProgress size={24} color="inherit" /> : 'Confirm Payment'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PayWithdrawalDialog;

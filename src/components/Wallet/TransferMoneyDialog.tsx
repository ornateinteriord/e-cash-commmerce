import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box, Typography, CircularProgress, Alert, Divider, Paper, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { toast } from 'react-toastify';
import TokenService from '../../queries/token/tokenService';
import { useGetMyAccounts } from '../../queries/Member';
import { useGetMemberBasicInfo, useGetMemberAccountsPublic, useTransferMoney } from '../../queries/transfer';

interface TransferMoneyDialogProps {
    open: boolean;
    onClose: () => void;
}

const TransferMoneyDialog: React.FC<TransferMoneyDialogProps> = ({ open, onClose }) => {
    const userId = TokenService.getMemberId();

    // Fetch current user's accounts (with balances)
    const { data: myAccountsData, isLoading: loadingMyAccounts } = useGetMyAccounts();

    // State management
    const [selectedFromAccount, setSelectedFromAccount] = useState<string>('');
    const [recipientMemberId, setRecipientMemberId] = useState('');
    const [fetchRecipient, setFetchRecipient] = useState(false);
    const [selectedToAccount, setSelectedToAccount] = useState<string>('');
    const [amount, setAmount] = useState('');

    // Fetch recipient info and accounts
    const { data: recipientInfo, isLoading: loadingRecipient, isError: recipientError } = useGetMemberBasicInfo(
        recipientMemberId,
        fetchRecipient
    );

    const { data: recipientAccounts, isLoading: loadingRecipientAccounts } = useGetMemberAccountsPublic(
        recipientMemberId,
        fetchRecipient && !!recipientInfo?.success
    );

    // Transfer mutation
    const transferMutation = useTransferMoney();

    // Flatten accounts for dropdown
    const allAccounts = myAccountsData?.data?.accountTypes?.flatMap((accType: any) =>
        accType.accounts.map((acc: any) => ({
            ...acc,
            account_type: accType.account_type,
            account_group_name: accType.account_group_name
        }))
    ) || [];

    // Filter to show only SB (Savings Bank) and Current accounts for Transfer
    const myAccounts = allAccounts.filter((acc: any) => {
        const accountGroup = acc.account_group_name?.toUpperCase();
        return accountGroup === 'SB' || accountGroup === 'CA';
    });

    const handleFetchRecipient = () => {
        if (!recipientMemberId.trim()) {
            toast.error('Please enter recipient member ID');
            return;
        }
        if (recipientMemberId === userId) {
            toast.error('Cannot transfer to your own account');
            return;
        }
        setFetchRecipient(true);
        setSelectedToAccount(''); // Reset selected account
    };

    const handleTransfer = async () => {
        // Validation
        if (!selectedFromAccount) {
            toast.error('Please select your account');
            return;
        }
        if (!recipientMemberId || !recipientInfo?.success) {
            toast.error('Please fetch recipient information');
            return;
        }
        if (!selectedToAccount) {
            toast.error('Please select recipient account');
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        // Find selected accounts
        const fromAccount = myAccounts.find((acc: any) => acc._id === selectedFromAccount);
        const toAccount = recipientAccounts?.data?.find((acc: any) => acc._id === selectedToAccount);

        if (!fromAccount || !toAccount) {
            toast.error('Invalid account selection');
            return;
        }

        // Check balance
        if (fromAccount.account_amount < parseFloat(amount)) {
            toast.error(`Insufficient balance. Available: ${fromAccount.account_amount}`);
            return;
        }

        try {
            const response = await transferMutation.mutateAsync({
                from: {
                    member_id: userId!,
                    account_id: fromAccount._id,
                    account_no: fromAccount.account_no,
                    account_type: fromAccount.account_type
                },
                to: {
                    member_id: recipientMemberId,
                    account_id: toAccount._id,
                    account_no: toAccount.account_no,
                    account_type: toAccount.account_type
                },
                amount: parseFloat(amount)
            });

            if (response.success) {
                toast.success(response.message || 'Transfer successful!');
                handleClose();
            } else {
                toast.error(response.message || 'Transfer failed');
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || 'Transfer failed');
        }
    };

    const handleClose = () => {
        setSelectedFromAccount('');
        setRecipientMemberId('');
        setFetchRecipient(false);
        setSelectedToAccount('');
        setAmount('');
        onClose();
    };

    const selectedFrom = myAccounts.find((acc: any) => acc._id === selectedFromAccount);
    const availableBalance = selectedFrom?.account_amount || 0;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                }
            }}
        >
            <DialogTitle sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SwapHorizIcon />
                    <Typography variant="h6">Transfer Money</Typography>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 3 }}>
                {/* FROM Section */}
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#374151' }}>
                    From Account
                </Typography>
                <TextField
                    select
                    fullWidth
                    value={selectedFromAccount}
                    onChange={(e) => setSelectedFromAccount(e.target.value)}
                    disabled={loadingMyAccounts}
                    sx={{ mb: 2 }}
                    label="Select Your Account"
                >
                    {myAccounts.map((acc: any) => (
                        <MenuItem key={acc._id} value={acc._id}>
                            {acc.account_group_name} - ${acc.account_amount.toFixed(2)} ({acc.account_no})
                        </MenuItem>
                    ))}
                </TextField>

                {selectedFromAccount && (
                    <Paper sx={{ p: 2, mb: 3, bgcolor: '#f3f4f6', borderRadius: '8px' }}>
                        <Typography variant="body2" color="text.secondary">
                            Available Balance: <strong>{availableBalance.toFixed(2)}</strong>
                        </Typography>
                    </Paper>
                )}

                <Divider sx={{ my: 3 }} />

                {/* TO Section */}
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#374151' }}>
                    To Account
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                        fullWidth
                        label="Recipient Vendor ID/Code"
                        value={recipientMemberId}
                        onChange={(e) => {
                            setRecipientMemberId(e.target.value);
                            setFetchRecipient(false);
                        }}
                        placeholder="Enter vendor ID or code"
                    />
                    <Button
                        variant="contained"
                        onClick={handleFetchRecipient}
                        disabled={loadingRecipient || !recipientMemberId}
                        sx={{
                            minWidth: '120px',
                            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                        }}
                        startIcon={loadingRecipient ? <CircularProgress size={20} color="inherit" /> : <PersonSearchIcon />}
                    >
                        Get Info
                    </Button>
                </Box>

                {/* Recipient Info Display */}
                {recipientInfo?.success && (
                    <Paper sx={{ p: 2, mb: 2, bgcolor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            {recipientInfo.data.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Member ID: {recipientInfo.data.member_id}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                            Contact: {recipientInfo.data.contactno}
                        </Typography>
                    </Paper>
                )}

                {/* Recipient Not Found */}
                {!loadingRecipient && fetchRecipient && (recipientError || (recipientInfo && !recipientInfo.success)) && (
                    <Paper sx={{ p: 2, mb: 2, bgcolor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#dc2626' }}>
                            Member not found
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Please check the Member ID and try again
                        </Typography>
                    </Paper>
                )}

                {/* Recipient Account Selection - Loading */}
                {loadingRecipientAccounts && recipientInfo?.success && (
                    <TextField
                        fullWidth
                        disabled
                        value=""
                        label="Select Recipient Account"
                        InputProps={{
                            startAdornment: <CircularProgress size={20} sx={{ mr: 1 }} />
                        }}
                        helperText="Fetching accounts..."
                        sx={{ mb: 2 }}
                    />
                )}

                {/* Recipient Account Selection */}
                {!loadingRecipientAccounts && recipientAccounts?.success && recipientAccounts.data.length > 0 && (
                    <TextField
                        select
                        fullWidth
                        value={selectedToAccount}
                        onChange={(e) => setSelectedToAccount(e.target.value)}
                        sx={{ mb: 2 }}
                        label="Select Recipient Account"
                    >
                        {recipientAccounts.data.map((acc: any) => (
                            <MenuItem key={acc._id} value={acc._id}>
                                {acc.account_group_name} - {acc.account_no}
                            </MenuItem>
                        ))}
                    </TextField>
                )}

                {!loadingRecipientAccounts && recipientAccounts?.success && recipientAccounts.data.length === 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        No bank account found for this member
                    </Alert>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Amount Input */}
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#374151' }}>
                    Amount
                </Typography>
                <TextField
                    fullWidth
                    type="number"
                    label="Enter Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    error={selectedFrom && parseFloat(amount) > selectedFrom.account_amount}
                    helperText={
                        selectedFrom && parseFloat(amount) > selectedFrom.account_amount
                            ? `Insufficient balance. Available: ${selectedFrom.account_amount.toFixed(2)}`
                            : ''
                    }
                    InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}></Typography>
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: '8px' }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleTransfer}
                    variant="contained"
                    disabled={transferMutation.isPending || !selectedFromAccount || !selectedToAccount || !amount}
                    sx={{
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        px: 4
                    }}
                    startIcon={transferMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <SwapHorizIcon />}
                >
                    {transferMutation.isPending ? 'Processing...' : 'Transfer'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TransferMoneyDialog;

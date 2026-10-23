import React, { useState } from 'react';
import { Container, Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, CircularProgress, Tabs, Tab, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useGetWithdrawalRequests } from '../../../queries/admin/withdrawal';
import PayWithdrawalDialog from './PayWithdrawalDialog';

const WithdrawalRequests: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Filter status based on tab ok 
    // Filter status based on tab ok 
    // Filter status based on tab ok 
    const getStatusFilter = () => {
        switch (tabValue) {
            case 0: return 'Pending';
            case 1: return 'Completed';
            case 2: return 'Rejected';
            default: return 'All';
        }
    };

    const { data: requestsData, isLoading, error } = useGetWithdrawalRequests(getStatusFilter());
    const requests = requestsData?.data || [];

    const handlePayClick = (request: any) => {
        setSelectedRequest(request);
        setDialogOpen(true);
    };

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, mt: { xs: 3, sm: 6 }, px: { xs: 1, sm: 2, md: 3 } }}>
            {/* Page Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 1, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
                    Withdrawal Requests
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Manage and approve vendor withdrawal requests from commission wallet
                </Typography>
            </Box>

            <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, newValue) => setTabValue(newValue)}
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        px: 2,
                        bgcolor: '#f8fafc',
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            minHeight: 48,
                        }
                    }}
                >
                    <Tab label="Pending" />
                    <Tab label="Completed" />
                    <Tab label="Rejected" />
                </Tabs>

                {isLoading ? (
                    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
                        Error loading requests
                    </Box>
                ) : requests.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                        No {getStatusFilter()} requests found
                    </Box>
                ) : (
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Vendor Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Vendor ID</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Amount</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requests.map((req: any) => (
                                    <TableRow key={req._id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                                        <TableCell sx={{ color: '#334155' }}>
                                            {new Date(req.requested_date).toLocaleDateString('en-US', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell sx={{ color: '#334155', fontWeight: 600 }}>
                                            {req.member_details?.name || 'N/A'}
                                        </TableCell>
                                        <TableCell sx={{ color: '#334155', fontWeight: 500 }}>{req.member_id}</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#059669' }}>
                                            ${req.amount?.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={req.status}
                                                size="small"
                                                sx={{
                                                    bgcolor: req.status === 'Pending' ? '#fef9c3' :
                                                        req.status === 'Completed' ? '#dcfce7' : '#fee2e2',
                                                    color: req.status === 'Pending' ? '#854d0e' :
                                                        req.status === 'Completed' ? '#166534' : '#991b1b',
                                                    fontWeight: 600,
                                                    borderRadius: 1
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {req.status === 'Pending' && (
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handlePayClick(req)}
                                                    sx={{
                                                        textTransform: 'none',
                                                        bgcolor: '#4f46e5',
                                                        '&:hover': { bgcolor: '#4338ca' },
                                                        borderRadius: 1,
                                                        boxShadow: 'none'
                                                    }}
                                                >
                                                    Pay Now
                                                </Button>
                                            )}
                                            {req.status === 'Completed' && (
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} />
                                                    <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
                                                        {req.transaction_id}
                                                    </Typography>
                                                </Stack>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            <PayWithdrawalDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                request={selectedRequest}
            />
        </Container>
    );
};

export default WithdrawalRequests;

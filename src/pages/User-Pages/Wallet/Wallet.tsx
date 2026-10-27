import { useState, useEffect } from 'react';
import { Card, CardContent, TextField, Typography, Box, Button, CircularProgress, Fade, IconButton, Alert, Divider } from '@mui/material';
import DataTable from "react-data-table-component";
import { useMediaQuery } from '@mui/material';
import { DASHBOARD_CUTSOM_STYLE, getWalletColumns,  } from '../../../utils/DataTableColumnsProvider';
import TokenService from "../../../api/token/tokenService";
import { useGetWalletOverview, useWalletWithdraw } from '../../../api/Memeber';
import { toast } from 'react-toastify';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { MuiOtpInput } from 'mui-one-time-password-input';

import { useSearchParams } from 'react-router-dom';

const Wallet = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isWithdrawalView = searchParams.get('type') === 'withdrawal';
  const isMobile = useMediaQuery("(max-width:600px)");
  const [amount, setAmount] = useState("");
  const [tds, setTds] = useState(0); const [netAmount, setNetAmount] = useState(0);
  const [optimisticBalance, setOptimisticBalance] = useState<number | null>(null);
  const [isWithdrawalAllowed, setIsWithdrawalAllowed] = useState<boolean>(true);
  // const [ setLoanStatusMessage] = useState<string>("");

  const memberId = TokenService.getMemberId() || '';

  const {
    data: walletData,
    isLoading,
    refetch,
  } = useGetWalletOverview(memberId);

  const withdrawMutation = useWalletWithdraw(memberId);

  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState("");

  // --- 2X Withdrawal limit logic ---
  const totalInvested = parseFloat(
    walletData?.totalInvested ?? 
    walletData?.data?.totalInvested ?? 
    walletData?.totalPackages ?? 
    walletData?.data?.totalPackages ?? 
    0
  );
  const maxWithdrawalLimit = parseFloat(
    walletData?.maxWithdrawalLimit ?? 
    walletData?.data?.maxWithdrawalLimit ?? 
    (totalInvested * 2)
  );
  const totalWithdrawn = parseFloat(
    walletData?.totalWithdrawn ?? 
    walletData?.data?.totalWithdrawn ?? 
    0
  );
  const rawRemaining = walletData?.remainingWithdrawalLimit ?? walletData?.data?.remainingWithdrawalLimit;
  const remainingWithdrawalLimit = (rawRemaining !== undefined && rawRemaining !== null)
    ? parseFloat(rawRemaining)
    : Math.max(0, maxWithdrawalLimit - totalWithdrawn);
  const maxWithdrawal = remainingWithdrawalLimit;

  const hasWithdrawnToday = Boolean(walletData?.hasWithdrawnToday ?? walletData?.data?.hasWithdrawnToday);


  useEffect(() => {
    const rawBalance = walletData?.balance ?? walletData?.data?.balance;
    if (rawBalance !== undefined && rawBalance !== null) {
      const balance = parseFloat(rawBalance);
      setOptimisticBalance(balance);
    }

    // Check withdrawal allowance from API response
    if (walletData?.loanStatus) {
      setIsWithdrawalAllowed(walletData.loanStatus.isWithdrawalAllowed);
      // setLoanStatusMessage(walletData.loanStatus.message || "");
    }
  }, [walletData?.balance, walletData?.data?.balance, walletData?.loanStatus]);

  const handleAmountChange = (e: any) => {
    const value = e.target.value;
    // Allow only numeric input
    if (value !== "" && !/^\d*/.test(value)) return;

    setAmount(value);

    if (value && value !== "0") {
      const withdrawalAmount = parseFloat(value);
      const deductionAmount = withdrawalAmount * 0.10; // 10% deduction
      const calculatedNetAmount = withdrawalAmount - deductionAmount;

      setTds(deductionAmount);
      setNetAmount(calculatedNetAmount);
    } else {
      setTds(0);
      setNetAmount(0);
    }
  };

  const handleSendOTP = () => {
    if (!amount || amount === "0") {
      return;
    }

    if (hasWithdrawnToday) {
      toast.error('You have already requested a withdrawal today. Only one withdrawal per day is allowed.');
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    const currentBalance = optimisticBalance !== null ? optimisticBalance : parseFloat(walletData?.balance || 0);

    if (withdrawalAmount > currentBalance) {
      toast.error('Withdrawal amount exceeds available balance');
      return;
    }

    if (totalInvested <= 0) {
      toast.error('You need an active investment to request a withdrawal.');
      return;
    }

    if (withdrawalAmount > remainingWithdrawalLimit) {
      toast.error(`Maximum remaining withdrawal limit is ₹${remainingWithdrawalLimit.toFixed(2)} (Total 2x Limit: ₹${maxWithdrawalLimit.toFixed(2)}, Already Withdrawn: ₹${totalWithdrawn.toFixed(2)})`);
      return;
    }

    // Direct withdrawal without OTP verification for now
    const newBalance = currentBalance - withdrawalAmount;
    setOptimisticBalance(newBalance);

    withdrawMutation.mutate(
      { memberId: memberId, amount: amount, otp: "BYPASS" },
      {
        onSuccess: () => {
          setAmount("");
          setTds(0);
          setNetAmount(0);
          setOtp("");
          setStep(1);
          refetch();
        },
        onError: () => {
          // Revert optimistic update on error
          setOptimisticBalance(parseFloat(walletData?.balance || 0));
        }
      }
    );
  };

  const handleWithdraw = () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    const currentBalance = optimisticBalance !== null ? optimisticBalance : parseFloat(walletData?.balance || 0);
    const newBalance = currentBalance - withdrawalAmount;
    setOptimisticBalance(newBalance);

    withdrawMutation.mutate(
      { memberId: memberId, amount: amount, otp: otp },
      {
        onSuccess: () => {
          setAmount("");
          setTds(0);
          setNetAmount(0);
          setOtp("");
          setStep(1);
          refetch();
        },
        onError: () => {
          // Revert optimistic update on error
          setOptimisticBalance(parseFloat(walletData?.balance || 0));
        }
      }
    );
  };

  const displayBalance = Math.max(0, optimisticBalance !== null ? optimisticBalance : parseFloat(walletData?.balance || 0));

  if (isLoading) {
    return (
      <Card
        sx={{
          margin: isMobile ? "1rem" : "2rem",
          mt: 1, // Further reduced top margin
          textAlign: "center",
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress sx={{ color: "#0a2558" }} />
      </Card>
    );
  }

  return (
    <Card
      sx={{
        margin: isMobile ? "0.5rem" : "1.5rem",
        bgcolor: '#ffffff',
        borderRadius: "24px",
        border: "1px solid #FED7AA",
        boxShadow: "0 8px 30px rgba(109,33,79,0.06)",
        mt: 1,
      }}
    >
      <CardContent sx={{ padding: isMobile ? "14px" : "28px" }}>
        {/* Withdrawal Section */}
        {isWithdrawalView && (
        <div>
          <Box sx={{
            marginBottom: "1.5rem",
            background: "linear-gradient(135deg, #FE8001 0%, #FF9933 100%)",
            color: '#FFFFFF',
            padding: "14px 18px",
            borderRadius: "16px",
            fontWeight: "bold",
            fontSize: "1.1rem",
            boxShadow: "0 4px 14px rgba(109,33,79,0.25)",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <IconButton 
              onClick={() => {
                if (step === 2) setStep(1);
                else setSearchParams({});
              }} 
              size="small" 
              sx={{ color: '#FFFFFF' }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            Withdrawal Request {!isWithdrawalAllowed && "(Temporarily Disabled)"}
          </Box>
          <div style={{ padding: "0 0.5rem 1rem 0.5rem" }}>
            {step === 1 ? (
              <Fade in={step === 1}>
            <form
              style={{
                marginTop: 2,
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {/* 2X Withdrawal Limit Summary Card */}
              <Box sx={{
                p: 2,
                borderRadius: "16px",
                bgcolor: "#FFFFFF",
                border: "1.5px solid #FED7AA",
                display: "flex",
                flexDirection: "column",
                gap: 1
              }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" sx={{ color: "#7a5060", fontWeight: 700 }}>Total Investment</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: "#FE8001" }}>₹{totalInvested.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" sx={{ color: "#7a5060", fontWeight: 700 }}>Max Withdrawal Limit (2x)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: "#FE8001" }}>₹{maxWithdrawalLimit.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" sx={{ color: "#7a5060", fontWeight: 700 }}>Already Withdrawn</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: totalWithdrawn > 0 ? "#d32f2f" : "#7a5060" }}>₹{totalWithdrawn.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 0.5, borderColor: "#FED7AA" }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" sx={{ color: "#059669", fontWeight: 800 }}>Remaining Withdrawable Limit</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#059669" }}>₹{remainingWithdrawalLimit.toFixed(2)}</Typography>
                </Box>
              </Box>

              <TextField
                label="Available Balance"
                value={`${displayBalance.toFixed(2)}`}
                fullWidth
                size="medium"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    bgcolor: "#FFFFFF",
                    "& fieldset": { borderColor: "#FED7AA", borderWidth: "1.5px" },
                    "&:hover fieldset": { borderColor: "#E5989B" },
                    "&.Mui-focused fieldset": { borderColor: "#FE8001", borderWidth: "2px" },
                  },
                  "& .MuiInputLabel-root": { color: "#7a5060", fontWeight: 600 },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#FE8001" },
                }}
              />

              <TextField
                label="Withdrawal Amount"
                type="text"
                value={amount}
                onChange={handleAmountChange}
                fullWidth
                size="medium"
                placeholder="Enter amount"
                disabled={withdrawMutation.isPending || !isWithdrawalAllowed || hasWithdrawnToday}
                error={parseFloat(amount) > displayBalance || (Boolean(amount) && parseFloat(amount) > remainingWithdrawalLimit)}
                helperText={
                  hasWithdrawnToday
                    ? "Only one withdrawal per day is allowed. You have already requested a withdrawal today."
                    : parseFloat(amount) > displayBalance 
                      ? "Insufficient Balance" 
                      : (Boolean(amount) && parseFloat(amount) > remainingWithdrawalLimit) 
                        ? `Maximum remaining limit is ₹${remainingWithdrawalLimit.toFixed(2)} (Total 2x Limit: ₹${maxWithdrawalLimit.toFixed(2)}, Withdrawn: ₹${totalWithdrawn.toFixed(2)})` 
                        : `2x Limit: ₹${maxWithdrawalLimit.toFixed(2)} | Remaining: ₹${remainingWithdrawalLimit.toFixed(2)}`
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    bgcolor: "#FFFFFF",
                    "& fieldset": { borderColor: "#FED7AA", borderWidth: "1.5px" },
                    "&:hover fieldset": { borderColor: "#E5989B" },
                    "&.Mui-focused fieldset": { borderColor: "#FE8001", borderWidth: "2px" },
                  },
                  "& .MuiInputLabel-root": { color: "#7a5060", fontWeight: 600 },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#FE8001" },
                }}
              />

              {/* 
              <TextField
                label="Admin Charges (15%)"
                value={`${adminCharges.toFixed(2)}`}
                fullWidth
                size="medium"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                    "&.Mui-focused fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                  },
                }}
              />
              */}

              <TextField
                label="Deduction (10%)"
                value={`${tds.toFixed(2)}`}
                fullWidth
                size="medium"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    bgcolor: "#FFFFFF",
                    "& fieldset": { borderColor: "#FED7AA", borderWidth: "1.5px" },
                    "&:hover fieldset": { borderColor: "#E5989B" },
                    "&.Mui-focused fieldset": { borderColor: "#FE8001", borderWidth: "2px" },
                  },
                  "& .MuiInputLabel-root": { color: "#7a5060", fontWeight: 600 },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#FE8001" },
                }}
              />

              <TextField
                label="Net Amount Received"
                value={`${netAmount.toFixed(2)}`}
                fullWidth
                size="medium"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                    "&.Mui-focused fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                  },
                }}
              />

              {hasWithdrawnToday ? (
                <Alert severity="warning" sx={{ mb: 1, borderRadius: '8px' }}>
                  You have already submitted a withdrawal request today. Only one withdrawal per day is allowed.
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mb: 1, borderRadius: '8px' }}>
                  Requests are processed within 2-3 business days.
                </Alert>
              )}

              <Box
                sx={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "stretch" : "center",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Terms & Conditions:</strong>
                  </Typography>
                  <Box sx={{ display: "flex", gap: 4, flexDirection: isMobile ? "column" : "row" }}>
                    <Box>
                      <Typography variant="body2">• 10% Deduction applied</Typography>
                      <Typography variant="body2">• Maximum withdrawal: 2x of total invest amount (₹{maxWithdrawalLimit.toFixed(2)})</Typography>
                      <Typography variant="body2">• One withdrawal per day allowed</Typography>
                    </Box>
                  </Box>
                  {!isWithdrawalAllowed && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#ff9800",
                        fontWeight: "bold",
                        mt: 1
                      }}
                    >
                      • Withdrawal disabled due to unpaid loan from last Saturday
                    </Typography>
                  )}
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  disabled={
                    withdrawMutation.isPending ||
                    !amount ||
                    parseFloat(amount) <= 0 ||
                    parseFloat(amount) > maxWithdrawal ||
                    !isWithdrawalAllowed ||
                    hasWithdrawnToday
                  }
                  onClick={handleSendOTP}
                  sx={{
                    background: (isWithdrawalAllowed && !hasWithdrawnToday) ? "linear-gradient(135deg, #FE8001 0%, #FF9933 100%)" : "#F4C95D",
                    color: (isWithdrawalAllowed && !hasWithdrawnToday) ? "#FFFFFF" : "#1F333B",
                    "&:hover": {
                      background: (isWithdrawalAllowed && !hasWithdrawnToday) ? "linear-gradient(135deg, #E06F00 0%, #FE8001 100%)" : "#e6be4e"
                    },
                    borderRadius: "14px",
                    height: "50px",
                    fontSize: "1rem",
                    fontWeight: 800,
                    textTransform: "none",
                    boxShadow: "0 4px 14px rgba(109,33,79,0.25)"
                  }}
                >
                  {withdrawMutation.isPending ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> :
                  !isWithdrawalAllowed ? "Disabled" :
                  hasWithdrawnToday ? "Already Withdrawn Today" : "Submit Withdrawal"}
                </Button>
              </Box>
            </form>
              </Fade>
            ) : (
              <Fade in={step === 2}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                  <Box textAlign="center">
                    <Typography variant="h6" sx={{ color: '#FE8001', mb: 1, fontWeight: 800 }}>Security Verification</Typography>
                    <Typography variant="body2" sx={{ color: '#7a5060' }}>
                      Enter the 6-digit OTP sent to your registered email address.
                    </Typography>
                  </Box>

                  <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                    <MuiOtpInput
                      length={6}
                      value={otp}
                      onChange={(newValue) => setOtp(newValue)}
                      TextFieldsProps={{
                        size: 'medium',
                        placeholder: '-',
                        sx: {
                          maxWidth: '45px',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            bgcolor: '#FFFFFF',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            '& fieldset': { borderColor: '#FED7AA' },
                            '&:hover fieldset': { borderColor: '#E5989B' },
                            '&.Mui-focused fieldset': {
                              borderColor: '#FE8001',
                              borderWidth: '2px'
                            },
                          },
                          '& .MuiOutlinedInput-input': {
                            textAlign: 'center',
                            px: 0,
                            color: '#1F333B'
                          }
                        }
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      onClick={handleWithdraw}
                      disabled={withdrawMutation.isPending || otp.length !== 6}
                      sx={{
                        background: "linear-gradient(135deg, #FE8001 0%, #FF9933 100%)",
                        color: "#FFFFFF",
                        fontWeight: 800,
                        borderRadius: "12px",
                        minWidth: "160px",
                        py: 1.3,
                        textTransform: "none",
                        "&:hover": {
                          background: "linear-gradient(135deg, #E06F00 0%, #FE8001 100%)"
                        },
                        "&:disabled": { backgroundColor: "#FED7AA", color: "#a88098" },
                      }}
                    >
                      {withdrawMutation.isPending ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> : 'Confirm Withdrawal'}
                    </Button>
                  </Box>
                </Box>
              </Fade>
            )}
          </div>
        </div>
        )}

        {/* Transaction History */}
        {!isWithdrawalView && (
        <>
        <div style={{ marginBottom: "1.2rem", color: "#1F333B", fontWeight: 800, fontSize: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Transaction History</span>
          <Button 
            variant="contained" 
            onClick={() => setSearchParams({ type: 'withdrawal' })}
            sx={{
              background: "linear-gradient(135deg, #FE8001 0%, #FF9933 100%)",
              color: "#FFFFFF",
              "&:hover": { background: "linear-gradient(135deg, #E06F00 0%, #FE8001 100%)" },
              borderRadius: "12px",
              fontWeight: 800,
              textTransform: "none",
              px: 3,
              boxShadow: "0 4px 12px rgba(109,33,79,0.2)"
            }}
          >
            Withdraw
          </Button>
        </div>
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <DataTable
              columns={getWalletColumns()}
              data={walletData?.transactions || []}
              pagination
              customStyles={DASHBOARD_CUTSOM_STYLE}
              paginationPerPage={isMobile ? 10 : 25}
              paginationRowsPerPageOptions={
                isMobile ? [10, 20, 50] : [25, 50, 100]
              }
              highlightOnHover
              responsive
              noDataComponent={
                <Box sx={{ textAlign: "center", py: 4, width: "100%" }}>
                  <Typography variant="h6" color="textSecondary" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
                    No transactions found
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mt: 0.5, fontSize: '0.85rem' }}
                  >
                    Your transaction history will appear here
                  </Typography>
                </Box>
              }
            />
          </Box>
        </>
        )}
      </CardContent>
    </Card>
  );
};

export default Wallet;

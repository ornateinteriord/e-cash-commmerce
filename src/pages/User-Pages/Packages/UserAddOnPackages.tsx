import React, { useState, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import moment from 'moment';
import { Box, Card, CardContent, Typography, Button, Grid, CircularProgress, TextField, Divider, InputAdornment, Chip, LinearProgress,  } from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

import UserContext from '../../../context/user/userContext';
import { useRequestAddOnMutation, useGetMemberAddOns } from '../../../api/Packages';
import { useGetWalletOverview } from '../../../api/Memeber';
import { toast } from 'react-toastify';


export const UserAddOnPackages = () => {
  const { user } = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view'); // 'fd' or 'addon'

  const [packageAmount, setPackageAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: requestAddOn } = useRequestAddOnMutation();
  const { data: addOns = [], isLoading: addOnsLoading } = useGetMemberAddOns(user?.Member_id);
  const { data: walletOverview } = useGetWalletOverview(user?.Member_id || '');

  const currentPackageAmount = Number(walletOverview?.primaryPackage || walletOverview?.packageAmount || user?.package_value || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageAmount || !user?.Member_id) return;

    // User Rule: Re-top up amount must be equal to or greater than current package
    if (currentPackageAmount > 0 && Number(packageAmount) < currentPackageAmount) {
      toast.error(`Re-top up amount cannot be lower than your current package of ₹${currentPackageAmount.toLocaleString('en-IN')}. Please enter ₹${currentPackageAmount.toLocaleString('en-IN')} or more.`);
      return;
    }

    if (Number(packageAmount) < 100) {
      toast.error("Minimum invest amount is ₹100");
      return;
    }

    setIsSubmitting(true);

    requestAddOn({
      member_id: user.Member_id,
      requested_amount: Number(packageAmount)
    }, {
      onSuccess: () => {
        setIsSubmitting(false);
        setPackageAmount('');
      },
      onError: () => {
        setIsSubmitting(false);
      }
    });
  };

  if (!user) {
    return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 10 }} />;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, mt: { xs: 3, md: 7 } }}>
      {/* ── ROW 1: CENTERED REQUEST FORM (Only if view is 'addon' or empty) ── */}
      {(!view || view === 'addon') && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: view === 'addon' ? 0 : 6 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#0a2558', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AddCircleOutlineIcon sx={{ fontSize: 28, color: '#ed6c02' }} />
            Invest Amount
          </Typography>
          <Card sx={{
            boxShadow: '0 8px 32px rgba(10,37,88,0.08)',
            borderRadius: '16px',
            border: '1px dashed #90a4d4',
            backgroundColor: '#fdfdff',
            maxWidth: 500,
            width: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5 }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#ed6c02', mr: 2, mt: 0.5 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Add an investment with daily return cycle.
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  required
                  type="text"
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  label="Invest Amount (₹)"
                  variant="outlined"
                  size="medium"
                  value={packageAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d+$/.test(val)) {
                      setPackageAmount(val);
                    }
                  }}
                  placeholder="Min 100"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PaymentsIcon sx={{ color: '#0a2558', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    },
                    "& input": {
                      MozAppearance: "textfield",
                    },
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                      WebkitAppearance: "none",
                      display: "none",
                      margin: 0,
                    },
                  }}
                />

                {/* Balance displayed below amount text box on left corner */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 0.75, mb: 1, pl: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                    Credit Balance: <span style={{ color: '#059669', fontWeight: 700 }}>₹{Number(walletOverview?.balance ?? walletOverview?.availableForWithdrawal ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </Typography>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={!packageAmount || isSubmitting}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    backgroundColor: '#0a2558',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '1rem',
                    textTransform: 'none',
                    borderRadius: '12px',
                    '&:hover': { backgroundColor: '#153b93' }
                  }}
                >
                  {isSubmitting ? 'Submitting Request...' : 'Invest Amount'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* ── ROW 2: ACTIVE PORTFOLIO (Only if view is 'fd' or empty) ── */}
      {(!view || view === 'fd') && (
        <>
          <Box sx={{ mb: 4, mt: view === 'fd' ? 0 : 4 }}>
            <Typography variant="h5" sx={{ color: '#0a2558', fontWeight: 900, letterSpacing: -0.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 4, height: 24, backgroundColor: '#ed6c02', borderRadius: 1 }} />
              My Deposits
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, ml: 2, fontWeight: 500 }}>
              Manage your deposits and investment tracks.
            </Typography>
          </Box>

      {addOnsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#0a2558' }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {(() => {
            // Check if the primary package is already in the add-ons list (new logic)
            const primaryInAddOns = addOns.find((a: any) => a.package_id?.startsWith('PKG-P-'));
            
            // If we found it in the list, we don't need to manually create the primaryPkg object
            // But we should mark it as primary for styling
            let finalAddOns = [...addOns];
            // Backward compatibility: If no package in add-ons matches the user's base package value, add it manually
            if (primaryInAddOns) {
              finalAddOns = addOns.map((a: any) => a);
            }

            // For legacy users, we still need to calculate the base amount if it's not in the add-on table
            const baseAmount = user.package_value || 0;

            const primaryPkg = {
              request_id: 'PRIMARY',
              isPrimary: true,
              requested_amount: baseAmount,
              roi_status: user.roi_status || 'Active',
              roi_payout_target: user.roi_payout_target || ((user.package_value || 0) * 3),
              roi_payout_count: user.roi_payout_count || 0,
              roi_start_date: user.roi_start_date || user.Date_of_joining,
            };

            // If primary is already in add-ons, just use the mapped list, otherwise prepend the manual primaryPkg
            const allPackages = primaryInAddOns ? finalAddOns : [primaryPkg, ...addOns];

            return allPackages.map((pkg: any, index: number) => {
              const pkgAmount = pkg.amount || pkg.requested_amount || 0;
              const pkgId = pkg.package_id || pkg.request_id || 'N/A';
              const totalDays = pkg.isFD 
                ? (moment(pkg.date_of_maturity).diff(moment(pkg.roi_start_date), 'days') || 1)
                : (pkg.roi_payout_target || 200);
              const payoutCount = pkg.roi_payout_count || 0;
              const pkgProgress = Math.min((payoutCount / totalDays) * 100, 100);
              const dailyIncentiveAmount = pkgAmount * 0.01;
              const earnedSoFar = (payoutCount * dailyIncentiveAmount).toFixed(2);

              return (
                <Grid item xs={12} sm={6} md={4} key={pkgId}>
                  <Card sx={{
                    height: '100%',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                    borderRadius: '16px',
                    border: '1px solid #e3eafc',
                    backgroundcolor: '#0F172A',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            {pkg.isFD ? <AccountBalanceIcon sx={{ fontSize: 14, color: '#ed6c02' }} /> : <PaymentsIcon sx={{ fontSize: 14, color: 'text.secondary' }} />}
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 800, color: pkg.isFD ? '#ed6c02' : 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              {pkg.isFD ? 'Fixed Deposit' : `Investment #${index + 1}`}
                            </Typography>
                          </Box>
                          <Typography variant="h5" sx={{ fontWeight: 900, fontSize: '1.4rem', color: '#0a2558', lineHeight: 1.2 }}>
                            ₹{pkgAmount.toLocaleString('en-US')}
                          </Typography>
                        </Box>
                        <Chip
                          label={pkg.roi_status}
                          size="small"
                          color={pkg.roi_status === 'Active' ? 'success' : 'default'}
                          sx={{ height: 24, fontSize: '0.75rem', fontWeight: 800, borderRadius: '6px' }}
                        />
                      </Box>

                      <Divider sx={{ mb: 2 }} />
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                            {pkg.isFD ? 'Interest Rate' : 'Daily Incentive'}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1565c0', fontSize: '1.1rem' }}>
                            {pkg.isFD ? `${pkg.interest_rate || 0}% p.a.` : `1% (₹${dailyIncentiveAmount.toFixed(2)}/day)`}
                          </Typography>
                        </Box>
                        {!pkg.isFD && (
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                              Earned So Far
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#059669', fontSize: '1rem' }}>
                              ₹{earnedSoFar}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 700 }}>
                          {pkg.isFD ? 'Maturity Progress' : `Daily Incentive: ${payoutCount} of ${totalDays} Days`}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 700 }}>
                          {pkgProgress.toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pkgProgress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#f0f4ff',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #1565c0, #0a2558)',
                            borderRadius: 4
                          }
                        }}
                      />


                      <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarTodayIcon sx={{ color: 'text.disabled', fontSize: 14 }} />
                          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.disabled', fontWeight: 500 }}>
                            {new Date(pkg.roi_start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.disabled', opacity: 0.6, fontFamily: 'monospace', fontWeight: 500 }}>
                          #{pkgId.toString().slice(-8)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            });
          })()}
          </Grid>
        )}
      </>
    )}
  </Box>
);
};

export default UserAddOnPackages;

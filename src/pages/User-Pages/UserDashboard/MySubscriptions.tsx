import React, { useContext } from 'react';
import moment from 'moment';
import { Box, Card, CardContent, Typography, Grid, CircularProgress, Divider, Chip, LinearProgress, IconButton } from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../../context/user/userContext';
import { useGetMemberAddOns } from '../../../api/Packages';

const MySubscriptions: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { data: addOns = [], isLoading: addOnsLoading } = useGetMemberAddOns(user?.Member_id || '');

  if (!user) {
    return (
      <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh', display: 'flex', justifyContent: 'center', pt: 10 }}>
        <CircularProgress sx={{ color: '#FE8001' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      bgcolor: '#FFFFFF', 
      minHeight: '100vh',
      maxWidth: '480px',
      margin: '0 auto',
      pb: 10
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <IconButton 
          onClick={() => navigate(-1)}
          sx={{ 
            bgcolor: '#ffffff', 
            border: '1.5px solid #FED7AA',
            color: '#FE8001',
            p: 1,
            '&:hover': { bgcolor: '#fdf2f4' }
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#FE8001', letterSpacing: '-0.5px' }}>
            My Investments
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            Active investments & daily incentives
          </Typography>
        </Box>
      </Box>

      {addOnsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#FE8001' }} />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {(() => {
            const primaryInAddOns = addOns.find((a: any) => a.package_id?.startsWith('PKG-P-'));
            let finalAddOns = [...addOns];
            if (primaryInAddOns) {
              finalAddOns = addOns.map((a: any) => a);
            }

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

            const allPackages = primaryInAddOns ? [...finalAddOns] : [primaryPkg, ...addOns];

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
                <Grid item xs={12} key={pkgId}>
                  <Card sx={{
                    boxShadow: '0 4px 16px rgba(109,33,79,0.06)',
                    borderRadius: '24px',
                    border: '1.5px solid #FED7AA',
                    backgroundColor: '#ffffff',
                    color: '#1F333B',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-2px)', borderColor: '#E5989B' }
                  }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            {pkg.isFD ? <AccountBalanceIcon sx={{ fontSize: 16, color: '#FE8001' }} /> : <PaymentsIcon sx={{ fontSize: 16, color: '#FE8001' }} />}
                            <Typography variant="caption" sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              {pkg.isFD ? 'Fixed Deposit' : `Investment #${index + 1}`}
                            </Typography>
                          </Box>
                          <Typography variant="h5" sx={{ fontWeight: 900, color: '#FE8001', lineHeight: 1.2 }}>
                            ₹{pkgAmount.toLocaleString()}
                          </Typography>
                        </Box>
                        <Chip
                          label={pkg.roi_status}
                          size="small"
                          sx={{ 
                            height: 24, 
                            fontSize: '0.72rem', 
                            fontWeight: 800, 
                            borderRadius: '8px',
                            backgroundColor: pkg.roi_status === 'Active' ? 'rgba(254, 128, 1, 0.15)' : '#fdf2f4',
                            color: '#FE8001',
                            border: '1px solid rgba(254, 128, 1, 0.4)'
                          }}
                        />
                      </Box>

                      <Divider sx={{ my: 1.5, borderColor: '#FED7AA' }} />
                      <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>
                            {pkg.isFD ? 'Interest Rate' : 'Daily Incentive'}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#FE8001' }}>
                            {pkg.isFD ? `${pkg.interest_rate || 0}% p.a.` : `1% (₹${dailyIncentiveAmount.toFixed(2)}/day)`}
                          </Typography>
                        </Box>
                        {!pkg.isFD && (
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>
                              Earned So Far
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#059669' }}>
                              ₹{earnedSoFar}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                        <Typography variant="caption" sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>
                          {pkg.isFD ? 'Maturity Progress' : `Daily Incentive: ${payoutCount} of ${totalDays} Days`}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.72rem', color: '#FE8001', fontWeight: 800 }}>
                          {pkgProgress.toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pkgProgress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #FED7AA',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #E5989B, #FE8001)',
                            borderRadius: 4
                          }
                        }}
                      />

                      <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarTodayIcon sx={{ color: '#64748B', fontSize: 13 }} />
                          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
                            {new Date(pkg.roi_start_date || pkg.createdAt || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#64748B', fontFamily: 'monospace', fontWeight: 600 }}>
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
    </Box>
  );
};

export default MySubscriptions;

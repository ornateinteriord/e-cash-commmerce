import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { useNavigate, useLocation } from 'react-router-dom';

import { useGetMemberDetails, useGetWalletOverview } from '../../api/Memeber';
import TokenService from '../../api/token/tokenService';
import { ReTopupDialog } from '../../pages/User-Pages/UserDashboard/ReTopupDialog';

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = React.useState('');
  const [reTopupOpen, setReTopupOpen] = React.useState(false);

  const memberId = TokenService.getMemberId();
  const { data: memberDetails } = useGetMemberDetails(memberId);
  const { data: walletOverview } = useGetWalletOverview(memberId || '');

  // Backend provides whether user has an initial investment (canReTopup / hasInvestment)
  const hasInvestment = Boolean(
    walletOverview?.hasInvestment ??
    walletOverview?.data?.hasInvestment ??
    memberDetails?.hasInvestment ??
    memberDetails?.data?.hasInvestment ??
    ((Number(walletOverview?.totalPackages ?? walletOverview?.data?.totalPackages ?? memberDetails?.totalPackages ?? memberDetails?.package_value ?? 0)) > 0)
  );

  const totalInvested = Number(
    walletOverview?.totalInvested ??
    walletOverview?.data?.totalInvested ??
    walletOverview?.totalPackages ??
    walletOverview?.data?.totalPackages ??
    memberDetails?.totalPackages ??
    memberDetails?.package_value ??
    0
  );

  const totalEarnings = Math.max(
    Number(walletOverview?.totalEarnings ?? walletOverview?.data?.totalEarnings ?? 0),
    Number(walletOverview?.totalBenefits ?? walletOverview?.data?.totalBenefits ?? 0),
    (
      Number(walletOverview?.directBenefits || 0) +
      Number(walletOverview?.levelBenefits || 0) +
      Number(walletOverview?.singleLineIncome || 0) +
      Number(walletOverview?.roiBenefits || 0) +
      Number(walletOverview?.roiLevelBenefits || 0) +
      Number(walletOverview?.repaymentCommission || 0)
    )
  );

  const canShowReinvest = hasInvestment && totalInvested > 0 && totalEarnings >= (2 * totalInvested);

  // Sync state with current path
  React.useEffect(() => {
    if (location.pathname.includes('/user/dashboard')) setValue('/user/dashboard');
    else if (location.search.includes('type=credits') || location.search.includes('type=Credits')) setValue('/user/transactions?type=credits');
    else if (location.pathname.includes('/user/new-subscription')) setValue(canShowReinvest ? 're-topup' : '');
    else if (location.pathname.includes('/user/account/profile')) setValue('/user/account/profile');
    else setValue('');
  }, [location.pathname, location.search, canShowReinvest]);

  if (location.pathname.includes('/user/chat')) return null;

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderTop: '1px solid #E2E8F0',
          boxShadow: '0 -4px 16px rgba(0, 186, 242, 0.08)'
        }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={reTopupOpen ? 're-topup' : value}
          onChange={(_event, newValue) => {
            if (newValue === 're-topup') {
              setReTopupOpen(true);
              return;
            }
            setValue(newValue);
            navigate(newValue);
          }}
          sx={{
            height: 68,
            backgroundColor: '#ffffff',
            '& .MuiBottomNavigationAction-root': {
              color: '#94A3B8',
              minWidth: 0,
              padding: '4px 0',
            },
            '& .Mui-selected': {
              color: '#FF9933 !important',
              '& .MuiBottomNavigationAction-label': {
                fontWeight: 800,
                fontSize: '0.7rem',
                mt: 0.3,
                color: '#FF9933',
              },
              '& .MuiBottomNavigationAction-iconOnly': {
                paddingTop: '14px',
              },
              '& .indicator': {
                background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
                color: '#FFFFFF',
                borderRadius: '10px',
                padding: '3px',
                width: '38px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 0.3,
                boxShadow: '0 2px 8px rgba(0, 186, 242, 0.35)',
              }
            }
          }}
        >
          <BottomNavigationAction
            value="/user/dashboard"
            label="Home"
            icon={<Box className={!reTopupOpen && value === "/user/dashboard" ? "indicator" : ""}>{<HomeIcon sx={{ fontSize: 22 }} />}</Box>}
          />
          <BottomNavigationAction
            value="/user/transactions?type=credits"
            label="Credits"
            icon={<Box className={!reTopupOpen && value === "/user/transactions?type=credits" ? "indicator" : ""}>{<AccountBalanceWalletIcon sx={{ fontSize: 22 }} />}</Box>}
          />
          {canShowReinvest && (
            <BottomNavigationAction
              value="re-topup"
              label="Re-Invest"
              icon={<Box className={reTopupOpen || value === "re-topup" ? "indicator" : ""}>{<AutorenewIcon sx={{ fontSize: 22 }} />}</Box>}
            />
          )}
          <BottomNavigationAction
            value="/user/account/profile"
            label="Profile"
            icon={<Box className={!reTopupOpen && value === "/user/account/profile" ? "indicator" : ""}>{<PersonIcon sx={{ fontSize: 22 }} />}</Box>}
          />
        </BottomNavigation>
      </Paper>

      {/* Re-Invest Dialog accessible from mobile bottom nav only once earnings become double of investment */}
      {canShowReinvest && (
        <ReTopupDialog open={reTopupOpen} onClose={() => setReTopupOpen(false)} />
      )}

      {/* Spacer to prevent content from being hidden behind nav — Skip on Chat page */}
      {!location.pathname.includes('/user/chat') && <Box sx={{ height: 68 }} />}
    </Box>
  );
};

export default MobileBottomNav;

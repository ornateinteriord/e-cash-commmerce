import { Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import TokenService from '../../../api/token/tokenService';
import { useGetWalletOverview, useGetMemberDetails } from '../../../api/Memeber';

const Portfolio = () => {
  const navigate = useNavigate();
  const memberId = TokenService.getMemberId();
  const { data: walletOverview } = useGetWalletOverview(memberId);
  const { data: memberDetails } = useGetMemberDetails(memberId);

  return (
    <Box sx={{
      pb: 10,
      background: '#FFFFFF',
      minHeight: '100vh',
      px: { xs: 2, sm: 3 },
      pt: { xs: 3, sm: 4 },
      maxWidth: '480px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#FE8001', fontWeight: 900, letterSpacing: '-0.5px' }}>
          My Portfolio
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
          Manage your assets, funds & brokerage earnings
        </Typography>
      </Box>

      {/* Wallet Cards Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mb: 4 }}>
        {/* Fixed Deposit */}
        <Box 
          onClick={() => navigate('/user/fixed-deposit-wallet')} 
          sx={{ 
            display: 'flex', flexDirection: 'column', p: 2.5, borderRadius: '20px', 
            bgcolor: '#ffffff', border: '1.5px solid #FED7AA', boxShadow: '0 4px 16px rgba(109,33,79,0.06)',
            transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', borderColor: '#E5989B', boxShadow: '0 8px 24px rgba(109,33,79,0.12)' }, 
            cursor: 'pointer' 
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1.5 }}>
            <Box sx={{ p: 1.2, borderRadius: '14px', bgcolor: 'rgba(254, 128, 1,  )', display: 'flex', height: 'fit-content' }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 26, color: '#FE8001' }} />
            </Box>
            <Typography sx={{ color: '#FE8001', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.5px', m: 0 }}>
              ₹{Number(walletOverview?.fixedDepositBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ color: '#1F333B', fontWeight: 800, fontSize: '1.05rem', mb: 0.3 }}>Fixed Deposit</Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.3, fontSize: '12px' }}>
              Your money securely saved for long-term growth—simple and always accessible.
            </Typography>
          </Box>
        </Box>

        {/* Upgrade / Property Fund */}
        <Box 
          onClick={() => navigate('/user/upgrade-wallet')} 
          sx={{ 
            display: 'flex', flexDirection: 'column', p: 2.5, borderRadius: '20px', 
            bgcolor: '#ffffff', border: '1.5px solid #FED7AA', boxShadow: '0 4px 16px rgba(109,33,79,0.06)',
            transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', borderColor: '#E5989B', boxShadow: '0 8px 24px rgba(109,33,79,0.12)' }, 
            cursor: 'pointer' 
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1.5 }}>
            <Box sx={{ p: 1.2, borderRadius: '14px', bgcolor: 'rgba(31, 51, 59,  )', display: 'flex', height: 'fit-content' }}>
              <TrendingUpIcon sx={{ fontSize: 26, color: '#FE8001' }} />
            </Box>
            <Typography sx={{ color: '#FE8001', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.5px', m: 0 }}>
              ₹{Number(walletOverview?.upgradeWalletBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ color: '#1F333B', fontWeight: 800, fontSize: '1.05rem', mb: 0.3 }}>Property Fund</Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.3, fontSize: '12px' }}>
              Take your wallet to the next level with more power, flexibility, and rewards.
            </Typography>
          </Box>
        </Box>

        {/* Earnings / Payouts */}
        <Box 
          onClick={() => navigate('/user/wallet')} 
          sx={{ 
            display: 'flex', flexDirection: 'column', p: 2.5, borderRadius: '20px', 
            bgcolor: '#ffffff', border: '1.5px solid #FED7AA', boxShadow: '0 4px 16px rgba(109,33,79,0.06)',
            transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', borderColor: '#E5989B', boxShadow: '0 8px 24px rgba(109,33,79,0.12)' }, 
            cursor: 'pointer' 
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1.5 }}>
            <Box sx={{ p: 1.2, borderRadius: '14px', bgcolor: 'rgba(254, 128, 1,  )', display: 'flex', height: 'fit-content' }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 26, color: '#FE8001' }} />
            </Box>
            <Typography sx={{ color: '#FE8001', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.5px', m: 0 }}>
              ₹{Number(walletOverview?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ color: '#1F333B', fontWeight: 800, fontSize: '1.05rem', mb: 0.3 }}>Payouts</Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.3, fontSize: '12px' }}>
              Watch your funds grow and withdraw them securely anytime.
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/user/wallet?type=withdrawal');
                }}
                sx={{
                  background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  px: 3,
                  py: 0.7,
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  boxShadow: '0 4px 12px rgba(109, 33, 79, 0.25)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #E06F00 0%, #FE8001 100%)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                Withdraw Now
              </Button>
            </Box>
          </Box>
        </Box>
        
        {/* Purchase */}
        <Box 
          onClick={() => navigate('/user/purchase-wallet')} 
          sx={{ 
            display: 'flex', flexDirection: 'column', p: 2.5, borderRadius: '20px', 
            bgcolor: '#ffffff', border: '1.5px solid #FED7AA', boxShadow: '0 4px 16px rgba(109,33,79,0.06)',
            transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', borderColor: '#E5989B', boxShadow: '0 8px 24px rgba(109,33,79,0.12)' }, 
            cursor: 'pointer' 
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1.5 }}>
            <Box sx={{ p: 1.2, borderRadius: '14px', bgcolor: 'rgba(254, 128, 1,  )', display: 'flex', height: 'fit-content' }}>
              <InventoryIcon sx={{ fontSize: 26, color: '#FE8001' }} />
            </Box>
            <Typography sx={{ color: '#FE8001', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.5px', m: 0 }}>
              ₹{Number((walletOverview as any)?.purchaseBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ color: '#1F333B', fontWeight: 800, fontSize: '1.05rem', mb: 0.3 }}>Purchase Wallet</Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.3, fontSize: '12px' }}>
              Manage your purchases and track your active product investments.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Team Performance */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ color: '#1F333B', fontWeight: 900, mb: 1.8, fontSize: { xs: '1.15rem', sm: '1.25rem' }, letterSpacing: '-0.3px' }}>
          Team Performance
        </Typography>
        
        {/* Horizontal Scrollable Brokerage Performance Cards */}
        <Box sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: 2,
          pb: 1,
          pt: 0.5,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {/* 1. My Agents Card */}
          <Box 
            onClick={() => navigate('/user/team')}
            sx={{
              flex: { xs: '0 0 calc(50% - 8px)', sm: '0 0 200px' },
              minWidth: { xs: '155px', sm: '190px' },
              scrollSnapAlign: 'start',
              borderRadius: '24px',
              background: 'linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 100%)',
              border: '1.5px solid #BFDBFE',
              p: { xs: 2, sm: 2.5 },
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '200px',
              boxShadow: '0 8px 20px rgba(59, 130, 246, 0.08)',
              transition: 'all 0.25s ease',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 28px rgba(59, 130, 246, 0.16)' }
            }}
          >
            <Box>
              <Typography sx={{ color: '#1e3a8a', fontWeight: 900, fontSize: { xs: '1rem', sm: '1.1rem' }, lineHeight: 1.25, mb: 0.3 }}>
                My Member
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '11px', fontWeight: 600 }}>
                Total network team
              </Typography>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(30, 58, 138, 0.1)',
                mb: 1.2
              }}>
                <GroupsIcon sx={{ fontSize: 28, color: '#2563eb' }} />
              </Box>
              <Box sx={{
                bgcolor: '#ffffff',
                border: '1.5px solid #bfdbfe',
                borderRadius: '12px',
                py: 0.6,
                px: 1.5,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.1)'
              }}>
                <Typography sx={{ fontWeight: 900, color: '#1e3a8a', fontSize: '1.3rem', lineHeight: 1 }}>
                  {Math.max(memberDetails?.registration_stats?.total || 0, memberDetails?.total_team || 0)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* 2. My Direct Card */}
          <Box 
            onClick={() => navigate('/user/team/direct')}
            sx={{
              flex: { xs: '0 0 calc(50% - 8px)', sm: '0 0 200px' },
              minWidth: { xs: '155px', sm: '190px' },
              scrollSnapAlign: 'start',
              borderRadius: '24px',
              background: 'linear-gradient(180deg, #FFF7ED 0%, #FFEDD5 100%)',
              border: '1.5px solid #FED7AA',
              p: { xs: 2, sm: 2.5 },
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '200px',
              boxShadow: '0 8px 20px rgba(234, 88, 12, 0.08)',
              transition: 'all 0.25s ease',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 28px rgba(234, 88, 12, 0.16)' }
            }}
          >
            <Box>
              <Typography sx={{ color: '#7c2d12', fontWeight: 900, fontSize: { xs: '1rem', sm: '1.1rem' }, lineHeight: 1.25, mb: 0.3 }}>
                My Direct
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '11px', fontWeight: 600 }}>
                Direct sponsored
              </Typography>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(124, 45, 18, 0.1)',
                mb: 1.2
              }}>
                <PersonAddAltIcon sx={{ fontSize: 28, color: '#ea580c' }} />
              </Box>
              <Box sx={{
                bgcolor: '#ffffff',
                border: '1.5px solid #fed7aa',
                borderRadius: '12px',
                py: 0.6,
                px: 1.5,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.1)'
              }}>
                <Typography sx={{ fontWeight: 900, color: '#7c2d12', fontSize: '1.3rem', lineHeight: 1 }}>
                  {Math.max(memberDetails?.registration_stats?.direct || 0, memberDetails?.direct_referrals?.length || 0)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Earnings Summary - Horizontal Scrollable Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ color: '#1F333B', fontWeight: 900, mb: 1.8, fontSize: { xs: '1.15rem', sm: '1.25rem' }, letterSpacing: '-0.3px' }}>
          Earnings Summary
        </Typography>

        {/* Scrollable Container */}
        <Box sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: 2,
          pb: 1.5,
          pt: 0.5,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {/* Card 1: Referral Commission (Mint Green) */}
          <Box
            onClick={() => navigate('/user/earnings/referral-bonus')}
            sx={{
              flex: { xs: '0 0 200px', sm: '0 0 225px' },
              minWidth: { xs: '200px', sm: '225px' },
              scrollSnapAlign: 'start',
              borderRadius: '24px',
              background: 'linear-gradient(180deg, #E8F8F0 0%, #D5F5E3 100%)',
              border: '1.5px solid #B7E8D6',
              p: 2.5,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '235px',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.08)',
              transition: 'all 0.25s ease',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 28px rgba(16, 185, 129, 0.16)' }
            }}
          >
            <Box>
              <Typography sx={{ color: '#064e3b', fontWeight: 900, fontSize: '1.05rem', lineHeight: 1.3, mb: 0.4 }}>
                Referral Commission
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '11px', fontWeight: 600 }}>
                Instant bonus earnings
              </Typography>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.92)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(6, 78, 59, 0.1)',
                mb: 1.5
              }}>
                <PaymentsIcon sx={{ fontSize: 30, color: '#059669' }} />
              </Box>
              <Box sx={{
                bgcolor: '#ffffff',
                border: '1.5px solid #a7f3d0',
                borderRadius: '14px',
                py: 0.8,
                px: 1.5,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 3px 10px rgba(5, 150, 105, 0.1)'
              }}>
                <Typography sx={{ color: '#065f46', fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.3px' }}>
                  ₹{Number(walletOverview?.directBenefits || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Card 2: Brokerage Override (Warm Gold / Butter) */}
          <Box
            onClick={() => navigate('/user/earnings/level-benefits')}
            sx={{
              flex: { xs: '0 0 200px', sm: '0 0 225px' },
              minWidth: { xs: '200px', sm: '225px' },
              scrollSnapAlign: 'start',
              borderRadius: '24px',
              background: 'linear-gradient(180deg, #FEF9E7 0%, #FEF3C7 100%)',
              border: '1.5px solid #FDE68A',
              p: 2.5,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '235px',
              boxShadow: '0 8px 20px rgba(217, 119, 6, 0.08)',
              transition: 'all 0.25s ease',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 28px rgba(217, 119, 6, 0.16)' }
            }}
          >
            <Box>
              <Typography sx={{ color: '#78350f', fontWeight: 900, fontSize: '1.05rem', lineHeight: 1.3, mb: 0.4 }}>
                Level Bonus
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '11px', fontWeight: 600 }}>
                Level based progression
              </Typography>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.92)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(120, 53, 15, 0.1)',
                mb: 1.5
              }}>
                <AccountTreeIcon sx={{ fontSize: 30, color: '#d97706' }} />
              </Box>
              <Box sx={{
                bgcolor: '#ffffff',
                border: '1.5px solid #fde68a',
                borderRadius: '14px',
                py: 0.8,
                px: 1.5,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 3px 10px rgba(217, 119, 6, 0.1)'
              }}>
                <Typography sx={{ color: '#92400e', fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.3px' }}>
                  ₹{Number(walletOverview?.levelBenefits || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Card 3: Daily Incentive */}
          <Box
            onClick={() => navigate('/user/earnings/single-level-income-history')}
            sx={{
              flex: { xs: '0 0 200px', sm: '0 0 225px' },
              minWidth: { xs: '200px', sm: '225px' },
              scrollSnapAlign: 'start',
              borderRadius: '24px',
              background: 'linear-gradient(180deg, #FDF2F4 0%, #FEE2E2 100%)',
              border: '1.5px solid #FECACA',
              p: 2.5,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '235px',
              boxShadow: '0 8px 20px rgba(225, 29, 72, 0.08)',
              transition: 'all 0.25s ease',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 28px rgba(225, 29, 72, 0.16)' }
            }}
          >
            <Box>
              <Typography sx={{ color: '#881337', fontWeight: 900, fontSize: '1.05rem', lineHeight: 1.3, mb: 0.4 }}>
                Daily Incentive
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '11px', fontWeight: 600 }}>
                Single-leg structure
              </Typography>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.92)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(136, 19, 55, 0.1)',
                mb: 1.5
              }}>
                <TrendingUpIcon sx={{ fontSize: 30, color: '#e11d48' }} />
              </Box>
              <Box sx={{
                bgcolor: '#ffffff',
                border: '1.5px solid #fecaca',
                borderRadius: '14px',
                py: 0.8,
                px: 1.5,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 3px 10px rgba(225, 29, 72, 0.1)'
              }}>
                <Typography sx={{ color: '#9f1239', fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.3px' }}>
                  ₹{Number((parseFloat(walletOverview?.singleLineIncome) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Card 4: Total Withdrawal (Soft Lavender / Plum) */}
          <Box
            onClick={() => navigate('/user/transactions?type=Withdrawal')}
            sx={{
              flex: { xs: '0 0 200px', sm: '0 0 225px' },
              minWidth: { xs: '200px', sm: '225px' },
              scrollSnapAlign: 'start',
              borderRadius: '24px',
              background: 'linear-gradient(180deg, #F5F3FF 0%, #EDE9FE 100%)',
              border: '1.5px solid #DDD6FE',
              p: 2.5,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '235px',
              boxShadow: '0 8px 20px rgba(109, 33, 79, 0.08)',
              transition: 'all 0.25s ease',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 28px rgba(109, 33, 79, 0.16)' }
            }}
          >
            <Box>
              <Typography sx={{ color: '#4c1d95', fontWeight: 900, fontSize: '1.05rem', lineHeight: 1.3, mb: 0.4 }}>
                Total Withdrawal
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '11px', fontWeight: 600 }}>
                Processed payouts
              </Typography>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.92)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(76, 29, 149, 0.1)',
                mb: 1.5
              }}>
                <AttachMoneyIcon sx={{ fontSize: 30, color: '#7c3aed' }} />
              </Box>
              <Box sx={{
                bgcolor: '#ffffff',
                border: '1.5px solid #ddd6fe',
                borderRadius: '14px',
                py: 0.8,
                px: 1.5,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 3px 10px rgba(124, 58, 237, 0.1)'
              }}>
                <Typography sx={{ color: '#5b21b6', fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.3px' }}>
                  ₹{Number(walletOverview?.totalWithdrawal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Portfolio;


import { Box, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import TokenService from '../../../api/token/tokenService';
import { useGetWalletOverview } from '../../../api/Memeber';
import PaymentsIcon from '@mui/icons-material/Payments';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
// import LanguageIcon from '@mui/icons-material/Language';

const PACKAGES: Record<string, { title: string, color: string, description?: string }> = {
  '10000': { title: 'Mini Store', color: '#1de9b6', description: 'Begin your selling journey with essential product listings and digital store tools' },
  '25000': { title: 'Starter Store', color: '#EA580C', description: 'Essential product catalog listings to launch your vendor store on E-shopy' },
  '50000': { title: 'Prime Merchant', color: '#0284C7', description: 'Scale your store with higher product capacity and buyer inquiry priority' },
  '100000': { title: 'Power Seller Hub', color: '#059669', description: 'Accelerate your sales with high-volume listings and featured search rankings' },
  '200000': { title: 'Super Store Partner', color: '#7C3AED', description: 'Comprehensive vendor package with all categories unlocked and brand storefront spotlight' },
  '500000': { title: 'Mega Flagship Store', color: '#D97706', description: 'Premier vendor tier with maximum 500 product catalog listings and dedicated vendor management' }
};

const PackageDetail = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const packageFilter = searchParams.get('package') || '25000';

  const memberId = TokenService.getMemberId();
  const { data: walletOverview } = useGetWalletOverview(memberId);

  const pkgInfo = PACKAGES[packageFilter] || { title: 'PACKAGE', color: '#0284C7' };

  // If we have package-specific income data, use it; otherwise fallback to general wallet stats.
  const packageIncome = walletOverview?.singleLevelIncomeByPackage?.[packageFilter] || 0;

  return (
    <Box sx={{
      pb: 10,
      bgcolor: '#F8FAFC',
      minHeight: '100vh',
      px: { xs: 1, md: 5 },
      pt: { xs: 1, md: 4 }
    }}>
      {/* Logo and Package Name */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, }}>
        <Box sx={{ 
          width: '130px', 
          height: '130px', 
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#F8FAFC',
          borderRadius: '50%',
          p: 1,
          boxShadow: `0 0 30px ${pkgInfo.color}20`,
          border: `1px solid ${pkgInfo.color}40`
        }}>
          <Box
            component="img"
            src="/e-shopy.jpeg"
            alt="E-shopy Logo"
            sx={{
              height: 48,
              objectFit: 'contain',
              display: 'block'
            }}
          />
        </Box>
        
        <Box sx={{ 
          border: `2px solid ${pkgInfo.color}`,
          borderRadius: '999px',
          px: 5,
          py: 1.2,
          bgcolor: '#F8FAFC',
          boxShadow: `0 0 20px ${pkgInfo.color}30`
        }}>
          <Typography variant="h6" sx={{ color: pkgInfo.color, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'center' }}>
            {pkgInfo.title}
          </Typography>
        </Box>
        {pkgInfo.description && (
          <Typography variant="body2" sx={{ color: '#475569', mt: 2, textAlign: 'center', maxWidth: '80%', fontStyle: 'italic' }}>
            "{pkgInfo.description}"
          </Typography>
        )}
      </Box>

      {/* Cards Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr', 
        gap: 2, 
        maxWidth: '600px', 
        margin: '0 auto' ,
        padding:{xs:2,md:0}
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', p: { xs: 2, sm: 3 }, borderRadius: '20px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(245, 158, 11, 0.1)', display: 'flex', height: 'fit-content' }}>
              <PaymentsIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: '#f59e0b' }} />
            </Box>
            <Typography sx={{ color: '#0F172A', fontWeight: 900, fontSize: { xs: '1.3rem', sm: '1.6rem' }, letterSpacing: '1px', m: 0 }}>{Number(walletOverview?.directBenefits || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ color: '#475569', fontWeight: 800, fontSize: { xs: '1rem', sm: '1.2rem' }, textTransform: 'uppercase', mb: 0.5 }}>Referral Commission</Typography>
            <Typography variant="caption" sx={{ color: '#475569', display: 'block', lineHeight: 1.3, width: '100%', fontSize: '14px' }}>Turn every referral into a rewarding opportunity with instant bonus earnings.</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', p: { xs: 2, sm: 3 }, borderRadius: '20px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(255, 215, 0, 0.1)', display: 'flex', height: 'fit-content' }}>
              <AccountTreeIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: '#0284C7' }} />
            </Box>
            <Typography sx={{ color: '#0F172A', fontWeight: 900, fontSize: { xs: '1.3rem', sm: '1.6rem' }, letterSpacing: '1px', m: 0 }}>{Number(walletOverview?.levelBenefits || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ color: '#475569', fontWeight: 800, fontSize: { xs: '1rem', sm: '1.2rem' }, textTransform: 'uppercase', mb: 0.5 }}>Brokerage Override</Typography>
            <Typography variant="caption" sx={{ color: '#475569', display: 'block', lineHeight: 1.3, width: '100%', fontSize: '14px' }}>Every new level brings greater rewards—keep progressing and keep earning</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', p: { xs: 2, sm: 3 }, borderRadius: '20px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(239, 68, 68, 0.1)', display: 'flex', height: 'fit-content' }}>
              <TrendingUpIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: '#ef4444' }} />
            </Box>
            <Typography sx={{ color: '#0F172A', fontWeight: 900, fontSize: { xs: '1.3rem', sm: '1.6rem' }, letterSpacing: '1px', m: 0 }}>{Number(packageIncome || parseFloat(walletOverview?.singleLineIncome) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ color: '#475569', fontWeight: 800, fontSize: { xs: '1rem', sm: '1.2rem' }, textTransform: 'uppercase', mb: 0.5 }}>Direct Commission</Typography>
            <Typography variant="caption" sx={{ color: '#475569', display: 'block', lineHeight: 1.3, width: '100%', fontSize: '14px' }}>One growing network, multiple earning opportunities—powered by your single-leg structure.</Typography>
          </Box>
        </Box>



      </Box>
    </Box>
  );
};

export default PackageDetail;

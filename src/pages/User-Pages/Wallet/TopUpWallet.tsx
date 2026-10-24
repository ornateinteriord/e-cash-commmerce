import { Card, CardContent, Typography, Box, CircularProgress, IconButton } from '@mui/material';
import DataTable from "react-data-table-component";
import { useMediaQuery } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useNavigate } from 'react-router-dom';
import { DASHBOARD_CUTSOM_STYLE, getTopUpWalletColumns } from '../../../utils/DataTableColumnsProvider';
import TokenService from "../../../api/token/tokenService";
import { useGetWalletOverview } from '../../../api/Memeber';

const TopUpWallet = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");
  const memberId = TokenService.getMemberId();
  const { data: walletData, isLoading } = useGetWalletOverview(memberId);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', bgcolor: '#FFFFFF' }}>
        <CircularProgress sx={{ color: "#FE8001" }} />
      </Box>
    );
  }

  return (
    <Box sx={{
      pb: 10,
      background: '#FFFFFF',
      minHeight: '100vh',
      px: { xs: 2, sm: 3 },
      pt: { xs: 2.5, sm: 3.5 },
      maxWidth: '480px',
      margin: '0 auto'
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
            Top Up Wallet
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            Balance & deposit history
          </Typography>
        </Box>
      </Box>

      {/* Balance Card */}
      <Card sx={{
        mb: 3,
        borderRadius: '24px',
        bgcolor: '#ffffff',
        border: '1.5px solid #FED7AA',
        boxShadow: '0 8px 24px rgba(109, 33, 79, 0.06)',
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Available Top Up Balance
              </Typography>
              <Typography variant="h4" sx={{ color: '#FE8001', mt: 0.5, fontWeight: 900, letterSpacing: '0.5px' }}>
                ₹{Number(walletData?.topUpBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: '16px', bgcolor: 'rgba(254, 128, 1,  )', display: 'flex' }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#FE8001' }} />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ color: '#FE8001', fontWeight: 900, mb: 1.5, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Transaction History
        </Typography>
        <Card sx={{
          borderRadius: '20px',
          bgcolor: '#ffffff',
          border: '1.5px solid #FED7AA',
          boxShadow: '0 4px 16px rgba(109, 33, 79, 0.06)',
          overflow: 'hidden'
        }}>
          {walletData?.topUpTransactions && walletData.topUpTransactions.length > 0 ? (
            <DataTable
              columns={getTopUpWalletColumns()}
              data={walletData.topUpTransactions}
              pagination
              customStyles={DASHBOARD_CUTSOM_STYLE}
              paginationPerPage={isMobile ? 10 : 25}
              paginationRowsPerPageOptions={
                isMobile ? [10, 20, 50] : [25, 50, 100]
              }
              highlightOnHover
              responsive
            />
          ) : (
            <Box sx={{ textAlign: "center", py: 5, px: 2 }}>
              <Typography variant="subtitle1" sx={{ color: '#FE8001', fontWeight: 700 }}>
                No transactions found
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', mt: 0.5, display: 'block' }}>
                Your top-up transaction history will appear here
              </Typography>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default TopUpWallet;

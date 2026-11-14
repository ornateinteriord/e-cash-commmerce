import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Button,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TollIcon from '@mui/icons-material/Toll';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PeopleIcon from '@mui/icons-material/People';
import DataTable, { TableColumn } from 'react-data-table-component';
import TokenCoin from './TokenCoin';
import { DASHBOARD_CUTSOM_STYLE } from '../../utils/DataTableColumnsProvider';

export interface ContributorItem {
  level: number;
  id: string;
  member_code?: string;
  name: string;
  mobile?: string;
  email?: string;
  type?: 'Vendor' | 'Customer';
  tokensAwarded?: number;
  userToken?: number;
  status?: string;
  date?: string;
}

export interface UplinerItem {
  level: number;
  id: string;
  member_code?: string;
  name: string;
  mobile?: string;
  email?: string;
  type?: 'Vendor' | 'Customer';
  token?: number;
  rank_level?: number;
  status?: string;
  date_joined?: string;
}

interface UplinerDialogProps {
  open: boolean;
  onClose: () => void;
  entityType: 'Vendor' | 'Customer';
  target: {
    id?: string;
    member_code?: string;
    name?: string;
    mobile?: string;
    token?: number;
    status?: string;
  } | null;
  contributors?: ContributorItem[];
  isContributorsLoading?: boolean;
  uplines?: UplinerItem[];
  isUplinesLoading?: boolean;
  isLoading?: boolean;
}

export const UplinerDialog: React.FC<UplinerDialogProps> = ({
  open,
  onClose,
  entityType,
  target,
  contributors = [],
  isContributorsLoading = false,
  uplines = [],
  isUplinesLoading = false,
  isLoading = false,
}) => {
  const actualContributorsLoading = isContributorsLoading || isLoading;
  const actualUplinesLoading = isUplinesLoading || isLoading;
  const [activeTab, setActiveTab] = useState<number>(0);

  const isVendor = entityType === 'Vendor';
  const themeColor = isVendor ? '#0284c7' : '#0d9488';
  const themeBg = isVendor ? 'rgba(2, 132, 199, 0.08)' : 'rgba(13, 148, 136, 0.08)';

  // Columns for Token Contributors (Users who awarded tokens)
  const contributorColumns: TableColumn<ContributorItem>[] = [
    {
      name: '#',
      selector: (_row, index) => (index ?? 0) + 1,
      width: '45px',
      center: true,
    },
    {
      name: 'Level',
      selector: (row) => row.level,
      width: '100px',
      sortable: true,
      cell: (row) => (
        <Chip
          label={row.level === 1 ? 'Lvl 1 (Direct)' : `Level ${row.level}`}
          size="small"
          sx={{
            fontWeight: 800,
            fontSize: '0.7rem',
            height: '22px',
            bgcolor: row.level === 1 ? '#dcfce7' : '#f1f5f9',
            color: row.level === 1 ? '#15803d' : '#475569',
            border: row.level === 1 ? '1px solid #86efac' : 'none',
          }}
        />
      ),
    },
    {
      name: 'User ID',
      selector: (row) => row.member_code || row.id || '-',
      sortable: true,
      minWidth: '110px',
      cell: (row) => (
        <Typography sx={{ fontWeight: 800, color: themeColor, fontSize: '0.82rem' }}>
          {row.member_code || row.id || '-'}
        </Typography>
      ),
    },
    {
      name: 'Name',
      selector: (row) => row.name || '-',
      sortable: true,
      minWidth: '130px',
      cell: (row) => (
        <Box>
          <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.84rem', lineHeight: 1.2 }}>
            {row.name || '-'}
          </Typography>
          {row.email && row.email !== '-' && (
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>
              {row.email}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      name: 'Type',
      selector: (row) => row.type || 'Customer',
      width: '95px',
      center: true,
      cell: (row) => {
        const type = row.type || 'Customer';
        const isV = type === 'Vendor';
        return (
          <Chip
            icon={isV ? <StorefrontIcon sx={{ fontSize: '12px !important' }} /> : <PeopleIcon sx={{ fontSize: '12px !important' }} />}
            label={type}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.68rem',
              height: '22px',
              bgcolor: isV ? '#eff6ff' : '#f0fdfa',
              color: isV ? '#1d4ed8' : '#0f766e',
              border: `1px solid ${isV ? '#bfdbfe' : '#99f6e4'}`,
            }}
          />
        );
      },
    },
    {
      name: 'Mobile',
      selector: (row) => row.mobile || '-',
      minWidth: '115px',
      cell: (row) => (
        <Typography sx={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
          {row.mobile || '-'}
        </Typography>
      ),
    },
    {
      name: 'Awarded',
      selector: (row) => Number(row.tokensAwarded || 1),
      center: true,
      minWidth: '100px',
      cell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 0.3 }}>
          <TokenCoin value={1} size={18} />
          <Typography sx={{ fontWeight: 800, color: '#0f766e', fontSize: '0.82rem' }}>
            +{row.tokensAwarded || 1}
          </Typography>
        </Box>
      ),
    },
    {
      name: 'Tokens',
      selector: (row) => Number(row.userToken || 0),
      center: true,
      sortable: true,
      minWidth: '95px',
      cell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 0.3 }}>
          <TokenCoin value={Number(row.userToken || 0)} size={18} />
          <Typography sx={{ fontWeight: 800, color: '#0369a1', fontSize: '0.82rem' }}>
            {Number(row.userToken || 0)}
          </Typography>
        </Box>
      ),
    },
    {
      name: 'Status',
      selector: (row) => row.status || 'Active',
      center: true,
      width: '85px',
      cell: (row) => {
        const isActive = String(row.status || '').toLowerCase() === 'active';
        return (
          <Chip
            label={row.status || 'Active'}
            size="small"
            color={isActive ? 'success' : 'default'}
            variant={isActive ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700, fontSize: '0.68rem', height: '22px' }}
          />
        );
      },
    },
    {
      name: 'Date',
      selector: (row) => row.date || '-',
      width: '100px',
      cell: (row) => (
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.78rem' }}>
          {row.date ? new Date(row.date).toLocaleDateString() : '-'}
        </Typography>
      ),
    },
  ];

  // Columns for Upliner Hierarchy (Sponsors)
  const uplineColumns: TableColumn<UplinerItem>[] = [
    {
      name: '#',
      selector: (_row, index) => (index ?? 0) + 1,
      width: '45px',
      center: true,
    },
    {
      name: 'Level',
      selector: (row) => row.level,
      width: '105px',
      sortable: true,
      cell: (row) => (
        <Chip
          label={row.level === 1 ? 'Lvl 1 (Direct)' : `Level ${row.level}`}
          size="small"
          sx={{
            fontWeight: 800,
            fontSize: '0.7rem',
            height: '22px',
            bgcolor: row.level === 1 ? themeColor : '#f1f5f9',
            color: row.level === 1 ? '#ffffff' : '#475569',
          }}
        />
      ),
    },
    {
      name: 'User ID',
      selector: (row) => row.member_code || row.id || '-',
      sortable: true,
      minWidth: '110px',
      cell: (row) => (
        <Typography sx={{ fontWeight: 800, color: '#0284c7', fontSize: '0.82rem' }}>
          {row.member_code || row.id || '-'}
        </Typography>
      ),
    },
    {
      name: 'Name',
      selector: (row) => row.name || '-',
      sortable: true,
      minWidth: '130px',
      cell: (row) => (
        <Box>
          <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.84rem', lineHeight: 1.2 }}>
            {row.name || '-'}
          </Typography>
          {row.email && row.email !== '-' && (
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>
              {row.email}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      name: 'Type',
      selector: (row) => row.type || (isVendor ? 'Vendor' : 'Customer'),
      width: '95px',
      center: true,
      cell: (row) => {
        const type = row.type || (isVendor ? 'Vendor' : 'Customer');
        const isV = type === 'Vendor';
        return (
          <Chip
            icon={isV ? <StorefrontIcon sx={{ fontSize: '12px !important' }} /> : <PeopleIcon sx={{ fontSize: '12px !important' }} />}
            label={type}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.68rem',
              height: '22px',
              bgcolor: isV ? '#eff6ff' : '#f0fdfa',
              color: isV ? '#1d4ed8' : '#0f766e',
              border: `1px solid ${isV ? '#bfdbfe' : '#99f6e4'}`,
            }}
          />
        );
      },
    },
    {
      name: 'Mobile',
      selector: (row) => row.mobile || '-',
      minWidth: '115px',
      cell: (row) => (
        <Typography sx={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
          {row.mobile || '-'}
        </Typography>
      ),
    },
    {
      name: 'Tokens',
      selector: (row) => Number(row.token || 0),
      sortable: true,
      center: true,
      minWidth: '95px',
      cell: (row) => {
        const tokens = Number(row.token || 0);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TokenCoin value={tokens} size={18} />
            <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: tokens > 0 ? '#0f766e' : '#64748b' }}>
              {tokens}
            </Typography>
          </Box>
        );
      },
    },
    {
      name: 'Status',
      selector: (row) => row.status || 'Active',
      center: true,
      width: '85px',
      cell: (row) => {
        const isActive = String(row.status || '').toLowerCase() === 'active';
        return (
          <Chip
            label={row.status || 'Active'}
            size="small"
            color={isActive ? 'success' : 'default'}
            variant={isActive ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700, fontSize: '0.68rem', height: '22px' }}
          />
        );
      },
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          m: { xs: 1, sm: 2 },
          width: { xs: 'calc(100% - 16px)', sm: '100%' },
          borderRadius: { xs: '14px', sm: '18px' },
          boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
          maxHeight: { xs: '94vh', sm: '90vh' },
          overflow: 'hidden',
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          m: 0,
          p: { xs: 1.5, sm: 2 },
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
          <Box
            sx={{
              p: { xs: 0.8, sm: 1.1 },
              borderRadius: '10px',
              bgcolor: themeBg,
              color: themeColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <TollIcon sx={{ fontSize: { xs: 22, sm: 26 } }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                fontSize: { xs: '0.96rem', sm: '1.2rem' },
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Token Earnings & Hierarchy
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#64748b',
                fontWeight: 500,
                fontSize: '0.72rem',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Inspect users who awarded tokens and upline referral hierarchy
            </Typography>
          </Box>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{
            color: '#94a3b8',
            p: 0.8,
            '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 1.5, sm: 2.2 }, bgcolor: '#f8fafc' }}>
        {/* Selected Target Profile Banner */}
        {target && (
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              mb: 1.8,
              borderRadius: '12px',
              bgcolor: '#ffffff',
              border: `1.5px solid ${isVendor ? '#bae6fd' : '#99f6e4'}`,
            }}
          >
            {/* Top Row: User Identity */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3, flexWrap: 'wrap' }}>
                  <Chip
                    label={entityType}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      height: '20px',
                      bgcolor: themeColor,
                      color: '#ffffff',
                    }}
                  />
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 900,
                      color: '#0f172a',
                      fontSize: { xs: '0.92rem', sm: '1.05rem' },
                    }}
                  >
                    {target.name || 'N/A'}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>
                  ID: <strong style={{ color: themeColor }}>{target.member_code || target.id || 'N/A'}</strong>
                  {target.mobile && (
                    <span style={{ marginLeft: '10px' }}>
                      Ph: <strong>{target.mobile}</strong>
                    </span>
                  )}
                </Typography>
              </Box>
            </Box>

            {/* Bottom Row: 3 Clean Summary Stats (Responsive Grid) */}
            <Box
              sx={{
                mt: 1.4,
                pt: 1.2,
                borderTop: '1px dashed #e2e8f0',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: { xs: 0.8, sm: 1.5 },
              }}
            >
              {/* Stat 1: Total Tokens */}
              <Box
                sx={{
                  textAlign: 'center',
                  p: { xs: 0.8, sm: 1 },
                  bgcolor: '#f0fdfa',
                  borderRadius: '10px',
                  border: '1px solid #ccfbf1',
                }}
              >
                <Typography sx={{ color: '#0f766e', fontSize: { xs: '0.66rem', sm: '0.74rem' }, fontWeight: 700 }}>
                  Total Tokens
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.4, mt: 0.2 }}>
                  <TokenCoin value={target.token || 0} size={18} />
                  <Typography sx={{ fontWeight: 900, color: '#0f766e', fontSize: { xs: '0.95rem', sm: '1.15rem' } }}>
                    {target.token ?? 0}
                  </Typography>
                </Box>
              </Box>

              {/* Stat 2: Downlines Count */}
              <Box
                sx={{
                  textAlign: 'center',
                  p: { xs: 0.8, sm: 1 },
                  bgcolor: '#f0fdf4',
                  borderRadius: '10px',
                  border: '1px solid #dcfce7',
                }}
              >
                <Typography sx={{ color: '#15803d', fontSize: { xs: '0.66rem', sm: '0.74rem' }, fontWeight: 700 }}>
                  Downlines
                </Typography>
                <Typography sx={{ fontWeight: 900, color: '#16a34a', fontSize: { xs: '0.95rem', sm: '1.15rem' }, mt: 0.2 }}>
                  {actualContributorsLoading ? '...' : contributors.length}
                </Typography>
              </Box>

              {/* Stat 3: Tokens Sum */}
              <Box
                sx={{
                  textAlign: 'center',
                  p: { xs: 0.8, sm: 1 },
                  bgcolor: '#eff6ff',
                  borderRadius: '10px',
                  border: '1px solid #dbeafe',
                }}
              >
                <Typography sx={{ color: '#1d4ed8', fontSize: { xs: '0.66rem', sm: '0.74rem' }, fontWeight: 700 }}>
                  Tokens Sum
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.4, mt: 0.2 }}>
                  <TokenCoin value={1} size={16} />
                  <Typography sx={{ fontWeight: 900, color: '#0284c7', fontSize: { xs: '0.95rem', sm: '1.15rem' } }}>
                    {actualContributorsLoading ? '...' : contributors.reduce((sum, c) => sum + (Number(c.userToken) || 0), 0)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Tab Selection */}
        <Box sx={{ mb: 1.5, bgcolor: '#ffffff', borderRadius: '10px', p: 0.4, border: '1px solid #e2e8f0' }}>
          <Tabs
            value={activeTab}
            onChange={(_e, val) => setActiveTab(val)}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            sx={{
              minHeight: '36px',
              '& .MuiTab-root': {
                minHeight: '36px',
                py: 0.5,
                px: { xs: 0.8, sm: 2 },
                fontWeight: 800,
                fontSize: { xs: '0.74rem', sm: '0.84rem' },
                textTransform: 'none',
                borderRadius: '8px',
              },
            }}
          >
            <Tab
              icon={<TollIcon sx={{ fontSize: { xs: '15px !important', sm: '18px !important' } }} />}
              iconPosition="start"
              label={`Contributors (${contributors.length})`}
            />
            <Tab
              icon={<AccountTreeIcon sx={{ fontSize: { xs: '15px !important', sm: '18px !important' } }} />}
              iconPosition="start"
              label={`Upliners (${uplines.length})`}
            />
          </Tabs>
        </Box>

        {/* Tab 0: Token Contributors */}
        {activeTab === 0 && (
          <Box
            sx={{
              borderRadius: '12px',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
            {actualContributorsLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5, gap: 1.5 }}>
                <CircularProgress size={32} sx={{ color: themeColor }} />
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.82rem' }}>
                  Loading token contributors...
                </Typography>
              </Box>
            ) : (
              <DataTable
                columns={contributorColumns}
                data={contributors}
                customStyles={DASHBOARD_CUTSOM_STYLE}
                pagination={contributors.length > 10}
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 20, 50]}
                highlightOnHover
                responsive
                noDataComponent={
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <TollIcon sx={{ fontSize: 36, color: '#cbd5e1', mb: 1 }} />
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700 }}>
                      No token contributors found.
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      Tokens are awarded when downlines register under this referral code.
                    </Typography>
                  </Box>
                }
              />
            )}
          </Box>
        )}

        {/* Tab 1: Upliner Hierarchy */}
        {activeTab === 1 && (
          <Box
            sx={{
              borderRadius: '12px',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
            {actualUplinesLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5, gap: 1.5 }}>
                <CircularProgress size={32} sx={{ color: themeColor }} />
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.82rem' }}>
                  Loading upliners...
                </Typography>
              </Box>
            ) : (
              <DataTable
                columns={uplineColumns}
                data={uplines}
                customStyles={DASHBOARD_CUTSOM_STYLE}
                pagination={uplines.length > 10}
                paginationPerPage={10}
                highlightOnHover
                responsive
                noDataComponent={
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <AccountTreeIcon sx={{ fontSize: 36, color: '#cbd5e1', mb: 1 }} />
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700 }}>
                      No upliners found.
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      This is a direct root registration.
                    </Typography>
                  </Box>
                }
              />
            )}
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: { xs: 1.2, sm: 1.8 }, px: { xs: 1.5, sm: 2.2 }, bgcolor: '#ffffff', justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.72rem' }}>
          💡 Showing referral chain up to 20 levels
        </Typography>
        <Button
          onClick={onClose}
          variant="contained"
          size="small"
          sx={{
            borderRadius: '8px',
            bgcolor: '#0f172a',
            color: '#ffffff',
            fontWeight: 700,
            textTransform: 'none',
            px: 2,
            py: 0.6,
            fontSize: '0.82rem',
            '&:hover': { bgcolor: '#334155' },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UplinerDialog;

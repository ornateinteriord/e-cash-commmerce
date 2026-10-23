import { Box, Grid, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from './DashboardCard';
import DescriptionIcon from '@mui/icons-material/Description';
import StorageIcon from '@mui/icons-material/Storage';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import CloseIcon from '@mui/icons-material/Close';
import DashboardTable from './DashboardTable';
import TimelineComponent from '../../../utils/TimeLineComponent';
import { DashboardCounts, RecentData, AccountByType } from '../../../types';
import type { Member, Account } from '../../../types';

interface DashboardCardsProps {
  counts: DashboardCounts;
  recentData: RecentData;
}

const DashboardCards = ({ counts, recentData }: DashboardCardsProps) => {
  const navigate = useNavigate();
  const [accountTypesDialogOpen, setAccountTypesDialogOpen] = useState(false);

  // Format recent members data for table
  const membersData = (recentData?.recentMembers || []).map((member: Member) => ({
    name: member?.name || 'N/A',
    memberNum: member?.member_id || 'N/A',
    dateOfJoining: member?.date_of_joining
      ? new Date(member.date_of_joining).toLocaleDateString('en-GB')
      : 'N/A',
    emailId: member?.emailid || '',
    mobileNo: member?.contactno || 'N/A',
    status: member?.status || 'active',
  }));

  // Format recent accounts data for timeline
  const accountsTimelineData = (recentData?.recentAccounts || []).map((account: Account) => ({
    title: 'Account',
    highlight: account?.account_no || account?.account_id || 'N/A',
    date: account?.date_of_opening
      ? `Created On ${new Date(account.date_of_opening).toLocaleDateString('en-GB')}`
      : 'N/A',
  }));

  // Table columns configuration
  const membersColumns = [
    {
      name: 'Name',
      selector: (row: any) => row.name,
      sortable: true,
      style: {
        fontWeight: '600',
        color: '#1a202c',
      },
    },
    {
      name: 'Vendor Num',
      selector: (row: any) => row.memberNum,
      sortable: true,
      center: true,
      style: {
        color: '#6366f1',
        fontWeight: '500',
      },
    },
    {
      name: 'Date Of Joining',
      selector: (row: any) => row.dateOfJoining,
      sortable: true,
      center: true,
    },
    {
      name: 'Email id',
      selector: (row: any) => row.emailId,
      sortable: true,
    },
    {
      name: 'Mobile no',
      selector: (row: any) => row.mobileNo,
      sortable: true,
      center: true,
    },
    {
      name: 'Status',
      selector: (row: any) => row.status,
      sortable: true,
      center: true,
      cell: (row: any) => (
        <Box
          sx={{
            px: 2,
            py: 0.75,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.75rem',
            textAlign: 'center',
            minWidth: '70px',
            boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
          }}
        >
          {row.status.toUpperCase()}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Stats Cards Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Total Vendors Card */}
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            icon={<SupervisorAccountIcon sx={{ color: 'white' }} />}
            title="Total Vendors"
            status="Active"
            description={`${counts.totalMembers} Vendors`}
            sx={{
              background: '#667eea',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          />
        </Grid>

        {/* Total Accounts Card */}
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            icon={<DescriptionIcon sx={{ color: 'white' }} />}
            title="Total Accounts"
            status="Active"
            description={`${counts.totalAccounts} Accounts`}
            showActionButton={true}
            actionButtonLabel="More"
            onActionClick={() => setAccountTypesDialogOpen(true)}
            sx={{
              background: '#667eea',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          />
        </Grid>

        {/* Total Agents Card */}
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            icon={<SupervisorAccountIcon sx={{ color: 'white' }} />}
            title="Total Agents"
            status="Active"
            description={`${counts.totalAgents} Agents`}
            sx={{
              background: '#667eea',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          />
        </Grid>

        {/* Cash Balance Card */}
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            icon={<SupervisorAccountIcon sx={{ color: 'white' }} />}
            title="Cash Balance"
            status="Active"
            description={`${counts.closingBalance || 0}`}
            sx={{
              background: '#667eea',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          />
        </Grid>
      </Grid>

      {/* Second Row with Two Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Vendors Card with Table as Footer */}
        <Grid item xs={12} md={8}>
          <DashboardCard
            icon={<StorageIcon sx={{ color: 'white' }} />}
            title="Vendors"
            status="Summary of recent vendors"
            showActionButton={true}
            actionButtonLabel="More Information"
            onActionClick={() => navigate('/admin_01/members')}
            showFooterContent={true}
            footerContent={
              <Box sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                mt: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.1)',
              }}>
                <DashboardTable
                  data={membersData}
                  columns={membersColumns}
                  sx={{
                    '& .rdt_Table': {
                      borderRadius: '12px',
                    },
                    '& .rdt_TableHead': {
                      background: '#667eea',
                      '& .rdt_TableCol': {
                        color: '#4b5563',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        borderBottom: '2px solid rgba(99, 102, 241, 0.2)',
                      }
                    },
                    '& .rdt_TableRow': {
                      '&:nth-of-type(even)': {
                        background: 'rgba(99, 102, 241, 0.02)',
                      },
                      '&:hover': {
                        background: 'rgba(99, 102, 241, 0.04)',
                      }
                    }
                  }}
                />
              </Box>
            }
            sx={{
              background: '#667eea',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          />
        </Grid>

        {/* Accounts Card with Timeline as Footer */}
        <Grid item xs={12} md={4}>
          <DashboardCard
            icon={<DescriptionIcon sx={{ color: 'white' }} />}
            title="Accounts"
            status="Latest created accounts"
            showFooterContent={true}
            footerContent={
              <Box sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                mt: 2,
                p: 3,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.1)',
              }}>
                <TimelineComponent
                  data={accountsTimelineData}
                  sx={{
                    '& .timeline-item': {
                      borderLeft: '3px solid #667eea',
                      paddingLeft: '16px',
                      '&:hover': {
                        background: 'rgba(99, 102, 241, 0.04)',
                        borderRadius: '8px',
                      }
                    }
                  }}
                />
              </Box>
            }
            sx={{
              background: '#667eea',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          />
        </Grid>
      </Grid>

      {/* Account Types Breakdown Dialog */}
      <Dialog
        open={accountTypesDialogOpen}
        onClose={() => setAccountTypesDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: '#667eea',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: '#667eea',
            color: 'white',
            position: 'relative',
            py: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DescriptionIcon sx={{ fontSize: 32 }} />
              <Box>
                <Box sx={{ fontSize: '24px', fontWeight: 700 }}>Account Types Breakdown</Box>
                <Box sx={{ fontSize: '14px', opacity: 0.9, mt: 0.5 }}>
                  Detailed count for each account type
                </Box>
              </Box>
            </Box>
            <IconButton
              onClick={() => setAccountTypesDialogOpen(false)}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3, mt: 2 }}>
          <Grid container spacing={2}>
            {(counts?.accountsByType || []).map((accountType: AccountByType, index: number) => {
              // Define gradient colors for different account types
              const gradients = [
                'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
                'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                'linear-gradient(135deg, #f43f5e 0%, #ef4444 100%)',
                'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
                'linear-gradient(135deg, #FFD700 0%, #6366f1 100%)',
                'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              ];

              return (
                <Grid item xs={12} sm={6} md={4} key={accountType.account_type || index}>
                  <Box
                    sx={{
                      background: gradients[index % gradients.length],
                      borderRadius: '12px',
                      p: 3,
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box
                        sx={{
                          fontSize: '14px',
                          opacity: 0.9,
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {accountType.account_group_name || 'Unknown'}
                      </Box>
                      <Box
                        sx={{
                          fontSize: '32px',
                          fontWeight: 700,
                          lineHeight: 1,
                        }}
                      >
                        {accountType.count}
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* Summary Box */}
          <Box
            sx={{
              mt: 3,
              p: 3,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
              border: '2px solid #d1d5db',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Box sx={{ fontSize: '16px', fontWeight: 600, color: '#374151', mb: 0.5 }}>
                  Total Account Types
                </Box>
                <Box sx={{ fontSize: '14px', color: '#6b7280' }}>
                  {counts.accountsByType.length} different types
                </Box>
              </Box>
              <Box
                sx={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color: '#6366f1',
                }}
              >
                {counts.totalAccounts}
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DashboardCards;

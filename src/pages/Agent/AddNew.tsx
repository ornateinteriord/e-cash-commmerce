import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button, Box, Grid, CircularProgress, Divider, InputAdornment,  } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { toast } from 'react-toastify';
import { useGetAccountGroups, useGetInterestsByAccountGroup, useGetMemberById, useCreateAccountByAgent,  } from '../../queries/admin';
import { useGetAgentById } from '../../queries/Agent';
import TokenService from '../../queries/token/tokenService';

// Modern Input Styles - Blue Theme (Member Section)
const memberInputStyle = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    borderRadius: 2,
    fontWeight: 500,
    '& fieldset': {
      borderColor: 'rgba(26, 35, 126, 0.25)',
      borderWidth: '1.5px',
    },
    '&:hover fieldset': {
      borderColor: '#1a237e',
      borderWidth: '1.5px',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1a237e',
      borderWidth: '2.5px',
      boxShadow: '0 0 0 3px rgba(26, 35, 126, 0.1)',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#1a237e',
      fontWeight: 600,
    },
  },
};

// Modern Input Styles - Green Theme (Account Section)
const accountInputStyle = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    borderRadius: 2,
    fontWeight: 500,
    '& fieldset': {
      borderColor: 'rgba(22, 101, 52, 0.25)',
      borderWidth: '1.5px',
    },
    '&:hover fieldset': {
      borderColor: '#166534',
      borderWidth: '1.5px',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#166534',
      borderWidth: '2.5px',
      boxShadow: '0 0 0 3px rgba(22, 101, 52, 0.1)',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#166534',
      fontWeight: 600,
    },
  },
};

const AddNew: React.FC = () => {
  const agentId = TokenService.getMemberId()
  const role = TokenService.getRole()

  const [memberId, setMemberId] = useState('');
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [accountGroupId, setAccountGroupId] = useState<string>('');

  // State for introducer auto-population
  const [introducerCode, setIntroducerCode] = useState<string>('');
  const [shouldFetchAgent, setShouldFetchAgent] = useState<boolean>(false);
  const [agentError, setAgentError] = useState<boolean>(false);

  const [form, setForm] = useState<any>({
    accountType: '',
    accountOperation: 'Single',
    openingDate: new Date().toISOString().split('T')[0],
    interestSlab: '',
    interestRate: '',
    duration: '',
    amount: '',
    maturityDate: '',
    maturityValue: '',
    introducer: '',
    introducerName: '',
    agent: role === "AGENT" ? agentId : "",
    jointMember: '',
  });

  // Fetch account groups
  const { data: accountGroupsData } = useGetAccountGroups();

  // Fetch member info when requested
  const { isLoading: loadingMember, refetch: fetchMember } = useGetMemberById(
    memberId,
    false // Don't auto-fetch
  );

  // Fetch interests based on account group ID
  const { data: interestsData, isLoading: loadingInterests } = useGetInterestsByAccountGroup(
    accountGroupId,
    !!accountGroupId
  );

  // Fetch agent data when introducer code is entered and onBlur triggered (using agent API)
  const { data: agentData, isLoading: isLoadingAgent, isError: isAgentError } = useGetAgentById(
    introducerCode,
    shouldFetchAgent && !!introducerCode && introducerCode.length > 0
  );

  // Create account mutation
  const createAccountMutation = useCreateAccountByAgent();

  // Update account group ID when account type changes
  useEffect(() => {
    if (form.accountType && accountGroupsData?.data) {
      const matchingGroup = accountGroupsData.data.find(
        (group: any) => group.account_group_id === form.accountType
      );
      if (matchingGroup) {
        setAccountGroupId(matchingGroup.account_group_id);
      }
    }
  }, [form.accountType, accountGroupsData]);

  // Auto-populate introducer name when agent data is fetched
  useEffect(() => {
    if (agentData?.data?.name) {
      setForm((prev: any) => ({
        ...prev,
        introducerName: agentData.data.name || ''
      }));
      setAgentError(false);
      // Reset fetch trigger after successful fetch
      setShouldFetchAgent(false);
    } else if (isAgentError && shouldFetchAgent) {
      // Agent not found
      setAgentError(true);
      setForm((prev: any) => ({
        ...prev,
        introducerName: ''
      }));
      setShouldFetchAgent(false);
    }
  }, [agentData, isAgentError, shouldFetchAgent]);

  // Handle member info fetch
  const handleGetInfo = async () => {
    if (!memberId) {
      toast.error('Please enter a vendor ID/code');
      return;
    }

    try {
      const result = await fetchMember();
      if (result.data?.success && result.data.data) {
        const member = result.data.data;
        setMemberInfo(member);

        // Auto-populate fields from member data
        setForm((prev: any) => ({
          ...prev,
          introducer: member.introducer || '',
          introducerName: member.introducer_name || '',
        }));

        toast.success('Vendor information loaded successfully');
      } else {
        toast.error('Vendor not found');
        setMemberInfo(null);
      }
    } catch (error) {
      toast.error('Failed to fetch vendor information');
      setMemberInfo(null);
    }
  };

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));

    // If introducer code is changed, update the introducer code state
    if (field === 'introducer') {
      setIntroducerCode(value);
      setAgentError(false); // Clear error when user types
      // Clear introducer name and stop fetching if code is cleared
      if (!value) {
        setShouldFetchAgent(false);
        setForm((prev: any) => ({
          ...prev,
          introducerName: ''
        }));
      }
    }
  };

  // Handle onBlur for introducer field to trigger API call
  const handleIntroducerBlur = () => {
    if (form.introducer && form.introducer.trim().length > 0) {
      setIntroducerCode(form.introducer.trim());
      setShouldFetchAgent(true);
    }
  };

  // Handle interest slab selection
  const handleInterestSlabChange = (interestId: string) => {
    setForm((prev: any) => ({ ...prev, interestSlab: interestId }));

    if (interestsData?.data) {
      const interest = interestsData.data.find((i: any) => i.interest_id === interestId);
      if (interest) {
        // Auto-populate related fields
        const interestRate = interest.interest_rate || 0;
        const duration = interest.duration || 0;

        // Calculate maturity date (opening date + duration months)
        let maturityDate = '';
        if (form.openingDate && duration > 0) {
          const openDate = new Date(form.openingDate);
          openDate.setMonth(openDate.getMonth() + duration);
          maturityDate = openDate.toISOString().split('T')[0];
        }

        setForm((prev: any) => ({
          ...prev,
          interestRate: interestRate.toString(),
          duration: duration.toString(),
          maturityDate,
          maturityValue: '', // Placeholder for now
        }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!memberInfo) {
      toast.error('Please fetch vendor information first');
      return;
    }

    if (!form.accountType) {
      toast.error('Please select an account type');
      return;
    }

    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (form.accountOperation === 'Any two' && !form.jointMember) {
      toast.error('Please enter joint vendor details');
      return;
    }

    try {
      const accountData = {
        branch_id: memberInfo.branch_id,
        date_of_opening: form.openingDate,
        member_id: memberId,
        account_type: form.accountType, // Send account_group_id
        account_operation: form.accountOperation,
        introducer: form.introducer,
        entered_by: role === "AGENT" ? (agentId || undefined) : undefined, // Agent as entered_by
        ref_id: form.interestSlab, // interest_id
        interest_rate: parseFloat(form.interestRate) || 0,
        duration: parseInt(form.duration) || 0,
        date_of_maturity: form.maturityDate || null,
        assigned_to: role === "AGENT" ? (agentId || undefined) : undefined, // Agent ID
        account_amount: parseFloat(form.amount),
        joint_member: form.accountOperation === 'Any two' ? form.jointMember : null,
      };

      const result = await createAccountMutation.mutateAsync(accountData);

      if (result?.success) {
        toast.success('Account created successfully!');
        // Reset form
        setMemberId('');
        setMemberInfo(null);
        setAccountGroupId('');
        setForm({
          accountType: '',
          accountOperation: 'Single',
          openingDate: new Date().toISOString().split('T')[0],
          interestSlab: '',
          interestRate: '',
          duration: '',
          amount: '',
          maturityDate: '',
          maturityValue: '',
          introducer: '',
          introducerName: '',
          agent: role === "AGENT" ? agentId : "",
          jointMember: '',
        });
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create account');
    }
  };

  // Declare data arrays first
  const accountGroups = accountGroupsData?.data || [];
  const interests = interestsData?.data || [];

  // Determine if interest fields should be shown based on account type name
  const selectedAccountGroup = accountGroups.find((group: any) => group.account_group_id === form.accountType);
  const showInterestFields = selectedAccountGroup && ['SB', 'FD', 'PIGMY', 'RD', 'MIS'].includes(selectedAccountGroup?.account_group_name || '');

  return (
    <Box sx={{ mt: { xs: 8, sm: 10 }, px: { xs: 1.5, sm: 2, md: 3 }, pb: 4 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: '#1a237e',
          mb: 3,
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
        }}
      >
        Account Opening (Agent)
      </Typography>
      <Card sx={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        borderRadius: '16px',
      }}>
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Grid container spacing={4}>
            {/* Member Information Section */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                bgcolor: '#f0f7ff',
                p: 3,
                borderRadius: 2,
                border: '1px solid #e3f2fd',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <PersonIcon sx={{ color: '#6366f1', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                    Member Information
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      placeholder="Vendor ID/Code"
                      size="small"
                      fullWidth
                      value={memberId}
                      onChange={(e) => setMemberId(e.target.value)}
                      label="Vendor ID/Code"
                      sx={memberInputStyle}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="contained"
                      size="medium"
                      fullWidth
                      onClick={handleGetInfo}
                      disabled={loadingMember || !memberId}
                      sx={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                        fontWeight: 600,
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)',
                          boxShadow: '0 6px 16px rgba(79, 70, 229, 0.4)',
                        },
                        '&:disabled': {
                          background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
                          boxShadow: 'none',
                        },
                      }}
                    >
                      {loadingMember ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Get Info'}
                    </Button>
                  </Grid>

                  {/* Display member info when loaded */}
                  {memberInfo && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          label="Vendor Name"
                          fullWidth
                          size="small"
                          value={memberInfo.name || ''}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Contact No"
                          fullWidth
                          size="small"
                          value={memberInfo.contactno || ''}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Email ID"
                          fullWidth
                          size="small"
                          value={memberInfo.emailid || ''}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            </Grid>

            {/* Account Information Section */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                bgcolor: '#f0fdf4',
                p: 3,
                borderRadius: 2,
                border: '1px solid #dcfce7',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <AccountBalanceIcon sx={{ color: '#10b981', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                    Account Information
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small" sx={accountInputStyle}>
                      <InputLabel id="account-type-label">Account Type</InputLabel>
                      <Select
                        labelId="account-type-label"
                        label="Account Type"
                        value={form.accountType}
                        onChange={(e) => handleChange('accountType', e.target.value)}
                      >
                        <MenuItem value="">Select Account Type</MenuItem>
                        {accountGroups
                          .filter((group: any) => ['SB', 'FD', 'PIGMY'].includes(group.account_group_name))
                          .map((group: any) => (
                            <MenuItem key={group.account_group_id} value={group.account_group_id}>
                              {group.account_group_name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small" sx={accountInputStyle}>
                      <InputLabel id="account-op-label">Account Operation</InputLabel>
                      <Select
                        labelId="account-op-label"
                        label="Account Operation"
                        value={form.accountOperation}
                        onChange={(e) => handleChange('accountOperation', e.target.value)}
                      >
                        <MenuItem value="Single">Single</MenuItem>
                        <MenuItem value="Any two">Any two</MenuItem>
                        <MenuItem value="Anyone">Anyone</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Conditional Joint Member Field */}
                  {form.accountOperation === 'Any two' && (
                    <Grid item xs={12}>
                      <TextField
                        label="Joint Vendor"
                        fullWidth
                        size="small"
                        value={form.jointMember}
                        onChange={(e) => handleChange('jointMember', e.target.value)}
                        placeholder="Joint vendor"
                        sx={accountInputStyle}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Opening Date"
                      type="date"
                      fullWidth
                      size="small"
                      value={form.openingDate}
                      onChange={(e) => handleChange('openingDate', e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      sx={accountInputStyle}
                    />
                  </Grid>

                  {showInterestFields && (
                    <>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="small" sx={accountInputStyle}>
                          <InputLabel id="interest-slab-label">Interest Slab</InputLabel>
                          <Select
                            labelId="interest-slab-label"
                            label="Interest Slab"
                            value={form.interestSlab}
                            onChange={(e) => handleInterestSlabChange(e.target.value)}
                            disabled={loadingInterests || interests.length === 0}
                          >
                            <MenuItem value="">Select Interest Slab</MenuItem>
                            {interests.map((interest: any) => (
                              <MenuItem key={interest.interest_id} value={interest.interest_id}>
                                {interest.interest_name || `${interest.duration} Months - ${interest.interest_rate}%`}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {!loadingInterests && interests.length === 0 && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#000000ff',
                              display: 'block',
                              mt: 0.5,
                              fontWeight: 500,
                            }}
                          >
                            Note : No interest slabs available for this account type
                          </Typography>
                        )}
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Interest Rate"
                          fullWidth
                          size="small"
                          value={form.interestRate}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Duration (Months)"
                          fullWidth
                          size="small"
                          value={form.duration}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Amount"
                      fullWidth
                      size="small"
                      type="number"
                      value={form.amount}
                      onChange={(e) => handleChange('amount', e.target.value)}
                      sx={accountInputStyle}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Introducer"
                      fullWidth
                      size="small"
                      value={form.introducer}
                      onChange={(e) => handleChange('introducer', e.target.value)}
                      onBlur={handleIntroducerBlur}
                      error={agentError}
                      helperText={agentError ? 'Agent not found' : ''}
                      InputProps={{
                        endAdornment: isLoadingAgent ? (
                          <InputAdornment position="end">
                            <CircularProgress size={20} />
                          </InputAdornment>
                        ) : null,
                      }}
                      sx={accountInputStyle}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Introducer Name"
                      fullWidth
                      size="small"
                      value={form.introducerName}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Agent ID"
                      fullWidth
                      size="small"
                      value={form.agent}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 3 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}
                        disabled={!memberInfo || createAccountMutation.isPending}
                        sx={{
                          background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                          px: 4,
                          py: 1.5,
                          fontWeight: 600,
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                            boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                          },
                        }}
                      >
                        {createAccountMutation.isPending ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Create Account'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddNew;

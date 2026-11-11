import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Chip,
  MenuItem,
  Stack,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BoltIcon from '@mui/icons-material/Bolt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import moment from 'moment';
import { useTriggerDailyROI } from '../../api/Admin';

export interface TriggerMissingROIDialogProps {
  open: boolean;
  onClose: () => void;
  defaultType?: 'all' | 'daily_incentive' | 'level_roi';
  pageTitle?: string;
}

export const TriggerMissingROIDialog: React.FC<TriggerMissingROIDialogProps> = ({
  open,
  onClose,
  defaultType = 'all',
  pageTitle,
}) => {
  // Default to yesterday as most missing payout runs target yesterday or a specific past date
  const defaultDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [payoutType, setPayoutType] = useState<'all' | 'daily_incentive' | 'level_roi'>(defaultType);
  const [specificDateOnly, setSpecificDateOnly] = useState<boolean>(true);
  const [memberId, setMemberId] = useState<string>('');
  const [executionResult, setExecutionResult] = useState<any>(null);

  const triggerMutation = useTriggerDailyROI();

  const handleRun = async () => {
    if (!selectedDate) return;
    setExecutionResult(null);

    try {
      const response: any = await triggerMutation.mutateAsync({
        date: selectedDate,
        specificDateOnly,
        type: payoutType,
        memberId: memberId.trim() || undefined,
      });

      setExecutionResult(response);
    } catch (err: any) {
      console.error('Error triggering ROI:', err);
    }
  };

  const handleClose = () => {
    setExecutionResult(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          m: 0,
          p: 2.5,
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              backgroundColor: 'rgba(234, 179, 8, 0.2)',
              color: '#facc15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BoltIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
              Trigger Missing Payouts
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              {pageTitle ? `For ${pageTitle}` : 'Process missing Daily Incentive & ROI transactions'}
            </Typography>
          </Box>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: '#94a3b8',
            '&:hover': { color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Alert
            severity="info"
            icon={<InfoOutlinedIcon fontSize="inherit" />}
            sx={{
              borderRadius: '10px',
              fontSize: '0.82rem',
              backgroundColor: '#eff6ff',
              color: '#1e40af',
              border: '1px solid #bfdbfe',
            }}
          >
            Safely adds missing transactions for eligible members on the chosen date. If a member or schedule
            already received their payout on that date, it is automatically skipped to prevent any duplicates.
          </Alert>

          {/* Date Picker */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
              TARGET DATE <span style={{ color: '#ef4444' }}>*</span>
            </Typography>
            <TextField
              type="date"
              fullWidth
              size="small"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <CalendarMonthIcon sx={{ color: '#64748b', mr: 1, fontSize: 20 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
            <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
              Only members and schedules active on or before this date will be evaluated.
            </Typography>
          </Box>

          {/* Payout Category Selection */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
              PAYOUT CATEGORY
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={payoutType}
              onChange={(e: any) => setPayoutType(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            >
              <MenuItem value="all">All Payouts (Daily Incentive + Vendor Level Benefits)</MenuItem>
              <MenuItem value="daily_incentive">Daily Incentive Only (1% Primary & Addon)</MenuItem>
              <MenuItem value="level_roi">Vendor Level Benefits Only (100 Days Multi-level)</MenuItem>
            </TextField>
          </Box>

          {/* Member ID (Optional) */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
              SPECIFIC MEMBER ID (OPTIONAL)
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. BMS00001 (leave empty for all members)"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Box>

          {/* Specific Date Only Checkbox */}
          <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={specificDateOnly}
                  onChange={(e) => setSpecificDateOnly(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    Process for this particular date only
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Only credits missing transactions for {selectedDate || 'the selected date'} without backfilling other missed dates.
                  </Typography>
                </Box>
              }
            />
          </Box>

          {/* Result Feedback Summary */}
          {executionResult && (
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                bgcolor: executionResult.success ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${executionResult.success ? '#bbf7d0' : '#fecaca'}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircleIcon sx={{ color: executionResult.success ? '#16a34a' : '#dc2626', fontSize: 20 }} />
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: executionResult.success ? '#166534' : '#991b1b',
                  }}
                >
                  {executionResult.message || 'Execution Complete'}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                <Chip
                  label={`Total Added: ${executionResult.processedCount ?? 0}`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    bgcolor: executionResult.processedCount > 0 ? '#dcfce7' : '#f1f5f9',
                    color: executionResult.processedCount > 0 ? '#15803d' : '#64748b',
                  }}
                />
                <Chip
                  label={`Primary: ${executionResult.baseProcessedCount ?? 0}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Add-ons: ${executionResult.addonProcessedCount ?? 0}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Vendor Level Benefits: ${executionResult.levelRoiProcessedCount ?? 0}`}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="inherit"
          disabled={triggerMutation.isPending}
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
        >
          {executionResult ? 'Close' : 'Cancel'}
        </Button>
        <Button
          onClick={handleRun}
          variant="contained"
          disabled={!selectedDate || triggerMutation.isPending}
          startIcon={
            triggerMutation.isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <BoltIcon />
            )
          }
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
            },
          }}
        >
          {triggerMutation.isPending ? 'Processing...' : 'Add Missing Transactions'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export interface TriggerMissingROIButtonProps {
  defaultType?: 'all' | 'daily_incentive' | 'level_roi';
  pageTitle?: string;
  label?: string;
}

export const TriggerMissingROIButton: React.FC<TriggerMissingROIButtonProps> = ({
  defaultType = 'all',
  pageTitle,
  label = 'Trigger Missing Payout',
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="contained"
        size="small"
        onClick={() => setOpen(true)}
        startIcon={<BoltIcon />}
        sx={{
          borderRadius: '10px',
          textTransform: 'none',
          fontWeight: 700,
          px: { xs: 1.5, sm: 2 },
          py: { xs: 0.8, sm: 1 },
          fontSize: { xs: '0.8rem', sm: '0.85rem' },
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 10px rgba(217, 119, 6, 0.25)',
          whiteSpace: 'nowrap',
          '&:hover': {
            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            boxShadow: '0 6px 14px rgba(217, 119, 6, 0.35)',
          },
        }}
      >
        {label}
      </Button>

      <TriggerMissingROIDialog
        open={open}
        onClose={() => setOpen(false)}
        defaultType={defaultType}
        pageTitle={pageTitle}
      />
    </>
  );
};

export default TriggerMissingROIDialog;

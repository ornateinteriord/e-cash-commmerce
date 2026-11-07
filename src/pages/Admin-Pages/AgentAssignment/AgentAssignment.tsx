import React, { useState } from "react";
import { Box, Paper, Typography, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody, Stack, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Chip, TablePagination, TableContainer, Divider, useMediaQuery, useTheme,  } from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import { useGetAccountsForAssignment, useGetAccountGroups, useGetAllAgents, useUpdateAccountAssignment,  } from '../../../queries/admin';
import { AccountForAssignment } from '../../../types';

const AgentAssignment: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Filter states
  const [selectedAccountType, setSelectedAccountType] = useState<string>("");
  const [accountNoSearch, setAccountNoSearch] = useState<string>("");
  const [searchTrigger, setSearchTrigger] = useState<string>("");

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountForAssignment | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");

  // API hooks
  const { data: accountGroupsData } = useGetAccountGroups();
  const { data: agentsData } = useGetAllAgents();
  const { data: accountsData, isLoading } = useGetAccountsForAssignment(
    page + 1,
    rowsPerPage,
    selectedAccountType || undefined,
    searchTrigger || undefined
  );
  const updateAssignment = useUpdateAccountAssignment();

  const accountGroups = accountGroupsData?.data || [];
  const agents = agentsData?.data || [];
  const accounts = accountsData?.data || [];
  const totalAccounts = accountsData?.pagination?.total || 0;

  // Helper function to check if agent is assigned
  const isAgentAssigned = (account: AccountForAssignment): boolean => {
    if (account && !account.assigned_to) return false
    return !!(account.assigned_to && account.assigned_to.trim() !== "");
  };

  const handleSearch = () => {
    setSearchTrigger(accountNoSearch);
    setPage(0);
  };

  const handleClearFilters = () => {
    setSelectedAccountType("");
    setAccountNoSearch("");
    setSearchTrigger("");
    setPage(0);
  };

  const handleOpenDialog = (account: AccountForAssignment) => {
    setSelectedAccount(account);
    setSelectedAgentId(isAgentAssigned(account) ? account.assigned_to! : "");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAccount(null);
    setSelectedAgentId("");
  };

  const handleAssignAgent = async () => {
    if (!selectedAccount) return;

    try {
      await updateAssignment.mutateAsync({
        accountId: selectedAccount._id,
        assigned_to: selectedAgentId || null,
      });
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to assign agent:", error);
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAccountTypeChange = (value: string) => {
    setSelectedAccountType(value);
    setPage(0);
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, mt: 8 }}>
      {/* Page Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
        sx={{ mb: 3 }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#1a237e",
            fontSize: { xs: "1.4rem", sm: "1.75rem", md: "2.125rem" },
          }}
        >
          Agent Assignment
        </Typography>
        <Chip
          icon={<AssignmentIndIcon />}
          label={`Total: ${totalAccounts} accounts`}
          sx={{
            backgroundColor: "#e0f2fe",
            color: "#0369a1",
            fontWeight: 500,
          }}
        />
      </Stack>

      {/* Filters Section */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: 3,
          p: { xs: 2, sm: 2.5 },
          mb: 3,
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <FormControl sx={{ minWidth: { xs: "100%", md: 280 } }} size="small">
            <InputLabel>Account Type</InputLabel>
            <Select
              value={selectedAccountType}
              onChange={(e) => handleAccountTypeChange(e.target.value)}
              label="Account Type"
              sx={{
                backgroundColor: "#fff",
                borderRadius: 2,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e2e8f0",
                },
              }}
            >
              <MenuItem value="">All Types</MenuItem>
              {accountGroups.map((group) => (
                <MenuItem key={group.account_group_id} value={group.account_group_id}>
                  {group.account_group_name} ({group.account_group_id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ flex: 1 }}
          >
            <TextField
              size="small"
              label="Search Account Number"
              placeholder="Enter account no..."
              value={accountNoSearch}
              onChange={(e) => setAccountNoSearch(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              sx={{
                flex: 1,
                backgroundColor: "#fff",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "& fieldset": {
                    borderColor: "#e2e8f0",
                  },
                },
              }}
            />

            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{
                background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
                boxShadow: "0 4px 14px 0 rgba(3, 105, 161, 0.25)",
                "&:hover": {
                  background: "linear-gradient(135deg, #0369a1 0%, #075985 100%)",
                },
              }}
            >
              Search
            </Button>

            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              disabled={!selectedAccountType && !accountNoSearch && !searchTrigger}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 2,
                py: 1,
                borderColor: "#94a3b8",
                color: "#64748b",
                "&:hover": {
                  borderColor: "#64748b",
                  backgroundColor: "#f1f5f9",
                },
                "&:disabled": {
                  borderColor: "#e2e8f0",
                  color: "#cbd5e1",
                },
              }}
            >
              Clear
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Table Container */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        }}
      >
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 6 }}>
            <CircularProgress sx={{ color: "#0284c7" }} />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: { xs: 400, sm: 500, md: 600 } }}>
              <Table stickyHeader sx={{ minWidth: isMobile ? 600 : 900 }}>
                <TableHead>
                  <TableRow>
                    {[
                      "Account No",
                      "Vendor ID",
                      !isMobile && "Vendor Name",
                      "Account Type",
                      "Status",
                      "Assigned Agent",
                      "Action",
                    ]
                      .filter(Boolean)
                      .map((head) => (
                        <TableCell
                          key={head as string}
                          sx={{
                            fontWeight: 700,
                            color: "#334155",
                            backgroundColor: "#f8fafc",
                            borderBottom: "2px solid #e2e8f0",
                            whiteSpace: "nowrap",
                            py: 1.5,
                            ...(head === "Action" && { textAlign: "center" }),
                          }}
                        >
                          {head}
                        </TableCell>
                      ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accounts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={isMobile ? 6 : 7}
                        align="center"
                        sx={{ py: 6, color: "#64748b" }}
                      >
                        <Box>
                          <AccountCircleIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
                          <Typography variant="body1" color="text.secondary">
                            No accounts found
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    accounts.map((account, index) => {
                      const hasAgent = isAgentAssigned(account);
                      return (
                        <TableRow
                          key={account._id}
                          hover
                          sx={{
                            backgroundColor: index % 2 === 0 ? "#fff" : "#fafbfc",
                            "&:hover": { backgroundColor: "#f0f9ff" },
                            transition: "background-color 0.2s",
                          }}
                        >
                          <TableCell sx={{ fontWeight: 500, color: "#1e293b" }}>
                            {account.account_no || "-"}
                          </TableCell>
                          <TableCell sx={{ color: "#475569" }}>
                            {account.member_id || "-"}
                          </TableCell>
                          {!isMobile && (
                            <TableCell sx={{ color: "#475569" }}>
                              {account.memberDetails?.name || "-"}
                            </TableCell>
                          )}
                          <TableCell>
                            <Chip
                              label={account.account_type_name || account.account_type || "-"}
                              size="small"
                              sx={{
                                backgroundColor: "#e0f2fe",
                                color: "#0369a1",
                                fontWeight: 500,
                                fontSize: "0.75rem",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={account.status || "Unknown"}
                              size="small"
                              sx={{
                                fontWeight: 500,
                                fontSize: "0.75rem",
                                ...(account.status === "active"
                                  ? { backgroundColor: "#dcfce7", color: "#166534" }
                                  : account.status === "pending"
                                    ? { backgroundColor: "#fef3c7", color: "#92400e" }
                                    : { backgroundColor: "#f1f5f9", color: "#475569" }),
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {hasAgent && account.agentDetails ? (
                              <Chip
                                avatar={
                                  <AccountCircleIcon
                                    sx={{ color: "#166534 !important", fontSize: 18 }}
                                  />
                                }
                                label={`${account.agentDetails.name} (${account.agentDetails.agent_id})`}
                                size="small"
                                sx={{
                                  backgroundColor: "#dcfce7",
                                  color: "#166534",
                                  fontWeight: 500,
                                  fontSize: "0.75rem",
                                }}
                              />
                            ) : hasAgent && !account.agentDetails ? (
                              <Chip
                                label={`Agent Not Found (${account.assigned_to})`}
                                size="small"
                                sx={{
                                  backgroundColor: "#fee2e2",
                                  color: "#dc2626",
                                  fontWeight: 500,
                                  fontSize: "0.75rem",
                                }}
                              />
                            ) : (
                              <Chip
                                label="Not Assigned"
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderColor: "#f97316",
                                  color: "#ea580c",
                                  fontWeight: 500,
                                  fontSize: "0.75rem",
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant={hasAgent ? "outlined" : "contained"}
                              size="small"
                              startIcon={hasAgent ? <EditIcon /> : <PersonAddIcon />}
                              onClick={() => handleOpenDialog(account)}
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: 2,
                                px: { xs: 1.5, sm: 2 },
                                py: 0.75,
                                minWidth: { xs: 100, sm: 130 },
                                fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                                ...(hasAgent
                                  ? {
                                    borderColor: "#0284c7",
                                    color: "#0284c7",
                                    "&:hover": {
                                      borderColor: "#0369a1",
                                      color: "#0369a1",
                                      backgroundColor: "#f0f9ff",
                                    },
                                  }
                                  : {
                                    background:
                                      "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                                    boxShadow: "0 2px 8px 0 rgba(22, 163, 74, 0.25)",
                                    "&:hover": {
                                      background:
                                        "linear-gradient(135deg, #15803d 0%, #166534 100%)",
                                    },
                                  }),
                              }}
                            >
                              {hasAgent ? "Update Agent" : "Add Agent"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider />

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalAccounts}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: "1px solid #e2e8f0",
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                },
              }}
            />
          </>
        )}
      </Paper>

      {/* Agent Assignment Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            borderBottom: "1px solid #e2e8f0",
            py: 2,
            px: { xs: 2, sm: 3 },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {selectedAccount && isAgentAssigned(selectedAccount) ? (
              <EditIcon sx={{ color: "#0284c7" }} />
            ) : (
              <PersonAddIcon sx={{ color: "#16a34a" }} />
            )}
            <span>
              {selectedAccount && isAgentAssigned(selectedAccount)
                ? "Update Agent Assignment"
                : "Assign Agent to Account"}
            </span>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, px: { xs: 2, sm: 3 } }}>
          {selectedAccount && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Account Details Card */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1.5, fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem" }}
                >
                  Account Details
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Account No:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedAccount.account_no}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Member:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedAccount.memberDetails?.name || selectedAccount.member_id}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Account Type:
                    </Typography>
                    <Chip
                      label={selectedAccount.account_type_name || selectedAccount.account_type}
                      size="small"
                      sx={{
                        backgroundColor: "#e0f2fe",
                        color: "#0369a1",
                        fontWeight: 500,
                        fontSize: "0.7rem",
                      }}
                    />
                  </Stack>
                  {isAgentAssigned(selectedAccount) && selectedAccount.agentDetails && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Current Agent:
                      </Typography>
                      <Chip
                        label={`${selectedAccount.agentDetails.name} (${selectedAccount.agentDetails.agent_id})`}
                        size="small"
                        sx={{
                          backgroundColor: "#dcfce7",
                          color: "#166534",
                          fontWeight: 500,
                          fontSize: "0.7rem",
                        }}
                      />
                    </Stack>
                  )}
                </Stack>
              </Paper>

              {/* Agent Selection */}
              <FormControl fullWidth>
                <InputLabel>Select Agent</InputLabel>
                <Select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  label="Select Agent"
                  sx={{
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e2e8f0",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                        borderRadius: 2,
                      },
                    },
                  }}
                >
                  <MenuItem value="">
                    <em style={{ color: "#94a3b8" }}>None (Remove Assignment)</em>
                  </MenuItem>
                  {agents.map((agent) => (
                    <MenuItem
                      key={agent.agent_id}
                      value={agent.agent_id}
                      sx={{
                        py: 1.5,
                        "&:hover": { backgroundColor: "#f0f9ff" },
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <AccountCircleIcon sx={{ color: "#64748b", fontSize: 24 }} />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {agent.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {agent.agent_id}
                          </Typography>
                        </Box>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderTop: "1px solid #e2e8f0",
            backgroundColor: "#fafbfc",
            gap: 1.5,
          }}
        >
          <Button
            onClick={handleCloseDialog}
            sx={{
              textTransform: "none",
              color: "#64748b",
              fontWeight: 500,
              px: 3,
              borderRadius: 2,
              "&:hover": { backgroundColor: "#f1f5f9" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAssignAgent}
            disabled={updateAssignment.isPending}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              borderRadius: 2,
              background:
                selectedAccount && isAgentAssigned(selectedAccount)
                  ? "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)"
                  : "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
              boxShadow:
                selectedAccount && isAgentAssigned(selectedAccount)
                  ? "0 4px 14px 0 rgba(3, 105, 161, 0.25)"
                  : "0 4px 14px 0 rgba(22, 163, 74, 0.25)",
              "&:hover": {
                background:
                  selectedAccount && isAgentAssigned(selectedAccount)
                    ? "linear-gradient(135deg, #0369a1 0%, #075985 100%)"
                    : "linear-gradient(135deg, #15803d 0%, #166534 100%)",
              },
              "&:disabled": {
                background: "#94a3b8",
              },
            }}
          >
            {updateAssignment.isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : selectedAccount && isAgentAssigned(selectedAccount) ? (
              "Update Assignment"
            ) : (
              "Assign Agent"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentAssignment;

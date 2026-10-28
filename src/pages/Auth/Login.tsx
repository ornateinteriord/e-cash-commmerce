import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Checkbox,
  FormControlLabel, Link as MuiLink, InputAdornment,
  IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip
} from '@mui/material';
import {
  Visibility, VisibilityOff, PersonOutline,
  LockOutlined, PhoneAndroid, Close as CloseIcon,
  ArrowForward, AdminPanelSettings, ArrowBack,
  Security, ChatBubbleOutline,
  EmailOutlined
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { post } from '../../api/Api';
import { LoadingComponent } from '../../App';
import { useLoginMutation } from '../../api/Auth';
import ForgotPasswordForm from "./components/ForgotPasswordForm";

// Modern Clean Input Field Style for White Card Background
const premiumFieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#0F172A",
    bgcolor: "#F8FAFC",
    borderRadius: "14px",
    fontSize: "0.98rem",
    fontWeight: 600,
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    "& fieldset": { borderColor: "#E2E8F0", borderWidth: "1.5px" },
    "&:hover": {
      bgcolor: "#F1F5F9",
      "& fieldset": { borderColor: "#CBD5E1" },
    },
    "&.Mui-focused": {
      bgcolor: "#FFFFFF",
      boxShadow: "0 0 0 4px rgba(254, 128, 1, 0.12)",
      "& fieldset": { borderColor: "#FE8001", borderWidth: "1.8px" },
    },
    "& input": {
      py: "14.5px",
      pl: "8px",
      color: "#0F172A",
      letterSpacing: "0.4px",
      "&::placeholder": {
        color: "#94A3B8",
        opacity: 1
      }
    }
  },
  "& .MuiInputLabel-root": { color: "#64748B", fontWeight: 500, fontSize: "0.92rem" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#FE8001", fontWeight: 700 },
};

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const [openMsgDialog, setOpenMsgDialog] = useState(false);
  const [guestMsgData, setGuestMsgData] = useState({ name: "", phone: "", message: "" });
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("rememberedUser");
    if (savedUser) {
      try {
        const p = JSON.parse(savedUser);
        if (p && p.username && p.password) {
          setFormData({ username: p.username, password: p.password === "dummy-password" ? "" : p.password });
          if (p.isAdminMode !== undefined) setIsAdminMode(p.isAdminMode);
          setRememberMe(true);
        } else { localStorage.removeItem("rememberedUser"); }
      } catch { localStorage.removeItem("rememberedUser"); }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "username" && !isAdminMode) {
      setFormData(prev => ({ ...prev, username: value.replace(/\D/g, "").slice(0, 10) }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const loginMutation = useLoginMutation();
  const { mutate, isPending } = loginMutation;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdminMode && !/^\d{10}$/.test(formData.username.trim())) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    const payload = { ...formData, username: formData.username.trim() };
    if (rememberMe) localStorage.setItem("rememberedUser", JSON.stringify({ ...payload, isAdminMode }));
    else localStorage.removeItem("rememberedUser");
    mutate(payload);
  };

  const handleSendGuestMessage = async () => {
    if (!guestMsgData.name || !guestMsgData.phone || !guestMsgData.message) {
      toast.error("Please fill all fields"); return;
    }
    try {
      setIsSendingMsg(true);
      const guestId = `GUEST_${guestMsgData.phone}`;
      const res = await post("/chat/guest/message/send", {
        roomId: `${guestId}_ADMIN_1`, guestId,
        text: `From: ${guestMsgData.name} (${guestMsgData.phone})\n\n${guestMsgData.message}`
      });
      if (res.success) {
        toast.success("Message sent successfully!");
        setOpenMsgDialog(false);
        setGuestMsgData({ name: "", phone: "", message: "" });
      } else toast.error("Failed to send message");
    } catch { toast.error("An error occurred"); }
    finally { setIsSendingMsg(false); }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      background: "#FFFFFF",
      px: { xs: 2, sm: 3 },
      py: { xs: 3, sm: 4 },
      overflow: "hidden",
    }}>

      {/* Decorative subtle ambient background glows */}
      <Box sx={{
        position: "absolute", top: -140, right: -120,
        width: 380, height: 380, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(254, 128, 1, 0.08) 0%, transparent 70%)",
        filter: "blur(50px)", pointerEvents: "none"
      }} />
      <Box sx={{
        position: "absolute", bottom: -120, left: -100,
        width: 360, height: 360, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(23, 43, 48, 0.05) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none"
      }} />

      {/* Center Layout Container (Comfortable Desktop Sizing) */}
      <Box sx={{
        width: "100%",
        maxWidth: { xs: "100%", sm: 400, md: 418 },
        zIndex: 1
      }}>

        {/* ── LOGIN CARD ── */}
        <Box sx={{
          bgcolor: "#FFFFFF",
          borderRadius: { xs: "20px", sm: "24px" },
          p: { xs: 2.8, sm: 3.8 },
          boxShadow: "0 20px 48px rgba(15, 23, 42, 0.08), 0 4px 16px rgba(15, 23, 42, 0.04)",
          border: "1.5px solid #E2E8F0",
          width: "100%",
          position: "relative",
        }}>

          {isResetMode ? (
            <ForgotPasswordForm onBackToLogin={() => setIsResetMode(false)} />
          ) : (
            <>
              {/* Top Brand Header & Tagline Inside Form */}
              <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 2.8,
                textAlign: "center"
              }}>
                <Box
                  component="img"
                  src="/e-shopy.jpeg"
                  alt="E-shopy Logo"
                  sx={{
                    height: { xs: 48, sm: 56 },
                    objectFit: 'contain',
                    mb: 1.5
                  }}
                />

                <Typography sx={{
                  color: "#64748B",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  letterSpacing: "0.2px"
                }}>
                  {isAdminMode
                    ? "Sign in with elevated administrator credentials"
                    : "Sign in to access your digital commerce dashboard"}
                </Typography>

                {isAdminMode && (
                  <Chip
                    icon={<AdminPanelSettings sx={{ fontSize: "13px !important", color: "#E06F00" }} />}
                    label="Administrator Portal"
                    size="small"
                    sx={{
                      bgcolor: "rgba(254, 128, 1, 0.1)",
                      color: "#E06F00",
                      border: "1px solid rgba(254, 128, 1, 0.3)",
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      height: "22px",
                      mt: 1
                    }}
                  />
                )}
              </Box>

              {/* FORM */}
              <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.3 }}>

                {/* Mobile / Username Field */}
                <TextField
                  required fullWidth autoFocus
                  id="username" name="username"
                  autoComplete={isAdminMode ? "username" : "tel"}
                  label={isAdminMode ? "Admin Username" : "Mobile Number"}
                  placeholder={isAdminMode ? "Enter admin username" : "10-digit mobile number"}
                  value={formData.username}
                  onChange={handleChange}
                  variant="outlined"
                  type="text"
                  inputMode={isAdminMode ? undefined : "numeric"}
                  inputProps={isAdminMode ? {} : { maxLength: 10, inputMode: "numeric" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {isAdminMode ? (
                          <Box sx={{
                            width: 36, height: 36, borderRadius: "10px",
                            bgcolor: formData.username ? "rgba(254, 128, 1, 0.12)" : "#F1F5F9",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            mr: 1.2,
                            transition: "all 0.2s ease"
                          }}>
                            <PersonOutline sx={{ color: formData.username ? "#FE8001" : "#64748B", fontSize: "1.25rem" }} />
                          </Box>
                        ) : (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mr: 1.2 }}>
                            <Box sx={{
                              width: 36, height: 36, borderRadius: "10px",
                              bgcolor: formData.username ? "rgba(254, 128, 1, 0.12)" : "#F1F5F9",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.2s ease"
                            }}>
                              <PhoneAndroid sx={{
                                color: formData.username ? "#FE8001" : "#64748B",
                                fontSize: "1.2rem"
                              }} />
                            </Box>
                            <Typography sx={{ color: "#0F172A", fontWeight: 800, fontSize: "0.92rem", letterSpacing: "0.5px" }}>+91</Typography>
                            <Box sx={{ width: "1.5px", height: "20px", bgcolor: "#CBD5E1", ml: 0.3 }} />
                          </Box>
                        )}
                      </InputAdornment>
                    )
                  }}
                  sx={premiumFieldSx}
                />

                {/* Password Field */}
                <TextField
                  required fullWidth
                  name="password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  label={isAdminMode ? "Admin Password" : "Password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{
                          width: 36, height: 36, borderRadius: "10px",
                          bgcolor: formData.password ? "rgba(254, 128, 1, 0.12)" : "#F1F5F9",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          mr: 1.2,
                          transition: "all 0.2s ease"
                        }}>
                          <LockOutlined sx={{ color: formData.password ? "#FE8001" : "#64748B", fontSize: "1.25rem" }} />
                        </Box>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(s => !s)}
                          onMouseDown={e => e.preventDefault()}
                          edge="end" size="small"
                          sx={{
                            color: "#64748B",
                            mr: 0.4,
                            p: 0.8,
                            borderRadius: "10px",
                            "&:hover": { color: "#FE8001", bgcolor: "rgba(254, 128, 1, 0.08)" }
                          }}
                        >
                          {showPassword ? <VisibilityOff sx={{ fontSize: "1.2rem" }} /> : <Visibility sx={{ fontSize: "1.2rem" }} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={premiumFieldSx}
                />

                {/* Remember me + Forgot password */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.4 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        size="small"
                        sx={{ color: "#CBD5E1", "&.Mui-checked": { color: "#FE8001" }, p: 0.3 }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: "0.78rem", color: "#475569", fontWeight: 600 }}>
                        Remember me
                      </Typography>
                    }
                  />
                  <MuiLink
                    component="button" type="button"
                    onClick={() => setIsResetMode(true)}
                    underline="none"
                    sx={{
                      fontSize: "0.78rem", color: "#FE8001", fontWeight: 700,
                      transition: "color 0.2s ease",
                      "&:hover": { color: "#E06F00", textDecoration: "underline" }
                    }}
                  >
                    Forgot password?
                  </MuiLink>
                </Box>

                {/* Sign In CTA Button */}
                <Button
                  type="submit" fullWidth variant="contained"
                  disabled={isPending}
                  endIcon={!isPending && <ArrowForward sx={{ fontSize: "1.05rem", transition: "transform 0.2s ease" }} />}
                  sx={{
                    mt: 0.3,
                    py: 1.25,
                    background: isAdminMode
                      ? "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)"
                      : "linear-gradient(135deg, #FE8001 0%, #FFA033 100%)",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    fontSize: "0.93rem",
                    letterSpacing: "0.2px",
                    borderRadius: "14px",
                    textTransform: "none",
                    boxShadow: isAdminMode
                      ? "0 8px 20px rgba(15, 23, 42, 0.25)"
                      : "0 8px 20px rgba(254, 128, 1, 0.3)",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      background: isAdminMode
                        ? "linear-gradient(135deg, #020617 0%, #0F172A 100%)"
                        : "linear-gradient(135deg, #E06F00 0%, #FE8001 100%)",
                      transform: "translateY(-1.5px)",
                      boxShadow: isAdminMode
                        ? "0 10px 24px rgba(15, 23, 42, 0.35)"
                        : "0 10px 24px rgba(254, 128, 1, 0.4)",
                      "& .MuiButton-endIcon": {
                        transform: "translateX(3px)"
                      }
                    },
                    "&:active": { transform: "translateY(0)" },
                    "&:disabled": { background: "#E2E8F0", color: "#94A3B8", boxShadow: "none" },
                  }}
                >
                  {isPending ? "Signing In…" : (isAdminMode ? "Sign In as Administrator" : "Vendor Dashboard")}
                </Button>

                {/* ── Login as Administration / Back to Member Toggle Link (Below Button) ── */}
                {!isAdminMode ? (
                  <Box sx={{ textAlign: "center", mt: 0.4, mb: 0.2 }}>
                    <MuiLink
                      component="button"
                      type="button"
                      onClick={() => { setIsAdminMode(true); setFormData({ username: "", password: "" }); }}
                      underline="none"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.7,
                        color: "#475569",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        border: "none",
                        background: "none",
                        p: 0.6,
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          color: "#FE8001",
                          bgcolor: "rgba(254, 128, 1, 0.08)"
                        }
                      }}
                    >
                      <AdminPanelSettings sx={{ fontSize: "1.05rem", color: "#FE8001" }} />
                      Login as Vendor Administration
                    </MuiLink>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", mt: 0.4, mb: 0.2 }}>
                    <MuiLink
                      component="button"
                      type="button"
                      onClick={() => { setIsAdminMode(false); setFormData({ username: "", password: "" }); }}
                      underline="none"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.7,
                        color: "#475569",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        border: "none",
                        background: "none",
                        p: 0.6,
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          color: "#FE8001",
                          bgcolor: "rgba(254, 128, 1, 0.08)"
                        }
                      }}
                    >
                      <ArrowBack sx={{ fontSize: "1rem", color: "#FE8001" }} />
                      Back to Member Login
                    </MuiLink>
                  </Box>
                )}

                {/* Register (Only for Members) */}
                {!isAdminMode && (
                  <>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, my: 0.2 }}>
                      <Box sx={{ flex: 1, height: "1px", bgcolor: "#E2E8F0" }} />
                      <Typography sx={{ fontSize: "0.74rem", color: "#94A3B8", fontWeight: 700, px: 0.5 }}>OR</Typography>
                      <Box sx={{ flex: 1, height: "1px", bgcolor: "#E2E8F0" }} />
                    </Box>

                    <Button
                      component={Link} to="/register"
                      fullWidth variant="outlined"
                      sx={{
                        py: 1.15,
                        color: "#FE8001",
                        borderColor: "#FED7AA",
                        borderWidth: "1.5px",
                        fontWeight: 800,
                        fontSize: "0.88rem",
                        borderRadius: "14px",
                        textTransform: "none",
                        bgcolor: "#FFF7ED",
                        transition: "all 0.25s ease",
                        "&:hover": {
                          borderColor: "#FE8001",
                          borderWidth: "1.5px",
                          bgcolor: "rgba(254, 128, 1, 0.12)",
                          color: "#E06F00",
                          boxShadow: "0 4px 14px rgba(254, 128, 1, 0.15)",
                          transform: "translateY(-1px)"
                        }
                      }}
                    >
                      Create New Account
                    </Button>
                  </>
                )}

                {/* Support and Security Footer */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1, borderTop: "1px solid #F1F5F9", mt: 0.5 }}>
                  <Box sx={{ display: "flex", gap: 1.8 }}>
                    <MuiLink
                      component="button" type="button"
                      onClick={() => setOpenMsgDialog(true)}
                      underline="none"
                      sx={{
                        display: "flex", alignItems: "center", gap: 0.5,
                        fontSize: "0.76rem", color: "#64748B", fontWeight: 600,
                        "&:hover": { color: "#FE8001" }
                      }}
                    >
                      <ChatBubbleOutline sx={{ fontSize: "0.9rem" }} />
                      Message Us
                    </MuiLink>
                    <MuiLink
                      href="mailto:support@eshopy.com"
                      underline="none"
                      sx={{
                        display: "flex", alignItems: "center", gap: 0.5,
                        fontSize: "0.76rem", color: "#64748B", fontWeight: 600,
                        "&:hover": { color: "#FE8001" }
                      }}
                    >
                      <EmailOutlined sx={{ fontSize: "0.9rem" }} />
                      Helpdesk
                    </MuiLink>
                  </Box>

                  <Chip
                    icon={<Security sx={{ fontSize: "13px !important", color: "#059669" }} />}
                    label="SSL 256-Bit"
                    size="small"
                    sx={{
                      bgcolor: "#ECFDF5",
                      color: "#059669",
                      border: "1px solid #A7F3D0",
                      fontWeight: 700,
                      fontSize: "0.64rem",
                      height: "20px"
                    }}
                  />
                </Box>

              </Box>
            </>
          )}
        </Box>
      </Box>

      {isPending && <LoadingComponent />}

      {/* ── GUEST MESSAGE DIALOG ───────────────────── */}
      <Dialog
        open={openMsgDialog}
        onClose={() => setOpenMsgDialog(false)}
        maxWidth="sm" fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#FFFFFF",
            borderRadius: "24px",
            mx: { xs: 2, sm: "auto" },
            border: "1px solid #E2E8F0",
            boxShadow: "0 24px 60px rgba(31,51,59,0.2)",
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1, px: 2.5 }}>
          <Box>
            <Typography variant="h6" fontWeight={900} color="#1F333B">Contact Support</Typography>
            <Typography variant="caption" color="#64748B" fontWeight={500}>We typically respond within 15 minutes</Typography>
          </Box>
          <IconButton onClick={() => setOpenMsgDialog(false)} sx={{ color: "#94A3B8" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, px: 2.5, pt: 2 }}>
          <TextField label="Your Name" fullWidth variant="outlined"
            placeholder="John Doe"
            value={guestMsgData.name}
            onChange={e => setGuestMsgData({ ...guestMsgData, name: e.target.value })}
            sx={premiumFieldSx} />
          <TextField label="Mobile Number" fullWidth variant="outlined"
            placeholder="10-digit mobile number"
            value={guestMsgData.phone}
            onChange={e => setGuestMsgData({ ...guestMsgData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
            sx={premiumFieldSx} />
          <TextField label="Message" fullWidth multiline rows={4} variant="outlined"
            placeholder="How can our support team assist you today?"
            value={guestMsgData.message}
            onChange={e => setGuestMsgData({ ...guestMsgData, message: e.target.value })}
            sx={premiumFieldSx} />
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
          <Button onClick={() => setOpenMsgDialog(false)}
            variant="outlined"
            sx={{
              color: "#64748B", borderColor: "#E2E8F0", fontWeight: 700,
              textTransform: "none", borderRadius: "12px", px: 2.5
            }}>
            Cancel
          </Button>
          <Button
            onClick={handleSendGuestMessage}
            variant="contained" disabled={isSendingMsg}
            sx={{
              background: "linear-gradient(135deg, #FE8001 0%, #FFA033 100%)",
              color: "#FFFFFF", fontWeight: 800, borderRadius: "12px",
              textTransform: "none", px: 3,
              boxShadow: "0 6px 18px rgba(254,128,1,0.35)",
              "&:hover": { background: "linear-gradient(135deg, #E06F00 0%, #FE8001 100%)" }
            }}
          >
            {isSendingMsg ? "Sending…" : "Send Message"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;

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
  Speed, TrendingUp, Security, ChatBubbleOutline,
  EmailOutlined, CheckCircle
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { post } from '../../api/Api';
import { LoadingComponent } from '../../App';
import { useLoginMutation } from '../../api/Auth';
import ForgotPasswordForm from "./components/ForgotPasswordForm";

// Modern Segmented Pod Input Field Style for #172B30 Form Background
const premiumFieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#FFFFFF",
    bgcolor: "rgba(255, 255, 255, 0.06)",
    borderRadius: "16px",
    fontSize: "0.96rem",
    fontWeight: 600,
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.14)", borderWidth: "1.5px" },
    "&:hover": {
      bgcolor: "rgba(255, 255, 255, 0.09)",
      "& fieldset": { borderColor: "#FFA033" },
    },
    "&.Mui-focused": {
      bgcolor: "rgba(255, 255, 255, 0.1)",
      boxShadow: "0 4px 20px rgba(254, 128, 1, 0.22)",
      "& fieldset": { borderColor: "#FE8001", borderWidth: "2px" },
    },
    "& input": {
      color: "#FFFFFF",
      "&::placeholder": {
        color: "rgba(255, 255, 255, 0.4)",
        opacity: 1
      }
    }
  },
  "& .MuiInputLabel-root": { color: "#94A3B8", fontWeight: 500 },
  "& .MuiInputLabel-root.Mui-focused": { color: "#FFA033", fontWeight: 700 },
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
      px: { xs: 2, sm: 3, md: 5 },
      py: { xs: 4, sm: 6 },
      overflow: "hidden",
    }}>

      {/* Decorative subtle ambient background glows */}
      <Box sx={{
        position: "absolute", top: -140, right: -120,
        width: 480, height: 480, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(254, 128, 1, 0.08) 0%, transparent 70%)",
        filter: "blur(50px)", pointerEvents: "none"
      }} />
      <Box sx={{
        position: "absolute", bottom: -120, left: -100,
        width: 450, height: 450, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(23, 43, 48, 0.05) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none"
      }} />

      {/* Center Layout Container */}
      <Box sx={{
        width: "100%",
        maxWidth: { xs: 440, md: 980 },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" },
        gap: { xs: 3, md: 5 },
        alignItems: "center",
        zIndex: 1
      }}>

        {/* ── LEFT SHOWCASE (Visible on Desktop / Tablet) ── */}
        <Box sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          gap: 3.5,
          color: "#0F172A",
          pr: 2
        }}>
          {/* Brand Logo & Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{
              width: 58, height: 58,
              borderRadius: "18px",
              background: "linear-gradient(135deg, #FE8001 0%, #FFA033 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(254, 128, 1, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.3)"
            }}>
              <Typography sx={{ fontSize: "2rem", fontWeight: 950, color: "#FFFFFF", lineHeight: 1 }}>
                E
              </Typography>
            </Box>
            <Box>
              <Typography sx={{
                fontWeight: 950,
                fontSize: "2.1rem",
                letterSpacing: "3px",
                color: "#172B30",
                lineHeight: 1,
              }}>
                E SHOPY
              </Typography>
              <Typography sx={{
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "1.8px",
                color: "#FE8001",
                textTransform: "uppercase",
                mt: 0.5
              }}>
                Digital Commerce & Wealth Platform
              </Typography>
            </Box>
          </Box>

          {/* Headline & Value Intro */}
          <Box>
            <Typography sx={{
              fontSize: "1.85rem",
              fontWeight: 900,
              color: "#0F172A",
              lineHeight: 1.25,
              letterSpacing: "-0.5px"
            }}>
              Smarter Investments, <br />
              <Box component="span" sx={{
                background: "linear-gradient(135deg, #FE8001 0%, #EA580C 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                Daily Payouts & Instant Growth.
              </Box>
            </Typography>
            <Typography sx={{ fontSize: "0.95rem", color: "#64748B", mt: 1.5, lineHeight: 1.6 }}>
              Access your personalized dashboard, manage investment subscriptions, and track benefits in real-time.
            </Typography>
          </Box>

          {/* 3 Executive Feature Cards */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{
              display: "flex", alignItems: "center", gap: 2,
              p: 2, borderRadius: "16px",
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
              transition: "transform 0.25s ease, border-color 0.25s ease",
              "&:hover": { transform: "translateX(4px)", borderColor: "rgba(254, 128, 1, 0.5)" }
            }}>
              <Box sx={{
                p: 1.2, borderRadius: "12px",
                bgcolor: "rgba(254, 128, 1, 0.12)",
                color: "#FE8001"
              }}>
                <Speed sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", color: "#0F172A" }}>
                  Instant Wallet Settlements
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#64748B", mt: 0.2 }}>
                  Lightning-fast credit deposits, zero fees, and member P2P transfers.
                </Typography>
              </Box>
            </Box>

            <Box sx={{
              display: "flex", alignItems: "center", gap: 2,
              p: 2, borderRadius: "16px",
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
              transition: "transform 0.25s ease, border-color 0.25s ease",
              "&:hover": { transform: "translateX(4px)", borderColor: "rgba(254, 128, 1, 0.5)" }
            }}>
              <Box sx={{
                p: 1.2, borderRadius: "12px",
                bgcolor: "rgba(2, 132, 199, 0.12)",
                color: "#0284C7"
              }}>
                <TrendingUp sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", color: "#0F172A" }}>
                  Daily Return On Investment
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#64748B", mt: 0.2 }}>
                  Automated daily payouts directly credited into your member balance.
                </Typography>
              </Box>
            </Box>

            <Box sx={{
              display: "flex", alignItems: "center", gap: 2,
              p: 2, borderRadius: "16px",
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
              transition: "transform 0.25s ease, border-color 0.25s ease",
              "&:hover": { transform: "translateX(4px)", borderColor: "rgba(254, 128, 1, 0.5)" }
            }}>
              <Box sx={{
                p: 1.2, borderRadius: "12px",
                bgcolor: "rgba(16, 185, 129, 0.12)",
                color: "#10B981"
              }}>
                <Security sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", color: "#0F172A" }}>
                  Institutional Security
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#64748B", mt: 0.2 }}>
                  256-Bit SSL encryption, verified user KYC, and multi-factor defense.
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Trust Banner */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, pt: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#10B981", boxShadow: "0 0 10px #10B981" }} />
            <Typography sx={{ fontSize: "0.82rem", color: "#64748B", fontWeight: 600 }}>
              Encrypted Session &bull; 99.9% Uptime Guarantee
            </Typography>
          </Box>
        </Box>

        {/* ── RIGHT LOGIN CARD ── */}
        <Box sx={{
          bgcolor: "#172B30",
          borderRadius: { xs: "24px", sm: "32px" },
          p: { xs: 3, sm: 4.5 },
          boxShadow: "0 24px 64px rgba(23, 43, 48, 0.35), 0 10px 24px rgba(0, 0, 0, 0.2)",
          border: "1.5px solid rgba(255, 255, 255, 0.1)",
          width: "100%",
          position: "relative",
        }}>

          {/* Mobile Top Brand Header */}
          <Box sx={{
            display: { xs: "flex", md: "none" },
            flexDirection: "column",
            alignItems: "center",
            mb: 3,
            textAlign: "center"
          }}>
            <Box sx={{
              width: 52, height: 52,
              borderRadius: "16px",
              background: "linear-gradient(135deg, #FE8001 0%, #FFA033 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 18px rgba(254, 128, 1, 0.35)",
              mb: 1
            }}>
              <Typography sx={{ fontSize: "1.7rem", fontWeight: 950, color: "#FFFFFF" }}>
                E
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 950, fontSize: "1.75rem", letterSpacing: "2.5px", color: "#FFFFFF" }}>
              E SHOPY
            </Typography>
          </Box>

          {isResetMode ? (
            <ForgotPasswordForm onBackToLogin={() => setIsResetMode(false)} />
          ) : (
            <>
              {/* Administration Header (Only shown in Admin Mode) */}
              {isAdminMode && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography sx={{
                    fontWeight: 950,
                    fontSize: { xs: "1.45rem", sm: "1.65rem" },
                    color: "#FFFFFF",
                    lineHeight: 1.15,
                    letterSpacing: "-0.5px"
                  }}>
                    Administration Login 🛡️
                  </Typography>
                  <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem", mt: 0.6, fontWeight: 500 }}>
                    Sign in with elevated administrator credentials
                  </Typography>
                </Box>
              )}

              {/* FORM */}
              <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.2 }}>

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
                  error={!isAdminMode && formData.username.length > 0 && formData.username.length < 10}
                  helperText={!isAdminMode && formData.username.length === 10 ? "✓ Valid mobile number" : ""}
                  FormHelperTextProps={{ sx: { color: "#10B981", fontWeight: 700, fontSize: "0.76rem", ml: 0.5 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {isAdminMode ? (
                          <Box sx={{
                            width: 34, height: 34, borderRadius: "10px",
                            bgcolor: formData.username ? "rgba(254, 128, 1, 0.2)" : "rgba(255, 255, 255, 0.08)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            mr: 0.5,
                            transition: "all 0.2s ease"
                          }}>
                            <PersonOutline sx={{ color: formData.username ? "#FFA033" : "#94A3B8", fontSize: "1.2rem" }} />
                          </Box>
                        ) : (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mr: 0.5 }}>
                            <Box sx={{
                              width: 34, height: 34, borderRadius: "10px",
                              bgcolor: formData.username.length === 10 ? "rgba(16, 185, 129, 0.2)" : (formData.username ? "rgba(254, 128, 1, 0.2)" : "rgba(255, 255, 255, 0.08)"),
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.2s ease"
                            }}>
                              <PhoneAndroid sx={{
                                color: formData.username.length === 10 ? "#34D399" : (formData.username ? "#FFA033" : "#94A3B8"),
                                fontSize: "1.15rem"
                              }} />
                            </Box>
                            <Typography sx={{ color: "#FFFFFF", fontWeight: 800, fontSize: "0.92rem", letterSpacing: "0.5px" }}>+91</Typography>
                            <Box sx={{ width: "1.5px", height: "18px", bgcolor: "rgba(255, 255, 255, 0.2)" }} />
                          </Box>
                        )}
                      </InputAdornment>
                    ),
                    endAdornment: !isAdminMode && formData.username.length === 10 ? (
                      <InputAdornment position="end">
                        <Chip
                          label="Valid"
                          size="small"
                          icon={<CheckCircle sx={{ fontSize: "13px !important", color: "#10B981" }} />}
                          sx={{
                            bgcolor: "#ECFDF5",
                            color: "#059669",
                            border: "1px solid #A7F3D0",
                            fontWeight: 800,
                            fontSize: "0.68rem",
                            height: "22px"
                          }}
                        />
                      </InputAdornment>
                    ) : undefined
                  }}
                  sx={{
                    ...premiumFieldSx,
                    ...(!isAdminMode && formData.username.length === 10 ? {
                      "& .MuiOutlinedInput-root": {
                        ...premiumFieldSx["& .MuiOutlinedInput-root"],
                        "& fieldset": { borderColor: "#10B981" },
                        "&.Mui-focused fieldset": { borderColor: "#10B981" },
                      }
                    } : {})
                  }}
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
                          width: 34, height: 34, borderRadius: "10px",
                          bgcolor: formData.password ? "rgba(254, 128, 1, 0.2)" : "rgba(255, 255, 255, 0.08)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          mr: 0.5,
                          transition: "all 0.2s ease"
                        }}>
                          <LockOutlined sx={{ color: formData.password ? "#FFA033" : "#94A3B8", fontSize: "1.2rem" }} />
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
                            color: "#94A3B8",
                            mr: 0.5,
                            borderRadius: "10px",
                            p: 0.8,
                            "&:hover": { color: "#FFA033", bgcolor: "rgba(255, 255, 255, 0.08)" }
                          }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={premiumFieldSx}
                />

                {/* Remember me + Forgot password */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        size="small"
                        sx={{ color: "rgba(255, 255, 255, 0.4)", "&.Mui-checked": { color: "#FE8001" }, p: 0.5 }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: "0.82rem", color: "#E2E8F0", fontWeight: 600 }}>
                        Remember me
                      </Typography>
                    }
                  />
                  <MuiLink
                    component="button" type="button"
                    onClick={() => setIsResetMode(true)}
                    underline="none"
                    sx={{
                      fontSize: "0.82rem", color: "#FFA033", fontWeight: 700,
                      transition: "color 0.2s ease",
                      "&:hover": { color: "#FFB866", textDecoration: "underline" }
                    }}
                  >
                    Forgot password?
                  </MuiLink>
                </Box>

                {/* Sign In CTA Button */}
                <Button
                  type="submit" fullWidth variant="contained"
                  disabled={isPending}
                  endIcon={!isPending && <ArrowForward sx={{ fontSize: "1.15rem", transition: "transform 0.2s ease" }} />}
                  sx={{
                    mt: 0.5,
                    py: 1.65,
                    background: isAdminMode
                      ? "linear-gradient(135deg, #15242A 0%, #1F333B 100%)"
                      : "linear-gradient(135deg, #FE8001 0%, #FFA033 100%)",
                    color: "#FFFFFF",
                    fontWeight: 900,
                    fontSize: "1.02rem",
                    letterSpacing: "0.3px",
                    borderRadius: "16px",
                    textTransform: "none",
                    boxShadow: isAdminMode
                      ? "0 10px 28px rgba(21, 36, 42, 0.35)"
                      : "0 10px 28px rgba(254, 128, 1, 0.4)",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      background: isAdminMode
                        ? "linear-gradient(135deg, #0B1317 0%, #15242A 100%)"
                        : "linear-gradient(135deg, #E06F00 0%, #FE8001 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: isAdminMode
                        ? "0 14px 34px rgba(21, 36, 42, 0.45)"
                        : "0 14px 34px rgba(254, 128, 1, 0.5)",
                      "& .MuiButton-endIcon": {
                        transform: "translateX(4px)"
                      }
                    },
                    "&:active": { transform: "translateY(0)" },
                    "&:disabled": { background: "#E2E8F0", color: "#94A3B8", boxShadow: "none" },
                  }}
                >
                  {isPending ? "Signing In…" : (isAdminMode ? "Sign In as Administrator" : "Sign In to Dashboard")}
                </Button>

                {/* ── Login as Administration / Back to Member Toggle Link (Below Button) ── */}
                {!isAdminMode ? (
                  <Box sx={{ textAlign: "center", mt: 0.8, mb: 0.5 }}>
                    <MuiLink
                      component="button"
                      type="button"
                      onClick={() => { setIsAdminMode(true); setFormData({ username: "", password: "" }); }}
                      underline="none"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.8,
                        color: "#E2E8F0",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        cursor: "pointer",
                        border: "none",
                        background: "none",
                        p: 0.6,
                        borderRadius: "10px",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          color: "#FFA033",
                          bgcolor: "rgba(255, 255, 255, 0.08)"
                        }
                      }}
                    >
                      <AdminPanelSettings sx={{ fontSize: "1.15rem", color: "#FE8001" }} />
                      Login as Administration
                    </MuiLink>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", mt: 0.8, mb: 0.5 }}>
                    <MuiLink
                      component="button"
                      type="button"
                      onClick={() => { setIsAdminMode(false); setFormData({ username: "", password: "" }); }}
                      underline="none"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.8,
                        color: "#E2E8F0",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        cursor: "pointer",
                        border: "none",
                        background: "none",
                        p: 0.6,
                        borderRadius: "10px",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          color: "#FFA033",
                          bgcolor: "rgba(255, 255, 255, 0.08)"
                        }
                      }}
                    >
                      <ArrowBack sx={{ fontSize: "1.05rem", color: "#FE8001" }} />
                      Back to Member Login
                    </MuiLink>
                  </Box>
                )}

                {/* Register (Only for Members) */}
                {!isAdminMode && (
                  <>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 0.5 }}>
                      <Box sx={{ flex: 1, height: "1px", bgcolor: "rgba(255, 255, 255, 0.14)" }} />
                      <Typography sx={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.5)", fontWeight: 700, px: 0.5 }}>OR</Typography>
                      <Box sx={{ flex: 1, height: "1px", bgcolor: "rgba(255, 255, 255, 0.14)" }} />
                    </Box>

                    <Button
                      component={Link} to="/register"
                      fullWidth variant="outlined"
                      sx={{
                        py: 1.35,
                        color: "#FFFFFF",
                        borderColor: "rgba(255, 255, 255, 0.24)",
                        borderWidth: "1.5px",
                        fontWeight: 800,
                        fontSize: "0.92rem",
                        borderRadius: "16px",
                        textTransform: "none",
                        bgcolor: "rgba(255, 255, 255, 0.04)",
                        transition: "all 0.25s ease",
                        "&:hover": {
                          borderColor: "#FE8001",
                          borderWidth: "1.5px",
                          bgcolor: "rgba(254, 128, 1, 0.12)",
                          color: "#FE8001",
                          boxShadow: "0 4px 14px rgba(254,128,1,0.2)",
                          transform: "translateY(-1px)"
                        }
                      }}
                    >
                      Create New Account
                    </Button>
                  </>
                )}

                {/* Support and Security Footer */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1, borderTop: "1px solid rgba(255, 255, 255, 0.1)", mt: 0.5 }}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <MuiLink
                      component="button" type="button"
                      onClick={() => setOpenMsgDialog(true)}
                      underline="none"
                      sx={{
                        display: "flex", alignItems: "center", gap: 0.5,
                        fontSize: "0.8rem", color: "#94A3B8", fontWeight: 600,
                        "&:hover": { color: "#FFA033" }
                      }}
                    >
                      <ChatBubbleOutline sx={{ fontSize: "0.95rem" }} />
                      Message Us
                    </MuiLink>
                    <MuiLink
                      href="mailto:support@eshopy.com"
                      underline="none"
                      sx={{
                        display: "flex", alignItems: "center", gap: 0.5,
                        fontSize: "0.8rem", color: "#94A3B8", fontWeight: 600,
                        "&:hover": { color: "#FFA033" }
                      }}
                    >
                      <EmailOutlined sx={{ fontSize: "0.95rem" }} />
                      Helpdesk
                    </MuiLink>
                  </Box>

                  <Chip
                    icon={<Security sx={{ fontSize: "14px !important", color: "#34D399" }} />}
                    label="SSL 256-Bit"
                    size="small"
                    sx={{
                      bgcolor: "rgba(16, 185, 129, 0.15)",
                      color: "#34D399",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      fontWeight: 700,
                      fontSize: "0.68rem",
                      height: "22px"
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

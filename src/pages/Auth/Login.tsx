import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Checkbox,
  FormControlLabel, Link as MuiLink, InputAdornment,
  IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions
} from '@mui/material';
import {
  Visibility, VisibilityOff, PersonOutline,
  LockOutlined, PhoneAndroid, Close as CloseIcon,
  ArrowForward, AdminPanelSettings, ArrowBack
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { post } from '../../api/Api';
import { LoadingComponent } from '../../App';
import { useLoginMutation } from '../../api/Auth';
import ForgotPasswordForm from "./components/ForgotPasswordForm";

// Brand input field style
const lightFieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#1F333B",
    bgcolor: "#ffffff",
    borderRadius: "14px",
    fontSize: "0.95rem",
    "& fieldset": { borderColor: "#E2E8F0", borderWidth: "1.5px" },
    "&:hover fieldset": { borderColor: "#FFA033" },
    "&.Mui-focused fieldset": { borderColor: "#FE8001", borderWidth: "2px" },
  },
  "& .MuiInputLabel-root": { color: "#889EA6", fontWeight: 500 },
  "& .MuiInputLabel-root.Mui-focused": { color: "#FE8001" },
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
      flexDirection: "column",
      bgcolor: "#FFFFFF",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* ── HERO TOP PANEL ─────────────────────────── */}
      <Box sx={{
        position: "relative",
        background: "linear-gradient(145deg, #1F333B 0%, #FE8001 60%, #FF9933 100%)",
        pt: { xs: 4.5, sm: 6 },
        pb: { xs: 7, sm: 8 },
        px: 3,
        minHeight: { xs: "26vh", sm: "28vh" },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}>

        {/* Background decorative rings */}
        <Box sx={{
          position: "absolute", top: -70, right: -70,
          width: 220, height: 220, borderRadius: "50%",
          border: "2px solid rgba(244, 201, 93, 0.12)",
          background: "rgba(244, 201, 93, 0.05)",
        }} />
        <Box sx={{
          position: "absolute", bottom: 40, left: -40,
          width: 140, height: 140, borderRadius: "50%",
        }} />

        {/* Logo + Brand */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", zIndex: 1 }}>
          {/* Golden rounded-square logo */}
          <Box sx={{
            width: 62, height: 62,
            borderRadius: "20px",
            background: "linear-gradient(135deg, #F4C95D 0%, #f8dc8a 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            mb: 1.2,
            boxShadow: "0 6px 22px rgba(244, 201, 93, 0.4)",
            transform: "rotate(-3deg)",
          }}>
            <Typography sx={{ fontSize: "1.9rem", fontWeight: 950, color: "#FE8001", transform: "rotate(3deg)" }}>
              E
            </Typography>
          </Box>

          <Typography sx={{
            fontWeight: 950,
            fontSize: { xs: "2.1rem", sm: "2.5rem" },
            letterSpacing: "3.5px",
            color: "#FFFFFF",
            lineHeight: 1,
            textShadow: "0 2px 10px rgba(45,15,30,0.3)",
          }}>
            ECASH
          </Typography>
        </Box>

        {/* Distinct Layered Wavy Bottom Shape */}
        <Box sx={{ position: "absolute", bottom: -1, left: 0, right: 0, lineHeight: 0, pointerEvents: "none" }}>
          <svg
            viewBox="0 0 1440 120"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            style={{ display: "block", width: "100%", height: "54px" }}
          >
            {/* Soft translucent background wave */}
            <path
              d="M0,40 C320,95 480,10 800,60 C1120,110 1280,25 1440,55 L1440,120 L0,120 Z"
              fill="rgba(229, 152, 155, 0.35)"
            />
            {/* Main foreground wave curve */}
            <path
              d="M0,65 C280,120 540,30 840,85 C1100,130 1320,40 1440,70 L1440,120 L0,120 Z"
              fill="#FFFFFF"
            />
          </svg>
        </Box>
      </Box>

      {/* ── FORM AREA ──────────────────────────────── */}
      <Box sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        px: { xs: 2, sm: 3 },
        pt: 2,
        pb: 5,
        bgcolor: "#F8FAFC",
      }}>
        <Box sx={{ width: "100%", maxWidth: 400 }}>

          {isResetMode ? (
            <Box sx={{
              bgcolor: "#fff",
              borderRadius: "24px",
              p: 3,
              boxShadow: "0 4px 24px rgba(31,51,59,0.08)",
              border: "1px solid #E2E8F0"
            }}>
              <ForgotPasswordForm onBackToLogin={() => setIsResetMode(false)} />
            </Box>
          ) : (
            <>
              {/* Welcome heading */}
              <Box sx={{ mb: 3, textAlign: "center" }}>
                <Typography sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.45rem", sm: "1.65rem" },
                  color: "#1F333B",
                  lineHeight: 1.2,
                }}>
                  {isAdminMode ? "Administration Portal 🛡️" : "Welcome Back 👋"}
                </Typography>
                <Typography sx={{ color: "#526E78", fontSize: "0.85rem", mt: 0.6, fontWeight: 500 }}>
                  {isAdminMode
                    ? "Sign in with administrator credentials"
                    : "Sign in with your mobile number & password"}
                </Typography>
              </Box>

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
                  FormHelperTextProps={{ sx: { color: "#38a169", fontWeight: 600, fontSize: "0.76rem", ml: 0.5 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {isAdminMode
                          ? <PersonOutline sx={{ color: formData.username ? "#FE8001" : "#b08090", fontSize: "1.2rem" }} />
                          : <PhoneAndroid sx={{ color: formData.username.length === 10 ? "#38a169" : "#b08090", fontSize: "1.2rem" }} />
                        }
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    ...lightFieldSx,
                    ...(!isAdminMode && formData.username.length === 10 ? {
                      "& .MuiOutlinedInput-root": {
                        ...lightFieldSx["& .MuiOutlinedInput-root"],
                        "& fieldset": { borderColor: "rgba(56, 161, 105, 0.6)" },
                        "&.Mui-focused fieldset": { borderColor: "#38a169" },
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
                        <LockOutlined sx={{ color: formData.password ? "#FE8001" : "#b08090", fontSize: "1.2rem" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(s => !s)}
                          onMouseDown={e => e.preventDefault()}
                          edge="end" size="small"
                          sx={{ color: "#b08090", mr: 0.5, "&:hover": { color: "#FE8001", bgcolor: "rgba(109,33,79,0.06)" } }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={lightFieldSx}
                />

                {/* Remember me + Forgot */}
                {/* Remember me + Forgot */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        size="small"
                        sx={{ color: "#E2E8F0", "&.Mui-checked": { color: "#FE8001" }, p: 0.5 }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: "0.82rem", color: "#526E78", fontWeight: 500 }}>
                        Remember me
                      </Typography>
                    }
                  />
                  <MuiLink
                    component="button" type="button"
                    onClick={() => setIsResetMode(true)}
                    underline="none"
                    sx={{
                      fontSize: "0.82rem", color: "#FE8001", fontWeight: 700,
                      borderBottom: "1.5px dashed rgba(254,128,1,0.3)",
                      pb: "1px",
                      "&:hover": { color: "#E06F00", borderBottomColor: "#FE8001" }
                    }}
                  >
                    Forgot password?
                  </MuiLink>
                </Box>

                {/* Sign In Button */}
                <Button
                  type="submit" fullWidth variant="contained"
                  disabled={isPending}
                  endIcon={!isPending && <ArrowForward sx={{ fontSize: "1.1rem" }} />}
                  sx={{
                    mt: 0.5,
                    py: 1.65,
                    background: isAdminMode 
                      ? "linear-gradient(135deg, #1F333B 0%, #2B444E 100%)"
                      : "linear-gradient(135deg, #FE8001 0%, #FFA033 100%)",
                    color: "#FFFFFF",
                    fontWeight: 900,
                    fontSize: "1rem",
                    letterSpacing: "0.4px",
                    borderRadius: "14px",
                    textTransform: "none",
                    boxShadow: isAdminMode
                      ? "0 6px 22px rgba(31, 51, 59, 0.3)"
                      : "0 6px 22px rgba(254, 128, 1, 0.35)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      background: isAdminMode
                        ? "linear-gradient(135deg, #15242A 0%, #1F333B 100%)"
                        : "linear-gradient(135deg, #E06F00 0%, #FE8001 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: isAdminMode
                        ? "0 12px 30px rgba(31, 51, 59, 0.4)"
                        : "0 12px 30px rgba(254, 128, 1, 0.45)",
                    },
                    "&:active": { transform: "translateY(0)" },
                    "&:disabled": { background: "#E2E8F0", color: "#889EA6", boxShadow: "none" },
                  }}
                >
                  {isPending ? "Signing In…" : (isAdminMode ? "Sign In as Administrator" : "Sign In")}
                </Button>

                {/* ── Login as Administration / Back to Member Toggle Link ── */}
                {!isAdminMode ? (
                  <Box sx={{ textAlign: "center", mt: 0.5, mb: 0.5 }}>
                    <MuiLink
                      component="button"
                      type="button"
                      onClick={() => { setIsAdminMode(true); setFormData({ username: "", password: "" }); }}
                      underline="none"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.8,
                        color: "#1F333B",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        cursor: "pointer",
                        border: "none",
                        background: "none",
                        p: 0.5,
                        "&:hover": {
                          color: "#FE8001",
                          textDecoration: "underline",
                        }
                      }}
                    >
                      <AdminPanelSettings sx={{ fontSize: "1.1rem", color: "#FE8001" }} />
                      Login as Administration
                    </MuiLink>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", mt: 0.5, mb: 0.5 }}>
                    <MuiLink
                      component="button"
                      type="button"
                      onClick={() => { setIsAdminMode(false); setFormData({ username: "", password: "" }); }}
                      underline="none"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.8,
                        color: "#1F333B",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        cursor: "pointer",
                        border: "none",
                        background: "none",
                        p: 0.5,
                        "&:hover": {
                          color: "#FE8001",
                          textDecoration: "underline",
                        }
                      }}
                    >
                      <ArrowBack sx={{ fontSize: "1rem", color: "#FE8001" }} />
                      Back to Member Login
                    </MuiLink>
                  </Box>
                )}

                {/* ── OR divider & Create Account (Only for Members) ── */}
                {!isAdminMode && (
                  <>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 0.5 }}>
                      <Box sx={{ flex: 1, height: "1.5px", background: "linear-gradient(to right, transparent, #E2E8F0)" }} />
                      <Typography sx={{ fontSize: "0.78rem", color: "#889EA6", fontWeight: 600, px: 0.5 }}>OR</Typography>
                      <Box sx={{ flex: 1, height: "1.5px", background: "linear-gradient(to left, transparent, #E2E8F0)" }} />
                    </Box>

                    <Button
                      component={Link} to="/register"
                      fullWidth variant="outlined"
                      sx={{
                        py: 1.4,
                        color: "#1F333B",
                        borderColor: "#E2E8F0",
                        borderWidth: "1.5px",
                        fontWeight: 800,
                        fontSize: "0.92rem",
                        borderRadius: "14px",
                        textTransform: "none",
                        bgcolor: "#FFFFFF",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          borderColor: "#FE8001",
                          borderWidth: "1.5px",
                          bgcolor: "rgba(254, 128, 1, 0.05)",
                          color: "#FE8001",
                          boxShadow: "0 4px 14px rgba(254,128,1,0.12)",
                        }
                      }}
                    >
                      Create New Account
                    </Button>
                  </>
                )}

                {/* Support links */}
                <Box sx={{ display: "flex", justifyContent: "center", gap: 3, pt: 0.5, flexWrap: "wrap" }}>
                  <MuiLink
                    component="button" type="button"
                    onClick={() => setOpenMsgDialog(true)}
                    underline="hover"
                    sx={{ fontSize: "0.8rem", color: "#889EA6", fontWeight: 500, "&:hover": { color: "#FE8001" } }}
                  >
                    💬 Message Us
                  </MuiLink>
                  <MuiLink
                    href="mailto:support@ecash.com"
                    underline="hover"
                    sx={{ fontSize: "0.8rem", color: "#889EA6", fontWeight: 500, "&:hover": { color: "#FE8001" } }}
                  >
                    ✉️ Mail To Us
                  </MuiLink>
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
            borderRadius: "20px",
            mx: { xs: 2, sm: "auto" },
            border: "1px solid #E2E8F0",
            boxShadow: "0 20px 48px rgba(31,51,59,0.12)",
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1.5 }}>
          <Typography variant="h6" fontWeight={800} color="#1F333B">Message Support</Typography>
          <IconButton onClick={() => setOpenMsgDialog(false)} sx={{ color: "#889EA6" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Your Name" fullWidth variant="outlined"
            value={guestMsgData.name}
            onChange={e => setGuestMsgData({ ...guestMsgData, name: e.target.value })}
            sx={lightFieldSx} />
          <TextField label="Mobile Number" fullWidth variant="outlined"
            value={guestMsgData.phone}
            onChange={e => setGuestMsgData({ ...guestMsgData, phone: e.target.value })}
            sx={lightFieldSx} />
          <TextField label="Message" fullWidth multiline rows={4} variant="outlined"
            value={guestMsgData.message}
            onChange={e => setGuestMsgData({ ...guestMsgData, message: e.target.value })}
            sx={lightFieldSx} />
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: "1px solid #E2E8F0", gap: 1 }}>
          <Button onClick={() => setOpenMsgDialog(false)}
            sx={{ color: "#889EA6", fontWeight: 600, textTransform: "none", borderRadius: "10px" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSendGuestMessage}
            variant="contained" disabled={isSendingMsg}
            sx={{
              background: "linear-gradient(135deg, #FE8001 0%, #FFA033 100%)",
              color: "#FFFFFF", fontWeight: 700, borderRadius: "10px",
              textTransform: "none",
              boxShadow: "0 4px 12px rgba(254,128,1,0.3)",
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

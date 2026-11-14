import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, InputAdornment, FormControl, FormLabel,
  FormControlLabel, Radio, RadioGroup, Checkbox, FormHelperText, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid, useTheme, useMediaQuery,
  Avatar, MenuItem, IconButton, CircularProgress
} from '@mui/material';
import {
  Visibility, VisibilityOff, CheckCircle as CheckCircleIcon,
  ContentCopy as ContentCopyIcon, Check as CheckIcon,
  Badge as BadgeIcon, Key as KeyIcon, Groups as GroupsIcon,
  PhoneAndroid as PhoneAndroidIcon
} from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';

import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import WcIcon from "@mui/icons-material/Wc";
import PublicIcon from '@mui/icons-material/Public';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useGetSponserRef, useSignupMutation } from '../../api/Auth';
import { post } from '../../api/Api';
import { LoadingComponent } from '../../App';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { toast } from 'react-toastify';
import { auth } from '../../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "India",
  "Germany", "France", "Japan", "China", "Brazil", "South Africa",
  "Nigeria", "United Arab Emirates", "Singapore", "Malaysia",
  "New Zealand", "Netherlands", "Switzerland", "Sweden", "Spain",
  "Italy", "Mexico", "Argentina", "Colombia", "Chile", "Peru",
  "Philippines", "Indonesia", "Vietnam", "Thailand", "South Korea",
  "Pakistan", "Bangladesh", "Sri Lanka", "Nepal", "Saudi Arabia",
  "Qatar", "Oman", "Kuwait", "Bahrain", "Egypt", "Kenya", "Ghana",
  "Uganda", "Tanzania", "Morocco", "Algeria", "Tunisia", "Turkey",
  "Iran", "Iraq", "Israel", "Jordan", "Lebanon", "Russia", "Ukraine",
  "Poland", "Romania", "Czech Republic", "Hungary", "Greece", "Portugal",
  "Ireland", "Belgium", "Austria", "Denmark", "Finland", "Norway"
].sort();

const Register = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref") || searchParams.get("referralcode") || searchParams.get("referralCode") || "";

  const [formData, setFormData] = useState<Record<string, string>>({
    Sponsor_code: "",
    Sponsor_name: "",
    gender: "",
    Name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileno: "",
    pincode: "",
    country: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [genderError, setGenderError] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSuccessPassword, setShowSuccessPassword] = useState(false);
  const [registrationData, setRegistrationData] = useState<{
    memberId: string;
    userId: string;
    password: string;
    sponsorId: string;
    sponsorName: string;
    email: string;
    mobile: string;
    name: string;
  }>({
    memberId: '',
    userId: '',
    password: '',
    sponsorId: '',
    sponsorName: '',
    email: '',
    mobile: '',
    name: '',
  });

  const handleCopy = (field: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleCopyAll = () => {
    const summary =
      `🎉 E-Shophy Registration Details\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📱 Login ID (Mobile): ${registrationData.memberId || registrationData.mobile}\n` +
      (registrationData.userId ? `🆔 User ID: ${registrationData.userId}\n` : '') +
      `🔑 Password: ${registrationData.password}\n` +
      (registrationData.sponsorId ? `👥 Sponsor ID: ${registrationData.sponsorId}${registrationData.sponsorName ? ` (${registrationData.sponsorName})` : ''}\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🌐 Login at: ${window.location.origin}/login`;

    navigator.clipboard.writeText(summary);
    setCopiedField("ALL");
    toast.success("All credentials copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2500);
  };

  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [firebaseToken, setFirebaseToken] = useState<string>("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  // Firebase Phone Auth active (no test OTP)

  
  useEffect(() => {
    return () => {
      if ((window as any).registerRecaptchaVerifier) {
        try {
          (window as any).registerRecaptchaVerifier.clear();
        } catch (e) {}
        (window as any).registerRecaptchaVerifier = null;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    if (!(window as any).registerRecaptchaVerifier) {
      (window as any).registerRecaptchaVerifier = new RecaptchaVerifier(auth, 'register-recaptcha', {
        size: 'invisible',
        callback: () => {}
      });
    }
  };

  const { data: sponsorData, isLoading, isError, error, refetch } = useGetSponserRef(formData.Sponsor_code);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOTP = async () => {
    let cleanMobile = formData.mobileno.replace(/\D/g, "");
    if (cleanMobile.length > 10) cleanMobile = cleanMobile.slice(-10);

    if (!cleanMobile || cleanMobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number first");
      return;
    }

    setIsSendingOTP(true);
    try {
      // 1. Verify mobile is not already registered
      const checkRes: any = await post("/auth/check-mobile", {
        mobileno: cleanMobile
      });

      if (!checkRes.success) {
        toast.error(checkRes.message || "This mobile number is already registered. Please login instead.");
        return;
      }

      // 2. Format phone number with +91 country code for Firebase
      const formattedPhone = `+91${cleanMobile}`;

      // 3. Setup Recaptcha and trigger real Firebase SMS
      setupRecaptcha();
      const appVerifier = (window as any).registerRecaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);

      setOtp("");
      setOtpDialogOpen(true);
      setResendCooldown(60);
      toast.success("OTP sent to your mobile phone via SMS!");
    } catch (error: any) {
      console.error("Firebase SMS Error:", error);
      if ((window as any).registerRecaptchaVerifier) {
        try {
          (window as any).registerRecaptchaVerifier.clear();
        } catch (e) {}
        (window as any).registerRecaptchaVerifier = null;
      }
      const msg = error.code === 'auth/invalid-phone-number'
        ? "Invalid phone number format."
        : error.code === 'auth/too-many-requests'
        ? "Too many requests. Please wait a few minutes."
        : error.message || "Failed to send OTP via SMS.";
      toast.error(msg);
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    if (!confirmationResult) {
      toast.error("Session expired. Please click Resend OTP.");
      return;
    }

    setIsVerifyingOTP(true);
    try {
      const result = await confirmationResult.confirm(otp.trim());
      const idToken = await result.user.getIdToken();
      setFirebaseToken(idToken);
      setIsMobileVerified(true);
      setOtpDialogOpen(false);
      setOtp("");
      toast.success("Mobile number verified successfully!");
    } catch (error: any) {
      console.error("Firebase Verification Error:", error);
      toast.error("Invalid or expired OTP. Please check the SMS and try again.");
      setOtp("");
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  useEffect(() => {
    if (refCode) setFormData(prev => ({ ...prev, Sponsor_code: refCode }));
  }, [refCode]);

  useEffect(() => {
    if (formData.Sponsor_code && formData.Sponsor_code.length >= 3) refetch();
  }, [formData.Sponsor_code, refetch]);

  useEffect(() => {
    if (sponsorData && sponsorData.name) {
      setFormData(prev => ({ ...prev, Sponsor_name: sponsorData.name }));
    } else if (isError) {
      setFormData(prev => ({ ...prev, Sponsor_name: "" }));
    }
  }, [sponsorData, isError]);

  const sponsorError = isError && error instanceof Error ? error.message : "";

  const handleSponsorCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, Sponsor_code: e.target.value, Sponsor_name: "" }));
  };

  const handleSponsorCodeBlur = () => {
    if (formData.Sponsor_code && formData.Sponsor_code.length >= 3) refetch();
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
    setErrorMessage("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "mobileno") {
      let cleanValue = value.replace(/\D/g, "");
      if (cleanValue.length > 10 && cleanValue.startsWith("91")) {
        cleanValue = cleanValue.slice(-10);
      } else if (cleanValue.length > 10) {
        cleanValue = cleanValue.slice(-10);
      }
      if (isMobileVerified && cleanValue !== formData.mobileno) {
        setIsMobileVerified(false);
        setFirebaseToken("");
      }
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevData => ({ ...prevData, gender: e.target.value }));
    setGenderError(false);
  };

  const { mutate, isPending } = useSignupMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.gender) return setGenderError(true);
    if (!formData.Sponsor_code || formData.Sponsor_code.length < 3) return setErrorMessage("Valid sponsor code is required");
    if (!formData.Sponsor_name) return setErrorMessage("Please enter a valid sponsor code");
    if (!formData.country) return setErrorMessage("Country is required");
    if (!/^\d{10}$/.test(formData.mobileno)) return setErrorMessage("Please enter a valid 10-digit mobile number");

    if (!isMobileVerified) {
      toast.error("Please verify your mobile number with OTP before registering");
      return setErrorMessage("Please verify your mobile number with OTP before registering");
    }

    if (!formData.password || formData.password.length < 6) {
      return setErrorMessage("Password must be at least 6 characters");
    }
    if (formData.password !== formData.confirmPassword) {
      return setErrorMessage("Passwords do not match");
    }

    try {
      const finalData = {
        ...formData,
        sponsor_id: formData.Sponsor_code,
        Sponsor_code: formData.Sponsor_code,
        Sponsor_name: formData.Sponsor_name,
        spackage: 'E shopy Plan',
        password: formData.password,
        otp: firebaseToken,
      };

      mutate(finalData, {
        onSuccess: (response: any) => {
          if (response.success) {
            setRegistrationData({
              memberId: response.user?.Member_id || formData.mobileno,
              userId: response.user?.member_code || response.user?.user_id || response.user?.Member_id || '',
              password: formData.password,
              sponsorId: response.user?.sponsor_id || formData.Sponsor_code,
              sponsorName: response.user?.sponsor_name || formData.Sponsor_name || '',
              email: response.user?.email || formData.email,
              mobile: response.user?.mobileno || formData.mobileno,
              name: response.user?.Name || formData.Name,
            });
            setSuccessDialogOpen(true);
          }
        },
        onError: (error: any) => {
          setErrorMessage(error.response?.data?.message || "Registration failed");
        }
      });
    } catch (error: any) {
      setErrorMessage("Registration failed. Please try again.");
    }
  };

  const handleCloseDialog = () => {
    setSuccessDialogOpen(false);
    navigate("/login");
  };

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      color: "#1F333B",
      bgcolor: "#ffffff",
      borderRadius: "14px",
      transition: "all 0.3s ease",
      "& fieldset": { borderColor: "#FED7AA", borderWidth: "1.5px" },
      "&:hover fieldset": { borderColor: "#E5989B" },
      "&.Mui-focused fieldset": { borderColor: "#FE8001", borderWidth: "2px" },
    },
    "& .MuiInputLabel-root": { color: "#b08090", fontWeight: 500 },
    "& .MuiInputLabel-root.Mui-focused": { color: "#FE8001" },
    "& .MuiOutlinedInput-input::placeholder": { color: "#b08090", opacity: 0.8 }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#FFFFFF", position: 'relative', overflow: 'hidden' }}>
      {/* Background decorations */}
      <Box sx={{ position: 'fixed', top: '-10%', left: '-10%', width: '50vw', height: '50vw', minWidth: '300px', minHeight: '300px', background: 'radial-gradient(circle, rgba(229, 152, 155, 0.15) 0%, rgba(255, 248, 240, 0) 70%)', filter: 'blur(60px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />
      <Box sx={{ position: 'fixed', bottom: '-10%', right: '-5%', width: '40vw', height: '40vw', minWidth: '250px', minHeight: '250px', background: 'radial-gradient(circle, rgba(244, 201, 93, 0.15) 0%, rgba(255, 248, 240, 0) 70%)', filter: 'blur(60px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />

      {/* Main Content */}
      <Box
        sx={{
          display: 'flex', flex: 1, position: 'relative', zIndex: 1,
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: 'center', justifyContent: 'center',
          p: { xs: 2, sm: 3, md: 4, lg: 6 },
          gap: { xs: 3, lg: 8 },
        }}
      >
        {/* Left Branding */}
        <Box
          sx={{
            display: 'flex', flexDirection: 'column',
            alignItems: { xs: 'center', lg: 'flex-start' },
            textAlign: { xs: 'center', lg: 'left' },
            maxWidth: { xs: '100%', lg: '420px' }, width: '100%'
          }}
        >
          <Box
            component="img"
            src="/e-shopy.svg"
            alt="E-shopy Logo"
            sx={{
              height: { xs: 52, lg: 68 },
              bgcolor: '#FFFFFF',
              px: 2,
              py: 0.8,
              borderRadius: '16px',
              objectFit: 'contain',
              mb: 2,
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)'
            }}
          />
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
              {[
                { label: 'Secure', icon: <LockIcon /> },
                { label: 'Global', icon: <PublicIcon /> },
                { label: 'Premium', icon: <AutoAwesomeIcon /> }
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'rgba(254, 128, 1,  )', color: '#FE8001', width: 56, height: 56, border: '1.5px solid #F4C95D' }}>
                    {item.icon}
                  </Avatar>
                  <Typography variant="caption" sx={{ color: '#7a5060', fontWeight: 700 }}>{item.label}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Right Form Card */}
        <Box
          sx={{
            width: '100%', maxWidth: { xs: '100%', sm: '520px', lg: '560px' },
            bgcolor: '#ffffff',
            borderRadius: { xs: '20px', sm: '24px' },
            border: '1px solid #FED7AA',
            boxShadow: '0 16px 40px rgba(109,33,79,0.08)',
            p: { xs: 2.5, sm: 4 },
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            sx={{ color: "#1F333B", fontWeight: 800, mb: 0.5, textAlign: { xs: 'center', sm: 'left' }, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
          >
            Create Account
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#b08090", mb: 3, textAlign: { xs: 'center', sm: 'left' }, fontSize: { xs: '0.82rem', sm: '0.875rem' }, fontWeight: 500 }}
          >
            Fill in your details below to get started.
          </Typography>

          {errorMessage && (
            <Box sx={{ p: 1.5, mb: 2.5, borderRadius: '12px', bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <Typography color="error" variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.85rem' }}>
                <span>⚠️</span> {errorMessage}
              </Typography>
            </Box>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <Grid container spacing={{ xs: 2, sm: 2.5 }}>

              {/* Sponsor Code */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required fullWidth name="Sponsor_code" placeholder="Sponsor Code"
                  value={formData.Sponsor_code} onChange={handleSponsorCodeChange} onBlur={handleSponsorCodeBlur}
                  error={(formData.Sponsor_code.length > 0 && formData.Sponsor_code.length < 3) || (formData.Sponsor_code.length >= 3 && !!sponsorError)}
                  helperText={
                    (formData.Sponsor_code.length > 0 && formData.Sponsor_code.length < 3)
                      ? "Minimum 3 chars."
                      : formData.Sponsor_code.length >= 3 && sponsorError ? sponsorError : ""
                  }
                  InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: "#b08090" }} /></InputAdornment> }}
                  sx={textFieldStyles}
                />
              </Grid>

              {/* Sponsor Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required fullWidth name="Sponsor_name" placeholder="Sponsor Name"
                  value={formData.Sponsor_name} disabled
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: "#b08090" }} /></InputAdornment> }}
                  sx={{
                    ...textFieldStyles,
                    "& .MuiOutlinedInput-root.Mui-disabled": { bgcolor: "#fdf8f8" },
                    "& .MuiOutlinedInput-input.Mui-disabled": { WebkitTextFillColor: "#FE8001", fontWeight: 700 }
                  }}
                />
              </Grid>

              {/* Full Name */}
              <Grid item xs={12}>
                <TextField
                  required fullWidth name="Name" placeholder="Full Name"
                  value={formData.Name} onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: "#b08090" }} /></InputAdornment> }}
                  sx={textFieldStyles}
                />
              </Grid>

              {/* Email & Mobile */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required fullWidth name="email" placeholder="Email Address" type="email"
                  value={formData.email} onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: "#b08090" }} /></InputAdornment> }}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required fullWidth name="mobileno" placeholder="Mobile Number (10 digits)" type="tel"
                  value={formData.mobileno} onChange={handleChange}
                  disabled={isMobileVerified}
                  inputProps={{ maxLength: 10, inputMode: "numeric" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: isMobileVerified ? "#38a169" : (formData.mobileno.length === 10 ? "#FE8001" : "#b08090") }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {isMobileVerified ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(56, 161, 105, 0.1)', px: 1, py: 0.4, borderRadius: '8px', border: '1px solid rgba(56, 161, 105, 0.3)' }}>
                            <CheckCircleIcon sx={{ color: '#38a169', fontSize: 16 }} />
                            <Typography sx={{ color: '#38a169', fontSize: '0.72rem', fontWeight: 700 }}>Verified</Typography>
                            <Button
                              size="small"
                              onClick={() => { setIsMobileVerified(false); setFirebaseToken(""); }}
                              sx={{ minWidth: 'auto', p: 0, ml: 0.5, color: '#b08090', fontSize: '0.65rem', textTransform: 'none', '&:hover': { color: '#ef4444' } }}
                            >
                              Edit
                            </Button>
                          </Box>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            disabled={formData.mobileno.length !== 10 || isSendingOTP}
                            onClick={handleSendOTP}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              py: 0.5,
                              px: 1.4,
                              borderRadius: '8px',
                              bgcolor: '#FE8001',
                              color: '#FFFFFF',
                              boxShadow: 'none',
                              '&:hover': { bgcolor: '#FF9933' },
                              '&:disabled': { color: '#a88098', bgcolor: '#FED7AA' }
                            }}
                          >
                            {isSendingOTP ? <CircularProgress size={14} sx={{ color: '#FFFFFF' }} /> : "Verify OTP"}
                          </Button>
                        )}
                      </InputAdornment>
                    )
                  }}
                  helperText={
                    !isMobileVerified && formData.mobileno.length === 10
                      ? "Click 'Verify OTP' to verify your number"
                      : ""
                  }
                  FormHelperTextProps={{
                    sx: { color: '#FE8001', fontSize: '0.72rem', mt: 0.5, fontWeight: 600 }
                  }}
                  sx={{
                    ...textFieldStyles,
                    "& .MuiOutlinedInput-root": {
                      ...textFieldStyles["& .MuiOutlinedInput-root"],
                      borderColor: isMobileVerified ? "#38a169 !important" : undefined
                    }
                  }}
                />
              </Grid>

              {/* Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required fullWidth name="password" placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password} onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: "#b08090" }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#b08090' }}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={textFieldStyles}
                />
              </Grid>

              {/* Confirm Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required fullWidth name="confirmPassword" placeholder="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword} onChange={handleChange}
                  error={!!(formData.confirmPassword && formData.password !== formData.confirmPassword)}
                  helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords do not match" : ""}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: "#b08090" }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: '#b08090' }}>
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={textFieldStyles}
                />
              </Grid>

              {/* Country & Pincode */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select required fullWidth name="country"
                  value={formData.country} onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PublicIcon sx={{ color: "#b08090" }} /></InputAdornment> }}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (value: any) => {
                      if (!value) return <span style={{ color: "#b08090" }}>Country</span>;
                      return value;
                    }
                  }}
                  sx={{ ...textFieldStyles, "& .MuiSelect-icon": { color: "#b08090" } }}
                >
                  <MenuItem disabled value=""><em>Country</em></MenuItem>
                  {COUNTRIES.map(country => (
                    <MenuItem key={country} value={country}>{country}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required fullWidth name="pincode" placeholder="Pincode"
                  value={formData.pincode} onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon sx={{ color: "#b08090" }} /></InputAdornment> }}
                  sx={textFieldStyles}
                />
              </Grid>

              {/* Gender */}
              <Grid item xs={12} sx={{ mt: 0.5 }}>
                <FormControl error={!!genderError}>
                  <FormLabel sx={{ color: "#1F333B", display: 'flex', alignItems: 'center', mb: 1, fontSize: '0.9rem', fontWeight: 600 }}>
                    <WcIcon sx={{ mr: 1, color: "#b08090", fontSize: '1.2rem' }} /> Gender
                  </FormLabel>
                  <RadioGroup row name="gender" value={formData.gender} onChange={handleRadioChange}>
                    <FormControlLabel value="Male" control={<Radio size="small" sx={{ color: "#E5989B", "&.Mui-checked": { color: "#FE8001" } }} />} label={<span style={{ color: "#1F333B", fontSize: '0.9rem', fontWeight: 500 }}>Male</span>} />
                    <FormControlLabel value="Female" control={<Radio size="small" sx={{ color: "#E5989B", "&.Mui-checked": { color: "#FE8001" } }} />} label={<span style={{ color: "#1F333B", fontSize: '0.9rem', fontWeight: 500 }}>Female</span>} />
                  </RadioGroup>
                  {genderError && <FormHelperText sx={{ color: "#ef4444", mx: 0 }}>Please select a gender</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Terms */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox checked={isChecked} onChange={handleCheckboxChange} size="small" sx={{ color: "#E5989B", "&.Mui-checked": { color: "#FE8001" } }} />}
                  label={
                    <Typography variant="body2" sx={{ color: "#7a5060", fontSize: { xs: '0.8rem', sm: '0.85rem' }, fontWeight: 500 }}>
                      I accept the Terms and Conditions
                    </Typography>
                  }
                />
              </Grid>

              {/* Submit */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Button
                  type="submit" fullWidth variant="contained" disabled={!isChecked || isPending}
                  sx={{
                    py: 1.7,
                    background: "linear-gradient(135deg, #FE8001 0%, #FF9933 100%)",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    fontSize: { xs: "0.95rem", sm: "1rem" },
                    borderRadius: "14px",
                    textTransform: "none",
                    boxShadow: "0 6px 22px rgba(109, 33, 79, 0.35)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "linear-gradient(135deg, #E06F00 0%, #FE8001 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 10px 28px rgba(109, 33, 79, 0.45)"
                    },
                    "&:disabled": { bgcolor: "#FED7AA", color: "#a88098" }
                  }}
                >
                  {isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="body2" sx={{ textAlign: "center", mt: 3, color: "#b08090", fontSize: { xs: '0.82rem', sm: '0.875rem' }, fontWeight: 500 }}>
            Already registered?{" "}
            <Link to="/login" style={{ color: "#FE8001", textDecoration: "none", fontWeight: 700 }}>
              Sign In
            </Link>
          </Typography>
        </Box>
      </Box>

      {/* Success Dialog with Login ID, User ID, Password & Sponsor ID */}
      <Dialog
        open={successDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#FFFFFF',
            border: '1.5px solid #FED7AA',
            borderRadius: { xs: '20px', sm: '24px' },
            p: { xs: 1.5, sm: 2.5 },
            boxShadow: '0 24px 60px rgba(254, 128, 1, 0.22)',
            mx: { xs: 1.5, sm: 'auto' },
            width: { xs: 'calc(100% - 24px)', sm: '520px' },
            maxWidth: '520px',
            maxHeight: '92vh',
            overflowY: 'auto',
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 0.5, pt: { xs: 1, sm: 1.5 } }}>
          <Box sx={{
            width: { xs: 56, sm: 64 },
            height: { xs: 56, sm: 64 },
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1.5,
            boxShadow: '0 8px 24px rgba(254, 128, 1, 0.4)'
          }}>
            <CheckCircleIcon sx={{ fontSize: { xs: 32, sm: 38 }, color: '#FFFFFF' }} />
          </Box>
          <Typography variant="h5" sx={{ color: '#1F333B', fontWeight: 800, fontSize: { xs: '1.25rem', sm: '1.5rem' }, lineHeight: 1.2 }}>
            Registration Successful!
          </Typography>
          <Typography variant="body2" sx={{ color: '#7a5060', mt: 0.8, fontWeight: 500, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
            Welcome aboard, <strong style={{ color: '#FE8001' }}>{registrationData.name || 'Member'}</strong>!
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 1, sm: 2.5 }, py: 1 }}>
          {/* Warning / Save Info Card */}
          <Box sx={{
            bgcolor: '#FFF7ED',
            border: '1px solid #FED7AA',
            borderRadius: '12px',
            p: 1.2,
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Typography variant="caption" sx={{ color: '#C2410C', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.82rem' }, lineHeight: 1.4 }}>
              ⚠️ <strong>Save or copy these credentials now.</strong> You will need them to log in to your account.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Login ID Row */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: '#FAFAF9',
              p: { xs: 1.2, sm: 1.5 },
              borderRadius: '14px',
              border: '1px solid #F0ECE9',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: '#FFF7ED', borderColor: '#FED7AA' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1, mr: 1 }}>
                <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: 'rgba(254, 128, 1, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <PhoneAndroidIcon sx={{ color: '#FE8001', fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="caption" sx={{ color: '#8A6F78', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                    Login ID (Mobile No)
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#FE8001', fontWeight: 800, fontSize: { xs: '0.95rem', sm: '1.05rem' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {registrationData.memberId || registrationData.mobile}
                  </Typography>
                </Box>
              </Box>
              <Tooltip title={copiedField === "Login ID" ? "Copied!" : "Copy Login ID"}>
                <IconButton
                  size="small"
                  onClick={() => handleCopy("Login ID", registrationData.memberId || registrationData.mobile)}
                  sx={{
                    bgcolor: copiedField === "Login ID" ? '#D1FAE5' : '#FFFFFF',
                    color: copiedField === "Login ID" ? '#059669' : '#FE8001',
                    border: '1px solid',
                    borderColor: copiedField === "Login ID" ? '#6EE7B7' : '#FED7AA',
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    '&:hover': { bgcolor: '#FED7AA' }
                  }}
                >
                  {copiedField === "Login ID" ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>

            {/* User ID Row */}
            {registrationData.userId && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#FAFAF9',
                p: { xs: 1.2, sm: 1.5 },
                borderRadius: '14px',
                border: '1px solid #F0ECE9',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#FFF7ED', borderColor: '#FED7AA' }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1, mr: 1 }}>
                  <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: 'rgba(254, 128, 1, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BadgeIcon sx={{ color: '#FE8001', fontSize: 20 }} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="caption" sx={{ color: '#8A6F78', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                      User ID (Member Code)
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1F333B', fontWeight: 800, fontSize: { xs: '0.95rem', sm: '1.05rem' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {registrationData.userId}
                    </Typography>
                  </Box>
                </Box>
                <Tooltip title={copiedField === "User ID" ? "Copied!" : "Copy User ID"}>
                  <IconButton
                    size="small"
                    onClick={() => handleCopy("User ID", registrationData.userId)}
                    sx={{
                      bgcolor: copiedField === "User ID" ? '#D1FAE5' : '#FFFFFF',
                      color: copiedField === "User ID" ? '#059669' : '#FE8001',
                      border: '1px solid',
                      borderColor: copiedField === "User ID" ? '#6EE7B7' : '#FED7AA',
                      width: 36,
                      height: 36,
                      flexShrink: 0,
                      '&:hover': { bgcolor: '#FED7AA' }
                    }}
                  >
                    {copiedField === "User ID" ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            {/* Password Row */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: '#FAFAF9',
              p: { xs: 1.2, sm: 1.5 },
              borderRadius: '14px',
              border: '1px solid #F0ECE9',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: '#FFF7ED', borderColor: '#FED7AA' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1, mr: 1 }}>
                <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: 'rgba(254, 128, 1, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <KeyIcon sx={{ color: '#FE8001', fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="caption" sx={{ color: '#8A6F78', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                    Password
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1F333B', fontWeight: 800, fontSize: { xs: '0.95rem', sm: '1.05rem' }, letterSpacing: showSuccessPassword ? '0px' : '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {showSuccessPassword ? registrationData.password : '••••••••'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                <Tooltip title={showSuccessPassword ? "Hide" : "Show"}>
                  <IconButton
                    size="small"
                    onClick={() => setShowSuccessPassword(!showSuccessPassword)}
                    sx={{ color: '#8A6F78', width: 34, height: 34 }}
                  >
                    {showSuccessPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </Tooltip>
                <Tooltip title={copiedField === "Password" ? "Copied!" : "Copy Password"}>
                  <IconButton
                    size="small"
                    onClick={() => handleCopy("Password", registrationData.password)}
                    sx={{
                      bgcolor: copiedField === "Password" ? '#D1FAE5' : '#FFFFFF',
                      color: copiedField === "Password" ? '#059669' : '#FE8001',
                      border: '1px solid',
                      borderColor: copiedField === "Password" ? '#6EE7B7' : '#FED7AA',
                      width: 36,
                      height: 36,
                      '&:hover': { bgcolor: '#FED7AA' }
                    }}
                  >
                    {copiedField === "Password" ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Sponsor ID Row */}
            {registrationData.sponsorId && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#FAFAF9',
                p: { xs: 1.2, sm: 1.5 },
                borderRadius: '14px',
                border: '1px solid #F0ECE9',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#FFF7ED', borderColor: '#FED7AA' }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1, mr: 1 }}>
                  <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: 'rgba(254, 128, 1, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <GroupsIcon sx={{ color: '#FE8001', fontSize: 20 }} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="caption" sx={{ color: '#8A6F78', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                      Sponsor ID {registrationData.sponsorName ? `(${registrationData.sponsorName})` : ''}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1F333B', fontWeight: 800, fontSize: { xs: '0.95rem', sm: '1.05rem' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {registrationData.sponsorId}
                    </Typography>
                  </Box>
                </Box>
                <Tooltip title={copiedField === "Sponsor ID" ? "Copied!" : "Copy Sponsor ID"}>
                  <IconButton
                    size="small"
                    onClick={() => handleCopy("Sponsor ID", registrationData.sponsorId)}
                    sx={{
                      bgcolor: copiedField === "Sponsor ID" ? '#D1FAE5' : '#FFFFFF',
                      color: copiedField === "Sponsor ID" ? '#059669' : '#FE8001',
                      border: '1px solid',
                      borderColor: copiedField === "Sponsor ID" ? '#6EE7B7' : '#FED7AA',
                      width: 36,
                      height: 36,
                      flexShrink: 0,
                      '&:hover': { bgcolor: '#FED7AA' }
                    }}
                  >
                    {copiedField === "Sponsor ID" ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>

          {/* Copy All Button */}
          <Button
            fullWidth
            variant="outlined"
            onClick={handleCopyAll}
            startIcon={copiedField === "ALL" ? <CheckIcon sx={{ color: '#059669' }} /> : <ContentCopyIcon />}
            sx={{
              mt: 1.5,
              py: 1,
              borderRadius: '12px',
              borderColor: copiedField === "ALL" ? '#059669' : '#FED7AA',
              bgcolor: copiedField === "ALL" ? '#ECFDF5' : '#FFF7ED',
              color: copiedField === "ALL" ? '#059669' : '#C2410C',
              fontWeight: 700,
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              textTransform: 'none',
              '&:hover': {
                borderColor: '#FE8001',
                bgcolor: '#FED7AA',
                color: '#9A3412'
              }
            }}
          >
            {copiedField === "ALL" ? "✓ All Credentials Copied!" : "📋 Copy All Credentials"}
          </Button>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 1.5, sm: 2.5 }, pb: { xs: 2, sm: 2.5 }, pt: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleCloseDialog}
            sx={{
              background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              py: { xs: 1.4, sm: 1.6 },
              borderRadius: '14px',
              textTransform: 'none',
              fontSize: { xs: '0.95rem', sm: '1.05rem' },
              boxShadow: '0 8px 24px rgba(254, 128, 1, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #E06F00 0%, #FE8001 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 28px rgba(254, 128, 1, 0.45)'
              },
              transition: 'all 0.2s'
            }}
          >
            Proceed to Login →
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invisible reCAPTCHA container for Phone Auth */}
      {/* OTP Verification Dialog */}
      <div id="register-recaptcha"></div>
      <Dialog
        open={otpDialogOpen}
        onClose={() => setOtpDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#FFFFFF',
            color: '#1F333B',
            borderRadius: { xs: '20px', sm: '24px' },
            p: { xs: 1.5, sm: 2.5 },
            border: '1.5px solid #FED7AA',
            boxShadow: '0 25px 50px -12px rgba(254, 128, 1, 0.25)',
            mx: { xs: 1.5, sm: 'auto' },
            width: { xs: 'calc(100% - 24px)', sm: '440px' },
            maxWidth: '440px',
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: 1, fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.35rem' }, color: '#FE8001' }}>
          Verify Mobile Number
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 1, px: { xs: 1, sm: 2 } }}>
          <Typography variant="body2" sx={{ textAlign: 'center', color: '#7a5060', fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
            Enter the 6-digit verification code sent to <strong style={{ color: '#FE8001' }}>+91 {formData.mobileno}</strong>
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: '#FE8001',
              fontWeight: 700,
              fontSize: '0.78rem',
              bgcolor: '#FFF7ED',
              px: 1.5,
              py: 0.6,
              borderRadius: '8px',
              border: '1px solid #FED7AA',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            ⏱️ <strong>OTP is valid for 10 minutes</strong>
          </Typography>

          {/* Real Firebase Phone SMS Active */}

          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: 0.5 }}>
            <MuiOtpInput
              value={otp}
              onChange={setOtp}
              length={6}
              autoFocus
              gap={{ xs: 0.6, sm: 1 }}
              TextFieldsProps={{
                sx: {
                  '& .MuiOutlinedInput-root': {
                    color: '#1F333B',
                    bgcolor: '#FAFAF9',
                    borderRadius: { xs: '10px', sm: '12px' },
                    width: { xs: '40px', sm: '48px' },
                    height: { xs: '46px', sm: '52px' },
                    '& fieldset': { borderColor: '#FED7AA', borderWidth: '1.5px' },
                    '&:hover fieldset': { borderColor: '#FE8001' },
                    '&.Mui-focused fieldset': { borderColor: '#FE8001', borderWidth: '2px', boxShadow: '0 0 0 3px rgba(254, 128, 1, 0.15)' }
                  },
                  '& .MuiOutlinedInput-input': {
                    textAlign: 'center',
                    fontSize: { xs: '1.15rem', sm: '1.35rem' },
                    fontWeight: 800,
                    p: 0,
                    color: '#1F333B'
                  }
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', px: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#8A6F78', fontSize: '0.8rem' }}>
              Didn't receive code?
            </Typography>
            <Button
              size="small"
              onClick={handleSendOTP}
              disabled={resendCooldown > 0 || isSendingOTP}
              sx={{
                color: resendCooldown > 0 ? '#8A6F78' : '#FE8001',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.82rem'
              }}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 1, sm: 2 }, pb: { xs: 1.5, sm: 2 }, gap: 1 }}>
          <Button
            onClick={() => setOtpDialogOpen(false)}
            sx={{
              color: '#8A6F78',
              textTransform: 'none',
              fontWeight: 600,
              px: 2,
              borderRadius: '12px'
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            fullWidth
            disabled={otp.length !== 6 || isVerifyingOTP}
            onClick={handleVerifyOTP}
            sx={{
              background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              borderRadius: '12px',
              py: 1.2,
              textTransform: 'none',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              '&:hover': { background: 'linear-gradient(135deg, #E06F00 0%, #FE8001 100%)' },
              '&:disabled': { bgcolor: '#FED7AA', color: '#a88098' }
            }}
          >
            {isVerifyingOTP ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : "Verify Code"}
          </Button>
        </DialogActions>
      </Dialog>

      {(isLoading || isPending) && <LoadingComponent />}
    </Box>
  );
};

export default Register;

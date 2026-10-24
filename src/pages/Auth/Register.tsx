import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, InputAdornment, FormControl, FormLabel,
  FormControlLabel, Radio, RadioGroup, Checkbox, FormHelperText, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid, useTheme, useMediaQuery,
  Avatar, MenuItem, IconButton, CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

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
  const refCode = searchParams.get("ref") || "";

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
  const [registrationData, setRegistrationData] = useState<{ memberId: string; email: string; mobile: string }>({
    memberId: '',
    email: '',
    mobile: '',
  });

  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [firebaseToken, setFirebaseToken] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);

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
      const res: any = await post("/auth/send-registration-otp", {
        mobileno: cleanMobile
      });

      if (res.success) {
        setOtp("");
        if (res.devOtp) {
          setDevOtp(res.devOtp);
          toast.info(`Test OTP: ${res.devOtp}`, { autoClose: 30000 });
        }
        setOtpDialogOpen(true);
        setResendCooldown(60);
        toast.success(res.message || "OTP sent successfully! Valid for 10 minutes.");
      } else {
        toast.error(res.message || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error("OTP Send Error", error);
      const msg = error.response?.data?.message || error.message || "Failed to send OTP";
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

    let cleanMobile = formData.mobileno.replace(/\D/g, "");
    if (cleanMobile.length > 10) cleanMobile = cleanMobile.slice(-10);

    setIsVerifyingOTP(true);
    try {
      const res: any = await post("/auth/verify-registration-otp", {
        mobileno: cleanMobile,
        otp: otp.trim()
      });

      if (res.success) {
        setFirebaseToken(res.token || "");
        setIsMobileVerified(true);
        setOtpDialogOpen(false);
        setDevOtp(null);
        toast.success("Mobile number verified successfully!");
      } else {
        toast.error(res.message || "Invalid or expired OTP");
      }
    } catch (error: any) {
      console.error("Verification Error", error);
      const msg = error.response?.data?.message || error.message || "Invalid or expired OTP. Please try again.";
      toast.error(msg);
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  useEffect(() => {
    if (refCode) setFormData(prev => ({ ...prev, Sponsor_code: refCode }));
  }, [refCode]);

  useEffect(() => {
    if (formData.Sponsor_code && formData.Sponsor_code.length >= 5) refetch();
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
    if (formData.Sponsor_code && formData.Sponsor_code.length >= 5) refetch();
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
    if (!formData.Sponsor_code || formData.Sponsor_code.length < 5) return setErrorMessage("Valid sponsor code is required");
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
        spackage: 'Ecash Plan',
        password: formData.password,
        otp: firebaseToken,
      };

      mutate(finalData, {
        onSuccess: (response) => {
          if (response.success) {
            setRegistrationData({
              memberId: response.user.Member_id,
              email: formData.email,
              mobile: formData.mobileno,
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
          <Typography
            variant="h2"
            sx={{
              fontWeight: 950,
              fontSize: { xs: '2.5rem', lg: '3.5rem' },
              letterSpacing: '2px',
              color: '#FE8001',
              mb: '1rem',
              textShadow: '0 2px 12px rgba(109, 33, 79, 0.2)'
            }}
          >
            ECASH
          </Typography>
          <Typography
            variant={isMobile ? "h5" : "h3"}
            sx={{ color: '#E5989B', fontWeight: 900, mb: 1.5, lineHeight: 1.2 }}
          >
            Join the Network
          </Typography>
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
                  error={(formData.Sponsor_code.length > 0 && formData.Sponsor_code.length < 5) || (formData.Sponsor_code.length >= 5 && !!sponsorError)}
                  helperText={
                    (formData.Sponsor_code.length > 0 && formData.Sponsor_code.length < 5)
                      ? "Minimum 5 chars."
                      : formData.Sponsor_code.length >= 5 && sponsorError ? sponsorError : ""
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

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#FFFFFF',
            border: '1px solid #fce8ec',
            borderRadius: '24px',
            p: { xs: 1, sm: 2 },
            boxShadow: '0 24px 48px rgba(109,33,79,0.15)',
            mx: { xs: 2, sm: 'auto' },
          }
        }}
      >
        <DialogTitle sx={{ color: '#FE8001', textAlign: 'center', fontWeight: 800, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
          🎉 Registration Successful!
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: '#1F333B', mb: 3, fontSize: { xs: '0.9rem', sm: '1rem' }, fontWeight: 500 }}>
            Welcome aboard! Here are your account details:
          </Typography>
          <Box
            sx={{
              bgcolor: '#ffffff',
              p: { xs: 2, sm: 3 },
              borderRadius: '16px',
              border: '1px solid #FED7AA',
              display: 'inline-block',
              textAlign: 'left',
              minWidth: { xs: '100%', sm: 260 },
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <Typography variant="body2" sx={{ color: '#1F333B', mb: 1.5, fontSize: { xs: '0.85rem', sm: '1rem' } }}>
              <strong style={{ color: '#FE8001', display: 'inline-block', minWidth: '110px' }}>Member ID:</strong>
              {registrationData.memberId}
            </Typography>
            <Typography variant="body2" sx={{ color: '#1F333B', mb: 1.5, fontSize: { xs: '0.85rem', sm: '1rem' } }}>
              <strong style={{ color: '#FE8001', display: 'inline-block', minWidth: '110px' }}>Mobile:</strong>
              {registrationData.mobile}
            </Typography>
            <Typography variant="body2" sx={{ color: '#1F333B', fontSize: { xs: '0.85rem', sm: '1rem' } }}>
              <strong style={{ color: '#FE8001', display: 'inline-block', minWidth: '110px' }}>Email:</strong>
              {registrationData.email}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 3, color: '#b08090', fontSize: { xs: '0.8rem', sm: '0.875rem' }, fontWeight: 500 }}>
            Use your <strong style={{ color: '#FE8001' }}>mobile number</strong> and the <strong style={{ color: '#FE8001' }}>password</strong> you just created to log in.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
              color: '#FFFFFF',
              fontWeight: 700,
              px: { xs: 4, sm: 6 },
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              '&:hover': { background: 'linear-gradient(135deg, #E06F00 0%, #FE8001 100%)', transform: 'translateY(-2px)' },
              transition: 'all 0.2s'
            }}
          >
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invisible reCAPTCHA container for Phone Auth */}
      <div id="register-recaptcha-container"></div>

      {/* OTP Verification Dialog */}
      <Dialog
        open={otpDialogOpen}
        onClose={() => setOtpDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#FFFFFF',
            color: '#1F333B',
            borderRadius: '20px',
            p: { xs: 2, sm: 2.5 },
            border: '1px solid #fce8ec',
            boxShadow: '0 25px 50px -12px rgba(109,33,79,0.15)',
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: 1, fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.25rem' }, color: '#FE8001' }}>
          Verify Mobile Number
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 1 }}>
          <Typography variant="body2" sx={{ textAlign: 'center', color: '#b08090', fontSize: '0.85rem' }}>
            Enter the 6-digit verification code sent to <strong style={{ color: '#FE8001' }}>+91 {formData.mobileno}</strong>
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: '#FE8001',
              fontWeight: 600,
              fontSize: '0.78rem',
              bgcolor: '#fce8ec',
              px: 1.5,
              py: 0.5,
              borderRadius: '8px',
              border: '1px solid #FED7AA',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            ⏱️ <strong>OTP is valid for 10 minutes</strong>
          </Typography>

          {devOtp && (
            <Box
              onClick={() => setOtp(devOtp)}
              sx={{
                cursor: 'pointer',
                bgcolor: 'rgba(254, 128, 1,  )',
                border: '1px dashed #FE8001',
                borderRadius: '10px',
                px: 2,
                py: 0.8,
                textAlign: 'center',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(254, 128, 1,  )', transform: 'scale(1.02)' }
              }}
            >
              <Typography variant="caption" sx={{ color: '#FE8001', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <span>🔑 Test OTP:</span>
                <strong style={{ letterSpacing: '2px', fontSize: '0.95rem' }}>{devOtp}</strong>
                <span style={{ fontSize: '0.7rem', color: '#FF9933', textDecoration: 'underline' }}>(Click to fill)</span>
              </Typography>
            </Box>
          )}

          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <MuiOtpInput
              value={otp}
              onChange={setOtp}
              length={6}
              autoFocus
              TextFieldsProps={{
                sx: {
                  '& .MuiOutlinedInput-root': {
                    color: '#1F333B',
                    bgcolor: '#ffffff',
                    borderRadius: '12px',
                    '& fieldset': { borderColor: '#FED7AA' },
                    '&:hover fieldset': { borderColor: '#E5989B' },
                    '&.Mui-focused fieldset': { borderColor: '#FE8001', borderWidth: '2px' }
                  },
                  '& .MuiOutlinedInput-input': {
                    textAlign: 'center',
                    fontSize: { xs: '1.1rem', sm: '1.3rem' },
                    fontWeight: 700,
                    p: { xs: 1, sm: 1.5 }
                  }
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', px: 1 }}>
            <Typography variant="caption" sx={{ color: '#b08090' }}>
              Didn't receive code?
            </Typography>
            <Button
              size="small"
              onClick={handleSendOTP}
              disabled={resendCooldown > 0 || isSendingOTP}
              sx={{
                color: resendCooldown > 0 ? '#b08090' : '#FE8001',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.8rem'
              }}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1, gap: 1 }}>
          <Button
            onClick={() => setOtpDialogOpen(false)}
            sx={{ color: '#b08090', textTransform: 'none' }}
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

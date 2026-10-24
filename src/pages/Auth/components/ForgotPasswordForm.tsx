import { Box, Button, InputAdornment, TextField, Typography } from '@mui/material';
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useState, useEffect } from 'react';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { useResetpassword } from '../../../api/Auth';
import { auth } from '../../../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { toast } from 'react-toastify';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [firebaseToken, setFirebaseToken] = useState<string>("");
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ResetPasswordMutation = useResetpassword();
  const { mutate, isPending } = ResetPasswordMutation;

  useEffect(() => {
    return () => {
      if ((window as any).forgotPwdRecaptchaVerifier) {
        try {
          (window as any).forgotPwdRecaptchaVerifier.clear();
        } catch (e) {}
        (window as any).forgotPwdRecaptchaVerifier = null;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    if (!(window as any).forgotPwdRecaptchaVerifier) {
      (window as any).forgotPwdRecaptchaVerifier = new RecaptchaVerifier(auth, 'forgot-pwd-recaptcha', {
        'size': 'invisible',
        'callback': () => {}
      });
    }
  };

  const handleSendOTP = async () => {
    if (!formData.mobileno || formData.mobileno.length < 10) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    
    let formattedPhone = formData.mobileno;
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone;
    }

    setIsSendingOTP(true);
    try {
      setupRecaptcha();
      const appVerifier = (window as any).forgotPwdRecaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      toast.success("OTP sent to your mobile number");
      setStep(2);
    } catch (error: any) {
      console.error("SMS Error", error);
      toast.error('Failed to send OTP. ' + error.message);
      // Removed recaptchaVerifier.clear() to prevent "already rendered" error on retry
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    
    setIsVerifyingOTP(true);
    try {
      if (!confirmationResult) throw new Error("Session expired. Please request OTP again.");
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      setFirebaseToken(idToken);
      toast.success("Mobile number verified!");
      setStep(3);
    } catch (error: any) {
      toast.error("Invalid OTP");
      setOtp("");
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step === 1) {
      handleSendOTP();
    } else if (step === 2) {
      handleVerifyOTP();
    } else if (step === 3) {
      if (formData.password?.length <= 5) {
        setErrorMessage("Password must be at least 6 characters*");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage("Passwords do not match");
        return;
      }
      mutate(
        { mobileno: formData.mobileno, password: formData.password, otp: firebaseToken }, // Using otp field for token
        {
          onSuccess: () => {
            setFormData({ mobileno: "", password: "", confirmPassword: "" });
            setOtp("");
            setErrorMessage("");
            toast.success("Password reset successfully!");
            onBackToLogin();
          }
        }
      );
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={onBackToLogin}
        sx={{
          color: "#526E78",
          mb: 2,
          textTransform: "none",
          fontWeight: 600,
          background: "transparent",
          "&:hover": { color: "#FE8001", backgroundColor: "rgba(254,128,1,0.08)" }
        }}
      >
        Back to Login
      </Button>

      <Typography
        component="h1"
        variant="h5"
        sx={{
          color: "#1F333B",
          fontWeight: 800,
          textAlign: "center",
          mb: 1,
          letterSpacing: "-0.5px"
        }}
      >
        Reset Password
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "#889EA6", textAlign: "center", mb: 3, fontWeight: 500 }}
      >
        {step === 1 && "Enter your registered mobile number"}
        {step === 2 && "Enter the 6-digit OTP sent to your mobile"}
        {step === 3 && "Securely enter your new preferred password"}
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
      >
        {step >= 1 && (
          <TextField
            required
            fullWidth
            id="mobileno"
            label="Mobile Number"
            name="mobileno"
            autoComplete="tel"
            placeholder="e.g. 9876543210"
            value={formData.mobileno || ""}
            onChange={handleChange}
            disabled={step > 1 || isSendingOTP}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIphoneIcon sx={{ color: "#889EA6" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#1F333B",
                bgcolor: "#FFFFFF",
                borderRadius: "14px",
                "& fieldset": { borderColor: "#E2E8F0", borderWidth: "1.5px" },
                "&:hover fieldset": { borderColor: "#FFA033" },
                "&.Mui-focused fieldset": { borderColor: "#FE8001", borderWidth: "2px" },
                "&.Mui-disabled fieldset": { borderColor: "#F1F5F7" },
              },
              "& .MuiOutlinedInput-input.Mui-disabled": {
                color: "#889EA6",
                WebkitTextFillColor: "#889EA6",
              },
              "& .MuiInputLabel-root": { color: "#889EA6" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#FE8001" },
            }}
          />
        )}

        <div id="forgot-pwd-recaptcha"></div>

        {step >= 2 && (
          <Box sx={{ mt: 1, mb: 1, display: "flex", justifyContent: "center" }}>
            <MuiOtpInput
              value={otp}
              length={6}
              onChange={setOtp}
              autoFocus
              TextFieldsProps={{
                disabled: step > 2 || isVerifyingOTP,
                sx: {
                  "& .MuiOutlinedInput-root": {
                    height: "50px",
                    color: "#1F333B",
                    bgcolor: "#FFFFFF",
                    borderRadius: "12px",
                    "& fieldset": { borderColor: "#E2E8F0", borderWidth: "1.5px" },
                    "&:hover fieldset": { borderColor: "#FFA033" },
                    "&.Mui-focused fieldset": { borderColor: "#FE8001", borderWidth: "2px" },
                  },
                },
              }}
            />
          </Box>
        )}

        {step === 3 && (
          <>
            <TextField
              required
              fullWidth
              id="password"
              label="New Password"
              name="password"
              type="password"
              placeholder="Enter new password"
              value={formData.password || ""}
              onChange={handleChange}
              disabled={isPending}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "#889EA6" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#1F333B",
                  bgcolor: "#FFFFFF",
                  borderRadius: "14px",
                  "& fieldset": { borderColor: "#E2E8F0", borderWidth: "1.5px" },
                  "&:hover fieldset": { borderColor: "#FFA033" },
                  "&.Mui-focused fieldset": { borderColor: "#FE8001", borderWidth: "2px" },
                },
                "& .MuiInputLabel-root": { color: "#889EA6" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#FE8001" },
              }}
            />

            <TextField
              required
              fullWidth
              id="confirmPassword"
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={formData.confirmPassword || ""}
              onChange={handleChange}
              disabled={isPending}
              error={!!errorMessage}
              helperText={errorMessage}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "#889EA6" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#1F333B",
                  bgcolor: "#FFFFFF",
                  borderRadius: "14px",
                  "& fieldset": { borderColor: "#E2E8F0", borderWidth: "1.5px" },
                  "&:hover fieldset": { borderColor: "#FFA033" },
                  "&.Mui-focused fieldset": { borderColor: "#FE8001", borderWidth: "2px" },
                },
                "& .MuiInputLabel-root": { color: "#889EA6" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#FE8001" },
              }}
            />
          </>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isPending || isSendingOTP || isVerifyingOTP}
          sx={{
            mt: 2,
            mb: 2,
            background: "linear-gradient(135deg, #FE8001 0%, #FFA033 100%)",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: "1rem",
            padding: "12px",
            borderRadius: "14px",
            textTransform: "none",
            boxShadow: "0 6px 20px rgba(254, 128, 1, 0.35)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #E06F00 0%, #FE8001 100%)",
              transform: "translateY(-2px)",
              boxShadow: "0 10px 24px rgba(254, 128, 1, 0.45)",
            },
            "&:disabled": {
              background: "#E2E8F0",
              color: "#889EA6"
            }
          }}
        >
          {isPending || isSendingOTP || isVerifyingOTP
            ? "Processing..." 
            : step === 1
              ? "Get OTP"
              : step === 2
                ? "Verify OTP"
                : "Reset Password"}
        </Button>
      </Box>
    </Box>
  );
};

export default ForgotPasswordForm;

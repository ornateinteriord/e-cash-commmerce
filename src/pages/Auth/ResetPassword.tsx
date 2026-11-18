import { Box, Button, Card, CardContent, Container, InputAdornment, TextField, Typography,  } from '@mui/material';
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { useState } from 'react';
import { MuiOtpInput } from 'mui-one-time-password-input';
import LogBg from "../../assets/log_bg.jpg"; // Import the logo
import { useResetpassword } from '../../api/Auth';
import LoadingComponent from '../../components/common/LoadingComponent';

const ResetPassword = () => {
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ResetPasswordMutation = useResetpassword();
  const { mutate, isPending } = ResetPasswordMutation;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (step === 1 && formData.email) {
        mutate({ email: formData.email });
        setStep((prev) => prev + 1);
      } else if (step === 2 && otp.length === 6) {
        mutate(
          { email: formData.email, otp },
          {
            onSuccess: () => {
              setStep((prev) => prev + 1);
            },
            onError: () => {
              setOtp("");
              setStep((prev) => prev - 1);
            },
          }
        );
      } else if (step === 3) {
        if (formData.password.length <= 5) {
          setErrorMessage("Password must be at least 6 characters*");
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setErrorMessage("Passwords do not match");
          return;
        }
        mutate({ email: formData.email, password: formData.password, otp });
        setFormData({ email: "", password: "", confirmPassword: "" });
        setOtp("");
        setStep(1);
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Error", error);
    }
  };
  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Card
          sx={{
            width: "100%",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            backgroundImage: `url(${LogBg})`, // Dark semi-transparent background
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <CardContent sx={{ padding: "2rem" }}>
            <Typography
              component="h1"
              variant="h5"
              sx={{ color: "#fff", mb: 3, textAlign: "center", fontWeight: "bold" }}
            >
              Reset Password
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              {step >= 1 && (
                <TextField
                  required
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  disabled={step > 1}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: "#0a2558" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#e5e5e5",
                      borderRadius: "4px",
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
              )}
              {!isPending && step >= 2 && (
                <MuiOtpInput
                  value={otp}
                  length={6}
                  onChange={setOtp}
                  autoFocus
                  TextFieldsProps={{
                    disabled: step > 2,
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        height: "40px",
                        backgroundColor: "#e5e5e5",
                        borderRadius: "4px",
                        "& fieldset": { border: "none" },
                      },
                      textAlign: "center",
                      "& .MuiInputBase-root": {

                      },
                    },
                  }}
                />
              )}
              {!isPending && step === 3 && (
                <>
                  <TextField
                    required
                    id="password"
                    label="New Password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#0a2558" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "#0a2558",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#0a2558",
                        },
                      },
                    }}
                  />

                  <TextField
                    required
                    id="confirmPassword"
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="confirmPassword"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!errorMessage}
                    helperText={errorMessage}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#0a2558" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "#0a2558",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#0a2558",
                        },
                      },
                    }}
                  />
                </>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  background:
                    "linear-gradient(90deg, #374151 0%, #d4af37 100%)", // Gradient
                  color: "white",
                  fontWeight: "bold",
                  padding: "10px",
                  textTransform: "uppercase",
                  "&:hover": {
                    opacity: 0.9,
                  },
                }}
              >
                {step === 1
                  ? "Get OTP"
                  : step === 2
                    ? "Verify OTP"
                    : "Reset Password"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
      {isPending && <LoadingComponent />}
    </Container>
  );
};

export default ResetPassword;

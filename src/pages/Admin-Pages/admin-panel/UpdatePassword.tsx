import { Button, Card, CardContent, Grid, InputAdornment, TextField, Typography,  } from '@mui/material';
import PersonIcon from "@mui/icons-material/Person";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import KeyIcon from "@mui/icons-material/Key";
import LockIcon from "@mui/icons-material/Lock";
import { useContext, useState } from 'react';
import { useUpdatePassword } from '../../../api/Admin';
import { toast } from 'react-toastify';
import UserContext from "../../../context/user/userContext";

const UpdatePassword: React.FC = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const { user } = useContext(UserContext);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const updatePassword = useUpdatePassword();

  const handleSubmit = (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("New password and confirm password do not match!");
        return;
      }
      const passwordData = {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      };
      updatePassword.mutate(passwordData)
    } catch (error) {
      console.error("Failed to update password", error);
    } finally {
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    }
  };
  return (
    <>
      <Grid
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          margin: { xs: "0.75rem", sm: "1rem", md: "1.5rem" },
          mt: { xs: 4, sm: 10, md: 11 },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#1e293b',
            fontSize: { xs: '1.35rem', sm: '1.55rem', md: '1.75rem' },
            letterSpacing: '-0.02em',
          }}
        >
          Account Settings
        </Typography>
      </Grid>
      <Card sx={{ margin: { xs: "0.75rem", sm: "1rem", md: "1.5rem" }, mt: 2 }}>
        <CardContent>
          <div>
            <div style={{ marginBottom: "1rem", color: "#000", fontWeight: "bold", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "8px"     }}>
              Update Password
            </div>
            <div style={{ padding: "0 1rem 1rem 1rem" }}>
              <form
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <TextField
                  label="Name"
                  name="name"
                  value={user?.username || " "}
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your current password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: "#0a2558" }} />
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
                  label="Old Password"
                  name="oldPassword"
                  type="password"
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your current password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyIcon sx={{ color: "#0a2558" }} />
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
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your new password"
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
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Confirm your new password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyIcon sx={{ color: "#0a2558" }} />
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
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={
                    !formData.oldPassword ||
                    !formData.newPassword ||
                    !formData.confirmPassword
                  }
                  sx={{
                    backgroundColor: "#0a2558",
                    alignSelf: "flex-end",
                    "&:hover": {
                      backgroundColor: "#581c87",
                    },
                  }}
                >
                  Update Password
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default UpdatePassword;

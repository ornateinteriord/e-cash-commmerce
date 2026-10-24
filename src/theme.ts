import { createTheme } from "@mui/material/styles";

// Brand Palette (Shophy Theme)
// #FE8001  → Vibrant Brand Orange (Primary Accent)
// #1F333B  → Deep Dark Slate Teal (Secondary / Brand Text / Header)
// #F8FAFC  → Crisp Clean Off-White (Background)
// #FFFFFF  → Pure White (Card & Paper)

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#FE8001",
      light: "#FFA033",
      dark: "#E06F00",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#1F333B",
      light: "#2B444E",
      dark: "#15242A",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1F333B",
      secondary: "#526E78",
    },
    warning: {
      main: "#FE8001",
      dark: "#E06F00",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#EF4444",
    },
    success: {
      main: "#10B981",
    },
    info: {
      main: "#1F333B",
    },
    divider: "#E2E8F0",
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontWeight: 900, color: "#1F333B" },
    h2: { fontWeight: 800, color: "#1F333B" },
    h3: { fontWeight: 800, color: "#1F333B" },
    h4: { fontWeight: 700, color: "#1F333B" },
    h5: { fontWeight: 700, color: "#1F333B" },
    h6: { fontWeight: 600, color: "#1F333B" },
    button: {
      fontWeight: 700,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          padding: "10px 24px",
          fontWeight: 700,
          transition: "all 0.3s ease-in-out",
          textTransform: "none",
        },
        contained: {
          background: "linear-gradient(135deg, #FE8001 0%, #FFA033 100%)",
          color: "#FFFFFF",
          boxShadow: "0 4px 14px rgba(254, 128, 1, 0.3)",
          "&:hover": {
            background: "linear-gradient(135deg, #E06F00 0%, #FE8001 100%)",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 20px rgba(254, 128, 1, 0.4)",
          },
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #1F333B 0%, #2B444E 100%)",
          color: "#FFFFFF",
          boxShadow: "0 4px 14px rgba(31, 51, 59, 0.25)",
          "&:hover": {
            background: "linear-gradient(135deg, #15242A 0%, #1F333B 100%)",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 20px rgba(31, 51, 59, 0.35)",
          },
        },
        outlined: {
          borderColor: "#FE8001",
          color: "#FE8001",
          "&:hover": {
            backgroundColor: "rgba(254, 128, 1, 0.08)",
            borderColor: "#E06F00",
          },
        },
        text: {
          color: "#FE8001",
          "&:hover": {
            backgroundColor: "rgba(254, 128, 1, 0.08)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 2px 10px rgba(31, 51, 59, 0.05)",
          transition: "all 0.25s ease",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(31, 51, 59, 0.1)",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          backgroundImage: "none",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          boxShadow: "0 2px 12px rgba(31, 51, 59, 0.04)",
          color: "#1F333B",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1F333B",
          color: "#FFFFFF",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            "& fieldset": {
              borderColor: "#E2E8F0",
            },
            "&:hover fieldset": {
              borderColor: "#FFA033",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#FE8001",
              borderWidth: "2px",
            },
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#FE8001",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          fontWeight: 600,
        },
        colorPrimary: {
          backgroundColor: "rgba(254, 128, 1, 0.12)",
          color: "#FE8001",
        },
        colorSecondary: {
          backgroundColor: "rgba(31, 51, 59, 0.1)",
          color: "#1F333B",
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #E2E8F0",
          boxShadow: "0 -4px 16px rgba(31, 51, 59, 0.06)",
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: "#889EA6",
          "&.Mui-selected": {
            color: "#FE8001",
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FE8001",
          color: "#FFFFFF",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: "99px",
          backgroundColor: "#E2E8F0",
        },
        bar: {
          background: "linear-gradient(90deg, #FE8001, #FFA033)",
          borderRadius: "99px",
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: "#FE8001",
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          "&.Mui-checked": {
            color: "#FE8001",
            "& + .MuiSwitch-track": {
              backgroundColor: "#FFA033",
            },
          },
        },
      },
    },
  },
});

import { createTheme } from '@mui/material/styles';
import tokens from './theme/tokens';

const theme = createTheme({
  palette: {
    primary: {
      main: tokens.colors.brand[500],
      light: tokens.colors.brand[100],
      dark: tokens.colors.brand[600],
      contrastText: '#ffffff',
    },
    secondary: {
      main: tokens.colors.success[600],
      light: tokens.colors.success[100],
      dark: tokens.colors.success[700],
      contrastText: '#ffffff',
    },
    success: {
      main: tokens.colors.success[600],
      light: tokens.colors.success[50],
      dark: tokens.colors.success[700],
      contrastText: '#ffffff',
    },
    warning: {
      main: tokens.colors.warning[600],
      light: tokens.colors.warning[50],
      dark: tokens.colors.warning[700],
      contrastText: '#ffffff',
    },
    error: {
      main: tokens.colors.danger[600],
      light: tokens.colors.danger[50],
      dark: tokens.colors.danger[700],
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: tokens.colors.neutral[900],
      secondary: tokens.colors.neutral[500],
      disabled: tokens.colors.neutral[400],
    },
    divider: tokens.colors.neutral[200],
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 800, fontSize: '2.25rem', letterSpacing: '-0.025em' },
    h2: { fontWeight: 800, fontSize: '1.875rem', letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.015em' },
    h5: { fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.01em' },
    h6: { fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600, fontSize: '0.9375rem' },
    subtitle2: { fontWeight: 600, fontSize: '0.8125rem' },
    body1: { fontSize: '0.875rem', lineHeight: 1.5 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.45 },
    caption: { fontSize: '0.75rem', lineHeight: 1.4, color: tokens.colors.neutral[500] },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '7px 14px',
          fontWeight: 600,
          transition: tokens.transitions.fast,
          '&:focus-visible': {
            outline: `2px solid ${tokens.colors.brand[500]}`,
            outlineOffset: '2px',
          },
        },
        containedPrimary: {
          backgroundColor: tokens.colors.brand[500],
          '&:hover': {
            backgroundColor: tokens.colors.brand[600],
          },
        },
        outlined: {
          borderColor: tokens.colors.neutral[200],
          color: tokens.colors.neutral[700],
          '&:hover': {
            borderColor: tokens.colors.neutral[300],
            backgroundColor: tokens.colors.neutral[50],
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${tokens.colors.neutral[200]}`,
          boxShadow: tokens.shadows.card,
          backgroundImage: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '10px 14px',
          borderColor: tokens.colors.neutral[100],
          fontSize: '0.8125rem',
          color: tokens.colors.neutral[700],
        },
        head: {
          fontWeight: 700,
          color: tokens.colors.neutral[600],
          backgroundColor: tokens.colors.neutral[50],
          padding: '10px 14px',
          borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
          fontSize: '0.75rem',
          letterSpacing: '0.025em',
          textTransform: 'uppercase',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: tokens.colors.neutral[50],
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
            fontSize: '0.84rem',
            '& fieldset': {
              borderColor: tokens.colors.neutral[200],
            },
            '&:hover fieldset': {
              borderColor: tokens.colors.neutral[300],
            },
            '&.Mui-focused fieldset': {
              borderColor: tokens.colors.brand[500],
              borderWidth: '1.5px',
            },
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
          borderRadius: 6,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          border: `1px solid ${tokens.colors.neutral[200]}`,
          boxShadow: tokens.shadows.modal,
        },
      },
    },
  },
});

export default theme;

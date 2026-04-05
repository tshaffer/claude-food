import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#3B82F6' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text: { primary: '#0F172A', secondary: '#64748B' },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontSize: '1.5rem', fontWeight: 700 },
    h2: { fontSize: '1.25rem', fontWeight: 600 },
    h3: { fontSize: '1rem',   fontWeight: 600 },
    body1: { fontSize: '0.875rem' },
    body2: { fontSize: '0.75rem' },
    caption: { fontSize: '0.6875rem' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
        sizeSmall: { fontSize: '0.75rem', padding: '4px 12px' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { fontSize: '0.75rem', padding: '6px 12px' },
        head: { fontWeight: 600, fontSize: '0.6875rem', color: '#64748B',
                backgroundColor: '#F1F5F9' },
      },
    },
  },
});

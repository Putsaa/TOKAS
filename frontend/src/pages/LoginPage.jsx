import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { useAuth } from '../contexts/AuthContext';
import tokasLogo from '../tokas.png';
import tokens from '../theme/tokens';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa username dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: tokens.colors.neutral[50],
        p: 2,
      }}
    >
      <Card
        elevation={0}
        sx={{
          maxWidth: 420,
          width: '100%',
          p: { xs: 3, sm: 4.5 },
          borderRadius: '16px',
          bgcolor: '#ffffff',
          border: `1px solid ${tokens.colors.neutral[200]}`,
          boxShadow: tokens.shadows.modal,
        }}
      >
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box
            component="img"
            src={tokasLogo}
            alt="TOKAS Logo"
            sx={{
              height: 38,
              width: 'auto',
              maxWidth: '180px',
              objectFit: 'contain',
              mb: 1.5,
            }}
          />
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 800,
              color: tokens.colors.neutral[900],
              fontSize: '1.35rem',
              letterSpacing: '-0.02em',
            }}
          >
            Sistem Kasir & POS Toko
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.neutral[500], fontSize: '0.825rem', mt: 0.25 }}>
            Masuk untuk mengakses kasir dan manajemen inventori
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '8px', fontSize: '0.825rem' }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: tokens.colors.neutral[700], display: 'block', mb: 0.75 }}>
              Username
            </Typography>
            <TextField
              fullWidth
              size="medium"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username Anda..."
              required
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineOutlinedIcon sx={{ color: tokens.colors.neutral[400], fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: tokens.colors.neutral[700], display: 'block', mb: 0.75 }}>
              Password
            </Typography>
            <TextField
              fullWidth
              size="medium"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password Anda..."
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: tokens.colors.neutral[400], fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon sx={{ fontSize: 18, color: tokens.colors.neutral[400] }} />
                      ) : (
                        <VisibilityOutlinedIcon sx={{ fontSize: 18, color: tokens.colors.neutral[400] }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{
              py: 1.25,
              borderRadius: '8px',
              bgcolor: tokens.colors.brand[500],
              fontWeight: 700,
              fontSize: '0.875rem',
              '&:hover': { bgcolor: tokens.colors.brand[600] },
            }}
          >
            {isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem POS'}
          </Button>

          <Box sx={{ mt: 3, pt: 2.5, borderTop: `1px solid ${tokens.colors.neutral[200]}` }}>
            <Typography
              variant="caption"
              sx={{ color: tokens.colors.neutral[500], fontWeight: 600, display: 'block', mb: 1, textAlign: 'center' }}
            >
              Uji Coba Cepat (Pilih Akun Demo):
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleQuickFill('owner', 'owner123')}
                sx={{
                  fontSize: '0.74rem',
                  py: 0.3,
                  px: 1,
                  borderRadius: '6px',
                  borderColor: tokens.colors.neutral[300],
                  color: tokens.colors.neutral[700],
                }}
              >
                Owner
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleQuickFill('admin', 'admin123')}
                sx={{
                  fontSize: '0.74rem',
                  py: 0.3,
                  px: 1,
                  borderRadius: '6px',
                  borderColor: tokens.colors.neutral[300],
                  color: tokens.colors.neutral[700],
                }}
              >
                Admin
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleQuickFill('kasir1', 'kasir123')}
                sx={{
                  fontSize: '0.74rem',
                  py: 0.3,
                  px: 1,
                  borderRadius: '6px',
                  borderColor: tokens.colors.neutral[300],
                  color: tokens.colors.neutral[700],
                }}
              >
                Kasir
              </Button>
            </Box>
          </Box>
        </Box>
      </Card>

      <Typography variant="caption" sx={{ color: tokens.colors.neutral[400], mt: 3, textAlign: 'center' }}>
        TOKAS Point of Sale System • Hak Cipta Dilindungi
      </Typography>
    </Box>
  );
};

export default LoginPage;

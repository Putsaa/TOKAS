import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, TextField, Button, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import tokasLogo from '../tokas.png';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box 
            component="img"
            src={tokasLogo}
            alt="TOKAS Logo"
            sx={{ width: 150, height: 'auto', mb: 2 }}
          />
          <Typography variant="h5" component="h1" gutterBottom align="center" fontWeight="bold">
            Sistem Kasir TOKAS
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" mb={4}>
            Silakan login untuk melanjutkan
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3, mb: 2, borderRadius: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;

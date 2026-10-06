import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import PageHeader from '../components/common/PageHeader';

export default function UsersPage() {
  return (
    <Box>
      <PageHeader 
        title="Manajemen Pengguna" 
        subtitle="Kelola akun kasir dan admin"
      />
      <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary', mt: 2 }}>
        <Typography>Fitur Manajemen Pengguna sedang dalam pengembangan.</Typography>
      </Paper>
    </Box>
  );
}

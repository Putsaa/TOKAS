import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import PageHeader from '../components/common/PageHeader';

export default function ReportsPage() {
  return (
    <Box>
      <PageHeader 
        title="Laporan Penjualan" 
        subtitle="Analisis dan laporan performa toko"
      />
      <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary', mt: 2 }}>
        <Typography>Fitur Laporan sedang dalam pengembangan.</Typography>
      </Paper>
    </Box>
  );
}

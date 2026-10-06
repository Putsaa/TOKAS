import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import PageHeader from '../components/common/PageHeader';

export default function TransactionsPage() {
  return (
    <Box>
      <PageHeader 
        title="Daftar Transaksi" 
        subtitle="Riwayat semua transaksi penjualan"
      />
      <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary', mt: 2 }}>
        <Typography>Fitur Riwayat Transaksi sedang dalam pengembangan.</Typography>
      </Paper>
    </Box>
  );
}

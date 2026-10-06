import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptIcon from '@mui/icons-material/Receipt';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';
import api from '../services/api';
import { useSnackbar } from 'notistack';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        setData(response.data.data);
      } catch (error) {
        enqueueSnackbar('Gagal mengambil data dashboard', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [enqueueSnackbar]);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const { kpi, chartData, recentTransactions, lowStock } = data;

  const kpiCards = [
    { title: 'Total Pendapatan (Bulan Ini)', value: formatCurrency(kpi?.revenue), icon: <TrendingUpIcon fontSize="large" color="primary" /> },
    { title: 'Total Transaksi', value: kpi?.transactions, icon: <ReceiptIcon fontSize="large" color="secondary" /> },
    { title: 'Total Produk', value: kpi?.products, icon: <InventoryIcon fontSize="large" color="success" /> },
    { title: 'Stok Menipis', value: kpi?.lowStock, icon: <WarningIcon fontSize="large" color="error" /> },
  ];

  return (
    <Box>
      <PageHeader 
        title="Dashboard" 
        subtitle="Ringkasan aktivitas dan performa toko Anda"
      />
      
      <Grid container spacing={3} mb={4}>
        {kpiCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="subtitle2">
                    {card.title}
                  </Typography>
                  <Typography variant="h5" component="div">
                    {card.value}
                  </Typography>
                </Box>
                {card.icon}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography variant="h6" gutterBottom>Pendapatan 7 Hari Terakhir</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `Rp ${value / 1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#1976d2" name="Pendapatan" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>Stok Menipis</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Produk</TableCell>
                    <TableCell align="right">Stok</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStock && lowStock.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.nama}</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                        {item.stok}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!lowStock || lowStock.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={2} align="center">Tidak ada stok menipis</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Transaksi Terakhir</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID Transaksi</TableCell>
                    <TableCell>Tanggal</TableCell>
                    <TableCell>Kasir</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentTransactions && recentTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.id}</TableCell>
                      <TableCell>{formatDate(tx.createdAt)}</TableCell>
                      <TableCell>{tx.cashierName}</TableCell>
                      <TableCell align="right">{formatCurrency(tx.totalAmount)}</TableCell>
                    </TableRow>
                  ))}
                  {(!recentTransactions || recentTransactions.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">Belum ada transaksi</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;

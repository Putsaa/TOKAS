import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';

import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import MetricCard from '../components/common/MetricCard';
import EmptyState from '../components/common/EmptyState';
import { formatCurrency } from '../utils/formatters';
import tokens from '../theme/tokens';

const ReportsPage = () => {
  const [report, setReport] = useState(null);
  const [period, setPeriod] = useState('7hari');

  const fetchReport = useCallback(async () => {
    try {
      const res = await api.get('/reports/sales');
      if (res.data?.data) {
        setReport(res.data.data);
      } else {
        setReport({
          totalSales: 0,
          totalTransactions: 0,
          totalItemsSold: 0,
          dailySales: [],
          bestSellers: [],
        });
      }
    } catch (err) {
      setReport({
        totalSales: 0,
        totalTransactions: 0,
        totalItemsSold: 0,
        dailySales: [],
        bestSellers: [],
      });
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const totalSalesVal = report?.totalSales ?? 0;
  const totalTrxVal = report?.totalTransactions ?? 0;
  const totalItemsVal = report?.totalItemsSold ?? 0;
  const estimatedProfit = Math.round(totalSalesVal * 0.28); // Approx 28% gross margin

  // Chart data
  const chartData = useMemo(() => {
    if (report?.dailySales && Array.isArray(report.dailySales)) {
      return report.dailySales.map(d => {
        const dt = new Date(d.date);
        const label = `${dt.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][dt.getMonth()]}`;
        return {
          day: label,
          sales: Number(d.totalSales) || 0,
          trx: d.transactionCount || 0,
        };
      });
    }
    return [];
  }, [report]);

  const bestSellers = report?.bestSellers || [];
  const maxRevenue = Math.max(...bestSellers.map(b => Number(b.totalRevenue) || 1), 1);

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', pb: 4 }}>
      <PageHeader
        title="Laporan Penjualan & Kinerja Toko"
        subtitle="Analisis omset penjualan, laba kotor, dan komparasi performa produk terlaris."
        action={
          <Button
            variant="contained"
            onClick={() => window.print()}
            startIcon={<PrintOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: tokens.colors.brand[500],
              borderRadius: '8px',
              px: 2,
              py: 0.85,
              fontWeight: 700,
              fontSize: '0.825rem',
              '&:hover': { bgcolor: tokens.colors.brand[600] },
            }}
          >
            Cetak / Export Laporan
          </Button>
        }
      />

      {/* 4 Metric KPI Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <MetricCard
          title="Total Omset Penjualan"
          value={formatCurrency(totalSalesVal)}
          subvalue="Penerimaan kotor periode ini"
          icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 22 }} />}
          iconBg={tokens.colors.brand[50]}
          iconColor={tokens.colors.brand[500]}
          trend="+15%"
          trendType="positive"
          trendLabel="vs periode lalu"
        />

        <MetricCard
          title="Estimasi Laba Kotor"
          value={formatCurrency(estimatedProfit)}
          subvalue="Rata-rata margin ~28%"
          icon={<TrendingUpOutlinedIcon sx={{ fontSize: 22 }} />}
          iconBg={tokens.colors.success[50]}
          iconColor={tokens.colors.success[600]}
          trend="+18%"
          trendType="positive"
          trendLabel="profitabilitas sehat"
        />

        <MetricCard
          title="Total Transaksi"
          value={totalTrxVal}
          subvalue="Struk lunas tercatat"
          icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 22 }} />}
          iconBg={tokens.colors.neutral[100]}
          iconColor={tokens.colors.neutral[600]}
        />

        <MetricCard
          title="Produk Terjual"
          value={`${totalItemsVal} unit`}
          subvalue="Total kuantitas keluar"
          icon={<ShoppingBagOutlinedIcon sx={{ fontSize: 22 }} />}
          iconBg={tokens.colors.brand[50]}
          iconColor={tokens.colors.brand[600]}
        />
      </Box>

      {/* Filter Period Toolbar */}
      <Card
        elevation={0}
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: '12px',
          bgcolor: '#ffffff',
          border: `1px solid ${tokens.colors.neutral[200]}`,
          boxShadow: tokens.shadows.card,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BarChartOutlinedIcon sx={{ color: tokens.colors.brand[500] }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: tokens.colors.neutral[900], fontSize: '0.9rem' }}>
              Filter Periode Laporan
            </Typography>
          </Box>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel sx={{ fontSize: '0.825rem' }}>Periode Waktu</InputLabel>
            <Select
              value={period}
              label="Periode Waktu"
              onChange={e => setPeriod(e.target.value)}
              sx={{ fontSize: '0.825rem' }}
            >
              <MenuItem value="hari_ini" sx={{ fontSize: '0.825rem' }}>Hari Ini</MenuItem>
              <MenuItem value="7hari" sx={{ fontSize: '0.825rem' }}>7 Hari Terakhir</MenuItem>
              <MenuItem value="bulan_ini" sx={{ fontSize: '0.825rem' }}>Bulan Ini (Oktober)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* TWO COLUMN ROW: Chart (Left) & Best Sellers (Right) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '1.6fr 1.4fr',
          },
          gap: 2.5,
        }}
      >
        {/* Left: Bar Chart Penjualan Harian */}
        <Card
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '12px',
            bgcolor: '#ffffff',
            border: `1px solid ${tokens.colors.neutral[200]}`,
            boxShadow: tokens.shadows.card,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: tokens.colors.neutral[900], fontSize: '0.975rem' }}>
              Grafik Omset Harian
            </Typography>
            <Typography variant="caption" sx={{ color: tokens.colors.neutral[500] }}>
              Perbandingan nominal penjualan per hari (dalam Rupiah)
            </Typography>
          </Box>

          <Box sx={{ width: '100%', height: 300, flexGrow: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tokens.colors.neutral[100]} />
                <XAxis dataKey="day" stroke={tokens.colors.neutral[400]} fontSize={11} tickLine={false} axisLine={false} dy={8} />
                <YAxis
                  stroke={tokens.colors.neutral[400]}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => {
                    if (val === 0) return '0';
                    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                    return `${val / 1000}K`;
                  }}
                />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), 'Omset']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: `1px solid ${tokens.colors.neutral[200]}`,
                    boxShadow: tokens.shadows.card,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                />
                <Bar dataKey="sales" radius={[5, 5, 0, 0]} barSize={34}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={tokens.colors.brand[500]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Card>

        {/* Right: Best Sellers Table */}
        <Card
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '12px',
            bgcolor: '#ffffff',
            border: `1px solid ${tokens.colors.neutral[200]}`,
            boxShadow: tokens.shadows.card,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: tokens.colors.neutral[900], fontSize: '0.975rem' }}>
              Produk Terlaris (Best Sellers)
            </Typography>
            <Typography variant="caption" sx={{ color: tokens.colors.neutral[500] }}>
              Kontribusi kuantitas dan pendapatan per SKU
            </Typography>
          </Box>

          <TableContainer sx={{ flexGrow: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 40 }}>#</TableCell>
                  <TableCell>Produk</TableCell>
                  <TableCell align="center">Terjual</TableCell>
                  <TableCell align="right">Total Omset</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bestSellers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ p: 0 }}>
                      <EmptyState title="Belum Ada Data Penjualan" message="Laporan best seller akan muncul setelah ada transaksi." />
                    </TableCell>
                  </TableRow>
                ) : (
                  bestSellers.map((item, idx) => {
                    const rev = Number(item.totalRevenue) || 0;
                    const pct = Math.round((rev / maxRevenue) * 100);

                    return (
                      <TableRow key={item.productId || idx} hover>
                        <TableCell sx={{ fontWeight: 700, color: tokens.colors.neutral[500] }}>
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.colors.neutral[900], fontSize: '0.825rem' }}>
                            {item.productName}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={pct}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              mt: 0.5,
                              bgcolor: tokens.colors.neutral[100],
                              '& .MuiLinearProgress-bar': { bgcolor: tokens.colors.brand[500], borderRadius: 2 },
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: tokens.colors.neutral[700], fontFeatureSettings: '"tnum"' }}>
                          {item.totalQuantity} unit
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: tokens.colors.neutral[900], fontFeatureSettings: '"tnum"' }}>
                          {formatCurrency(rev)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    </Box>
  );
};

export default ReportsPage;

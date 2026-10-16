import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Button,
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
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EqualizerRoundedIcon from '@mui/icons-material/EqualizerRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';

import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import tokens from '../theme/tokens';
import MetricCard from '../components/common/MetricCard';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import ProductVisual from '../components/common/ProductVisual';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);

  const [currentTime, setCurrentTime] = useState({
    dateStr: '',
    timeStr: '',
  });

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
      ];
      const dayName = days[now.getDay()];
      const dayNum = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      setCurrentTime({
        dateStr: `${dayName}, ${dayNum} ${monthName} ${year}`,
        timeStr: `${hours}:${minutes} WIB`,
      });
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data?.data) {
          setData(res.data.data);
        }
      } catch (err) {
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.data && Array.isArray(res.data.data)) {
          setCategories(res.data.data);
        }
      } catch (err) {
      }
    };

    fetchDashboard();
    fetchCategories();
  }, []);

  const displayName = user?.name || user?.username || 'Owner';
  const roleName = user?.role || 'Owner';

  const todaySalesVal = data?.todaySales ?? 0;
  const todaySales = formatCurrency(todaySalesVal);
  const todayTransactions = data?.todayTransactions ?? 0;
  const totalProducts = data?.totalProducts ?? 0;
  const lowStockCount = data?.lowStockCount ?? 0;

  const chartData = useMemo(() => {
    if (data?.weeklySales && Array.isArray(data.weeklySales) && data.weeklySales.length > 0) {
      return data.weeklySales.map((item, idx) => {
        const d = new Date(item.date);
        const label = `${d.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][d.getMonth()]}`;
        return {
          day: label,
          value: Number(item.total) || 0,
          isToday: idx === data.weeklySales.length - 1,
        };
      });
    }
    return [];
  }, [data]);

  const lowStockItems = useMemo(() => {
    if (data?.lowStockProducts && Array.isArray(data.lowStockProducts)) {
      return data.lowStockProducts.map(p => ({
        id: p.id || p.productId,
        name: p.name || p.productName,
        code: p.code || p.productCode || '-',
        stock: p.stock !== undefined ? p.stock : (p.currentStock || 0),
        minStock: p.minimumStock !== undefined ? p.minimumStock : (p.minStock || 10),
      }));
    }
    return [];
  }, [data]);

  const recentTransactions = useMemo(() => {
    if (data?.recentTransactions && Array.isArray(data.recentTransactions)) {
      return data.recentTransactions.map(t => ({
        no: t.transactionNo,
        date: t.createdAt ? new Date(t.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
        items: `${t.itemCount || 1} item`,
        total: formatCurrency(t.total || t.totalAmount || 0),
        method: (t.paymentMethod || '').toLowerCase() === 'cash' || (t.paymentMethod || '').toLowerCase() === 'tunai' ? 'Tunai' : 'QRIS',
        status: 'Selesai',
      }));
    }
    return [];
  }, [data]);

  const categoryList = useMemo(() => {
    if (categories.length > 0) {
      const palette = [
        tokens.colors.brand[500],
        tokens.colors.brand[400] || '#60a5fa',
        '#93c5fd',
        tokens.colors.neutral[300],
        tokens.colors.neutral[400],
      ];
      return categories.slice(0, 5).map((cat, idx) => ({
        rank: idx + 1,
        name: cat.name,
        percent: Math.round(100 / Math.max(1, categories.length)),
        barColor: palette[idx % palette.length],
      }));
    }
    return [];
  }, [categories]);

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', pb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          mb: 3,
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.5 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: tokens.colors.neutral[900],
                fontSize: { xs: '1.35rem', sm: '1.55rem' },
                letterSpacing: '-0.02em',
              }}
            >
              Selamat datang, {displayName}!
            </Typography>
            <StatusBadge label={roleName} variant="info" size="small" />
          </Box>
          <Typography variant="body2" sx={{ color: tokens.colors.neutral[500], fontSize: '0.84rem' }}>
            Pantau performa penjualan toko dan status inventaris secara real-time.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              bgcolor: '#ffffff',
              border: `1px solid ${tokens.colors.neutral[200]}`,
              borderRadius: '10px',
              px: 1.75,
              py: 0.8,
              boxShadow: tokens.shadows.card,
            }}
          >
            <CalendarMonthOutlinedIcon sx={{ color: tokens.colors.brand[500], fontSize: 18 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.colors.neutral[900], fontSize: '0.8125rem', lineHeight: 1.2 }}>
                {currentTime.dateStr}
              </Typography>
              <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], fontSize: '0.72rem' }}>
                {currentTime.timeStr}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={() => navigate('/kasir')}
            startIcon={<PointOfSaleIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: tokens.colors.brand[500],
              borderRadius: '10px',
              py: 0.9,
              px: 2,
              fontWeight: 700,
              fontSize: '0.8125rem',
              '&:hover': { bgcolor: tokens.colors.brand[600] },
            }}
          >
            Buka Kasir (POS)
          </Button>
        </Box>
      </Box>

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
          title="Omset Hari Ini"
          value={todaySales}
          subvalue="Total penerimaan penjualan"
          icon={<PointOfSaleIcon sx={{ fontSize: 22 }} />}
          iconBg={tokens.colors.brand[50]}
          iconColor={tokens.colors.brand[500]}
          trend={todaySalesVal > 0 ? "Aktif" : "Belum Ada"}
          trendType={todaySalesVal > 0 ? "positive" : "neutral"}
          trendLabel="penjualan harian"
        />

        <MetricCard
          title="Total Transaksi"
          value={todayTransactions}
          subvalue="Struk transaksi berhasil"
          icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 22 }} />}
          iconBg={tokens.colors.success[50]}
          iconColor={tokens.colors.success[600]}
          trend={todayTransactions > 0 ? `${todayTransactions} Struk` : "0 Struk"}
          trendType={todayTransactions > 0 ? "positive" : "neutral"}
          trendLabel="hari ini"
        />

        <MetricCard
          title="Katalog Produk"
          value={totalProducts}
          subvalue="Total SKU aktif terdaftar"
          icon={<Inventory2OutlinedIcon sx={{ fontSize: 22 }} />}
          iconBg={tokens.colors.neutral[100]}
          iconColor={tokens.colors.neutral[600]}
          trend="Aktif"
          trendType="neutral"
          trendLabel="inventori toko"
          onClick={() => navigate('/produk')}
        />

        <MetricCard
          title="Stok Menipis"
          value={lowStockCount}
          subvalue="Di bawah batas minimum"
          icon={<WarningAmberRoundedIcon sx={{ fontSize: 22 }} />}
          iconBg={lowStockCount > 0 ? tokens.colors.warning[50] : tokens.colors.success[50]}
          iconColor={lowStockCount > 0 ? tokens.colors.warning[600] : tokens.colors.success[600]}
          trend={lowStockCount > 0 ? "Perlu Restock" : "Aman"}
          trendType={lowStockCount > 0 ? "negative" : "positive"}
          trendLabel="prioritas belanja"
          onClick={() => navigate('/stok')}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '1.8fr 1.2fr',
          },
          gap: 2.5,
          mb: 3,
        }}
      >
        <Card
          elevation={0}
          sx={{
            p: 2.75,
            borderRadius: '12px',
            bgcolor: '#ffffff',
            border: `1px solid ${tokens.colors.neutral[200]}`,
            boxShadow: tokens.shadows.card,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '8px',
                  bgcolor: tokens.colors.brand[50],
                  color: tokens.colors.brand[500],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EqualizerRoundedIcon sx={{ fontSize: 19 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: tokens.colors.neutral[900], fontSize: '0.95rem' }}>
                  Tren Penjualan 7 Hari Terakhir
                </Typography>
                <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], fontSize: '0.78rem' }}>
                  Pergerakan omset harian toko (dalam Rupiah)
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 1.2,
                py: 0.4,
                borderRadius: '6px',
                bgcolor: tokens.colors.neutral[100],
                color: tokens.colors.neutral[600],
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              7 Hari Terakhir
            </Box>
          </Box>

          <Box sx={{ width: '100%', height: 260, flexGrow: 1, mt: 1 }}>
            {chartData.length === 0 ? (
              <EmptyState
                title="Belum Ada Data Penjualan"
                message="Grafik omset harian akan otomatis terbentuk saat kasir memproses transaksi."
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tokens.colors.neutral[100]} />
                  <XAxis
                    dataKey="day"
                    stroke={tokens.colors.neutral[400]}
                    fontSize={11}
                    fontWeight={500}
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                  />
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
                    cursor={{ fill: tokens.colors.neutral[50] }}
                    formatter={(val) => [formatCurrency(val), 'Penjualan']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: `1px solid ${tokens.colors.neutral[200]}`,
                      boxShadow: tokens.shadows.card,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  />
                  <Bar dataKey="value" radius={[5, 5, 0, 0]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isToday ? tokens.colors.brand[500] : tokens.colors.brand[200]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Card>

        <Card
          elevation={0}
          sx={{
            p: 2.75,
            borderRadius: '12px',
            bgcolor: '#ffffff',
            border: `1px solid ${tokens.colors.neutral[200]}`,
            boxShadow: tokens.shadows.card,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '8px',
                  bgcolor: tokens.colors.warning[50],
                  color: tokens.colors.warning[600],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <WarningAmberRoundedIcon sx={{ fontSize: 19 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: tokens.colors.neutral[900], fontSize: '0.95rem' }}>
                  Stok Menipis
                </Typography>
                <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], fontSize: '0.78rem' }}>
                  Barang di bawah batas minimum
                </Typography>
              </Box>
            </Box>

            <Box
              onClick={() => navigate('/stok')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                color: tokens.colors.brand[600],
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                '&:hover': { color: tokens.colors.brand[700] },
              }}
            >
              Lihat Semua
              <ChevronRightRoundedIcon sx={{ fontSize: 15 }} />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, flexGrow: 1, justifyContent: 'center' }}>
            {lowStockItems.length === 0 ? (
              <EmptyState
                title="Stok Aman"
                message="Semua produk memiliki persediaan di atas batas minimum."
              />
            ) : (
              lowStockItems.slice(0, 4).map((item) => {
                const isCritical = item.stock <= Math.min(5, item.minStock);
                return (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.25,
                      borderRadius: '8px',
                      border: `1px solid ${isCritical ? tokens.colors.danger[100] : tokens.colors.warning[100]}`,
                      bgcolor: isCritical ? tokens.colors.danger[50] : tokens.colors.warning[50],
                      transition: tokens.transitions.fast,
                      '&:hover': { transform: 'translateX(2px)' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '8px',
                          bgcolor: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: `1px solid ${tokens.colors.neutral[200]}`,
                        }}
                      >
                        <ProductVisual code={item.code} name={item.name} size={24} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{
                            fontWeight: 700,
                            color: tokens.colors.neutral[900],
                            fontSize: '0.825rem',
                            lineHeight: 1.2,
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], fontSize: '0.72rem' }}>
                          SKU: {item.code} • Min: {item.minStock}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <StatusBadge
                        status={isCritical ? 'kritis' : 'menipis'}
                        label={`${item.stock} unit`}
                        size="small"
                        showDot
                      />
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>

          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/stok?tab=masuk')}
            startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              mt: 2,
              borderRadius: '8px',
              py: 0.75,
              fontSize: '0.78rem',
              fontWeight: 700,
              borderColor: tokens.colors.neutral[300],
              color: tokens.colors.neutral[700],
            }}
          >
            Input Stok Masuk
          </Button>
        </Card>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '1.8fr 1.2fr',
          },
          gap: 2.5,
        }}
      >
        <Card
          elevation={0}
          sx={{
            p: 2.75,
            borderRadius: '12px',
            bgcolor: '#ffffff',
            border: `1px solid ${tokens.colors.neutral[200]}`,
            boxShadow: tokens.shadows.card,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '8px',
                  bgcolor: tokens.colors.brand[50],
                  color: tokens.colors.brand[500],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ReceiptLongOutlinedIcon sx={{ fontSize: 19 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: tokens.colors.neutral[900], fontSize: '0.95rem' }}>
                  Transaksi Penjualan Terkini
                </Typography>
                <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], fontSize: '0.78rem' }}>
                  Daftar transaksi kasir yang baru saja diproses
                </Typography>
              </Box>
            </Box>

            <Box
              onClick={() => navigate('/transaksi')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                color: tokens.colors.brand[600],
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                '&:hover': { color: tokens.colors.brand[700] },
              }}
            >
              Semua Transaksi
              <ChevronRightRoundedIcon sx={{ fontSize: 15 }} />
            </Box>
          </Box>

          <TableContainer sx={{ borderRadius: '8px', border: `1px solid ${tokens.colors.neutral[200]}` }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>No. Transaksi</TableCell>
                  <TableCell>Waktu</TableCell>
                  <TableCell>Item</TableCell>
                  <TableCell align="right">Total Tagihan</TableCell>
                  <TableCell align="center">Metode</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ p: 2 }}>
                      <EmptyState
                        title="Belum Ada Transaksi"
                        message="Daftar transaksi hari ini akan ditampilkan di sini."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  recentTransactions.map((trx, idx) => (
                    <TableRow
                      key={trx.no || idx}
                      hover
                      sx={{
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate('/transaksi')}
                    >
                      <TableCell sx={{ fontWeight: 700, color: tokens.colors.brand[600] }}>
                        {trx.no}
                      </TableCell>
                      <TableCell sx={{ color: tokens.colors.neutral[600] }}>{trx.date}</TableCell>
                      <TableCell sx={{ color: tokens.colors.neutral[600] }}>{trx.items}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: tokens.colors.neutral[900], fontFeatureSettings: '"tnum"' }}>
                        {trx.total}
                      </TableCell>
                      <TableCell align="center">
                        <StatusBadge
                          label={trx.method}
                          variant={trx.method === 'Tunai' ? 'info' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <StatusBadge status="selesai" label="Selesai" size="small" showDot />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        <Card
          elevation={0}
          sx={{
            p: 2.75,
            borderRadius: '12px',
            bgcolor: '#ffffff',
            border: `1px solid ${tokens.colors.neutral[200]}`,
            boxShadow: tokens.shadows.card,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '8px',
                  bgcolor: tokens.colors.brand[50],
                  color: tokens.colors.brand[500],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BarChartOutlinedIcon sx={{ fontSize: 19 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: tokens.colors.neutral[900], fontSize: '0.95rem' }}>
                  Kategori Terdaftar
                </Typography>
                <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], fontSize: '0.78rem' }}>
                  Pengelompokan produk aktif dalam database toko
                </Typography>
              </Box>
            </Box>

            <Box
              onClick={() => navigate('/kategori')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                color: tokens.colors.brand[600],
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                '&:hover': { color: tokens.colors.brand[700] },
              }}
            >
              Kategori
              <ChevronRightRoundedIcon sx={{ fontSize: 15 }} />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, flexGrow: 1, justifyContent: 'center' }}>
            {categoryList.length === 0 ? (
              <EmptyState
                title="Belum Ada Kategori"
                message="Tambahkan kategori produk melalui menu Kategori."
              />
            ) : (
              categoryList.map((cat) => (
                <Box key={cat.rank}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '4px',
                          bgcolor: tokens.colors.neutral[100],
                          color: tokens.colors.neutral[700],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                        }}
                      >
                        {cat.rank}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: tokens.colors.neutral[800], fontSize: '0.825rem' }}>
                        {cat.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.colors.neutral[900], fontSize: '0.8rem' }}>
                      Aktif
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={cat.percent}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: tokens.colors.neutral[100],
                      '& .MuiLinearProgress-bar': {
                        bgcolor: cat.barColor,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              ))
            )}
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardPage;

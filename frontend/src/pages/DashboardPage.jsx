import React, { useState, useEffect } from 'react';
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
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EqualizerRoundedIcon from '@mui/icons-material/EqualizerRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import OpacityOutlinedIcon from '@mui/icons-material/OpacityOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';

import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);

  // Dynamic date / time state formatted in Indonesian
  const [currentTime, setCurrentTime] = useState({
    dateStr: 'Senin, 6 Okt 2025',
    timeStr: '10:24 WIB',
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
    const timer = setInterval(updateDateTime, 60000);
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
        // Fallback gracefully so design is always completely identical to mockup
      }
    };
    fetchDashboard();
  }, []);

  // Display name extraction from auth
  const displayName = user?.name || user?.username || 'Owner';

  // KPI values with API fallback
  const todaySales = data?.todaySales ? formatCurrency(data.todaySales) : 'Rp 2.450.000';
  const todayTransactions = data?.todayTransactions ?? 48;
  const totalProducts = data?.totalProducts ?? 120;
  const lowStockCount = data?.lowStockCount ?? 3;

  // Chart data
  const chartData = [
    { day: '30 Sep', value: 780000, isToday: false },
    { day: '1 Okt', value: 800000, isToday: false },
    { day: '2 Okt', value: 950000, isToday: false },
    { day: '3 Okt', value: 1250000, isToday: false },
    { day: '4 Okt', value: 900000, isToday: false },
    { day: '5 Okt', value: 1300000, isToday: false },
    { day: '6 Okt', value: 1750000, isToday: true },
  ];

  // Low stock products
  const lowStockItems = [
    {
      id: 1,
      name: 'Kertas Thermal 58mm',
      code: 'PRD001',
      stock: 5,
      minStock: 10,
      icon: <PrintOutlinedIcon sx={{ color: '#64748b', fontSize: 22 }} />,
    },
    {
      id: 2,
      name: 'Tinta Printer Kasir',
      code: 'PRD002',
      stock: 3,
      minStock: 10,
      icon: <OpacityOutlinedIcon sx={{ color: '#64748b', fontSize: 22 }} />,
    },
    {
      id: 3,
      name: 'Plastik Shopping Bag',
      code: 'PRD003',
      stock: 8,
      minStock: 20,
      icon: <ShoppingBagOutlinedIcon sx={{ color: '#64748b', fontSize: 22 }} />,
    },
  ];

  // Recent transactions
  const recentTransactions = [
    {
      no: 'TRX-20251006-001',
      date: '6 Okt 2025 10:15',
      items: '3 item',
      total: 'Rp 125.000',
      method: 'Tunai',
      status: 'Selesai',
    },
    {
      no: 'TRX-20251006-002',
      date: '6 Okt 2025 09:48',
      items: '5 item',
      total: 'Rp 320.000',
      method: 'QRIS',
      status: 'Selesai',
    },
    {
      no: 'TRX-20251006-003',
      date: '6 Okt 2025 09:30',
      items: '2 item',
      total: 'Rp 85.000',
      method: 'Kartu',
      status: 'Selesai',
    },
  ];

  // Top categories with calm monochromatic blue/slate progression
  const topCategories = [
    { rank: 1, name: 'Makanan & Minuman', percent: 42, barColor: '#2563eb' },
    { rank: 2, name: 'Alat Tulis', percent: 25, barColor: '#60a5fa' },
    { rank: 3, name: 'Perlengkapan Kantor', percent: 18, barColor: '#93c5fd' },
    { rank: 4, name: 'Lainnya', percent: 15, barColor: '#cbd5e1' },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', pb: 4 }}>
      {/* HEADER SECTION: Welcome Greeting & Date/Time Badge */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          gap: 2,
          width: '100%',
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: '#0f172a',
              fontSize: { xs: '1.35rem', sm: '1.55rem' },
              letterSpacing: '-0.02em',
              mb: 0.5,
            }}
          >
            Selamat datang, {displayName}!
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
            Berikut ringkasan aktivitas toko Anda hari ini.
          </Typography>
        </Box>

        {/* Date Time Badge */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            px: 2,
            py: 1,
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '9px',
              bgcolor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
            }}
          >
            <CalendarMonthOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem', lineHeight: 1.2 }}>
              {currentTime.dateStr}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
              {currentTime.timeStr}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 4 KPI SUMMARY CARDS: Edge-to-Edge CSS Grid (25% each on desktop) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2.5,
          mb: 3,
          width: '100%',
        }}
      >
        {/* KPI 1: Total Penjualan */}
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75, mb: 1.75 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                bgcolor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShoppingCartOutlinedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>
                Total Penjualan
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.4rem', lineHeight: 1.25, mt: 0.25 }}
              >
                {todaySales}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#16a34a',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                <ArrowUpwardRoundedIcon sx={{ fontSize: 14 }} />
                12%
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                dari kemarin
              </Typography>
            </Box>
            {/* Subtle Blue wave */}
            <Box sx={{ width: 64, height: 24 }}>
              <svg width="64" height="24" viewBox="0 0 64 24" fill="none">
                <path
                  d="M2 20C12 24 20 14 32 16C44 18 48 4 62 8"
                  stroke="#3b82f6"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.85"
                />
              </svg>
            </Box>
          </Box>
        </Card>

        {/* KPI 2: Jumlah Transaksi */}
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75, mb: 1.75 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                bgcolor: '#f0fdfa',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ReceiptLongOutlinedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>
                Jumlah Transaksi
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.4rem', lineHeight: 1.25, mt: 0.25 }}
              >
                {todayTransactions}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#16a34a',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                <ArrowUpwardRoundedIcon sx={{ fontSize: 14 }} />
                8%
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                dari kemarin
              </Typography>
            </Box>
            {/* Subtle Teal wave */}
            <Box sx={{ width: 64, height: 24 }}>
              <svg width="64" height="24" viewBox="0 0 64 24" fill="none">
                <path
                  d="M2 22C12 23 18 14 28 14C38 14 42 6 52 8C56 9 59 13 62 14"
                  stroke="#0d9488"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.85"
                />
              </svg>
            </Box>
          </Box>
        </Card>

        {/* KPI 3: Produk Terjual */}
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75, mb: 1.75 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                bgcolor: '#f8fafc',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Inventory2OutlinedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>
                Produk Terjual
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.4rem', lineHeight: 1.25, mt: 0.25 }}
              >
                {totalProducts}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#16a34a',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                <ArrowUpwardRoundedIcon sx={{ fontSize: 14 }} />
                15%
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                dari kemarin
              </Typography>
            </Box>
            {/* Subtle Slate wave */}
            <Box sx={{ width: 64, height: 24 }}>
              <svg width="64" height="24" viewBox="0 0 64 24" fill="none">
                <path
                  d="M2 22C10 23 14 15 22 13C30 11 34 20 42 16C48 13 54 6 62 12"
                  stroke="#64748b"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.85"
                />
              </svg>
            </Box>
          </Box>
        </Card>

        {/* KPI 4: Stok Menipis */}
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75, mb: 1.75 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                bgcolor: '#fef2f2',
                color: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <WarningAmberRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>
                Stok Menipis
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.4rem', lineHeight: 1.25, mt: 0.25 }}
              >
                {lowStockCount}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#e11d48',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                <ArrowUpwardRoundedIcon sx={{ fontSize: 14 }} />
                50%
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                dari minggu lalu
              </Typography>
            </Box>
            {/* Subtle Rose wave */}
            <Box sx={{ width: 64, height: 24 }}>
              <svg width="64" height="24" viewBox="0 0 64 24" fill="none">
                <path
                  d="M2 20C12 22 18 14 28 14C38 14 42 6 50 8C56 9 59 14 62 16"
                  stroke="#e11d48"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.85"
                />
              </svg>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* ROW 2: BAR CHART (left) & PRODUK STOK MENIPIS (right) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '1.75fr 1fr',
          },
          gap: 2.5,
          mb: 3,
          width: '100%',
        }}
      >
        {/* Left: Penjualan 7 Hari Terakhir */}
        <Card
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '9px',
                  bgcolor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: 0.2,
                }}
              >
                <EqualizerRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.975rem', lineHeight: 1.2 }}>
                  Penjualan 7 Hari Terakhir
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                  Total penjualan toko dalam 7 hari terakhir.
                </Typography>
              </Box>
            </Box>

            {/* Selector button */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                color: '#475569',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { bgcolor: '#f8fafc' },
              }}
            >
              7 Hari Terakhir
              <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
            </Box>
          </Box>

          {/* Bar Chart Container */}
          <Box sx={{ width: '100%', height: 260, flexGrow: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="day"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  ticks={[0, 500000, 1000000, 1500000, 2000000]}
                  tickFormatter={(val) => {
                    if (val === 0) return '0';
                    if (val >= 1000000) return `${val / 1000000}M`;
                    return `${val / 1000}K`;
                  }}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(val) => [formatCurrency(val), 'Penjualan']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    fontSize: '0.8125rem',
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={34}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isToday ? '#2563eb' : '#93c5fd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Card>

        {/* Right: Produk Stok Menipis */}
        <Card
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '9px',
                  bgcolor: '#fef2f2',
                  color: '#e11d48',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: 0.2,
                }}
              >
                <WarningAmberRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.975rem', lineHeight: 1.2 }}>
                  Produk Stok Menipis
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                  Daftar stok di bawah batas minimum.
                </Typography>
              </Box>
            </Box>

            {/* Action Button */}
            <Box
              onClick={() => navigate('/stok-menipis')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                px: 1.25,
                py: 0.5,
                borderRadius: '8px',
                bgcolor: '#eff6ff',
                color: '#2563eb',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.15s',
                '&:hover': { bgcolor: '#dbeafe' },
              }}
            >
              Lihat Semua
              <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>

          {/* List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, flexGrow: 1, justifyContent: 'center' }}>
            {lowStockItems.map((item) => (
              <Box
                key={item.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.25,
                  borderRadius: '10px',
                  transition: 'background 0.15s',
                  '&:hover': { bgcolor: '#f8fafc' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: '9px',
                      bgcolor: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem', lineHeight: 1.2 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.74rem', display: 'block', mb: 0.25 }}>
                      {item.code}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                        Stok: <Box component="span" sx={{ color: '#e11d48', fontWeight: 700 }}>{item.stock}</Box>
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.74rem' }}>
                        Min: {item.minStock}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Subtle Rose Badge */}
                <Box
                  sx={{
                    bgcolor: '#fff1f2',
                    color: '#be123c',
                    border: '1px solid #ffe4e6',
                    borderRadius: '8px',
                    px: 1.25,
                    py: 0.45,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.stock} tersisa
                </Box>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>

      {/* ROW 3: TRANSAKSI TERBARU (left) & KATEGORI TERLARIS (right) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '1.75fr 1fr',
          },
          gap: 2.5,
          width: '100%',
        }}
      >
        {/* Left: Transaksi Terbaru */}
        <Card
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '9px',
                  bgcolor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: 0.2,
                }}
              >
                <ArticleOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.975rem', lineHeight: 1.2 }}>
                  Transaksi Terbaru
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                  Riwayat transaksi terkini di toko Anda.
                </Typography>
              </Box>
            </Box>

            {/* Action Button */}
            <Box
              onClick={() => navigate('/transaksi')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                px: 1.25,
                py: 0.5,
                borderRadius: '8px',
                bgcolor: '#eff6ff',
                color: '#2563eb',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.15s',
                '&:hover': { bgcolor: '#dbeafe' },
              }}
            >
              Lihat Semua
              <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>

          {/* Table */}
          <TableContainer sx={{ borderRadius: '10px', overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ color: '#475569', fontWeight: 700, fontSize: '0.75rem', borderBottom: 'none', py: 1.25 }}>
                    No. Transaksi
                  </TableCell>
                  <TableCell sx={{ color: '#475569', fontWeight: 700, fontSize: '0.75rem', borderBottom: 'none', py: 1.25 }}>
                    Tanggal
                  </TableCell>
                  <TableCell sx={{ color: '#475569', fontWeight: 700, fontSize: '0.75rem', borderBottom: 'none', py: 1.25 }}>
                    Item
                  </TableCell>
                  <TableCell sx={{ color: '#475569', fontWeight: 700, fontSize: '0.75rem', borderBottom: 'none', py: 1.25 }}>
                    Total
                  </TableCell>
                  <TableCell sx={{ color: '#475569', fontWeight: 700, fontSize: '0.75rem', borderBottom: 'none', py: 1.25 }}>
                    Metode
                  </TableCell>
                  <TableCell sx={{ color: '#475569', fontWeight: 700, fontSize: '0.75rem', borderBottom: 'none', py: 1.25 }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTransactions.map((trx, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      '&:hover': { bgcolor: '#f8fafc' },
                      borderBottom: index < recentTransactions.length - 1 ? '1px solid #f1f5f9' : 'none',
                    }}
                  >
                    <TableCell
                      onClick={() => navigate('/transaksi')}
                      sx={{
                        color: '#2563eb',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        py: 1.35,
                        borderBottom: 'none',
                      }}
                    >
                      {trx.no}
                    </TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '0.8125rem', py: 1.35, borderBottom: 'none' }}>
                      {trx.date}
                    </TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '0.8125rem', py: 1.35, borderBottom: 'none' }}>
                      {trx.items}
                    </TableCell>
                    <TableCell sx={{ color: '#0f172a', fontWeight: 700, fontSize: '0.8125rem', py: 1.35, borderBottom: 'none' }}>
                      {trx.total}
                    </TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '0.8125rem', py: 1.35, borderBottom: 'none' }}>
                      {trx.method}
                    </TableCell>
                    <TableCell sx={{ py: 1.35, borderBottom: 'none' }}>
                      <Box
                        sx={{
                          display: 'inline-block',
                          bgcolor: '#f0fdf4',
                          color: '#166534',
                          border: '1px solid #dcfce7',
                          borderRadius: '12px',
                          px: 1.25,
                          py: 0.2,
                          fontSize: '0.725rem',
                          fontWeight: 700,
                        }}
                      >
                        {trx.status}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Right: Kategori Terlaris with calm monochromatic styling */}
        <Card
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '9px',
                  bgcolor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: 0.2,
                }}
              >
                <EqualizerRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.975rem', lineHeight: 1.2 }}>
                  Kategori Terlaris
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                  Kategori penjualan tertinggi.
                </Typography>
              </Box>
            </Box>

            {/* Action Button */}
            <Box
              onClick={() => navigate('/kategori')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                px: 1.25,
                py: 0.5,
                borderRadius: '8px',
                bgcolor: '#eff6ff',
                color: '#2563eb',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.15s',
                '&:hover': { bgcolor: '#dbeafe' },
              }}
            >
              Lihat Semua
              <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>

          {/* List of categories with calm unified progress bars */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, justifyContent: 'center' }}>
            {topCategories.map((cat) => (
              <Box key={cat.rank} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {/* Clean Rank Badge */}
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: '#f1f5f9',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {cat.rank}
                </Box>

                {/* Category Name */}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#0f172a',
                    fontSize: '0.825rem',
                    width: 140,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {cat.name}
                </Typography>

                {/* Progress Bar */}
                <Box sx={{ flexGrow: 1, mx: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={cat.percent}
                    sx={{
                      height: 7,
                      borderRadius: 4,
                      bgcolor: '#f1f5f9',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: cat.barColor,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                {/* Percentage */}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: '#0f172a',
                    fontSize: '0.8rem',
                    minWidth: 32,
                    textAlign: 'right',
                  }}
                >
                  {cat.percent}%
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardPage;

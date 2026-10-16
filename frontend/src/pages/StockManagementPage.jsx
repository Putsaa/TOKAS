import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  Tabs,
  Tab,
  TextField,
  Button,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputBase,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import MetricCard from '../components/common/MetricCard';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import ProductVisual from '../components/common/ProductVisual';
import tokens from '../theme/tokens';
import { fetchAndSyncProducts } from '../services/productStockService';

const REASON_PRESETS = [
  'Hasil Stock Opname Berkala',
  'Barang Rusak / Pecah / Cacat',
  'Barang Kedaluwarsa (Expired)',
  'Koreksi Kesalahan Input Kasir / Masuk',
  'Hilang / Selisih Fisik Toko',
  'Lainnya',
];

const QUICK_QTY_BUTTONS = [5, 10, 25, 50, 100];

export default function StockManagementPage({ defaultTab }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const getTabFromLocation = useCallback(() => {
    if (defaultTab !== undefined) return defaultTab;
    const path = location.pathname;
    if (path.includes('stok-masuk')) return 1;
    if (path.includes('penyesuaian-stok')) return 2;
    if (path.includes('stok-menipis')) return 0;

    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === '1' || tabParam === 'masuk') return 1;
    if (tabParam === '2' || tabParam === 'opname' || tabParam === 'adjustment') return 2;
    return 0;
  }, [defaultTab, location.pathname, location.search]);

  const [activeTab, setActiveTab] = useState(getTabFromLocation);

  useEffect(() => {
    setActiveTab(getTabFromLocation());
  }, [getTabFromLocation]);

  const [products, setProducts] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [searchFilter, setSearchFilter] = useState('');

  const [stockInProduct, setStockInProduct] = useState(null);
  const [stockInQty, setStockInQty] = useState('');
  const [stockInSupplier, setStockInSupplier] = useState('');
  const [stockInReason, setStockInReason] = useState('');

  const [adjustmentProduct, setAdjustmentProduct] = useState(null);
  const [adjustmentActualStock, setAdjustmentActualStock] = useState('');
  const [adjustmentReasonCategory, setAdjustmentReasonCategory] = useState(REASON_PRESETS[0]);
  const [adjustmentNotes, setAdjustmentNotes] = useState('');

  const [restockDialog, setRestockDialog] = useState({
    open: false,
    product: null,
    quantity: '20',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const prods = await fetchAndSyncProducts();
      setProducts(prods || []);

      const lowRes = await api.get('/stock/low');
      if (lowRes.data?.data && Array.isArray(lowRes.data.data)) {
        const mappedLow = lowRes.data.data.map(item => ({
          id: item.id,
          name: item.name,
          code: item.code || '-',
          stock: item.stock !== undefined ? item.stock : 0,
          minimumStock: item.minimumStock !== undefined ? item.minimumStock : 10,
          unit: item.unit || 'pcs',
          categoryName: item.categoryName || '-',
        }));
        setLowStockItems(mappedLow);
      } else {
        setLowStockItems([]);
      }
    } catch (err) {
      setLowStockItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    const tabMap = { 0: 'menipis', 1: 'masuk', 2: 'opname' };
    navigate(`/stok?tab=${tabMap[newValue]}`, { replace: true });
  };

  const handleTransferToStockIn = (product) => {
    const matched = products.find(p => p.id === product.id);
    if (matched) {
      setStockInProduct(matched);
    } else {
      setStockInProduct({
        id: product.id,
        nama: product.name,
        kode: product.code,
        stok: product.stock,
        unit: product.unit,
      });
    }
    setStockInQty('20');
    setActiveTab(1);
    navigate('/stok?tab=masuk', { replace: true });
  };

  const handleTransferToAdjustment = (product) => {
    const matched = products.find(p => p.id === product.id);
    if (matched) {
      setAdjustmentProduct(matched);
      setAdjustmentActualStock(matched.stok !== undefined ? String(matched.stok) : '0');
    } else {
      setAdjustmentProduct({
        id: product.id,
        nama: product.name,
        kode: product.code,
        stok: product.stock,
        unit: product.unit,
      });
      setAdjustmentActualStock(String(product.stock || 0));
    }
    setActiveTab(2);
    navigate('/stok?tab=opname', { replace: true });
  };

  const handleQuickRestockSubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(restockDialog.quantity, 10);
    const prod = restockDialog.product;
    if (!prod || isNaN(qty) || qty <= 0) {
      enqueueSnackbar('Jumlah restok harus lebih dari 0 unit!', { variant: 'warning' });
      return;
    }

    try {
      setActionLoading(true);
      await api.post('/stock/in', {
        productId: prod.id,
        quantity: qty,
        reason: 'Restok Cepat dari Panel Stok Menipis',
      });

      enqueueSnackbar(`Berhasil menambahkan ${qty} unit ke "${prod.name}"!`, { variant: 'success' });
      setRestockDialog({ open: false, product: null, quantity: '20' });
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memproses restok produk';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStockInSubmit = async (e) => {
    e.preventDefault();
    if (!stockInProduct) {
      enqueueSnackbar('Silakan pilih produk yang akan ditambahkan!', { variant: 'warning' });
      return;
    }
    const qty = parseInt(stockInQty, 10);
    if (isNaN(qty) || qty <= 0) {
      enqueueSnackbar('Jumlah stok masuk harus lebih besar dari 0!', { variant: 'warning' });
      return;
    }

    try {
      setActionLoading(true);
      const fullReason = [
        stockInSupplier ? `Supplier: ${stockInSupplier}` : '',
        stockInReason.trim() ? stockInReason.trim() : 'Penerimaan stok reguler',
      ].filter(Boolean).join(' • ');

      await api.post('/stock/in', {
        productId: stockInProduct.id,
        quantity: qty,
        reason: fullReason,
      });

      enqueueSnackbar(
        `Sukses! Menambahkan ${qty} unit pada ${stockInProduct.nama || stockInProduct.name}.`,
        { variant: 'success' }
      );

      setStockInProduct(null);
      setStockInQty('');
      setStockInSupplier('');
      setStockInReason('');
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menambahkan stok masuk ke server';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault();
    if (!adjustmentProduct) {
      enqueueSnackbar('Silakan pilih produk yang akan disesuaikan!', { variant: 'warning' });
      return;
    }
    const actual = parseInt(adjustmentActualStock, 10);
    if (isNaN(actual) || actual < 0) {
      enqueueSnackbar('Stok aktual fisik harus angka 0 atau lebih!', { variant: 'warning' });
      return;
    }

    const currentStock = parseInt(adjustmentProduct.stok ?? adjustmentProduct.stock ?? 0, 10);
    if (actual === currentStock) {
      enqueueSnackbar('Stok aktual fisik sama persis dengan stok sistem. Tidak ada perubahan.', { variant: 'info' });
      return;
    }

    try {
      setActionLoading(true);
      const fullReason = [
        adjustmentReasonCategory,
        adjustmentNotes.trim(),
      ].filter(Boolean).join(' - ');

      await api.post('/stock/adjustment', {
        productId: adjustmentProduct.id,
        actualStock: actual,
        reason: fullReason,
      });

      enqueueSnackbar(
        `Penyesuaian sukses! Stok "${adjustmentProduct.nama || adjustmentProduct.name}" diperbarui menjadi ${actual} unit.`,
        { variant: 'success' }
      );

      setAdjustmentProduct(null);
      setAdjustmentActualStock('');
      setAdjustmentNotes('');
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal melakukan penyesuaian stok';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = lowStockItems.length;
    const critical = lowStockItems.filter(i => (i.stock || 0) <= Math.min(5, i.minimumStock || 5)).length;
    const warning = total - critical;
    return { total, critical, warning };
  }, [lowStockItems]);

  const filteredLowStock = useMemo(() => {
    if (!searchFilter.trim()) return lowStockItems;
    const q = searchFilter.toLowerCase();
    return lowStockItems.filter(
      i =>
        (i.name && i.name.toLowerCase().includes(q)) ||
        (i.code && i.code.toLowerCase().includes(q)) ||
        (i.categoryName && i.categoryName.toLowerCase().includes(q))
    );
  }, [lowStockItems, searchFilter]);

  const inCurrentStock = stockInProduct ? parseInt(stockInProduct.stok ?? stockInProduct.stock ?? 0, 10) : 0;
  const inQtyNum = parseInt(stockInQty, 10) || 0;
  const inProjectedStock = inCurrentStock + inQtyNum;

  const adjCurrentStock = adjustmentProduct ? parseInt(adjustmentProduct.stok ?? adjustmentProduct.stock ?? 0, 10) : 0;
  const adjActualNum = adjustmentActualStock === '' ? null : parseInt(adjustmentActualStock, 10);
  const adjDiff = adjActualNum !== null ? adjActualNum - adjCurrentStock : 0;
  const unitPrice = adjustmentProduct?.hargaBeli || 0;
  const estimatedFinancialImpact = Math.abs(adjDiff) * unitPrice;

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', pb: 4 }}>
      <PageHeader
        title="Kelola Stok & Opname"
        subtitle="Pantau persediaan menipis, catat barang masuk dari supplier, dan lakukan koreksi stok fisik (stock opname) dalam satu pusat kendali."
        action={
          <Button
            variant="outlined"
            onClick={loadData}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderColor: tokens.colors.neutral[300],
              color: tokens.colors.neutral[700],
              borderRadius: '8px',
              px: 2,
              py: 0.8,
              fontWeight: 600,
              fontSize: '0.825rem',
              '&:hover': {
                borderColor: tokens.colors.brand[500],
                bgcolor: tokens.colors.brand[50],
              },
            }}
          >
            Sinkronkan Data
          </Button>
        }
      />

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: '12px',
          bgcolor: '#ffffff',
          border: `1px solid ${tokens.colors.neutral[200]}`,
          boxShadow: tokens.shadows.card,
          p: 0.5,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              bgcolor: tokens.colors.brand[500],
            },
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: tokens.colors.neutral[600],
              px: 2.5,
              py: 1,
              '&.Mui-selected': {
                color: tokens.colors.brand[600],
                fontWeight: 700,
              },
            },
          }}
        >
          <Tab
            icon={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningAmberRoundedIcon sx={{ fontSize: 19, color: stats.total > 0 ? tokens.colors.warning[600] : 'inherit' }} />
                <span>Peringatan Stok Menipis</span>
                {stats.total > 0 && (
                  <Chip
                    label={stats.total}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: tokens.colors.danger[50],
                      color: tokens.colors.danger[700],
                      border: `1px solid ${tokens.colors.danger[200]}`,
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            icon={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileDownloadOutlinedIcon sx={{ fontSize: 19 }} />
                <span>Penerimaan Barang (Stok Masuk)</span>
              </Box>
            }
          />
          <Tab
            icon={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TuneOutlinedIcon sx={{ fontSize: 19 }} />
                <span>Penyesuaian Stok (Stock Opname)</span>
              </Box>
            }
          />
        </Tabs>
      </Card>

      {activeTab === 0 && (
        <Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(3, 1fr)',
              },
              gap: 2,
              mb: 3,
            }}
          >
            <MetricCard
              title="Perlu Restock Segera"
              value={stats.total}
              subvalue="SKU berada di batas minimum"
              icon={<WarningAmberRoundedIcon sx={{ fontSize: 22 }} />}
              iconBg={stats.total > 0 ? tokens.colors.warning[50] : tokens.colors.success[50]}
              iconColor={stats.total > 0 ? tokens.colors.warning[600] : tokens.colors.success[600]}
              trend={stats.total > 0 ? `${stats.total} SKU Kritis` : 'Stok Aman'}
              trendType={stats.total > 0 ? 'negative' : 'positive'}
            />

            <MetricCard
              title="Kondisi Kritis (<= 5 unit)"
              value={stats.critical}
              subvalue="Beresiko langsung habis di kasir"
              icon={<WarningAmberRoundedIcon sx={{ fontSize: 22 }} />}
              iconBg={stats.critical > 0 ? tokens.colors.danger[50] : tokens.colors.success[50]}
              iconColor={stats.critical > 0 ? tokens.colors.danger[600] : tokens.colors.success[600]}
              trend={stats.critical > 0 ? 'Prioritas Restock' : 'Nol Kritis'}
              trendType={stats.critical > 0 ? 'negative' : 'positive'}
            />

            <MetricCard
              title="Kondisi Peringatan"
              value={stats.warning}
              subvalue="Perlu pengadaan 1-2 hari ke depan"
              icon={<Inventory2OutlinedIcon sx={{ fontSize: 22 }} />}
              iconBg={tokens.colors.neutral[100]}
              iconColor={tokens.colors.neutral[600]}
            />
          </Box>

          <Card
            elevation={0}
            sx={{
              p: 2,
              mb: 2.5,
              borderRadius: '12px',
              bgcolor: '#ffffff',
              border: `1px solid ${tokens.colors.neutral[200]}`,
              boxShadow: tokens.shadows.card,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: tokens.colors.neutral[50],
                border: `1px solid ${tokens.colors.neutral[200]}`,
                borderRadius: '8px',
                px: 1.5,
                py: 0.65,
                width: { xs: '100%', sm: 360 },
                '&:focus-within': {
                  borderColor: tokens.colors.brand[500],
                  bgcolor: '#ffffff',
                  boxShadow: `0 0 0 2px ${tokens.colors.brand[100]}`,
                },
              }}
            >
              <SearchIcon sx={{ color: tokens.colors.neutral[400], fontSize: 20, mr: 1 }} />
              <InputBase
                placeholder="Cari produk menipis berdasarkan nama / kode..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                sx={{ flex: 1, fontSize: '0.84rem' }}
              />
              {searchFilter && (
                <IconButton size="small" onClick={() => setSearchFilter('')} sx={{ p: 0.25 }}>
                  <ClearIcon sx={{ fontSize: 16, color: tokens.colors.neutral[400] }} />
                </IconButton>
              )}
            </Box>

            <Button
              variant="contained"
              onClick={() => {
                setActiveTab(1);
                navigate('/stok?tab=masuk', { replace: true });
              }}
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: tokens.colors.brand[500],
                borderRadius: '8px',
                px: 2,
                py: 0.85,
                fontWeight: 700,
                fontSize: '0.825rem',
                textTransform: 'none',
                '&:hover': { bgcolor: tokens.colors.brand[600] },
              }}
            >
              Buka Form Stok Masuk
            </Button>
          </Card>

          <Card
            elevation={0}
            sx={{
              borderRadius: '12px',
              bgcolor: '#ffffff',
              border: `1px solid ${tokens.colors.neutral[200]}`,
              boxShadow: tokens.shadows.card,
              overflow: 'hidden',
            }}
          >
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Produk & SKU</TableCell>
                    <TableCell>Kategori</TableCell>
                    <TableCell align="center">Stok Saat Ini</TableCell>
                    <TableCell align="center">Batas Minimum</TableCell>
                    <TableCell align="center">Status Urgensi</TableCell>
                    <TableCell align="right">Aksi Tindakan</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLowStock.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0 }}>
                        <EmptyState
                          icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 32, color: tokens.colors.success[600] }} />}
                          title="Semua Persediaan Aman"
                          message="Tidak ada produk dengan kuantitas di bawah ambang batas minimum."
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLowStock.map((item) => {
                      const stock = item.stock || 0;
                      const min = item.minimumStock || 10;
                      const isCritical = stock <= Math.min(5, min);

                      return (
                        <TableRow key={item.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box
                                sx={{
                                  width: 38,
                                  height: 38,
                                  borderRadius: '8px',
                                  bgcolor: tokens.colors.neutral[50],
                                  border: `1px solid ${tokens.colors.neutral[200]}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <ProductVisual code={item.code} name={item.name} size={22} />
                              </Box>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.colors.neutral[900], fontSize: '0.84rem' }}>
                                  {item.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], fontWeight: 600 }}>
                                  {item.code}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell sx={{ color: tokens.colors.neutral[600], fontSize: '0.8rem', fontWeight: 500 }}>
                            {item.categoryName}
                          </TableCell>

                          <TableCell align="center">
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 800,
                                color: isCritical ? tokens.colors.danger[600] : tokens.colors.warning[700],
                                fontFeatureSettings: '"tnum"',
                              }}
                            >
                              {stock} {item.unit || 'unit'}
                            </Typography>
                          </TableCell>

                          <TableCell align="center" sx={{ color: tokens.colors.neutral[600], fontFeatureSettings: '"tnum"' }}>
                            {min} {item.unit || 'unit'}
                          </TableCell>

                          <TableCell align="center">
                            <StatusBadge
                              status={isCritical ? 'danger' : 'warning'}
                              label={isCritical ? 'Sangat Kritis' : 'Menipis'}
                            />
                          </TableCell>

                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => setRestockDialog({ open: true, product: item, quantity: '20' })}
                                sx={{
                                  bgcolor: tokens.colors.brand[500],
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  textTransform: 'none',
                                  borderRadius: '6px',
                                  px: 1.5,
                                  py: 0.4,
                                  '&:hover': { bgcolor: tokens.colors.brand[600] },
                                }}
                              >
                                Restok Cepat
                              </Button>

                              <Tooltip title="Buka produk ini di Form Stok Masuk untuk isi faktur dan supplier">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleTransferToStockIn(item)}
                                  sx={{
                                    borderColor: tokens.colors.neutral[300],
                                    color: tokens.colors.neutral[700],
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    borderRadius: '6px',
                                    px: 1.25,
                                    py: 0.4,
                                    '&:hover': {
                                      borderColor: tokens.colors.brand[500],
                                      bgcolor: tokens.colors.brand[50],
                                    },
                                  }}
                                >
                                  Detail Masuk
                                </Button>
                              </Tooltip>

                              <Tooltip title="Lakukan audit fisik (Stock Opname)">
                                <IconButton
                                  size="small"
                                  onClick={() => handleTransferToAdjustment(item)}
                                  sx={{
                                    border: `1px solid ${tokens.colors.neutral[200]}`,
                                    borderRadius: '6px',
                                    p: 0.5,
                                    color: tokens.colors.neutral[600],
                                    '&:hover': {
                                      bgcolor: tokens.colors.neutral[100],
                                      color: tokens.colors.brand[600],
                                    },
                                  }}
                                >
                                  <TuneOutlinedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
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
      )}

      {activeTab === 1 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <Card
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '12px',
              bgcolor: '#ffffff',
              border: `1px solid ${tokens.colors.neutral[200]}`,
              boxShadow: tokens.shadows.card,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, color: tokens.colors.neutral[900], mb: 0.5 }}>
              Penerimaan Barang Gudang
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.colors.neutral[500], mb: 3 }}>
              Masukkan detail barang yang diterima dari pemasok atau distributor untuk menambah stok sistem.
            </Typography>

            <form onSubmit={handleStockInSubmit}>
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: tokens.colors.neutral[700], mb: 0.75, display: 'block' }}>
                  Pilih Produk <span style={{ color: tokens.colors.danger[500] }}>*</span>
                </Typography>
                <Autocomplete
                  options={products}
                  getOptionLabel={(p) => `${p.kode || p.code || ''} - ${p.nama || p.name || ''}`}
                  value={stockInProduct}
                  onChange={(e, val) => setStockInProduct(val)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Ketik nama produk atau barcode SKU..."
                      size="small"
                      required
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', py: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <ProductVisual code={option.kode || option.code} name={option.nama || option.name} size={20} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {option.nama || option.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: tokens.colors.neutral[500] }}>
                              {option.kode || option.code} • {option.kategori || option.categoryName || 'Produk'}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={`Stok: ${option.stok ?? option.stock ?? 0}`}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            bgcolor: (option.stok ?? option.stock ?? 0) <= 10 ? tokens.colors.warning[50] : tokens.colors.neutral[100],
                            color: (option.stok ?? option.stock ?? 0) <= 10 ? tokens.colors.warning[700] : tokens.colors.neutral[700],
                          }}
                        />
                      </Box>
                    </li>
                  )}
                />
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: tokens.colors.neutral[700], mb: 0.75, display: 'block' }}>
                  Jumlah Barang Masuk (Unit) <span style={{ color: tokens.colors.danger[500] }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  placeholder="Contoh: 50"
                  value={stockInQty}
                  onChange={(e) => setStockInQty(e.target.value)}
                  inputProps={{ min: 1 }}
                  required
                  sx={{ mb: 1.5 }}
                />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {QUICK_QTY_BUTTONS.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        const current = parseInt(stockInQty, 10) || 0;
                        setStockInQty(String(current + amount));
                      }}
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        py: 0.3,
                        px: 1.25,
                        borderRadius: '6px',
                        borderColor: tokens.colors.neutral[300],
                        color: tokens.colors.neutral[700],
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: tokens.colors.brand[500],
                          bgcolor: tokens.colors.brand[50],
                          color: tokens.colors.brand[600],
                        },
                      }}
                    >
                      +{amount}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    size="small"
                    variant="text"
                    onClick={() => setStockInQty('')}
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: tokens.colors.neutral[400],
                      textTransform: 'none',
                    }}
                  >
                    Reset
                  </Button>
                </Box>
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: tokens.colors.neutral[700], mb: 0.75, display: 'block' }}>
                  Nama Supplier / Pemasok (Opsional)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Contoh: PT Sinar Niaga Perkasa, Toko Grosir Jaya..."
                  value={stockInSupplier}
                  onChange={(e) => setStockInSupplier(e.target.value)}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: tokens.colors.neutral[700], mb: 0.75, display: 'block' }}>
                  Keterangan / No. Faktur / Surat Jalan (Opsional)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  placeholder="Contoh: Faktur No. INV-99023, restok mingguan"
                  value={stockInReason}
                  onChange={(e) => setStockInReason(e.target.value)}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={actionLoading || !stockInProduct || inQtyNum <= 0}
                startIcon={actionLoading ? <CircularProgress size={18} color="inherit" /> : <CheckCircleOutlineOutlinedIcon />}
                sx={{
                  bgcolor: tokens.colors.brand[500],
                  py: 1.25,
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: tokens.colors.brand[600],
                    boxShadow: tokens.shadows.card,
                  },
                }}
              >
                {actionLoading ? 'Menyimpan Penerimaan...' : 'Konfirmasi & Simpan Stok Masuk'}
              </Button>
            </form>
          </Card>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '12px',
                bgcolor: '#ffffff',
                border: `1px solid ${tokens.colors.neutral[200]}`,
                boxShadow: tokens.shadows.card,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: tokens.colors.neutral[800], mb: 2 }}>
                Simulasi Perubahan Stok
              </Typography>

              {stockInProduct ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5, pb: 2, borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '8px',
                        bgcolor: tokens.colors.brand[50],
                        border: `1px solid ${tokens.colors.brand[100]}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ProductVisual
                        code={stockInProduct.kode || stockInProduct.code}
                        name={stockInProduct.nama || stockInProduct.name}
                        size={26}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: tokens.colors.neutral[900] }}>
                        {stockInProduct.nama || stockInProduct.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: tokens.colors.neutral[500] }}>
                        {stockInProduct.kode || stockInProduct.code} • {stockInProduct.unit || 'unit'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 1.5,
                      alignItems: 'center',
                      textAlign: 'center',
                      bgcolor: tokens.colors.neutral[50],
                      p: 2,
                      borderRadius: '10px',
                      border: `1px solid ${tokens.colors.neutral[200]}`,
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], fontWeight: 600 }}>
                        Stok Saat Ini
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: tokens.colors.neutral[800], fontFeatureSettings: '"tnum"' }}>
                        {inCurrentStock}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: tokens.colors.brand[600], fontWeight: 700 }}>
                        + Masuk
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: tokens.colors.brand[600], fontFeatureSettings: '"tnum"' }}>
                        +{inQtyNum}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" sx={{ color: tokens.colors.success[700], fontWeight: 700 }}>
                        Hasil Akhir
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: tokens.colors.success[600], fontFeatureSettings: '"tnum"' }}>
                        {inProjectedStock}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], display: 'block', lineHeight: 1.5 }}>
                    Setelah konfirmasi, kuantitas etalase akan bertambah otomatis dan dapat langsung dijual melalui kasir POS.
                  </Typography>
                </Box>
              ) : (
                <EmptyState
                  icon={<Inventory2OutlinedIcon sx={{ fontSize: 32, color: tokens.colors.neutral[300] }} />}
                  title="Pilih Produk Terlebih Dahulu"
                  message="Pilih produk dari daftar di formulir sebelah kiri untuk melihat simulasi penambahan stok."
                />
              )}
            </Card>

            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '12px',
                bgcolor: tokens.colors.brand[50],
                border: `1px solid ${tokens.colors.brand[100]}`,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, color: tokens.colors.brand[700], display: 'block', mb: 0.5 }}>
                PETUNJUK OPERASIONAL GUDANG
              </Typography>
              <Typography variant="caption" sx={{ color: tokens.colors.neutral[600], lineHeight: 1.6, display: 'block' }}>
                Pastikan kuantitas fisik pada surat jalan (DO/Packing List) supplier telah dihitung secara fisik sebelum menekan tombol simpan agar data persediaan tetap akurat.
              </Typography>
            </Card>
          </Box>
        </Box>
      )}

      {activeTab === 2 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <Card
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '12px',
              bgcolor: '#ffffff',
              border: `1px solid ${tokens.colors.neutral[200]}`,
              boxShadow: tokens.shadows.card,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, color: tokens.colors.neutral[900], mb: 0.5 }}>
              Koreksi Fisik (Stock Opname)
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.colors.neutral[500], mb: 3 }}>
              Sesuaikan kuantitas sistem dengan hasil perhitungan fisik di toko atau gudang karena rusak, hilang, atau selisih kasir.
            </Typography>

            <form onSubmit={handleAdjustmentSubmit}>
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: tokens.colors.neutral[700], mb: 0.75, display: 'block' }}>
                  Pilih Produk yang Di-Opname <span style={{ color: tokens.colors.danger[500] }}>*</span>
                </Typography>
                <Autocomplete
                  options={products}
                  getOptionLabel={(p) => `${p.kode || p.code || ''} - ${p.nama || p.name || ''}`}
                  value={adjustmentProduct}
                  onChange={(e, val) => {
                    setAdjustmentProduct(val);
                    if (val) {
                      setAdjustmentActualStock(String(val.stok ?? val.stock ?? 0));
                    } else {
                      setAdjustmentActualStock('');
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Cari produk yang akan disesuaikan..."
                      size="small"
                      required
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', py: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <ProductVisual code={option.kode || option.code} name={option.nama || option.name} size={20} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {option.nama || option.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: tokens.colors.neutral[500] }}>
                              {option.kode || option.code} • {option.kategori || option.categoryName || 'Produk'}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={`Stok Sistem: ${option.stok ?? option.stock ?? 0}`}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            bgcolor: tokens.colors.neutral[100],
                            color: tokens.colors.neutral[700],
                          }}
                        />
                      </Box>
                    </li>
                  )}
                />
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: tokens.colors.neutral[700], mb: 0.75, display: 'block' }}>
                  Jumlah Fisik Aktual di Lapangan (Unit) <span style={{ color: tokens.colors.danger[500] }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  placeholder="Masukkan hasil hitung fisik..."
                  value={adjustmentActualStock}
                  onChange={(e) => setAdjustmentActualStock(e.target.value)}
                  inputProps={{ min: 0 }}
                  required
                  sx={{ mb: 1.5 }}
                />

                {adjustmentProduct && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      type="button"
                      size="small"
                      variant="outlined"
                      onClick={() => setAdjustmentActualStock(String(adjCurrentStock))}
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: '6px',
                        textTransform: 'none',
                        borderColor: tokens.colors.neutral[300],
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      Sama dengan Sistem ({adjCurrentStock})
                    </Button>
                    <Button
                      type="button"
                      size="small"
                      variant="outlined"
                      onClick={() => setAdjustmentActualStock(String(Math.max(0, (adjActualNum || 0) + 1)))}
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        textTransform: 'none',
                        borderColor: tokens.colors.neutral[300],
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      +1 Unit
                    </Button>
                    <Button
                      type="button"
                      size="small"
                      variant="outlined"
                      onClick={() => setAdjustmentActualStock(String(Math.max(0, (adjActualNum || 0) - 1)))}
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        textTransform: 'none',
                        borderColor: tokens.colors.neutral[300],
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      -1 Unit
                    </Button>
                  </Box>
                )}
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: tokens.colors.neutral[700], mb: 0.75, display: 'block' }}>
                  Kategori Alasan Penyesuaian <span style={{ color: tokens.colors.danger[500] }}>*</span>
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={adjustmentReasonCategory}
                    onChange={(e) => setAdjustmentReasonCategory(e.target.value)}
                  >
                    {REASON_PRESETS.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: tokens.colors.neutral[700], mb: 0.75, display: 'block' }}>
                  Catatan Rincian Penyesuaian (Opsional)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  placeholder="Contoh: Ditemukan kemasan penyok saat pembersihan rak C3"
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={actionLoading || !adjustmentProduct || adjActualNum === null || adjActualNum === adjCurrentStock}
                startIcon={actionLoading ? <CircularProgress size={18} color="inherit" /> : <TuneOutlinedIcon />}
                sx={{
                  bgcolor: tokens.colors.brand[500],
                  py: 1.25,
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: tokens.colors.brand[600],
                    boxShadow: tokens.shadows.card,
                  },
                }}
              >
                {actionLoading ? 'Menyimpan Penyesuaian...' : 'Simpan Penyesuaian Stok'}
              </Button>
            </form>
          </Card>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '12px',
                bgcolor: '#ffffff',
                border: `1px solid ${tokens.colors.neutral[200]}`,
                boxShadow: tokens.shadows.card,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: tokens.colors.neutral[800], mb: 2 }}>
                Analisis Selisih Stock Opname
              </Typography>

              {adjustmentProduct && adjActualNum !== null ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5, pb: 2, borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '8px',
                        bgcolor: tokens.colors.neutral[50],
                        border: `1px solid ${tokens.colors.neutral[200]}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ProductVisual
                        code={adjustmentProduct.kode || adjustmentProduct.code}
                        name={adjustmentProduct.nama || adjustmentProduct.name}
                        size={26}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: tokens.colors.neutral[900] }}>
                        {adjustmentProduct.nama || adjustmentProduct.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: tokens.colors.neutral[500] }}>
                        {adjustmentProduct.kode || adjustmentProduct.code} • Harga Beli: Rp {(adjustmentProduct.hargaBeli || 0).toLocaleString('id-ID')}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 1.5,
                      alignItems: 'center',
                      textAlign: 'center',
                      bgcolor: tokens.colors.neutral[50],
                      p: 2,
                      borderRadius: '10px',
                      border: `1px solid ${tokens.colors.neutral[200]}`,
                      mb: 2.5,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], fontWeight: 600 }}>
                        Stok Sistem
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: tokens.colors.neutral[800], fontFeatureSettings: '"tnum"' }}>
                        {adjCurrentStock}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], fontWeight: 600 }}>
                        Fisik Dihitung
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: tokens.colors.brand[600], fontFeatureSettings: '"tnum"' }}>
                        {adjActualNum}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: adjDiff > 0 ? tokens.colors.success[700] : adjDiff < 0 ? tokens.colors.danger[700] : tokens.colors.neutral[600],
                        }}
                      >
                        Selisih Fisik
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.25 }}>
                        {adjDiff > 0 && <TrendingUpIcon sx={{ fontSize: 16, color: tokens.colors.success[600] }} />}
                        {adjDiff < 0 && <TrendingDownIcon sx={{ fontSize: 16, color: tokens.danger ? tokens.colors.danger[600] : '#dc2626' }} />}
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 900,
                            fontFeatureSettings: '"tnum"',
                            color: adjDiff > 0 ? tokens.colors.success[600] : adjDiff < 0 ? tokens.colors.danger[600] : tokens.colors.neutral[600],
                          }}
                        >
                          {adjDiff > 0 ? `+${adjDiff}` : adjDiff}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '8px',
                      bgcolor: adjDiff === 0 ? tokens.colors.neutral[50] : adjDiff < 0 ? tokens.colors.danger[50] : tokens.colors.success[50],
                      border: `1px solid ${adjDiff === 0 ? tokens.colors.neutral[200] : adjDiff < 0 ? tokens.colors.danger[200] : tokens.colors.success[200]}`,
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        display: 'block',
                        color: adjDiff === 0 ? tokens.colors.neutral[700] : adjDiff < 0 ? tokens.colors.danger[800] : tokens.colors.success[800],
                        mb: 0.5,
                      }}
                    >
                      {adjDiff === 0
                        ? 'STOK COCOK'
                        : adjDiff < 0
                        ? `DEFISIT FISIK (${Math.abs(adjDiff)} UNIT HILANG/RUSAK)`
                        : `SURPLUS FISIK (+${adjDiff} UNIT LEBIH BANYAK)`}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.colors.neutral[800] }}>
                      Estimasi Nilai HPP:{' '}
                      <span style={{ fontFeatureSettings: '"tnum"' }}>
                        Rp {estimatedFinancialImpact.toLocaleString('id-ID')}
                      </span>
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <EmptyState
                  icon={<TuneOutlinedIcon sx={{ fontSize: 32, color: tokens.colors.neutral[300] }} />}
                  title="Pilih Produk & Hitungan Fisik"
                  message="Pilih produk dan masukkan angka perhitungan fisik untuk melihat analisis selisih kuantitas dan nilai HPP."
                />
              )}
            </Card>

            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '12px',
                bgcolor: tokens.colors.neutral[50],
                border: `1px solid ${tokens.colors.neutral[200]}`,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, color: tokens.colors.neutral[700], display: 'block', mb: 0.5 }}>
                INTEGRITAS AUDIT SISTEM
              </Typography>
              <Typography variant="caption" sx={{ color: tokens.colors.neutral[600], lineHeight: 1.6, display: 'block' }}>
                Setiap perubahan opname akan dicatat permanen dalam riwayat transaksi kartu stok (stock transactions) lengkap dengan tanggal, jam, dan akun pengguna yang mengeksekusi.
              </Typography>
            </Card>
          </Box>
        </Box>
      )}

      <Dialog
        open={restockDialog.open}
        onClose={() => setRestockDialog({ open: false, product: null, quantity: '20' })}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            p: 1,
            boxShadow: tokens.shadows.modal,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1rem', pb: 0.5 }}>
          Restok Cepat Produk
        </DialogTitle>
        <form onSubmit={handleQuickRestockSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            {restockDialog.product && (
              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <ProductVisual
                    code={restockDialog.product.code}
                    name={restockDialog.product.name}
                    size={28}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: tokens.colors.neutral[900] }}>
                      {restockDialog.product.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: tokens.colors.neutral[500] }}>
                      SKU: {restockDialog.product.code} • Stok Saat Ini: {restockDialog.product.stock} {restockDialog.product.unit || 'unit'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            <Typography variant="caption" sx={{ fontWeight: 700, color: tokens.colors.neutral[700], mb: 0.75, display: 'block' }}>
              Jumlah Tambahan Stok Masuk
            </Typography>
            <TextField
              autoFocus
              fullWidth
              size="small"
              type="number"
              value={restockDialog.quantity}
              onChange={(e) => setRestockDialog({ ...restockDialog, quantity: e.target.value })}
              inputProps={{ min: 1 }}
              required
              sx={{ mb: 1.5 }}
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
              {[10, 20, 50, 100].map((val) => (
                <Button
                  key={val}
                  type="button"
                  size="small"
                  variant="outlined"
                  onClick={() => setRestockDialog({ ...restockDialog, quantity: String(val) })}
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    borderColor: tokens.colors.neutral[300],
                    color: tokens.colors.neutral[700],
                    textTransform: 'none',
                    py: 0.25,
                    px: 1,
                  }}
                >
                  +{val}
                </Button>
              ))}
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setRestockDialog({ open: false, product: null, quantity: '20' })}
              disabled={actionLoading}
              sx={{
                color: tokens.colors.neutral[600],
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={actionLoading || !restockDialog.quantity || parseInt(restockDialog.quantity, 10) <= 0}
              startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{
                bgcolor: tokens.colors.brand[500],
                fontWeight: 700,
                borderRadius: '8px',
                textTransform: 'none',
                px: 2.5,
                '&:hover': { bgcolor: tokens.colors.brand[600] },
              }}
            >
              {actionLoading ? 'Menyimpan...' : 'Tambahkan Stok'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

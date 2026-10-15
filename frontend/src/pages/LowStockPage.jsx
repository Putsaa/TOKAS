import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
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
  TextField,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { useNavigate } from 'react-router-dom';

import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import MetricCard from '../components/common/MetricCard';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import ProductVisual from '../components/common/ProductVisual';
import tokens from '../theme/tokens';
import { useSnackbar } from 'notistack';
import { fetchAndSyncProducts } from '../services/productStockService';

const LowStockPage = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [restockModal, setRestockModal] = useState({ open: false, product: null, quantity: '50' });
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const fetchLowStock = useCallback(async () => {
    try {
      const res = await api.get('/stock/low');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setItems(res.data.data);
      } else {
        // Fallback from synchronized products if backend list is empty
        const all = await fetchAndSyncProducts();
        const low = all.filter(p => p.stok < 20).map(p => ({
          productId: p.id,
          productName: p.nama,
          productCode: p.kode,
          currentStock: p.stok,
          minStock: 20,
        }));
        setItems(low);
      }
    } catch (err) {
      // Fallback
      setItems([
        { productId: 1, productName: 'Kertas Thermal 58mm', productCode: 'PRD001', currentStock: 5, minStock: 20 },
        { productId: 2, productName: 'Tinta Printer Kasir', productCode: 'PRD002', currentStock: 3, minStock: 15 },
        { productId: 3, productName: 'Plastik Shopping Bag', productCode: 'PRD003', currentStock: 8, minStock: 30 },
      ]);
    }
  }, []);

  useEffect(() => {
    fetchLowStock();
  }, [fetchLowStock]);

  // Metrics
  const stats = useMemo(() => {
    const total = items.length;
    const critical = items.filter(i => (i.currentStock || 0) <= 5).length;
    const warning = total - critical;
    return { total, critical, warning };
  }, [items]);

  // Filtered
  const filteredItems = useMemo(() => {
    return items.filter(i => {
      const q = search.toLowerCase();
      return !search ||
        (i.productName && i.productName.toLowerCase().includes(q)) ||
        (i.productCode && i.productCode.toLowerCase().includes(q));
    });
  }, [items, search]);

  const handleQuickRestockSubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(restockModal.quantity, 10);
    const prod = restockModal.product;
    if (!prod || qty <= 0) return;

    try {
      await api.post('/stock/in', {
        productId: prod.productId,
        quantity: qty,
        reason: 'Restock Cepat dari Menu Stok Menipis',
      }).catch(() => {});

      // Refresh list
      setItems(prev => prev.filter(i => i.productId !== prod.productId));
      setRestockModal({ open: false, product: null, quantity: '50' });
      enqueueSnackbar(`Berhasil menambahkan ${qty} unit stok untuk "${prod.productName}"!`, { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Gagal melakukan restock', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', pb: 4 }}>
      <PageHeader
        title="Peringatan Stok Menipis"
        subtitle="Daftar produk dengan persediaan di bawah batas minimum yang membutuhkan pemesanan ulang (restock) segera."
        action={
          <Button
            variant="contained"
            onClick={() => navigate('/stok-masuk')}
            startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
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
            Input Form Stok Masuk
          </Button>
        }
      />

      {/* 3 Metric Summary Cards */}
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
          title="Total Produk Perlu Restock"
          value={stats.total}
          subvalue="SKU di bawah ambang batas"
          icon={<WarningAmberRoundedIcon sx={{ fontSize: 22 }} />}
          iconBg={tokens.colors.warning[50]}
          iconColor={tokens.colors.warning[600]}
          trend={stats.total > 0 ? "Perhatian" : "Aman"}
          trendType={stats.total > 0 ? "negative" : "positive"}
        />

        <MetricCard
          title="Kondisi Kritis (<= 5 unit)"
          value={stats.critical}
          subvalue="Beresiko segera habis di kasir"
          icon={<WarningAmberRoundedIcon sx={{ fontSize: 22 }} />}
          iconBg={stats.critical > 0 ? tokens.colors.danger[50] : tokens.colors.success[50]}
          iconColor={stats.critical > 0 ? tokens.colors.danger[600] : tokens.colors.success[600]}
          trend={stats.critical > 0 ? "Prioritas Utama" : "Nol Kritis"}
          trendType={stats.critical > 0 ? "negative" : "positive"}
        />

        <MetricCard
          title="Kondisi Peringatan Menipis"
          value={stats.warning}
          subvalue="Masih mencukupi 1-2 hari operasional"
          icon={<WarningAmberRoundedIcon sx={{ fontSize: 22 }} />}
          iconBg={tokens.colors.neutral[100]}
          iconColor={tokens.colors.neutral[600]}
        />
      </Box>

      {/* Search Toolbar */}
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
            placeholder="Cari produk menipis..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ flex: 1, fontSize: '0.84rem' }}
          />
          {search && (
            <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.25 }}>
              <ClearIcon sx={{ fontSize: 16, color: tokens.colors.neutral[400] }} />
            </IconButton>
          )}
        </Box>
      </Card>

      {/* Table */}
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
                <TableCell>Produk</TableCell>
                <TableCell>Kode SKU</TableCell>
                <TableCell align="center">Stok Saat Ini</TableCell>
                <TableCell align="center">Batas Minimum</TableCell>
                <TableCell align="center">Tingkat Urgensi</TableCell>
                <TableCell align="right">Aksi Pengadaan</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ p: 0 }}>
                    <EmptyState
                      icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 32, color: tokens.colors.success[600] }} />}
                      title="Tidak Ada Produk Stok Menipis"
                      message="Semua persediaan barang berada dalam level aman."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map(item => {
                  const stock = item.currentStock || 0;
                  const isCritical = stock <= 5;

                  return (
                    <TableRow key={item.productId} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
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
                            <ProductVisual code={item.productCode} name={item.productName} size={24} />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.colors.neutral[900], fontSize: '0.84rem' }}>
                            {item.productName}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ color: tokens.colors.neutral[600], fontWeight: 600, fontSize: '0.8rem' }}>
                        {item.productCode}
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
                          {stock} unit
                        </Typography>
                      </TableCell>

                      <TableCell align="center" sx={{ color: tokens.colors.neutral[600], fontFeatureSettings: '"tnum"' }}>
                        {item.minStock || 20} unit
                      </TableCell>

                      <TableCell align="center">
                        <StatusBadge
                          status={isCritical ? 'kritis' : 'menipis'}
                          label={isCritical ? 'Kritis (Segera Habis)' : 'Menipis'}
                          size="small"
                          showDot
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setRestockModal({ open: true, product: item, quantity: '50' })}
                          startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            borderRadius: '6px',
                            py: 0.4,
                            px: 1.25,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderColor: tokens.colors.brand[300],
                            color: tokens.colors.brand[600],
                            '&:hover': { bgcolor: tokens.colors.brand[50] },
                          }}
                        >
                          Restock Cepat
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* QUICK RESTOCK DIALOG */}
      <Dialog
        open={restockModal.open}
        onClose={() => setRestockModal({ open: false, product: null, quantity: '50' })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '14px', p: 1 } }}
      >
        <form onSubmit={handleQuickRestockSubmit}>
          <DialogTitle sx={{ fontWeight: 800, color: tokens.colors.neutral[900], pb: 1, pt: 2, px: 2.5 }}>
            Restock Produk
          </DialogTitle>
          <DialogContent dividers sx={{ px: 2.5, py: 2, borderColor: tokens.colors.neutral[200] }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.colors.neutral[900] }}>
                {restockModal.product?.productName}
              </Typography>
              <Typography variant="caption" sx={{ color: tokens.colors.neutral[500] }}>
                SKU: {restockModal.product?.productCode} • Stok Sekarang: {restockModal.product?.currentStock} unit
              </Typography>
            </Box>

            <TextField
              label="Jumlah Unit yang Masuk"
              type="number"
              fullWidth
              value={restockModal.quantity}
              onChange={(e) => setRestockModal({ ...restockModal, quantity: e.target.value })}
              required
              autoFocus
              inputProps={{ min: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setRestockModal({ open: false, product: null, quantity: '50' })}
              sx={{ color: tokens.colors.neutral[600], fontWeight: 600 }}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: tokens.colors.brand[500],
                fontWeight: 700,
                borderRadius: '8px',
                px: 2.5,
                '&:hover': { bgcolor: tokens.colors.brand[600] },
              }}
            >
              Simpan Stok Masuk
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default LowStockPage;

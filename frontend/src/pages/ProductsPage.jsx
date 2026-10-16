import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Button, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Select, MenuItem, FormControl, InputLabel,
  InputBase, Tooltip, Stack,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ClearIcon from '@mui/icons-material/Clear';

import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import ProductVisual from '../components/common/ProductVisual';
import PageHeader from '../components/common/PageHeader';
import MetricCard from '../components/common/MetricCard';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import tokens from '../theme/tokens';
import { useSnackbar } from 'notistack';
import { getStoredProducts, fetchAndSyncProducts } from '../services/productStockService';

const ProductsPage = () => {
  const [products, setProducts] = useState(getStoredProducts);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, product: null });
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    id: '', kode: '', nama: '', kategori: '', hargaBeli: 0, hargaJual: 0, stok: 0, status: 'Aktif'
  });

  const fetchProducts = useCallback(async () => {
    const items = await fetchAndSyncProducts();
    setProducts(items || []);
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setCategoryOptions(res.data.data);
      }
    } catch (e) {
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    const handleStockUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setProducts(e.detail);
      }
    };

    window.addEventListener('tokas_stock_updated', handleStockUpdate);
    return () => window.removeEventListener('tokas_stock_updated', handleStockUpdate);
  }, [fetchProducts, fetchCategories]);

  // Metric stats
  const stats = useMemo(() => {
    const totalProduk = products.length;
    const totalStok = products.reduce((acc, p) => acc + (parseInt(p.stok, 10) || 0), 0);
    const stokMenipis = products.filter(p => p.stok > 0 && p.stok < 20).length;
    const nilaiInventaris = products.reduce((acc, p) => acc + ((parseInt(p.stok, 10) || 0) * (p.hargaBeli || 0)), 0);
    return { totalProduk, totalStok, stokMenipis, nilaiInventaris };
  }, [products]);

  // Categories list
  const categoriesList = useMemo(() => {
    const fromCategories = categoryOptions.map(c => c.name);
    const fromProducts = products.map(p => p.kategori).filter(Boolean);
    const set = new Set([...fromCategories, ...fromProducts]);
    return ['Semua', ...Array.from(set)];
  }, [categoryOptions, products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedKategori === 'Semua' || p.kategori === selectedKategori;
      const matchStatus = selectedStatus === 'Semua' || p.status === selectedStatus;
      const q = search.toLowerCase();
      const matchSearch = !search ||
        (p.nama && p.nama.toLowerCase().includes(q)) ||
        (p.kode && p.kode.toLowerCase().includes(q));
      return matchCat && matchStatus && matchSearch;
    });
  }, [products, selectedKategori, selectedStatus, search]);

  const handleOpen = (product = null) => {
    if (product) {
      setFormData(product);
    } else {
      const nextCode = `PRD${String(products.length + 1).padStart(3, '0')}`;
      setFormData({
        id: '',
        kode: nextCode,
        nama: '',
        kategori: categoriesList[1] || 'Makanan & Minuman',
        hargaBeli: 0,
        hargaJual: 0,
        stok: 0,
        status: 'Aktif',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      enqueueSnackbar('Nama produk wajib diisi', { variant: 'warning' });
      return;
    }

    try {
      const category = categoryOptions.find(c => c.name === formData.kategori || c.id === formData.categoryId) || categoryOptions[0];
      const categoryId = category ? category.id : 1;

      if (formData.id) {
        await api.put(`/products/${formData.id}`, {
          categoryId,
          code: formData.kode || undefined,
          name: formData.nama.trim(),
          purchasePrice: Number(formData.hargaBeli) || 0,
          sellingPrice: Number(formData.hargaJual) || 0,
          minimumStock: Number(formData.minimumStock) || 10,
          unit: formData.unit || 'pcs',
        });
        enqueueSnackbar('Produk berhasil diperbarui di database!', { variant: 'success' });
      } else {
        await api.post('/products', {
          categoryId,
          code: formData.kode || undefined,
          name: formData.nama.trim(),
          purchasePrice: Number(formData.hargaBeli) || 0,
          sellingPrice: Number(formData.hargaJual) || 0,
          stock: Number(formData.stok) || 0,
          minimumStock: Number(formData.minimumStock) || 10,
          unit: formData.unit || 'pcs',
        });
        enqueueSnackbar('Produk baru berhasil disimpan ke database!', { variant: 'success' });
      }
      setOpen(false);
      await fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan produk ke database';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    const prod = deleteConfirm.product;
    if (!prod) return;
    try {
      await api.patch(`/products/${prod.id}/status`, { isActive: false });
      setDeleteConfirm({ open: false, product: null });
      enqueueSnackbar(`Status produk "${prod.nama}" berhasil diperbarui`, { variant: 'info' });
      await fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menonaktifkan produk di server';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', pb: 4 }}>
      {/* Page Header with Action */}
      <PageHeader
        title="Katalog Produk & Inventaris"
        subtitle="Kelola SKU, penetapan harga jual/beli, serta pantau level stok fisik."
        action={
          <Button
            variant="contained"
            onClick={() => handleOpen()}
            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
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
            Tambah Produk Baru
          </Button>
        }
      />

      {/* 4 Summary Metric Cards */}
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
          title="Total Produk"
          value={stats.totalProduk}
          subvalue="SKU terdaftar dalam sistem"
          icon={<Inventory2OutlinedIcon sx={{ fontSize: 22 }} />}
          iconBg={tokens.colors.brand[50]}
          iconColor={tokens.colors.brand[500]}
        />
        <MetricCard
          title="Total Unit Stok"
          value={stats.totalStok.toLocaleString('id-ID')}
          subvalue="Fisik barang di gudang & toko"
          icon={<Inventory2OutlinedIcon sx={{ fontSize: 22 }} />}
          iconBg={tokens.colors.neutral[100]}
          iconColor={tokens.colors.neutral[600]}
        />
        <MetricCard
          title="Estimasi Nilai Stok"
          value={formatCurrency(stats.nilaiInventaris)}
          subvalue="Berdasarkan harga modal beli"
          icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 22 }} />}
          iconBg={tokens.colors.success[50]}
          iconColor={tokens.colors.success[600]}
        />
        <MetricCard
          title="Stok Menipis (<20)"
          value={stats.stokMenipis}
          subvalue="Perlu pengadaan supplier"
          icon={<WarningAmberOutlinedIcon sx={{ fontSize: 22 }} />}
          iconBg={stats.stokMenipis > 0 ? tokens.colors.warning[50] : tokens.colors.success[50]}
          iconColor={stats.stokMenipis > 0 ? tokens.colors.warning[600] : tokens.colors.success[600]}
          trend={stats.stokMenipis > 0 ? "Perhatian" : "Aman"}
          trendType={stats.stokMenipis > 0 ? "negative" : "positive"}
        />
      </Box>

      {/* FILTER & SEARCH TOOLBAR */}
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
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {/* Search Bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: tokens.colors.neutral[50],
              border: `1px solid ${tokens.colors.neutral[200]}`,
              borderRadius: '8px',
              px: 1.5,
              py: 0.65,
              width: { xs: '100%', md: 360 },
              transition: tokens.transitions.fast,
              '&:focus-within': {
                borderColor: tokens.colors.brand[500],
                bgcolor: '#ffffff',
                boxShadow: `0 0 0 2px ${tokens.colors.brand[100]}`,
              },
            }}
          >
            <SearchIcon sx={{ color: tokens.colors.neutral[400], fontSize: 20, mr: 1 }} />
            <InputBase
              placeholder="Cari kode SKU atau nama barang..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ flex: 1, fontSize: '0.84rem', color: tokens.colors.neutral[800] }}
            />
            {search && (
              <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.25 }}>
                <ClearIcon sx={{ fontSize: 16, color: tokens.colors.neutral[400] }} />
              </IconButton>
            )}
          </Box>

          {/* Filters Select */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ fontSize: '0.825rem' }}>Kategori</InputLabel>
              <Select
                value={selectedKategori}
                label="Kategori"
                onChange={e => setSelectedKategori(e.target.value)}
                sx={{ fontSize: '0.825rem' }}
              >
                {categoriesList.map(cat => (
                  <MenuItem key={cat} value={cat} sx={{ fontSize: '0.825rem' }}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel sx={{ fontSize: '0.825rem' }}>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={e => setSelectedStatus(e.target.value)}
                sx={{ fontSize: '0.825rem' }}
              >
                <MenuItem value="Semua" sx={{ fontSize: '0.825rem' }}>Semua Status</MenuItem>
                <MenuItem value="Aktif" sx={{ fontSize: '0.825rem' }}>Aktif</MenuItem>
                <MenuItem value="Tidak Aktif" sx={{ fontSize: '0.825rem' }}>Tidak Aktif</MenuItem>
              </Select>
            </FormControl>

            {(search || selectedKategori !== 'Semua' || selectedStatus !== 'Semua') && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setSearch('');
                  setSelectedKategori('Semua');
                  setSelectedStatus('Semua');
                }}
                sx={{
                  borderColor: tokens.colors.neutral[300],
                  color: tokens.colors.neutral[600],
                  fontSize: '0.78rem',
                }}
              >
                Reset Filter
              </Button>
            )}
          </Box>
        </Box>
      </Card>

      {/* PRODUCTS DATA TABLE */}
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
                <TableCell>Kategori</TableCell>
                <TableCell align="right">Harga Modal</TableCell>
                <TableCell align="right">Harga Jual</TableCell>
                <TableCell align="center">Margin</TableCell>
                <TableCell align="center">Stok</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ p: 0 }}>
                    <EmptyState
                      title="Produk Tidak Ditemukan"
                      message="Coba ubah kata kunci pencarian atau bersihkan filter kategori."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map(p => {
                  const stockNum = parseInt(p.stok, 10) || 0;
                  const isOutOfStock = stockNum <= 0;
                  const isLowStock = stockNum > 0 && stockNum < 20;

                  // Margin calculation
                  const marginAmt = p.hargaJual - p.hargaBeli;
                  const marginPct = p.hargaBeli > 0 ? Math.round((marginAmt / p.hargaBeli) * 100) : 0;

                  return (
                    <TableRow key={p.id} hover>
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
                            <ProductVisual code={p.kode} name={p.nama} size={24} />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.colors.neutral[900], fontSize: '0.84rem' }}>
                            {p.nama}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ color: tokens.colors.neutral[600], fontWeight: 600, fontSize: '0.8rem' }}>
                        {p.kode}
                      </TableCell>

                      <TableCell sx={{ color: tokens.colors.neutral[700], fontSize: '0.8rem' }}>
                        {p.kategori || '-'}
                      </TableCell>

                      <TableCell align="right" sx={{ color: tokens.colors.neutral[600], fontFeatureSettings: '"tnum"' }}>
                        {formatCurrency(p.hargaBeli)}
                      </TableCell>

                      <TableCell align="right" sx={{ fontWeight: 700, color: tokens.colors.neutral[900], fontFeatureSettings: '"tnum"' }}>
                        {formatCurrency(p.hargaJual)}
                      </TableCell>

                      <TableCell align="center">
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 0.75,
                            py: 0.15,
                            borderRadius: '4px',
                            bgcolor: marginPct >= 20 ? tokens.colors.success[50] : tokens.colors.neutral[100],
                            color: marginPct >= 20 ? tokens.colors.success[700] : tokens.colors.neutral[700],
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          +{marginPct}%
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <StatusBadge
                          status={isOutOfStock ? 'habis' : isLowStock ? 'menipis' : 'aman'}
                          label={`${stockNum} unit`}
                          size="small"
                          showDot={isLowStock || isOutOfStock}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <StatusBadge
                          status={p.status || 'Aktif'}
                          size="small"
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Ubah Produk">
                            <IconButton size="small" onClick={() => handleOpen(p)} sx={{ color: tokens.colors.neutral[500], '&:hover': { color: tokens.colors.brand[600] } }}>
                              <EditOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hapus Produk">
                            <IconButton size="small" onClick={() => setDeleteConfirm({ open: true, product: p })} sx={{ color: tokens.colors.neutral[500], '&:hover': { color: tokens.colors.danger[600] } }}>
                              <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* MODAL DIALOG: TAMBAH / UBAH PRODUK */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '14px',
            border: `1px solid ${tokens.colors.neutral[200]}`,
          },
        }}
      >
        <form onSubmit={handleSave}>
          <DialogTitle sx={{ fontWeight: 800, color: tokens.colors.neutral[900], pb: 1, pt: 2.5, px: 3 }}>
            {formData.id ? 'Ubah Informasi Produk' : 'Tambah Produk Baru'}
          </DialogTitle>
          <DialogContent dividers sx={{ px: 3, py: 2.5, borderColor: tokens.colors.neutral[200] }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Kode SKU / Barcode"
                value={formData.kode}
                onChange={e => setFormData({ ...formData, kode: e.target.value })}
                required
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={formData.kategori}
                  label="Kategori"
                  onChange={e => setFormData({ ...formData, kategori: e.target.value })}
                  required
                >
                  {categoriesList.filter(c => c !== 'Semua').map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ gridColumn: 'span 2' }}>
                <TextField
                  label="Nama Produk"
                  value={formData.nama}
                  onChange={e => setFormData({ ...formData, nama: e.target.value })}
                  required
                  fullWidth
                  placeholder="Contoh: Kertas Thermal 58mm..."
                />
              </Box>

              <TextField
                label="Harga Modal (Beli)"
                type="number"
                value={formData.hargaBeli}
                onChange={e => setFormData({ ...formData, hargaBeli: parseFloat(e.target.value) || 0 })}
                required
                fullWidth
              />

              <TextField
                label="Harga Jual"
                type="number"
                value={formData.hargaJual}
                onChange={e => setFormData({ ...formData, hargaJual: parseFloat(e.target.value) || 0 })}
                required
                fullWidth
              />

              <TextField
                label="Stok Awal Fisik"
                type="number"
                value={formData.stok}
                onChange={e => setFormData({ ...formData, stok: parseInt(e.target.value, 10) || 0 })}
                required
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Status Produk</InputLabel>
                <Select
                  value={formData.status}
                  label="Status Produk"
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="Aktif">Aktif</MenuItem>
                  <MenuItem value="Tidak Aktif">Tidak Aktif</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleClose} sx={{ color: tokens.colors.neutral[600], fontWeight: 600 }}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: tokens.colors.brand[500],
                fontWeight: 700,
                borderRadius: '8px',
                px: 3,
                '&:hover': { bgcolor: tokens.colors.brand[600] },
              }}
            >
              Simpan Produk
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title="Hapus Produk?"
        content={`Apakah Anda yakin ingin menghapus produk "${deleteConfirm.product?.nama}"? Produk yang dihapus tidak dapat dipulihkan.`}
        confirmText="Ya, Hapus"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, product: null })}
      />
    </Box>
  );
};

export default ProductsPage;
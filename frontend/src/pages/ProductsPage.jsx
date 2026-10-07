import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Button, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Select, MenuItem, FormControl, InputLabel,
  InputBase, Tooltip, Stack
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import ProductVisual from '../components/common/ProductVisual';
import { getStoredProducts, fetchAndSyncProducts } from '../services/productStockService';

const ProductsPage = () => {
  const [products, setProducts] = useState(getStoredProducts);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [formData, setFormData] = useState({
    id: '', kode: '', nama: '', kategori: '', hargaBeli: 0, hargaJual: 0, stok: 0, status: 'Aktif'
  });

  const fetchProducts = async () => {
    const items = await fetchAndSyncProducts();
    if (items && items.length > 0) {
      setProducts(items);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data?.data) {
        setCategoryOptions(res.data.data);
      }
    } catch (e) {
      console.warn('Failed to load categories for products page', e);
    }
  };

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
  }, []);

  // Stats
  const stats = useMemo(() => {
    const totalProduk = products.length;
    const totalStok = products.reduce((acc, p) => acc + (parseInt(p.stok) || 0), 0);
    const stokMenipis = products.filter(p => p.stok > 0 && p.stok < 30).length;
    const nilaiInventaris = products.reduce((acc, p) => acc + ((parseInt(p.stok) || 0) * (p.hargaBeli || 0)), 0);
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
        (p.nama && p.nama.toLowerCase().includes(q));
      return matchCat && matchStatus && matchSearch;
    });
  }, [products, selectedKategori, selectedStatus, search]);

  const handleOpen = (product = null) => {
    if (product) {
      setFormData(product);
    } else {
      const nextCode = `PRD${String(products.length + 1).padStart(3, '0')}`;
      setFormData({ id: '', kode: nextCode, nama: '', kategori: 'Alat Tulis', hargaBeli: 0, hargaJual: 0, stok: 0, status: 'Aktif' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    handleClose();

    const catName = formData.kategori || (categoryOptions[0]?.name || 'Alat Tulis');
    const matchedCategory = categoryOptions.find(
      c => c.name.toLowerCase() === catName.toLowerCase()
    );
    const catId = matchedCategory ? matchedCategory.id : (
      catName === 'Perlengkapan Kantor' ? 6 :
      catName === 'Elektronik' ? 7 :
      catName === 'Kebersihan' ? 9 :
      catName === 'Makanan & Minuman' ? 10 : 8
    );

    const backendPayload = {
      categoryId: catId,
      code: formData.kode || `PRD${String(Date.now()).slice(-4)}`,
      name: formData.nama,
      purchasePrice: parseFloat(formData.hargaBeli) || 0,
      sellingPrice: parseFloat(formData.hargaJual) || 0,
      stock: parseInt(formData.stok) || 0,
      minimumStock: 10,
      unit: 'pcs',
    };

    try {
      if (formData.id && typeof formData.id === 'number' && formData.id < 1000000) {
        await api.put(`/products/${formData.id}`, backendPayload);
      } else {
        await api.post('/products', backendPayload);
      }
    } catch (error) {
      console.warn("Backend save error:", error);
    }

    const fresh = await fetchAndSyncProducts();
    if (fresh) setProducts(fresh);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menonaktifkan produk ini?')) {
      try {
        await api.patch(`/products/${id}/status`, { isActive: false });
      } catch (error) {
        console.warn("Backend status update error:", error);
      }
      const fresh = await fetchAndSyncProducts();
      if (fresh) setProducts(fresh);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', pb: 5 }}>
      {/* HEADER SECTION */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: '#0f172a',
              fontSize: { xs: '1.4rem', sm: '1.65rem' },
              letterSpacing: '-0.02em',
              mb: 0.5,
            }}
          >
            Katalog & Data Produk
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
            Kelola inventaris barang, kontrol stok, dan pantau harga jual
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => handleOpen()}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: '12px',
            bgcolor: '#2563eb',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.875rem',
            px: 2.5,
            py: 1.1,
            '&:hover': {
              bgcolor: '#1d4ed8',
              boxShadow: '0 6px 18px rgba(37, 99, 235, 0.35)',
            },
          }}
        >
          Tambah Produk
        </Button>
      </Box>

      {/* 4 KPI SUMMARY CARDS */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2.25,
          mb: 3,
        }}
      >
        {/* Total SKU */}
        <Card
          elevation={0}
          sx={{
            p: 2.25,
            borderRadius: '16px',
            border: '1px solid #eef2f6',
            bgcolor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              bgcolor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Inventory2OutlinedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>
              Total Jenis Produk
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.25rem', lineHeight: 1.2 }}>
              {stats.totalProduk} <Typography component="span" sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>SKU</Typography>
            </Typography>
          </Box>
        </Card>

        {/* Total Stok Fisik */}
        <Card
          elevation={0}
          sx={{
            p: 2.25,
            borderRadius: '16px',
            border: '1px solid #eef2f6',
            bgcolor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              bgcolor: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>
              Total Stok Fisik
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.25rem', lineHeight: 1.2 }}>
              {stats.totalStok.toLocaleString()} <Typography component="span" sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Unit</Typography>
            </Typography>
          </Box>
        </Card>

        {/* Stok Perlu Restock */}
        <Card
          elevation={0}
          sx={{
            p: 2.25,
            borderRadius: '16px',
            border: '1px solid #eef2f6',
            bgcolor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              bgcolor: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WarningAmberOutlinedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>
              Stok Terbatas (&lt;30)
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#d97706', fontSize: '1.25rem', lineHeight: 1.2 }}>
              {stats.stokMenipis} <Typography component="span" sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Item</Typography>
            </Typography>
          </Box>
        </Card>

        {/* Nilai Inventaris */}
        <Card
          elevation={0}
          sx={{
            p: 2.25,
            borderRadius: '16px',
            border: '1px solid #eef2f6',
            bgcolor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              bgcolor: '#faf5ff',
              color: '#9333ea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>
              Estimasi Modal Stok
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem', lineHeight: 1.2 }}>
              {formatCurrency(stats.nilaiInventaris)}
            </Typography>
          </Box>
        </Card>
      </Box>

      {/* FILTER & SEARCH TOOLBAR */}
      <Card
        elevation={0}
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: '16px',
          border: '1px solid #eef2f6',
          bgcolor: '#ffffff',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
        }}
      >
        {/* Search Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            px: 2,
            py: 0.85,
            width: { xs: '100%', md: 380 },
            '&:focus-within': { borderColor: '#2563eb', bgcolor: '#ffffff' },
          }}
        >
          <SearchIcon sx={{ color: '#94a3b8', fontSize: 20, mr: 1.25 }} />
          <InputBase
            placeholder="Cari nama produk..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{
              flex: 1,
              fontSize: '0.85rem',
              color: '#1e293b',
              '& input::placeholder': { color: '#94a3b8', opacity: 1 },
            }}
          />
          {search && (
            <CloseIcon
              onClick={() => setSearch('')}
              sx={{ color: '#94a3b8', fontSize: 18, cursor: 'pointer', '&:hover': { color: '#0f172a' } }}
            />
          )}
        </Box>

        {/* Filter Dropdowns */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon sx={{ color: '#64748b', fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8125rem', fontWeight: 600 }}>
              Kategori:
            </Typography>
          </Box>
          <Select
            size="small"
            value={selectedKategori}
            onChange={e => setSelectedKategori(e.target.value)}
            sx={{
              borderRadius: '10px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              minWidth: 150,
              bgcolor: '#f8fafc',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
            }}
          >
            {categoriesList.map(cat => (
              <MenuItem key={cat} value={cat} sx={{ fontSize: '0.8125rem' }}>
                {cat}
              </MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            sx={{
              borderRadius: '10px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              minWidth: 120,
              bgcolor: '#f8fafc',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
            }}
          >
            <MenuItem value="Semua" sx={{ fontSize: '0.8125rem' }}>Semua Status</MenuItem>
            <MenuItem value="Aktif" sx={{ fontSize: '0.8125rem' }}>Aktif</MenuItem>
            <MenuItem value="Nonaktif" sx={{ fontSize: '0.8125rem' }}>Nonaktif</MenuItem>
          </Select>
        </Box>
      </Card>

      {/* PRODUCTS TABLE */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: '1px solid #eef2f6',
          bgcolor: '#ffffff',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 1.75, px: 2.5, fontSize: '0.8rem' }}>
                  Produk
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 1.75, px: 2, fontSize: '0.8rem' }}>
                  Kategori
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', py: 1.75, px: 2, fontSize: '0.8rem' }}>
                  Harga Modal (Beli)
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', py: 1.75, px: 2, fontSize: '0.8rem' }}>
                  Harga Jual
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', py: 1.75, px: 2, fontSize: '0.8rem' }}>
                  Sisa Stok
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', py: 1.75, px: 2, fontSize: '0.8rem' }}>
                  Status
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', py: 1.75, px: 2.5, fontSize: '0.8rem' }}>
                  Aksi
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    transition: 'background-color 0.15s',
                    '&:hover': { bgcolor: '#f8fafc' },
                    '&:last-child td': { border: 0 },
                  }}
                >
                  {/* Product Visual + Name + Code */}
                  <TableCell sx={{ py: 1.75, px: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '10px',
                          bgcolor: '#f8fafc',
                          border: '1px solid #f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <ProductVisual code={row.kode} name={row.nama} size={34} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem', lineHeight: 1.3 }}>
                          {row.nama}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Kategori Badge */}
                  <TableCell sx={{ py: 1.75, px: 2 }}>
                    <Box
                      sx={{
                        display: 'inline-block',
                        bgcolor: '#f1f5f9',
                        color: '#475569',
                        px: 1.5,
                        py: 0.45,
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {row.kategori}
                    </Box>
                  </TableCell>

                  {/* Harga Beli */}
                  <TableCell align="right" sx={{ py: 1.75, px: 2, fontSize: '0.85rem', color: '#64748b' }}>
                    {formatCurrency(row.hargaBeli)}
                  </TableCell>

                  {/* Harga Jual */}
                  <TableCell align="right" sx={{ py: 1.75, px: 2 }}>
                    <Typography sx={{ fontWeight: 800, color: '#2563eb', fontSize: '0.9rem' }}>
                      {formatCurrency(row.hargaJual)}
                    </Typography>
                  </TableCell>

                  {/* Sisa Stok */}
                  <TableCell align="center" sx={{ py: 1.75, px: 2 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1.5,
                        py: 0.4,
                        borderRadius: '12px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        bgcolor: row.stok < 30 ? '#fffbeb' : '#f0fdf4',
                        color: row.stok < 30 ? '#d97706' : '#16a34a',
                      }}
                    >
                      {row.stok} unit
                    </Box>
                  </TableCell>

                  {/* Status Pill */}
                  <TableCell align="center" sx={{ py: 1.75, px: 2 }}>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1.5,
                        py: 0.4,
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        bgcolor: row.status === 'Aktif' ? '#eff6ff' : '#fef2f2',
                        color: row.status === 'Aktif' ? '#2563eb' : '#dc2626',
                        border: row.status === 'Aktif' ? '1px solid #dbeafe' : '1px solid #fee2e2',
                      }}
                    >
                      {row.status}
                    </Box>
                  </TableCell>

                  {/* Aksi */}
                  <TableCell align="right" sx={{ py: 1.75, px: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75 }}>
                      <Tooltip title="Edit Produk">
                        <IconButton
                          onClick={() => handleOpen(row)}
                          size="small"
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: '#eff6ff',
                            color: '#2563eb',
                            borderRadius: '8px',
                            '&:hover': { bgcolor: '#dbeafe' },
                          }}
                        >
                          <EditOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Hapus Produk">
                        <IconButton
                          onClick={() => handleDelete(row.id)}
                          size="small"
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: '#fef2f2',
                            color: '#ef4444',
                            borderRadius: '8px',
                            '&:hover': { bgcolor: '#fee2e2' },
                          }}
                        >
                          <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                    <Inventory2OutlinedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Tidak ada produk yang cocok dengan pencarian / filter
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* MODERN DIALOG ADD / EDIT PRODUCT */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              {formData.id ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Isi parameter inventaris dan harga produk
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small" sx={{ color: '#94a3b8' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          <Stack spacing={2.25} sx={{ mt: 1 }}>
            <TextField
              label="Nama Produk"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              size="small"
              fullWidth
              required
              placeholder="Contoh: Kertas Thermal 58mm"
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                  name="kategori"
                  value={formData.kategori || ''}
                  label="Kategori"
                  onChange={handleChange}
                >
                  {categoryOptions.map((c) => (
                    <MenuItem key={c.id} value={c.name}>
                      {c.name}
                    </MenuItem>
                  ))}
                  {formData.kategori && !categoryOptions.some(c => c.name === formData.kategori) && (
                    <MenuItem value={formData.kategori}>{formData.kategori}</MenuItem>
                  )}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select name="status" value={formData.status} label="Status" onChange={handleChange}>
                  <MenuItem value="Aktif">Aktif</MenuItem>
                  <MenuItem value="Nonaktif">Nonaktif</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <TextField
                label="Harga Beli (Rp)"
                name="hargaBeli"
                type="number"
                value={formData.hargaBeli}
                onChange={handleChange}
                size="small"
                fullWidth
              />
              <TextField
                label="Harga Jual (Rp)"
                name="hargaJual"
                type="number"
                value={formData.hargaJual}
                onChange={handleChange}
                size="small"
                fullWidth
                required
              />
              <TextField
                label="Stok Awal"
                name="stok"
                type="number"
                value={formData.stok}
                onChange={handleChange}
                size="small"
                fullWidth
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button
            onClick={handleClose}
            sx={{
              borderRadius: '10px',
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
            }}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              borderRadius: '10px',
              bgcolor: '#2563eb',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            Simpan Produk
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsPage;
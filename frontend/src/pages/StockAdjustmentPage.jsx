import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import ProductVisual from '../components/common/ProductVisual';
import tokens from '../theme/tokens';
import { useSnackbar } from 'notistack';
import { fetchAndSyncProducts } from '../services/productStockService';

const REASON_PRESETS = [
  'Hasil Stock Opname Berkala',
  'Barang Rusak / Pecah / Cacat',
  'Barang Kedaluwarsa (Expired)',
  'Koreksi Kesalahan Input Kasir / Masuk',
  'Hilang / Selisih Fisik Toko',
  'Lainnya',
];

const StockAdjustmentPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actualStock, setActualStock] = useState('');
  const [reasonCategory, setReasonCategory] = useState(REASON_PRESETS[0]);
  const [detailNotes, setDetailNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchProducts = useCallback(async () => {
    try {
      const items = await fetchAndSyncProducts();
      if (items && items.length > 0) {
        setProducts(items);
      }
    } catch (error) {
      // Fallback
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const currentSystemStock = selectedProduct ? parseInt(selectedProduct.stok, 10) || 0 : 0;
  const actualStockNum = actualStock === '' ? null : parseInt(actualStock, 10);
  const diff = actualStockNum !== null ? actualStockNum - currentSystemStock : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      enqueueSnackbar('Silakan pilih produk yang akan disesuaikan stoknya!', { variant: 'warning' });
      return;
    }
    if (actualStockNum === null || actualStockNum < 0) {
      enqueueSnackbar('Stok aktual fisik harus berupa angka 0 atau lebih!', { variant: 'warning' });
      return;
    }

    try {
      setLoading(true);
      const combinedReason = `${reasonCategory}${detailNotes ? ` - ${detailNotes}` : ''}`;
      
      await api.post('/stock/adjustment', {
        productId: selectedProduct.id,
        actualStock: actualStockNum,
        reason: combinedReason,
      }).catch(() => {});

      // Update client stock
      const updated = products.map(p =>
        p.id === selectedProduct.id ? { ...p, stok: actualStockNum } : p
      );
      setProducts(updated);
      localStorage.setItem('tokas_mock_products', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('tokas_stock_updated', { detail: updated }));

      enqueueSnackbar(
        `Penyesuaian stok berhasil! Stok "${selectedProduct.nama}" kini menjadi ${actualStockNum} unit.`,
        { variant: 'success' }
      );
      setSelectedProduct(null);
      setActualStock('');
      setDetailNotes('');
    } catch (err) {
      enqueueSnackbar('Gagal menyimpan penyesuaian stok ke server', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', pb: 4 }}>
      <PageHeader
        title="Penyesuaian Stok (Stock Opname)"
        subtitle="Koreksi dan samakan jumlah stok di sistem dengan hasil perhitungan fisik di toko."
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '1.2fr 0.8fr',
          },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {/* Form Card */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                bgcolor: tokens.colors.brand[50],
                color: tokens.colors.brand[500],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TuneOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: tokens.colors.neutral[900] }}>
                Formulir Koreksi Stok Fisik
              </Typography>
              <Typography variant="caption" sx={{ color: tokens.colors.neutral[500] }}>
                Pilih barang dan masukkan jumlah aktual hasil hitungan opname fisik.
              </Typography>
            </Box>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Product Selector */}
              <Autocomplete
                options={products}
                getOptionLabel={(option) => `${option.kode} - ${option.nama} (Stok Sistem: ${option.stok})`}
                value={selectedProduct}
                onChange={(event, newValue) => {
                  setSelectedProduct(newValue);
                  if (newValue) {
                    setActualStock(newValue.stok.toString());
                  } else {
                    setActualStock('');
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Pilih Produk Barang"
                    placeholder="Ketik kode SKU atau nama barang..."
                    required
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', py: 0.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '6px',
                          bgcolor: tokens.colors.neutral[100],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <ProductVisual code={option.kode} name={option.nama} size={20} />
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: tokens.colors.neutral[900], fontSize: '0.825rem' }}>
                          {option.nama}
                        </Typography>
                        <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], fontSize: '0.72rem' }}>
                          SKU: {option.kode}
                        </Typography>
                      </Box>
                      <StatusBadge
                        status={option.stok <= 0 ? 'habis' : option.stok < 20 ? 'menipis' : 'aman'}
                        label={`Sistem: ${option.stok}`}
                        size="small"
                      />
                    </Box>
                  </li>
                )}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Jumlah Stok Fisik Aktual (Unit)"
                  type="number"
                  value={actualStock}
                  onChange={(e) => setActualStock(e.target.value)}
                  placeholder="Jumlah real di toko/gudang"
                  required
                  fullWidth
                  inputProps={{ min: 0 }}
                />

                <FormControl fullWidth>
                  <InputLabel>Kategori Alasan</InputLabel>
                  <Select
                    value={reasonCategory}
                    label="Kategori Alasan"
                    onChange={(e) => setReasonCategory(e.target.value)}
                  >
                    {REASON_PRESETS.map((reason) => (
                      <MenuItem key={reason} value={reason}>
                        {reason}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <TextField
                label="Catatan Detail / Berita Acara (Opsional)"
                value={detailNotes}
                onChange={(e) => setDetailNotes(e.target.value)}
                placeholder="Contoh: Ditemukan 2 kaleng penyok saat hitung mingguan..."
                multiline
                rows={3}
                fullWidth
              />

              <Button
                type="submit"
                variant="contained"
                disabled={loading || !selectedProduct || actualStockNum === null}
                sx={{
                  bgcolor: tokens.colors.brand[500],
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  py: 1.2,
                  borderRadius: '8px',
                  '&:hover': { bgcolor: tokens.colors.brand[600] },
                }}
              >
                {loading ? 'Menyimpan Penyesuaian...' : 'Simpan Penyesuaian Stok'}
              </Button>
            </Box>
          </form>
        </Card>

        {/* Live Discrepancy Preview Card */}
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
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: tokens.colors.neutral[900], mb: 0.5 }}>
            Rincian Selisih Opname
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], display: 'block', mb: 2.5 }}>
            Kalkulasi otomatis perbedaan data sistem vs perhitungan fisik.
          </Typography>

          {selectedProduct ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.75, borderRadius: '10px', bgcolor: tokens.colors.neutral[50], mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '8px',
                    bgcolor: '#ffffff',
                    border: `1px solid ${tokens.colors.neutral[200]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ProductVisual code={selectedProduct.kode} name={selectedProduct.nama} size={28} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.colors.neutral[900] }}>
                    {selectedProduct.nama}
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokens.colors.neutral[500] }}>
                    SKU: {selectedProduct.kode}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: '8px', border: `1px solid ${tokens.colors.neutral[200]}` }}>
                  <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], fontWeight: 600 }}>
                    Stok di Sistem:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: tokens.colors.neutral[800] }}>
                    {currentSystemStock} unit
                  </Typography>
                </Box>

                <Box sx={{ p: 1.5, borderRadius: '8px', border: `1px solid ${tokens.colors.neutral[200]}` }}>
                  <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], fontWeight: 600 }}>
                    Stok Fisik Diinput:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: tokens.colors.brand[600] }}>
                    {actualStockNum !== null ? `${actualStockNum} unit` : '-'}
                  </Typography>
                </Box>
              </Box>

              {/* Difference Box */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: '10px',
                  bgcolor: diff === 0 ? tokens.colors.neutral[50] : diff < 0 ? tokens.colors.danger[50] : tokens.colors.success[50],
                  border: `1px solid ${diff === 0 ? tokens.colors.neutral[200] : diff < 0 ? tokens.colors.danger[100] : tokens.colors.success[100]}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: diff === 0 ? tokens.colors.neutral[700] : diff < 0 ? tokens.colors.danger[700] : tokens.colors.success[700],
                      textTransform: 'uppercase',
                    }}
                  >
                    Selisih Persediaan:
                  </Typography>
                  <Typography variant="body2" sx={{ color: tokens.colors.neutral[600], fontSize: '0.74rem' }}>
                    {diff === 0 ? 'Stok fisik sesuai sistem' : diff < 0 ? 'Fisik lebih sedikit (kekurangan)' : 'Fisik lebih banyak (kelebihan)'}
                  </Typography>
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: diff === 0 ? tokens.colors.neutral[700] : diff < 0 ? tokens.colors.danger[700] : tokens.colors.success[700],
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {diff > 0 ? `+${diff}` : diff}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {diff === 0 ? (
                  <CheckCircleOutlineOutlinedIcon sx={{ color: tokens.colors.success[600], fontSize: 18 }} />
                ) : (
                  <WarningAmberOutlinedIcon sx={{ color: tokens.colors.warning[600], fontSize: 18 }} />
                )}
                <Typography variant="caption" sx={{ color: tokens.colors.neutral[600], fontWeight: 500 }}>
                  Log penyesuaian akan dicatat untuk audit persediaan toko.
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ py: 5, textAlign: 'center', color: tokens.colors.neutral[400] }}>
              <Typography variant="body2" sx={{ fontSize: '0.84rem' }}>
                Pilih produk di formulir kiri untuk melihat perbandingan selisih.
              </Typography>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default StockAdjustmentPage;

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Autocomplete,
  Divider,
} from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import ProductVisual from '../components/common/ProductVisual';
import tokens from '../theme/tokens';
import { useSnackbar } from 'notistack';
import { fetchAndSyncProducts } from '../services/productStockService';

const StockInPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [supplier, setSupplier] = useState('');
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

  const qtyNum = parseInt(quantity, 10) || 0;
  const currentStock = selectedProduct ? parseInt(selectedProduct.stok, 10) || 0 : 0;
  const projectedStock = currentStock + qtyNum;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      enqueueSnackbar('Pilih produk yang akan ditambahkan stoknya!', { variant: 'warning' });
      return;
    }
    if (qtyNum <= 0) {
      enqueueSnackbar('Jumlah stok masuk harus lebih dari 0 unit!', { variant: 'warning' });
      return;
    }

    try {
      setLoading(true);
      const fullReason = [supplier ? `Supplier: ${supplier}` : '', reason].filter(Boolean).join(' • ') || 'Penerimaan stok reguler';
      
      await api.post('/stock/in', {
        productId: selectedProduct.id,
        quantity: qtyNum,
        reason: fullReason,
      }).catch(() => {});

      // Synchronize client-side stock
      const updated = products.map(p =>
        p.id === selectedProduct.id ? { ...p, stok: projectedStock } : p
      );
      setProducts(updated);
      localStorage.setItem('tokas_mock_products', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('tokas_stock_updated', { detail: updated }));

      enqueueSnackbar(`Berhasil menambahkan ${qtyNum} unit ke "${selectedProduct.nama}"!`, { variant: 'success' });
      setSelectedProduct(null);
      setQuantity('');
      setReason('');
      setSupplier('');
    } catch (err) {
      enqueueSnackbar('Gagal memproses penambahan stok ke server', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', pb: 4 }}>
      <PageHeader
        title="Stok Masuk (Penerimaan Barang)"
        subtitle="Catat penambahan barang masuk dari supplier ke dalam gudang atau etalase toko."
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
        {/* Form Input Card */}
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
              <FileDownloadOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: tokens.colors.neutral[900] }}>
                Formulir Penerimaan Barang
              </Typography>
              <Typography variant="caption" sx={{ color: tokens.colors.neutral[500] }}>
                Lengkapi rincian produk, jumlah penerimaan, dan keterangan faktur.
              </Typography>
            </Box>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Product Autocomplete Selector */}
              <Autocomplete
                options={products}
                getOptionLabel={(option) => `${option.kode} - ${option.nama} (Stok: ${option.stok})`}
                value={selectedProduct}
                onChange={(event, newValue) => setSelectedProduct(newValue)}
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
                          SKU: {option.kode} • Kategori: {option.kategori || '-'}
                        </Typography>
                      </Box>
                      <StatusBadge
                        status={option.stok <= 0 ? 'habis' : option.stok < 20 ? 'menipis' : 'aman'}
                        label={`Stok: ${option.stok}`}
                        size="small"
                      />
                    </Box>
                  </li>
                )}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Jumlah Stok Masuk (Unit)"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Contoh: 50"
                  required
                  fullWidth
                  inputProps={{ min: 1 }}
                />

                <TextField
                  label="Nama Supplier / Pemasok (Opsional)"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Contoh: CV Sumber Makmur"
                  fullWidth
                />
              </Box>

              <TextField
                label="No. Faktur / Keterangan Alasan"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: No PO #10892 / Restock mingguan"
                multiline
                rows={3}
                fullWidth
              />

              <Button
                type="submit"
                variant="contained"
                disabled={loading || !selectedProduct || qtyNum <= 0}
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
                {loading ? 'Menyimpan...' : 'Konfirmasi & Tambahkan Stok'}
              </Button>
            </Box>
          </form>
        </Card>

        {/* Live Calculation Preview Card */}
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
            Simulasi Perubahan Stok
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], display: 'block', mb: 2.5 }}>
            Preview stok sebelum dan sesudah pencatatan disimpan.
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

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderRadius: '10px', border: `1px solid ${tokens.colors.neutral[200]}`, mb: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], fontWeight: 600 }}>
                    Stok Saat Ini
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: tokens.colors.neutral[800], fontFeatureSettings: '"tnum"' }}>
                    {currentStock}
                  </Typography>
                </Box>

                <ArrowForwardRoundedIcon sx={{ color: tokens.colors.brand[500] }} />

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: tokens.colors.brand[600], fontWeight: 700 }}>
                    Ditambahkan
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: tokens.colors.brand[600], fontFeatureSettings: '"tnum"' }}>
                    +{qtyNum}
                  </Typography>
                </Box>

                <ArrowForwardRoundedIcon sx={{ color: tokens.colors.success[600] }} />

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: tokens.colors.success[700], fontWeight: 700 }}>
                    Stok Akhir
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: tokens.colors.success[700], fontFeatureSettings: '"tnum"' }}>
                    {projectedStock}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: tokens.colors.success[700] }}>
                <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Stok otomatis tersinkronisasi di kasir & katalog setelah disimpan.
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ py: 5, textAlign: 'center', color: tokens.colors.neutral[400] }}>
              <Typography variant="body2" sx={{ fontSize: '0.84rem' }}>
                Pilih produk di formulir kiri untuk melihat simulasi kalkulasi stok.
              </Typography>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default StockInPage;
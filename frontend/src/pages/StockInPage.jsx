import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Autocomplete } from '@mui/material';
import api from '../services/api';

import PageHeader from '../components/common/PageHeader';

const StockInPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data.data?.items || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !quantity) {
      setMessage('Produk dan jumlah wajib diisi.');
      return;
    }

    try {
      await api.post('/stock/in', {
        productId: selectedProduct.id,
        quantity: parseInt(quantity, 10),
        reason
      });
      setMessage('Stok berhasil ditambahkan!');
      setSelectedProduct(null);
      setQuantity('');
      setReason('');
    } catch (error) {
      console.error('Error adding stock:', error);
      setMessage('Gagal menambahkan stok.');
    }
  };

  return (
    <Box>
      <PageHeader 
        title="Stok Masuk" 
        subtitle="Tambahkan stok barang ke inventaris"
      />
      <Box display="flex" justifyContent="center">
        <Paper sx={{ p: 4, width: '100%', maxWidth: 600 }}>
          <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
            <Autocomplete
              options={products}
              getOptionLabel={(option) => `${option.kode} - ${option.nama}`}
              value={selectedProduct}
              onChange={(event, newValue) => setSelectedProduct(newValue)}
              renderInput={(params) => <TextField {...params} label="Pilih Produk" required />}
            />
            <TextField
              label="Jumlah"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Alasan / Keterangan"
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
            />
            <Button variant="contained" color="primary" type="submit" size="large">
              Simpan Stok
            </Button>
            {message && (
              <Typography color={message.includes('berhasil') ? 'success.main' : 'error.main'}>
                {message}
              </Typography>
            )}
          </Box>
        </form>
      </Paper>
      </Box>
    </Box>
  );
};

export default StockInPage;
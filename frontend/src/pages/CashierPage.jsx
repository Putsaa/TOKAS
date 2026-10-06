import React, { useState, useEffect, useMemo } from 'react';
import { 
  Grid, Paper, Typography, Box, TextField, Button, IconButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

import PageHeader from '../components/common/PageHeader';

const CashierPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [receiptDialog, setReceiptDialog] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchProducts = React.useCallback(async () => {
    try {
      const response = await api.get('/products?active=true');
      setProducts(response.data.data?.items || []);
    } catch (error) {
      enqueueSnackbar('Gagal memuat produk', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const nama = p.nama || '';
      const kode = p.kode || '';
      return nama.toLowerCase().includes(search.toLowerCase()) || kode.toLowerCase().includes(search.toLowerCase());
    });
  }, [products, search]);

  const addToCart = (product) => {
    if (product.stok <= 0) {
      enqueueSnackbar('Stok habis', { variant: 'warning' });
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stok) {
          enqueueSnackbar('Mencapai batas stok', { variant: 'warning' });
          return prev;
        }
        return prev.map(item => 
          item.productId === product.id ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price } : item
        );
      }
      return [...prev, { productId: product.id, name: product.nama, price: product.hargaJual, quantity: 1, subtotal: product.hargaJual }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return item;
          const product = products.find(p => p.id === productId);
          if (product && newQuantity > product.stok) {
            enqueueSnackbar('Mencapai batas stok', { variant: 'warning' });
            return item;
          }
          return { ...item, quantity: newQuantity, subtotal: newQuantity * item.price };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.subtotal, 0), [cart]);
  const paymentNum = parseFloat(paymentAmount) || 0;
  const change = paymentNum - total;
  const isValidPayment = paymentNum >= total && cart.length > 0;

  const handleCheckout = async () => {
    if (!isValidPayment) return;
    try {
      const payload = {
        items: cart.map(item => ({ productId: item.productId, quantity: item.quantity, price: item.price })),
        paymentAmount: paymentNum
      };
      const response = await api.post('/transactions', payload);
      setLastTransaction(response.data);
      setReceiptDialog(true);
      setCart([]);
      setPaymentAmount('');
      fetchProducts(); // Refresh stock
      enqueueSnackbar('Transaksi berhasil', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Transaksi gagal', { variant: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader 
        title="Kasir" 
        subtitle="Proses transaksi penjualan (Point of Sale)"
      />
      <Grid container spacing={2} sx={{ height: 'calc(100vh - 200px)' }}>
        {/* Left Panel: Products */}
        <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Cari produk (nama / kode)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
              }}
            />
          </Paper>
          <Paper sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
            <Grid container spacing={2}>
              {filteredProducts.map(product => (
                <Grid item xs={6} sm={4} key={product.id}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      cursor: product.stok > 0 ? 'pointer' : 'not-allowed', 
                      bgcolor: product.stok > 0 ? 'background.paper' : 'action.hover',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                    onClick={() => product.stok > 0 && addToCart(product)}
                  >
                    <Typography variant="subtitle2" noWrap>{product.nama}</Typography>
                    <Typography variant="body2" color="text.secondary">{product.kode}</Typography>
                    <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body1" color="primary.main" fontWeight="bold">
                        {formatCurrency(product.hargaJual)}
                      </Typography>
                      <Typography variant="caption" color={product.stok > 0 ? 'text.secondary' : 'error'}>
                        Stok: {product.stok}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Right Panel: Cart */}
        <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Paper sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box p={2} bgcolor="primary.main" color="primary.contrastText">
              <Typography variant="h6">Keranjang Belanja</Typography>
            </Box>
            
            <Box flexGrow={1} overflow="auto" p={2}>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {cart.map(item => (
                      <TableRow key={item.productId}>
                        <TableCell sx={{ pl: 0 }}>
                          <Typography variant="body2">{item.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{formatCurrency(item.price)}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center">
                            <IconButton size="small" onClick={() => updateQuantity(item.productId, -1)}>
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                            <IconButton size="small" onClick={() => updateQuantity(item.productId, 1)}>
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{formatCurrency(item.subtotal)}</TableCell>
                        <TableCell align="right" sx={{ pr: 0 }}>
                          <IconButton color="error" size="small" onClick={() => removeFromCart(item.productId)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {cart.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          Keranjang kosong
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box p={2} borderTop="1px solid" borderColor="divider" bgcolor="background.default">
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary.main">{formatCurrency(total)}</Typography>
              </Box>
              
              <TextField
                fullWidth
                label="Uang Dibayar (Rp)"
                type="number"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                sx={{ mb: 2, mt: 1 }}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
              
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body1">Kembalian</Typography>
                <Typography variant="body1" color={change < 0 ? 'error' : 'text.primary'}>
                  {paymentAmount ? formatCurrency(change) : '-'}
                </Typography>
              </Box>
              
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={!isValidPayment}
                onClick={handleCheckout}
              >
                Bayar
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialog} onClose={() => setReceiptDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle align="center">Struk Pembayaran</DialogTitle>
        <DialogContent dividers>
          {lastTransaction && (
            <Box>
              <Typography align="center" variant="subtitle2" gutterBottom>TOKAS</Typography>
              <Typography align="center" variant="caption" display="block" gutterBottom>
                ID: {lastTransaction.id}
              </Typography>
              <Box my={2} borderBottom="1px dashed" borderColor="divider" />
              
              {lastTransaction.items && lastTransaction.items.map((item, idx) => (
                <Box key={idx} display="flex" justifyContent="space-between" mb={1}>
                  <Box>
                    <Typography variant="body2">{item.productName}</Typography>
                    <Typography variant="caption">{item.quantity} x {formatCurrency(item.price)}</Typography>
                  </Box>
                  <Typography variant="body2">{formatCurrency(item.quantity * item.price)}</Typography>
                </Box>
              ))}
              
              <Box my={2} borderBottom="1px dashed" borderColor="divider" />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" fontWeight="bold">Total</Typography>
                <Typography variant="body2" fontWeight="bold">{formatCurrency(lastTransaction.totalAmount)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Tunai</Typography>
                <Typography variant="body2">{formatCurrency(lastTransaction.paymentAmount)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Kembali</Typography>
                <Typography variant="body2">{formatCurrency(lastTransaction.paymentAmount - lastTransaction.totalAmount)}</Typography>
              </Box>
              
              <Box my={2} />
              <Typography align="center" variant="caption" display="block">Terima Kasih</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptDialog(false)} color="primary">Tutup</Button>
          <Button onClick={() => window.print()} color="primary" variant="contained">Cetak</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CashierPage;

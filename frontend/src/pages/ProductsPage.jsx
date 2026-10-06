import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

import PageHeader from '../components/common/PageHeader';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '', kode: '', nama: '', kategori: '', hargaBeli: 0, hargaJual: 0, stok: 0, status: 'Aktif'
  });

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.data?.items || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpen = (product = null) => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({ id: '', kode: '', nama: '', kategori: '', hargaBeli: 0, hargaJual: 0, stok: 0, status: 'Aktif' });
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
    try {
      if (formData.id) {
        await api.put(`/products/${formData.id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      fetchProducts();
      handleClose();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <Box>
      <PageHeader 
        title="Data Produk" 
        subtitle="Kelola data produk dan inventaris toko"
        action={
          <Button variant="contained" color="primary" onClick={() => handleOpen()}>
            Tambah Produk
          </Button>
        }
      />

      <Box sx={{ mb: 4 }}>
        <Paper elevation={6} sx={{ borderRadius: 2.5, p: { xs: 2, sm: 2.5, md: 3 }, mb: 3 }}>
          <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2 }}>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2, px: 2.5 }}>Kode</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2, px: 2.5 }}>Nama</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2, px: 2.5 }}>Kategori</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', py: 2, px: 2.5 }}>Harga Beli</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', py: 2, px: 2.5 }}>Harga Jual</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', py: 2, px: 2.5 }}>Stok</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2, px: 2.5 }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', py: 2, px: 2.5 }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((row) => (
                    <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ py: 2, px: 2.5, fontWeight: 500, color: '#0f172a' }}>{row.kode}</TableCell>
                      <TableCell sx={{ py: 2, px: 2.5, fontWeight: 600, color: '#0f172a' }}>{row.nama}</TableCell>
                      <TableCell sx={{ py: 2, px: 2.5 }}>
                        <Box sx={{ bgcolor: '#f1f5f9', color: '#475569', px: 1.5, py: 0.5, borderRadius: 1.5, display: 'inline-block', fontSize: '0.75rem', fontWeight: 600 }}>
                          {row.kategori}
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 2, px: 2.5 }}>Rp {row.hargaBeli.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ py: 2, px: 2.5, fontWeight: 700, color: '#0f172a' }}>Rp {row.hargaJual.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ py: 2, px: 2.5 }}>
                        <Box sx={{ 
                          color: row.stok < 10 ? 'error.main' : 'success.main',
                          fontWeight: 700
                        }}>
                          {row.stok}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2, px: 2.5 }}>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1.5,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            bgcolor: row.status === 'Aktif' ? '#f0fdf4' : '#fef2f2',
                            color: row.status === 'Aktif' ? '#16a34a' : '#dc2626',
                          }}
                        >
                          {row.status}
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 2, px: 2.5 }}>
                        <IconButton color="primary" onClick={() => handleOpen(row)} size="small" sx={{ mr: 1, bgcolor: '#eff6ff', '&:hover': { bgcolor: '#dbeafe' } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(row.id)} size="small" sx={{ bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        Tidak ada data produk
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Paper>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{formData.id ? 'Edit Produk' : 'Tambah Produk'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField label="Kode Produk" name="kode" value={formData.kode} onChange={handleChange} fullWidth />
            <TextField label="Nama Produk" name="nama" value={formData.nama} onChange={handleChange} fullWidth />
            <TextField label="Kategori" name="kategori" value={formData.kategori} onChange={handleChange} fullWidth />
            <TextField label="Harga Beli" name="hargaBeli" type="number" value={formData.hargaBeli} onChange={handleChange} fullWidth />
            <TextField label="Harga Jual" name="hargaJual" type="number" value={formData.hargaJual} onChange={handleChange} fullWidth />
            <TextField label="Stok" name="stok" type="number" value={formData.stok} onChange={handleChange} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={formData.status} label="Status" onChange={handleChange}>
                <MenuItem value="Aktif">Aktif</MenuItem>
                <MenuItem value="Nonaktif">Nonaktif</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Batal</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsPage;
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '', kode: '', nama: '', kategori: '', hargaBeli: 0, hargaJual: 0, stok: 0, status: 'Aktif'
  });

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
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
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Data Produk</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Tambah Produk
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kode</TableCell>
              <TableCell>Nama</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell align="right">Harga Beli</TableCell>
              <TableCell align="right">Harga Jual</TableCell>
              <TableCell align="right">Stok</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.kode}</TableCell>
                <TableCell>{row.nama}</TableCell>
                <TableCell>{row.kategori}</TableCell>
                <TableCell align="right">{row.hargaBeli}</TableCell>
                <TableCell align="right">{row.hargaJual}</TableCell>
                <TableCell align="right">{row.stok}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleOpen(row)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(row.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
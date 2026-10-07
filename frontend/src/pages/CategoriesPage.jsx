import React, { useState, useEffect } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

import PageHeader from '../components/common/PageHeader';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', nama: '', status: 'Aktif' });

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpen = (category = null) => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({ id: '', nama: '', status: 'Aktif' });
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
        await api.put(`/categories/${formData.id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      fetchCategories();
      handleClose();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  return (
    <Box>
      <PageHeader 
        title="Data Kategori" 
        subtitle="Kelola data kategori produk"
        action={
          <Button variant="contained" color="primary" onClick={() => handleOpen()}>
            Tambah Kategori
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
                    <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2, px: 3 }}>Nama Kategori</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2, px: 3 }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', py: 2, px: 3 }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((row) => (
                    <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ py: 2, px: 3, fontWeight: 600, color: '#0f172a' }}>{row.nama}</TableCell>
                      <TableCell sx={{ py: 2, px: 3 }}>
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
                      <TableCell align="center" sx={{ py: 2, px: 3 }}>
                        <IconButton color="primary" onClick={() => handleOpen(row)} size="small" sx={{ mr: 1, bgcolor: '#eff6ff', '&:hover': { bgcolor: '#dbeafe' } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(row.id)} size="small" sx={{ bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {categories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        Tidak ada data kategori
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
        <DialogTitle>{formData.id ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField label="Nama Kategori" name="nama" value={formData.nama} onChange={handleChange} fullWidth />
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

export default CategoriesPage;
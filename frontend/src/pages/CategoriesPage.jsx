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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nama Kategori</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.nama}</TableCell>
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
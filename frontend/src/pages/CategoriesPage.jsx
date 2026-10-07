import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Button, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Select, MenuItem, FormControl, InputLabel,
  InputBase, Tooltip, Stack, Chip, Alert, Snackbar, CircularProgress,
  Switch, FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import ToggleOnOutlinedIcon from '@mui/icons-material/ToggleOnOutlined';
import ToggleOffOutlinedIcon from '@mui/icons-material/ToggleOffOutlined';

import api from '../services/api';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  // Modal Dialog Form State
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', isActive: true });
  const [formError, setFormError] = useState('');

  // Delete Confirmation Dialog State
  const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null, loading: false });

  // Snackbar Notification State
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showNotification = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      showNotification('Gagal memuat data kategori dari server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Stats / KPIs
  const stats = useMemo(() => {
    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.isActive).length;
    const inactiveCategories = categories.filter(c => !c.isActive).length;
    const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);
    return { totalCategories, activeCategories, inactiveCategories, totalProducts };
  }, [categories]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        selectedStatus === 'Semua' ||
        (selectedStatus === 'Aktif' && c.isActive) ||
        (selectedStatus === 'Nonaktif' && !c.isActive);
      return matchSearch && matchStatus;
    });
  }, [categories, search, selectedStatus]);

  // Open Add / Edit Modal
  const handleOpenAdd = () => {
    setFormData({ id: null, name: '', isActive: true });
    setFormError('');
    setOpenModal(true);
  };

  const handleOpenEdit = (category) => {
    setFormData({
      id: category.id,
      name: category.name,
      isActive: category.isActive,
    });
    setFormError('');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    if (!submitting) {
      setOpenModal(false);
      setFormError('');
    }
  };

  // Submit Add or Edit
  const handleSubmitForm = async (e) => {
    e?.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Nama kategori wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      if (formData.id) {
        // Edit category
        await api.put(`/categories/${formData.id}`, {
          name: formData.name.trim(),
          isActive: formData.isActive,
        });
        showNotification(`Kategori "${formData.name.trim()}" berhasil diperbarui.`);
      } else {
        // Create new category
        await api.post('/categories', {
          name: formData.name.trim(),
        });
        showNotification(`Kategori "${formData.name.trim()}" berhasil ditambahkan.`);
      }

      setOpenModal(false);
      await fetchCategories();
    } catch (err) {
      console.error('Save category error:', err);
      const msg = err.response?.data?.message || 'Terjadi kesalahan saat menyimpan kategori.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Toggle Status
  const handleToggleStatus = async (category) => {
    const nextStatus = !category.isActive;
    try {
      await api.patch(`/categories/${category.id}/status`, { isActive: nextStatus });
      showNotification(`Status "${category.name}" diubah menjadi ${nextStatus ? 'Aktif' : 'Nonaktif'}.`);
      await fetchCategories();
    } catch (err) {
      console.error('Toggle status error:', err);
      showNotification('Gagal memperbarui status kategori.', 'error');
    }
  };

  // Delete category
  const handleOpenDeleteDialog = (category) => {
    setDeleteDialog({ open: true, category, loading: false });
  };

  const handleCloseDeleteDialog = () => {
    if (!deleteDialog.loading) {
      setDeleteDialog({ open: false, category: null, loading: false });
    }
  };

  const handleConfirmDelete = async () => {
    const target = deleteDialog.category;
    if (!target) return;

    try {
      setDeleteDialog(prev => ({ ...prev, loading: true }));
      const res = await api.delete(`/categories/${target.id}`);
      const message = res.data?.message || `Kategori "${target.name}" berhasil diproses.`;
      showNotification(message, 'info');
      handleCloseDeleteDialog();
      await fetchCategories();
    } catch (err) {
      console.error('Delete category error:', err);
      const msg = err.response?.data?.message || 'Gagal menghapus kategori.';
      showNotification(msg, 'error');
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
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
            Kategori Produk
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
            Kelola pengelompokan produk, pantau jumlah item per kategori, dan status aktif
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleOpenAdd}
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
          Tambah Kategori
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
        {/* Total Kategori */}
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
            <CategoryOutlinedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>
              Total Kategori
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.25rem', lineHeight: 1.2 }}>
              {stats.totalCategories} <Typography component="span" sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Item</Typography>
            </Typography>
          </Box>
        </Card>

        {/* Kategori Aktif */}
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
              Kategori Aktif
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#16a34a', fontSize: '1.25rem', lineHeight: 1.2 }}>
              {stats.activeCategories} <Typography component="span" sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Aktif</Typography>
            </Typography>
          </Box>
        </Card>

        {/* Kategori Nonaktif */}
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
              bgcolor: stats.inactiveCategories > 0 ? '#fef2f2' : '#f8fafc',
              color: stats.inactiveCategories > 0 ? '#dc2626' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BlockOutlinedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>
              Kategori Nonaktif
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: stats.inactiveCategories > 0 ? '#dc2626' : '#64748b', fontSize: '1.25rem', lineHeight: 1.2 }}>
              {stats.inactiveCategories} <Typography component="span" sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Item</Typography>
            </Typography>
          </Box>
        </Card>

        {/* Total Produk Terkait */}
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
              bgcolor: '#f5f3ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Inventory2OutlinedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>
              Total Produk Terkait
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#7c3aed', fontSize: '1.25rem', lineHeight: 1.2 }}>
              {stats.totalProducts} <Typography component="span" sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>SKU</Typography>
            </Typography>
          </Box>
        </Card>
      </Box>

      {/* FILTER & SEARCH CONTROL BAR */}
      <Card
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '16px',
          border: '1px solid #eef2f6',
          bgcolor: '#ffffff',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', flex: 1, gap: 1.5, alignItems: 'center' }}>
          {/* Search Field */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              px: 2,
              py: 0.8,
              flex: { xs: 1, sm: '0 1 360px' },
              transition: 'all 0.2s',
              '&:focus-within': {
                borderColor: '#2563eb',
                bgcolor: '#ffffff',
                boxShadow: '0 0 0 3px rgba(37,99,235,0.1)',
              },
            }}
          >
            <SearchIcon sx={{ color: '#94a3b8', fontSize: 20, mr: 1 }} />
            <InputBase
              placeholder="Cari nama kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                fontSize: '0.875rem',
                color: '#0f172a',
                width: '100%',
                fontWeight: 500,
                '& ::placeholder': { color: '#94a3b8', opacity: 1 },
              }}
            />
            {search && (
              <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.5, color: '#94a3b8' }}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>

          {/* Filter Status */}
          <FormControl
            size="small"
            sx={{
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#f8fafc',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#334155',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#cbd5e1' },
                '&.Mui-focused fieldset': { borderColor: '#2563eb' },
              },
            }}
          >
            <InputLabel id="status-filter-label" sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>
              Status
            </InputLabel>
            <Select
              labelId="status-filter-label"
              value={selectedStatus}
              label="Status"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value="Semua">Semua Status</MenuItem>
              <MenuItem value="Aktif">Aktif Saja</MenuItem>
              <MenuItem value="Nonaktif">Nonaktif Saja</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Counter Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          <Chip
            icon={<FilterListIcon sx={{ fontSize: '16px !important' }} />}
            label={`Menampilkan ${filteredCategories.length} dari ${categories.length} kategori`}
            variant="outlined"
            size="small"
            sx={{
              borderColor: '#e2e8f0',
              color: '#64748b',
              fontWeight: 600,
              fontSize: '0.8rem',
              py: 1.8,
              borderRadius: '10px',
            }}
          />
        </Box>
      </Card>

      {/* DATA TABLE */}
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
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8125rem', py: 2, px: 3, borderBottom: '1px solid #eef2f6' }}>
                  Kategori
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8125rem', py: 2, px: 3, borderBottom: '1px solid #eef2f6' }}>
                  Jumlah Produk Terkait
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8125rem', py: 2, px: 3, borderBottom: '1px solid #eef2f6' }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8125rem', py: 2, px: 3, borderBottom: '1px solid #eef2f6' }}>
                  Tanggal Dibuat
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8125rem', py: 2, px: 3, borderBottom: '1px solid #eef2f6' }}>
                  Aksi
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#2563eb', mb: 1.5 }} />
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                      Memuat data kategori...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: '#f1f5f9',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1.5,
                      }}
                    >
                      <CategoryOutlinedIcon sx={{ fontSize: 28 }} />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#334155', mb: 0.5 }}>
                      Tidak ada kategori ditemukan
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8', maxWidth: 360, mx: 'auto', mb: 2 }}>
                      {search
                        ? `Tidak ada kategori yang cocok dengan pencarian "${search}". Coba kata kunci lain.`
                        : 'Belum ada data kategori yang terdaftar.'}
                    </Typography>
                    {search ? (
                      <Button variant="outlined" size="small" onClick={() => setSearch('')} sx={{ borderRadius: '8px' }}>
                        Reset Pencarian
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleOpenAdd}
                        startIcon={<AddIcon />}
                        sx={{ borderRadius: '8px', bgcolor: '#2563eb' }}
                      >
                        Tambah Kategori Pertama
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      '&:hover': { bgcolor: '#f8fafc' },
                      transition: 'background-color 0.15s ease',
                      '& td': { borderBottom: '1px solid #f1f5f9' },
                    }}
                  >
                    {/* Category Name */}
                    <TableCell sx={{ py: 2.2, px: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: '10px',
                            bgcolor: row.isActive ? '#eff6ff' : '#f1f5f9',
                            color: row.isActive ? '#2563eb' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <CategoryOutlinedIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>
                            {row.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                            ID #{row.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Products Count */}
                    <TableCell sx={{ py: 2.2, px: 3 }}>
                      <Chip
                        icon={<Inventory2OutlinedIcon sx={{ fontSize: '15px !important' }} />}
                        label={`${row.productCount || 0} Produk`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.785rem',
                          borderRadius: '8px',
                          bgcolor: (row.productCount || 0) > 0 ? '#f0fdf4' : '#f8fafc',
                          color: (row.productCount || 0) > 0 ? '#16a34a' : '#64748b',
                          border: `1px solid ${(row.productCount || 0) > 0 ? '#bbf7d0' : '#e2e8f0'}`,
                        }}
                      />
                    </TableCell>

                    {/* Status */}
                    <TableCell sx={{ py: 2.2, px: 3 }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.75,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          bgcolor: row.isActive ? '#f0fdf4' : '#fef2f2',
                          color: row.isActive ? '#16a34a' : '#dc2626',
                          border: `1px solid ${row.isActive ? '#dcfce7' : '#fee2e2'}`,
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: row.isActive ? '#16a34a' : '#dc2626',
                          }}
                        />
                        {row.isActive ? 'Aktif' : 'Nonaktif'}
                      </Box>
                    </TableCell>

                    {/* Created At */}
                    <TableCell sx={{ py: 2.2, px: 3, color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
                      {formatDate(row.createdAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="center" sx={{ py: 2.2, px: 3 }}>
                      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                        {/* Toggle Status Button */}
                        <Tooltip title={row.isActive ? 'Nonaktifkan Kategori' : 'Aktifkan Kategori'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(row)}
                            sx={{
                              bgcolor: row.isActive ? '#f8fafc' : '#f0fdf4',
                              color: row.isActive ? '#64748b' : '#16a34a',
                              borderRadius: '8px',
                              p: 0.8,
                              '&:hover': {
                                bgcolor: row.isActive ? '#f1f5f9' : '#dcfce7',
                              },
                            }}
                          >
                            {row.isActive ? (
                              <ToggleOnOutlinedIcon sx={{ fontSize: 20 }} />
                            ) : (
                              <ToggleOffOutlinedIcon sx={{ fontSize: 20 }} />
                            )}
                          </IconButton>
                        </Tooltip>

                        {/* Edit Button */}
                        <Tooltip title="Edit Kategori">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEdit(row)}
                            sx={{
                              bgcolor: '#eff6ff',
                              color: '#2563eb',
                              borderRadius: '8px',
                              p: 0.8,
                              '&:hover': { bgcolor: '#dbeafe' },
                            }}
                          >
                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>

                        {/* Delete Button */}
                        <Tooltip title="Hapus Kategori">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDeleteDialog(row)}
                            sx={{
                              bgcolor: '#fef2f2',
                              color: '#dc2626',
                              borderRadius: '8px',
                              p: 0.8,
                              '&:hover': { bgcolor: '#fee2e2' },
                            }}
                          >
                            <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* MODAL FORM TAMBAH / EDIT KATEGORI */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.2rem' }}>
                {formData.id ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {formData.id ? `Perbarui informasi kategori #${formData.id}` : 'Tambahkan kelompok produk baru ke katalog'}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseModal} size="small" disabled={submitting}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </DialogTitle>

        <form onSubmit={handleSubmitForm}>
          <DialogContent sx={{ px: 3, py: 2 }}>
            <Stack spacing={2.5}>
              {formError && (
                <Alert severity="error" sx={{ borderRadius: '10px', fontSize: '0.85rem' }}>
                  {formError}
                </Alert>
              )}

              <TextField
                autoFocus
                label="Nama Kategori"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contoh: Perlengkapan Kantor, Minuman, dsb."
                disabled={submitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  },
                }}
              />

              {formData.id && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                      Status Kategori
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {formData.isActive ? 'Kategori aktif dan dapat digunakan pada produk' : 'Kategori dinonaktifkan dari katalog'}
                    </Typography>
                  </Box>
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    color="primary"
                    disabled={submitting}
                  />
                </Box>
              )}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
            <Button
              onClick={handleCloseModal}
              disabled={submitting}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: '#64748b',
                borderRadius: '10px',
                px: 2,
              }}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                borderRadius: '10px',
                bgcolor: '#2563eb',
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1d4ed8', boxShadow: 'none' },
              }}
            >
              {submitting ? (
                <CircularProgress size={20} sx={{ color: '#ffffff' }} />
              ) : formData.id ? (
                'Simpan Perubahan'
              ) : (
                'Tambah Kategori'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DIALOG KONFIRMASI HAPUS */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.2rem' }}>
            Konfirmasi Hapus Kategori
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 1.5 }}>
          {deleteDialog.category && (
            <Box>
              <Typography sx={{ color: '#334155', fontSize: '0.9rem', mb: 2 }}>
                Apakah Anda yakin ingin menghapus kategori <strong>"{deleteDialog.category.name}"</strong>?
              </Typography>

              {(deleteDialog.category.productCount || 0) > 0 ? (
                <Alert severity="warning" sx={{ borderRadius: '12px', fontSize: '0.825rem', lineHeight: 1.4 }}>
                  Kategori ini memiliki <strong>{deleteDialog.category.productCount} produk terkait</strong>. Sistem akan otomatis <strong>menonaktifkan</strong> status kategori secara aman agar tidak merusak data transaksi dan inventaris produk.
                </Alert>
              ) : (
                <Alert severity="info" sx={{ borderRadius: '12px', fontSize: '0.825rem' }}>
                  Kategori ini tidak memiliki produk terkait dan akan dihapus secara permanen dari basis data.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            disabled={deleteDialog.loading}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: '#64748b',
              borderRadius: '10px',
            }}
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleteDialog.loading}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              px: 2.5,
              boxShadow: 'none',
            }}
          >
            {deleteDialog.loading ? (
              <CircularProgress size={20} sx={{ color: '#ffffff' }} />
            ) : (
              'Ya, Hapus Kategori'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR NOTIFIKASI */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '0.875rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoriesPage;
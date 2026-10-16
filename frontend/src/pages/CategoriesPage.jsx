import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Button, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Select, MenuItem, FormControl, InputLabel,
  InputBase, Tooltip, Stack, Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import GridViewIcon from '@mui/icons-material/GridView';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import ClearIcon from '@mui/icons-material/Clear';

import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import MetricCard from '../components/common/MetricCard';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import tokens from '../theme/tokens';
import { useSnackbar } from 'notistack';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', isActive: true });
  const [formError, setFormError] = useState('');

  const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null });
  const { enqueueSnackbar } = useSnackbar();

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setCategories(res.data.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter(c => c.isActive !== false).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [categories]);

  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
      const isAktif = c.isActive !== false;
      const matchStatus =
        selectedStatus === 'Semua' ||
        (selectedStatus === 'Aktif' && isAktif) ||
        (selectedStatus === 'Tidak Aktif' && !isAktif);
      return matchSearch && matchStatus;
    });
  }, [categories, search, selectedStatus]);

  const handleOpenAdd = () => {
    setFormData({ id: null, name: '', isActive: true });
    setFormError('');
    setOpenModal(true);
  };

  const handleOpenEdit = (category) => {
    setFormData({
      id: category.id,
      name: category.name,
      isActive: category.isActive !== false,
    });
    setFormError('');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    if (!submitting) {
      setOpenModal(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Nama kategori wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      if (formData.id) {
        await api.put(`/categories/${formData.id}`, {
          name: formData.name.trim(),
          isActive: formData.isActive,
        });
        enqueueSnackbar('Kategori berhasil diperbarui di database', { variant: 'success' });
      } else {
        await api.post('/categories', {
          name: formData.name.trim(),
          isActive: formData.isActive,
        });
        enqueueSnackbar('Kategori baru berhasil ditambahkan ke database', { variant: 'success' });
      }
      setOpenModal(false);
      await fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan kategori ke server';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const cat = deleteDialog.category;
    if (!cat) return;
    try {
      await api.delete(`/categories/${cat.id}`);
      enqueueSnackbar(`Kategori "${cat.name}" berhasil dihapus dari database`, { variant: 'info' });
      await fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus kategori dari server';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setDeleteDialog({ open: false, category: null });
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', pb: 4 }}>
      <PageHeader
        title="Kategori Produk"
        subtitle="Kelola pengelompokan produk toko untuk mempermudah pencarian dan laporan."
        action={
          <Button
            variant="contained"
            onClick={handleOpenAdd}
            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: tokens.colors.brand[500],
              borderRadius: '8px',
              px: 2,
              py: 0.85,
              fontWeight: 700,
              fontSize: '0.825rem',
              '&:hover': { bgcolor: tokens.colors.brand[600] },
            }}
          >
            Tambah Kategori
          </Button>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <MetricCard
          title="Total Kategori"
          value={stats.total}
          subvalue="Kelompok produk terdaftar"
          icon={<GridViewIcon sx={{ fontSize: 22 }} />}
          iconBg={tokens.colors.brand[50]}
          iconColor={tokens.colors.brand[500]}
        />
        <MetricCard
          title="Kategori Aktif"
          value={stats.active}
          subvalue="Tampil di kasir & filter katalog"
          icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 22 }} />}
          iconBg={tokens.colors.success[50]}
          iconColor={tokens.colors.success[600]}
          trend="Aktif"
          trendType="positive"
        />
        <MetricCard
          title="Kategori Nonaktif"
          value={stats.inactive}
          subvalue="Diarsipkan sementara"
          icon={<BlockOutlinedIcon sx={{ fontSize: 22 }} />}
          iconBg={tokens.colors.neutral[100]}
          iconColor={tokens.colors.neutral[500]}
        />
      </Box>

      <Card
        elevation={0}
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: '12px',
          bgcolor: '#ffffff',
          border: `1px solid ${tokens.colors.neutral[200]}`,
          boxShadow: tokens.shadows.card,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: tokens.colors.neutral[50],
              border: `1px solid ${tokens.colors.neutral[200]}`,
              borderRadius: '8px',
              px: 1.5,
              py: 0.65,
              width: { xs: '100%', sm: 340 },
              '&:focus-within': {
                borderColor: tokens.colors.brand[500],
                bgcolor: '#ffffff',
                boxShadow: `0 0 0 2px ${tokens.colors.brand[100]}`,
              },
            }}
          >
            <SearchIcon sx={{ color: tokens.colors.neutral[400], fontSize: 20, mr: 1 }} />
            <InputBase
              placeholder="Cari nama kategori..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ flex: 1, fontSize: '0.84rem' }}
            />
            {search && (
              <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.25 }}>
                <ClearIcon sx={{ fontSize: 16, color: tokens.colors.neutral[400] }} />
              </IconButton>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ fontSize: '0.825rem' }}>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={e => setSelectedStatus(e.target.value)}
                sx={{ fontSize: '0.825rem' }}
              >
                <MenuItem value="Semua" sx={{ fontSize: '0.825rem' }}>Semua</MenuItem>
                <MenuItem value="Aktif" sx={{ fontSize: '0.825rem' }}>Aktif</MenuItem>
                <MenuItem value="Tidak Aktif" sx={{ fontSize: '0.825rem' }}>Tidak Aktif</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Card>

      <Card
        elevation={0}
        sx={{
          borderRadius: '12px',
          bgcolor: '#ffffff',
          border: `1px solid ${tokens.colors.neutral[200]}`,
          boxShadow: tokens.shadows.card,
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 80 }}>ID</TableCell>
                <TableCell>Nama Kategori</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ p: 0 }}>
                    <EmptyState
                      title="Kategori Tidak Ditemukan"
                      message="Belum ada kategori yang cocok dengan pencarian Anda."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map(cat => (
                  <TableRow key={cat.id} hover>
                    <TableCell sx={{ color: tokens.colors.neutral[500], fontWeight: 600 }}>
                      #{cat.id}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: tokens.colors.neutral[900], fontSize: '0.85rem' }}>
                      {cat.name}
                    </TableCell>
                    <TableCell align="center">
                      <StatusBadge
                        status={cat.isActive !== false ? 'Aktif' : 'Tidak Aktif'}
                        size="small"
                        showDot
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Ubah Kategori">
                          <IconButton size="small" onClick={() => handleOpenEdit(cat)} sx={{ color: tokens.colors.neutral[500], '&:hover': { color: tokens.colors.brand[600] } }}>
                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus Kategori">
                          <IconButton size="small" onClick={() => setDeleteDialog({ open: true, category: cat })} sx={{ color: tokens.colors.neutral[500], '&:hover': { color: tokens.colors.danger[600] } }}>
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

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '14px',
            border: `1px solid ${tokens.colors.neutral[200]}`,
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800, color: tokens.colors.neutral[900], pb: 1, pt: 2.5, px: 3 }}>
            {formData.id ? 'Ubah Nama Kategori' : 'Tambah Kategori Baru'}
          </DialogTitle>
          <DialogContent dividers sx={{ px: 3, py: 2.5, borderColor: tokens.colors.neutral[200] }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Nama Kategori"
                value={formData.name}
                onChange={e => {
                  setFormData({ ...formData, name: e.target.value });
                  setFormError('');
                }}
                error={Boolean(formError)}
                helperText={formError}
                required
                fullWidth
                placeholder="Contoh: Perlengkapan Elektronik..."
                autoFocus
              />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: '8px', bgcolor: tokens.colors.neutral[50] }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.colors.neutral[900], fontSize: '0.84rem' }}>
                    Status Kategori Aktif
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], fontSize: '0.74rem' }}>
                    Kategori aktif dapat dipilih di kasir & katalog.
                  </Typography>
                </Box>
                <Switch
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  color="primary"
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseModal} disabled={submitting} sx={{ color: tokens.colors.neutral[600], fontWeight: 600 }}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                bgcolor: tokens.colors.brand[500],
                fontWeight: 700,
                borderRadius: '8px',
                px: 2.5,
                '&:hover': { bgcolor: tokens.colors.brand[600] },
              }}
            >
              {submitting ? 'Menyimpan...' : 'Simpan Kategori'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        title="Hapus Kategori?"
        content={`Apakah Anda yakin ingin menghapus kategori "${deleteDialog.category?.name}"?`}
        confirmText="Ya, Hapus"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, category: null })}
      />
    </Box>
  );
};

export default CategoriesPage;
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputBase,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tooltip,
} from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import MetricCard from '../components/common/MetricCard';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import { formatCurrency } from '../utils/formatters';
import tokens from '../theme/tokens';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('Semua');
  const [selectedTx, setSelectedTx] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await api.get('/transactions');
      if (res.data?.data?.items && Array.isArray(res.data.data.items)) {
        setTransactions(res.data.data.items);
      } else if (Array.isArray(res.data?.data)) {
        setTransactions(res.data.data);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      setTransactions([]);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Metrics
  const stats = useMemo(() => {
    const totalCount = transactions.length;
    const totalSales = transactions.reduce((acc, t) => acc + (Number(t.total) || 0), 0);
    const avgBasket = totalCount > 0 ? Math.round(totalSales / totalCount) : 0;
    return { totalCount, totalSales, avgBasket };
  }, [transactions]);

  // Filtered
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        (t.transactionNo && t.transactionNo.toLowerCase().includes(q)) ||
        (t.cashierName && t.cashierName.toLowerCase().includes(q));
      
      const method = (t.paymentMethod || '').toLowerCase();
      const matchMethod =
        selectedMethod === 'Semua' ||
        (selectedMethod === 'Tunai' && (method.includes('tunai') || method === 'cash')) ||
        (selectedMethod === 'Non Tunai' && (!method.includes('tunai') && method !== 'cash'));

      return matchSearch && matchMethod;
    });
  }, [transactions, search, selectedMethod]);

  const handleOpenDetail = async (tx) => {
    try {
      const res = await api.get(`/transactions/${tx.id}`);
      if (res.data?.data) {
        setSelectedTx(res.data.data);
      } else {
        setSelectedTx(tx);
      }
    } catch (e) {
      setSelectedTx(tx);
    }
    setDetailModalOpen(true);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', pb: 4 }}>
      <PageHeader
        title="Riwayat Transaksi Penjualan"
        subtitle="Daftar seluruh transaksi kasir, metode pembayaran, dan pencetakan struk belanja."
      />

      {/* 3 Metric Summary Cards */}
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
          title="Total Omset Transaksi"
          value={formatCurrency(stats.totalSales)}
          subvalue="Penerimaan dari struk tercatat"
          icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 22 }} />}
          iconBg={tokens.colors.brand[50]}
          iconColor={tokens.colors.brand[500]}
        />
        <MetricCard
          title="Transaksi Berhasil"
          value={stats.totalCount}
          subvalue="Struk lunas"
          icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 22 }} />}
          iconBg={tokens.colors.success[50]}
          iconColor={tokens.colors.success[600]}
          trend="Selesai"
          trendType="positive"
        />
        <MetricCard
          title="Rata-rata Nilai Struk"
          value={formatCurrency(stats.avgBasket)}
          subvalue="Nilai belanja per transaksi"
          icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 22 }} />}
          iconBg={tokens.colors.neutral[100]}
          iconColor={tokens.colors.neutral[600]}
        />
      </Box>

      {/* Filter Toolbar */}
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
              width: { xs: '100%', sm: 360 },
              '&:focus-within': {
                borderColor: tokens.colors.brand[500],
                bgcolor: '#ffffff',
                boxShadow: `0 0 0 2px ${tokens.colors.brand[100]}`,
              },
            }}
          >
            <SearchIcon sx={{ color: tokens.colors.neutral[400], fontSize: 20, mr: 1 }} />
            <InputBase
              placeholder="Cari no. transaksi / kasir..."
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
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ fontSize: '0.825rem' }}>Metode Bayar</InputLabel>
              <Select
                value={selectedMethod}
                label="Metode Bayar"
                onChange={e => setSelectedMethod(e.target.value)}
                sx={{ fontSize: '0.825rem' }}
              >
                <MenuItem value="Semua" sx={{ fontSize: '0.825rem' }}>Semua Metode</MenuItem>
                <MenuItem value="Tunai" sx={{ fontSize: '0.825rem' }}>Tunai (Cash)</MenuItem>
                <MenuItem value="Non Tunai" sx={{ fontSize: '0.825rem' }}>Non Tunai (QRIS)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Card>

      {/* Transactions Table */}
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
                <TableCell>No. Transaksi</TableCell>
                <TableCell>Tanggal & Waktu</TableCell>
                <TableCell>Kasir Bertugas</TableCell>
                <TableCell align="center">Metode</TableCell>
                <TableCell align="right">Total Tagihan</TableCell>
                <TableCell align="right">Uang Diterima</TableCell>
                <TableCell align="right">Kembalian</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Rincian</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ p: 0 }}>
                    <EmptyState
                      title="Transaksi Tidak Ditemukan"
                      message="Belum ada riwayat transaksi yang cocok dengan kriteria pencarian."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map(tx => {
                  const dateStr = tx.createdAt
                    ? new Date(tx.createdAt).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-';
                  const isCash = (tx.paymentMethod || '').toLowerCase().includes('tunai') || tx.paymentMethod === 'cash';

                  return (
                    <TableRow key={tx.id || tx.transactionNo} hover>
                      <TableCell sx={{ fontWeight: 700, color: tokens.colors.brand[600], fontSize: '0.84rem' }}>
                        {tx.transactionNo}
                      </TableCell>
                      <TableCell sx={{ color: tokens.colors.neutral[600], fontSize: '0.8rem' }}>
                        {dateStr}
                      </TableCell>
                      <TableCell sx={{ color: tokens.colors.neutral[700], fontWeight: 500, fontSize: '0.8rem' }}>
                        {tx.cashierName || 'Kasir Toko'}
                      </TableCell>
                      <TableCell align="center">
                        <StatusBadge
                          label={isCash ? 'Tunai' : 'QRIS'}
                          variant={isCash ? 'info' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: tokens.colors.neutral[900], fontFeatureSettings: '"tnum"' }}>
                        {formatCurrency(tx.total)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: tokens.colors.neutral[600], fontFeatureSettings: '"tnum"' }}>
                        {formatCurrency(tx.paymentAmount || tx.total)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: tokens.colors.success[700], fontWeight: 700, fontFeatureSettings: '"tnum"' }}>
                        {formatCurrency(tx.changeAmount || 0)}
                      </TableCell>
                      <TableCell align="center">
                        <StatusBadge status="selesai" label="Selesai" size="small" showDot />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Lihat Struk Lengkap">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDetail(tx)}
                            sx={{ color: tokens.colors.brand[600], '&:hover': { bgcolor: tokens.colors.brand[50] } }}
                          >
                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* DETAIL STRUK MODAL DIALOG */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '14px', p: 1 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: 2.5 }}>
          <CheckCircleOutlineOutlinedIcon sx={{ color: tokens.colors.success[600], fontSize: 44, mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: tokens.colors.neutral[900] }}>
            Struk Penjualan TOKAS
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.neutral[500] }}>
            {selectedTx?.transactionNo} • Kasir: {selectedTx?.cashierName || 'Kasir'}
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ borderTop: `1px solid ${tokens.colors.neutral[200]}`, borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>
          <Box sx={{ my: 1 }}>
            {selectedTx?.items && selectedTx.items.length > 0 ? (
              selectedTx.items.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, fontSize: '0.8125rem' }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: tokens.colors.neutral[900] }}>
                      {item.productName || item.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: tokens.colors.neutral[500] }}>
                      {item.quantity} x {formatCurrency(item.price)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.colors.neutral[900], fontFeatureSettings: '"tnum"' }}>
                    {formatCurrency(item.subtotal || item.quantity * item.price)}
                  </Typography>
                </Box>
              ))
            ) : (
              <Box sx={{ py: 1.5, textAlign: 'center', color: tokens.colors.neutral[500], fontSize: '0.8rem' }}>
                Item transaksi penjualan tercatat.
              </Box>
            )}

            <Divider sx={{ my: 1.5, borderColor: tokens.colors.neutral[200] }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ color: tokens.colors.neutral[500] }}>Metode Pembayaran</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.colors.neutral[900] }}>
                {selectedTx?.paymentMethod || 'Tunai'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ color: tokens.colors.neutral[500] }}>Total Tagihan</Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: tokens.colors.brand[600], fontFeatureSettings: '"tnum"' }}>
                {formatCurrency(selectedTx?.total || 0)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ color: tokens.colors.neutral[500] }}>Uang Diterima</Typography>
              <Typography variant="body2" sx={{ color: tokens.colors.neutral[800], fontFeatureSettings: '"tnum"' }}>
                {formatCurrency(selectedTx?.paymentAmount || selectedTx?.total || 0)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.colors.success[700] }}>Kembalian</Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: tokens.colors.success[700], fontFeatureSettings: '"tnum"' }}>
                {formatCurrency(selectedTx?.changeAmount || 0)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={() => setDetailModalOpen(false)}
            sx={{ textTransform: 'none', color: tokens.colors.neutral[600], fontWeight: 600 }}
          >
            Tutup
          </Button>
          <Button
            variant="contained"
            onClick={() => window.print()}
            startIcon={<PrintOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: tokens.colors.brand[500],
              fontWeight: 700,
              borderRadius: '8px',
              px: 2.5,
              '&:hover': { bgcolor: tokens.colors.brand[600] },
            }}
          >
            Cetak Struk
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionsPage;

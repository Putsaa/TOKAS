import React, { memo } from 'react';
import {
  Box,
  Card,
  Grid,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
} from '@mui/material';

// Skeleton untuk KPI card ringkasan (misal 4 card di atas dashboard)
export const StatCardSkeleton = ({ count = 4 }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 3.5 }}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={12 / count} key={index}>
          <Card sx={{ p: 2.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 2, flexShrink: 0 }} />
            <Box sx={{ width: '100%' }}>
              <Skeleton variant="text" width="50%" height={16} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="75%" height={32} />
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// Skeleton untuk Tabel (misal data produk, transaksi, kategori)
export const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <Paper elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              {Array.from({ length: columns }).map((_, i) => (
                <TableCell key={i} sx={{ py: 2 }}>
                  <Skeleton variant="text" width="60%" height={20} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: rows }).map((_, r) => (
              <TableRow key={r}>
                {Array.from({ length: columns }).map((_, c) => (
                  <TableCell key={c} sx={{ py: 2 }}>
                    <Skeleton variant="text" width={c === 0 ? '40%' : '80%'} height={22} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

// Skeleton untuk Grafik / Card Konten
export const ChartCardSkeleton = ({ height = 340 }) => {
  return (
    <Card sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      <Skeleton variant="text" width="35%" height={26} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="20%" height={16} sx={{ mb: 2.5 }} />
      <Skeleton variant="rounded" width="100%" height={height} sx={{ borderRadius: 2 }} />
    </Card>
  );
};

// Skeleton untuk Halaman Form (misal Tambah Produk / Stok Masuk)
export const FormSkeleton = ({ fields = 4 }) => {
  return (
    <Card sx={{ p: 3.5, borderRadius: 2.5, maxWidth: 650, mx: 'auto' }}>
      <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={18} sx={{ mb: 3 }} />
      <Stack spacing={2.5}>
        {Array.from({ length: fields }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width="100%" height={48} sx={{ borderRadius: 1.5 }} />
        ))}
        <Skeleton variant="rounded" width="100%" height={44} sx={{ borderRadius: 2, mt: 1 }} />
      </Stack>
    </Card>
  );
};

const AppSkeleton = {
  StatCard: memo(StatCardSkeleton),
  Table: memo(TableSkeleton),
  Chart: memo(ChartCardSkeleton),
  Form: memo(FormSkeleton),
};

export default AppSkeleton;

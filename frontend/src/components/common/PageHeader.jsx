import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import tokens from '../../theme/tokens';

const pathNameMap = {
  '': 'Dashboard',
  'kasir': 'Kasir (POS)',
  'produk': 'Katalog Produk',
  'kategori': 'Kategori Produk',
  'stok-masuk': 'Stok Masuk',
  'penyesuaian-stok': 'Penyesuaian Stok',
  'stok-menipis': 'Peringatan Stok Menipis',
  'transaksi': 'Riwayat Transaksi',
  'laporan': 'Laporan Penjualan',
  'pengguna': 'Manajemen Pengguna',
};

const PageHeader = ({ title, subtitle, action, extra }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <Box sx={{ mb: 2.75 }}>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: '0.85rem', color: tokens.colors.neutral[400] }} />}
          aria-label="breadcrumb"
        >
          <Link
            component={RouterLink}
            underline="hover"
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: tokens.colors.neutral[500],
              fontSize: '0.78rem',
              fontWeight: 500,
              '&:hover': { color: tokens.colors.brand[500] },
            }}
          >
            <HomeOutlinedIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
            Home
          </Link>
          {pathnames.map((value, index) => {
            const isLast = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            const label = pathNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

            return isLast ? (
              <Typography
                key={to}
                sx={{
                  fontSize: '0.78rem',
                  color: tokens.colors.neutral[700],
                  fontWeight: 600,
                }}
              >
                {label}
              </Typography>
            ) : (
              <Link
                component={RouterLink}
                underline="hover"
                to={to}
                key={to}
                sx={{
                  fontSize: '0.78rem',
                  color: tokens.colors.neutral[500],
                  fontWeight: 500,
                  '&:hover': { color: tokens.colors.brand[500] },
                }}
              >
                {label}
              </Link>
            );
          })}
        </Breadcrumbs>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1.5,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 800,
              color: tokens.colors.neutral[900],
              fontSize: { xs: '1.25rem', sm: '1.45rem' },
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: tokens.colors.neutral[500],
                fontSize: '0.825rem',
                mt: 0.35,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {(action || extra) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
            {extra}
            {action}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;

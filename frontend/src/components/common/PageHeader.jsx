import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

const pathNameMap = {
  '': 'Dashboard',
  'kasir': 'Kasir',
  'produk': 'Produk',
  'kategori': 'Kategori',
  'stok-masuk': 'Stok Masuk',
  'penyesuaian-stok': 'Penyesuaian Stok',
  'stok-menipis': 'Stok Menipis',
  'transaksi': 'Transaksi',
  'laporan': 'Laporan',
  'pengguna': 'Pengguna',
};

const PageHeader = ({ title, subtitle, action }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <Box mb={4}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom={!!subtitle}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && (
          <Box>
            {action}
          </Box>
        )}
      </Box>
      
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
        <Link 
          component={RouterLink} 
          underline="hover" 
          color="inherit" 
          to="/" 
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const label = pathNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

          return last ? (
            <Typography color="primary" key={to} fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
              {label}
            </Typography>
          ) : (
            <Link component={RouterLink} underline="hover" color="inherit" to={to} key={to} sx={{ display: 'flex', alignItems: 'center' }}>
              {label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default PageHeader;

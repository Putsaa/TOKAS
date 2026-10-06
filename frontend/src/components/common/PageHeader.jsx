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
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', mb: subtitle || action ? 1.5 : 0 }}>
        {title && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: '1rem',
                color: 'text.primary',
                textTransform: 'capitalize'
              }}
            >
              {title}
            </Typography>
            <Typography
              component="span"
              sx={{
                mx: 1.5,
                color: 'text.disabled',
                fontWeight: 300,
                fontSize: '1rem'
              }}
            >
              |
            </Typography>
          </Box>
        )}
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: '1rem', color: 'text.disabled' }} />}
          aria-label="breadcrumb"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Link 
            component={RouterLink} 
            underline="hover" 
            color="primary" 
            to="/" 
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ fontSize: '1.2rem' }} color="primary" />
          </Link>
          {pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            const label = pathNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

            return last ? (
              <Typography
                key={to}
                sx={{
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  textTransform: 'capitalize'
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
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  textTransform: 'capitalize'
                }}
              >
                {label}
              </Link>
            );
          })}
        </Breadcrumbs>

        {action && (
          <Box sx={{ ml: 'auto' }}>
            {action}
          </Box>
        )}
      </Box>

      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default PageHeader;

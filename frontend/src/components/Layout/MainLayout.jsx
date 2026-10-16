import React, { useState, useMemo } from 'react';
import {
  Box, Drawer, Toolbar, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Typography
} from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import GridViewIcon from '@mui/icons-material/GridView';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import AppTopbar from '../common/AppTopbar';
import { useAuth } from '../../contexts/AuthContext';
import tokens from '../../theme/tokens';

import tokasLogo from '../../tokas.png';

const drawerWidth = 230;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const userRole = (user?.role || 'Owner').toLowerCase();

  // Role-based Nav Items
  const navSections = useMemo(() => {
    // Kasir only sees POS and Transaction History (Distraction-Free)
    if (userRole === 'kasir') {
      return [
        {
          title: 'OPERASIONAL KASIR',
          items: [
            { text: 'Mesin Kasir (POS)', icon: <PointOfSaleIcon sx={{ fontSize: 20 }} />, path: '/kasir' },
            { text: 'Riwayat Transaksi', icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} />, path: '/transaksi' },
          ],
        },
      ];
    }

    // Admin & Owner navigation
    const sections = [
      {
        title: 'UTAMA',
        items: [
          { text: 'Dashboard', icon: <HomeOutlinedIcon sx={{ fontSize: 20 }} />, path: '/' },
          { text: 'Mesin Kasir (POS)', icon: <PointOfSaleIcon sx={{ fontSize: 20 }} />, path: '/kasir' },
        ],
      },
      {
        title: 'INVENTARIS & STOK',
        items: [
          { text: 'Katalog Produk', icon: <Inventory2OutlinedIcon sx={{ fontSize: 20 }} />, path: '/produk' },
          { text: 'Kategori', icon: <GridViewIcon sx={{ fontSize: 20 }} />, path: '/kategori' },
          {
            text: 'Kelola Stok & Opname',
            icon: <TuneOutlinedIcon sx={{ fontSize: 20 }} />,
            path: '/stok',
            activePaths: ['/stok', '/stok-masuk', '/penyesuaian-stok', '/stok-menipis'],
          },
        ],
      },
      {
        title: 'MANAJEMEN & LAPORAN',
        items: [
          { text: 'Riwayat Transaksi', icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} />, path: '/transaksi' },
          ...(userRole === 'owner'
            ? [{ text: 'Laporan Penjualan', icon: <BarChartOutlinedIcon sx={{ fontSize: 20 }} />, path: '/laporan' }]
            : []),
          { text: 'Manajemen Pengguna', icon: <GroupOutlinedIcon sx={{ fontSize: 20 }} />, path: '/pengguna' },
        ],
      },
    ];

    return sections;
  }, [userRole]);

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#ffffff' }}>
      {/* Brand Header */}
      <Toolbar
        sx={{
          height: 64,
          minHeight: '64px !important',
          display: 'flex',
          alignItems: 'center',
          px: 2.5,
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
        }}
      >
        <Box
          component="img"
          src={tokasLogo}
          alt="TOKAS Logo"
          sx={{
            height: 32,
            width: 'auto',
            maxWidth: '160px',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </Toolbar>

      {/* Nav List with Sections */}
      <Box
        sx={{
          px: 1.5,
          py: 2,
          flexGrow: 1,
          overflowY: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {navSections.map((section, sIdx) => (
          <Box key={sIdx} sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                px: 1.5,
                mb: 0.75,
                display: 'block',
                fontWeight: 700,
                color: tokens.colors.neutral[400],
                fontSize: '0.675rem',
                letterSpacing: '0.05em',
              }}
            >
              {section.title}
            </Typography>

            <List disablePadding>
              {section.items.map((item) => {
                const isSelected = item.activePaths
                  ? item.activePaths.includes(location.pathname)
                  : location.pathname === item.path;
                return (
                  <ListItem key={item.text} disablePadding sx={{ mb: 0.4 }}>
                    <ListItemButton
                      onClick={() => {
                        navigate(item.path);
                        if (mobileOpen) setMobileOpen(false);
                      }}
                      selected={isSelected}
                      sx={{
                        borderRadius: '8px',
                        px: 1.5,
                        py: 0.8,
                        minHeight: 38,
                        color: isSelected ? tokens.colors.brand[600] : tokens.colors.neutral[600],
                        bgcolor: isSelected ? `${tokens.colors.brand[50]} !important` : 'transparent',
                        fontWeight: isSelected ? 700 : 500,
                        transition: tokens.transitions.fast,
                        '& .MuiListItemIcon-root': {
                          color: isSelected ? tokens.colors.brand[500] : tokens.colors.neutral[400],
                          minWidth: 30,
                          transition: tokens.transitions.fast,
                        },
                        '&:hover': {
                          bgcolor: isSelected ? tokens.colors.brand[50] : tokens.colors.neutral[50],
                          color: isSelected ? tokens.colors.brand[600] : tokens.colors.neutral[900],
                          '& .MuiListItemIcon-root': {
                            color: isSelected ? tokens.colors.brand[500] : tokens.colors.neutral[700],
                          },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 30 }}>{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.825rem',
                        }}
                      />
                      {item.badge && (
                        <Box
                          sx={{
                            bgcolor: tokens.colors.warning[50],
                            color: tokens.colors.warning[700],
                            border: `1px solid ${tokens.colors.warning[100]}`,
                            borderRadius: '4px',
                            px: 0.7,
                            py: 0.1,
                            fontSize: '0.675rem',
                            fontWeight: 700,
                          }}
                        >
                          {item.badge}
                        </Box>
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Role Notice at Bottom */}
      <Box
        sx={{
          p: 1.5,
          m: 1.5,
          borderRadius: '8px',
          bgcolor: tokens.colors.neutral[50],
          border: `1px solid ${tokens.colors.neutral[200]}`,
        }}
      >
        <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], fontWeight: 600, display: 'block' }}>
          Mode Akses:
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.neutral[900], fontWeight: 700, fontSize: '0.78rem' }}>
          {userRole === 'kasir' ? 'Kasir Bebas Distraksi' : userRole === 'admin' ? 'Administrator Toko' : 'Pemilik (Owner)'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: tokens.colors.neutral[50], minHeight: '100vh' }}>
      <AppTopbar drawerWidth={drawerWidth} onDrawerToggle={handleDrawerToggle} />
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="sidebar">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: `1px solid ${tokens.colors.neutral[200]}`,
              boxShadow: tokens.shadows.dropdown,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: `1px solid ${tokens.colors.neutral[200]}`,
              boxShadow: 'none',
              backgroundColor: '#ffffff',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: tokens.colors.neutral[50],
          minHeight: '100vh',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          p: { xs: 2, sm: 2.5, md: 3 },
        }}
      >
        <Toolbar sx={{ height: 64, minHeight: '64px !important', mb: 1 }} />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;

import React, { useState } from 'react';
import { 
  Box, Drawer, Toolbar, List, 
  ListItem, ListItemButton, ListItemIcon, ListItemText, Divider
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import GridViewIcon from '@mui/icons-material/GridView';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import HistoryIcon from '@mui/icons-material/History';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import AppTopbar from '../common/AppTopbar';

import tokasLogo from '../../tokas.png';

const drawerWidth = 220;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { text: 'Dashboard', icon: <HomeIcon sx={{ fontSize: 20 }} />, path: '/' },
    { text: 'Kasir', icon: <PointOfSaleIcon sx={{ fontSize: 20 }} />, path: '/kasir' },
    { isDivider: true, id: 'div-1' },
    { text: 'Produk', icon: <Inventory2OutlinedIcon sx={{ fontSize: 20 }} />, path: '/produk' },
    { text: 'Kategori', icon: <GridViewIcon sx={{ fontSize: 20 }} />, path: '/kategori' },
    { text: 'Stok Masuk', icon: <FileDownloadIcon sx={{ fontSize: 20 }} />, path: '/stok-masuk' },
    { text: 'Penyesuaian Stok', icon: <HistoryIcon sx={{ fontSize: 20 }} />, path: '/penyesuaian-stok' },
    { text: 'Stok Menipis', icon: <WarningAmberIcon sx={{ fontSize: 20 }} />, path: '/stok-menipis', badge: 3 },
    { isDivider: true, id: 'div-2' },
    { text: 'Riwayat Transaksi', icon: <ArticleOutlinedIcon sx={{ fontSize: 20 }} />, path: '/transaksi' },
    { text: 'Laporan', icon: <BarChartIcon sx={{ fontSize: 20 }} />, path: '/laporan' },
    { text: 'Pengguna', icon: <GroupOutlinedIcon sx={{ fontSize: 20 }} />, path: '/pengguna' },
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#ffffff' }}>
      <Toolbar 
        sx={{ 
          height: 72, 
          minHeight: '72px !important', 
          maxHeight: '72px !important',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          px: 2, 
          py: 0,
        }}
      >
        <Box 
          component="img" 
          src={tokasLogo} 
          alt="TOKAS" 
          sx={{ 
            height: 38, 
            width: 'auto',
            maxWidth: '170px',
            objectFit: 'contain', 
            display: 'block',
          }} 
        />
      </Toolbar>

      <Box 
        sx={{ 
          px: 1.5, 
          py: 1,
          flexGrow: 1, 
          overflowY: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none'
        }}
      >
        <List disablePadding>
          {navItems.map((item) => {
            if (item.isDivider) {
              return (
                <Divider 
                  key={item.id} 
                  sx={{ my: 1, mx: 1, borderColor: '#f1f5f9' }} 
                />
              );
            }

            const isSelected = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.35 }}>
                <ListItemButton 
                  onClick={() => navigate(item.path)}
                  selected={isSelected}
                  sx={{
                    borderRadius: '10px',
                    px: 1.5,
                    py: 0.7,
                    minHeight: 40,
                    color: isSelected ? '#2563eb' : '#64748b',
                    bgcolor: isSelected ? '#eff6ff !important' : 'transparent',
                    fontWeight: isSelected ? 600 : 500,
                    transition: 'all 0.15s ease-in-out',
                    position: 'relative',
                    '& .MuiListItemIcon-root': {
                      color: isSelected ? '#2563eb' : '#94a3b8',
                      minWidth: 32,
                      transition: 'color 0.15s',
                    },
                    '&:hover': {
                      bgcolor: isSelected ? '#eff6ff' : '#f8fafc',
                      color: isSelected ? '#2563eb' : '#0f172a',
                      '& .MuiListItemIcon-root': {
                        color: isSelected ? '#2563eb' : '#2563eb',
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.84rem',
                      letterSpacing: '-0.01em',
                    }} 
                  />
                  {item.badge && (
                    <Box
                      sx={{
                        bgcolor: '#fee2e2',
                        color: '#ef4444',
                        borderRadius: '20px',
                        px: 0.9,
                        py: 0.2,
                        minWidth: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
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
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppTopbar drawerWidth={drawerWidth} onDrawerToggle={handleDrawerToggle} />
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="sidebar"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, 
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid #f1f5f9',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
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
              borderRight: '1px solid #f1f5f9',
              boxShadow: '2px 0 12px rgba(0,0,0,0.03)',
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
          backgroundColor: '#f8fafc', 
          minHeight: '100vh',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          p: { xs: 1.5, sm: 2, md: 2.25 },
        }}
      >
        <Toolbar sx={{ height: 72, minHeight: '72px !important', mb: 1 }} />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;

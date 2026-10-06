import React, { useState } from 'react';
import { 
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, 
  ListItem, ListItemButton, ListItemIcon, ListItemText, Button, useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import AddBoxIcon from '@mui/icons-material/AddBox';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import WarningIcon from '@mui/icons-material/Warning';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

import tokasLogo from '../../tokas.png';

const drawerWidth = 260;

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isOwner = user?.role === 'Owner' || user?.role === 'admin';

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', show: true },
    { text: 'Kasir', icon: <PointOfSaleIcon />, path: '/kasir', show: true },
    { type: 'divider', show: isOwner },
    { text: 'Produk', icon: <InventoryIcon />, path: '/produk', show: isOwner },
    { text: 'Kategori', icon: <CategoryIcon />, path: '/kategori', show: isOwner },
    { type: 'divider', show: isOwner },
    { text: 'Stok Masuk', icon: <AddBoxIcon />, path: '/stok-masuk', show: isOwner },
    { text: 'Penyesuaian Stok', icon: <SettingsBackupRestoreIcon />, path: '/penyesuaian-stok', show: isOwner },
    { text: 'Stok Menipis', icon: <WarningIcon />, path: '/stok-menipis', show: isOwner },
    { type: 'divider', show: isOwner },
    { text: 'Transaksi', icon: <ReceiptIcon />, path: '/transaksi', show: isOwner },
    { text: 'Laporan', icon: <AssessmentIcon />, path: '/laporan', show: isOwner },
    { type: 'divider', show: isOwner },
    { text: 'Pengguna', icon: <PeopleIcon />, path: '/pengguna', show: isOwner },
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ justifyContent: 'center', py: 3, minHeight: '90px !important' }}>
        <Box 
          component="img" 
          src={tokasLogo} 
          alt="TOKAS Logo" 
          sx={{ 
            height: 'auto', 
            width: '80%', 
            maxWidth: 200, 
            objectFit: 'contain' 
          }} 
        />
      </Toolbar>
      <Divider sx={{ mb: 2 }} />
      <List sx={{ px: 2, flexGrow: 1, overflowY: 'auto' }}>
        {menuItems.filter(item => item.show).map((item, index) => {
          if (item.type === 'divider') {
            return <Divider key={`div-${index}`} sx={{ my: 1, mx: -2 }} />;
          }
          
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                onClick={() => navigate(item.path)}
                selected={isSelected}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isSelected ? 'inherit' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '0.95rem'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button 
          fullWidth 
          variant="outlined" 
          color="error" 
          onClick={handleLogout} 
          startIcon={<LogoutIcon />}
          sx={{ borderRadius: 2 }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" noWrap component="div" fontWeight="bold">
              TOKAS POS
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight="medium" color="text.secondary">
              Halo, {user?.name || user?.username}
            </Typography>
            <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              {(user?.name || user?.username || 'U')[0].toUpperCase()}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
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
              borderRight: 'none',
              boxShadow: '4px 0 10px rgba(0,0,0,0.05)'
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
              borderRight: 'none',
              boxShadow: '4px 0 10px rgba(0,0,0,0.05)',
              backgroundColor: 'background.paper',
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
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` }, 
          backgroundColor: 'background.default', 
          minHeight: '100vh' 
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;

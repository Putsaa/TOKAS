import React, { useState } from 'react';
import { 
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, 
  ListItem, ListItemButton, ListItemIcon, ListItemText, Button
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
import { useNavigate, Outlet } from 'react-router-dom';

const drawerWidth = 240;

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
    { text: 'Produk', icon: <InventoryIcon />, path: '/produk', show: isOwner },
    { text: 'Kategori', icon: <CategoryIcon />, path: '/kategori', show: isOwner },
    { text: 'Stok Masuk', icon: <AddBoxIcon />, path: '/stok-masuk', show: isOwner },
    { text: 'Penyesuaian Stok', icon: <SettingsBackupRestoreIcon />, path: '/penyesuaian-stok', show: isOwner },
    { text: 'Stok Menipis', icon: <WarningIcon />, path: '/stok-menipis', show: isOwner },
    { text: 'Transaksi', icon: <ReceiptIcon />, path: '/transaksi', show: isOwner },
    { text: 'Laporan', icon: <AssessmentIcon />, path: '/laporan', show: isOwner },
    { text: 'Pengguna', icon: <PeopleIcon />, path: '/pengguna', show: isOwner },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          TOKAS
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.filter(item => item.show).map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
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
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Sistem Kasir Toko
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, backgroundColor: 'background.default', minHeight: '100vh' }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;

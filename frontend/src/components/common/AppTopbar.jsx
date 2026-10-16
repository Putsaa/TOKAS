import React, { memo } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import StorefrontIcon from '@mui/icons-material/Storefront';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import tokens from '../../theme/tokens';
import StatusBadge from './StatusBadge';

const AppTopbar = ({ drawerWidth, onDrawerToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const displayName = user?.name || user?.username || 'Pengguna';
  const roleName = user?.role || 'Owner';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const getRoleVariant = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'owner') return 'info';
    if (r === 'admin') return 'neutral';
    if (r === 'kasir') return 'success';
    return 'neutral';
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: '#ffffff',
        color: tokens.colors.neutral[800],
        borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ height: 64, px: { xs: 2, sm: 3 }, justifyContent: 'space-between' }}>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ mr: 0.5, display: { sm: 'none' }, color: tokens.colors.neutral[600] }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: tokens.colors.brand[50],
                color: tokens.colors.brand[500],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <StorefrontIcon sx={{ fontSize: 19 }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                noWrap
                component="div"
                sx={{
                  fontWeight: 800,
                  color: tokens.colors.neutral[900],
                  fontSize: '0.925rem',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}
              >
                TOKAS POS
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.68rem',
                  color: tokens.colors.success[600],
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          
          {location.pathname !== '/kasir' && (
            <Box
              onClick={() => navigate('/kasir')}
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.6,
                borderRadius: '8px',
                bgcolor: tokens.colors.brand[50],
                color: tokens.colors.brand[600],
                border: `1px solid ${tokens.colors.brand[100]}`,
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 700,
                transition: tokens.transitions.fast,
                '&:hover': {
                  bgcolor: tokens.colors.brand[100],
                  borderColor: tokens.colors.brand[200],
                },
              }}
            >
              <PointOfSaleIcon sx={{ fontSize: 16 }} />
              Buka Kasir
            </Box>
          )}

          <Box
            onClick={handleMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              cursor: 'pointer',
              p: 0.5,
              pl: 1,
              borderRadius: '10px',
              border: `1px solid transparent`,
              transition: tokens.transitions.fast,
              '&:hover': {
                bgcolor: tokens.colors.neutral[50],
                borderColor: tokens.colors.neutral[200],
              },
            }}
          >
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: tokens.colors.neutral[900],
                  fontSize: '0.825rem',
                  lineHeight: 1.2,
                }}
              >
                {displayName}
              </Typography>
              <Box sx={{ mt: 0.25 }}>
                <StatusBadge
                  label={roleName}
                  variant={getRoleVariant(roleName)}
                  size="small"
                />
              </Box>
            </Box>

            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: tokens.colors.brand[500],
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
              }}
            >
              {avatarLetter}
            </Avatar>

            <KeyboardArrowDownIcon sx={{ color: tokens.colors.neutral[400], fontSize: 18 }} />
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.2,
              minWidth: 200,
              borderRadius: '12px',
              boxShadow: tokens.shadows.dropdown,
              border: `1px solid ${tokens.colors.neutral[200]}`,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.25, display: { sm: 'none' } }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Role: {roleName}
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Box>
          <MenuItem onClick={() => navigate('/pengguna')}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Profil Pengguna" primaryTypographyProps={{ fontSize: '0.84rem' }} />
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={handleLogout} sx={{ color: tokens.colors.danger[600] }}>
            <ListItemIcon sx={{ color: tokens.colors.danger[600] }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Keluar (Logout)" primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: 600 }} />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default memo(AppTopbar);

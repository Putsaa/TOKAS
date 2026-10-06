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
  Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import StorefrontIcon from '@mui/icons-material/Storefront';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AppTopbar = ({ drawerWidth, onDrawerToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  const displayName = user?.name || user?.username || 'Owner';
  const roleName = user?.role || 'Owner';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: '#ffffff',
        color: '#1e293b',
        borderBottom: '1px solid #f1f5f9',
      }}
    >
      <Toolbar sx={{ height: 72, px: { xs: 2, sm: 3.5 }, justifyContent: 'space-between' }}>
        {/* Left: Mobile hamburger & Store Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ mr: 1, display: { sm: 'none' }, color: '#475569' }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <StorefrontIcon sx={{ color: '#2563eb', fontSize: 22 }} />
            <Typography
              variant="subtitle1"
              noWrap
              component="div"
              sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.975rem', letterSpacing: '-0.01em' }}
            >
              TOKAS POS
            </Typography>
          </Box>
        </Box>

        {/* Right Section: Notification + Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>

          {/* Notification Bell */}
          <IconButton
            sx={{
              color: '#64748b',
              bgcolor: 'transparent',
              p: 1,
              '&:hover': { bgcolor: '#f1f5f9', color: '#1e293b' }
            }}
          >
            <Badge
              variant="dot"
              sx={{
                '& .MuiBadge-badge': {
                  bgcolor: '#ef4444',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  top: 4,
                  right: 4
                }
              }}
            >
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>

          {/* User Profile dropdown */}
          <Box
            onClick={handleMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              cursor: 'pointer',
              p: 0.5,
              pl: 1,
              borderRadius: '12px',
              transition: 'background 0.15s ease-in-out',
              '&:hover': { bgcolor: '#f8fafc' },
            }}
          >
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem', lineHeight: 1.2 }}>
                {displayName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                {roleName}
              </Typography>
            </Box>

            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#2563eb',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 700,
              }}
            >
              {avatarLetter}
            </Avatar>

            <KeyboardArrowDownIcon sx={{ color: '#64748b', fontSize: 18 }} />
          </Box>
        </Box>

        {/* User Menu Modal */}
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
              mt: 1.5,
              minWidth: 190,
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #f1f5f9',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.25, display: { sm: 'none' } }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {roleName}
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Box>
          <MenuItem onClick={() => navigate('/pengguna')}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Profil Pengguna" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }} />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default memo(AppTopbar);

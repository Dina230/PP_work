import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Divider,
  Typography,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  LocalShipping as BatchesIcon,
  CompareArrows as MovementsIcon,
  Assignment as InventoryIcon2,
  Delete as WriteOffIcon,
  Assessment as ReportsIcon,
  AdminPanelSettings as AdminIcon,
  Notifications as NotificationsIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';

const Sidebar = ({ mobileOpen, handleDrawerToggle, drawerWidth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    { text: 'Дашборд', icon: <DashboardIcon />, path: '/dashboard', roles: ['admin', 'manager', 'user'] },
    { text: 'Товары', icon: <InventoryIcon />, path: '/products', roles: ['admin', 'manager', 'user'] },
    { text: 'Партии', icon: <BatchesIcon />, path: '/batches', roles: ['admin', 'manager', 'user'] },
    { text: 'Движения', icon: <MovementsIcon />, path: '/movements', roles: ['admin', 'manager', 'user'] },
    { text: 'Инвентаризация', icon: <InventoryIcon2 />, path: '/inventory', roles: ['admin', 'manager'] },
    { text: 'Списания', icon: <WriteOffIcon />, path: '/writeoffs', roles: ['admin', 'manager'] },
    { text: 'Отчёты', icon: <ReportsIcon />, path: '/reports', roles: ['admin', 'manager'] },
    { text: 'Уведомления', icon: <NotificationsIcon />, path: '/notifications', roles: ['admin', 'manager', 'user'] },
    { text: 'Категории', icon: <CategoryIcon />, path: '/categories', roles: ['admin'] },
    { text: 'Администрирование', icon: <AdminIcon />, path: '/admin', roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(user?.role || 'user')
  );

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          WMS System
        </Typography>
      </Toolbar>
      <Divider />

      {/* User Info */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </Avatar>
        <Box>
          <Typography variant="subtitle2">{user?.username}</Typography>
          <Typography variant="caption" color="textSecondary">
            {user?.role === 'admin' ? 'Администратор' :
             user?.role === 'manager' ? 'Менеджер' : 'Пользователь'}
          </Typography>
        </Box>
      </Box>
      <Divider />

      <List sx={{ flex: 1, pt: 2 }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&.Mui-selected:hover': {
                  bgcolor: 'primary.main',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="textSecondary">
          Версия 1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
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
  );
};

export default Sidebar;
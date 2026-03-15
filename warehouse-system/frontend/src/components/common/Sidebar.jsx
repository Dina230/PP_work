import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  LocalShipping as BatchesIcon,
  CompareArrows as MovementsIcon,
  Assignment as InventoryIcon2,
  Delete as WriteOffIcon,
  Assessment as ReportsIcon,
  Notifications as NotificationsIcon,
  Category as CategoryIcon,
  Warehouse as WarehouseIcon,
  Business as SupplierIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';

const Sidebar = ({ mobileOpen, handleDrawerToggle, drawerWidth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [openMenus, setOpenMenus] = useState({});

  const handleMenuClick = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const menuItems = [
    { text: 'Дашборд', icon: <DashboardIcon />, path: '/dashboard' },
    {
      text: 'Склад',
      icon: <InventoryIcon />,
      submenu: [
        { text: 'Товары', path: '/products', icon: <InventoryIcon /> },
        { text: 'Категории', path: '/categories', icon: <CategoryIcon /> },
        { text: 'Партии', path: '/batches', icon: <BatchesIcon /> },
        { text: 'Склады', path: '/warehouses', icon: <WarehouseIcon /> },
        { text: 'Поставщики', path: '/suppliers', icon: <SupplierIcon /> },
      ]
    },
    {
      text: 'Операции',
      icon: <MovementsIcon />,
      submenu: [
        { text: 'Движения', path: '/movements', icon: <MovementsIcon /> },
        { text: 'Инвентаризация', path: '/inventory', icon: <InventoryIcon2 /> },
        { text: 'Списания', path: '/writeoffs', icon: <WriteOffIcon /> },
      ]
    },
    { text: 'Отчёты', icon: <ReportsIcon />, path: '/reports' },
    { text: 'Уведомления', icon: <NotificationsIcon />, path: '/notifications' },
  ];

  const isActive = (path) => location.pathname === path;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        <Typography variant="h6" color="primary" fontWeight="700">
          WMS System
        </Typography>
      </Toolbar>
      <Divider />

      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </Avatar>
        <Box>
          <Typography variant="subtitle2">{user?.username}</Typography>
          <Typography variant="caption" color="textSecondary">
            {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
          </Typography>
        </Box>
      </Box>
      <Divider />

      <List sx={{ flex: 1, pt: 2, px: 1 }}>
        {menuItems.map((item) => {
          if (item.submenu) {
            return (
              <React.Fragment key={item.text}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleMenuClick(item.text)}>
                    <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                    {openMenus[item.text] ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={openMenus[item.text]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.submenu.map((subItem) => (
                      <ListItem key={subItem.text} disablePadding>
                        <ListItemButton
                          onClick={() => navigate(subItem.path)}
                          selected={isActive(subItem.path)}
                          sx={{ pl: 4 }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText primary={subItem.text} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          }

          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={isActive(item.path)}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
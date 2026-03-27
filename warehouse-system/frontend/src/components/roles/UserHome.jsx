import React from 'react';
import { Box, Paper, Typography, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import InventoryIcon from '@mui/icons-material/Inventory';
import NotificationsIcon from '@mui/icons-material/Notifications';

const UserHome = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Личный кабинет
      </Typography>
      <Typography color="textSecondary" paragraph>
        Доступ к просмотру номенклатуры и уведомлениям. Изменение справочников и критичных операций может быть ограничено политикой организации.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Разделы
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<InventoryIcon />}
              onClick={() => navigate('/products')}
              sx={{ mb: 1 }}
            >
              Товары
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<NotificationsIcon />}
              onClick={() => navigate('/notifications')}
            >
              Уведомления
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body1">
              При необходимости администратор может повысить вашу роль до «Менеджер» для работы с движениями и отчётами.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserHome;

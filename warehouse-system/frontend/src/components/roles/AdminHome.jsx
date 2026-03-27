import React from 'react';
import { Box, Paper, Typography, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import DashboardIcon from '@mui/icons-material/Dashboard';

const AdminHome = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Панель администратора
      </Typography>
      <Typography color="textSecondary" paragraph>
        Полный доступ к системе: пользователи, аудит, склад и отчёты.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Быстрые действия
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{ mb: 1 }}
            >
              Аналитика (дашборд)
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PeopleIcon />}
              onClick={() => navigate('/admin/users')}
              sx={{ mb: 1 }}
            >
              Пользователи
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => navigate('/audit-logs')}
            >
              Журнал аудита
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body1">
              Используйте меню слева для работы со складом, операциями и отчётами. Разделы
              «Пользователи» и «Аудит» доступны только администраторам.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminHome;

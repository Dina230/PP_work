import React from 'react';
import { Box, Paper, Typography, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardIcon from '@mui/icons-material/Dashboard';

const ManagerHome = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Рабочее место менеджера
      </Typography>
      <Typography color="textSecondary" paragraph>
        Управление складом, движениями, инвентаризацией и списаниями. Управление пользователями недоступно.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Частые задачи
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{ mb: 1 }}
            >
              Дашборд
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<CompareArrowsIcon />}
              onClick={() => navigate('/movements')}
              sx={{ mb: 1 }}
            >
              Движения
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AssessmentIcon />}
              onClick={() => navigate('/reports')}
            >
              Отчёты
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body1">
              Откройте разделы «Склад» и «Операции» в меню для ежедневной работы с остатками и документами.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManagerHome;

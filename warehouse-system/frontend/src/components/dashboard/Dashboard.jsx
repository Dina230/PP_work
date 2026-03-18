import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Warehouse as WarehouseIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';

const StatCard = ({ title, value, icon, color, bgColor }) => (
  <Card sx={{ bgcolor: bgColor }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="textSecondary" variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" sx={{ color, fontWeight: 'bold' }}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ color }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [movements, setMovements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, movementsRes, categoriesRes] = await Promise.all([
          api.get('/dashboard/stats/'),
          api.get('/dashboard/movements/'),
          api.get('/dashboard/categories/'),
        ]);

        setStats(statsRes.data);
        setMovements(movementsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        showNotification('Ошибка загрузки данных', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // ⚠️ ПУСТОЙ МАССИВ = выполняется только 1 раз при монтировании

  const COLORS = ['#1976d2', '#dc004e', '#ed6c02', '#2e7d32', '#9c27b0'];

  if (loading) return <LinearProgress />;

  const statCards = [
    {
      title: 'Всего товаров',
      value: stats?.total_products || 0,
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      bgColor: '#e3f2fd',
    },
    {
      title: 'Заканчиваются',
      value: stats?.low_stock || 0,
      icon: <WarningIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      bgColor: '#fff3e0',
    },
    {
      title: 'Истекает срок',
      value: stats?.expiring_soon || 0,
      icon: <WarningIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      bgColor: '#ffebee',
    },
    {
      title: 'Движений сегодня',
      value: stats?.today_movements || 0,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      bgColor: '#e8f5e8',
    },
    {
      title: 'Активных складов',
      value: stats?.active_warehouses || 0,
      icon: <WarehouseIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      bgColor: '#f3e5f5',
    },
    {
      title: 'Активных инвентаризаций',
      value: stats?.active_inventories || 0,
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      bgColor: '#ffebee',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Панель управления
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <StatCard {...card} />
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Движения товаров за неделю
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={movements}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="receipt" fill="#2e7d32" name="Поступления" />
                  <Bar dataKey="shipment" fill="#d32f2f" name="Отгрузки" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Товары по категориям
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
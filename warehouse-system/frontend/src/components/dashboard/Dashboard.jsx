import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  Inventory,
  Warning,
  TrendingUp,
  Assignment,
  Warehouse,
  Category,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

const StatCard = ({ title, value, icon, color, bgColor, onClick }) => (
  <Card
    sx={{
      bgcolor: bgColor,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s',
      '&:hover': onClick ? {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      } : {},
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ color, fontWeight: 'bold' }}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ color }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [movements, setMovements] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, movementsRes, categoriesRes] = await Promise.all([
        api.get('/dashboard/stats/'),
        api.get('/dashboard/movements/'),
        api.get('/dashboard/categories/'),
      ]);
      setStats(statsRes.data);
      setMovements(movementsRes.data);
      setCategoryStats(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#1976d2', '#dc004e', '#ed6c02', '#2e7d32', '#9c27b0', '#d32f2f'];

  if (loading) return <LinearProgress />;

  const statCards = [
    {
      title: 'Всего товаров',
      value: stats?.total_products || 0,
      icon: <Inventory sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      bgColor: '#e3f2fd',
      onClick: () => navigate('/products'),
    },
    {
      title: 'Заканчиваются',
      value: stats?.low_stock || 0,
      icon: <Warning sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      bgColor: '#fff3e0',
      onClick: () => navigate('/products?filter=low_stock'),
    },
    {
      title: 'Истекает срок',
      value: stats?.expiring_soon || 0,
      icon: <Warning sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      bgColor: '#ffebee',
      onClick: () => navigate('/batches?filter=expiring'),
    },
    {
      title: 'Движений сегодня',
      value: stats?.today_movements || 0,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      bgColor: '#e8f5e8',
      onClick: () => navigate('/movements'),
    },
    {
      title: 'Активных складов',
      value: stats?.active_warehouses || 0,
      icon: <Warehouse sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      bgColor: '#f3e5f5',
      onClick: () => navigate('/warehouses'),
    },
    {
      title: 'Активных инвентаризаций',
      value: stats?.active_inventories || 0,
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      bgColor: '#ffebee',
      onClick: () => navigate('/inventory'),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Добро пожаловать, {user?.first_name || user?.username}!
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Статистика */}
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <StatCard {...card} />
          </Grid>
        ))}

        {/* График движений */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Движения товаров за последние 7 дней
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={movements}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="receipt" fill="#4caf50" name="Поступления" />
                  <Bar dataKey="shipment" fill="#f44336" name="Отгрузки" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Круговая диаграмма категорий */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Товары по категориям
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Последние движения */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Последние движения
            </Typography>
            {/* Таблица с последними движениями */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
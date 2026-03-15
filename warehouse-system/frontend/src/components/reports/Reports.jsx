import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  LinearProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Warehouse as WarehouseIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Paper sx={{ p: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="caption" color="textSecondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="textSecondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={{ color }}>{icon}</Box>
    </Box>
  </Paper>
);

const Reports = () => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [movements, setMovements] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, movementsRes, categoriesRes] = await Promise.all([
          api.get('/dashboard/stats/'),
          api.get('/dashboard/movements/'),
          api.get('/dashboard/categories/'),
        ]);
        setStats(statsRes.data);
        setMovements(movementsRes.data);
        setCategories(categoriesRes.data);
      } catch {
        showNotification('Ошибка загрузки отчётов', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showNotification]);

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Отчёты и аналитика
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <StatCard
                title="Всего товаров"
                value={stats?.total_products ?? 0}
                icon={<InventoryIcon sx={{ fontSize: 36 }} />}
                color="#1976d2"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatCard
                title="Товары с низким остатком"
                value={stats?.low_stock ?? 0}
                icon={<WarningIcon sx={{ fontSize: 36 }} />}
                color="#ed6c02"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatCard
                title="Истекает срок годности"
                value={stats?.expiring_soon ?? 0}
                icon={<WarningIcon sx={{ fontSize: 36 }} />}
                color="#d32f2f"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatCard
                title="Активные склады"
                value={stats?.active_warehouses ?? 0}
                icon={<WarehouseIcon sx={{ fontSize: 36 }} />}
                color="#2e7d32"
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Товары по категориям
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Категория</TableCell>
                  <TableCell align="right">Кол-во товаров</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.name}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell align="right">{c.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Движения за последнюю неделю
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell align="right">Поступление</TableCell>
                  <TableCell align="right">Отгрузка</TableCell>
                  <TableCell align="right">Баланс</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movements.map((m) => {
                  const receipt = m.receipt || 0;
                  const shipment = m.shipment || 0;
                  const balance = receipt - shipment;
                  return (
                    <TableRow key={m.date}>
                      <TableCell>{m.date}</TableCell>
                      <TableCell align="right">{receipt}</TableCell>
                      <TableCell align="right">{shipment}</TableCell>
                      <TableCell align="right">{balance}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;


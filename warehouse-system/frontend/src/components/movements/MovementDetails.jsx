import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';

const MovementDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [movement, setMovement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovement = async () => {
      try {
        const res = await api.get(`/movements/${id}/`);
        setMovement(res.data);
      } catch (error) {
        showNotification('Ошибка загрузки движения', 'error');
        navigate('/movements');
      } finally {
        setLoading(false);
      }
    };

    fetchMovement();
  }, [id, navigate, showNotification]);

  const getTypeChip = (type) => {
    switch (type) {
      case 'receipt':
        return <Chip label="Поступление" color="success" />;
      case 'shipment':
        return <Chip label="Отгрузка" color="error" />;
      case 'transfer':
        return <Chip label="Перемещение" color="info" />;
      default:
        return <Chip label={type} />;
    }
  };

  if (loading) return <LinearProgress />;
  if (!movement) return <Typography>Не найдено</Typography>;

  return (
    <Box>
      <AppBar position="static" color="default" sx={{ mb: 3 }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/movements')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>
            Движение #{movement.document_number}
          </Typography>
          <Box sx={{ ml: 2 }}>
            {getTypeChip(movement.movement_type)}
          </Box>
        </Toolbar>
      </AppBar>

      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary">Дата документа</Typography>
            <Typography>
              {movement.document_date
                ? new Date(movement.document_date).toLocaleDateString()
                : '—'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary">Создано</Typography>
            <Typography>
              {movement.created_at
                ? new Date(movement.created_at).toLocaleString()
                : '—'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary">Товар</Typography>
            <Typography>{movement.product_name}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary">Партия</Typography>
            <Typography>{movement.batch_number}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary">Откуда</Typography>
            <Typography>{movement.from_warehouse_name || '—'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary">Куда</Typography>
            <Typography>{movement.to_warehouse_name || '—'}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary">Количество</Typography>
            <Typography fontWeight="600">{movement.quantity}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary">Ответственный</Typography>
            <Typography>{movement.created_by_name}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography color="textSecondary">Примечание</Typography>
            <Typography>{movement.notes || '—'}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default MovementDetails;


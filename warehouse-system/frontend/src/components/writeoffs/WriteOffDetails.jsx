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
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';

const WriteOffDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [writeoff, setWriteoff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWriteoff = async () => {
      try {
        const res = await api.get(`/writeoffs/${id}/`);
        setWriteoff(res.data);
      } catch (error) {
        showNotification('Ошибка загрузки списания', 'error');
        navigate('/writeoffs');
      } finally {
        setLoading(false);
      }
    };

    fetchWriteoff();
  }, [id, navigate, showNotification]);

  const getStatusChip = (status) => {
    switch (status?.code) {
      case 'pending':
        return <Chip label="Ожидает" color="warning" />;
      case 'approved':
        return <Chip label="Утверждено" color="success" />;
      case 'rejected':
        return <Chip label="Отклонено" color="error" />;
      default:
        return <Chip label={status?.name || 'Неизвестно'} />;
    }
  };

  if (loading) return <LinearProgress />;
  if (!writeoff) return <Typography>Не найдено</Typography>;

  return (
    <Box>
      <AppBar position="static" color="default" sx={{ mb: 3 }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/writeoffs')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>
            Списание #{writeoff.document_number}
          </Typography>
          <Box sx={{ ml: 2 }}>
            {getStatusChip(writeoff.status)}
          </Box>
        </Toolbar>
      </AppBar>

      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary">Дата документа</Typography>
            <Typography>
              {writeoff.document_date
                ? new Date(writeoff.document_date).toLocaleDateString()
                : '—'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary">Создано</Typography>
            <Typography>
              {writeoff.created_at
                ? new Date(writeoff.created_at).toLocaleString()
                : '—'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary">Товар</Typography>
            <Typography>{writeoff.product_name}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary">Партия</Typography>
            <Typography>{writeoff.batch_number}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary">Количество</Typography>
            <Typography fontWeight="600">{writeoff.quantity}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary">Инициатор</Typography>
            <Typography>{writeoff.created_by_name}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary">Утвердил</Typography>
            <Typography>{writeoff.approved_by_name || '—'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary">Дата утверждения</Typography>
            <Typography>
              {writeoff.approved_at
                ? new Date(writeoff.approved_at).toLocaleString()
                : '—'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography color="textSecondary">Причина списания</Typography>
            <Typography>{writeoff.reason}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default WriteOffDetails;


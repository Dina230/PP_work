import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';

const ACTION_LABELS = {
  create: 'Создание',
  update: 'Изменение',
  delete: 'Удаление',
  login: 'Вход',
  logout: 'Выход',
  view: 'Просмотр',
};

const ACTION_COLORS = {
  create: 'success',
  update: 'info',
  delete: 'error',
  login: 'primary',
  logout: 'default',
  view: 'default',
};

const AuditLogs = () => {
  const { showNotification } = useNotification();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [model, setModel] = useState('');

  const fetchLogs = async () => {
    try {
      const params = {};
      if (action) params.action = action;
      if (model) params.model = model;
      const res = await api.get('/audit-logs/', { params });
      setItems(res.data.results || res.data);
    } catch {
      showNotification('Ошибка загрузки журнала аудита', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [action, model]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Аудит действий
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Тип действия"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="create">Создание</MenuItem>
              <MenuItem value="update">Изменение</MenuItem>
              <MenuItem value="delete">Удаление</MenuItem>
              <MenuItem value="login">Вход</MenuItem>
              <MenuItem value="logout">Выход</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Модель (например, product)"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <LinearProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Дата</TableCell>
                <TableCell>Пользователь</TableCell>
                <TableCell>Действие</TableCell>
                <TableCell>Модель</TableCell>
                <TableCell>ID объекта</TableCell>
                <TableCell>Новые данные</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
                  <TableCell>{row.user_name || 'system'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={ACTION_LABELS[row.action] || row.action}
                      color={ACTION_COLORS[row.action] || 'default'}
                    />
                  </TableCell>
                  <TableCell>{row.content_type_name}</TableCell>
                  <TableCell>{row.object_id}</TableCell>
                  <TableCell sx={{ maxWidth: 420 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {row.new_value || row.old_value || '—'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AuditLogs;


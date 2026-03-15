import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Chip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';

const InventoriesTable = () => {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const fetchInventories = async () => {
    try {
      const response = await api.get('/inventories/');
      setInventories(response.data.results || response.data);
    } catch (error) {
      showNotification('Ошибка загрузки инвентаризаций', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  const handleStart = async (id) => {
    try {
      await api.post(`/inventories/${id}/start/`);
      showNotification('Инвентаризация начата', 'success');
      fetchInventories();
    } catch (error) {
      showNotification('Ошибка', 'error');
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.post(`/inventories/${id}/complete/`);
      showNotification('Инвентаризация завершена', 'success');
      fetchInventories();
    } catch (error) {
      showNotification('Ошибка', 'error');
    }
  };

  const getStatusChip = (status) => {
    switch(status?.code) {
      case 'pending':
        return <Chip label="Ожидает" color="default" size="small" />;
      case 'in_progress':
        return <Chip label="В процессе" color="warning" size="small" />;
      case 'completed':
        return <Chip label="Завершена" color="success" size="small" />;
      default:
        return <Chip label={status?.name || 'Неизвестно'} size="small" />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Инвентаризация</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchInventories}
            sx={{ mr: 2 }}
          >
            Обновить
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            href="/inventory/new"
          >
            Начать
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Номер</TableCell>
              <TableCell>Склад</TableCell>
              <TableCell>Дата начала</TableCell>
              <TableCell>Дата окончания</TableCell>
              <TableCell>Позиций</TableCell>
              <TableCell>Расхождения</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Прогресс</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventories.map((inv) => {
              const totalItems = inv.items?.length || 0;
              const countedItems = inv.items?.filter(i => i.actual_quantity !== null).length || 0;
              const progress = totalItems ? (countedItems / totalItems) * 100 : 0;
              const discrepancies = inv.items?.filter(i => i.difference !== 0).length || 0;

              return (
                <TableRow key={inv.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {inv.inventory_number}
                    </Typography>
                  </TableCell>
                  <TableCell>{inv.warehouse_name}</TableCell>
                  <TableCell>{new Date(inv.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{inv.end_date ? new Date(inv.end_date).toLocaleDateString() : '—'}</TableCell>
                  <TableCell align="center">{totalItems}</TableCell>
                  <TableCell>
                    {discrepancies > 0 ? (
                      <Chip label={discrepancies} color="error" size="small" />
                    ) : '0'}
                  </TableCell>
                  <TableCell>{getStatusChip(inv.status)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ width: 100, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2">{Math.round(progress)}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" href={`/inventory/${inv.id}`}>
                      <VisibilityIcon />
                    </IconButton>
                    {inv.status?.code === 'pending' && (
                      <IconButton size="small" color="success" onClick={() => handleStart(inv.id)}>
                        <StartIcon />
                      </IconButton>
                    )}
                    {inv.status?.code === 'in_progress' && (
                      <IconButton size="small" color="primary" onClick={() => handleComplete(inv.id)}>
                        <CompleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InventoriesTable;
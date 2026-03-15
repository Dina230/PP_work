import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  AppBar,
  Toolbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CompleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';

const InventoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [inventory, setInventory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [batches, setBatches] = useState([]);
  const [newItem, setNewItem] = useState({
    batch: '',
    expected_quantity: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const invRes = await api.get(`/inventories/${id}/`);
      setInventory(invRes.data);

      const itemsRes = await api.get(`/inventories/${id}/items/`);
      setItems(itemsRes.data.results || itemsRes.data);

      // Загружаем партии для ручного/авто заполнения
      const batchesRes = await api.get('/batches/');
      const allBatches = batchesRes.data.results || batchesRes.data;
      // Фильтруем по складу инвентаризации
      const invWarehouse = invRes.data.warehouse;
      setBatches(allBatches.filter(b => b.warehouse === invWarehouse));
    } catch (error) {
      showNotification('Ошибка загрузки', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, value) => {
    setUpdating(prev => ({ ...prev, [itemId]: true }));
    try {
      await api.patch(`/inventory-items/${itemId}/`, { actual_quantity: parseInt(value) });
      showNotification('Сохранено', 'success');
      fetchData();
    } catch (error) {
      showNotification('Ошибка', 'error');
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleComplete = async () => {
    try {
      await api.post(`/inventories/${id}/complete/`);
      showNotification('Инвентаризация завершена', 'success');
      navigate('/inventory');
    } catch (error) {
      showNotification('Ошибка', 'error');
    }
  };

  const handlePopulateFromStock = async () => {
    try {
      await api.post(`/inventories/${id}/populate_from_stock/`);
      showNotification('Позиции добавлены по остаткам склада', 'success');
      fetchData();
    } catch (error) {
      showNotification('Ошибка автозаполнения', 'error');
    }
  };

  const selectedBatch = batches.find(b => b.id === newItem.batch);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedBatch || !newItem.expected_quantity) {
      showNotification('Выберите партию и ожидаемое количество', 'warning');
      return;
    }
    try {
      await api.post(`/inventories/${id}/add_item/`, {
        product: selectedBatch.product,
        batch: selectedBatch.id,
        expected_quantity: Number(newItem.expected_quantity),
        notes: newItem.notes || '',
      });
      showNotification('Позиция добавлена', 'success');
      setNewItem({ batch: '', expected_quantity: '', notes: '' });
      fetchData();
    } catch (error) {
      showNotification('Ошибка добавления позиции', 'error');
    }
  };

  if (loading) return <LinearProgress />;
  if (!inventory) return <Typography>Не найдено</Typography>;

  const counted = items.filter(i => i.actual_quantity !== null).length;
  const progress = items.length ? (counted / items.length) * 100 : 0;
  const discrepancies = items.filter(i => i.difference !== 0).length;

  return (
    <Box>
      <AppBar position="static" color="default" sx={{ mb: 3 }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/inventory')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>
            Инвентаризация {inventory.inventory_number}
          </Typography>
          <Chip
            label={inventory.status?.name}
            color={inventory.status?.code === 'completed' ? 'success' : 'warning'}
            sx={{ ml: 2 }}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            color="primary"
            onClick={handlePopulateFromStock}
            sx={{ mr: 2 }}
          >
            Заполнить из остатков
          </Button>
        </Toolbar>
      </AppBar>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography color="textSecondary">Склад</Typography>
                <Typography>{inventory.warehouse_name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="textSecondary">Дата начала</Typography>
                <Typography>{new Date(inventory.start_date).toLocaleString()}</Typography>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Прогресс</Typography>
                <Typography>{counted}/{items.length} ({Math.round(progress)}%)</Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
            </Box>

            {/* Форма добавления позиции вручную */}
            <Box component="form" onSubmit={handleAddItem} sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Добавить позицию
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Партия</InputLabel>
                    <Select
                      label="Партия"
                      value={newItem.batch}
                      onChange={(e) => {
                        const batchId = e.target.value;
                        const batch = batches.find(b => b.id === batchId);
                        setNewItem({
                          ...newItem,
                          batch: batchId,
                          expected_quantity: batch ? batch.remaining_quantity : '',
                        });
                      }}
                    >
                      {batches.map(b => (
                        <MenuItem key={b.id} value={b.id}>
                          {b.batch_number} - {b.product_name} (ост. {b.remaining_quantity})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Ожидалось"
                    value={newItem.expected_quantity}
                    onChange={(e) => setNewItem({
                      ...newItem,
                      expected_quantity: e.target.value,
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ height: '100%' }}
                  >
                    Добавить
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {inventory.status?.code !== 'completed' && (
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CompleteIcon />}
                  onClick={handleComplete}
                >
                  Завершить
                </Button>
              </Box>
            )}
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Товар</TableCell>
                  <TableCell align="right">Ожидалось</TableCell>
                  <TableCell align="right">Фактически</TableCell>
                  <TableCell align="right">Разница</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell align="right">{item.expected_quantity}</TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        size="small"
                        defaultValue={item.actual_quantity}
                        onBlur={(e) => handleUpdateQuantity(item.id, e.target.value)}
                        disabled={updating[item.id]}
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        color={item.difference < 0 ? 'error' : item.difference > 0 ? 'warning' : 'text.primary'}
                        fontWeight="600"
                      >
                        {item.difference || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {item.difference === 0 ? (
                        <Chip label="ОК" color="success" size="small" />
                      ) : (
                        <Chip label="Расхождение" color="error" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleUpdateQuantity(item.id, item.actual_quantity)}
                        disabled={updating[item.id]}
                      >
                        <SaveIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Статистика</Typography>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h2" color={discrepancies > 0 ? 'error' : 'success'}>
                {discrepancies}
              </Typography>
              <Typography color="textSecondary">расхождений</Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography>Всего позиций: {items.length}</Typography>
              <Typography>Проверено: {counted}</Typography>
              <Typography>Осталось: {items.length - counted}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InventoryDetails;
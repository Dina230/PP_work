import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';

const BatchForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [formData, setFormData] = useState({
    batch_number: '',
    product: '',
    supplier: '',
    warehouse: '',
    quantity: 0,
    remaining_quantity: 0,
    purchase_price: 0,
    production_date: new Date().toISOString().split('T')[0],
    expiration_date: '',
  });

  useEffect(() => {
    fetchData();
    if (id) fetchBatch();
  }, [id]);

  const fetchData = async () => {
    try {
      const [productsRes, suppliersRes, warehousesRes] = await Promise.all([
        api.get('/products/'),
        api.get('/suppliers/'),
        api.get('/warehouses/'),
      ]);

      setProducts(productsRes.data.results || productsRes.data);
      setSuppliers(suppliersRes.data.results || suppliersRes.data);
      setWarehouses(warehousesRes.data.results || warehousesRes.data);
    } catch (error) {
      showNotification('Ошибка загрузки данных', 'error');
    }
  };

  const fetchBatch = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/batches/${id}/`);
      setFormData(response.data);
    } catch (error) {
      showNotification('Ошибка загрузки партии', 'error');
      navigate('/batches');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.product || !formData.supplier || !formData.warehouse || !formData.quantity) {
      showNotification('Заполните обязательные поля', 'warning');
      return;
    }

    const submitData = {
      ...formData,
      quantity: Number(formData.quantity),
      remaining_quantity: Number(formData.quantity),
      purchase_price: Number(formData.purchase_price || 0),
      selling_price: Number(formData.selling_price || 0),
    };

    try {
      setLoading(true);
      if (id) {
        await api.put(`/batches/${id}/`, submitData);
        showNotification('Партия обновлена', 'success');
      } else {
        await api.post('/batches/', submitData);
        showNotification('Партия создана', 'success');
      }
      navigate('/batches');
    } catch (error) {
      const detail = error.response?.data
        ? JSON.stringify(error.response.data)
        : 'Ошибка сохранения';
      showNotification(detail, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <AppBar position="static" color="default" sx={{ mb: 3 }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/batches')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>
            {id ? 'Редактирование партии' : 'Новая партия'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Номер партии"
                value={formData.batch_number}
                onChange={(e) => setFormData({...formData, batch_number: e.target.value})}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Товар</InputLabel>
                <Select
                  value={formData.product}
                  onChange={(e) => setFormData({...formData, product: e.target.value})}
                >
                  {products.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Поставщик</InputLabel>
                <Select
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                >
                  {suppliers.map(s => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Склад</InputLabel>
                <Select
                  value={formData.warehouse}
                  onChange={(e) => setFormData({...formData, warehouse: e.target.value})}
                >
                  {warehouses.map(w => (
                    <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                type="number"
                label="Количество"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Цена закупки"
                value={formData.purchase_price}
                onChange={(e) => setFormData({...formData, purchase_price: parseFloat(e.target.value)})}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Дата производства"
                InputLabelProps={{ shrink: true }}
                value={formData.production_date}
                onChange={(e) => setFormData({...formData, production_date: e.target.value})}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Срок годности"
                InputLabelProps={{ shrink: true }}
                value={formData.expiration_date}
                onChange={(e) => setFormData({...formData, expiration_date: e.target.value})}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate('/batches')}>
                  Отмена
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Сохранить'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default BatchForm;
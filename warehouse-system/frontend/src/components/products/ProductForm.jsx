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

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unit: 'шт',
    min_stock: '',
    max_stock: '',
    quantity: 0,
  });

  useEffect(() => {
    fetchCategories();
    if (id) fetchProduct();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data.results || response.data);
    } catch (error) {
      showNotification('Ошибка загрузки категорий', 'error');
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}/`);
      setFormData({
        name: response.data.name || '',
        sku: response.data.sku || '',
        category: response.data.category || '',
        unit: response.data.unit || 'шт',
        min_stock: response.data.min_stock ?? '',
        max_stock: response.data.max_stock ?? '',
        quantity: response.data.quantity ?? 0,
      });
    } catch (error) {
      showNotification('Ошибка загрузки товара', 'error');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.sku || !formData.category) {
      showNotification('Заполните все поля', 'warning');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        unit: formData.unit,
        min_stock: formData.min_stock || 0,
        max_stock: formData.max_stock || null,
      };

      if (id) {
        await api.put(`/products/${id}/`, payload);
        showNotification('Товар обновлен', 'success');
      } else {
        await api.post('/products/', payload);
        showNotification('Товар создан', 'success');
      }
      navigate('/products');
    } catch (error) {
      showNotification('Ошибка сохранения', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <AppBar position="static" color="default" sx={{ mb: 3 }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/products')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>
            {id ? 'Редактирование' : 'Новый товар'}
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
                label="Название"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Артикул"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Категория</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Ед. изм.</InputLabel>
                <Select
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                >
                  <MenuItem value="шт">Штуки</MenuItem>
                  <MenuItem value="кг">Килограммы</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Минимальный остаток"
                type="number"
                value={formData.min_stock}
                onChange={(e) => setFormData({
                  ...formData,
                  min_stock: e.target.value,
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Максимальный остаток"
                type="number"
                value={formData.max_stock}
                onChange={(e) => setFormData({
                  ...formData,
                  max_stock: e.target.value,
                })}
              />
            </Grid>
            {id && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Текущий остаток (сумма по партиям)"
                  value={formData.quantity}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate('/products')}>
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

export default ProductForm;
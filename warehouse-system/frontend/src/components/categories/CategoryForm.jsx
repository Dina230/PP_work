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

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    parent: '',
  });

  useEffect(() => {
    fetchCategories();
    if (id) fetchCategory();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data.results || response.data);
    } catch (error) {
      showNotification('Ошибка загрузки категорий', 'error');
    }
  };

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/categories/${id}/`);
      setFormData({
        name: response.data.name,
        parent: response.data.parent || '',
      });
    } catch (error) {
      showNotification('Ошибка загрузки категории', 'error');
      navigate('/categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      showNotification('Введите название', 'warning');
      return;
    }

    try {
      setLoading(true);
      if (id) {
        await api.put(`/categories/${id}/`, formData);
        showNotification('Категория обновлена', 'success');
      } else {
        await api.post('/categories/', formData);
        showNotification('Категория создана', 'success');
      }
      navigate('/categories');
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
          <IconButton edge="start" onClick={() => navigate('/categories')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>
            {id ? 'Редактирование' : 'Новая категория'}
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
              <FormControl fullWidth>
                <InputLabel>Родительская категория</InputLabel>
                <Select
                  value={formData.parent}
                  onChange={(e) => setFormData({...formData, parent: e.target.value})}
                >
                  <MenuItem value="">— Нет —</MenuItem>
                  {categories
                    .filter(c => c.id !== parseInt(id))
                    .map(cat => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate('/categories')}>
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

export default CategoryForm;
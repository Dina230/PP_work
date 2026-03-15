import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';

const SupplierForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    inn: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    if (id) fetchSupplier();
  }, [id]);

  const fetchSupplier = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/suppliers/${id}/`);
      setFormData(response.data);
    } catch (error) {
      showNotification('Ошибка загрузки поставщика', 'error');
      navigate('/suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.inn) {
      showNotification('Заполните обязательные поля', 'warning');
      return;
    }

    try {
      setLoading(true);
      if (id) {
        await api.put(`/suppliers/${id}/`, formData);
        showNotification('Поставщик обновлен', 'success');
      } else {
        await api.post('/suppliers/', formData);
        showNotification('Поставщик создан', 'success');
      }
      navigate('/suppliers');
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
          <IconButton edge="start" onClick={() => navigate('/suppliers')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>
            {id ? 'Редактирование' : 'Новый поставщик'}
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
                label="Название организации"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="ИНН"
                value={formData.inn}
                onChange={(e) => setFormData({...formData, inn: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Телефон"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Адрес"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate('/suppliers')}>
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

export default SupplierForm;
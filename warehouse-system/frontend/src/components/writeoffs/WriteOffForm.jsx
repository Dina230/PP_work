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

const WriteOffForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);

  const [formData, setFormData] = useState({
    document_number: '',
    batch: '',
    quantity: 0,
    reason: '',
  });

  useEffect(() => {
    fetchBatches();
    if (id) fetchWriteOff();
  }, [id]);

  const fetchBatches = async () => {
    try {
      const response = await api.get('/batches/');
      setBatches(response.data.results || response.data);
    } catch (error) {
      showNotification('Ошибка загрузки партий', 'error');
    }
  };

  const fetchWriteOff = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/writeoffs/${id}/`);
      setFormData(response.data);
    } catch (error) {
      showNotification('Ошибка загрузки списания', 'error');
      navigate('/writeoffs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.batch || !formData.quantity || !formData.reason) {
      showNotification('Заполните все поля', 'warning');
      return;
    }

    const payload = {
      ...formData,
      quantity: Number(formData.quantity),
    };

    try {
      setLoading(true);
      if (id) {
        await api.put(`/writeoffs/${id}/`, payload);
        showNotification('Списание обновлено', 'success');
      } else {
        await api.post('/writeoffs/', payload);
        showNotification('Списание создано', 'success');
      }
      navigate('/writeoffs');
    } catch (error) {
      const detail = error.response?.data
        ? JSON.stringify(error.response.data)
        : 'Ошибка сохранения';
      showNotification(detail, 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedBatch = batches.find(b => b.id === formData.batch);

  return (
    <Box>
      <AppBar position="static" color="default" sx={{ mb: 3 }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/writeoffs')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>
            {id ? 'Редактирование списания' : 'Новое списание'}
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
                label="Номер документа"
                value={formData.document_number}
                onChange={(e) => setFormData({...formData, document_number: e.target.value})}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Партия</InputLabel>
                <Select
                  value={formData.batch}
                  onChange={(e) => setFormData({...formData, batch: e.target.value})}
                >
                  {batches.map(b => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.batch_number} - {b.product_name} (ост.{b.remaining_quantity})
                    </MenuItem>
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
                inputProps={{ max: selectedBatch?.remaining_quantity }}
              />
              {selectedBatch && (
                <Typography variant="caption" color="textSecondary">
                  Доступно: {selectedBatch.remaining_quantity}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={4}
                label="Причина списания"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate('/writeoffs')}>
                  Отмена
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Отправить на утверждение'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default WriteOffForm;
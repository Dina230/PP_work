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
  RadioGroup,
  FormControlLabel,
  Radio,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';

const MovementForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [formData, setFormData] = useState({
    movement_type: 'receipt',
    document_number: '',
    batch: '',
    quantity: 0,
    from_warehouse: '',
    to_warehouse: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
    if (id) fetchMovement();
  }, [id]);

  const fetchData = async () => {
    try {
      const [batchesRes, warehousesRes] = await Promise.all([
        api.get('/batches/'),
        api.get('/warehouses/'),
      ]);

      setBatches(batchesRes.data.results || batchesRes.data);
      setWarehouses(warehousesRes.data.results || warehousesRes.data);
    } catch (error) {
      showNotification('Ошибка загрузки данных', 'error');
    }
  };

  const fetchMovement = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/movements/${id}/`);
      setFormData(response.data);
    } catch (error) {
      showNotification('Ошибка загрузки движения', 'error');
      navigate('/movements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.batch || !formData.quantity) {
      showNotification('Заполните обязательные поля', 'warning');
      return;
    }

    const payload = {
      ...formData,
      quantity: Number(formData.quantity),
    };

    try {
      setLoading(true);
      if (id) {
        await api.put(`/movements/${id}/`, payload);
        showNotification('Движение обновлено', 'success');
      } else {
        await api.post('/movements/', payload);
        showNotification('Движение создано', 'success');
      }
      navigate('/movements');
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
          <IconButton edge="start" onClick={() => navigate('/movements')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>
            {id ? 'Редактирование' : 'Новое движение'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <RadioGroup
                row
                value={formData.movement_type}
                onChange={(e) => setFormData({...formData, movement_type: e.target.value})}
              >
                <FormControlLabel value="receipt" control={<Radio />} label="Поступление" />
                <FormControlLabel value="shipment" control={<Radio />} label="Отгрузка" />
                <FormControlLabel value="transfer" control={<Radio />} label="Перемещение" />
              </RadioGroup>
            </Grid>

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
                      {b.batch_number} - {b.product_name}
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
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Откуда</InputLabel>
                <Select
                  value={formData.from_warehouse}
                  onChange={(e) => setFormData({...formData, from_warehouse: e.target.value})}
                >
                  <MenuItem value="">—</MenuItem>
                  {warehouses.map(w => (
                    <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Куда</InputLabel>
                <Select
                  value={formData.to_warehouse}
                  onChange={(e) => setFormData({...formData, to_warehouse: e.target.value})}
                >
                  <MenuItem value="">—</MenuItem>
                  {warehouses.map(w => (
                    <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Примечание"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate('/movements')}>
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

export default MovementForm;
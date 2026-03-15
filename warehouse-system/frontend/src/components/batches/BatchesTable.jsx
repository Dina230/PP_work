import React, { useState, useEffect, useCallback } from 'react';
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
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';

const BatchesTable = () => {
  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState('');
  const { showNotification } = useNotification();

  const fetchBatches = useCallback(async () => {
    try {
      const response = await api.get('/batches/');
      setBatches(response.data.results || response.data);
    } catch (error) {
      showNotification('Ошибка загрузки партий', 'error');
    }
  }, [showNotification]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleDelete = async (id) => {
    if (window.confirm('Удалить партию?')) {
      try {
        await api.delete(`/batches/${id}/`);
        showNotification('Партия удалена', 'success');
        fetchBatches();
      } catch (error) {
        showNotification('Ошибка при удалении', 'error');
      }
    }
  };

  const filtered = batches.filter(b =>
    b.batch_number?.toLowerCase().includes(search.toLowerCase()) ||
    b.product_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Партии товаров</Typography>
        <Box>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchBatches} sx={{ mr: 2 }}>
            Обновить
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} href="/batches/new">
            Новая партия
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Поиск по номеру или товару..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon /> }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>№ Партии</TableCell>
              <TableCell>Товар</TableCell>
              <TableCell>Поставщик</TableCell>
              <TableCell align="right">Кол-во</TableCell>
              <TableCell align="right">Остаток</TableCell>
              <TableCell>Склад</TableCell>
              <TableCell>Срок годности</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell>{batch.batch_number}</TableCell>
                <TableCell>{batch.product_name}</TableCell>
                <TableCell>{batch.supplier_name}</TableCell>
                <TableCell align="right">{batch.quantity}</TableCell>
                <TableCell align="right">{batch.remaining_quantity}</TableCell>
                <TableCell>{batch.warehouse_name}</TableCell>
                <TableCell>{batch.expiration_date || '—'}</TableCell>
                <TableCell>
                  <IconButton size="small" href={`/batches/${batch.id}/edit`}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(batch.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BatchesTable;
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
  IconButton,
  TextField,
  InputAdornment,
  Chip,
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

const WarehousesTable = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showNotification } = useNotification();

  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/warehouses/');
      setWarehouses(response.data.results || response.data);
    } catch (error) {
      showNotification('Ошибка загрузки складов', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Удалить склад?')) {
      try {
        await api.delete(`/warehouses/${id}/`);
        showNotification('Склад удален', 'success');
        fetchWarehouses();
      } catch (error) {
        showNotification('Ошибка при удалении', 'error');
      }
    }
  };

  const filtered = warehouses.filter(w =>
    w.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Склады</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchWarehouses}
            sx={{ mr: 2 }}
          >
            Обновить
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            href="/warehouses/new"
          >
            Добавить
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Поиск по названию или коду..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Код</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Адрес</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((w) => (
              <TableRow key={w.id}>
                <TableCell>
                  <Chip label={w.code} color="primary" size="small" />
                </TableCell>
                <TableCell>{w.name}</TableCell>
                <TableCell>{w.address}</TableCell>
                <TableCell>
                  <IconButton href={`/warehouses/${w.id}/edit`}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(w.id)} color="error">
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

export default WarehousesTable;
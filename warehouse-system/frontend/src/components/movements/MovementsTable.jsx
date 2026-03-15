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
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';

const MovementsTable = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showNotification } = useNotification();

  const fetchMovements = async () => {
    try {
      const response = await api.get('/movements/');
      setMovements(response.data.results || response.data);
    } catch (error) {
      showNotification('Ошибка загрузки движений', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const getTypeChip = (type) => {
    switch(type) {
      case 'receipt':
        return <Chip label="Поступление" color="success" size="small" />;
      case 'shipment':
        return <Chip label="Отгрузка" color="error" size="small" />;
      case 'transfer':
        return <Chip label="Перемещение" color="info" size="small" />;
      default:
        return <Chip label={type} size="small" />;
    }
  };

  const filtered = movements.filter(m =>
    m.document_number?.toLowerCase().includes(search.toLowerCase()) ||
    m.product_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Движения товаров</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchMovements}
            sx={{ mr: 2 }}
          >
            Обновить
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            href="/movements/new"
          >
            Новое движение
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Поиск по документу или товару..."
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
              <TableCell>Дата</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Документ</TableCell>
              <TableCell>Товар</TableCell>
              <TableCell>Партия</TableCell>
              <TableCell>Откуда</TableCell>
              <TableCell>Куда</TableCell>
              <TableCell align="right">Кол-во</TableCell>
              <TableCell>Ответственный</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{new Date(m.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{getTypeChip(m.movement_type)}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="500">
                    {m.document_number}
                  </Typography>
                </TableCell>
                <TableCell>{m.product_name}</TableCell>
                <TableCell>{m.batch_number}</TableCell>
                <TableCell>{m.from_warehouse_name || '—'}</TableCell>
                <TableCell>{m.to_warehouse_name || '—'}</TableCell>
                <TableCell align="right">
                  <Typography fontWeight="600">{m.quantity}</Typography>
                </TableCell>
                <TableCell>{m.created_by_name}</TableCell>
                <TableCell>
                  <IconButton size="small" href={`/movements/${m.id}`}>
                    <VisibilityIcon />
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

export default MovementsTable;
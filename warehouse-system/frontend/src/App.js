import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './components/auth/Login';
import Layout from './components/common/Layout';
import Dashboard from './components/dashboard/Dashboard';
import ProductsTable from './components/products/ProductsTable';
import ProductForm from './components/products/ProductForm';
import CategoriesTable from './components/categories/CategoriesTable';
import CategoryForm from './components/categories/CategoryForm';
import WarehousesTable from './components/warehouses/WarehousesTable';
import WarehouseForm from './components/warehouses/WarehouseForm';
import SuppliersTable from './components/suppliers/SuppliersTable';
import SupplierForm from './components/suppliers/SupplierForm';
import BatchesTable from './components/batches/BatchesTable';
import BatchForm from './components/batches/BatchForm';
import MovementsTable from './components/movements/MovementsTable';
import MovementForm from './components/movements/MovementForm';
import MovementDetails from './components/movements/MovementDetails';
import WriteOffsTable from './components/writeoffs/WriteOffsTable';
import WriteOffForm from './components/writeoffs/WriteOffForm';
import WriteOffDetails from './components/writeoffs/WriteOffDetails';
import InventoriesTable from './components/inventory/InventoriesTable';
import InventoryForm from './components/inventory/InventoryForm';
import InventoryDetails from './components/inventory/InventoryDetails';
import Profile from './components/auth/Profile';
import Reports from './components/reports/Reports';
import Notifications from './components/notifications/Notifications';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access');
  return token ? children : <Navigate to="/login" />;
};

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductsTable />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="categories" element={<CategoriesTable />} />
            <Route path="categories/new" element={<CategoryForm />} />
            <Route path="warehouses" element={<WarehousesTable />} />
            <Route path="warehouses/new" element={<WarehouseForm />} />
            <Route path="warehouses/:id/edit" element={<WarehouseForm />} />
            <Route path="suppliers" element={<SuppliersTable />} />
            <Route path="suppliers/new" element={<SupplierForm />} />
          <Route path="suppliers/:id/edit" element={<SupplierForm />} />
            <Route path="batches" element={<BatchesTable />} />
            <Route path="batches/new" element={<BatchForm />} />
            <Route path="movements" element={<MovementsTable />} />
            <Route path="movements/new" element={<MovementForm />} />
            <Route path="movements/:id" element={<MovementDetails />} />
            <Route path="writeoffs" element={<WriteOffsTable />} />
            <Route path="writeoffs/new" element={<WriteOffForm />} />
            <Route path="writeoffs/:id" element={<WriteOffDetails />} />
            <Route path="inventory" element={<InventoriesTable />} />
            <Route path="inventory/new" element={<InventoryForm />} />
            <Route path="inventory/:id" element={<InventoryDetails />} />
            <Route path="reports" element={<Reports />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  );
}

export default App;
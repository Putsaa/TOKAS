import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CashierPage from './pages/CashierPage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import StockManagementPage from './pages/StockManagementPage';
import TransactionsPage from './pages/TransactionsPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/kasir" element={<CashierPage />} />
          
          <Route element={<ProtectedRoute allowedRoles={['Owner', 'Admin', 'admin']} />}>
            <Route path="/produk" element={<ProductsPage />} />
            <Route path="/kategori" element={<CategoriesPage />} />
            <Route path="/stok" element={<StockManagementPage />} />
            <Route path="/stok-masuk" element={<StockManagementPage defaultTab={1} />} />
            <Route path="/penyesuaian-stok" element={<StockManagementPage defaultTab={2} />} />
            <Route path="/stok-menipis" element={<StockManagementPage defaultTab={0} />} />
            <Route path="/transaksi" element={<TransactionsPage />} />
            <Route path="/laporan" element={<ReportsPage />} />
            <Route path="/pengguna" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;

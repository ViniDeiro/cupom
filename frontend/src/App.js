import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Loading from './components/Loading';

// Páginas públicas
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';

// Páginas do usuário
import Dashboard from './pages/user/Dashboard';
import MyCoupons from './pages/user/MyCoupons';
import BuyCoupons from './pages/user/BuyCoupons';
import Orders from './pages/user/Orders';
import Checkout from './pages/user/Checkout';

// Páginas do admin
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSpecialDays from './pages/admin/AdminSpecialDays';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminReports from './pages/admin/AdminReports';

// Páginas de erro
import NotFound from './pages/NotFound';

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <Loading fullScreen text="Carregando aplicação..." />;
  }

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="produtos" element={<Products />} />
        <Route path="produtos/:id" element={<ProductDetail />} />
        <Route path="sobre" element={<About />} />
        
        {/* Rotas de autenticação */}
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Register />} />
        
        {/* Rotas protegidas do usuário */}
        <Route path="minha-conta" element={
          <ProtectedRoute requireUser>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="meus-cupons" element={
          <ProtectedRoute requireUser>
            <MyCoupons />
          </ProtectedRoute>
        } />
        <Route path="comprar-cupons" element={
          <ProtectedRoute requireUser>
            <BuyCoupons />
          </ProtectedRoute>
        } />
        <Route path="meus-pedidos" element={
          <ProtectedRoute requireUser>
            <Orders />
          </ProtectedRoute>
        } />
        <Route path="checkout" element={
          <ProtectedRoute requireUser>
            <Checkout />
          </ProtectedRoute>
        } />
      </Route>

      {/* Rotas administrativas */}
      <Route path="/admin">
        <Route path="login" element={<AdminLogin />} />
        <Route path="" element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="produtos" element={<AdminProducts />} />
          <Route path="pedidos" element={<AdminOrders />} />
          <Route path="dias-especiais" element={<AdminSpecialDays />} />
          <Route path="cupons" element={<AdminCoupons />} />
          <Route path="relatorios" element={<AdminReports />} />
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Route>

      {/* Rota 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;

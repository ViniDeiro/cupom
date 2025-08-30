import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ 
  children, 
  requireUser = false, 
  requireAdmin = false, 
  requireSuperAdmin = false 
}) => {
  const { 
    isAuthenticated, 
    isUser, 
    isAdmin, 
    isSuperAdmin, 
    loading 
  } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen text="Verificando autenticação..." />;
  }

  // Verificar se precisa estar autenticado
  if (!isAuthenticated()) {
    if (requireAdmin || requireSuperAdmin) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar se precisa ser usuário
  if (requireUser && !isUser()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Verificar se precisa ser admin
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/minha-conta" replace />;
  }

  // Verificar se precisa ser super admin
  if (requireSuperAdmin && !isSuperAdmin()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar se há dados salvos no localStorage ao iniciar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedAdmin = localStorage.getItem('admin');

    if (token) {
      try {
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        if (savedAdmin) {
          setAdmin(JSON.parse(savedAdmin));
        }
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
        logout();
      }
    }
    
    setLoading(false);
  }, []);

  // Função de login para usuários
  const loginUser = async (email, senha) => {
    try {
      const response = await authAPI.login({ email, senha });
      const { token, usuario } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));
      localStorage.removeItem('admin'); // Remover dados de admin se existirem

      setUser(usuario);
      setAdmin(null);
      
      toast.success(`Bem-vindo(a), ${usuario.nome}!`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.erro || 'Erro ao fazer login';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Função de login para administradores
  const loginAdmin = async (email, senha) => {
    try {
      const response = await authAPI.adminLogin({ email, senha });
      const { token, admin: adminData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('admin', JSON.stringify(adminData));
      localStorage.removeItem('user'); // Remover dados de usuário se existirem

      setAdmin(adminData);
      setUser(null);
      
      toast.success(`Bem-vindo(a), Admin ${adminData.nome}!`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.erro || 'Erro ao fazer login administrativo';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Função de registro para usuários
  const registerUser = async (dadosUsuario) => {
    try {
      const response = await authAPI.register(dadosUsuario);
      const { token, usuario } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));

      setUser(usuario);
      setAdmin(null);
      
      toast.success(`Conta criada com sucesso! Bem-vindo(a), ${usuario.nome}!`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.erro || 'Erro ao criar conta';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    
    setUser(null);
    setAdmin(null);
    
    toast.success('Logout realizado com sucesso!');
  };

  // Verificar se está autenticado
  const isAuthenticated = () => {
    return !!(user || admin);
  };

  // Verificar se é usuário
  const isUser = () => {
    return !!user;
  };

  // Verificar se é administrador
  const isAdmin = () => {
    return !!admin;
  };

  // Verificar se é super administrador
  const isSuperAdmin = () => {
    return admin && admin.nivel === 'super';
  };

  // Obter nome do usuário atual
  const getCurrentUserName = () => {
    if (user) return user.nome;
    if (admin) return admin.nome;
    return null;
  };

  // Obter email do usuário atual
  const getCurrentUserEmail = () => {
    if (user) return user.email;
    if (admin) return admin.email;
    return null;
  };

  const value = {
    // Estados
    user,
    admin,
    loading,
    
    // Funções de autenticação
    loginUser,
    loginAdmin,
    registerUser,
    logout,
    
    // Funções de verificação
    isAuthenticated,
    isUser,
    isAdmin,
    isSuperAdmin,
    getCurrentUserName,
    getCurrentUserEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

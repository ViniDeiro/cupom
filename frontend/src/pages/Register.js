import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Phone, UserPlus, Tag, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/minha-conta', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const senha = watch('senha');

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const { confirmarSenha, ...dadosUsuario } = data;
      const result = await registerUser(dadosUsuario);
      
      if (result.success) {
        navigate('/minha-conta', { replace: true });
      }
    } catch (error) {
      console.error('Erro no registro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Criando sua conta..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-cupom-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Cabeçalho */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 group mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-cupom-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Eu Tenho Sonhos</span>
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Crie sua conta gratuita
          </h2>
          <p className="text-gray-600">
            Junte-se ao sistema mais inovador de cupons e economize muito!
          </p>
        </div>

        {/* Benefícios */}
        <div className="bg-gradient-to-r from-primary-500 to-cupom-500 rounded-2xl p-6 text-white">
          <h3 className="font-semibold mb-4 text-center">🎉 Ao criar sua conta você ganha:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <CheckCircle size={16} className="mr-2 text-green-300" />
              Acesso aos cupons de desconto exclusivos
            </li>
            <li className="flex items-center">
              <CheckCircle size={16} className="mr-2 text-green-300" />
              Notificações dos dias especiais por email
            </li>
            <li className="flex items-center">
              <CheckCircle size={16} className="mr-2 text-green-300" />
              Produtos especiais disponíveis apenas com cupons
            </li>
            <li className="flex items-center">
              <CheckCircle size={16} className="mr-2 text-green-300" />
              Descontos de até 50% nos seus produtos favoritos
            </li>
          </ul>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome */}
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                Nome completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('nome', {
                    required: 'Nome é obrigatório',
                    minLength: {
                      value: 2,
                      message: 'Nome deve ter pelo menos 2 caracteres'
                    },
                    maxLength: {
                      value: 100,
                      message: 'Nome deve ter no máximo 100 caracteres'
                    }
                  })}
                  type="text"
                  className={`input-field pl-10 ${errors.nome ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Seu nome completo"
                />
              </div>
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                  type="email"
                  className={`input-field pl-10 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="seu@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefone <span className="text-gray-500">(opcional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('telefone', {
                    pattern: {
                      value: /^[\d\s\-\(\)]+$/,
                      message: 'Telefone inválido'
                    }
                  })}
                  type="tel"
                  className={`input-field pl-10 ${errors.telefone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="(11) 99999-9999"
                />
              </div>
              {errors.telefone && (
                <p className="mt-1 text-sm text-red-600">{errors.telefone.message}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('senha', {
                    required: 'Senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'Senha deve ter pelo menos 6 caracteres'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field pl-10 pr-10 ${errors.senha ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.senha && (
                <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div>
              <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmarSenha', {
                    required: 'Confirmação de senha é obrigatória',
                    validate: value => value === senha || 'Senhas não coincidem'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`input-field pl-10 pr-10 ${errors.confirmarSenha ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmarSenha && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmarSenha.message}</p>
              )}
            </div>

            {/* Botão de registro */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <UserPlus className="mr-2" size={20} />
              )}
              {isLoading ? 'Criando conta...' : 'Criar conta gratuita'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                Faça login
              </Link>
            </p>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Ao criar uma conta, você aceita nossos{' '}
            <Link to="/termos" className="text-primary-600 hover:text-primary-500">
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link to="/privacidade" className="text-primary-600 hover:text-primary-500">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

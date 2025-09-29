import React, { useEffect, useState } from 'react';
import { CheckCircle, Gift, Mail } from 'lucide-react';

const SuccessAnimation = ({ title = "Pagamento Aprovado!", subtitle = "Seu cupom foi ativado com sucesso!", onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 300);
    const timer2 = setTimeout(() => setStep(2), 800);
    const timer3 = setTimeout(() => setStep(3), 1300);
    const timer4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="text-center py-8">
      {/* Animação do check principal */}
      <div className="relative mb-6">
        <div 
          className={`
            w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center
            transform transition-all duration-500 ease-out
            ${step >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
          `}
        >
          <CheckCircle 
            className={`
              w-12 h-12 text-green-600
              transform transition-all duration-300 ease-out delay-200
              ${step >= 1 ? 'scale-100' : 'scale-0'}
            `}
          />
        </div>
        
        {/* Efeito de ondas */}
        <div 
          className={`
            absolute inset-0 w-24 h-24 mx-auto rounded-full border-4 border-green-300
            transform transition-all duration-1000 ease-out
            ${step >= 1 ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}
          `}
        />
        <div 
          className={`
            absolute inset-0 w-24 h-24 mx-auto rounded-full border-2 border-green-200
            transform transition-all duration-1000 ease-out delay-200
            ${step >= 1 ? 'scale-200 opacity-0' : 'scale-100 opacity-100'}
          `}
        />
      </div>

      {/* Título */}
      <h3 
        className={`
          text-2xl font-bold text-green-600 mb-2
          transform transition-all duration-500 ease-out delay-300
          ${step >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}
      >
        {title}
      </h3>

      {/* Subtítulo */}
      <p 
        className={`
          text-gray-600 mb-6
          transform transition-all duration-500 ease-out delay-500
          ${step >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}
      >
        {subtitle}
      </p>

      {/* Ícones de ações */}
      <div 
        className={`
          flex justify-center space-x-8
          transform transition-all duration-500 ease-out delay-700
          ${step >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}
      >
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
            <Gift className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-xs text-gray-500">Cupom Ativo</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
            <Mail className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-xs text-gray-500">Email Enviado</span>
        </div>
      </div>

      {/* Confetti effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`
              absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full
              transform transition-all duration-2000 ease-out
              ${step >= 1 ? 'translate-y-96 opacity-0' : 'translate-y-0 opacity-100'}
            `}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 20}%`,
              animationDelay: `${Math.random() * 1000}ms`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SuccessAnimation;
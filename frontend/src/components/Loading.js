import React from 'react';

const Loading = ({ size = 'medium', text = 'Carregando...', fullScreen = false }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        <div className="text-center">
          <div className={`${sizeClasses.large} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4`}></div>
          <p className={`text-gray-600 ${textSizeClasses.large} font-medium`}>{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-center">
        <div className={`${sizeClasses[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-2`}></div>
        <p className={`text-gray-600 ${textSizeClasses[size]}`}>{text}</p>
      </div>
    </div>
  );
};

export default Loading;

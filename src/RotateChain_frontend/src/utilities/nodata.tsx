import React, { useEffect, useState } from 'react';

interface NoDataPaletteProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const NoDataPalette: React.FC<NoDataPaletteProps> = ({ 
  message = 'No data available at this time', 
  size = 'medium' 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Size classes based on prop
  const sizeClasses = {
    small: 'w-48 h-48',
    medium: 'w-64 h-64',
    large: 'w-80 h-80'
  };

  // Text size based on prop
  const textSizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl'
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className={`relative ${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-800 shadow-2xl overflow-hidden transform transition-all duration-700 ${mounted ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20 animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 40 + 10}px`,
                height: `${Math.random() * 40 + 10}px`,
                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9c74f', '#ffafcc'][i % 5],
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${Math.random() * 2 + 1.5}s`
              }}
            />
          ))}
        </div>

        {/* Floating shapes */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-lg opacity-70"
              style={{
                top: `${Math.random() * 70 + 15}%`,
                left: `${Math.random() * 70 + 15}%`,
                width: `${Math.random() * 40 + 20}px`,
                height: `${Math.random() * 40 + 20}px`,
                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9c74f', '#ffafcc'][i % 5],
                animation: `float 4s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>

        {/* Central content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
          <div className="relative mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center animate-pulse">
              <svg 
                className="w-10 h-10 text-indigo-700" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            
            {/* Animated ring */}
            <div className="absolute -inset-2 border-4 border-white rounded-full animate-ping opacity-20"></div>
          </div>
          
          <p className={`text-white font-semibold text-center ${textSizeClasses[size]} drop-shadow-md`}>
            {message}
          </p>
        </div>

        {/* Glowing edges */}
        <div className="absolute inset-0 rounded-2xl border-4 border-white border-opacity-10 animate-pulse"></div>
      </div>
      
      {/* Add custom animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(3deg);
          }
          66% {
            transform: translateY(5px) rotate(-3deg);
          }
        }
      `}</style>
    </div>
  );
};

export default NoDataPalette;
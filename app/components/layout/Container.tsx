import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
}

export default function Container({ 
  children, 
  className = '', 
  size = 'large' 
}: ContainerProps) {
  const sizeClasses = {
    small: 'max-w-4xl',
    medium: 'max-w-6xl',
    large: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
}
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  ...props 
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${
        hover ? 'transition-shadow duration-300 hover:shadow-md cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

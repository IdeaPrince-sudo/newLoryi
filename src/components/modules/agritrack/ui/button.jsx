import React from 'react';

export const Button = ({ children, type = "button", className = "", ...props }) => {
  return (
    <button
      type={type}
      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
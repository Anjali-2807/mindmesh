import React from 'react';
import { motion } from 'framer-motion';

export default function Button({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) {
  const baseStyles = 'font-bold uppercase tracking-wider rounded-xl transition-all focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500/50 shadow-lg shadow-indigo-200',
    secondary: 'bg-slate-900 text-white hover:bg-black focus:ring-slate-500/50 shadow-lg',
    outline: 'border-2 border-slate-300 text-slate-200 hover:border-slate-900 hover:text-white hover:bg-slate-50 focus:ring-slate-500/50',
    ghost: 'text-slate-200 hover:bg-slate-100 hover:text-white focus:ring-slate-500/50',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50 shadow-lg shadow-red-200'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {children}
    </motion.button>
  );
}
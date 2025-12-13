import React from 'react';
import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = false, ...props }) {
  const Component = hover ? motion.div : 'div';
  
  const hoverProps = hover ? {
    whileHover: { y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' },
    transition: { duration: 0.2 }
  } : {};

  return (
    <Component
      className={`bg-white rounded-2xl shadow-lg border border-slate-100 p-6 ${className}`}
      {...hoverProps}
      {...props}
    >
      {children}
    </Component>
  );
}
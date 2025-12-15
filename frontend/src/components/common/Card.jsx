import React from 'react';
import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = true, glow = false, glass = true, ...props }) {
  const Component = hover ? motion.div : 'div';
  
  const hoverProps = hover ? {
    whileHover: { 
      y: -10, 
      rotateX: 3,
      rotateY: 3,
      boxShadow: glow 
        ? '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 40px rgba(129, 140, 248, 0.5)' 
        : '0 20px 50px rgba(0, 0, 0, 0.7)'
    },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  } : {};

  const glowClass = glass ? (glow ? 'glass-glow' : 'glass') : '';

  return (
    <Component
      className={`${glowClass} rounded-2xl p-6 relative overflow-hidden ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.6)'
      }}
      {...hoverProps}
      {...props}
    >
      {/* Gradient top border */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-amber-400 opacity-70"
        style={{ borderRadius: '16px 16px 0 0' }}
      ></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Subtle animated glow */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(129, 140, 248, 0.4) 0%, transparent 70%)',
          animation: 'pulse 5s ease-in-out infinite',
          zIndex: 0
        }}
      ></div>
    </Component>
  );
}
import React from 'react';
import { motion } from 'framer-motion';

export default function Loading({ size = 'md', color = 'indigo', text = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colors = {
    indigo: 'border-indigo-600',
    white: 'border-white',
    slate: 'border-slate-600',
    purple: 'border-purple-600'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className={`${sizes[size]} border-4 ${colors[color]} border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && (
        <p className="text-sm text-slate-600 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

export function LoadingOverlay({ text = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-2xl">
        <Loading size="lg" text={text} />
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
      </div>
    </div>
  );
}
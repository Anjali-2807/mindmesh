import React from 'react';
import { motion } from 'framer-motion';

export default function MetricInput({ 
  label, 
  value, 
  onChange, 
  minLabel, 
  maxLabel,
  icon,
  iconActive 
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-sm font-bold text-slate-700 tracking-wide flex items-center gap-2">
          <span className="text-lg">{value >= 4 ? iconActive : icon}</span>
          {label}
        </span>
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          {value}/5
        </span>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <MetricButton
            key={num}
            number={num}
            isActive={value === num}
            onClick={() => onChange(num)}
          />
        ))}
      </div>
      
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-400 font-semibold px-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

function MetricButton({ number, isActive, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`h-14 rounded-xl font-bold text-base transition-all flex items-center justify-center ${
        isActive
          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
          : 'bg-slate-50 text-slate-400 border-2 border-slate-200 hover:border-indigo-300 hover:bg-white hover:text-slate-600'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {number}
    </motion.button>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { Home, Brain, TrendingUp, Lightbulb } from 'lucide-react';

export default function Navigation({ view, onViewChange, isMobile = false, className = '' }) {
  const navItems = [
    { id: 'home', label: 'Daily Log', icon: Home },
    { id: 'decisions', label: 'Decisions', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'insights', label: 'Insights', icon: Lightbulb }
  ];

  if (isMobile) {
    return (
      <div className="py-4 px-4 space-y-2">
        {navItems.map(item => (
          <MobileNavButton
            key={item.id}
            item={item}
            active={view === item.id}
            onClick={() => onViewChange(item.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <nav className={`flex items-center gap-2 ${className}`}>
      {navItems.map(item => (
        <NavButton
          key={item.id}
          item={item}
          active={view === item.id}
          onClick={() => onViewChange(item.id)}
        />
      ))}
    </nav>
  );
}

function NavButton({ item, active, onClick }) {
  const Icon = item.icon;
  
  return (
    <motion.button
      onClick={onClick}
      className={`relative px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
        active
          ? 'text-white'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        <Icon size={18} />
        <span className="hidden sm:inline">{item.label}</span>
      </span>
    </motion.button>
  );
}

function MobileNavButton({ item, active, onClick }) {
  const Icon = item.icon;
  
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-3 ${
        active
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon size={20} />
      <span>{item.label}</span>
    </button>
  );
}
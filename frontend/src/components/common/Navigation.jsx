import React from 'react';
import { motion } from 'framer-motion';
import { Home, Brain, TrendingUp, Lightbulb, Info } from 'lucide-react';

export default function Navigation({ view, onViewChange, isMobile = false, className = '' }) {
  const navItems = [
    { id: 'home', label: 'Daily Log', icon: Home },
    { id: 'decisions', label: 'Decisions', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
    { id: 'about', label: 'About', icon: Info }
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
          : 'text-slate-300 hover:text-white hover:bg-white/10'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 rounded-xl"
          style={{ 
            background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
            boxShadow: '0 0 30px rgba(129, 140, 248, 0.5), 0 0 60px rgba(167, 139, 250, 0.3)' 
          }}
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
          ? 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white shadow-lg'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
      style={active ? {
        boxShadow: '0 0 25px rgba(129, 140, 248, 0.4)'
      } : {}}
    >
      <Icon size={20} />
      <span>{item.label}</span>
    </button>
  );
}
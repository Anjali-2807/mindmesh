import React from 'react';
import { motion } from 'framer-motion';
import { Home, Brain, TrendingUp, Lightbulb, Info, LogOut, User } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navigation({ isMobile = false, setIsMobileMenuOpen, className = '' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Daily Log', icon: Home },
    { path: '/decisions', label: 'Decisions', icon: Brain },
    { path: '/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/insights', label: 'Insights', icon: Lightbulb },
    { path: '/about', label: 'About', icon: Info }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (isMobile && setIsMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  if (isMobile) {
    return (
      <div className="py-4 px-4 space-y-4">
        {/* User Info Mobile */}
         <div className="flex items-center gap-3 px-4 py-2 mb-4 border-b border-white/10 pb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
                <p className="text-white font-semibold">{user?.username}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
         </div>

        <div className="space-y-2">
            {navItems.map(item => (
            <MobileNavButton
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
                onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
            />
            ))}
            
            <button
                onClick={handleLogout}
                className="w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 mt-4"
            >
                <LogOut size={20} />
                <span>Sign Out</span>
            </button>
        </div>
      </div>
    );
  }

  return (
    <nav className={`flex items-center gap-2 ${className}`}>
      {navItems.map(item => (
        <NavButton
          key={item.path}
          item={item}
          isActive={location.pathname === item.path}
        />
      ))}
      
      <div className="h-6 w-px bg-white/10 mx-2"></div>
      
      {/* User Dropdown / Logout Button */}
      <div className="flex items-center gap-4">
         <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
                {user?.username?.charAt(0).toUpperCase()}
             </div>
             <span className="hidden lg:block text-sm font-medium text-slate-200">{user?.username}</span>
         </div>
         <button 
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-lg"
            title="Sign Out"
         >
             <LogOut size={20} />
         </button>
      </div>
    </nav>
  );
}

function NavButton({ item, isActive }) {
  const Icon = item.icon;
  
  return (
    <NavLink to={item.path}>
        {({ isActive: linkActive }) => (
            <motion.div
            className={`relative px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                linkActive
                ? 'text-white'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            >
            {linkActive && (
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
                <span className="hidden xl:inline">{item.label}</span>
            </span>
            </motion.div>
        )}
    </NavLink>
  );
}

function MobileNavButton({ item, isActive, onClick }) {
  const Icon = item.icon;
  
  return (
    <NavLink to={item.path} onClick={onClick}>
        <div
        className={`w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-3 ${
            isActive
            ? 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white shadow-lg'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`}
        style={isActive ? {
            boxShadow: '0 0 25px rgba(129, 140, 248, 0.4)'
        } : {}}
        >
        <Icon size={20} />
        <span>{item.label}</span>
        </div>
    </NavLink>
  );
}
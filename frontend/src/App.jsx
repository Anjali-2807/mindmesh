import React, { useState } from 'react';
import { Home, Brain, TrendingUp, Lightbulb, Menu, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import Views
import HomeView from './views/HomeView';
import DecisionsView from './views/DecisionsView';
import AnalyticsView from './views/AnalyticsView';
import InsightsView from './views/InsightsView';
import AboutView from './views/AboutView';

// Import Components
import Navigation from './components/common/Navigation';

export default function App() {
  const [view, setView] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle view changes
  const handleViewChange = (newView) => {
    setView(newView);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render current view
  const renderView = () => {
    const views = {
      home: <HomeView setView={handleViewChange} />,
      decisions: <DecisionsView />,
      analytics: <AnalyticsView />,
      insights: <InsightsView />,
      about: <AboutView />
    };
    return views[view] || views.home;
  };

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white font-sans selection:bg-indigo-400/30 relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="animated-bg"></div>
      
      {/* Simple 3D Geometric Shapes - CSS Only */}
      <div className="fixed inset-0 opacity-20 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Floating Spheres */}
        <div 
          className="shape-3d"
          style={{ 
            width: '250px', 
            height: '250px', 
            top: '15%', 
            left: '10%',
            animationDelay: '0s',
            animationDuration: '25s'
          }}
        ></div>
        <div 
          className="shape-3d"
          style={{ 
            width: '180px', 
            height: '180px', 
            top: '60%', 
            right: '15%',
            animationDelay: '3s',
            animationDuration: '28s'
          }}
        ></div>
        <div 
          className="shape-3d"
          style={{ 
            width: '200px', 
            height: '200px', 
            bottom: '15%', 
            left: '60%',
            animationDelay: '6s',
            animationDuration: '26s'
          }}
        ></div>
        
        {/* Smaller Floating Particles */}
        <div 
          className="floating-particle"
          style={{ 
            width: '10px', 
            height: '10px', 
            background: '#818cf8',
            top: '25%', 
            left: '30%',
            animationDelay: '1s'
          }}
        ></div>
        <div 
          className="floating-particle"
          style={{ 
            width: '12px', 
            height: '12px', 
            background: '#a78bfa',
            top: '55%', 
            right: '25%',
            animationDelay: '2s'
          }}
        ></div>
        <div 
          className="floating-particle"
          style={{ 
            width: '8px', 
            height: '8px', 
            background: '#fbbf24',
            top: '80%', 
            left: '45%',
            animationDelay: '4s'
          }}
        ></div>
        <div 
          className="floating-particle"
          style={{ 
            width: '11px', 
            height: '11px', 
            background: '#60a5fa',
            top: '35%', 
            right: '40%',
            animationDelay: '0s'
          }}
        ></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full glass backdrop-blur-xl border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Clickable to About */}
            <motion.div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => handleViewChange('about')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-indigo-400/50 transition-shadow duration-300">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient-primary">
                  MindMesh
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">AI Life Optimizer</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <Navigation view={view} onViewChange={handleViewChange} className="hidden md:flex" />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 glass"
            >
              <Navigation view={view} onViewChange={handleViewChange} isMobile />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-white/10 glass relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-slate-300">
              MindMesh &copy; 2024 • AI-Powered Decision Intelligence System
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Built with React, Flask, Transformers & Machine Learning
            </p>
            <button
              onClick={() => handleViewChange('about')}
              className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 mx-auto hover-glow transition-all duration-300"
            >
              <Info size={14} />
              Learn More About MindMesh
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
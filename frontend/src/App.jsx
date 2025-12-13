import React, { useState, useEffect } from 'react';
import { Home, Brain, TrendingUp, Lightbulb, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import Views
import HomeView from './views/HomeView';
import DecisionsView from './views/DecisionsView';
import AnalyticsView from './views/AnalyticsView';
import InsightsView from './views/InsightsView';

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
      insights: <InsightsView />
    };
    return views[view] || views.home;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 text-slate-800 font-sans selection:bg-indigo-200/50">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/50 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => handleViewChange('home')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  MindMesh
                </h1>
                <p className="text-[10px] text-slate-500 font-medium">AI Life Optimizer</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <Navigation view={view} onViewChange={handleViewChange} className="hidden md:flex" />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
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
              className="md:hidden border-t border-slate-200"
            >
              <Navigation view={view} onViewChange={handleViewChange} isMobile />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
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
      <footer className="mt-16 py-8 border-t border-slate-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-slate-600">
              MindMesh &copy; 2024 • AI-Powered Life Optimization Platform
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Built with React, Flask, Transformers & Machine Learning
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
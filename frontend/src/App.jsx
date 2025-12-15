import React, { useState } from 'react';
import { Brain, Menu, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Import Views
import HomeView from './views/HomeView';
import DecisionsView from './views/DecisionsView';
import AnalyticsView from './views/AnalyticsView';
import InsightsView from './views/InsightsView';
import AboutView from './views/AboutView';
import LoginView from './views/LoginView';
import SignupView from './views/SignupView';

// Import Components
import Navigation from './components/common/Navigation';
import ProtectedRoute from './components/common/ProtectedRoute';
import NeuralNetwork3D from './components/background/NeuralNetwork3D';
import { AuthProvider, useAuth } from './context/AuthContext';

// Navigation Wrapper to access AuthContext for conditional rendering
const NavigationWrapper = ({isMobileMenuOpen, setIsMobileMenuOpen}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
      <header className="fixed top-0 w-full glass backdrop-blur-xl border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Clickable to About */}
            <motion.div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate('/about')}
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
            <Navigation className="hidden md:flex" />

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
              <Navigation isMobile setIsMobileMenuOpen={setIsMobileMenuOpen} />
            </motion.div>
          )}
        </AnimatePresence>
      </header>
  );
};

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#0f0f23] text-white font-sans selection:bg-indigo-400/30 relative overflow-x-hidden">
        {/* Animated Background */}
        <div className="animated-bg"></div>
        
        {/* 3D Neural Network Diagrams */}
        <NeuralNetwork3D />

        <NavigationWrapper isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

        {/* Main Content */}
        <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/login" element={<LoginView />} />
                <Route path="/signup" element={<SignupView />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <HomeView />
                  </ProtectedRoute>
                } />
                <Route path="/decisions" element={
                  <ProtectedRoute>
                    <DecisionsView />
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <AnalyticsView />
                  </ProtectedRoute>
                } />
                <Route path="/insights" element={
                  <ProtectedRoute>
                    <InsightsView />
                  </ProtectedRoute>
                } />
                <Route path="/about" element={
                  <ProtectedRoute>
                    <AboutView />
                  </ProtectedRoute>
                } />
              </Routes>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

export default function HealthScore({ healthScore, isLoading = false }) {
  const [displayScore, setDisplayScore] = useState(0);

  // Animate score count-up
  useEffect(() => {
    if (!healthScore || isLoading) return;
    
    const targetScore = healthScore.score || 0;
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = targetScore / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, targetScore);
      setDisplayScore(current);

      if (step >= steps) {
        setDisplayScore(targetScore);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [healthScore, isLoading]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-64 h-64 rounded-full bg-slate-100 animate-pulse"></div>
        <div className="mt-6 h-8 w-32 bg-slate-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!healthScore) {
    return null;
  }

  const {
    score = 0,
    grade = 'C',
    status = 'Fair',
    trend = 'stable',
    breakdown = {},
    confidence = 'medium'
  } = healthScore;

  // Determine color based on score
 const getScoreColor = (score) => {
    if (score >= 90) return { bg: 'from-emerald-400 to-green-500', text: 'text-emerald-600', ring: 'stroke-emerald-500' };
    if (score >= 80) return { bg: 'from-green-400 to-lime-500', text: 'text-green-600', ring: 'stroke-green-500' };
    if (score >= 70) return { bg: 'from-lime-400 to-yellow-500', text: 'text-lime-600', ring: 'stroke-lime-500' };
    if (score >= 60) return { bg: 'from-yellow-400 to-amber-500', text: 'text-yellow-600', ring: 'stroke-yellow-500' };
    if (score >= 50) return { bg: 'from-orange-400 to-red-500', text: 'text-orange-600', ring: 'stroke-orange-500' };
    return { bg: 'from-red-500 to-rose-600', text: 'text-red-600', ring: 'stroke-red-500' };
  };

  const colors = getScoreColor(score);
  const circumference = 2 * Math.PI * 100; // radius = 100
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const getTrendIcon = () => {
    if (trend === 'improving') return <TrendingUp className="text-green-600" size={20} />;
    if (trend === 'declining') return <TrendingDown className="text-red-600" size={20} />;
    return <Minus className="text-slate-300" size={20} />;
  };

  const getTrendText = () => {
    if (trend === 'improving') return { text: 'Improving', color: 'text-green-600' };
    if (trend === 'declining') return { text: 'Declining', color: 'text-red-600' };
    return { text: 'Stable', color: 'text-slate-200' };
  };

  const trendInfo = getTrendText();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="flex flex-col items-center"
    >
      {/* Circular Gauge */}
      <div className="relative">
        {/* Background glow */}
        <div className={`absolute inset-0 bg-gradient-to-r ${colors.bg} opacity-20 blur-3xl rounded-full`}></div>

        {/* SVG Circle */}
        <svg className="transform -rotate-90" width="240" height="240">
          {/* Background circle */}
          <circle
            cx="120"
            cy="120"
            r="100"
            stroke="#e2e8f0"
            strokeWidth="16"
            fill="none"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx="120"
            cy="120"
            r="100"
            className={colors.ring}
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
            className="text-center"
          >
            <div className={`text-6xl font-extrabold ${colors.text}`}>
              {Math.round(displayScore)}
            </div>
            <div className="text-2xl font-bold text-slate-300 -mt-1">/ 100</div>
            <div className="mt-2 px-4 py-1 bg-white rounded-full shadow-sm">
              <span className={`text-lg font-bold ${colors.text}`}>{grade}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 text-center"
      >
        <h3 className="text-2xl font-bold text-white">{status}</h3>
        <div className="flex items-center gap-2 justify-center mt-2">
          {getTrendIcon()}
          <span className={`text-sm font-semibold ${trendInfo.color}`}>
            {trendInfo.text}
          </span>
          <span className="text-xs text-slate-300 ml-2">
            ({confidence} confidence)
          </span>
        </div>
      </motion.div>

      {/* Breakdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 w-full max-w-md"
      >
        <div className="bg-white/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Info size={16} className="text-slate-200" />
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
              Score Breakdown
            </h4>
          </div>
          
          <div className="space-y-3">
            {Object.entries({
              'Mood (30%)': breakdown.mood_contribution,
              'Energy (35%)': breakdown.energy_contribution,
              'Stress (25%)': breakdown.stress_contribution,
              'Sleep (10%)': breakdown.sleep_contribution
            }).map(([label, value]) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-200">{label}</span>
                  <span className="font-bold text-white">{value?.toFixed(1) || 0}</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / (label.includes('Energy') ? 35 : label.includes('Mood') ? 30 : label.includes('Stress') ? 25 : 10)) * 100}%` }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                    className={`h-full bg-gradient-to-r ${colors.bg}`}
                  />
                </div>
              </div>
            ))}
            
            {breakdown.consistency_bonus !== 0 && (
              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-200">Consistency Bonus</span>
                  <span className={`font-bold ${breakdown.consistency_bonus > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {breakdown.consistency_bonus > 0 ? '+' : ''}{breakdown.consistency_bonus?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Link2, TrendingUp, TrendingDown } from 'lucide-react';

export default function CorrelationMatrix({ correlations }) {
  if (!correlations || correlations.status !== 'success') {
    return null;
  }

  const { correlations: corrList = [], strongest_correlation } = correlations;

  // Helper to get correlation color
  const getCorrelationColor = (coefficient) => {
    const abs = Math.abs(coefficient);
    if (abs >= 0.7) {
      return coefficient > 0
        ? 'from-green-500 to-emerald-600'
        : 'from-red-500 to-rose-600';
    } else if (abs >= 0.4) {
      return coefficient > 0
        ? 'from-blue-400 to-cyan-500'
        : 'from-orange-400 to-amber-500';
    }
    return 'from-slate-300 to-gray-400';
  };

  const getStrengthLabel = (strength) => {
    const labels = {
      strong: { text: 'Strong', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
      moderate: { text: 'Moderate', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
      weak: { text: 'Weak', color: 'text-slate-200', bg: 'bg-slate-50', border: 'border-slate-200' },
      negligible: { text: 'Negligible', color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' }
    };
    return labels[strength] || labels.weak;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link2 className="text-indigo-600" size={24} />
        <h2 className="text-2xl font-bold text-white">Metric Correlations</h2>
      </div>

      {/* Strongest Correlation Highlight */}
      {strongest_correlation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center border-2 border-indigo-300 shadow-sm">
              <TrendingUp className="text-indigo-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-indigo-900 mb-1">
                Strongest Connection Detected
              </h3>
              <p className="text-indigo-700">
                <span className="font-bold capitalize">{strongest_correlation.metrics[0]}</span>
                {' and '}
                <span className="font-bold capitalize">{strongest_correlation.metrics[1]}</span>
                {' are '}
                <span className="font-bold">{strongest_correlation.strength}ly</span>
                {' correlated '}
                ({Math.abs(strongest_correlation.coefficient * 100).toFixed(0)}%)
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-3xl font-extrabold text-indigo-600">
                {(strongest_correlation.coefficient * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-indigo-600 font-semibold uppercase">
                {strongest_correlation.direction}
              </div>  
            </div>
          </div>
        </motion.div>
      )}

      {/* Correlation Grid */}
      <div className="grid gap-4">
        {corrList.map((corr, index) => {
          const strengthInfo = getStrengthLabel(corr.strength);
          const gradientColor = getCorrelationColor(corr.coefficient);
          const percentage = (corr.coefficient * 100).toFixed(0);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border-2 border-slate-200 rounded-xl p-5 hover-lift"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Metrics */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-slate-900 capitalize">{corr.metrics[0]}</span>
                    <span className="text-slate-600">↔️</span>
                    <span className="font-bold text-slate-900 capitalize">{corr.metrics[1]}</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.abs(percentage)}%` }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                      className={`h-full bg-gradient-to-r ${gradientColor}`}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="text-2xl font-extrabold text-slate-900">
                    {percentage}%
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${strengthInfo.bg} ${strengthInfo.color} ${strengthInfo.border}`}>
                    {strengthInfo.text}
                  </span>
                </div>
              </div>

              {/* Direction indicator */}
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                {corr.direction === 'positive' ? (
                  <>
                    <TrendingUp size={16} className="text-green-600" />
                    <span>When one increases, the other tends to increase</span>
                  </>
                ) : (
                  <>
                    <TrendingDown size={16} className="text-red-600" />
                    <span>When one increases, the other tends to decrease</span>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Insights from correlations */}
      {correlations.insights && correlations.insights.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6">
          <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
            <span>💡</span>
            Key Insights
          </h3>
          <div className="space-y-3">
            {correlations.insights.map((insight, idx) => (
              <div key={idx} className="bg-white/70 rounded-lg p-4">
                <p className="text-sm text-amber-900 leading-relaxed">
                  {insight.message}
                </p>
                {insight.actionable && insight.recommendation && (
                  <p className="text-sm text-amber-700 mt-2 font-semibold">
                    💡 {insight.recommendation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

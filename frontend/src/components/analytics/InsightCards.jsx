import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  Info, 
  TrendingUp, 
  Award, 
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

export default function InsightCards({ insights = [], recommendations = [] }) {
  const [expandedInsight, setExpandedInsight] = useState(null);
  const [expandedRec, setExpandedRec] = useState(null);

  const getInsightIcon = (type) => {
    const icons = {
      achievement: Award,
      alert: AlertCircle,
      warning: AlertCircle,
      information: Info,
      discovery: Lightbulb
    };
    return icons[type] || Info;
  };

  const getInsightColor = (priority) => {
    const colors = {
      high: {
        bg: 'bg-gradient-to-br from-red-900/20 to-orange-900/20',
        border: 'border-red-500/30',
        icon: 'text-red-400',
        badge: 'bg-red-500/20 text-red-300'
      },
      medium: {
        bg: 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20',
        border: 'border-blue-500/30',
        icon: 'text-blue-400',
        badge: 'bg-blue-500/20 text-blue-300'
      },
      low: {
        bg: 'bg-gradient-to-br from-slate-900/20 to-gray-900/20',
        border: 'border-slate-500/30',
        icon: 'text-slate-400',
        badge: 'bg-slate-500/20 text-slate-300'
      }
    };
    return colors[priority] || colors.medium;
  };

  const getRecommendationPriorityColor = (priority) => {
    if (priority === 'high') return 'from-purple-500 to-pink-500';
    if (priority === 'medium') return 'from-blue-500 to-cyan-500';
    return 'from-slate-500 to-gray-500';
  };

  return (
    <div className="space-y-8">
      {/* Insights Section */}
      {insights && insights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-indigo-400" size={24} />
            <h2 className="text-2xl font-bold text-white">AI Insights</h2>
            <span className="ml-auto text-sm text-slate-400">{insights.length} insights</span>
          </div>

          <div className="grid gap-4">
            {insights.map((insight, index) => {
              const Icon = getInsightIcon(insight.type);
              const colors = getInsightColor(insight.priority);
              const isExpanded = expandedInsight === index;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-6 hover-lift cursor-pointer`}
                  onClick={() => setExpandedInsight(isExpanded ? null : index)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center border-2 ${colors.border}`}>
                      <Icon className={colors.icon} size={24} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-lg">
                            {insight.icon && <span className="mr-2">{insight.icon}</span>}
                            {insight.title}
                          </h3>
                          <p className="text-slate-300 mt-1 leading-relaxed">
                            {insight.message}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colors.badge}`}>
                            {insight.priority}
                          </span>
                          {insight.actionable && (
                            <button className="text-slate-400 hover:text-white transition-colors">
                              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable action */}
                      <AnimatePresence>
                        {isExpanded && insight.action && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 pt-4 border-t border-slate-500/30"
                          >
                            <div className="bg-white/10 rounded-lg p-4">
                              <p className="text-sm font-semibold text-slate-200 mb-2">
                                💡 Recommended Action:
                              </p>
                              <p className="text-sm text-slate-300">
                                {insight.action}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      {recommendations && recommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-purple-400" size={24} />
            <h2 className="text-2xl font-bold text-white">Personalized Recommendations</h2>
            <span className="ml-auto text-sm text-slate-400">{recommendations.length} recommendations</span>
          </div>

          <div className="grid gap-4">
            {recommendations.map((rec, index) => {
              const isExpanded = expandedRec === index;
              const priorityColor = getRecommendationPriorityColor(rec.priority);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="bg-slate-900/50 border-2 border-slate-700/50 rounded-2xl overflow-hidden hover-lift"
                >
                  {/* Priority gradient bar */}
                  <div className={`h-2 bg-gradient-to-r ${priorityColor}`}></div>

                  <div className="p-6">
                    <div 
                      className="cursor-pointer"
                      onClick={() => setExpandedRec(isExpanded ? null : index)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {rec.icon && <span className="text-2xl">{rec.icon}</span>}
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              {rec.category}
                            </span>
                          </div>
                          <h3 className="font-bold text-xl text-white">
                            {rec.title}
                          </h3>
                          <p className="text-slate-300 mt-2">
                            {rec.description}
                          </p>
                        </div>
                        
                        <button className="flex-shrink-0 text-slate-400 hover:text-white transition-colors">
                          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable actions */}
                    <AnimatePresence>
                      {isExpanded && rec.actions && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-6"
                        >
                          <div className="bg-gradient-to-br from-slate-900/30 to-indigo-900/30 rounded-xl p-5 border border-slate-700/50">
                            <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                              <span>✅</span>
                              Action Steps:
                            </h4>
                            <ul className="space-y-2">
                              {rec.actions.map((action, idx) => (
                                <motion.li
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  className="flex items-start gap-3 text-sm text-slate-300"
                                >
                                  <span className="flex-shrink-0 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold text-indigo-400 border border-indigo-500/30">
                                    {idx + 1}
                                  </span>
                                  <span className="flex-1 pt-0.5">{action}</span>
                                </motion.li>
                              ))}
                            </ul>
                            
                            {rec.potential_impact && (
                              <div className="mt-4 pt-4 border-t border-slate-700/50">
                                <p className="text-sm">
                                  <span className="font-semibold text-slate-400">Potential Impact:</span>{' '}
                                  <span className="text-indigo-400 font-bold">{rec.potential_impact}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!insights || insights.length === 0) && (!recommendations || recommendations.length === 0) && (
        <div className="text-center py-16 bg-white/5 rounded-2xl border-2 border-dashed border-slate-700/50">
          <Lightbulb className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-400 mb-2">No Insights Yet</h3>
          <p className="text-slate-500">
            Keep logging your daily metrics to unlock personalized insights and recommendations.
          </p>
        </div>
      )}
    </div>
  );
}

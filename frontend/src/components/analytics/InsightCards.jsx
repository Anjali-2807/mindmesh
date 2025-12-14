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
        bg: 'bg-gradient-to-br from-red-50 to-orange-50',
        border: 'border-red-200',
        icon: 'text-red-600',
        badge: 'bg-red-100 text-red-700'
      },
      medium: {
        bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700'
      },
      low: {
        bg: 'bg-gradient-to-br from-slate-50 to-gray-50',
        border: 'border-slate-200',
        icon: 'text-slate-700',
        badge: 'bg-slate-100 text-slate-700'
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
            <Sparkles className="text-indigo-600" size={24} />
            <h2 className="text-2xl font-bold text-slate-900">AI Insights</h2>
            <span className="ml-auto text-sm text-slate-600">{insights.length} insights</span>
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
                          <h3 className="font-bold text-slate-900 text-lg">
                            {insight.icon && <span className="mr-2">{insight.icon}</span>}
                            {insight.title}
                          </h3>
                          <p className="text-slate-700 mt-1 leading-relaxed">
                            {insight.message}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colors.badge}`}>
                            {insight.priority}
                          </span>
                          {insight.actionable && (
                            <button className="text-slate-700 hover:text-slate-900 transition-colors">
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
                            className="mt-4 pt-4 border-t border-slate-200"
                          >
                            <div className="bg-white/60 rounded-lg p-4">
                              <p className="text-sm font-semibold text-slate-700 mb-2">
                                💡 Recommended Action:
                              </p>
                              <p className="text-sm text-slate-700">
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
            <TrendingUp className="text-purple-600" size={24} />
            <h2 className="text-2xl font-bold text-slate-900">Personalized Recommendations</h2>
            <span className="ml-auto text-sm text-slate-600">{recommendations.length} recommendations</span>
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
                  className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden hover-lift"
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
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                              {rec.category}
                            </span>
                          </div>
                          <h3 className="font-bold text-xl text-slate-900">
                            {rec.title}
                          </h3>
                          <p className="text-slate-700 mt-2">
                            {rec.description}
                          </p>
                        </div>
                        
                        <button className="flex-shrink-0 text-slate-700 hover:text-slate-900 transition-colors">
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
                          <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-xl p-5 border border-slate-200">
                            <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
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
                                  className="flex items-start gap-3 text-sm text-slate-700"
                                >
                                  <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 border border-indigo-200">
                                    {idx + 1}
                                  </span>
                                  <span className="flex-1 pt-0.5">{action}</span>
                                </motion.li>
                              ))}
                            </ul>
                            
                            {rec.potential_impact && (
                              <div className="mt-4 pt-4 border-t border-slate-200">
                                <p className="text-sm">
                                  <span className="font-semibold text-slate-700">Potential Impact:</span>{' '}
                                  <span className="text-indigo-600 font-bold">{rec.potential_impact}</span>
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
        <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
          <Lightbulb className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">No Insights Yet</h3>
          <p className="text-slate-700">
            Keep logging your daily metrics to unlock personalized insights and recommendations.
          </p>
        </div>
      )}
    </div>
  );
}

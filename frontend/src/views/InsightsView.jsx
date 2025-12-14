import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertTriangle, Award, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import axios from 'axios';
import Card from '../components/common/Card';
import { LoadingCard } from '../components/common/Loading';

const API_URL = 'http://127.0.0.1:5001/api';

export default function InsightsView() {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/insights`);
      setInsights(response.data);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInsights = insights.filter(insight => {
    if (filter === 'all') return true;
    return insight.insight_type === filter;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent tracking-tight">
          AI Insights
        </h1>
        <p className="text-slate-200 text-lg mt-2 font-medium">
          Personalized recommendations based on your patterns
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterButton
          label="All Insights"
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          count={insights.length}
        />
        <FilterButton
          label="Trends"
          active={filter === 'trend'}
          onClick={() => setFilter('trend')}
          count={insights.filter(i => i.insight_type === 'trend').length}
        />
        <FilterButton
          label="Warnings"
          active={filter === 'warning'}
          onClick={() => setFilter('warning')}
          count={insights.filter(i => i.insight_type === 'warning').length}
        />
        <FilterButton
          label="Achievements"
          active={filter === 'achievement'}
          onClick={() => setFilter('achievement')}
          count={insights.filter(i => i.insight_type === 'achievement').length}
        />
        <FilterButton
          label="Alerts"
          active={filter === 'alert'}
          onClick={() => setFilter('alert')}
          count={insights.filter(i => i.insight_type === 'alert').length}
        />
      </div>

      {/* Insights List */}
      {filteredInsights.length === 0 ? (
        <Card className="text-center py-16">
          <Lightbulb size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-200 text-lg mb-2">No insights yet</p>
          <p className="text-slate-300 text-sm">Keep logging to get personalized AI insights</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInsights.map(insight => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onDismiss={() => {
                setInsights(insights.filter(i => i.id !== insight.id));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterButton({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
        active
          ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
          : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-amber-300'
      }`}
    >
      {label}
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
        active ? 'bg-white/20' : 'bg-slate-100'
      }`}>
        {count}
      </span>
    </button>
  );
}

function InsightCard({ insight, onDismiss }) {
  const getIcon = () => {
    const icons = {
      trend: <TrendingUp size={24} />,
      warning: <AlertTriangle size={24} />,
      achievement: <Award size={24} />,
      alert: <AlertTriangle size={24} />,
      anomaly: <Lightbulb size={24} />
    };
    return icons[insight.insight_type] || <Lightbulb size={24} />;
  };

  const getColor = () => {
    if (insight.priority === 'high' || insight.priority === 'critical') {
      return {
        bg: 'bg-red-50 border-red-200',
        icon: 'bg-red-500 text-white',
        badge: 'bg-red-100 text-red-700'
      };
    }
    if (insight.priority === 'medium') {
      return {
        bg: 'bg-amber-50 border-amber-200',
        icon: 'bg-amber-500 text-white',
        badge: 'bg-amber-100 text-amber-700'
      };
    }
    if (insight.insight_type === 'achievement') {
      return {
        bg: 'bg-green-50 border-green-200',
        icon: 'bg-green-500 text-white',
        badge: 'bg-green-100 text-green-700'
      };
    }
    return {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'bg-blue-500 text-white',
      badge: 'bg-blue-100 text-blue-700'
    };
  };

  const colors = getColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      layout
    >
      <Card className={`${colors.bg} border-2 relative`}>
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-slate-300 hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4 pr-8">
          <div className={`w-12 h-12 ${colors.icon} rounded-xl flex items-center justify-center flex-shrink-0`}>
            {getIcon()}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-white text-lg">{insight.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colors.badge}`}>
                {insight.priority}
              </span>
            </div>

            <p className="text-slate-200 leading-relaxed mb-4">{insight.message}</p>

            {insight.related_metric && (
              <div className="bg-white/50 px-4 py-2 rounded-lg inline-block text-sm">
                <span className="text-slate-200 font-medium">Related to: </span>
                <span className="font-bold text-white capitalize">{insight.related_metric}</span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-300 font-medium">Was this insight helpful?</span>
              <button className="p-2 hover:bg-white rounded-lg transition-colors">
                <ThumbsUp size={14} className="text-slate-200" />
              </button>
              <button className="p-2 hover:bg-white rounded-lg transition-colors">
                <ThumbsDown size={14} className="text-slate-200" />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertTriangle, Award, X, ThumbsUp, ThumbsDown, Calendar } from 'lucide-react';
import axios from 'axios';
import Card from '../components/common/Card';
import { LoadingCard } from '../components/common/Loading';
import InsightCards from '../components/analytics/InsightCards';

const API_URL = 'http://127.0.0.1:5001/api';

export default function InsightsView() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/analytics/advanced?days=${timeRange}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
    );
  }

  if (!analytics || analytics.status === 'no_data') {
    return (
      <Card className="text-center py-16">
        <Lightbulb size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="text-slate-200 text-lg mb-2">No insights yet</p>
        <p className="text-slate-300 text-sm">Keep logging to get personalized AI insights</p>
      </Card>
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
          Personalized recommendations and patterns based on your data
        </p>
      </div>

      {/* Time Range Selector */}
      <TimeRangeSelector value={timeRange} onChange={setTimeRange} />

      {/* AI Insights & Recommendations */}
      <InsightCards
        insights={analytics.insights || []}
        recommendations={analytics.recommendations || []}
      />

      {/* Detected Cycles */}
      {analytics.cycles && analytics.cycles.status === 'success' && analytics.cycles.cycles.length > 0 && (
        <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-2 border-cyan-500/30">
          <h3 className="font-bold text-white mb-4 text-xl flex items-center gap-2">
            <Calendar size={24} className="text-cyan-400" />
            Detected Cycles
          </h3>
          <div className="space-y-4">
            {analytics.cycles.cycles.map((cycle, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-5 border border-cyan-500/20">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      cycle.type === 'weekly' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {cycle.type} pattern
                    </span>
                    <h4 className="font-bold text-white mt-2 capitalize">{cycle.metric}</h4>
                  </div>
                </div>
                <p className="text-slate-300 mb-3">{cycle.message}</p>
                {cycle.weekday_avg && cycle.weekend_avg && (
                  <div className="flex gap-4 text-sm">
                    <div className="flex-1 bg-white/5 rounded-lg p-3">
                      <div className="text-slate-400 font-semibold mb-1">Weekday Avg</div>
                      <div className="text-2xl font-bold text-white">{cycle.weekday_avg}</div>
                    </div>
                    <div className="flex-1 bg-cyan-500/10 rounded-lg p-3">
                      <div className="text-cyan-400 font-semibold mb-1">Weekend Avg</div>
                      <div className="text-2xl font-bold text-cyan-300">{cycle.weekend_avg}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Weekly Summary */}
      {analytics.weekly_summary && analytics.weekly_summary.status === 'success' && (
        <Card className="bg-gradient-to-br from-violet-900/20 to-pink-900/20 border-2 border-violet-500/30">
          <h3 className="font-bold text-white mb-2 text-xl">Weekly Summary</h3>
          <p className="text-slate-300 mb-6">{analytics.weekly_summary.summary}</p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Highlights */}
            {analytics.weekly_summary.highlights.length > 0 && (
              <div>
                <h4 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                  <span>✨</span> Highlights
                </h4>
                <ul className="space-y-2">
                  {analytics.weekly_summary.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-green-200 bg-green-500/10 rounded-lg p-3">
                      <span>✓</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Lowlights */}
            {analytics.weekly_summary.lowlights.length > 0 && (
              <div>
                <h4 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
                  <span>⚠️</span> Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  {analytics.weekly_summary.lowlights.map((lowlight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-amber-200 bg-amber-500/10 rounded-lg p-3">
                      <span>→</span>
                      <span>{lowlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Achievements */}
          {analytics.weekly_summary.achievements.length > 0 && (
            <div className="mt-6 pt-6 border-t border-violet-500/30">
              <h4 className="font-bold text-indigo-300 mb-4">🏆 Achievements Unlocked</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {analytics.weekly_summary.achievements.map((achievement, idx) => (
                  <div key={idx} className="bg-white/5 rounded-xl p-4 text-center border-2 border-indigo-500/20">
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <div className="font-bold text-white text-sm">{achievement.title}</div>
                    <div className="text-xs text-slate-400 mt-1">{achievement.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function TimeRangeSelector({ value, onChange }) {
  const options = [
    { label: '7 Days', value: 7 },
    { label: '30 Days', value: 30 },
    { label: '90 Days', value: 90 }
  ];

  return (
    <div className="flex gap-2">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            value === option.value
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
              : 'bg-white/5 text-slate-300 border-2 border-slate-700/50 hover:border-amber-400 hover:bg-white/10'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
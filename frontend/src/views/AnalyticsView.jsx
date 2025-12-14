import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Moon, Calendar, Activity } from 'lucide-react';
import axios from 'axios';
import Card from '../components/common/Card';
import { LoadingCard } from '../components/common/Loading';

// New analytics components
import HealthScore from '../components/analytics/HealthScore';
import InsightCards from '../components/analytics/InsightCards';
import CorrelationMatrix from '../components/analytics/CorrelationMatrix';

const API_URL = 'http://127.0.0.1:5001/api';

export default function AnalyticsView() {
  const [logs, setLogs] = useState([]);
  const [advancedAnalytics, setAdvancedAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [logsRes, advancedRes] = await Promise.all([
        axios.get(`${API_URL}/history?days=${timeRange}`),
        axios.get(`${API_URL}/analytics/advanced?days=${timeRange}`)
      ]);
      setLogs(logsRes.data);
      setAdvancedAnalytics(advancedRes.data);
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

  if (!advancedAnalytics || advancedAnalytics.status === 'no_data') {
    return (
      <Card className="text-center py-16">
        <Activity className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 text-lg mb-4">No data available yet</p>
        <p className="text-slate-500 text-sm">Start logging your daily metrics to unlock advanced analytics and insights</p>
      </Card>
    );
  }

  // Create chart data from logs (don't mutate original array)
  // Include time to ensure each entry is unique even on the same date
  const chartData = logs && logs.length > 0
    ? [...logs].reverse().map(log => {
        const timestamp = new Date(log.timestamp);
        const dateStr = timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const timeStr = timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        return {
          date: `${dateStr} ${timeStr}`,
          mood: log.mood,
          energy: log.energy,
          stress: log.stress,
          sleep: log.sleep
        };
      })
    : [];

  // Debug logging
  console.log('=== ANALYTICS DEBUG ===');
  console.log('logs:', logs);
  console.log('logs.length:', logs?.length);
  console.log('chartData:', chartData);
  console.log('chartData.length:', chartData?.length);
  console.log('Sample chartData[0]:', chartData?.[0]);

  // Prepare forecast data
  const forecastData = advancedAnalytics.forecast?.status === 'success'
    ? ['mood', 'energy', 'stress', 'sleep'].map(metric => {
        const pred = advancedAnalytics.forecast.predictions[metric];
        return {
          metric: metric.charAt(0).toUpperCase() + metric.slice(1),
          current: pred?.current_avg || 0,
          predicted: pred?.values[6] || 0,
          trend: pred?.trend || 'stable',
          confidence: pred?.confidence || 'low'
        };
      })
    : [];

  return (
    <div className="space-y-8 animate-fade-in-scale">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent tracking-tight">
            Advanced Analytics
          </h1>
          <p className="text-slate-600 text-lg mt-2 font-medium">
            {advancedAnalytics.data_points} data points • {advancedAnalytics.period} analysis
          </p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Health Score Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 border-2 border-indigo-200 rounded-3xl p-8 shadow-xl"
      >
        <HealthScore 
          healthScore={advancedAnalytics.health_score} 
          isLoading={isLoading} 
        />
      </motion.div>

      {/* Insights & Recommendations */}
      <InsightCards
        insights={advancedAnalytics.insights || []}
        recommendations={advancedAnalytics.recommendations || []}
      />

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-white rounded-xl p-2 border-2 border-slate-200 shadow-sm">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'forecast', label: 'Forecast', icon: TrendingUp },
          { id: 'patterns', label: 'Patterns', icon: Calendar }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Main Trend Chart */}
          <Card className="hover-lift">
            <h3 className="font-bold text-slate-900 mb-6 text-xl flex items-center gap-2">
              <Activity size={24} className="text-indigo-600" />
              Metric Trends Over Time
            </h3>
            {chartData && chartData.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <AreaChart width={800} height={400} data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} />
                  <YAxis domain={[0, 5]} tick={{fontSize: 12, fill: '#64748b'}} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' }} />
                  <Legend wrapperStyle={{fontSize: '13px', fontWeight: 600}} align="center" />
                  <Area type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" name="Mood" activeDot={{ r: 6, strokeWidth: 2, stroke: '#059669' }} dot={{ r: 3, fill: '#10b981' }} />
                  <Area type="monotone" dataKey="energy" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorEnergy)" name="Energy" activeDot={{ r: 6, strokeWidth: 2, stroke: '#4f46e5' }} dot={{ r: 3, fill: '#6366f1' }} />
                  <Area type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorStress)" name="Stress" activeDot={{ r: 6, strokeWidth: 2, stroke: '#dc2626' }} dot={{ r: 3, fill: '#ef4444' }} />
                </AreaChart>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
                <Activity className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-lg font-semibold">No chart data available</p>
                <p className="text-sm">Chart will appear when data is loaded</p>
                <p className="text-xs mt-2">Debug: chartData.length = {chartData?.length || 0}</p>
              </div>
            )}
          </Card>

          {/* Sleep Chart */}
          <Card className="hover-lift">
            <h3 className="font-bold text-slate-900 mb-6 text-xl flex items-center gap-2">
              <Moon size={24} className="text-purple-600" />
              Sleep Patterns
            </h3>
            <div className="w-full overflow-x-auto">
              <BarChart width={800} height={300} data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis domain={[0, 12]} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
                <Bar dataKey="sleep" fill="#8b5cf6" radius={[10, 10, 0, 0]} name="Hours of Sleep" />
              </BarChart>
            </div>
          </Card>

          {/* Correlations */}
          <CorrelationMatrix correlations={advancedAnalytics.correlations} />
        </div>
      )}

      {activeTab === 'forecast' && (
        <div className="space-y-8">
          {/* Forecast Summary */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <h3 className="font-bold text-purple-900 mb-4 text-xl flex items-center gap-2">
              <TrendingUp size={24} />
              7-Day Forecast
            </h3>
            <p className="text-purple-700 mb-6">
              Based on your recent patterns, here's what we predict for the next week:
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {forecastData.map(item => (
                <div key={item.metric} className="bg-white rounded-xl p-4 border-2 border-purple-100">
                  <div className="text-sm font-semibold text-purple-700 mb-2">{item.metric}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{item.current.toFixed(1)}</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-2xl font-bold text-purple-600">{item.predicted.toFixed(1)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    {item.trend === 'improving' && <TrendingUp size={14} className="text-green-600" />}
                    {item.trend === 'declining' && <TrendingDown size={14} className="text-red-600" />}
                    {item.trend === 'stable' && <Minus size={14} className="text-slate-600" />}
                    <span className="capitalize text-slate-600">{item.trend}</span>
                    <span className="ml-auto text-slate-500">({item.confidence})</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Anomalies */}
          {advancedAnalytics.anomalies && advancedAnalytics.anomalies.length > 0 && (
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
              <h3 className="font-bold text-amber-900 mb-4 text-xl flex items-center gap-2">
                <AlertTriangle size={24} />
                Detected Anomalies
              </h3>
              <div className="space-y-3">
                {advancedAnalytics.anomalies.map((anomaly, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 border border-amber-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="capitalize font-bold text-slate-900">{anomaly.metric}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            anomaly.type === 'spike' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {anomaly.type}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            anomaly.severity === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {anomaly.severity}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{anomaly.message}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl font-bold text-slate-900">{anomaly.value}</div>
                        <div className="text-xs text-slate-500">{anomaly.expected_range}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'patterns' && (
        <div className="space-y-8">
          {/* Cycles */}
          {advancedAnalytics.cycles && advancedAnalytics.cycles.status === 'success' && advancedAnalytics.cycles.cycles.length > 0 && (
            <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200">
              <h3 className="font-bold text-cyan-900 mb-4 text-xl flex items-center gap-2">
                <Calendar size={24} />
                Detected Cycles
              </h3>
              <div className="space-y-4">
                {advancedAnalytics.cycles.cycles.map((cycle, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-5 border border-cyan-200">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          cycle.type === 'weekly' ? 'bg-cyan-100 text-cyan-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {cycle.type} pattern
                        </span>
                        <h4 className="font-bold text-slate-900 mt-2 capitalize">{cycle.metric}</h4>
                      </div>
                    </div>
                    <p className="text-slate-700 mb-3">{cycle.message}</p>
                    {cycle.weekday_avg && cycle.weekend_avg && (
                      <div className="flex gap-4 text-sm">
                        <div className="flex-1 bg-slate-50 rounded-lg p-3">
                          <div className="text-slate-600 font-semibold mb-1">Weekday Avg</div>
                          <div className="text-2xl font-bold text-slate-900">{cycle.weekday_avg}</div>
                        </div>
                        <div className="flex-1 bg-cyan-50 rounded-lg p-3">
                          <div className="text-cyan-700 font-semibold mb-1">Weekend Avg</div>
                          <div className="text-2xl font-bold text-cyan-600">{cycle.weekend_avg}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Weekly Summary */}
          {advancedAnalytics.weekly_summary && advancedAnalytics.weekly_summary.status === 'success' && (
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
              <h3 className="font-bold text-indigo-900 mb-4 text-xl">Weekly Summary</h3>
              <p className="text-lg text-indigo-800 leading-relaxed mb-6">
                {advancedAnalytics.weekly_summary.summary}
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Highlights */}
                {advancedAnalytics.weekly_summary.highlights.length > 0 && (
                  <div>
                    <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                      <span>✨</span> Highlights
                    </h4>
                    <ul className="space-y-2">
                      {advancedAnalytics.weekly_summary.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-green-800 bg-green-50 rounded-lg p-3">
                          <span>✓</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lowlights */}
                {advancedAnalytics.weekly_summary.lowlights.length > 0 && (
                  <div>
                    <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                      <span>⚠️</span> Areas for Improvement
                    </h4>
                    <ul className="space-y-2">
                      {advancedAnalytics.weekly_summary.lowlights.map((lowlight, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 rounded-lg p-3">
                          <span>→</span>
                          <span>{lowlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Achievements */}
              {advancedAnalytics.weekly_summary.achievements.length > 0 && (
                <div className="mt-6 pt-6 border-t border-indigo-200">
                  <h4 className="font-bold text-indigo-900 mb-4">🏆 Achievements Unlocked</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {advancedAnalytics.weekly_summary.achievements.map((achievement, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-4 text-center border-2 border-indigo-100">
                        <div className="text-3xl mb-2">{achievement.icon}</div>
                        <div className="font-bold text-slate-900 text-sm">{achievement.title}</div>
                        <div className="text-xs text-slate-600 mt-1">{achievement.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
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
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all button-press ${
            value === option.value
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
              : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-indigo-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border-2 border-slate-200 shadow-2xl rounded-xl">
        <p className="text-xs font-bold text-slate-600 mb-2">{payload[0].payload.date}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span style={{ color: entry.color }} className="font-semibold">{entry.name}:</span>
            <span className="font-bold" style={{ color: entry.color }}>
              {entry.value.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Zap, Smile, AlertTriangle, Moon } from 'lucide-react';
import axios from 'axios';
import Card from '../components/common/Card';
import { LoadingCard } from '../components/common/Loading';

const API_URL = 'http://127.0.0.1:5001/api';

export default function AnalyticsView() {
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [logsRes, analyticsRes] = await Promise.all([
        axios.get(`${API_URL}/history?days=${timeRange}`),
        axios.get(`${API_URL}/analytics?days=${timeRange}`)
      ]);
      setLogs(logsRes.data);
      setAnalytics(analyticsRes.data);
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
        <p className="text-slate-600 text-lg mb-4">No data available yet</p>
        <p className="text-slate-500 text-sm">Start logging your daily metrics to see analytics</p>
      </Card>
    );
  }

  const chartData = logs.reverse().map(log => ({
    date: new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: log.mood,
    energy: log.energy,
    stress: log.stress,
    sleep: log.sleep
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent tracking-tight">
            Performance Analytics
          </h1>
          <p className="text-slate-600 text-lg mt-2 font-medium">
            {analytics.data_points} data points over {analytics.period}
          </p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Smile}
          label="Avg Mood"
          value={analytics.averages.mood}
          trend={analytics.trends.mood}
          color="emerald"
        />
        <StatCard
          icon={Zap}
          label="Avg Energy"
          value={analytics.averages.energy}
          trend={analytics.trends.energy}
          color="indigo"
        />
        <StatCard
          icon={AlertTriangle}
          label="Avg Stress"
          value={analytics.averages.stress}
          trend={analytics.trends.stress}
          color="red"
          inverted
        />
        <StatCard
          icon={Moon}
          label="Avg Sleep"
          value={analytics.averages.sleep}
          trend={analytics.trends.sleep}
          color="purple"
          unit="hrs"
        />
      </div>

      {/* Main Chart */}
      <Card>
        <h3 className="font-bold text-slate-900 mb-6 text-lg">Trends Over Time</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{fontSize: 11, fill: '#64748b'}} />
            <YAxis domain={[0, 5]} tick={{fontSize: 11, fill: '#64748b'}} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize: '12px', fontWeight: 600}} />
            <Area type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMood)" name="Mood" />
            <Area type="monotone" dataKey="energy" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorEnergy)" name="Energy" />
            <Area type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorStress)" name="Stress" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Sleep Chart */}
      <Card>
        <h3 className="font-bold text-slate-900 mb-6 text-lg">Sleep Patterns</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{fontSize: 11, fill: '#64748b'}} />
            <YAxis domain={[0, 12]} tick={{fontSize: 11, fill: '#64748b'}} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="sleep" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Hours of Sleep" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Patterns */}
      {analytics.patterns && analytics.patterns.length > 0 && (
        <Card className="bg-amber-50/50 border-amber-200">
          <h3 className="font-bold text-slate-900 mb-4 text-lg flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-600" />
            Detected Patterns
          </h3>
          <div className="space-y-3">
            {analytics.patterns.map((pattern, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-amber-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 capitalize">{pattern.type.replace(/_/g, ' ')}</h4>
                    <p className="text-sm text-slate-600 mt-1">{pattern.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(pattern.severity)}`}>
                    {pattern.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, color, inverted = false, unit = '' }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  const getTrendIcon = () => {
    if (trend.direction === 'stable') return <Minus size={16} />;
    if (trend.direction === 'improving') {
      return inverted ? <TrendingDown size={16} /> : <TrendingUp size={16} />;
    }
    return inverted ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
  };

  const getTrendColor = () => {
    if (trend.direction === 'stable') return 'text-slate-500';
    if (trend.direction === 'improving') {
      return inverted ? 'text-red-500' : 'text-green-500';
    }
    return inverted ? 'text-green-500' : 'text-red-500';
  };

  return (
    <Card className={`${colors[color]} border-2`}>
      <div className="flex items-center justify-between mb-3">
        <Icon size={24} />
        <div className={`flex items-center gap-1 ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="text-xs font-bold capitalize">{trend.direction}</span>
        </div>
      </div>
      <p className="text-sm font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold">
        {typeof value === 'number' ? value.toFixed(1) : value}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </p>
    </Card>
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
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
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
      <div className="bg-white p-4 border-2 border-slate-200 shadow-xl rounded-xl">
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

function getSeverityColor(severity) {
  const colors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-blue-100 text-blue-700'
  };
  return colors[severity] || colors.low;
}
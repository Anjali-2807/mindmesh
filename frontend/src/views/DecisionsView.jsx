import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input, { TextArea } from '../components/common/Input';
import MetricInput from '../components/home/MetricInput';
import Loading from '../components/common/Loading';

const API_URL = 'http://127.0.0.1:5001/api';

export default function DecisionsView() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'General',
    cost_impact: 3,
    value: 3,
    urgency: 3
  });
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!form.title.trim()) {
      alert('Please enter a decision title');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await axios.post(`${API_URL}/analyze-decision`, form);
      setAnalysis(response.data);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze decision. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setForm({
      title: '',
      description: '',
      category: 'General',
      cost_impact: 3,
      value: 3,
      urgency: 3
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent tracking-tight">
          Strategic Decisions
        </h1>
        <p className="text-slate-600 text-lg mt-3 font-medium">
          Make smarter choices with AI-powered analysis
        </p>
      </motion.div>

      {!analysis ? (
        /* Decision Form */
        <Card className="border-t-4 border-t-purple-600 shadow-xl">
          <div className="space-y-8">
            <Input
              label="Decision Title"
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              placeholder="What decision are you facing?"
              icon={<Brain size={18} />}
            />

            <TextArea
              label="Additional Details (Optional)"
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
              placeholder="Provide more context about this decision..."
              rows={3}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-500 uppercase tracking-wide font-semibold">
                  Evaluation Factors
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <MetricInput
                label="Long-term Value"
                value={form.value}
                onChange={(v) => setForm({ ...form, value: v })}
                minLabel="Low Impact"
                maxLabel="Life Changing"
                icon="📊"
                iconActive="🌟"
              />

              <MetricInput
                label="Cost / Effort Required"
                value={form.cost_impact}
                onChange={(v) => setForm({ ...form, cost_impact: v })}
                minLabel="Minimal"
                maxLabel="Substantial"
                icon="💰"
                iconActive="💸"
              />

              <MetricInput
                label="Time Urgency"
                value={form.urgency}
                onChange={(v) => setForm({ ...form, urgency: v })}
                minLabel="Can Wait"
                maxLabel="Immediate"
                icon="⏰"
                iconActive="⚡"
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !form.title.trim()}
              className="w-full h-14 text-base"
              variant="primary"
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center gap-3">
                  <Loading size="sm" color="white" />
                  <span>Analyzing Decision...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Brain size={20} />
                  <span>Analyze Decision</span>
                </div>
              )}
            </Button>
          </div>
        </Card>
      ) : (
        /* Analysis Results */
        <div className="space-y-6">
          {/* Verdict Card */}
          <Card className="text-center py-12 bg-gradient-to-br from-slate-50 to-purple-50 border-2 border-purple-200">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              <div className="mb-4">
                {getVerdictIcon(analysis.verdict)}
              </div>
              <h3 className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">
                Recommended Verdict
              </h3>
              <h2 className={`text-5xl font-extrabold mb-4 ${getVerdictColor(analysis.verdict)}`}>
                {analysis.verdict}
              </h2>
              <p className="text-slate-600 max-w-md mx-auto mb-8">
                {analysis.verdict_detail}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <MetricBox
                  label="Decision Score"
                  value={`${analysis.score.toFixed(1)}/10`}
                  subtitle={`Raw: ${analysis.raw_score.toFixed(1)}`}
                />
                <MetricBox
                  label="Confidence"
                  value={`${analysis.confidence.toFixed(0)}%`}
                  subtitle="Analysis certainty"
                />
                <MetricBox
                  label="Your Capacity"
                  value={`${analysis.capacity.toFixed(0)}%`}
                  subtitle={analysis.capacity_confidence}
                />
                <MetricBox
                  label="Best Time"
                  value={analysis.recommendation.best_time}
                  subtitle="Timing advice"
                />
              </div>
            </motion.div>
          </Card>

          {/* Context Card */}
          <Card className="bg-blue-50/50 border-blue-200">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              Your Current Context (Last 7 Days)
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <ContextMetric label="Avg Mood" value={analysis.context.avg_mood} max={5} />
              <ContextMetric label="Avg Energy" value={analysis.context.avg_energy} max={5} />
              <ContextMetric label="Avg Stress" value={analysis.context.avg_stress} max={5} inverted />
            </div>
            <p className="text-sm text-slate-600 mt-4 p-4 bg-white rounded-lg border border-blue-100">
              <strong>Analysis:</strong> {analysis.capacity_message}
            </p>
          </Card>

          {/* Considerations */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-purple-600" />
              Key Considerations
            </h3>
            <ul className="space-y-3">
              {analysis.recommendation.considerations.map((consideration, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>{consideration}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Actions */}
          <Button onClick={handleReset} variant="outline" className="w-full">
            <RefreshCw size={18} />
            Analyze Another Decision
          </Button>
        </div>
      )}
    </div>
  );
}

function MetricBox({ label, value, subtitle }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200">
      <p className="text-xs text-slate-500 font-semibold uppercase mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-xs text-slate-600">{subtitle}</p>
    </div>
  );
}

function ContextMetric({ label, value, max, inverted = false }) {
  const percentage = (value / max) * 100;
  const color = inverted
    ? percentage > 70 ? 'bg-red-500' : percentage > 40 ? 'bg-yellow-500' : 'bg-green-500'
    : percentage > 70 ? 'bg-green-500' : percentage > 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="bg-white p-4 rounded-lg border border-blue-100">
      <p className="text-xs text-slate-600 font-semibold mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-slate-900">{value.toFixed(1)}</span>
        <span className="text-sm text-slate-500">/ {max}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
        <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function getVerdictIcon(verdict) {
  const icons = {
    'Go For It': <CheckCircle size={64} className="text-green-600 mx-auto" />,
    'Proceed with Caution': <AlertCircle size={64} className="text-yellow-600 mx-auto" />,
    'Hold Off': <XCircle size={64} className="text-red-600 mx-auto" />
  };
  return icons[verdict] || <Brain size={64} className="text-slate-600 mx-auto" />;
}

function getVerdictColor(verdict) {
  const colors = {
    'Go For It': 'text-green-600',
    'Proceed with Caution': 'text-yellow-600',
    'Hold Off': 'text-red-600'
  };
  return colors[verdict] || 'text-slate-600';
}
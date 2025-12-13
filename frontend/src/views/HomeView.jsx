import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, AlertTriangle, Clock, Sun, Utensils, Globe, ExternalLink, Stethoscope, Shield } from 'lucide-react';
import axios from 'axios';

// Import Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import MetricInput from '../components/home/MetricInput';
import JournalInput from '../components/home/JournalInput';
import PlanDisplay from '../components/home/PlanDisplay';

const API_URL = 'http://127.0.0.1:5001/api';

export default function HomeView({ setView }) {
  const [form, setForm] = useState({
    mood: 3,
    energy: 3,
    stress: 3,
    sleep: 7
  });
  const [journal, setJournal] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Analyze journal text
  const handleAnalyzeText = async () => {
    if (!journal.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const response = await axios.post(`${API_URL}/analyze-journal`, { text: journal });
      setForm(prevForm => ({
        ...prevForm,
        mood: response.data.mood,
        energy: response.data.energy || prevForm.energy,
        stress: response.data.stress
      }));
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze journal. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit daily log
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/daily-log`, {
        ...form,
        text: journal
      });
      setResult(response.data);
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to create daily log. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setResult(null);
    setJournal('');
    setForm({ mood: 3, energy: 3, stress: 3, sleep: 7 });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
          Daily Optimization
        </h1>
        <p className="text-slate-600 text-lg mt-3 font-medium">
          Calibrate your day with AI-powered insights
        </p>
      </motion.div>

      {!result ? (
        /* Input Form */
        <Card className="border-t-4 border-t-indigo-600 shadow-xl">
          <div className="space-y-8">
            {/* Journal Input */}
            <JournalInput
              value={journal}
              onChange={setJournal}
              onAnalyze={handleAnalyzeText}
              isAnalyzing={isAnalyzing}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-500 uppercase tracking-wide font-semibold">
                  Daily Metrics
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MetricInput
                  label="Mood"
                  value={form.mood}
                  onChange={(v) => setForm({ ...form, mood: v })}
                  minLabel="Negative"
                  maxLabel="Positive"
                  icon="😔"
                  iconActive="😊"
                />
                <MetricInput
                  label="Energy"
                  value={form.energy}
                  onChange={(v) => setForm({ ...form, energy: v })}
                  minLabel="Drained"
                  maxLabel="Vibrant"
                  icon="🔋"
                  iconActive="⚡"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MetricInput
                  label="Stress"
                  value={form.stress}
                  onChange={(v) => setForm({ ...form, stress: v })}
                  minLabel="Calm"
                  maxLabel="Critical"
                  icon="😌"
                  iconActive="😰"
                />
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 tracking-wide flex items-center gap-2">
                    <span className="text-lg">😴</span> Hours Slept
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={form.sleep}
                      onChange={(e) => setForm({ ...form, sleep: parseFloat(e.target.value) || 0 })}
                      className="w-full h-14 pl-4 pr-16 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 uppercase tracking-wider">
                      Hours
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-14 text-base"
              variant="primary"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <Loading size="sm" color="white" />
                  <span>Computing Protocol...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles size={20} />
                  <span>Generate AI Plan</span>
                  <ArrowRight size={20} />
                </div>
              )}
            </Button>
          </div>
        </Card>
      ) : (
        /* Results Display */
        <PlanDisplay result={result} onReset={handleReset} setView={setView} />
      )}
    </div>
  );
}
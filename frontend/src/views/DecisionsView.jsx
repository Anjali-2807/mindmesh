import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, AlertCircle, CheckCircle, XCircle, RefreshCw, MessageCircle, ArrowRight } from 'lucide-react';
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
  
  const [conversationState, setConversationState] = useState('initial'); // initial, gathering, analyzing, complete
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capacity, setCapacity] = useState(null);

  const handleInitialAnalyze = async () => {
    if (!form.title.trim()) {
      alert('Please enter a decision title');
      return;
    }

    setIsAnalyzing(true);
    setConversationState('analyzing');
    
    try {
      const response = await axios.post(`${API_URL}/decision/analyze`, {
        ...form,
        conversation_history: conversationHistory
      });

      if (response.data.needs_more_context) {
        // AI needs more information
        setQuestions(response.data.questions);
        setCapacity(response.data.capacity);
        setConversationState('gathering');
      } else {
        // We have enough context, show analysis
        setAnalysis(response.data);
        setConversationState('complete');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      alert(`Failed to analyze decision: ${error.response?.data?.error || error.message}`);
      setConversationState('initial');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnswerQuestion = async (questionId) => {
    if (!currentAnswer.trim()) {
      alert('Please provide an answer');
      return;
    }

    const question = questions.find(q => q.id === questionId);
    
    // Add to conversation history
    const newHistory = [
      ...conversationHistory,
      {
        question: question.question,
        answer: currentAnswer,
        question_id: questionId
      }
    ];
    setConversationHistory(newHistory);
    setAnswers({ ...answers, [questionId]: currentAnswer });
    setCurrentAnswer('');

    // Check if we need more questions or can analyze
    const answeredCount = Object.keys(answers).length + 1;
    
    if (answeredCount >= questions.length || answeredCount >= 2) {
      // Proceed with analysis
      setIsAnalyzing(true);
      setConversationState('analyzing');
      
      try {
        const response = await axios.post(`${API_URL}/decision/analyze`, {
          ...form,
          conversation_history: newHistory,
          skip_questions: answeredCount >= questions.length
        });

        if (response.data.needs_more_context && response.data.questions) {
          // More questions needed
          setQuestions(response.data.questions);
          setConversationState('gathering');
        } else {
          // Analysis complete
          setAnalysis(response.data);
          setConversationState('complete');
        }
      } catch (error) {
        console.error('Analysis failed:', error);
        alert(`Failed to analyze decision: ${error.response?.data?.error || error.message}`);
        setConversationState('gathering');
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      // Show next question
      setConversationState('gathering');
    }
  };

  const handleSkipQuestions = async () => {
    setIsAnalyzing(true);
    setConversationState('analyzing');
    
    try {
      const response = await axios.post(`${API_URL}/decision/analyze`, {
        ...form,
        conversation_history: conversationHistory,
        skip_questions: true
      });

      setAnalysis(response.data);
      setConversationState('complete');
    } catch (error) {
      console.error('Analysis failed:', error);
      alert(`Failed to analyze decision: ${error.response?.data?.error || error.message}`);
      setConversationState('gathering');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setConversationState('initial');
    setQuestions([]);
    setAnswers({});
    setCurrentAnswer('');
    setConversationHistory([]);
    setCapacity(null);
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
        <p className="text-slate-200 text-lg mt-3 font-medium">
          Context-seeking AI that asks the right questions before advising
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {conversationState === 'initial' && (
          <InitialForm 
            form={form}
            setForm={setForm}
            onAnalyze={handleInitialAnalyze}
            isAnalyzing={isAnalyzing}
          />
        )}

        {conversationState === 'gathering' && (
          <ContextGathering
            questions={questions}
            answers={answers}
            currentAnswer={currentAnswer}
            setCurrentAnswer={setCurrentAnswer}
            conversationHistory={conversationHistory}
            onAnswer={handleAnswerQuestion}
            onSkip={handleSkipQuestions}
            capacity={capacity}
            isAnalyzing={isAnalyzing}
          />
        )}

        {conversationState === 'analyzing' && (
          <AnalyzingState />
        )}

        {conversationState === 'complete' && analysis && (
          <AnalysisResults
            analysis={analysis}
            conversationHistory={conversationHistory}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function InitialForm({ form, setForm, onAnalyze, isAnalyzing }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="border-t-4 border-t-purple-600 shadow-xl">
        <div className="space-y-8">
          {/* Info Banner */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <MessageCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Context-Seeking Intelligence</h3>
                <p className="text-sm text-blue-700">
                  MindMesh will ask clarifying questions to understand your situation before making recommendations. This ensures personalized, reasoned advice.
                </p>
              </div>
            </div>
          </div>

          <Input
            label="Decision Title"
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
            placeholder="What decision are you facing? (e.g., 'Should I accept the new job offer?')"
            icon={<Brain size={18} />}
          />

          <TextArea
            label="Additional Details (Optional but helpful)"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            placeholder="Provide context: timeline, your feelings, concerns, alternatives, who it affects..."
            rows={4}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-700 uppercase tracking-wide font-semibold">
                Quick Assessment (Optional)
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <MetricInput
              label="Expected Value"
              value={form.value}
              onChange={(v) => setForm({ ...form, value: v })}
              minLabel="Low Impact"
              maxLabel="Life Changing"
              icon="📊"
              iconActive="🌟"
            />

            <MetricInput
              label="Cost / Effort"
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
            onClick={onAnalyze}
            disabled={isAnalyzing || !form.title.trim()}
            className="w-full h-14 text-base"
            variant="primary"
          >
            {isAnalyzing ? (
              <div className="flex items-center justify-center gap-3">
                <Loading size="sm" color="white" />
                <span>Analyzing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Brain size={20} />
                <span>Analyze Decision</span>
                <ArrowRight size={20} />
              </div>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function ContextGathering({ questions, answers, currentAnswer, setCurrentAnswer, conversationHistory, onAnswer, onSkip, capacity, isAnalyzing }) {
  const unansweredQuestions = questions.filter(q => !answers[q.id]);
  const currentQuestion = unansweredQuestions[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Capacity Info */}
      {capacity && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide mb-1">Your Current Capacity</h3>
              <p className="text-xs text-indigo-700">{capacity.message}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-600">{capacity.capacity?.toFixed(0)}%</div>
              <div className="text-xs text-indigo-700 capitalize">{capacity.confidence} confidence</div>
            </div>
          </div>
        </Card>
      )}

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <Card>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide mb-4">Context Gathered</h3>
          <div className="space-y-3">
            {conversationHistory.map((exchange, idx) => (
              <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-sm font-semibold text-slate-200 mb-1">Q: {exchange.question}</p>
                <p className="text-sm text-slate-200">A: {exchange.answer}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Current Question */}
      {currentQuestion && (
        <Card className="border-t-4 border-t-purple-600 shadow-xl">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">
                  Let me understand better...
                </h3>
                <p className="text-slate-200 leading-relaxed">
                  {currentQuestion.question}
                </p>
                <div className="mt-1 text-xs text-slate-300">
                  Question {Object.keys(answers).length + 1} of {questions.length}
                </div>
              </div>
            </div>

            <TextArea
              value={currentAnswer}
              onChange={setCurrentAnswer}
              placeholder="Share as much detail as you're comfortable with..."
              rows={4}
            />

            <div className="flex gap-3">
              <Button
                onClick={() => onAnswer(currentQuestion.id)}
                disabled={!currentAnswer.trim() || isAnalyzing}
                className="flex-1"
                variant="primary"
              >
                {isAnalyzing ? (
                  <>
                    <Loading size="sm" color="white" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Answer</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
              <Button
                onClick={onSkip}
                disabled={isAnalyzing}
                variant="outline"
              >
                Skip & Analyze Now
              </Button>
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  );
}

function AnalyzingState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card className="text-center py-16">
        <Loading size="xl" text="Analyzing your decision with full context..." />
        <p className="text-sm text-slate-300 mt-6 max-w-md mx-auto">
          Considering your capacity, situation details, and all provided context to generate reasoned recommendations...
        </p>
      </Card>
    </motion.div>
  );
}

function AnalysisResults({ analysis, conversationHistory, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Context Summary */}
      {conversationHistory.length > 0 && (
        <Card className="bg-blue-50 border-2 border-blue-200">
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-3">
            Analysis Based On
          </h3>
          <div className="text-sm text-blue-700">
            ✅ Your decision details<br />
            ✅ {conversationHistory.length} clarifying question(s) answered<br />
            ✅ Your current capacity: {analysis.capacity?.toFixed(0)}%<br />
            ✅ 7-day wellness context
          </div>
        </Card>
      )}

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
          <h3 className="text-xs text-slate-300 uppercase tracking-widest font-bold mb-2">
            Recommended Verdict
          </h3>
          <h2 className={`text-5xl font-extrabold mb-4 ${getVerdictColor(analysis.verdict)}`}>
            {analysis.verdict}
          </h2>
          <p className="text-slate-200 max-w-md mx-auto mb-8">
            {analysis.verdict_detail}
          </p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <MetricBox
              label="Decision Score"
              value={`${analysis.score?.toFixed(1)}/10`}
              subtitle={`Raw: ${analysis.raw_score?.toFixed(1)}`}
            />
            <MetricBox
              label="Confidence"
              value={`${analysis.confidence?.toFixed(0)}%`}
              subtitle="Analysis certainty"
            />
            <MetricBox
              label="Your Capacity"
              value={`${analysis.capacity?.toFixed(0)}%`}
              subtitle={analysis.capacity_confidence}
            />
            <MetricBox
              label="Best Time"
              value={analysis.recommendation?.best_time || 'Now'}
              subtitle="Timing advice"
            />
          </div>
        </motion.div>
      </Card>

      {/* Reasoning */}
      {analysis.reasoning && (
        <Card>
          <h3 className="font-bold text-white mb-4 text-lg">Detailed Reasoning</h3>
          
          {/* Summary */}
          <div className="bg-indigo-50 rounded-lg p-4 mb-6 border-l-4 border-indigo-600">
            <p className="text-slate-200 leading-relaxed">{analysis.reasoning.summary}</p>
          </div>

          {/* Key Points */}
          {analysis.reasoning.key_points?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-white mb-3">Key Points</h4>
              <ul className="space-y-2">
                {analysis.reasoning.key_points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Opportunities */}
          {analysis.reasoning.opportunities?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle size={18} /> Opportunities
              </h4>
              <ul className="space-y-2">
                {analysis.reasoning.opportunities.map((opp, idx) => (
                  <li key={idx} className="text-sm text-slate-200 bg-green-50 rounded-lg p-3 border border-green-200">
                    {opp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {analysis.reasoning.risks?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <AlertCircle size={18} /> Considerations & Risks
              </h4>
              <ul className="space-y-2">
                {analysis.reasoning.risks.map((risk, idx) => (
                  <li key={idx} className="text-sm text-slate-200 bg-amber-50 rounded-lg p-3 border border-amber-200">
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timing */}
          {analysis.reasoning.timing_advice && (
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
              <h4 className="font-semibold text-blue-900 mb-2">Timing Advice</h4>
              <p className="text-sm text-blue-800">{analysis.reasoning.timing_advice}</p>
            </div>
          )}
        </Card>
      )}

      {/* Context Card */}
      <Card className="bg-blue-50/50 border-blue-200">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-600" />
          Your Current Context (Last 7 Days)
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <ContextMetric label="Avg Mood" value={analysis.context?.avg_mood} max={5} />
          <ContextMetric label="Avg Energy" value={analysis.context?.avg_energy} max={5} />
          <ContextMetric label="Avg Stress" value={analysis.context?.avg_stress} max={5} inverted />
        </div>
        <p className="text-sm text-slate-200 mt-4 p-4 bg-white rounded-lg border border-blue-100">
          <strong>Analysis:</strong> {analysis.capacity_message}
        </p>
      </Card>

      {/* Actions */}
      <Button onClick={onReset} variant="outline" className="w-full">
        <RefreshCw size={18} />
        Analyze Another Decision
      </Button>
    </motion.div>
  );
}

// Helper Components
function MetricBox({ label, value, subtitle }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200">
      <p className="text-xs text-slate-300 font-semibold uppercase mb-1">{label}</p>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-slate-200">{subtitle}</p>
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
      <p className="text-xs text-slate-200 font-semibold mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-white">{value?.toFixed(1)}</span>
        <span className="text-sm text-slate-300">/ {max}</span>
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
  return icons[verdict] || <Brain size={64} className="text-slate-200 mx-auto" />;
}

function getVerdictColor(verdict) {
  const colors = {
    'Go For It': 'text-green-600',
    'Proceed with Caution': 'text-yellow-600',
    'Hold Off': 'text-red-600'
  };
  return colors[verdict] || 'text-slate-200';
}
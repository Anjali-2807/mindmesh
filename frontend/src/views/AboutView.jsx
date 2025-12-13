import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Lightbulb, TrendingUp, Shield, Zap, MessageCircle, CheckCircle } from 'lucide-react';
import Card from '../components/common/Card';

export default function AboutView() {
  const features = [
    {
      icon: Brain,
      title: 'Context-Seeking Intelligence',
      description: 'MindMesh doesn\'t jump to conclusions. It asks precise questions to understand your situation deeply before making recommendations.',
      color: 'indigo'
    },
    {
      icon: MessageCircle,
      title: 'Conversational Analysis',
      description: 'Engage in meaningful dialogue. The AI probes for missing context, explores alternatives, and considers stakeholders.',
      color: 'purple'
    },
    {
      icon: Target,
      title: 'Two-Tier Optimization',
      description: 'Tier 1: Daily wellness tracking with AI protocols. Tier 2: Strategic decision analysis with capacity awareness.',
      color: 'blue'
    },
    {
      icon: TrendingUp,
      title: 'Pattern Recognition',
      description: 'Advanced ML algorithms detect behavioral patterns, predict capacity, and identify trends in your wellness journey.',
      color: 'green'
    },
    {
      icon: Lightbulb,
      title: 'Proactive Insights',
      description: 'Receive AI-generated warnings, achievements, and recommendations based on your historical data and trends.',
      color: 'amber'
    },
    {
      icon: Shield,
      title: 'Safety-First Approach',
      description: '600+ context scenarios with critical situation detection and immediate access to emergency resources.',
      color: 'red'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Daily Check-In',
      description: 'Log your mood, energy, stress, and sleep. Write a journal entry if you want deeper analysis.',
      icon: '📊'
    },
    {
      step: 2,
      title: 'AI Analysis',
      description: 'Our AI analyzes your input, detects context from 600+ scenarios, and assesses your current capacity.',
      icon: '🧠'
    },
    {
      step: 3,
      title: 'Personalized Protocol',
      description: 'Receive customized recommendations for schedule, environment, and nutrition based on your state.',
      icon: '🎯'
    },
    {
      step: 4,
      title: 'Strategic Decisions',
      description: 'When facing big choices, engage with our context-seeking decision analysis for reasoned recommendations.',
      icon: '💡'
    },
    {
      step: 5,
      title: 'Track & Improve',
      description: 'View analytics, identify patterns, and watch your capacity improve over time with data-driven insights.',
      icon: '📈'
    }
  ];

  const principles = [
    {
      icon: CheckCircle,
      title: 'Context Over Speed',
      principle: 'We prioritize gathering sufficient context over giving quick, generic answers.'
    },
    {
      icon: CheckCircle,
      title: 'Reasoning Over Templates',
      principle: 'Every recommendation is reasoned based on your specific situation, not generic advice.'
    },
    {
      icon: CheckCircle,
      title: 'Capacity-Aware',
      principle: 'Decisions account for your current mental and physical capacity, not just external factors.'
    },
    {
      icon: CheckCircle,
      title: 'Privacy-First',
      principle: 'Your data stays with you. No external tracking, no selling your information.'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full mb-6">
          <Brain size={32} />
          <h1 className="text-3xl font-extrabold">MindMesh</h1>
        </div>
        <p className="text-2xl text-slate-700 font-bold mb-4">
          AI-Powered Decision Intelligence System
        </p>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          A context-seeking, reasoning-first platform that helps you make better decisions by understanding your situation deeply, tracking your wellness patterns, and providing personalized, capacity-aware recommendations.
        </p>
      </motion.div>

      {/* What Makes MindMesh Different */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-6">What Makes MindMesh Different?</h2>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Context-Seeking Intelligence</h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Unlike typical chatbots that give instant generic advice, MindMesh <strong>refuses to make recommendations without sufficient context</strong>.
                </p>
                <div className="bg-white/60 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">❌</span>
                    <div>
                      <p className="font-semibold text-slate-900">Generic Systems:</p>
                      <p className="text-sm text-slate-600">"Should I go to the party?" → "Yes, social connections are important!"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">✅</span>
                    <div>
                      <p className="font-semibold text-slate-900">MindMesh:</p>
                      <p className="text-sm text-slate-600">"Should I go to the party?" → "Let me understand better: When is it? How are you feeling today? Do you have work tomorrow? What are your concerns about going or not going?"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Core Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-6">How MindMesh Works</h2>
        <div className="space-y-4">
          {howItWorks.map((step, index) => (
            <HowItWorksCard key={index} step={step} />
          ))}
        </div>
      </div>

      {/* Core Principles */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Core Principles</h2>
        <Card>
          <div className="grid md:grid-cols-2 gap-6">
            {principles.map((principle, index) => (
              <PrincipleCard key={index} principle={principle} />
            ))}
          </div>
        </Card>
      </div>

      {/* Use Cases */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Who Is MindMesh For?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Students</h3>
            <p className="text-slate-700 text-sm">
              Manage exam stress, optimize study schedules, and make career decisions with capacity awareness.
            </p>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Professionals</h3>
            <p className="text-slate-700 text-sm">
              Navigate work decisions, prevent burnout, and maintain work-life balance with data-driven insights.
            </p>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="text-4xl mb-4">🧘</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Anyone Seeking Clarity</h3>
            <p className="text-slate-700 text-sm">
              Make better life decisions through systematic analysis and personalized recommendations.
            </p>
          </Card>
        </div>
      </div>

      {/* Technology */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Powered By Advanced AI</h2>
        <Card className="bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-indigo-300">Machine Learning</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <Zap size={16} className="mt-1 flex-shrink-0 text-indigo-400" />
                  <span>Gradient Boosting for capacity prediction</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap size={16} className="mt-1 flex-shrink-0 text-indigo-400" />
                  <span>Random Forest for mode classification</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap size={16} className="mt-1 flex-shrink-0 text-indigo-400" />
                  <span>Pattern detection algorithms</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-indigo-300">Natural Language Processing</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <Zap size={16} className="mt-1 flex-shrink-0 text-indigo-400" />
                  <span>Zero-shot classification (600+ scenarios)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap size={16} className="mt-1 flex-shrink-0 text-indigo-400" />
                  <span>VADER sentiment analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap size={16} className="mt-1 flex-shrink-0 text-indigo-400" />
                  <span>Context-aware dialogue generation</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-12 border-none">
        <h2 className="text-3xl font-extrabold mb-4">Ready to Think Better?</h2>
        <p className="text-lg text-indigo-100 mb-6 max-w-2xl mx-auto">
          Start your journey to better decisions and optimized wellness with MindMesh.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-lg"
        >
          Get Started →
        </button>
      </Card>
    </div>
  );
}

function FeatureCard({ feature, index }) {
  const Icon = feature.icon;
  const colors = {
    indigo: 'from-indigo-50 to-indigo-100 border-indigo-200',
    purple: 'from-purple-50 to-purple-100 border-purple-200',
    blue: 'from-blue-50 to-blue-100 border-blue-200',
    green: 'from-green-50 to-green-100 border-green-200',
    amber: 'from-amber-50 to-amber-100 border-amber-200',
    red: 'from-red-50 to-red-100 border-red-200'
  };
  
  const iconColors = {
    indigo: 'bg-indigo-600',
    purple: 'bg-purple-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    amber: 'bg-amber-600',
    red: 'bg-red-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`bg-gradient-to-br ${colors[feature.color]} border-2 h-full`}>
        <div className={`w-12 h-12 ${iconColors[feature.color]} rounded-lg flex items-center justify-center mb-4`}>
          <Icon className="text-white" size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
        <p className="text-slate-700 text-sm leading-relaxed">{feature.description}</p>
      </Card>
    </motion.div>
  );
}

function HowItWorksCard({ step }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: step.step * 0.1 }}
    >
      <Card className="hover:shadow-xl transition-shadow">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {step.step}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{step.icon}</span>
              <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">{step.description}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function PrincipleCard({ principle }) {
  const Icon = principle.icon;
  
  return (
    <div className="flex items-start gap-3">
      <Icon className="text-green-600 flex-shrink-0 mt-1" size={20} />
      <div>
        <h4 className="font-bold text-slate-900 mb-1">{principle.title}</h4>
        <p className="text-sm text-slate-600">{principle.principle}</p>
      </div>
    </div>
  );
}
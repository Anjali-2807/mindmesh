import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Sun, Utensils, Globe, ExternalLink, Stethoscope, Shield, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

export default function PlanDisplay({ result, onReset, setView }) {
  const { suggestions, context, web_insights, resources, safety_alert } = result;

  return (
    <div className="space-y-6">
      {/* Safety Alert */}
      {safety_alert && <SafetyAlert alert={safety_alert} />}

      {/* Main Plan Card */}
      <Card className="bg-gradient-to-br from-slate-900 to-indigo-900 text-white border-none shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[120px] opacity-20 -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">
                AI Protocol Generated
              </h2>
              <h3 className="text-3xl font-bold mb-3">{suggestions.title}</h3>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-center">
              <p className="text-xs text-indigo-300 font-bold uppercase">Capacity</p>
              <p className="text-2xl font-bold">{suggestions.capacity}%</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed border-l-4 border-indigo-400 pl-4">
            {suggestions.summary}
          </p>
          {suggestions.mode && (
            <div className="mt-4 inline-flex items-center gap-2 bg-indigo-500/30 px-4 py-2 rounded-lg">
              <span className="text-xs font-bold uppercase tracking-wider">Mode:</span>
              <span className="font-bold">{suggestions.mode}</span>
              <span className="text-xs">({Math.round(suggestions.mode_confidence * 100)}% confidence)</span>
            </div>
          )}
        </div>
      </Card>

      {/* Context Info */}
      {context && (
        <Card className="bg-blue-50/50 border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Globe className="text-white" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white">Context Detected</h4>
              <p className="text-xs text-slate-200">AI analyzed your situation</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-white p-3 rounded-lg">
              <p className="text-xs text-slate-300 font-semibold uppercase">Category</p>
              <p className="font-bold text-white">{context.category}</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-xs text-slate-300 font-semibold uppercase">Confidence</p>
              <p className="font-bold text-white">{Math.round(context.confidence * 100)}%</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-xs text-slate-300 font-semibold uppercase">Urgency</p>
              <p className={`font-bold capitalize ${
                context.urgency === 'critical' ? 'text-red-600' :
                context.urgency === 'high' ? 'text-orange-600' :
                context.urgency === 'medium' ? 'text-yellow-600' :
                'text-green-600'
              }`}>{context.urgency}</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-xs text-slate-300 font-semibold uppercase">Keywords</p>
              <p className="font-bold text-white text-xs truncate">{context.keywords?.join(', ') || 'N/A'}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Action Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <ActionCard
          icon={Clock}
          title="Schedule"
          content={suggestions.schedule}
          color="indigo"
        />
        <ActionCard
          icon={Sun}
          title="Environment"
          content={suggestions.environment}
          color="orange"
        />
        <ActionCard
          icon={Utensils}
          title="Nutrition"
          content={suggestions.nutrition}
          color="emerald"
        />
      </div>

      {/* Web Insights */}
      {web_insights && web_insights.length > 0 && (
        <Card className="bg-purple-50/50 border-purple-200">
          <div className="flex items-center gap-2 mb-4 text-purple-900">
            <Stethoscope size={20} />
            <h3 className="font-bold text-sm uppercase tracking-wide">Research & Resources</h3>
          </div>
          <div className="space-y-3">
            {web_insights.map((insight, idx) => (
              <a
                key={idx}
                href={insight.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white p-4 rounded-lg border border-purple-100 hover:shadow-md transition-all group"
              >
                <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2 group-hover:text-purple-600 transition-colors">
                  {insight.title}
                  <ExternalLink size={12} className="opacity-30 group-hover:opacity-100" />
                </h4>
                <p className="text-slate-200 text-xs leading-relaxed mb-2">{insight.description}</p>
                {insight.solution && (
                  <p className="text-purple-700 text-xs font-medium">{insight.solution}</p>
                )}
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Resources */}
      {resources && resources.length > 0 && (
        <Card className="bg-green-50/50 border-green-200">
          <div className="flex items-center gap-2 mb-4 text-green-900">
            <Shield size={20} />
            <h3 className="font-bold text-sm uppercase tracking-wide">Support Resources</h3>
          </div>
          <div className="grid gap-3">
            {resources.map((resource, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-green-100">
                <h4 className="font-bold text-white text-sm">{resource.name}</h4>
                <p className="text-slate-200 text-xs mt-1">
                  {resource.contact && `Contact: ${resource.contact}`}
                  {resource.url && <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Visit Website</a>}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => setView('decisions')}
          variant="primary"
          className="flex-1"
        >
          Analyze a Decision <ArrowRight size={18} />
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          className="flex-1"
        >
          <RefreshCw size={18} />
          New Log
        </Button>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, content, color }) {
  const colors = {
    indigo: 'text-indigo-600 bg-indigo-50',
    orange: 'text-orange-600 bg-orange-50',
    emerald: 'text-emerald-600 bg-emerald-50'
  };

  return (
    <Card className="hover:shadow-xl transition-shadow">
      <div className={`flex items-center gap-2 mb-3 ${colors[color]} px-3 py-2 rounded-lg w-fit`}>
        <Icon size={16} />
        <span className="font-bold text-xs uppercase tracking-wider">{title}</span>
      </div>
      <p className="text-sm text-slate-200 leading-relaxed">{content}</p>
    </Card>
  );
}

function SafetyAlert({ alert }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border-2 border-red-500 rounded-xl p-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="text-white" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-red-900 mb-2">{alert.title}</h3>
          <p className="text-red-800 text-sm mb-3">{alert.message}</p>
          <p className="text-red-700 text-sm font-semibold mb-3">{alert.action}</p>
          <div className="bg-white border border-red-200 rounded-lg p-3">
            <p className="text-red-900 font-bold text-sm">{alert.helpline}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
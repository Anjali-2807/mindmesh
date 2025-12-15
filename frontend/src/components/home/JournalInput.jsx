import React from 'react';
import { ScanLine, Sparkles } from 'lucide-react';
import Loading from '../common/Loading';

export default function JournalInput({ value, onChange, onAnalyze, isAnalyzing }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <span className="text-lg">✍️</span>
          Quick Journal
        </label>
        <span className="text-xs text-slate-300 font-medium">
          {value.length}/500 characters
        </span>
      </div>
      
      <div className="relative">
        <textarea
          className="w-full p-4 pb-16 rounded-xl bg-slate-50 border-2 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm leading-relaxed resize-none text-slate-900"
          placeholder="How are you feeling right now? What's on your mind? (e.g., 'I slept poorly and feel anxious about a deadline' or 'Having menstrual cramps and low energy today')"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          maxLength={500}
        />
        
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!value.trim() || isAnalyzing}
          className="absolute bottom-3 right-3 bg-slate-800 text-white pl-4 pr-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-slate-900 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
        >
          {isAnalyzing ? (
            <>
              <Loading size="sm" color="white" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>AI Analyze</span>
              <ScanLine size={14} className="text-indigo-400 group-hover:text-white transition-colors" />
            </>
          )}
        </button>
      </div>
      
      <p className="text-xs text-slate-300 mt-2 flex items-center gap-1">
        <Sparkles size={12} />
        AI will detect context and auto-adjust your metrics
      </p>
    </div>
  );
}
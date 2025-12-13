import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Home, Brain, Activity, Clock, Sun, Utensils, Globe, ExternalLink, Lightbulb, Stethoscope, ArrowRight, Sparkles, TrendingUp, Zap, Smile, ScanLine } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = "http://127.0.0.1:5000/api";

export default function App() {
  const [view, setView] = useState('home');

  const renderView = () => {
    switch(view) {
      case 'home': return <HomeView setView={setView} />;
      case 'decisions': return <DecisionsView />;
      case 'history': return <HistoryView />;
      default: return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100">
      <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-md shadow-2xl border-t border-slate-200 p-4 md:top-0 md:bottom-auto md:px-8 z-50">
        <div className="max-w-4xl mx-auto flex justify-around items-center">
          <h1 className="hidden md:block text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-600 rounded-full"></div> MindMesh
          </h1>
          <NavButton active={view === 'home'} onClick={() => setView('home')} icon={<Home size={20} />} label="Daily Log" />
          <NavButton active={view === 'decisions'} onClick={() => setView('decisions')} icon={<Brain size={20} />} label="Strategy" />
          <NavButton active={view === 'history'} onClick={() => setView('history')} icon={<Activity size={20} />} label="Analytics" />
        </div>
      </nav>
      <main className="max-w-2xl mx-auto pt-8 pb-32 md:pt-28 px-6">
        {renderView()}
      </main>
    </div>
  );
}

// --- SHARED COMPONENTS ---
const NavButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
  >
    {icon} <span className="text-xs font-semibold">{label}</span>
  </button>
);

const Card = ({ children, className = "" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} 
    animate={{ opacity: 1, y: 0 }} 
    className={`bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-6 ${className}`}
  >
    {children}
  </motion.div>
);

// --- TOOLTIP UPGRADE (SHOWS TIME) ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; 
    return (
      <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl min-w-[160px]">
        {/* Show Full Date + Time */}
        <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider border-b border-slate-100 pb-2">
          {label}
        </p>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
              <span className="text-sm font-bold text-indigo-900">Energy</span>
            </div>
            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              {data.energy}/5
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-bold text-emerald-900">Mood</span>
            </div>
            <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              {data.mood}/5
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// --- METRIC INPUT COMPONENTS ---
const MetricInput = ({ label, value, onChange, minLabel, maxLabel }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-end">
      <span className="text-sm font-bold text-slate-700 tracking-wide">{label}</span>
      <span className="text-xs font-bold text-indigo-600">{value}/5</span>
    </div>
    <div className="grid grid-cols-5 gap-2">
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          onClick={() => onChange(num)}
          className={`
            h-12 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center
            ${value === num
              ? "bg-slate-900 text-white shadow-md transform scale-[1.02]"
              : "bg-slate-50 text-slate-400 border border-slate-100 hover:border-slate-300 hover:bg-white hover:text-slate-600"}
          `}
        >
          {num}
        </button>
      ))}
    </div>
    <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-400 font-semibold px-1">
      <span>{minLabel}</span>
      <span>{maxLabel}</span>
    </div>
  </div>
);

const SleepInput = ({ value, onChange }) => (
  <div className="space-y-3">
    <span className="text-sm font-bold text-slate-700 tracking-wide">Hours Slept</span>
    <div className="relative">
      <input 
        type="number" step="0.5" min="0" max="24" value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-12 pl-4 pr-12 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 uppercase">Hours</span>
    </div>
  </div>
);

// --- DISPLAY CARDS ---
const SolutionCard = ({ solutions }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5">
    <div className="flex items-center gap-2 mb-4 text-emerald-800">
      <Stethoscope size={18} />
      <h3 className="font-bold text-sm uppercase tracking-wide">Clinical Recommendations</h3>
    </div>
    <div className="space-y-3">
      {solutions.map((item, idx) => (
        <div key={idx} className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm">
          <h4 className="font-bold text-emerald-900 text-sm mb-1">{item.title.replace("Wiki: ", "")} Protocol</h4>
          <p className="text-slate-600 text-sm leading-relaxed">{item.solution}</p>
        </div>
      ))}
    </div>
  </motion.div>
);

const WebInsightsCard = ({ insights }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
    <div className="flex items-center gap-2 mb-4 text-blue-800">
      <Globe size={18} />
      <h3 className="font-bold text-sm uppercase tracking-wide">Scientific Context</h3>
    </div>
    <div className="grid gap-3">
      {insights.map((item, idx) => (
        <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="block bg-white p-4 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all group">
          <h4 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
            {item.title.replace("Wiki: ", "")}
            <ExternalLink size={12} className="opacity-30 group-hover:opacity-100" />
          </h4>
          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{item.description}</p>
        </a>
      ))}
    </div>
  </motion.div>
);

// --- VIEW: HOME ---
const HomeView = ({ setView }) => {
  const [form, setForm] = useState({ mood: 3, energy: 3, stress: 3, sleep: 7 });
  const [journal, setJournal] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [webResults, setWebResults] = useState([]);

  const handleAnalyzeText = async () => {
    if (!journal) return;
    setIsAnalyzing(true);
    try {
      const res = await axios.post(`${API_URL}/analyze-journal`, { text: journal });
      setForm(res.data);
      setIsAnalyzing(false);
    } catch (err) {
      alert("AI Analysis failed: " + err.message);
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const payload = { ...form, text: journal };
      const res = await axios.post(`${API_URL}/daily-log`, payload);
      setResult(res.data.suggestions);
      setWebResults(res.data.web_insights || []);
      setIsLoading(false);
    } catch (err) {
      alert("Error: " + err.message);
      setIsLoading(false);
    }
  };

  const solutions = webResults.filter(item => item.solution);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Morning Log</h2>
        <p className="text-slate-500 font-medium">Calibrate your daily protocol.</p>
      </header>

      {!result ? (
        <Card className="border-t-4 border-t-indigo-600">
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold text-slate-700">Quick Journal</label>
              </div>
              <div className="relative">
                <textarea 
                  className="w-full p-4 pb-14 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm leading-relaxed resize-none h-32" 
                  placeholder="How are you feeling right now? (e.g., 'I slept poorly and feel anxious about a deadline')"
                  value={journal} onChange={(e) => setJournal(e.target.value)}
                />
                <button 
                  onClick={handleAnalyzeText} 
                  disabled={!journal || isAnalyzing} 
                  className="absolute bottom-3 right-3 bg-slate-800 text-white pl-4 pr-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-slate-900 transition-all shadow-md disabled:opacity-50 flex items-center gap-2 group"
                >
                  {isAnalyzing ? "Scanning..." : "Analyze & Mark"} 
                  <ScanLine size={14} className="text-indigo-400 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
            <hr className="border-slate-100" />
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MetricInput label="Mood" value={form.mood} onChange={(v) => setForm({...form, mood: v})} minLabel="Negative" maxLabel="Positive" />
                <MetricInput label="Energy" value={form.energy} onChange={(v) => setForm({...form, energy: v})} minLabel="Drained" maxLabel="Vibrant" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MetricInput label="Stress" value={form.stress} onChange={(v) => setForm({...form, stress: v})} minLabel="Calm" maxLabel="Critical" />
                <SleepInput value={form.sleep} onChange={(v) => setForm({...form, sleep: v})} />
              </div>
            </div>
            <button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? "Computing Protocol..." : <>Generate Plan <ArrowRight size={16} /></>}
            </button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 -mr-16 -mt-16 pointer-events-none"></div>
            <div className="relative z-10">
              <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Operational Strategy</h2>
              <div className="text-3xl font-bold mb-4">{result.title}</div>
              <p className="text-slate-300 text-sm leading-relaxed border-l-2 border-indigo-500 pl-4">{result.summary}</p>
            </div>
          </Card>
          {solutions.length > 0 && <SolutionCard solutions={solutions} />}
          {webResults.length > 0 && <WebInsightsCard insights={webResults} />}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-indigo-600 font-bold text-xs uppercase tracking-wider"><Clock size={16} /> Schedule</div>
              <div className="whitespace-pre-line text-sm text-slate-700 leading-relaxed">{result.schedule}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-orange-500 font-bold text-xs uppercase tracking-wider"><Sun size={16} /> Environment</div>
              <div className="text-sm text-slate-700 leading-relaxed">{result.environment}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-emerald-600 font-bold text-xs uppercase tracking-wider"><Utensils size={16} /> Nutrition</div>
              <div className="text-sm text-slate-700 leading-relaxed">{result.nutrition}</div>
            </div>
          </div>
          <button onClick={() => setView('decisions')} className="w-full text-center text-slate-400 text-xs font-bold uppercase tracking-widest py-4 hover:text-indigo-600 transition-colors">Proceed to Strategic Decisions &rarr;</button>
        </div>
      )}
    </div>
  );
};

// --- VIEW: DECISIONS ---
const DecisionsView = () => {
  const [form, setForm] = useState({ title: '', cost_impact: 3, value: 3, urgency: 3 });
  const [analysis, setAnalysis] = useState(null);

  const analyze = async () => {
    try {
      const res = await axios.post(`${API_URL}/analyze-decision`, form);
      setAnalysis(res.data);
    } catch (err) { alert("Error: " + err.message); }
  };

  return (
    <div className="space-y-6">
      <header><h2 className="text-3xl font-bold text-slate-900">Decision Center</h2><p className="text-slate-500">Tier 2 Strategic Analysis</p></header>
      {!analysis ? (
        <Card>
          <div className="space-y-8">
            <input placeholder="What decision are you facing?" className="w-full p-4 bg-slate-50 rounded-xl outline-none border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg font-medium" onChange={(e) => setForm({...form, title: e.target.value})} />
            <div className="space-y-6">
               <MetricInput label="Long-term Value" value={form.value} onChange={(v) => setForm({...form, value: v})} minLabel="Low Impact" maxLabel="Life Changing" />
               <MetricInput label="Cost / Effort" value={form.cost_impact} onChange={(v) => setForm({...form, cost_impact: v})} minLabel="Easy" maxLabel="Draining" />
               <MetricInput label="Urgency" value={form.urgency} onChange={(v) => setForm({...form, urgency: v})} minLabel="Can Wait" maxLabel="Immediate" />
            </div>
            <button onClick={analyze} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-black transition shadow-lg">Run Analysis</button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="text-center py-10">
            <h3 className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-4">Recommended Verdict</h3>
            <div className="text-4xl font-extrabold text-indigo-600 mb-6">{analysis.verdict}</div>
            <div className="max-w-xs mx-auto bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2"><span>CURRENT CAPACITY</span><span>{analysis.capacity}%</span></div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden"><div className="bg-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${analysis.capacity}%` }}></div></div>
            </div>
            <button onClick={() => setAnalysis(null)} className="mt-8 text-slate-400 hover:text-slate-800 text-sm font-medium">Analyze another decision</button>
          </Card>
        </div>
      )}
    </div>
  );
};

// --- VIEW: HISTORY ---
const HistoryView = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => { axios.get(`${API_URL}/history`).then(res => setData(res.data)); }, []);

  const getAverage = (key) => {
    if (!data.length) return 0;
    const sum = data.reduce((acc, curr) => acc + curr[key], 0);
    return (sum / data.length).toFixed(1);
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analytics Engine</h2>
        <p className="text-slate-500 font-medium">Your biometric performance over time.</p>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 mb-1"><Zap size={16} /><span className="text-xs font-bold uppercase">Avg Energy</span></div>
          <div className="text-2xl font-bold text-slate-900">{getAverage('energy')}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 mb-1"><Smile size={16} /><span className="text-xs font-bold uppercase">Avg Mood</span></div>
          <div className="text-2xl font-bold text-slate-900">{getAverage('mood')}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600 mb-1"><TrendingUp size={16} /><span className="text-xs font-bold uppercase">Data Points</span></div>
          <div className="text-2xl font-bold text-slate-900">{data.length}</div>
        </div>
      </div>

      <Card>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" hide />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }} />
              <Area type="monotone" dataKey="energy" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorEnergy)" dot={{ r: 6, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 8, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" dot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 8, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
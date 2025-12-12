import React from 'react';
import { ShieldCheck, Map, Smartphone, Lock, Zap, Globe } from 'lucide-react';
import { AppView } from '../types';

interface Props {
  onSelect: (view: AppView) => void;
}

const RoleSelection: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

      {/* Hero Section */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/50 border border-slate-700 text-xs font-bold text-emerald-400 mb-8 backdrop-blur-sm animate-in slide-in-from-top-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            LIVE SYSTEM v1.0
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 animate-in fade-in zoom-in duration-700">
          Safety Without <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">Compromise.</span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          The world's first decentralized tourist safety grid. <br className="hidden md:block"/>
          AI-powered anomaly detection meets privacy-preserving SOS protocols.
        </p>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {/* Tourist Card */}
            <button 
            onClick={() => onSelect(AppView.TOURIST_LOGIN)}
            className="group relative p-8 rounded-[2rem] bg-slate-900/40 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] text-left overflow-hidden"
            >
                <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-bl-[100px] transition-transform group-hover:scale-150"></div>
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:rotate-6 transition-transform">
                        <Smartphone className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Tourist App</h2>
                    <p className="text-slate-400 text-sm mb-6">
                        Experience the PWA companion. Generate a digital ID, track safety scores, and trigger SOS alerts.
                    </p>
                    <div className="inline-flex items-center gap-2 text-emerald-400 font-bold text-sm group-hover:translate-x-2 transition-transform">
                        Launch Simulator <Smartphone className="w-4 h-4" />
                    </div>
                </div>
            </button>

            {/* Admin Card */}
            <button 
            onClick={() => onSelect(AppView.ADMIN_DASHBOARD)}
            className="group relative p-8 rounded-[2rem] bg-slate-900/40 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(99,102,241,0.15)] text-left overflow-hidden"
            >
                <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-bl-[100px] transition-transform group-hover:scale-150"></div>
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:rotate-6 transition-transform">
                        <Map className="w-7 h-7 text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">Command Center</h2>
                    <p className="text-slate-400 text-sm mb-6">
                        Access the Authority Dashboard. Monitor the grid, dispatch units, and view decrypted SOS data.
                    </p>
                    <div className="inline-flex items-center gap-2 text-indigo-400 font-bold text-sm group-hover:translate-x-2 transition-transform">
                        Enter Dashboard <Map className="w-4 h-4" />
                    </div>
                </div>
            </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto border-t border-white/5 pt-12 animate-in fade-in duration-1000 delay-300">
            <div className="p-6 rounded-2xl bg-slate-900/20 border border-white/5">
                <Lock className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-white font-bold mb-2">Zero-Knowledge Privacy</h3>
                <p className="text-sm text-slate-400">Identities are masked on the blockchain until a critical SOS event triggers a smart-contract decryption.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/20 border border-white/5">
                <Zap className="w-8 h-8 text-amber-400 mb-4" />
                <h3 className="text-white font-bold mb-2">AI Anomaly Detection</h3>
                <p className="text-sm text-slate-400">Gemini 2.5 Flash analyzes movement patterns in real-time to detect route deviations and distress signals.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/20 border border-white/5">
                <Globe className="w-8 h-8 text-emerald-400 mb-4" />
                <h3 className="text-white font-bold mb-2">Universal Translation</h3>
                <p className="text-sm text-slate-400">Instant multi-lingual communication between tourists and local emergency dispatchers.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
import React from 'react';
import { AI_DOCS } from '../constants';
import { Code, Database, Share2, Cpu, Terminal } from 'lucide-react';

const Documentation: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto p-6 md:p-10 pb-20">
      <div className="relative bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-10 rounded-3xl shadow-2xl overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-3 tracking-tight">System Architecture</h1>
            <p className="text-indigo-200 max-w-2xl text-lg">
            Technical breakdown of the Gemini-powered anomaly detection engine, data schemas, and integration protocols.
            </p>
        </div>
      </div>

      {AI_DOCS.map((doc) => (
        <section key={doc.id} className="glass-panel rounded-2xl overflow-hidden border border-slate-700/50 shadow-lg">
          <div className="p-6 border-b border-white/5 bg-slate-900/50 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Cpu className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                {doc.title}
                </h2>
                <p className="mt-2 text-slate-400 leading-relaxed">{doc.description}</p>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-slate-950/30">
            {/* Schemas */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-400 uppercase tracking-wider">
                        <Database className="w-4 h-4 text-emerald-500" /> Input Schema
                    </div>
                    <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-100 overflow-x-auto custom-scrollbar border border-slate-800 shadow-inner">
                        {doc.inputSchema}
                    </pre>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-400 uppercase tracking-wider">
                        <Terminal className="w-4 h-4 text-amber-500" /> Output Schema
                    </div>
                    <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-amber-100 overflow-x-auto custom-scrollbar border border-slate-800 shadow-inner">
                        {doc.outputSchema}
                    </pre>
                </div>
            </div>

            {/* Logic & Integration */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-400 uppercase tracking-wider">
                        <Code className="w-4 h-4 text-blue-500" /> Logic (Pseudo-Python)
                    </div>
                    <pre className="bg-slate-900 border border-slate-800 text-blue-200 p-5 rounded-xl text-xs font-mono overflow-x-auto custom-scrollbar h-80 shadow-inner leading-relaxed">
                        {doc.pseudoCode}
                    </pre>
                </div>

                <div className="bg-indigo-900/20 border border-indigo-500/20 p-5 rounded-xl">
                    <div className="flex items-center gap-2 font-bold text-sm text-indigo-300 mb-2 uppercase tracking-wider">
                        <Share2 className="w-4 h-4" /> Integration Strategy
                    </div>
                    <p className="text-sm text-indigo-200 leading-relaxed opacity-90">
                        {doc.integrationGuide}
                    </p>
                </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};

export default Documentation;
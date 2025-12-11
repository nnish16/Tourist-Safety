import React from 'react';
import { AI_DOCS } from '../constants';
import { Code, Database, Share2, Cpu } from 'lucide-react';

const Documentation: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto p-2 md:p-6 pb-20">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-2">System AI Design Specifications</h1>
        <p className="text-slate-300">
          Architectural breakdown of the AI components, data schemas, and integration logic.
        </p>
      </div>

      {AI_DOCS.map((doc) => (
        <section key={doc.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              {doc.title}
            </h2>
            <p className="mt-2 text-slate-600">{doc.description}</p>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Schemas */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-700">
                    <Database className="w-4 h-4" /> Input Schema (JSON)
                </div>
                <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg text-xs font-mono overflow-x-auto custom-scrollbar shadow-inner">
                    {doc.inputSchema}
                </pre>

                <div className="flex items-center gap-2 font-semibold text-sm text-slate-700 pt-4">
                    <Database className="w-4 h-4" /> Output Schema (JSON)
                </div>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-lg text-xs font-mono overflow-x-auto custom-scrollbar shadow-inner">
                    {doc.outputSchema}
                </pre>
            </div>

            {/* Logic & Integration */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-700">
                    <Code className="w-4 h-4" /> Logic (Pseudo-Python)
                </div>
                <pre className="bg-slate-50 border border-slate-200 text-slate-800 p-4 rounded-lg text-xs font-mono overflow-x-auto custom-scrollbar h-64">
                    {doc.pseudoCode}
                </pre>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mt-4">
                    <div className="flex items-center gap-2 font-semibold text-sm text-blue-800 mb-2">
                        <Share2 className="w-4 h-4" /> Integration Strategy
                    </div>
                    <p className="text-xs text-blue-900 leading-relaxed">
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
import React from 'react';
import { AppView } from '../types';
import { LayoutDashboard, Smartphone, FileText, Activity } from 'lucide-react';

interface Props {
  currentView: AppView;
  setView: (v: AppView) => void;
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ currentView, setView, children }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Authority Portal', icon: LayoutDashboard },
    { id: AppView.PWA, label: 'Tourist PWA Sim', icon: Smartphone },
    { id: AppView.DOCS, label: 'AI Design Docs', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar Nav */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 z-20">
        <div className="p-6 flex items-center gap-2 text-white border-b border-slate-800">
          <Activity className="w-6 h-6 text-emerald-400" />
          <span className="font-bold text-lg tracking-tight">Sentinel AI</span>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 mt-auto text-xs text-slate-500">
            <p>Prototype v0.9.2</p>
            <p className="mt-2">Powered by Gemini 2.5 Flash</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-x-hidden h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
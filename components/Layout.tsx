import React, { useState } from 'react';
import { AppView } from '../types';
import {
  LayoutDashboard,
  Smartphone,
  FileText,
  ShieldCheck,
  LogOut,
  Activity,
  AlertTriangle,
  X,
} from 'lucide-react';

interface Props {
  currentView: AppView;
  setView: (v: AppView) => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ currentView, setView, onLogout, children }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { id: AppView.ADMIN_DASHBOARD, label: 'Mission Control', icon: LayoutDashboard },
    { id: AppView.TOURIST_DASHBOARD, label: 'Tourist Simulator', icon: Smartphone },
    { id: AppView.DOCS, label: 'System Protocols', icon: FileText },
  ];

  const handleLogoutConfirm = () => {
    if (onLogout) onLogout();
    setView(AppView.ROLE_SELECT);
    setShowLogoutConfirm(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100 font-sans">

      {/* SIDEBAR */}
      <aside className="w-full md:w-72 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex-shrink-0 z-20 flex flex-col">
        
        {/* Header */}
        <div className="p-8 pb-6">
          <div className="flex items-center gap-3 text-white mb-1">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.5)]">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Sentinel AI</span>
          </div>
          <p className="text-xs text-slate-500 pl-1 mt-2 tracking-wide uppercase">
            Tourist Safety Grid
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                  active
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/20'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    active ? 'scale-110' : 'group-hover:scale-110'
                  }`}
                />
                <span className="font-medium text-sm">{item.label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Log Out</span>
          </button>
        </div>

        {/* System Footnote */}
        <div className="p-6">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-300">System Nominal</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              v1.0.0 • Gemini 2.5 Flash
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative overflow-x-hidden h-screen overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">

        {/* Noise Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

        {/* Reserved Container for future AI updates */}
        <div
          id="sentinel-ai-environment-hook"
          className="absolute top-0 right-0 p-2 opacity-0 pointer-events-none"
        />

        {children}
      </main>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-sm w-full relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Confirm Logout</h3>
              <p className="text-sm text-slate-400 mb-6">
                Are you sure you want to end your session?
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors shadow-lg shadow-red-900/20"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;

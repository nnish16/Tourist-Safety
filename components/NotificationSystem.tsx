import React from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  ShieldAlert,
  BrainCircuit
} from 'lucide-react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'danger' | 'success' | 'info' | 'ai-warning' | 'ai-detect';
  timestamp: number;
}

interface Props {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const NotificationSystem: React.FC<Props> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-[999] flex flex-col gap-3 w-full max-w-sm pointer-events-none p-4 md:p-0">

      {notifications.map((notif) => {
        const colors = {
          danger: 'bg-red-500/20 text-red-400 border-red-500/40',
          success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          info: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          'ai-warning': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          'ai-detect': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
        }[notif.type];

        const icon = {
          danger: <AlertTriangle className="w-5 h-5 animate-pulse" />,
          success: <CheckCircle className="w-5 h-5" />,
          info: <Bell className="w-5 h-5" />,
          'ai-warning': <ShieldAlert className="w-5 h-5 animate-pulse" />,
          'ai-detect': <BrainCircuit className="w-5 h-5 animate-pulse" />
        }[notif.type];

        return (
          <div
            key={notif.id}
            className={`
              pointer-events-auto w-full 
              bg-slate-900/90 backdrop-blur-xl
              border rounded-2xl
              shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]
              overflow-hidden flex items-start p-4 gap-3 relative
              animate-slide-in-top
              transition-all
              ${colors}
            `}
          >
            {/* ICON */}
            <div className="p-2 rounded-xl shrink-0 bg-black/20 border border-white/10">
              {icon}
            </div>

            {/* CONTENT */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h4 className="text-sm font-bold leading-none mb-1 text-white tracking-wide">
                {notif.title}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed opacity-90">
                {notif.message}
              </p>

              {/* Timestamp */}
              <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-wider">
                {new Date(notif.timestamp).toLocaleTimeString()} • Sentinel AI
              </p>
            </div>

            {/* DISMISS BUTTON */}
            <button
              onClick={() => onDismiss(notif.id)}
              className="absolute top-2 right-2 text-slate-600 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>

            {/* AUTO-DISMISS PROGRESS */}
            <div
              className={`
                absolute bottom-0 left-0 h-0.5 
                bg-current opacity-40
                animate-[notif-bar_4.6s_linear_forwards]
              `}
              style={{ width: '100%' }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default NotificationSystem;

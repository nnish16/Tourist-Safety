import React from 'react';
import { AlertTriangle, MapPin, Activity, CheckCircle, Zap } from 'lucide-react';
import { AnomalyEvent } from '../types';

interface Props {
  anomaly: AnomalyEvent;
  onAck?: (id: string) => void;
  onSimulateMessage?: (anomaly: AnomalyEvent) => void;
}

const AnomalyCard: React.FC<Props> = ({ anomaly, onAck, onSimulateMessage }) => {
  const isHighSeverity = anomaly.severity >= 4;
  
  // Dynamic styles based on severity
  const cardStyle = isHighSeverity 
    ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
    : 'bg-amber-950/20 border-amber-500/50';
    
  const textStyle = isHighSeverity ? 'text-red-400' : 'text-amber-400';
  const iconStyle = isHighSeverity ? 'text-red-500' : 'text-amber-500';

  return (
    <div className={`p-5 rounded-xl border backdrop-blur-sm transition-all hover:scale-[1.01] ${cardStyle} mb-4 relative overflow-hidden group`}>
      {/* Decorative background pulse for high severity */}
      {isHighSeverity && <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse"></div>}

      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-slate-900/50 border border-white/10 ${iconStyle}`}>
             <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 tracking-tight">{anomaly.type}</h3>
            <div className="text-xs text-slate-500 font-mono">{anomaly.timestamp.split('T')[1].split('.')[0]}</div>
          </div>
        </div>
        <div className="flex flex-col items-end">
            <span className={`px-2 py-1 rounded-md bg-slate-900/80 text-xs font-bold border ${isHighSeverity ? 'border-red-900 text-red-400' : 'border-amber-900 text-amber-400'}`}>
            LVL {anomaly.severity}
            </span>
            <span className="text-[10px] text-slate-500 mt-1">Conf: {(anomaly.confidence * 100).toFixed(0)}%</span>
        </div>
      </div>
      
      <div className="space-y-3 mb-5 relative z-10">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/40 border border-white/5">
          <Activity className="w-4 h-4 text-indigo-400 mt-0.5" />
          <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Trigger</p>
              <p className="text-sm text-slate-200">{anomaly.triggerReason}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <MapPin className="w-3 h-3" />
            {anomaly.location.lat.toFixed(5)}, {anomaly.location.lng.toFixed(5)}
        </div>

        <div className="text-xs p-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 flex items-center gap-2">
           <Zap className="w-3 h-3" />
           <span>Action: {anomaly.suggestedAction}</span>
        </div>
      </div>

      <div className="flex gap-3 relative z-10">
        {onAck && anomaly.status === 'Pending' && (
          <button 
            onClick={() => onAck(anomaly.id)}
            className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-3 h-3" /> Acknowledge
          </button>
        )}
        {onSimulateMessage && (
          <button 
            onClick={() => onSimulateMessage(anomaly)}
            className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-900/20 border border-indigo-500 flex items-center justify-center gap-2"
          >
            Gen. Alerts
          </button>
        )}
      </div>
    </div>
  );
};

export default AnomalyCard;
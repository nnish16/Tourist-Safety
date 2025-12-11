import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

interface Props {
  score: number;
  color: string;
  className?: string;
  reason?: string;
  advice?: string;
}

const SafetyScoreGauge: React.FC<Props> = ({ score, color, className, reason, advice }) => {
  const getColorClass = (c: string) => {
    switch (c.toLowerCase()) {
      case 'green': return 'text-emerald-500 border-emerald-500 bg-emerald-50';
      case 'yellow': return 'text-amber-500 border-amber-500 bg-amber-50';
      case 'orange': return 'text-orange-500 border-orange-500 bg-orange-50';
      case 'red': return 'text-red-500 border-red-500 bg-red-50';
      default: return 'text-slate-500 border-slate-500 bg-slate-50';
    }
  };

  const getIcon = (c: string) => {
    switch (c.toLowerCase()) {
      case 'green': return <ShieldCheck className="w-12 h-12 mb-2" />;
      case 'yellow': return <ShieldAlert className="w-12 h-12 mb-2" />;
      default: return <ShieldX className="w-12 h-12 mb-2" />;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border-4 transition-all duration-500 ${getColorClass(color)} ${className}`}>
      {getIcon(color)}
      <div className="text-5xl font-bold tracking-tight mb-1">{score}</div>
      <div className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-80">Safety Score</div>
      
      {(reason || advice) && (
        <div className="text-center bg-white/60 p-3 rounded-lg w-full">
          {reason && <p className="text-sm font-medium mb-1">{reason}</p>}
          {advice && <p className="text-xs italic opacity-90">"{advice}"</p>}
        </div>
      )}
    </div>
  );
};

export default SafetyScoreGauge;
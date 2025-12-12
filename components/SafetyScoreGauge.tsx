import React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

interface Props {
  score: number;
  color: string;
  className?: string;
  reason?: string;
  advice?: string;
  nextRiskTrend?: "UP" | "STEADY" | "DOWN" | undefined;
}

const SafetyScoreGauge: React.FC<Props> = ({
  score,
  color,
  className,
  reason,
  advice,
  nextRiskTrend
}) => {
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColorConfig = (c: string) => {
    switch (c.toLowerCase()) {
      case "green":
        return {
          stroke: "stroke-emerald-400",
          text: "text-emerald-400",
          glow: "shadow-[0_0_20px_rgba(0,255,140,0.6)]",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />
        };

      case "yellow":
        return {
          stroke: "stroke-amber-400",
          text: "text-amber-400",
          glow: "shadow-[0_0_20px_rgba(255,200,0,0.5)]",
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          icon: <ShieldAlert className="w-8 h-8 text-amber-400" />
        };

      case "orange":
        return {
          stroke: "stroke-orange-400",
          text: "text-orange-400",
          glow: "shadow-[0_0_20px_rgba(255,150,0,0.5)]",
          bg: "bg-orange-500/10",
          border: "border-orange-500/30",
          icon: <ShieldAlert className="w-8 h-8 text-orange-400" />
        };

      default:
        return {
          stroke: "stroke-red-500",
          text: "text-red-500",
          glow: "shadow-[0_0_30px_rgba(255,0,0,0.7)] animate-pulse",
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          icon: <ShieldX className="w-8 h-8 text-red-500" />
        };
    }
  };

  const getTrendBadge = () => {
    if (!nextRiskTrend) return null;

    switch (nextRiskTrend) {
      case "UP":
        return (
          <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
            <TrendingUp className="w-3 h-3" />
            RISK IMPROVING
          </div>
        );

      case "DOWN":
        return (
          <div className="flex items-center gap-1 text-red-400 text-[10px] font-bold bg-red-500/10 px-2 py-1 rounded border border-red-500/30">
            <TrendingDown className="w-3 h-3" />
            RISK RISING
          </div>
        );

      default:
        return (
          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold bg-slate-700/20 px-2 py-1 rounded border border-slate-600/30">
            <Minus className="w-3 h-3" />
            STABLE
          </div>
        );
    }
  };

  const cfg = getColorConfig(color);

  return (
    <div
      className={`
        flex flex-col items-center justify-center p-6 rounded-3xl 
        backdrop-blur-md border ${cfg.border} ${cfg.bg} 
        ${cfg.glow} transition-all duration-500 
        ${className}
      `}
    >
      <div className="relative flex items-center justify-center mb-4">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-slate-800/50"
          />
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: "stroke-dashoffset 1s ease-in-out"
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className={`${cfg.stroke}`}
          />
        </svg>

        {/* SCORE VALUE */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-black ${cfg.text}`}>{score}</span>
        </div>
      </div>

      {/* ICON + TITLE */}
      <div className="flex flex-col items-center gap-2 mb-4">
        {cfg.icon}
        <div className="text-sm font-bold uppercase tracking-widest text-slate-300">
          Safety Index
        </div>
        {getTrendBadge()}
      </div>

      {(reason || advice) && (
        <div className="text-center bg-slate-900/50 p-4 rounded-xl w-full border border-slate-800 shadow-inner">
          {reason && (
            <p className="text-sm font-medium text-slate-200 mb-1">{reason}</p>
          )}
          {advice && (
            <p className="text-xs text-slate-400 italic">"{advice}"</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SafetyScoreGauge;

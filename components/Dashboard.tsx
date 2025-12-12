import React, { useState } from 'react';
import { Tourist, Incident, ZoneClassification, SafetyScoreDetails } from '../types';
import MapView from './MapView';

import {
  Users,
  AlertOctagon,
  Map as MapIcon,
  Shield,
  Siren,
  Ambulance,
  CheckCircle,
  Activity,
  Clock,
  EyeOff,
  Eye,
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface Props {
  tourists: Tourist[];
  incidents: Incident[];
  onDispatch: (incidentId: string, type: 'Police' | 'Medical') => void;
  onResolve: (incidentId: string) => void;
}

const Dashboard: React.FC<Props> = ({ tourists, incidents, onDispatch, onResolve }) => {
  const [filter, setFilter] = useState<'all' | 'sos' | 'active'>('all');

  const filteredIncidents = incidents.filter((i) => {
    if (filter === 'sos') return i.type === 'SOS';
    if (filter === 'active') return i.status !== 'Resolved';
    return true;
  });

  const getTourist = (id: string) => tourists.find((t) => t.id === id);

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 1000 * 60) return 'Just now';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Extract highest confidence environment info (from tourists)
  const activeSafety: SafetyScoreDetails | null = tourists[0]?.safetyScore
    ? {
        score: tourists[0].safetyScore,
        color:
          tourists[0].status === 'danger'
            ? 'Red'
            : tourists[0].status === 'warning'
            ? 'Orange'
            : 'Green',
        reason: 'AI Environment Feed Active',
        advice: 'Stay aware.',
      }
    : null;

  const activeZone: ZoneClassification | null =
    tourists[0]?.lastLocation?.zoneName
      ? {
          zone: tourists[0].status === 'danger' ? 'RED' : tourists[0].status === 'warning' ? 'YELLOW' : 'GREEN',
          dangerScore: 0,
          riskFactors: [],
          recommendation: '',
          zoneDescription: '',
        }
      : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full p-6 pb-20 max-w-[1800px] mx-auto">
      {/* ======================== */}
      {/*         HEADER STATS    */}
      {/* ======================== */}
      <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Accounts */}
        <div className="glass-panel glass-card-hover p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold">Monitored IDs</p>
            <p className="text-2xl font-bold text-white">{tourists.length}</p>
          </div>
          <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/20">
            <Users className="text-indigo-400 w-6 h-6" />
          </div>
        </div>

        {/* SOS Counter */}
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between bg-red-900/10 border-red-500/30">
          <div>
            <p className="text-red-400 text-xs uppercase font-bold">Active SOS</p>
            <p className="text-2xl font-bold text-white">
              {incidents.filter((i) => i.type === 'SOS' && i.status !== 'Resolved').length}
            </p>
          </div>
          <div className="p-2 bg-red-500/20 rounded-lg animate-pulse border border-red-500/20">
            <Siren className="text-red-400 w-6 h-6" />
          </div>
        </div>

        {/* Open Reports */}
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold">Open Reports</p>
            <p className="text-2xl font-bold text-amber-400">
              {incidents.filter((i) => i.type !== 'SOS' && i.status !== 'Resolved').length}
            </p>
          </div>
          <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/20">
            <AlertOctagon className="text-amber-400 w-6 h-6" />
          </div>
        </div>

        {/* System Status */}
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold">AI Status</p>
            <p className="text-sm font-bold text-emerald-400 mt-1">ONLINE</p>
          </div>
          <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/20">
            <Shield className="text-emerald-500 w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/*                 LEFT PANEL — INCIDENT FEED         */}
      {/* ================================================== */}
      <div className="lg:col-span-4 glass-panel rounded-2xl flex flex-col h-[75vh] border-slate-700/50 shadow-2xl">
        <div className="p-4 border-b border-white/5 bg-slate-900/50 flex justify-between items-center backdrop-blur-md rounded-t-2xl">
          <h2 className="font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" /> Incident Feed
          </h2>

          <div className="flex gap-1 text-[10px]">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 rounded ${
                filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('sos')}
              className={`px-2 py-1 rounded ${
                filter === 'sos' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              SOS
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/30 custom-scrollbar">
          {filteredIncidents.length === 0 && (
            <div className="text-center text-slate-500 mt-10">No active incidents</div>
          )}

          {filteredIncidents.map((inc) => {
            const tourist = getTourist(inc.touristId);
            const isSos = inc.type === 'SOS';
            const isResolved = inc.status === 'Resolved';

            return (
              <div
                key={inc.id}
                className={`p-4 rounded-xl border transition-all duration-500 hover:scale-[1.02] relative overflow-hidden 
                ${isSos ? 'bg-red-950/20 border-red-500/50' : 'bg-slate-800/40 border-slate-700'}
                ${isResolved ? 'opacity-40 grayscale' : ''}`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {isSos ? (
                      <Siren className="w-5 h-5 text-red-500 animate-pulse" />
                    ) : (
                      <AlertOctagon className="w-5 h-5 text-amber-500" />
                    )}

                    <span
                      className={`font-bold text-sm ${
                        isSos ? 'text-red-400' : 'text-amber-400'
                      }`}
                    >
                      {inc.type} — {inc.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-900/50 px-2 py-1 rounded-full border border-white/5">
                    <Clock className="w-3 h-3" />
                    {formatTime(inc.timestamp)}
                  </div>
                </div>

                {/* Identity Section */}
                <div
                  className={`mb-3 p-3 rounded-lg border ${
                    isSos ? 'border-red-900/30 bg-red-950/40' : 'border-slate-800 bg-slate-900/30'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Identity</span>
                    {isSos ? <Eye className="w-3 h-3 text-red-500" /> : <EyeOff className="w-3 h-3 text-slate-600" />}
                  </div>

                  {isSos ? (
                    <>
                      <p className="text-white font-bold">{tourist?.name || 'Unknown Profile'}</p>
                      <p className="text-xs text-red-300">
                        Age: {tourist?.age || '??'} • {tourist?.nationality || 'Unknown'}
                      </p>
                      {tourist?.contacts?.[0] && (
                        <p className="text-xs text-red-300 mt-1">Contact: {tourist.contacts[0].phone}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-indigo-300 font-mono text-sm">{tourist?.digitalId || 'DID:HIDDEN'}</p>
                      <p className="text-xs text-slate-500 italic">PII Hidden (Standard Protocol)</p>
                    </>
                  )}
                </div>

                {/* Description + AI TRIAGE */}
                <p className="text-sm text-slate-300 mb-3">"{inc.description}"</p>

                {inc.triage && (
                  <div className="bg-indigo-900/30 p-3 rounded border border-indigo-500/30">
                    <div className="flex items-center gap-2 mb-1">
                      <BrainCircuit className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-indigo-300">AI TRIAGE INTEL</span>
                    </div>

                    <p className="text-xs text-indigo-100 mb-1">{inc.triage.adminBrief}</p>

                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] bg-white/10 text-white px-1.5 py-0.5 rounded">
                        Rec: {inc.triage.recommendedResponse}
                      </span>

                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          inc.triage.severity === 'CRITICAL'
                            ? 'bg-red-500 text-white'
                            : 'bg-amber-500 text-black'
                        }`}
                      >
                        {inc.triage.severity}
                      </span>

                      {/* Panic Score */}
                      {inc.triage.panicScore !== undefined && (
                        <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">
                          Panic: {(inc.triage.panicScore * 100).toFixed(0)}%
                        </span>
                      )}

                      {/* Urgency Score */}
                      {inc.triage.urgencyScore !== undefined && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                          Urgency: {(inc.triage.urgencyScore * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                {!isResolved && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => onDispatch(inc.id, 'Police')}
                      className="flex-1 bg-blue-600/10 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <Shield className="w-3 h-3" /> Police
                    </button>

                    <button
                      onClick={() => onDispatch(inc.id, 'Medical')}
                      className="flex-1 bg-red-600/10 hover:bg-red-600/30 text-red-400 border border-red-600/30 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <Ambulance className="w-3 h-3" /> Medical
                    </button>

                    <button
                      onClick={() => onResolve(inc.id)}
                      className="px-3 bg-emerald-600/10 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 rounded-lg"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {isResolved && (
                  <div className="text-center text-xs text-emerald-500 font-bold bg-emerald-900/10 py-1 rounded">
                    CASE RESOLVED
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================== */}
      {/*             RIGHT PANEL — MAP & ANALYTICS          */}
      {/* ================================================== */}
      <div className="lg:col-span-8 glass-panel rounded-2xl relative overflow-hidden border-slate-700/50 shadow-2xl flex flex-col">
        <div className="absolute top-4 left-4 z-[400] bg-slate-950/80 backdrop-blur px-4 py-2 rounded-lg text-xs font-bold border border-white/10 flex items-center gap-2 shadow-xl">
          <MapIcon className="w-3 h-3 text-indigo-400" />
          <span className="text-slate-200">LIVE SURVEILLANCE GRID</span>
        </div>

        <div className="flex-1 w-full h-full">
          <MapView
            center={{ lat: 35.6895, lng: 139.6917 }}
            zoom={13}
            tourists={tourists}
            incidents={incidents}
            showZones={true}
          />
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-[400] bg-slate-950/90 backdrop-blur p-3 rounded-xl border border-white/10 text-[10px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> SOS / Danger
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Warning
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Safe
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState } from 'react';
import { Tourist, AnomalyEvent, EmergencyMessage } from '../types';
import { GeminiService } from '../services/geminiService';
import AnomalyCard from './AnomalyCard';
import { Users, AlertOctagon, Map as MapIcon, RefreshCw, MessageSquare } from 'lucide-react';

interface Props {
  tourists: Tourist[];
  anomalies: AnomalyEvent[];
  setAnomalies: React.Dispatch<React.SetStateAction<AnomalyEvent[]>>;
}

const Dashboard: React.FC<Props> = ({ tourists, anomalies, setAnomalies }) => {
  const [selectedTourist, setSelectedTourist] = useState<Tourist | null>(null);
  const [generatedMessages, setGeneratedMessages] = useState<EmergencyMessage[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulate AI Anomaly Check
  const handleSimulateCheck = async () => {
    if (!selectedTourist) return;
    setIsSimulating(true);

    // Create a mock "recent path" that deviates
    const mockRecentPoints = [
      { lat: selectedTourist.lastLocation.lat + 0.001, lng: selectedTourist.lastLocation.lng + 0.001, ts: "10 mins ago" },
      { lat: selectedTourist.lastLocation.lat + 0.005, lng: selectedTourist.lastLocation.lng + 0.005, ts: "5 mins ago" },
    ];

    const anomaly = await GeminiService.detectAnomaly(selectedTourist, mockRecentPoints);
    
    if (anomaly) {
      setAnomalies(prev => [anomaly as AnomalyEvent, ...prev]);
    } else {
      alert("No anomalies detected by AI.");
    }
    setIsSimulating(false);
  };

  const handleGenerateMessages = async (anomaly: AnomalyEvent) => {
    setIsSimulating(true);
    const msgs = await GeminiService.generateEmergencyMessages(anomaly, tourists.find(t => t.id === anomaly.touristId)?.name || "Unknown");
    setGeneratedMessages(msgs);
    setIsSimulating(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full p-6 pb-20">
      {/* Left Col: Tourist List */}
      <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-[80vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold flex items-center gap-2"><Users className="w-5 h-5 text-indigo-600"/> Monitored Tourists</h2>
          <span className="text-xs font-mono bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{tourists.length} Active</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {tourists.map(t => (
            <div 
              key={t.id}
              onClick={() => setSelectedTourist(t)}
              className={`p-3 mb-2 rounded-lg cursor-pointer border transition-all ${selectedTourist?.id === t.id ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm">{t.name}</span>
                <span className={`w-2 h-2 rounded-full ${t.status === 'safe' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Score: {t.safetyScore}</span>
                <span>Bat: {t.batteryLevel}%</span>
              </div>
            </div>
          ))}
        </div>
        {selectedTourist && (
           <div className="p-4 bg-slate-50 border-t border-slate-200">
             <button 
               onClick={handleSimulateCheck}
               disabled={isSimulating}
               className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
             >
               <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
               {isSimulating ? 'AI Analyzing...' : 'Run Anomaly Detection'}
             </button>
           </div>
        )}
      </div>

      {/* Middle Col: Map / Live View Placeholder */}
      <div className="lg:col-span-2 flex flex-col gap-6 h-[80vh]">
        {/* Map Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 h-1/2 relative overflow-hidden group">
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold border shadow-sm flex items-center gap-2">
                <MapIcon className="w-3 h-3"/> Live Geo-Spatial Monitor
            </div>
            {/* Using a static placeholder image for the map visual */}
            <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 relative">
               <img 
                 src="https://picsum.photos/800/400?grayscale&blur=2" 
                 alt="Map Background" 
                 className="absolute inset-0 w-full h-full object-cover opacity-20"
               />
               <div className="z-10 text-center">
                 <p className="font-medium">Interactive Map Integration</p>
                 <p className="text-xs mt-1">Shows real-time location clusters and risk zones</p>
               </div>
               {/* Simulated Pins */}
               {tourists.map((t, i) => (
                   <div 
                    key={t.id} 
                    className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg transform hover:scale-125 transition-transform duration-300 cursor-help"
                    style={{ 
                        top: `${30 + (i * 20)}%`, 
                        left: `${40 + (i * 15)}%`,
                        backgroundColor: t.status === 'safe' ? '#10b981' : '#ef4444' 
                    }}
                    title={t.name}
                   />
               ))}
            </div>
        </div>

        {/* Alerts & Messages Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
               <h2 className="font-bold flex items-center gap-2"><AlertOctagon className="w-5 h-5 text-amber-600"/> AI Anomaly Feed</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
               <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Alerts</h3>
                  {anomalies.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">No active anomalies detected. System Nominal.</div>
                  ) : (
                    anomalies.map(a => (
                        <AnomalyCard 
                            key={a.id} 
                            anomaly={a} 
                            onAck={(id) => setAnomalies(prev => prev.map(p => p.id === id ? {...p, status: 'Acknowledged'} : p))}
                            onSimulateMessage={handleGenerateMessages}
                        />
                    ))
                  )}
               </div>

               <div className="border-l border-slate-100 pl-4 space-y-4">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                       <MessageSquare className="w-3 h-3" /> Message Generator Output
                   </h3>
                   {generatedMessages.length === 0 ? (
                       <div className="bg-slate-50 rounded-lg p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200">
                           Select an anomaly to generate multi-lingual response messages.
                       </div>
                   ) : (
                       <div className="space-y-3">
                           {generatedMessages.map((msg, idx) => (
                               <div key={idx} className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-xs">
                                   <div className="flex justify-between font-bold text-indigo-800 mb-1">
                                       <span>{msg.target} ({msg.language})</span>
                                       <span className="opacity-60">ID: MSG-{idx+1}</span>
                                   </div>
                                   <div className="mb-2">
                                       <span className="font-semibold text-indigo-600">SMS:</span> {msg.sms}
                                   </div>
                                   <div className="italic text-slate-600 bg-white/50 p-1.5 rounded">
                                       <span className="font-semibold text-indigo-600">Voice Script:</span> "{msg.voice}"
                                   </div>
                               </div>
                           ))}
                           <button onClick={() => setGeneratedMessages([])} className="text-xs text-indigo-600 underline w-full text-center">Clear Messages</button>
                       </div>
                   )}
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
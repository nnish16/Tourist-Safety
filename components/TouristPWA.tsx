import React, { useState, useEffect } from 'react';
import { Tourist, SafetyScoreDetails } from '../types';
import SafetyScoreGauge from './SafetyScoreGauge';
import { MapPin, Battery, Wifi, Navigation } from 'lucide-react';
import { GeminiService } from '../services/geminiService';

interface Props {
  tourist: Tourist;
  onUpdate: (t: Tourist) => void;
}

const TouristPWA: React.FC<Props> = ({ tourist, onUpdate }) => {
  const [scoreDetails, setScoreDetails] = useState<SafetyScoreDetails>({
    score: tourist.safetyScore,
    color: tourist.status === 'safe' ? 'Green' : 'Yellow',
    reason: 'Calculating...',
    advice: 'Stand by...'
  });
  const [loading, setLoading] = useState(false);
  const [panicMode, setPanicMode] = useState(false);

  // Poll for Safety Score updates
  useEffect(() => {
    const fetchScore = async () => {
      // In real PWA, this would fetch from backend. Here we simulate backend logic locally.
      const details = await GeminiService.calculateSafetyScore(tourist, []);
      setScoreDetails(details);
      
      // Update parent state as well
      if (details.score !== tourist.safetyScore) {
        onUpdate({ 
          ...tourist, 
          safetyScore: details.score, 
          status: details.score > 80 ? 'safe' : (details.score > 40 ? 'warning' : 'danger')
        });
      }
    };
    fetchScore();
    const interval = setInterval(fetchScore, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [tourist.id]); // Only re-run if tourist ID changes (simulate user switch)

  const handleCheckIn = () => {
    setLoading(true);
    // Simulate sending precise location
    setTimeout(() => {
      setLoading(false);
      alert("Location Check-in Sent! (Simulated)");
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-[600px] h-full shadow-2xl rounded-3xl overflow-hidden border border-slate-200 relative flex flex-col">
      {/* PWA Header */}
      <div className="bg-slate-900 text-white p-4 pt-8 flex justify-between items-center">
        <div>
          <h2 className="font-bold text-lg">Sentinel Safety</h2>
          <p className="text-xs text-slate-400">Connected • GPS Active</p>
        </div>
        <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1"><Battery className="w-4 h-4 text-emerald-400" /> {tourist.batteryLevel}%</div>
            <div className="flex items-center gap-1"><Wifi className="w-4 h-4 text-emerald-400" /> 4G</div>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
        {/* Safety Gauge */}
        <section>
          <SafetyScoreGauge 
            score={scoreDetails.score} 
            color={scoreDetails.color} 
            reason={scoreDetails.reason} 
            advice={scoreDetails.advice}
            className="shadow-sm"
          />
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleCheckIn}
            disabled={loading}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition active:scale-95"
          >
            <MapPin className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-semibold text-slate-700">Check In</span>
            <span className="text-xs text-slate-500">Update Location</span>
          </button>
          
          <button 
            className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition active:scale-95"
          >
            <Navigation className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-semibold text-slate-700">My Route</span>
            <span className="text-xs text-slate-500">View Itinerary</span>
          </button>
        </section>

        {/* Current Info */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Next Waypoint</h4>
            <div className="text-blue-900 font-medium">{tourist.plannedRoute[0] || "Destination Reached"}</div>
        </div>
      </div>

      {/* Panic Button - Sticky Footer */}
      <div className="p-4 bg-white border-t border-slate-100">
        <button 
          onClick={() => setPanicMode(!panicMode)}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
            panicMode 
            ? "bg-red-600 text-white animate-pulse" 
            : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
          }`}
        >
          {panicMode ? "SENDING SOS..." : "SOS / PANIC"}
        </button>
        {panicMode && (
          <p className="text-center text-xs text-red-500 mt-2">
            Holding for 3s to confirm emergency...
          </p>
        )}
      </div>
    </div>
  );
};

export default TouristPWA;
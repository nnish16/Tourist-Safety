import React from 'react';
import { AlertTriangle, MapPin, Activity } from 'lucide-react';
import { AnomalyEvent } from '../types';

interface Props {
  anomaly: AnomalyEvent;
  onAck?: (id: string) => void;
  onSimulateMessage?: (anomaly: AnomalyEvent) => void;
}

const AnomalyCard: React.FC<Props> = ({ anomaly, onAck, onSimulateMessage }) => {
  const severityColor = anomaly.severity >= 4 ? 'bg-red-100 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800';

  return (
    <div className={`p-4 rounded-lg border ${severityColor} mb-4 shadow-sm`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-bold text-lg">{anomaly.type}</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-white/50 text-xs font-bold border border-black/10">
          Severity: {anomaly.severity}/5
        </span>
      </div>
      
      <div className="text-sm space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 opacity-70" />
          <span>Lat: {anomaly.location.lat.toFixed(4)}, Lng: {anomaly.location.lng.toFixed(4)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 opacity-70" />
          <span>{anomaly.triggerReason}</span>
        </div>
        <div className="text-xs mt-2 p-2 bg-white/50 rounded">
          <strong>Recommended:</strong> {anomaly.suggestedAction}
        </div>
      </div>

      <div className="flex gap-2">
        {onAck && anomaly.status === 'Pending' && (
          <button 
            onClick={() => onAck(anomaly.id)}
            className="flex-1 px-3 py-1.5 bg-white border border-current rounded text-sm font-medium hover:bg-opacity-50 transition"
          >
            Acknowledge
          </button>
        )}
        {onSimulateMessage && (
          <button 
            onClick={() => onSimulateMessage(anomaly)}
            className="flex-1 px-3 py-1.5 bg-blue-600 text-white border border-transparent rounded text-sm font-medium hover:bg-blue-700 transition"
          >
            Gen. Messages
          </button>
        )}
      </div>
    </div>
  );
};

export default AnomalyCard;
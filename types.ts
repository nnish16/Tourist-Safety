export interface Tourist {
  id: string;
  name: string;
  status: 'safe' | 'warning' | 'danger';
  safetyScore: number;
  lastLocation: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  batteryLevel: number;
  plannedRoute: string[]; // List of waypoint names
}

export interface AnomalyEvent {
  id: string;
  touristId: string;
  timestamp: string;
  type: 'Sudden Drop-off' | 'Route Deviation' | 'Unusual Zone Entry' | 'Distress Pattern';
  severity: 1 | 2 | 3 | 4 | 5;
  confidence: number;
  location: { lat: number; lng: number };
  triggerReason: string;
  suggestedAction: string;
  status: 'Pending' | 'Acknowledged' | 'Resolved' | 'False Positive';
}

export interface SafetyScoreDetails {
  score: number;
  color: 'Green' | 'Yellow' | 'Orange' | 'Red';
  reason: string;
  advice: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PWA = 'PWA',
  DOCS = 'DOCS',
}

export interface AiDocSection {
  id: string;
  title: string;
  description: string;
  inputSchema: string;
  outputSchema: string;
  pseudoCode: string;
  integrationGuide: string;
}

export type EmergencyMessage = {
  language: string;
  sms: string;
  voice: string;
  target: string;
}

export interface GeneratedInsight {
  type: 'anomaly' | 'score' | 'message';
  data: any;
}
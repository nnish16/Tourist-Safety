/* ============================
        CONTACTS
   ============================ */
export interface Contact {
  name: string;
  relation: string;
  phone: string;
}

/* ============================
        TOURIST MODEL
   ============================ */
export interface Tourist {
  id: string;
  digitalId: string;
  name: string;
  age?: number;
  gender?: string;
  nationality?: string;
  contacts: Contact[];
  status: "safe" | "warning" | "danger";
  safetyScore: number;
  lastLocation: {
    lat: number;
    lng: number;
    timestamp: string;
    zoneName: string;
  };
  batteryLevel: number;
  plannedRoute: string[];
  isSosActive: boolean;
  language: string;
}

/* ============================
        INCIDENT MODEL
   ============================ */
export interface Incident {
  id: string;
  touristId: string;
  type: "SOS" | "REPORT" | "ANOMALY";
  category: "Medical" | "Crime" | "Lost" | "Other";
  description: string;
  severity: 1 | 2 | 3 | 4 | 5;
  timestamp: string;
  location: { lat: number; lng: number; zoneName: string };
  status: "Open" | "Dispatched" | "Resolved";
  aiAnalysis?: string;
  triage?: SOSTriageResult;
}

/* ============================
     ANOMALY EVENTS
   ============================ */
export interface AnomalyEvent {
  id: string;
  type: string;
  severity: number;
  confidence: number;
  triggerReason: string;
  suggestedAction: string;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
  };
  status: "Pending" | "Acknowledged" | "Resolved";
}

/* ============================
        SAFETY SCORE
   ============================ */
export interface SafetyScoreDetails {
  score: number;
  color: "Green" | "Yellow" | "Orange" | "Red";
  reason: string;
  advice: string;

  // Hybrid optional
  nextRiskTrend?: "UP" | "STEADY" | "DOWN";
}

/* ============================
     ZONE CLASSIFICATION
   ============================ */
export interface ZoneClassification {
  zone: "RED" | "YELLOW" | "GREEN";
  dangerScore: number;
  riskFactors: string[];
  recommendation: string;
  zoneDescription: string;

  // Hybrid optional indices
  crowdIndex?: number; // 0–100
  lightingIndex?: number; // 0–100
  hazardIndex?: number; // 0–100
  nearestSafeZone?: string;
}

/* Combined Gemini batch result */
export interface EnvironmentAnalysis {
  safetyScore: SafetyScoreDetails;
  zoneClassification: ZoneClassification;
}

/* ============================
       VISION ANALYSIS
   ============================ */
export interface VisionAnalysisResult {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  factors: string[];
  narrative: string;

  // Hybrid optional
  crowdLevel?: "LOW" | "MEDIUM" | "HIGH";
  lightingCondition?: "BRIGHT" | "DIM" | "DARK";
}

/* ============================
       SOS TRIAGE RESULT
   ============================ */
export interface SOSTriageResult {
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  transcript: string;
  imageAnalysis: string; // REQUIRED
  recommendedResponse: string;
  adminBrief: string;
  touristMessage: string;

  // Optional hybrid scores
  panicScore?: number; // 0–1
  urgencyScore?: number; // 0–1
}

/* ============================
       SAFE ROUTE PLANNER
   ============================ */
export interface RoutePlanResult {
  narrative: string;
  steps: string[];
  warnings: string[];

  // Optional hybrid
  obstructionNotes?: string;
}

/* ============================
       APP VIEWS
   ============================ */
export enum AppView {
  ROLE_SELECT = "ROLE_SELECT",
  TOURIST_LOGIN = "TOURIST_LOGIN",
  ADMIN_LOGIN = "ADMIN_LOGIN",
  TOURIST_DASHBOARD = "TOURIST_DASHBOARD",
  ADMIN_DASHBOARD = "ADMIN_DASHBOARD",
  DOCS = "DOCS"
}

/* ============================
      AI DOCUMENTATION MODEL
   ============================ */
export interface AiDocSection {
  id: string;
  title: string;
  description: string;
  inputSchema: string;
  outputSchema: string;
  pseudoCode: string;
  integrationGuide: string;
}

/* ============================
   MULTILINGUAL EMERGENCY MSG
   ============================ */
export type EmergencyMessage = {
  language: string;
  sms: string;
  voice: string;
  target: string;
};

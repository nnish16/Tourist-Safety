import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Tourist, AnomalyEvent, SafetyScoreDetails, EmergencyMessage } from "../types";

// NOTE: In a real backend, this API key would be hidden. 
// For this prototype, we rely on the environment variable injection.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schemas for Structured Output
const ANOMALY_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    anomaly_id: { type: Type.STRING },
    type: { type: Type.STRING, enum: ['Sudden Drop-off', 'Route Deviation', 'Unusual Zone Entry', 'Distress Pattern'] },
    severity: { type: Type.INTEGER },
    confidence: { type: Type.NUMBER },
    trigger_reason: { type: Type.STRING },
    suggested_action: { type: Type.STRING },
    is_anomaly: { type: Type.BOOLEAN }
  },
  required: ["is_anomaly", "type", "severity", "confidence", "trigger_reason", "suggested_action"]
};

const SAFETY_SCORE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER },
    color: { type: Type.STRING, enum: ['Green', 'Yellow', 'Orange', 'Red'] },
    reason: { type: Type.STRING },
    advice: { type: Type.STRING }
  },
  required: ["score", "color", "reason", "advice"]
};

const MESSAGE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    messages: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          language: { type: Type.STRING },
          sms: { type: Type.STRING },
          voice: { type: Type.STRING },
          target: { type: Type.STRING }
        }
      }
    }
  }
};

export const GeminiService = {
  detectAnomaly: async (tourist: Tourist, recentPoints: any[]): Promise<Partial<AnomalyEvent> | null> => {
    try {
      const prompt = `
        Analyze the following tourist telemetry for safety anomalies.
        Tourist: ${tourist.name}, Battery: ${tourist.batteryLevel}%.
        Last Location: ${JSON.stringify(tourist.lastLocation)}.
        Recent Points: ${JSON.stringify(recentPoints)}.
        Planned Route: ${JSON.stringify(tourist.plannedRoute)}.
        
        Task: Detect if there is a "Sudden Drop-off", "Route Deviation", "Unusual Zone Entry", or "Distress Pattern".
        If battery is low (<20) and location is old, it might be a drop-off.
        If location is far from route, it is a deviation.
        
        Return JSON based on schema.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: ANOMALY_SCHEMA,
          temperature: 0.2
        }
      });

      const result = JSON.parse(response.text || "{}");
      if (result.is_anomaly) {
        return {
            id: result.anomaly_id || `ANOM-${Date.now()}`,
            type: result.type,
            severity: result.severity,
            confidence: result.confidence,
            triggerReason: result.trigger_reason,
            suggestedAction: result.suggested_action,
            timestamp: new Date().toISOString(),
            status: 'Pending',
            touristId: tourist.id,
            location: tourist.lastLocation
        };
      }
      return null;
    } catch (e) {
      console.error("Gemini Anomaly Detection Failed", e);
      // Fallback mock for demo robustness if API fails or key invalid
      return {
        id: `MOCK-${Date.now()}`,
        type: 'Route Deviation',
        severity: 3,
        confidence: 0.75,
        triggerReason: "Simulated AI Failure Fallback",
        suggestedAction: "Check Connectivity",
        timestamp: new Date().toISOString(),
        status: 'Pending',
        touristId: tourist.id,
        location: tourist.lastLocation
      };
    }
  },

  calculateSafetyScore: async (tourist: Tourist, anomalies: AnomalyEvent[]): Promise<SafetyScoreDetails> => {
    try {
      const prompt = `
        Calculate Safety Score (0-100) for tourist ${tourist.name}.
        Active Anomalies: ${anomalies.length} (Severities: ${anomalies.map(a => a.severity).join(',')}).
        Battery: ${tourist.batteryLevel}.
        Time: ${new Date().toLocaleTimeString()}.
        
        Logic: 
        - Start 100.
        - Deduct 15 per high severity anomaly.
        - Deduct 5 for low battery.
        - Deduct 10 if late night.
        - Assign Color: Green (>80), Yellow (>60), Orange (>40), Red (<40).
        - Provide short reason and advice.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: SAFETY_SCORE_SCHEMA
        }
      });

      return JSON.parse(response.text || "{}") as SafetyScoreDetails;
    } catch (e) {
      console.error("Gemini Scoring Failed", e);
      return {
        score: 75,
        color: 'Yellow',
        reason: 'Service Unavailable',
        advice: 'Proceed with caution'
      };
    }
  },

  generateEmergencyMessages: async (anomaly: AnomalyEvent, touristName: string): Promise<EmergencyMessage[]> => {
    try {
      const prompt = `
        Generate emergency messages for Anomaly: ${anomaly.type} (Severity ${anomaly.severity}).
        Tourist: ${touristName}.
        Location: ${JSON.stringify(anomaly.location)}.
        
        Languages needed: English (en), Spanish (es), Japanese (ja).
        Targets: "Emergency Contact" (Family) and "Police Dispatch".
        
        Output JSON array of messages.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: MESSAGE_SCHEMA
        }
      });

      const res = JSON.parse(response.text || "{}");
      return res.messages || [];
    } catch (e) {
      console.error("Gemini Translation Failed", e);
      return [];
    }
  }
};
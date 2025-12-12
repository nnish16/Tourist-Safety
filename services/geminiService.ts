import { GoogleGenAI, Type, Schema } from "@google/genai";
import {
  Tourist,
  Incident,
  SafetyScoreDetails,
  EmergencyMessage,
  VisionAnalysisResult,
  SOSTriageResult,
  RoutePlanResult,
  EnvironmentAnalysis
} from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ---------- ROBUST JSON EXTRACTOR ----------
const extractJson = (raw: string = "") => {
  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) return "{}";
    return raw.slice(start, end + 1);
  } catch {
    return "{}";
  }
};

// ---------- MIME PARSERS ----------
const parseImage = (dataUrl: string) => {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.\-]+);base64,(.+)$/);
  return match ? { mimeType: match[1], data: match[2] } : null;
};

const parseAudio = (dataUrl: string) => {
  const match = dataUrl.match(/^data:(audio\/[a-zA-Z0-9+.\-]+).*;base64,(.+)$/);
  return match ? { mimeType: match[1], data: match[2] } : null;
};

// ---------- EXISTING SCHEMAS + HYBRID UPGRADE OPTIONALS ----------
const SAFETY_SCORE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER },
    color: { type: Type.STRING, enum: ["Green", "Yellow", "Orange", "Red"] },
    reason: { type: Type.STRING },
    advice: { type: Type.STRING },

    // Hybrid upgrade (optional):
    nextRiskTrend: { type: Type.STRING, enum: ["UP", "STEADY", "DOWN"], nullable: true }
  },
  required: ["score", "color", "reason", "advice"]
};

const ZONE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    zone: { type: Type.STRING, enum: ["RED", "YELLOW", "GREEN"] },
    dangerScore: { type: Type.INTEGER },
    riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
    recommendation: { type: Type.STRING },
    zoneDescription: { type: Type.STRING },

    // Hybrid upgrade (optional)
    crowdIndex: { type: Type.INTEGER, nullable: true },
    lightingIndex: { type: Type.INTEGER, nullable: true },
    hazardIndex: { type: Type.INTEGER, nullable: true },
    nearestSafeZone: { type: Type.STRING, nullable: true }
  },
  required: ["zone", "dangerScore", "riskFactors", "recommendation", "zoneDescription"]
};

const ENVIRONMENT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    safetyScore: SAFETY_SCORE_SCHEMA,
    zoneClassification: ZONE_SCHEMA
  },
  required: ["safetyScore", "zoneClassification"]
};

const VISION_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
    factors: { type: Type.ARRAY, items: { type: Type.STRING } },
    narrative: { type: Type.STRING },

    // Hybrid upgrade additions (optional)
    crowdLevel: { type: Type.STRING, nullable: true },
    lightingCondition: { type: Type.STRING, nullable: true }
  },
  required: ["riskLevel", "factors", "narrative"]
};

const TRIAGE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    severity: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
    transcript: { type: Type.STRING },
    imageAnalysis: { type: Type.STRING },
    recommendedResponse: { type: Type.STRING },
    adminBrief: { type: Type.STRING },
    touristMessage: { type: Type.STRING },

    // Hybrid upgrade (optional)
    panicScore: { type: Type.NUMBER, nullable: true },
    urgencyScore: { type: Type.NUMBER, nullable: true }
  },
  // FIXED: imageAnalysis added to required
  required: ["severity", "transcript", "imageAnalysis", "recommendedResponse", "adminBrief", "touristMessage"]
};

const ROUTE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    narrative: { type: Type.STRING },
    steps: { type: Type.ARRAY, items: { type: Type.STRING } },
    warnings: { type: Type.ARRAY, items: { type: Type.STRING } },

    // Hybrid additions (optional)
    obstructionNotes: { type: Type.STRING, nullable: true }
  },
  required: ["narrative", "steps", "warnings"]
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
        },
        required: ["language", "sms", "target"]
      }
    }
  },
  required: ["messages"]
};

// ---------- GEMINI SERVICE OBJECT ----------
export const GeminiService = {
  // ---------- HYBRID UPGRADE: BATCHED ENVIRONMENT ANALYSIS ----------
  analyzeEnvironment: async (
    tourist: Tourist,
    incidents: Incident[],
    time: string,
    weather: string
  ): Promise<EnvironmentAnalysis> => {
    try {
      const incidentContext = incidents.map(i => ({
        category: i.category,
        severity: i.severity,
        timestamp: i.timestamp,
        location: i.location.zoneName
      }));

      const contextData = {
        touristState: {
          battery: tourist.batteryLevel,
          status: tourist.status,
          locationName: tourist.lastLocation.zoneName,
          isSosActive: tourist.isSosActive
        },
        incidents: incidentContext,
        timeOfDay: time,
        weather: weather
      };

      const prompt = `
        You are Sentinel AI. Analyze ONLY the JSON below—no external knowledge.
        Input: ${JSON.stringify(contextData)}

        TASKS:
        1. SAFETY SCORE (0-100)
           - If SOS active → score < 15
           - If battery < 20% → penalize 8
           - If severity 4–5 incidents present → penalize heavily
           - Provide "reason" and "advice"
           - Predict "nextRiskTrend": UP, STEADY, or DOWN (optional)

        2. ZONE CLASSIFICATION
           - RED: Active high-severity incidents OR distress signals in tourist state
           - YELLOW: Moderate incidents, late-night conditions, or suspicious patterns
           - GREEN: No active threats
           - DO NOT assume real-world geography.
           - Use ONLY the incident list and touristState.

        3. HYBRID ENHANCEMENT (OPTIONAL FIELDS — DO NOT BREAK STRUCTURE)
           Add optional numeric indices:
             - crowdIndex (0–100) based on incident density + time context
             - lightingIndex (0–100) based on timeOfDay + weather (dark hours → lower score)
             - hazardIndex (0–100) based on severity levels in incident list
           Add:
             - nearestSafeZone: a semantic area name (optional string)

        Return ONLY JSON following the provided schema.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: ENVIRONMENT_SCHEMA,
          temperature: 0.15
        }
      });

      const parsed = JSON.parse(extractJson(response.text));
      return parsed as EnvironmentAnalysis;
    } catch (e) {
      console.error("Environment Analysis Failed", e);

      return {
        safetyScore: {
          score: 70,
          color: "Yellow",
          reason: "AI offline – fallback estimate.",
          advice: "Stay alert.",
          nextRiskTrend: "STEADY"
        },
        zoneClassification: {
          zone: "YELLOW",
          dangerScore: 45,
          riskFactors: ["System Offline"],
          recommendation: "Use caution.",
          zoneDescription: "Unknown",
          crowdIndex: 40,
          lightingIndex: 50,
          hazardIndex: 30,
          nearestSafeZone: "Main Street"
        }
      };
    }
  },

  // ---------- HYBRID UPGRADE: VISION RISK ANALYSIS ----------
  analyzeImage: async (base64Image: string): Promise<VisionAnalysisResult> => {
    try {
      const parsed = parseImage(base64Image);
      if (!parsed) throw new Error("Invalid image format (must be Data URL).");

      const prompt = `
        You are Sentinel Vision AI.

        Analyze ONLY what is VISIBLE in the image. NO guessing:
        - No assumptions about city, country, culture.
        - No assumptions about identities.
        - No assumptions about unseen dangers.

        TASKS:
        1. Determine overall RISK LEVEL: LOW, MEDIUM, HIGH.
        2. Identify VISIBLE factors contributing to risk (list strings).
        3. Provide a short, factual narrative (max 2 sentences).
        4. HYBRID OPTIONAL FIELDS (DO NOT BREAK STRUCTURE):
           - crowdLevel: LOW / MEDIUM / HIGH
           - lightingCondition: BRIGHT / DIM / DARK

        Evaluate only:
        - Lighting (visible brightness)
        - Crowd presence (visible density)
        - Hazards (vehicles, broken surfaces, objects on ground, unsafe structures)
        - Suspicious behavior ONLY if clearly visible

        Return ONLY JSON following the schema.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { inlineData: { mimeType: parsed.mimeType, data: parsed.data } },
          { text: prompt }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: VISION_SCHEMA,
          temperature: 0.1
        }
      });

      return JSON.parse(extractJson(response.text)) as VisionAnalysisResult;
    } catch (e) {
      console.error("Vision Analysis Failed", e);
      return {
        riskLevel: "MEDIUM",
        factors: ["Vision module offline"],
        narrative: "Unable to analyze the image.",
        crowdLevel: null,
        lightingCondition: null
      };
    }
  },

  // ---------- HYBRID UPGRADE: SOS TRIAGE INTELLIGENCE ----------
  triageSOS: async (
    audioDataUrl: string | null,
    imageDataUrl: string | null,
    textDescription: string
  ): Promise<SOSTriageResult> => {
    try {
      const parts: any[] = [
        {
          text: `
            You are Sentinel Emergency Intelligence.

            TEXT DESCRIPTION:
            "${textDescription || "None"}"

            TASKS:
            1. TRANSCRIBE AUDIO (if provided):
               - No hallucinating languages.
               - Return "" if silent or invalid.
            
            2. IMAGE ANALYSIS (if provided):
               - Identify visible hazards ONLY.
               - No guessing location or hidden threats.

            3. DETERMINE SEVERITY:
               - LOW     = no threat / stable
               - MEDIUM  = uncertainty, mild distress
               - HIGH    = visible threat indicators
               - CRITICAL = violence, injury, collapse, weapon, extreme panic

            4. HYBRID OPTIONAL FIELDS (non-breaking):
               - panicScore (0–1): based on vocal tremor, short breaths, shouting
               - urgencyScore (0–1): based on semantics + tone

            5. OUTPUT:
               - transcript (string)
               - imageAnalysis (string)
               - recommendedResponse (Police / Medical / None)
               - adminBrief (technical summary)
               - touristMessage (calming message)
               - panicScore (optional)
               - urgencyScore (optional)

            Return ONLY JSON.
          `
        }
      ];

      // Attach Audio
      if (audioDataUrl) {
        const audioParsed = parseAudio(audioDataUrl);
        if (audioParsed) {
          parts.push({
            inlineData: {
              mimeType: audioParsed.mimeType,
              data: audioParsed.data
            }
          });
        } else {
          console.warn("Invalid audio format; skipping.");
        }
      }

      // Attach Image
      if (imageDataUrl) {
        const imageParsed = parseImage(imageDataUrl);
        if (imageParsed) {
          parts.push({
            inlineData: {
              mimeType: imageParsed.mimeType,
              data: imageParsed.data
            }
          });
        } else {
          console.warn("Invalid image format; skipping.");
        }
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: parts,
        config: {
          responseMimeType: "application/json",
          responseSchema: TRIAGE_SCHEMA,
          temperature: 0.15
        }
      });

      return JSON.parse(extractJson(response.text)) as SOSTriageResult;
    } catch (e) {
      console.error("Triage Failed", e);

      // Fallback still follows schema
      return {
        severity: "HIGH",
        transcript: "Audio unavailable.",
        imageAnalysis: "Image not processed.",
        recommendedResponse: "Police",
        adminBrief: "AI offline — treat as high risk.",
        touristMessage: "We are alerting responders.",
        panicScore: 0.6,
        urgencyScore: 0.7
      };
    }
  },

  // ---------- SEMANTIC SAFE ROUTE PLANNER ----------
  planSafeRoute: async (
    startLocation: string,
    endName: string
  ): Promise<RoutePlanResult> => {
    try {
      const prompt = `
        You are Sentinel Navigation AI.

        TASK:
        Plan a SAFE WALKING ROUTE from "${startLocation}" to "${endName}".

        RULES:
        - DO NOT generate fictional coordinates.
        - DO NOT assume real-world geography.
        - Use general urban-safety principles only:
          * Prefer well-lit main streets.
          * Avoid alleyways and low-visibility paths.
          * Avoid crowd hotspots if incident severity is likely.
        
        OUTPUT:
        {
          "narrative": "...",
          "steps": ["...", "...", "..."],
          "warnings": ["..."],
          "obstructionNotes": "optional string about possible obstructions"
        }

        HYBRID OPTIONAL ENHANCEMENTS:
        - Add "obstructionNotes" only if relevant (construction, crowding, dim lighting).
        - Provide safety reasons in the narrative, not specific geographic claims.

        Return ONLY JSON following the schema.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: ROUTE_SCHEMA,
          temperature: 0.2
        }
      });

      return JSON.parse(extractJson(response.text)) as RoutePlanResult;
    } catch (e) {
      console.error("Route Planning Failed", e);

      return {
        narrative: "AI routing temporarily offline. Using fallback safety suggestions.",
        steps: [
          "Walk toward a well-lit main street.",
          "Avoid narrow or isolated areas.",
          "Stay near commercial zones or populated walkways."
        ],
        warnings: ["AI service offline — proceed with caution."],
        obstructionNotes: "Unknown due to fallback mode."
      };
    }
  },

  // ---------- ANOMALY DETECTION (unchanged with stability improvements) ----------
  detectAnomaly: async (tourist: Tourist, recentPoints: any[]): Promise<any | null> => {
    try {
      const prompt = `
        You are Sentinel Anomaly Detection AI.

        Tourist: ${tourist.name}
        Battery: ${tourist.batteryLevel}%
        Last Location: ${JSON.stringify(tourist.lastLocation)}

        TASK:
        Detect unusual behavior or safety anomalies such as:
        - Sudden location drop-off
        - Route deviation
        - Entering an unusual zone
        - Distress movement pattern

        If anomaly is found:
        - is_anomaly = true
        - severity = 1–5
        - trigger_reason: a short explanation
        - suggested_action: next step (monitor / alert control room)

        Return ONLY JSON.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              is_anomaly: { type: Type.BOOLEAN },
              type: { type: Type.STRING },
              severity: { type: Type.INTEGER },
              confidence: { type: Type.NUMBER },
              anomaly_id: { type: Type.STRING, nullable: true },
              trigger_reason: { type: Type.STRING },
              suggested_action: { type: Type.STRING }
            },
            required: ["is_anomaly", "type", "severity", "confidence", "trigger_reason", "suggested_action"]
          }
        }
      });

      const result = JSON.parse(extractJson(response.text));
      if (!result.is_anomaly) return null;

      return {
        id: result.anomaly_id || `ANOM-${Date.now()}`,
        type: "ANOMALY",
        category: "Other",
        description: result.trigger_reason,
        severity: result.severity,
        touristId: tourist.id,
        location: tourist.lastLocation,
        status: "Open",
        timestamp: new Date().toISOString(),
        aiAnalysis: result.suggested_action
      };
    } catch (e) {
      console.error("Anomaly Detection Failed", e);
      return null;
    }
  },

  // ---------- SEMANTIC INTENT PARSER ----------
  parseIncidentIntent: async (description: string): Promise<any> => {
    try {
      const prompt = `
        Analyze report: "${description}"

        Determine the underlying INTENT:
        - WEAPON_VIOLENCE
        - MEDICAL_EMERGENCY
        - LOST_DISORIENTED
        - SAFETY_CONCERN
        - THEFT_LOSS
        - OTHER

        Provide:
        - reasoning (why)
        - confidence (0–1)
        - context_clues (list)
        - implied_severity (1–5)

        Return ONLY JSON.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intent: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              context_clues: { type: Type.ARRAY, items: { type: Type.STRING } },
              implied_severity: { type: Type.INTEGER }
            },
            required: ["intent", "reasoning", "confidence", "context_clues", "implied_severity"]
          }
        }
      });

      return JSON.parse(extractJson(response.text));
    } catch (e) {
      return {
        intent: "OTHER",
        reasoning: "Parsing failed.",
        confidence: 0.1,
        context_clues: [],
        implied_severity: 1
      };
    }
  },

  // ---------- INCIDENT ANALYSIS (kept stable, improved clarity) ----------
  analyzeIncident: async (description: string): Promise<any> => {
    const text = description.toLowerCase();
    const CRITICAL_KEYWORDS = [
      "pistol","gun","weapon","armed","shooting",
      "threat","attack","knife","bomb","robbery",
      "assault","hostage","injured","bleeding"
    ];
    
    const criticalHit = CRITICAL_KEYWORDS.find(k => text.includes(k));
    if (criticalHit) {
      return {
        category: "Crime",
        severity: 5,
        recommended_dispatch: "Police",
        analysis: `Critical keyword detected: ${criticalHit}`,
        confidence: 1.0,
        isCriticalOverride: true
      };
    }

    const intent = await GeminiService.parseIncidentIntent(description);

    let result = {
      category: "Other",
      severity: 2,
      recommended_dispatch: "None",
      analysis: intent.reasoning,
      confidence: intent.confidence
    };

    switch (intent.intent) {
      case "WEAPON_VIOLENCE":
        result = {
          category: "Crime",
          severity: 5,
          recommended_dispatch: "Police",
          analysis: intent.reasoning,
          confidence: intent.confidence
        };
        break;

      case "MEDICAL_EMERGENCY":
        result = {
          category: "Medical",
          severity: intent.implied_severity >= 4 ? 5 : 4,
          recommended_dispatch: "Ambulance",
          analysis: intent.reasoning,
          confidence: intent.confidence
        };
        break;

      case "SAFETY_CONCERN":
        result = {
          category: "Crime",
          severity: 4,
          recommended_dispatch: "Police",
          analysis: intent.reasoning,
          confidence: intent.confidence
        };
        break;

      case "LOST_DISORIENTED":
        result = {
          category: "Lost",
          severity: 3,
          recommended_dispatch: "Tourist Police",
          analysis: intent.reasoning,
          confidence: intent.confidence
        };
        break;

      case "THEFT_LOSS":
        result = {
          category: "Crime",
          severity: 3,
          recommended_dispatch: "Police",
          analysis: intent.reasoning,
          confidence: intent.confidence
        };
        break;
    }

    if (result.confidence < 0.6) {
      result.analysis += " (Low confidence)";
    }

    return result;
  },

  // ---------- MULTILINGUAL EMERGENCY MESSAGES ----------
  generateEmergencyMessages: async (
    incident: Incident,
    touristName: string
  ): Promise<EmergencyMessage[]> => {
    try {
      const prompt = `
        Generate EMERGENCY MESSAGES.

        Incident:
        - Type: ${incident.type}
        - Category: ${incident.category}
        - Severity: ${incident.severity}
        - Description: ${incident.description}

        Tourist: ${touristName}

        LANGUAGES:
        - English
        - Spanish
        - Japanese

        TARGETS:
        - Family
        - Police

        FORMAT:
        {
          "messages": [
            { "language": "...", "sms": "...", "voice": "...", "target": "..." }
          ]
        }

        Return ONLY valid JSON.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: MESSAGE_SCHEMA
        }
      });

      const parsed = JSON.parse(extractJson(response.text));
      return parsed.messages || [];
    } catch (e) {
      console.error("Emergency Message Generation Failed", e);
      return [];
    }
  }
};

// END OF GEMINI SERVICE

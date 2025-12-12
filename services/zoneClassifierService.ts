import { Tourist, Incident, ZoneClassification, EnvironmentAnalysis } from "../types";
import { GeminiService } from "./geminiService";

/**
 * INTERNAL CACHE:
 * Prevents calling Gemini repeatedly if the tourist hasn't moved zones.
 */
const zoneCache: Record<string, { zone: ZoneClassification; ts: number }> = {};

const CACHE_TTL_MS = 45_000; // 45s same as environment polling



export const ZoneClassifierService = {
  /**
   * Classifies zone using Gemini’s environment engine.
   * Automatically caches results and applies fallbacks to prevent UI breaks.
   */
  classify: async (tourist: Tourist, incidents: Incident[]): Promise<ZoneClassification> => {
    try {
      const cacheKey = tourist.id + "-" + tourist.lastLocation.zoneName;
      const now = Date.now();

      // ----------------------------
      // CACHE HIT (avoid unnecessary AI calls)
      // ----------------------------
      if (zoneCache[cacheKey] && now - zoneCache[cacheKey].ts < CACHE_TTL_MS) {
        return zoneCache[cacheKey].zone;
      }

      // ----------------------------
      // GEMINI CALL
      // ----------------------------
      const env: EnvironmentAnalysis = await GeminiService.analyzeEnvironment(
        tourist,
        incidents,
        new Date().toLocaleTimeString(),
        "Unknown"
      );

      let zone: ZoneClassification = env.zoneClassification;

      // ----------------------------
      // HARDEN OUTPUT (prevent UI crashes)
      // ----------------------------
      zone = {
        zone: zone.zone || "YELLOW",
        dangerScore: typeof zone.dangerScore === "number" ? zone.dangerScore : 40,
        riskFactors: Array.isArray(zone.riskFactors) ? zone.riskFactors : ["Unspecified"],
        recommendation: zone.recommendation || "Proceed carefully.",
        zoneDescription: zone.zoneDescription || "AI could not determine detailed description.",

        // Optional hybrid fields (normalize to avoid undefined)
        crowdIndex: zone.crowdIndex ?? null,
        lightingIndex: zone.lightingIndex ?? null,
        hazardIndex: zone.hazardIndex ?? null,
        nearestSafeZone: zone.nearestSafeZone ?? null
      };

      // ----------------------------
      // STORE IN CACHE
      // ----------------------------
      zoneCache[cacheKey] = { zone, ts: now };

      return zone;
    } catch (error) {
      console.error("Zone classification failed:", error);

      // ----------------------------
      // SAFE FALLBACK — NEVER return incomplete output
      // ----------------------------
      return {
        zone: "YELLOW",
        dangerScore: 45,
        riskFactors: ["Classifier Offline"],
        recommendation: "Proceed with caution.",
        zoneDescription: "AI unavailable — fallback zone.",
        crowdIndex: null,
        lightingIndex: null,
        hazardIndex: null,
        nearestSafeZone: null
      };
    }
  }

};

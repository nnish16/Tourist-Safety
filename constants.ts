import { AiDocSection, Tourist } from './types';

export const INITIAL_TOURISTS: Tourist[] = [
  {
    id: "T-1024",
    name: "Alice Voyager",
    status: "safe",
    safetyScore: 95,
    lastLocation: { lat: 35.6895, lng: 139.6917, timestamp: new Date().toISOString() },
    batteryLevel: 82,
    plannedRoute: ["Shibuya Crossing", "Meiji Shrine", "Yoyogi Park"]
  },
  {
    id: "T-2055",
    name: "Bob Trekker",
    status: "warning",
    safetyScore: 65,
    lastLocation: { lat: 35.7100, lng: 139.8107, timestamp: new Date(Date.now() - 3600000).toISOString() }, // 1 hour ago
    batteryLevel: 15,
    plannedRoute: ["Asakusa Temple", "Skytree"]
  }
];

export const AI_DOCS: AiDocSection[] = [
  {
    id: "2.1",
    title: "Task 2.1: AI-Based Anomaly Detection",
    description: "Identifies unusual behavior by analyzing location streams, battery telemetry, and itinerary adherence. It handles intermittent PWA data by weighting 'last known good' locations.",
    inputSchema: JSON.stringify({
      "tourist_id": "string",
      "timestamp": "ISO8601",
      "location": { "lat": "float", "lng": "float", "accuracy": "float" },
      "battery_level": "integer (0-100)",
      "speed": "float",
      "historical_locations": [{ "lat": "float", "lng": "float", "ts": "string" }],
      "itinerary": ["waypoint_id_1", "waypoint_id_2"],
      "risk_zones": [{ "poly": "coordinates[]", "level": "high" }]
    }, null, 2),
    outputSchema: JSON.stringify({
      "anomaly_id": "uuid",
      "tourist_id": "string",
      "type": "Route Deviation",
      "severity": 4,
      "confidence": 0.89,
      "trigger_data": "Deviated >500m from Waypoint B",
      "suggested_action": "Attempt Contact"
    }, null, 2),
    pseudoCode: `# Anomaly Detection Logic
def detect_anomaly(telemetry, profile):
    anomalies = []
    
    # Check A: Drop-off
    time_since_last = now() - telemetry.last_timestamp
    if time_since_last > THRESHOLD_INACTIVITY and telemetry.battery < 5:
        return create_anomaly("Distress Pattern (Dead Battery?)", severity=5)

    # Check B: Route Deviation
    dist_to_route = calculate_min_distance(telemetry.location, profile.itinerary_path)
    if dist_to_route > ALLOWED_DEVIATION:
        anomalies.append(create_anomaly("Route Deviation", severity=3))

    # Check C: Risk Zones
    if is_in_zone(telemetry.location, RISK_ZONES):
        anomalies.append(create_anomaly("Restricted Zone Entry", severity=4))

    return prioritize_anomalies(anomalies)`,
    integrationGuide: "Endpoint: POST /api/v1/ai/detect-anomaly. The PWA batches location updates locally and sends them when connectivity is available. The backend processes the batch chronologically to reconstruct the path before running detection."
  },
  {
    id: "2.2",
    title: "Task 2.2: Tourist Safety Score",
    description: "Calculates a real-time 0-100 score. Acts as a 'Health Bar' for the tourist's journey.",
    inputSchema: JSON.stringify({
      "tourist_id": "string",
      "active_anomalies": ["anomaly_obj"],
      "itinerary_adherence": "float (0-1)",
      "local_time_hour": "integer",
      "recent_vicinity_incidents": "integer",
      "connectivity_quality": "string (poor/good)"
    }, null, 2),
    outputSchema: JSON.stringify({
      "tourist_id": "string",
      "safety_score": 78,
      "color": "Yellow",
      "reason": "Late night in moderate risk zone",
      "advice": "Stay on main roads."
    }, null, 2),
    pseudoCode: `# Safety Score Calculation
def calculate_score(context):
    base_score = 100
    
    # Penalties
    for anomaly in context.active_anomalies:
        base_score -= (anomaly.severity * 10)
        
    if context.local_time_hour > 22 or context.local_time_hour < 5:
        base_score -= 10
        
    if context.recent_vicinity_incidents > 0:
        base_score -= 15

    # Cap result
    return max(0, min(100, base_score))`,
    integrationGuide: "Endpoint: GET /api/v1/ai/safety-score/{id}. Polled by PWA every 5-15 mins or pushed via WebSocket if critical change occurs."
  },
  {
    id: "2.3",
    title: "Task 2.3: Multilingual Emergency Messages",
    description: "Generates context-aware alerts for diverse stakeholders (Police, Family, Local Auth).",
    inputSchema: JSON.stringify({
      "anomaly_context": "anomaly_obj",
      "contacts": [{ "name": "Mom", "lang": "es" }, { "name": "Local Police", "lang": "ja" }],
      "location_context": "Near Mt. Fuji Trail 5"
    }, null, 2),
    outputSchema: JSON.stringify({
      "message_id": "msg_123",
      "translations": [
        { "lang": "es", "sms": "Alerta: Alice está fuera de ruta cerca de...", "target": "Mom" },
        { "lang": "ja", "voice_script": "Dispatcher, tourist Alice reported missing at coordinates...", "target": "Police" }
      ]
    }, null, 2),
    pseudoCode: `# Message Gen Logic (LLM Wrapper)
def generate_messages(incident):
    messages = []
    for target in incident.contacts:
        prompt = f"Write an emergency SMS in {target.lang} for {target.role} about {incident.type} at {incident.location}."
        msg_content = call_llm(prompt)
        messages.append({ "lang": target.lang, "content": msg_content })
    return messages`,
    integrationGuide: "Triggered asynchronously via Message Queue (RabbitMQ) when Anomaly Severity >= 4."
  }
];
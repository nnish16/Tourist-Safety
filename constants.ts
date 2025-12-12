import { AiDocSection, Tourist } from './types';

export const INITIAL_TOURISTS: Tourist[] = [
  {
    id: "T-1024",
    digitalId: "DID:7x92...8a12",
    name: "Alice Voyager",
    age: 28,
    gender: "Female",
    nationality: "USA",
    contacts: [{ name: "John Doe", relation: "Father", phone: "+1-555-0101" }],
    status: "safe",
    safetyScore: 95,
    lastLocation: { lat: 35.6895, lng: 139.6917, timestamp: new Date().toISOString(), zoneName: "Shibuya Crossing" },
    batteryLevel: 82,
    plannedRoute: ["Shibuya Crossing", "Meiji Shrine", "Yoyogi Park"],
    isSosActive: false,
    language: "en"
  },
  {
    id: "T-2055",
    digitalId: "DID:3m55...9b99",
    name: "Bob Trekker",
    age: 34,
    gender: "Male",
    nationality: "Canada",
    contacts: [{ name: "Sarah Smith", relation: "Spouse", phone: "+1-555-0202" }],
    status: "warning",
    safetyScore: 65,
    lastLocation: { lat: 35.7100, lng: 139.8107, timestamp: new Date(Date.now() - 3600000).toISOString(), zoneName: "Asakusa Backstreets" }, 
    batteryLevel: 15,
    plannedRoute: ["Asakusa Temple", "Skytree"],
    isSosActive: false,
    language: "en"
  }
];

export const AI_DOCS: AiDocSection[] = [
  {
    id: "2.1",
    title: "Privacy-Preserving SOS Protocol",
    description: "Ensures tourist identity remains anonymous (masked via Digital ID) until a high-severity SOS event triggers the 'Break-Glass' protocol, revealing PII to authorities.",
    inputSchema: JSON.stringify({
      "digital_id": "DID:ETH:0x123...",
      "event_type": "SOS_TRIGGER",
      "timestamp": "ISO8601",
      "auth_token": "JWT_SIGNED_BY_DEVICE"
    }, null, 2),
    outputSchema: JSON.stringify({
      "access_granted": true,
      "decrypted_profile": {
        "name": "Alice Voyager",
        "medical_info": "Allergic to Penicillin",
        "contacts": [{ "name": "John Doe", "relation": "Father" }]
      },
      "dispatch_id": "DISP-9988"
    }, null, 2),
    pseudoCode: `def handle_incident(incident):
  if incident.type == 'SOS' or incident.severity >= 4:
      profile = decrypt_identity(incident.digital_id)
      dispatch_services(profile.location, profile.medical)
      return { "reveal_pii": True }
  else:
      return { "reveal_pii": False, "id": incident.digital_id }`,
    integrationGuide: "Smart Contract verifies SOS signature. If valid, backend releases encryption keys for the specific tourist profile to the Admin Dashboard."
  },
];
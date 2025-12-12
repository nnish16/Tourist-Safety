import React, { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import RoleSelection from "./components/RoleSelection";
import TouristRegistration from "./components/TouristRegistration";
import TouristPWA from "./components/TouristPWA";
import Documentation from "./components/Documentation";
import NotificationSystem, { Notification } from "./components/NotificationSystem";
import AdminLogin from "./components/AdminLogin";

import { AppView, Tourist, Incident, EnvironmentAnalysis } from "./types";
import { INITIAL_TOURISTS } from "./constants";
import { GeminiService } from "./services/geminiService";

// -------------------------------------------------------
// DEMO INCIDENTS
// -------------------------------------------------------
const DEMO_INCIDENTS: Incident[] = [
  {
    id: "INC-DEMO-1",
    touristId: "T-DEMO-1",
    type: "ANOMALY",
    category: "Other",
    description:
      "Significant route deviation detected. Tourist moving away from safe zone toward restricted area.",
    severity: 5,
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    location: {
      lat: 35.6895,
      lng: 139.6917,
      zoneName: "Times Square Manhattan Outskirts",
    },
    status: "Open",
    aiAnalysis: "High probability of coercion or lost. Suggest immediate contact.",
  },
  {
    id: "INC-DEMO-2",
    touristId: "T-DEMO-2",
    type: "ANOMALY",
    category: "Lost",
    description: 'Geo-fence breach. User exited "Asakusa Tourist Zone".',
    severity: 3,
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    location: {
      lat: 35.7100,
      lng: 139.8107,
      zoneName: "Central Park Downtown Border",
    },
    status: "Open",
    aiAnalysis: "User likely looking for transit. Monitor.",
  },
];

// -------------------------------------------------------
// MAIN APP
// -------------------------------------------------------
const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.ROLE_SELECT);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const [tourists, setTourists] = useState<Tourist[]>(INITIAL_TOURISTS);
  const [incidents, setIncidents] = useState<Incident[]>(DEMO_INCIDENTS);

  const [activeTouristId, setActiveTouristId] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // -------------------------------------------------------
  // NOTIFICATION SYSTEM
  // -------------------------------------------------------
  const addNotification = (
    title: string,
    message: string,
    type: "danger" | "success" | "info" = "info"
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotif: Notification = {
      id,
      title,
      message,
      type,
      timestamp: Date.now(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  // -------------------------------------------------------
  // ROUTING / VIEWS
  // -------------------------------------------------------
  const handleRoleSelect = (view: AppView) => {
    if (view === AppView.ADMIN_DASHBOARD) {
      if (isAdminAuthenticated) setCurrentView(AppView.ADMIN_DASHBOARD);
      else setCurrentView(AppView.ADMIN_LOGIN);
    } else setCurrentView(view);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setCurrentView(AppView.ADMIN_DASHBOARD);
    addNotification("Access Granted", "Welcome to Command Center", "success");
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setActiveTouristId(null);
    addNotification("Logged Out", "Session terminated securely.", "info");
  };

  // -------------------------------------------------------
  // REGISTER NEW TOURIST
  // Ensures all new fields from types.ts are initialized correctly.
  // -------------------------------------------------------
  const registerTourist = (data: Partial<Tourist>) => {
    const newTourist: Tourist = {
      id: `T-${Math.floor(Math.random() * 10000)}`,
      digitalId: `DID:ETH:${Math.random().toString(36).substring(2, 15)}`,
      name: data.name || "New Tourist",
      age: data.age || 25,
      nationality: data.nationality || "Unknown",
      contacts: data.contacts || [],
      status: "safe",
      safetyScore: 90, // temporary before first Gemini poll
      lastLocation: {
        lat: 35.6895,
        lng: 139.6917,
        timestamp: new Date().toISOString(),
        zoneName: "Shibuya Crossing",
      },
      batteryLevel: 95,
      plannedRoute: [],
      isSosActive: false,
      language: "en",
      ...data,
    };

    setTourists([...tourists, newTourist]);
    setActiveTouristId(newTourist.id);

    setCurrentView(AppView.TOURIST_DASHBOARD);

    addNotification(
      "Identity Verified",
      `Tracking Activated for ${newTourist.name}`,
      "success"
    );
  };

  // -------------------------------------------------------
  // UPDATE TOURIST
  // -------------------------------------------------------
  const handleTouristUpdate = (updated: Tourist) => {
    setTourists((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
  };

  // -------------------------------------------------------
  // INCIDENT REPORTING + AI TRIAGE
  // -------------------------------------------------------
  const handleIncidentReport = async (
    touristId: string,
    type: "SOS" | "REPORT",
    description: string,
    evidence?: { audio?: string; image?: string }
  ) => {
    const tourist = tourists.find((t) => t.id === touristId);
    if (!tourist) return;

    let triageResult = undefined;
    let aiAnalysis = null;
    let severity: 1 | 2 | 3 | 4 | 5 = 2;
    let category: Incident["category"] = "Other";

    // Standard REPORT (no media)
    if (type === "REPORT" && !evidence) {
      const analysis = await GeminiService.analyzeIncident(description);
      severity = analysis.severity;
      category = analysis.category;
      aiAnalysis = analysis.analysis;
    }

    // SOS or REPORT WITH MEDIA → full multimodal triage
    if (type === "SOS" || (type === "REPORT" && evidence)) {
      triageResult = await GeminiService.triageSOS(
        evidence?.audio || null,
        evidence?.image || null,
        description
      );

      aiAnalysis = triageResult.adminBrief;
      severity = triageResult.severity === "CRITICAL" ? 5 : 4;
      category = "Crime";
    }

    const newIncident: Incident = {
      id: `INC-${Date.now()}`,
      touristId,
      type,
      category,
      description: type === "SOS" ? "SOS ALERT - CRITICAL" : description,
      severity,
      timestamp: new Date().toISOString(),
      location: tourist.lastLocation,
      status: "Open",
      aiAnalysis: aiAnalysis,
      triage: triageResult,
    };

    setIncidents((prev) => [newIncident, ...prev]);

    // SOS UI impact
    if (type === "SOS") {
      handleTouristUpdate({
        ...tourist,
        isSosActive: true,
        status: "danger",
      });

      addNotification(
        "CRITICAL ALERT",
        `SOS Triggered by ${tourist.name} in ${tourist.lastLocation.zoneName}`,
        "danger"
      );
    } else {
      addNotification("New Report", `${category} report filed by ${tourist.name}`, "info");
    }
  };

  // -------------------------------------------------------
  // DISPATCH + RESOLVE
  // -------------------------------------------------------
  const handleDispatch = (incidentId: string, type: "Police" | "Medical") => {
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === incidentId
          ? {
              ...i,
              status: "Dispatched",
              description: `${i.description} [${type} Dispatched]`,
            }
          : i
      )
    );
    addNotification("Units Dispatched", `${type} units en route`, "success");
  };

  const handleResolve = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === incidentId ? { ...i, status: "Resolved" } : i
      )
    );

    const incident = incidents.find((i) => i.id === incidentId);
    if (incident && incident.type === "SOS") {
      const tourist = tourists.find((t) => t.id === incident.touristId);
      if (tourist) {
        handleTouristUpdate({
          ...tourist,
          isSosActive: false,
          status: "safe",
        });
      }
    }

    addNotification("Case Resolved", `Incident closed`, "success");
  };

  // -------------------------------------------------------
  // ACTIVE TOURIST CONTEXT
  // -------------------------------------------------------
  const activeTourist = tourists.find((t) => t.id === activeTouristId);

  // -------------------------------------------------------
  // RENDER ROOT
  // -------------------------------------------------------
  return (
    <>
      <NotificationSystem
        notifications={notifications}
        onDismiss={(id) =>
          setNotifications((prev) => prev.filter((n) => n.id !== id))
        }
      />

      {currentView === AppView.ROLE_SELECT ? (
        <RoleSelection onSelect={handleRoleSelect} />

      ) : currentView === AppView.ADMIN_LOGIN ? (
        <AdminLogin
          onLogin={handleAdminLoginSuccess}
          onBack={() => setCurrentView(AppView.ROLE_SELECT)}
        />

      ) : currentView === AppView.TOURIST_LOGIN ? (
        <TouristRegistration
          onRegister={registerTourist}
          onBack={() => setCurrentView(AppView.ROLE_SELECT)}
        />

      ) : (
        <Layout currentView={currentView} setView={setCurrentView} onLogout={handleLogout}>
          {/* ---------------- ADMIN DASHBOARD ---------------- */}
          {currentView === AppView.ADMIN_DASHBOARD && (
            <Dashboard
              tourists={tourists}
              incidents={incidents}
              onDispatch={handleDispatch}
              onResolve={handleResolve}
            />
          )}

          {/* ---------------- TOURIST DASHBOARD --------------- */}
          {currentView === AppView.TOURIST_DASHBOARD && activeTourist && (
            <div className="p-6 md:p-12 flex items-center justify-center min-h-full">
              <TouristPWA
                tourist={activeTourist}
                onUpdate={handleTouristUpdate}
                onReportIncident={(type, desc, evidence) =>
                  handleIncidentReport(activeTourist.id, type as any, desc, evidence)
                }
                onSosToggle={(active) => {
                  if (active)
                    handleIncidentReport(
                      activeTourist.id,
                      "SOS",
                      "Emergency Panic Button Triggered"
                    );
                  else
                    handleTouristUpdate({
                      ...activeTourist,
                      isSosActive: false,
                    });
                }}
              />

              {/* Simulation Note */}
              <div className="fixed bottom-8 right-8 bg-slate-800/90 backdrop-blur border border-white/10 p-4 rounded-xl shadow-2xl text-xs max-w-xs hidden md:block z-50">
                <p className="font-bold text-indigo-400 mb-1 uppercase tracking-wider">
                  Simulation Active
                </p>
                <p className="text-slate-300 leading-relaxed">
                  You are acting as <b>{activeTourist.name}</b>.<br />
                  Triggering SOS will immediately alert the Admin Dashboard.
                </p>
              </div>
            </div>
          )}

          {/* ---------------- DOCUMENTATION ---------------- */}
          {currentView === AppView.DOCS && <Documentation />}
        </Layout>
      )}
    </>
  );
};

export default App;
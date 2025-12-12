// ========================
// TouristPWA.tsx — Neon Premium Edition (Semantic Zones + UI Glow)
// ========================

import React, { useState, useEffect, useRef } from 'react';
import {
  Tourist,
  SafetyScoreDetails,
  ZoneClassification,
  VisionAnalysisResult,
  RoutePlanResult
} from '../types';

import SafetyScoreGauge from './SafetyScoreGauge';
import DigitalIDCard from './DigitalIDCard';
import MapView from './MapView';

import {
  MapPin,
  Battery,
  Shield,
  Home,
  FileText,
  AlertTriangle,
  Loader2,
  X,
  Sparkles,
  Camera,
  Navigation,
  Mic,
  Image as ImageIcon,
  Footprints,
  Bell
} from 'lucide-react';

import { GeminiService } from '../services/geminiService';

interface Props {
  tourist: Tourist;
  onUpdate: (t: Tourist) => void;
  onReportIncident: (type: string, desc: string, evidence?: { audio?: string; image?: string }) => void;
  onSosToggle: (active: boolean) => void;
}

const TouristPWA: React.FC<Props> = ({ tourist, onUpdate, onReportIncident, onSosToggle }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'id'>('home');

  const [scoreDetails, setScoreDetails] = useState<SafetyScoreDetails>({
    score: tourist.safetyScore,
    color: 'Green',
    reason: 'Analyzing environment...',
    advice: 'Stay safe.'
  });

  const [zoneInfo, setZoneInfo] = useState<ZoneClassification | null>(null);
  const [loadingEnvironment, setLoadingEnvironment] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const [showVisionModal, setShowVisionModal] = useState(false);
  const [visionImage, setVisionImage] = useState<string | null>(null);
  const [visionResult, setVisionResult] = useState<VisionAnalysisResult | null>(null);
  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Safe Route
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [destination, setDestination] = useState('');
  const [routeResult, setRouteResult] = useState<RoutePlanResult | null>(null);
  const [isPlanningRoute, setIsPlanningRoute] = useState(false);
  const [routePolyline, setRoutePolyline] = useState<[number, number][]>([]);

  // SOS
  const [sosPressing, setSosPressing] = useState(false);
  const sosPressStartRef = useRef<number | null>(null);
  const SOS_MIN_HOLD_MS = 600;

  const [sosImage, setSosImage] = useState<string | null>(null);
  const [sosAudio, setSosAudio] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const isPollingRef = useRef(false);

  // -----------------------------
  // ENVIRONMENT POLLING
  // -----------------------------
  useEffect(() => {
    const poll = async () => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        setLoadingEnvironment(true);
        const result = await GeminiService.analyzeEnvironment(
          tourist,
          [],
          new Date().toLocaleTimeString(),
          "Cloudy"
        );

        setScoreDetails(result.safetyScore);
        setZoneInfo(result.zoneClassification);
      } catch (e) {
        console.error("Env Poll Failed", e);
      } finally {
        setLoadingEnvironment(false);
        isPollingRef.current = false;
      }
    };

    poll();
    const id = setInterval(poll, 45000);
    return () => clearInterval(id);
  }, [tourist.lastLocation.zoneName]);

  // -----------------------------
  // UI ZONE GLOW (Semantic)
  // -----------------------------
  const getGlowClass = () => {
    if (!zoneInfo) return "";

    if (zoneInfo.zone === "RED")
      return "ring-red-500/40 shadow-[0_0_40px_rgba(255,0,0,0.45)] border-red-900/60";

    if (zoneInfo.zone === "YELLOW")
      return "ring-amber-400/40 shadow-[0_0_40px_rgba(255,200,0,0.35)] border-amber-800/50";

    return "ring-emerald-400/30 shadow-[0_0_40px_rgba(0,255,160,0.25)] border-emerald-800/50";
  };

  // -----------------------------
  // REPORT SUBMIT
  // -----------------------------
  const handleReportSubmit = async () => {
    if (!reportText) return;

    setIsSubmittingReport(true);
    await new Promise(res => setTimeout(res, 500));

    onReportIncident("REPORT", reportText);

    setIsSubmittingReport(false);
    setShowReportModal(false);
    setReportText("");
  };

  // -----------------------------
  // VISION SCAN
  // -----------------------------
  const handleVisionScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;

      setVisionImage(base64);
      setIsAnalyzingVision(true);

      const result = await GeminiService.analyzeImage(base64);

      setVisionResult(result);
      setIsAnalyzingVision(false);
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  // -----------------------------
  // SAFE ROUTE
  // -----------------------------
  const handlePlanRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination) return;

    setIsPlanningRoute(true);

    const result = await GeminiService.planSafeRoute(
      tourist.lastLocation.zoneName,
      destination
    );

    setRouteResult(result);

    // Fake polyline for UI only
    const start = tourist.lastLocation;
    const end = { lat: start.lat + 0.004, lng: start.lng + 0.004 };

    const poly: [number, number][] = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      poly.push([
        start.lat + (end.lat - start.lat) * t,
        start.lng + (end.lng - start.lng) * t
      ]);
    }
    setRoutePolyline(poly);

    setIsPlanningRoute(false);
  };

  // -----------------------------
  // SOS AUDIO RECORDING
  // -----------------------------
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = e => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();

        reader.onloadend = () => setSosAudio(reader.result as string);
        reader.readAsDataURL(blob);

        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
    } catch (e) {
      console.error("Mic error", e);
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive")
        mediaRecorderRef.current.stop();
    } catch {}
  };

  // -----------------------------
  // SOS TRIGGER
  // -----------------------------
  const triggerSOS = () => {
    onSosToggle(true);

    onReportIncident(
      "SOS",
      "Enhanced SOS Triggered",
      sosImage || sosAudio
        ? { image: sosImage || undefined, audio: sosAudio || undefined }
        : undefined
    );
  };

  // -----------------------------
  // HOME SCREEN
  // -----------------------------
  const renderHome = () => (
    <div className="flex flex-col gap-6 pb-20">

      {/* Safety Gauge */}
      <div className="mt-4">
        <SafetyScoreGauge
          score={scoreDetails.score}
          color={scoreDetails.color}
          reason={scoreDetails.reason}
          advice={scoreDetails.advice}
        />
      </div>

      {/* Zone Status */}
      <div className="grid grid-cols-2 gap-4">

        {/* Zone Card */}
        <div className={`p-4 rounded-2xl border backdrop-blur-xl ${getGlowClass()}`}>
          <div className="text-[10px] text-slate-400 uppercase">Current Zone</div>

          <div className="flex items-center gap-1 text-white font-bold">
            <MapPin className="w-3 h-3" />
            {tourist.lastLocation.zoneName}
          </div>

          {loadingEnvironment ? (
            <div className="flex gap-2 items-center text-xs text-slate-500 mt-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Updating…
            </div>
          ) : zoneInfo ? (
            <>
              <div className={`mt-2 text-xs font-bold px-2 py-1 rounded border inline-flex items-center gap-1`}>
                <Shield className="w-3 h-3" /> {zoneInfo.zone}
              </div>

              <p className="text-[10px] text-slate-400 mt-2">
                {zoneInfo.recommendation}
              </p>
            </>
          ) : null}
        </div>

        {/* Threat Level */}
        <div className="p-4 rounded-2xl border border-slate-700/50 backdrop-blur-xl bg-slate-800/30">
          <div className="text-[10px] text-slate-400 uppercase">Threat Level</div>

          <div className="text-white font-bold flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                zoneInfo?.zone === "RED" ? "bg-red-500" : "bg-emerald-500"
              }`}
            ></span>

            {zoneInfo?.zone === "RED" ? "HIGH" : "LOW"}
          </div>

          <div className="text-xs text-slate-400 mt-2">
            {zoneInfo?.riskFactors?.[0] || "No threats detected"}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">

        {/* Report Issue */}
        <button
          onClick={() => setShowReportModal(true)}
          className="bg-slate-800/60 p-4 rounded-2xl border border-white/5 backdrop-blur-xl hover:bg-slate-700 transition"
        >
          <div className="p-2 bg-indigo-500/20 rounded-full text-indigo-400 mx-auto">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-300 font-bold">Report Issue</span>
        </button>

        {/* Scan */}
        <button
          onClick={() => {
            setShowVisionModal(true);
            setVisionImage(null);
            setVisionResult(null);
          }}
          className="bg-slate-800/60 p-4 rounded-2xl border border-white/5 backdrop-blur-xl hover:bg-slate-700"
        >
          <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-400 mx-auto">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-300 font-bold">Scan Area</span>
        </button>

        {/* Safe Route */}
        <button
          onClick={() => setShowRouteModal(true)}
          className="col-span-2 bg-gradient-to-r from-blue-600/30 to-purple-600/30 p-4 rounded-2xl border border-blue-500/20 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-full text-blue-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">Safe Route Advisor</span>
              <span className="text-xs text-slate-400 block">AI Semantic Path</span>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </button>
      </div>
    </div>
  );

  // -----------------------------
  // MAIN UI WRAPPER
  // -----------------------------
  return (
    <div
      className={`
        relative w-full max-w-[380px] h-[760px]
        bg-slate-950 rounded-[38px] overflow-hidden
        border-[10px] transition-all duration-700
        ring-1
        ${getGlowClass()}
      `}
    >

      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-6 pt-10 flex justify-between border-b border-white/10">
        <h2 className="text-white font-bold text-xl flex gap-2">
          Sentinel
          <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-400/30 rounded-lg">
            AI
          </span>
        </h2>

        <div className="text-[10px] text-slate-400 flex gap-3 items-center">
          <Battery className="w-3 h-3 text-emerald-400" />
          {tourist.batteryLevel}%
          <Bell className="w-4 h-4 ml-2" />
        </div>
      </div>

      {/* MAIN BODY */}
      <div className="flex-1 overflow-y-auto p-6 pb-28">
        {activeTab === "home" && renderHome()}
        {activeTab === "id" && <DigitalIDCard tourist={tourist} />}
        {activeTab === "map" && (
          <div className="relative w-full h-full">
            <MapView
              center={tourist.lastLocation}
              zoom={15}
              tourists={[tourist]}
              routePolyline={routePolyline}
            />

            {routePolyline.length > 0 && routeResult && (
              <div className="absolute bottom-6 left-4 right-4 bg-slate-900/90 backdrop-blur-xl border border-blue-500/20 p-4 rounded-xl">
                <h4 className="text-xs text-blue-400 font-bold uppercase mb-2">
                  AI Navigation Steps
                </h4>
                <ul className="space-y-2">
                  {routeResult.steps.map((step, i) => (
                    <li key={i} className="text-xs flex gap-2 text-slate-300">
                      <Footprints className="w-3 h-3 text-slate-600" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RESTORED REPORT MODAL */}
      {showReportModal && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-6 flex items-center justify-center animate-in fade-in zoom-in duration-200">
          <div className="w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setShowReportModal(false)} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Report Issue</h3>
            <textarea
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="Describe the incident..."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
            />
            <button
              onClick={handleReportSubmit}
              disabled={!reportText || isSubmittingReport}
              className="w-full mt-4 py-3 bg-indigo-600 rounded-xl font-bold text-white flex items-center justify-center gap-2"
            >
              {isSubmittingReport ? <Loader2 className="animate-spin" /> : "Submit Report"}
            </button>
          </div>
        </div>
      )}

      {/* RESTORED VISION MODAL */}
      {showVisionModal && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-6 flex items-center justify-center animate-in fade-in zoom-in duration-200">
          <div className="w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 relative shadow-2xl text-center">
            <button onClick={() => setShowVisionModal(false)} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Camera className="w-6 h-6 text-emerald-400" /> Vision AI
            </h3>

            {!visionImage && (
              <div className="mt-8">
                <p className="text-slate-400 text-sm mb-6">Upload surroundings for real-time risk analysis.</p>
                <label className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-2xl cursor-pointer transition-colors border border-slate-700 flex flex-col items-center gap-2">
                  <Camera className="w-8 h-8 text-emerald-500" />
                  <span>Take Photo / Upload</span>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleVisionScan} />
                </label>
              </div>
            )}

            {visionImage && (
              <div className="mt-4">
                <img src={visionImage} alt="Analysis" className="w-full h-40 object-cover rounded-xl mb-4 border border-slate-700" />
                {isAnalyzingVision ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    <span className="text-sm text-emerald-400 animate-pulse">Analyzing Scene...</span>
                  </div>
                ) : visionResult ? (
                  <div className="text-left bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-500 uppercase font-bold">Risk Level</span>
                      <span className={`text-sm font-bold px-2 py-0.5 rounded ${visionResult.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-500' : visionResult.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                        {visionResult.riskLevel}
                      </span>
                    </div>
                    <p className="text-sm text-white mb-3 leading-relaxed">{visionResult.narrative}</p>
                    <div className="flex flex-wrap gap-1">
                      {visionResult.factors.map((f, i) => (
                        <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">{f}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESTORED ROUTE MODAL */}
      {showRouteModal && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-6 flex items-center justify-center animate-in fade-in zoom-in duration-200">
          <div className="w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setShowRouteModal(false)} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Navigation className="w-5 h-5 text-blue-400" /> Safe Route</h3>
            <form onSubmit={handlePlanRoute} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Destination</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g. Tokyo Station"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isPlanningRoute || !destination}
                className="w-full py-3 bg-blue-600 rounded-xl font-bold text-white flex items-center justify-center gap-2"
              >
                {isPlanningRoute ? <Loader2 className="animate-spin" /> : "Plan AI Route"}
              </button>
            </form>
            {routeResult && !isPlanningRoute && (
              <div className="mt-6 bg-slate-950 p-4 rounded-xl border border-slate-800 animate-in slide-in-from-bottom-2">
                <p className="text-sm text-slate-300 leading-relaxed mb-3">{routeResult.narrative}</p>
                <div className="space-y-2 mb-3">
                  {routeResult.steps.slice(0, 3).map((step, i) => (
                    <div key={i} className="flex gap-2 text-xs text-slate-400">
                      <span className="text-blue-500 font-bold">{i + 1}.</span> {step}
                    </div>
                  ))}
                </div>
                {routeResult.warnings.map((w, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 p-2 rounded mb-1">
                    <AlertTriangle className="w-3 h-3" /> {w}
                  </div>
                ))}
                <div className="mt-3 text-center text-xs text-blue-400">
                  Redirecting to Map View...
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER — SOS + NAV */}
      {!tourist.isSosActive ? (
        <div className="absolute bottom-0 w-full bg-slate-900/80 backdrop-blur-2xl pb-5 pt-3 border-t border-white/5">
          <div className="px-8 -mt-5">
            <button
              onMouseDown={() => {
                sosPressStartRef.current = Date.now();
                setSosPressing(true);
              }}
              onMouseUp={() => {
                const diff = Date.now() - (sosPressStartRef.current || 0);
                sosPressStartRef.current = null;
                setSosPressing(false);
                if (diff >= SOS_MIN_HOLD_MS) triggerSOS();
              }}
              onMouseLeave={() => {
                sosPressStartRef.current = null;
                setSosPressing(false);
              }}
              className={`w-full py-4 text-lg font-black rounded-2xl transition-all flex justify-center items-center gap-3
                  ${sosPressing
                    ? "bg-red-700 text-white scale-[0.97]"
                    : "bg-gradient-to-r from-red-600 to-rose-600 text-white"
                  }
                `}
            >
              <AlertTriangle className="w-5 h-5" />
              {sosPressing ? "RELEASE TO TRIGGER" : "HOLD FOR SOS"}
            </button>
          </div>

          {/* NAV TABS */}
          <div className="flex justify-around mt-4">
            <button
              onClick={() => setActiveTab("home")}
              className={`p-3 rounded-xl ${activeTab === "home" ? "text-indigo-400 bg-white/10" : "text-slate-400"}`}
            >
              <Home className="w-6 h-6" />
            </button>

            <button
              onClick={() => setActiveTab("map")}
              className={`p-3 rounded-xl ${activeTab === "map" ? "text-indigo-400 bg-white/10" : "text-slate-400"}`}
            >
              <MapPin className="w-6 h-6" />
            </button>

            <button
              onClick={() => setActiveTab("id")}
              className={`p-3 rounded-xl ${activeTab === "id" ? "text-indigo-400 bg-white/10" : "text-slate-400"}`}
            >
              <Shield className="w-6 h-6" />
            </button>
          </div>
        </div>
      ) : (
        // SOS ACTIVE OVERLAY
        <div className="absolute inset-0 bg-red-700 flex flex-col items-center justify-center text-white text-center p-6">

          <AlertTriangle className="w-20 h-20 animate-pulse mb-4" />

          <h2 className="text-3xl font-black mb-2">SOS ACTIVE</h2>
          <p className="opacity-80 text-sm mb-6">Emergency Broadcast Sent</p>

          <div className="bg-white/10 p-4 rounded-xl w-full max-w-xs border border-white/20">

            <p className="text-xs font-bold text-red-200 uppercase">Add Intel</p>

            <div className="flex gap-2 mt-2">
              <label className="flex-1 bg-white/10 rounded-lg py-3 text-center cursor-pointer hover:bg-white/20">
                <ImageIcon className="w-5 h-5 mx-auto mb-1" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (!f) return;

                    const r = new FileReader();
                    r.onloadend = () => setSosImage(r.result as string);
                    r.readAsDataURL(f);
                  }}
                />
                <span className="text-[10px]">Attach</span>
              </label>

              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                className="flex-1 bg-white/10 rounded-lg py-3 text-center hover:bg-white/20"
              >
                <Mic className="w-5 h-5 mx-auto mb-1" />
                <span className="text-[10px]">Voice</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => onSosToggle(false)}
            className="mt-6 bg-white text-red-700 font-bold px-8 py-3 rounded-full shadow-lg"
          >
            CANCEL
          </button>
        </div>
      )}
    </div>
  );
};

export default TouristPWA;
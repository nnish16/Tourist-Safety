import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { Tourist, Incident, ZoneClassification } from "../types";

interface Props {
  center: { lat: number; lng: number };
  zoom: number;
  tourists?: Tourist[];
  incidents?: Incident[];
  className?: string;
  showZones?: boolean;
  interactive?: boolean;
  routePolyline?: [number, number][];
}

const MapView: React.FC<Props> = ({
  center,
  zoom,
  tourists = [],
  incidents = [],
  className,
  showZones = true,
  interactive = true,
  routePolyline = [],
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layerGroup = useRef<L.LayerGroup>(L.layerGroup());

  // Visual marker class
  const getMarkerClass = (t: Tourist) => {
    if (t.isSosActive || t.status === "danger") return "marker-pulse marker-red";
    if (t.status === "warning") return "marker-pulse marker-yellow";
    return "marker-pulse marker-blue";
  };

  // Convert AI zone → visual colors
  const getZoneColor = (zone: ZoneClassification["zone"]) => {
    switch (zone) {
      case "RED":
        return { stroke: "#ef4444", fill: "#ef4444" };
      case "YELLOW":
        return { stroke: "#f59e0b", fill: "#f59e0b" };
      default:
        return { stroke: "#10b981", fill: "#10b981" };
    }
  };

  // Convert AI dangerScore (0–100) → zone radius
  const getZoneRadius = (dangerScore: number) => {
    if (dangerScore >= 80) return 900;     // severe
    if (dangerScore >= 50) return 700;     // medium
    return 500;                             // low
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Init map once
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        center: [center.lat, center.lng],
        zoom,
        zoomControl: false,
        attributionControl: false,
        dragging: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        boxZoom: interactive,
        keyboard: interactive,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap & CARTO",
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(mapInstance.current);

      layerGroup.current.addTo(mapInstance.current);
    } else {
      mapInstance.current.setView([center.lat, center.lng], zoom);
    }

    const map = mapInstance.current;
    const layers = layerGroup.current;
    layers.clearLayers();

    // --------------------------------------------------------------------
    // ✅ AI-Driven ZONE RENDERING
    // --------------------------------------------------------------------
    if (showZones) {
      tourists.forEach((t) => {
        const zoneInfo = (t as any).zoneClassification as ZoneClassification | undefined;
        if (!zoneInfo) return; // no AI zone yet

        const { zone, dangerScore } = zoneInfo;
        const { stroke, fill } = getZoneColor(zone);
        const radius = getZoneRadius(dangerScore);

        L.circle([t.lastLocation.lat, t.lastLocation.lng], {
          color: stroke,
          fillColor: fill,
          fillOpacity: 0.12,
          radius,
          weight: 1,
          dashArray: zone === "RED" ? "6,10" : zone === "YELLOW" ? "4,8" : "2,6",
        })
          .addTo(layers)
          .bindPopup(
            `<b>${zone} ZONE</b><br>Danger Score: ${dangerScore}<br>${zoneInfo.zoneDescription}`
          );
      });
    }

    // --------------------------------------------------------------------
    // SAFE ROUTE (kept same)
    // --------------------------------------------------------------------
    if (routePolyline.length > 0) {
      L.polyline(routePolyline, {
        color: "#3b82f6",
        weight: 4,
        opacity: 0.8,
        dashArray: "10,10",
        lineCap: "round",
      }).addTo(layers);

      L.circleMarker(routePolyline[0], {
        radius: 5,
        color: "#3b82f6",
        fillColor: "#fff",
        fillOpacity: 1,
      }).addTo(layers);

      L.circleMarker(routePolyline[routePolyline.length - 1], {
        radius: 5,
        color: "#3b82f6",
        fillColor: "#fff",
        fillOpacity: 1,
      }).addTo(layers);
    }

    // --------------------------------------------------------------------
    // TOURIST MARKERS
    // --------------------------------------------------------------------
    tourists.forEach((t) => {
      const markerClass = getMarkerClass(t);

      const icon = L.divIcon({
        html: `<div class="${markerClass}"></div>`,
        className: "",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      L.marker([t.lastLocation.lat, t.lastLocation.lng], { icon })
        .addTo(layers)
        .bindPopup(
          `<b>${t.name}</b><br>Status: ${t.status.toUpperCase()}<br>Battery: ${t.batteryLevel}%`
        );
    });

    // --------------------------------------------------------------------
    // INCIDENT MARKERS
    // --------------------------------------------------------------------
    incidents.forEach((inc) => {
      if (inc.status === "Resolved") return;

      const color = inc.type === "SOS" ? "#ef4444" : "#f59e0b";

      L.circleMarker([inc.location.lat, inc.location.lng], {
        radius: 7,
        color: "#fff",
        weight: 2,
        fillColor: color,
        fillOpacity: 1,
      })
        .addTo(layers)
        .bindPopup(`<b>${inc.type}</b><br>${inc.category}`);
    });

    return () => {};
  }, [
    center.lat,
    center.lng,
    zoom,
    tourists,
    incidents,
    showZones,
    routePolyline,
    interactive,
  ]);

  return (
    <div
      ref={mapRef}
      className={`w-full h-full bg-slate-900 relative ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default MapView;

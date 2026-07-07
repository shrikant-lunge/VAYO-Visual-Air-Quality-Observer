import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import L from "leaflet";
import { Camera, Loader2 } from "lucide-react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { API_BASE_URL } from "../apiConfig";
import { useLocation } from "../hooks/useLocation";

const aqiColor = (aqi) => {
  const n = Number(aqi);
  if (!Number.isFinite(n)) return "#00e5a0";
  if (n <= 50) return "#00e5a0"; // Good
  if (n <= 100) return "#f5c542"; // Moderate
  if (n <= 150) return "#ff8c42"; // Sensitive
  if (n <= 200) return "#ff4f6b"; // Unhealthy
  if (n <= 300) return "#9b59b6"; // Very Unhealthy
  return "#7b241c"; // Hazardous
};

const severityColor = (severity) => {
  if (severity === "severe") return "#ef4444";
  if (severity === "moderate") return "#f97316";
  return "#22c55e";
};

// Same pin logic used in Dashboard/MapWidget: colored circle with AQI text
const createAqiIcon = (aqi) => {
  const n = Number(aqi);
  const safeAqi = Number.isFinite(n) ? n : 0;

  const size = safeAqi > 200 ? 38 : safeAqi > 150 ? 32 : safeAqi > 100 ? 26 : 22;
  const bg = aqiColor(safeAqi);

  return L.divIcon({
    className: "", // keep inline colors
    html: `<div style="
      background: ${bg};
      color: #ffffff;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'DM Mono', monospace;
      font-size: ${size > 30 ? 11 : 9}px;
      font-weight: 600;
      box-shadow: 0 2px 6px rgba(0,0,0,0.45);
      box-sizing: border-box;
      cursor: pointer;
      transition: transform 0.2s;
    ">${safeAqi}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};


const photoIcon = (severity) =>
  L.divIcon({
    className: "",
    html: `<div style="
      width: 34px;
      height: 34px;
      border-radius: 50% 50% 50% 8px;
      background: ${severityColor(severity)};
      transform: rotate(-45deg);
      border: 2px solid #ffffff;
      box-shadow: 0 6px 16px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 17px;
        height: 12px;
        border: 2px solid #ffffff;
        border-radius: 3px;
        transform: rotate(45deg);
        position: relative;
        box-sizing: border-box;
      ">
        <span style="
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          border: 2px solid #ffffff;
          left: 4px;
          top: 2px;
          box-sizing: border-box;
        "></span>
      </div>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30],
  });

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    const timers = [setTimeout(() => map.invalidateSize(), 100), setTimeout(() => map.invalidateSize(), 500)];
    return () => timers.forEach(clearTimeout);
  }, [map]);
  return null;
};

const LegendItem = ({ color, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <span style={{ width: 12, height: 12, borderRadius: "50%", background: color, display: "inline-block" }} />
    <span>{label}</span>
  </div>
);

const HotspotMap = () => {
  const { location } = useLocation();
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const center = useMemo(() => [location.lat || 20.9343, location.lon || 77.7489], [location.lat, location.lon]);

  const fetchPoints = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL || ""}/api/map/pins`, {
        params: { city: location.city || "Amravati", lat: center[0], lon: center[1] },
      });

      setPoints(res.data.points || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load pollution points.");
    } finally {
      setLoading(false);
    }
  }, [center, location.city]);

  useEffect(() => {
    fetchPoints();
    const interval = setInterval(fetchPoints, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchPoints]);

  const renderPopup = (p, label) => (
    <div style={{ color: "#111", minWidth: 160 }}>
      {p.image_path && (
        <img
          src={`${API_BASE_URL || ""}${p.image_path}`}
          alt={`${label} report`}
          style={{ width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 6, marginBottom: 8 }}
        />
      )}
      <strong>{label}</strong>
      {p.confidence !== undefined && p.confidence !== null ? (
        <>
          <br />
          Confidence: {Math.round((p.confidence || 0) * 100)}%
        </>
      ) : null}
      {p.severity ? (
        <>
          <br />
          Severity: {p.severity}
        </>
      ) : null}
      {p.aqi !== undefined && p.aqi !== null ? (
        <>
          <br />
          AQI: {p.aqi}
        </>
      ) : null}
    </div>
  );

  return (
    <div style={{ height: "calc(100vh - 40px)", padding: 20, display: "grid", gridTemplateRows: "auto 1fr", gap: 14, minHeight: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.65rem" }}>Pollution Map</h1>
          <p className="text-muted" style={{ margin: "4px 0 0" }}>{location.city || "Amravati"} citizen reports and live AQI points</p>
        </div>
        <Link className="btn-primary" to="/dashboard/report-hotspot">
          <Camera size={18} /> Report Pollution
        </Link>
      </div>

      <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-subtle)", minHeight: 420 }}>
        {loading && (
          <div style={{ position: "absolute", top: 12, right: 12, zIndex: 1000, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
            <Loader2 size={16} /> Loading
          </div>
        )}
        {error && (
          <div style={{ position: "absolute", top: 12, left: 12, zIndex: 1000, padding: "8px 12px", borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--aqi-unhealthy)", color: "var(--aqi-unhealthy)" }}>
            {error}
          </div>
        )}

        <div style={{ position: "absolute", left: 12, bottom: 12, zIndex: 1000, width: 240, padding: 12, borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", display: "grid", gap: 8, fontSize: "0.82rem" }}>
          <strong>AQI Legend</strong>
          <LegendItem color="#00e5a0" label="Good (≤50)" />
          <LegendItem color="#f5c542" label="Moderate (≤100)" />
          <LegendItem color="#ff8c42" label="Sensitive (≤150)" />
          <LegendItem color="#ff4f6b" label="Unhealthy (≤200)" />
          <LegendItem color="#9b59b6" label="Very Unhealthy (≤300)" />
          <LegendItem color="#7b241c" label="Hazardous" />
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 8 }}>
            <div>Camera pin: citizen report</div>
            <div>Circle: AQI sensor point</div>
          </div>
        </div>


        <MapContainer center={center} zoom={12} style={{ width: "100%", height: "100%" }}>
          <MapResizer />
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; CARTO" />

          {points.map((p, index) => {
            const lat = p.lat;
            const lon = p.lon;
            const severity = p.severity;
            const label = p.label || p.name || "Hotspot";

            const aqi = p.aqi;
            const radius = (() => {
              // Prefer AQI-based sizing (same idea as MapWidget heat intensity).
              const n = Number(aqi);
              if (Number.isFinite(n)) {
                if (n > 200) return 1400;
                if (n > 150) return 1050;
                if (n > 100) return 800;
                return 650;
              }

              // Fallback to existing severity-based sizing.
              const sev = String(severity || "low").toLowerCase();
              if (sev === "hazardous" || sev === "severe") return 1400;
              if (sev === "high") return 1050;
              if (sev === "moderate") return 800;
              return 650;
            })();


            const aqiSafe = Number.isFinite(Number(aqi)) ? Number(aqi) : null;
            const displayAqi = aqiSafe ?? (severity ? 120 : null); // fallback so pins still show

            return (
              <React.Fragment key={`${p.id || index}-${lat}-${lon}`}>
                <CircleMarker
                  center={[lat, lon]}
                  radius={radius}
                  pathOptions={{
                    color: aqiColor(displayAqi),
                    fillColor: aqiColor(displayAqi),
                    fillOpacity: 0.1,
                    weight: 2,
                  }}
                />

                {p.type === "photo" ? (
                  <Marker position={[lat, lon]} icon={photoIcon(severity)}>
                    <Popup>{renderPopup(p, label)}</Popup>
                  </Marker>
                ) : (
                  <Marker position={[lat, lon]} icon={createAqiIcon(displayAqi)}>
                    <Popup>{renderPopup(p, p.name || "AQI Sensor")}</Popup>
                  </Marker>
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default HotspotMap;


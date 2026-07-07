import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Camera,
  CheckCircle2,
  Loader2,
  MapPin,
  Upload,
  Trash2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useLocation } from "../hooks/useLocation";
import "../styles/AdminDashboard.css";

const BACKEND_BASE = "http://127.0.0.1:5000";

const ReportHotspot = () => {
  const { location } = useLocation();

  const [file, setFile] = useState(null);
  const [coords, setCoords] = useState({ lat: location.lat, lon: location.lon });
  const [city, setCity] = useState(location.city || "Unknown");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");

  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [toast, setToast] = useState(null);
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    setCity(location.city || "Unknown");
    setCoords({ lat: location.lat, lon: location.lon });
  }, [location]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const fetchReports = useCallback(async () => {
    if (!city) return;
    setLoadingReports(true);
    try {
      const resp = await axios.get(
        `${BACKEND_BASE}/api/hotspot/reports?city=${encodeURIComponent(city)}`,
      );

      // Defensive: backend always returns { status, reports }
      if (resp?.data?.status === "success") {
        setReports(Array.isArray(resp.data.reports) ? resp.data.reports : []);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error("fetchReports error:", err);
      setReports([]);
      showToast("error", "Failed to fetch your hotspot reports");
    } finally {
      setLoadingReports(false);
    }
  }, [city]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file || !coords.lat || !coords.lon) return;

    setLoading(true);
    setError("");
    setResult(null);

    const form = new FormData();
    form.append("image", file);
    form.append("lat", coords.lat);
    form.append("lon", coords.lon);
    form.append("city", city || "Unknown");
    if (description && description.trim()) {
      form.append("description", description.trim());
    }

    try {
      const res = await axios.post(`${BACKEND_BASE}/api/hotspot/report`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
        validateStatus: () => true,
      });

      if (res.status >= 200 && res.status < 300) {
        setResult(res.data);
        setFile(null);
        setDescription("");
        showToast("success", "Report submitted");
        fetchReports();
      } else {
        const msg =
          res.data?.message || res.data?.error || `Request failed (${res.status})`;
        setError(msg);
        showToast("error", msg);
      }
    } catch (err) {
      console.error("submit hotspot error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Could not submit hotspot report.";
      setError(msg);
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  // Delete UI => mark as resolved (so it disappears from active list)
  const handleDelete = async (reportId) => {
    setActionLoadingId(reportId);
    try {
      const resp = await axios.patch(
        `${BACKEND_BASE}/api/hotspot/report/${reportId}/status`,
        { status: "resolved" },
        {
          validateStatus: () => true,
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );


      if (resp.status < 200 || resp.status >= 300) {
        const msg = resp.data?.message || resp.data?.error || `Delete failed (${resp.status})`;
        throw new Error(msg);
      }

      // Soft-delete behavior: backend filters resolved out.
      // Refresh list to avoid UI getting stuck.
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      showToast("success", "Report deleted");
      fetchReports();
    } catch (err) {
      console.error("delete hotspot report error:", err);
      showToast("error", err?.message || "Failed to delete report");
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderReportCard = (r) => {
    const label = r.image_label || r.label || "unknown";
    const confidence = r.confidence ?? null;
    const reportedAt = r.reported_at || r.timestamp || r.created_at || null;
    const status = r.status || "pending";

    const lat = r.lat ?? r.latitude;
    const lon = r.lon ?? r.longitude;

    const imgSrcRaw = r.image_path || r.imagePath || r.image || null;
    const imgSrc = imgSrcRaw
      ? String(imgSrcRaw).startsWith("/")
        ? `${BACKEND_BASE}${imgSrcRaw}`
        : String(imgSrcRaw)
      : null;

    return (
      <div
        key={r.id}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {imgSrc ? (
          <div
            style={{
              height: "180px",
              background: "rgba(255,255,255,0.02)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <img
              src={imgSrc}
              alt={`Hotspot report ${r.id}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        ) : null}

        <div style={{ padding: "16px", display: "grid", gap: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "14px",
                  fontWeight: 900,
                  color: "var(--text-primary)",
                }}
              >
                🛰️ Hotspot Report #{r.id}
              </div>

              <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                <span style={{ fontWeight: 700 }}>Label:</span> {String(label).toUpperCase()}
              </div>

              {confidence !== null && confidence !== undefined ? (
                <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                  <span style={{ fontWeight: 700 }}>Confidence:</span> {Math.round(Number(confidence) * 100)}%
                </div>
              ) : null}
            </div>

            <span
              className={`status-badge ${status === "resolved" ? "active" : "unresolved"}`}
              style={{
                background:
                  status === "resolved" ? "rgba(0,229,160,0.12)" : "rgba(245,158,11,0.12)",
                color: status === "resolved" ? "var(--accent)" : "#f59e0b",
                border: `1px solid ${
                  status === "resolved" ? "rgba(0,229,160,0.18)" : "rgba(245,158,11,0.25)"
                }`,
              }}
            >
              <span
                className="status-dot"
                style={{ background: status === "resolved" ? "var(--accent)" : "#f59e0b" }}
              />
              {status === "resolved" ? "Resolved" : "Active"}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
              <span style={{ fontWeight: 700 }}>City:</span> {r.city || city || "Unknown"}
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
              <span style={{ fontWeight: 700 }}>Location:</span>{" "}
              {lat !== undefined && lon !== undefined
                ? `${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)}`
                : `${r.latitude ?? "—"}, ${r.longitude ?? "—"}`}
            </div>
          </div>

          {typeof r.description === "string" && r.description.trim() ? (
            <p
              style={{
                margin: 0,
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
                lineHeight: 1.5,
              }}
              title={r.description}
            >
              <span style={{ fontWeight: 700 }}>Description:</span> {r.description}
            </p>
          ) : null}


          {reportedAt ? (
            <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>
              <span style={{ fontWeight: 700 }}>Reported:</span> {new Date(reportedAt).toLocaleString()}
            </div>
          ) : null}


          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
              paddingTop: "6px",
              borderTop: "1px solid var(--border)",
            }}
          >
            <button
              className="action-btn delete"
              onClick={() => handleDelete(r.id)}
              disabled={actionLoadingId === r.id}
              title="Delete report"
              style={{ fontSize: "10px", padding: "7px 12px" }}
            >
              {actionLoadingId === r.id ? <Loader2 size={12} /> : <Trash2 size={12} />}
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-page" style={{ paddingTop: 20 }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div className="admin-header" style={{ marginBottom: 16 }}>
          <div className="admin-header-left">
            <div className="admin-header-icon">📷</div>
            <div>
              <div className="admin-header-title">Report Hotspot</div>
              <div className="admin-header-meta">Upload photo + show your active reports</div>
            </div>
          </div>

          <div className="admin-header-actions">
            <button
              className="admin-logout-btn"
              onClick={fetchReports}
              title="Refresh reports"
              style={{ gap: "6px" }}
            >
              <RefreshCw size={13} />
              Refresh
            </button>
          </div>
        </div>


        <div
          className="card"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 18,
            marginBottom: 18,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Upload a new hotspot photo</h2>
            <p className="text-muted" style={{ marginTop: 6, marginBottom: 0 }}>
              Photo + GPS coordinates. The list below shows what you submitted.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
            <label style={{ display: "grid", gap: "8px" }}>
              <span style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                <Camera size={18} /> Photo
              </span>
              <input
                className="input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                required
              />
            </label>

            <label style={{ display: "grid", gap: "8px" }}>
              <span style={{ fontWeight: 700 }}>Description</span>
              <textarea
                className="input"
                rows={3}
                placeholder="Optional notes"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
              }}
            >
              <label style={{ display: "grid", gap: "8px" }}>
                <span style={{ fontWeight: 700 }}>City</span>
                <input
                  className="input"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                />
              </label>

              <label style={{ display: "grid", gap: "8px" }}>
                <span style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPin size={18} /> Latitude
                </span>
                <input
                  className="input"
                  type="number"
                  step="any"
                  value={coords.lat || ""}
                  onChange={(event) => setCoords({ ...coords, lat: event.target.value })}
                  required
                />
              </label>

              <label style={{ display: "grid", gap: "8px" }}>
                <span style={{ fontWeight: 700 }}>Longitude</span>
                <input
                  className="input"
                  type="number"
                  step="any"
                  value={coords.lon || ""}
                  onChange={(event) => setCoords({ ...coords, lon: event.target.value })}
                  required
                />
              </label>
            </div>

            <button className="btn-primary" type="submit" disabled={loading || !file}>
              {loading ? <Loader2 size={18} className="spin" /> : <Upload size={18} />}
              {loading ? "Submitting..." : "Submit Report"}
            </button>

            {error ? <div style={{ color: "var(--aqi-unhealthy)" }}>{error}</div> : null}

            {result ? (
              <div
                style={{
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  display: "grid",
                  gap: "6px",
                  background: "rgba(0,229,160,0.04)",
                }}
              >
                <strong style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircle2 size={18} color="var(--accent)" /> Report #{result.report_id}
                </strong>
                <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                  <span style={{ fontWeight: 700 }}>Classification:</span> {result.image_label}
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                  <span style={{ fontWeight: 700 }}>Confidence:</span> {Math.round((result.confidence || 0) * 100)}%
                </div>
              </div>
            ) : null}
          </form>
        </div>

        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 16,
                  fontWeight: 900,
                  color: "var(--text-primary)",
                }}
              >
                🧾 Your Hotspot Reports
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
                Showing active reports for <span style={{ fontFamily: "var(--font-mono)" }}>{city}</span>
              </div>

            </div>

            <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
              {loadingReports ? "Loading…" : `${reports.length} report(s)`}
            </div>
          </div>

          {loadingReports ? (
            <div className="admin-table-empty" style={{ padding: 40 }}>
              <div className="admin-spinner" />
              <p>Loading reports…</p>
            </div>
          ) : reports.length === 0 ? (
            <div
              style={{
                padding: 28,
                borderRadius: 12,
                border: "1px dashed var(--border)",
                background: "var(--bg-surface)",
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                No active hotspot reports found.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 14,
              }}
            >
              {reports.map(renderReportCard)}
            </div>
          )}
        </div>
      </div>

      {toast ? (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      ) : null}
    </div>
  );
};

export default ReportHotspot;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from '../hooks/useLocation';

import jsPDF from 'jspdf';
import { API_BASE_URL } from '../apiConfig';


const Community = () => {
  const { location } = useLocation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: 'fire', description: '' });

  // Mocking reports for frontend since no /api/community endpoint was explicitly specified in backend requirements beyond "Store in SQLite", 
  // but we can save it to localStorage for the React-only portion to mimic it.
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`reports_${location.city}`) || '[]');
    // Filter expired (older than 4 hours)
    const valid = saved.filter(r => (Date.now() - r.timestamp) < 4 * 60 * 60 * 1000);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReports(valid);
    localStorage.setItem(`reports_${location.city}`, JSON.stringify(valid));
  }, [location.city]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/community/report`, {

        type: form.type,
        description: form.description,
        city: location.city,
        lat: location.lat,
        lon: location.lon
      });
      
      const newReport = {
        id: Date.now(),
        type: form.type,
        description: form.description,
        timestamp: Date.now(),
        lat: location.lat,
        lon: location.lon,
        notified: true
      };
      
      const updated = [newReport, ...reports];
      setReports(updated);
      localStorage.setItem(`reports_${location.city}`, JSON.stringify(updated));
      setForm({ type: 'fire', description: '' });
      alert("Report submitted! Authorities have been notified via email.");
    } catch (err) {
      console.error("Reporting error", err);
      alert("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getEmoji = (type) => {
    switch(type) {
      case 'fire': return '🔥';
      case 'dust': return '💨';
      case 'smoke': return '🏭';
      case 'smell': return '🤢';
      default: return '⚠️';
    }
  };

  const downloadReportPDF = (report) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(0, 180, 216);
    doc.text('EcoStride - Community Report', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
    
    doc.setDrawColor(0, 180, 216);
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Report Type: ${report.type.toUpperCase()}`, 20, 50);
    doc.text(`City: ${location.city}`, 20, 60);
    doc.text(`Location: ${report.lat.toFixed(4)}, ${report.lon.toFixed(4)}`, 20, 70);
    doc.text(`Time: ${new Date(report.timestamp).toLocaleString()}`, 20, 80);
    
    doc.setFontSize(12);
    doc.text('Description:', 20, 95);
    const splitDescription = doc.splitTextToSize(report.description || 'No description provided.', 150);
    doc.text(splitDescription, 20, 105);
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('ECOSTRIDE: Environmental Health & Safe Routing Platform', 20, 280);
    
    doc.save(`EcoStride_Report_${report.id}.pdf`);
  };

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-8 card">
        <h2>Community Reports in {location.city}</h2>
        <p className="text-muted" style={{marginBottom: '24px'}}>Live pollution reports from the community. Auto-expires after 4 hours.</p>

        <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
          {reports.length === 0 && <span className="text-muted">No recent reports in your area. You're breathing clean!</span>}
          {reports.map((r) => (
            <div key={r.id} style={{padding:'16px', background:'var(--bg-tertiary)', border:'1px solid var(--border-subtle)', borderRadius:'12px'}}>
              <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'8px'}}>
                <span style={{fontSize:'1.5rem'}}>{getEmoji(r.type)}</span>
                <strong style={{textTransform:'capitalize'}}>{r.type} Detected</strong>
                <span style={{fontSize:'0.8rem', color:'var(--text-secondary)', marginLeft:'auto'}}>
                  {new Date(r.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p style={{fontSize:'0.9rem', color:'var(--text-secondary)'}}>{r.description}</p>
              <div style={{marginTop: '12px', display: 'flex', justifyContent: 'flex-end'}}>
                <button 
                  onClick={() => downloadReportPDF(r)} 
                  className="btn-secondary" 
                  style={{padding: '4px 8px', fontSize: '0.75rem'}}
                >
                  📥 Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-4 card">
        <h3 style={{marginBottom:'16px'}}>Report an Issue</h3>
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'16px'}}>
          <div>
            <label style={{display:'block', marginBottom:'8px', fontSize:'0.9rem', color:'var(--text-secondary)'}}>Issue Type</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="fire">Fire / Burning (🔥)</option>
              <option value="dust">Heavy Dust (💨)</option>
              <option value="smoke">Industrial Smoke (🏭)</option>
              <option value="smell">Unusual Smell (🤢)</option>
            </select>
          </div>
          <div>
            <label style={{display:'block', marginBottom:'8px', fontSize:'0.9rem', color:'var(--text-secondary)'}}>Description (optional)</label>
            <textarea 
              rows="3" 
              placeholder="E.g., Huge tire fire near the highway..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            ></textarea>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Community;

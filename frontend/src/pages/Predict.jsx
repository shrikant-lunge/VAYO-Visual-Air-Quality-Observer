import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from '../hooks/useLocation';

import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { API_BASE_URL } from '../apiConfig';


const Predict = () => {
  const { location } = useLocation();
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setLoading(true);
        const res = await axios.post(`${API_BASE_URL}/api/forecast/predict`, {
          lat: location.lat,
          lon: location.lon,
          city: location.city
        });
        setForecast(res.data.data.predictions || []);
      } catch (err) {
        console.error("Forecast fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    if (!location.loading) fetchForecast();
  }, [location]);

  if (location.loading || loading) return <div className="card skeleton" style={{height: 400}}>Loading 72h Forecast...</div>;

  const chartData = {
    labels: forecast.map(f => f.timestamp),
    datasets: [{
      label: '72-Hour AQI Forecast',
      data: forecast.map(f => f.aqi),
      borderColor: 'rgba(139, 92, 246, 1)',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      fill: true,
      tension: 0.3
    }]
  };

  const aqiColor = (aqi) => {
    if (aqi <= 50) return "var(--aqi-good)";
    if (aqi <= 100) return "var(--aqi-moderate)";
    if (aqi <= 150) return "var(--aqi-unhealthy-sg)";
    if (aqi <= 200) return "var(--aqi-unhealthy)";
    return "var(--aqi-very-unhealthy)";
  };

  // Download PDF via backend — works in all browser windows
  const downloadForecastPDF = async () => {
    try {
      setPdfLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/pdf/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: location.city, predictions: forecast })
      });
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EcoStride_Forecast_${location.city}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  // Summary cards: every 6th prediction (12 cards for 72h)
  const summaryCards = forecast.filter((_, i) => i % 6 === 0);

  return (
    <div style={{display:'flex', flexDirection:'column', gap:'24px', overflowY:'auto', maxHeight:'calc(100vh - 90px)', paddingBottom:'24px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'10px'}}>
        <div>
          <h1>AQI Forecast Model (72h)</h1>
          <p className="text-muted">Predictive air quality trends for {location.city}.</p>
        </div>
        <button
          onClick={downloadForecastPDF}
          className="btn-primary"
          style={{height:'fit-content'}}
          disabled={pdfLoading}
        >
          {pdfLoading ? '⏳ Generating...' : '📥 Download PDF Report'}
        </button>
      </div>

      <div className="card" style={{height: '400px'}}>
        <Line data={chartData} options={{ maintainAspectRatio: false }} />
      </div>

      {/* Summary cards in a flex-wrap grid so they scroll properly */}
      <div style={{display:'flex', flexWrap:'wrap', gap:'12px'}}>
        {summaryCards.map((f, i) => (
          <div key={i} className="card" style={{textAlign:'center', flex:'1 1 140px', minWidth:'120px'}}>
            <div style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>{f.timestamp}</div>
            <div style={{fontSize:'1.5rem', fontWeight:'bold', color: aqiColor(f.aqi), margin:'8px 0'}}>{f.aqi}</div>
            <div style={{fontSize:'0.7rem'}}>{f.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Predict;

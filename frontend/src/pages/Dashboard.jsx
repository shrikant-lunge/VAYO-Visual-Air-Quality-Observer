import React, { useEffect, useState } from 'react';
import MapWidget from '../components/MapWidget';
import { useLocation } from '../hooks/useLocation';

import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_BASE_URL } from '../apiConfig';


const Dashboard = () => {
  const { location } = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heatmapMode, setHeatmapMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/forecast/current?lat=${location.lat}&lon=${location.lon}&city=${location.city}`);

        setData(res.data.data);
      } catch(err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (!location.loading) fetchData();
  }, [location]);

  if (location.loading) return <div className="card">Acquiring GPS Signal...</div>;
  if (loading) return <div className="card skeleton" style={{height: 400}}></div>;

  const aqi = data?.aqi || 0;
  const healthCat = data?.category || 'Unknown';
  
  // mock trend data
  const chartData = {
    labels: ['1AM', '5AM', '9AM', '1PM', '5PM', '9PM', 'NOW'],
    datasets: [{
      label: 'AQI Trend 24h',
      data: [aqi-20, aqi-10, aqi+15, aqi+5, aqi+30, aqi-5, aqi],
      borderColor: 'rgba(0,212,255,1)',
      backgroundColor: 'rgba(0,212,255,0.2)',
      fill: true,
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  const downloadStatusPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(0, 212, 255);
      doc.text(`EcoStride - Status Report: ${location.city}`, 20, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

      doc.setDrawColor(0, 212, 255);
      doc.line(20, 35, 190, 35);

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(`Current AQI: ${data.aqi}`, 20, 50);
      doc.text(`Category: ${data.category}`, 20, 60);
      doc.text(`Station: ${data.source || 'Local Sensor'}`, 20, 70);

      doc.setFontSize(14);
      doc.text('Pollutant Breakdown:', 20, 85);

      // jspdf-autotable v5: standalone function, not doc.autoTable()
      autoTable(doc, {
        head: [["Pollutant", "Value", "Unit"]],
        body: [
          ["PM2.5", data.pm2_5 ?? 'N/A', "µg/m³"],
          ["PM10",  data.pm10  ?? 'N/A', "µg/m³"],
          ["NO2",   data.no2   ?? 'N/A', "µg/m³"],
          ["O3",    data.o3    ?? 'N/A', "µg/m³"],
          ["SO2",   data.so2   ?? 'N/A', "µg/m³"],
          ["CO",    data.co    ?? 'N/A', "mg/m³"],
        ],
        startY: 90,
        theme: 'grid',
        headStyles: { fillColor: [0, 212, 255] }
      });

      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('ECOSTRIDE: Environmental Health & Safe Routing Platform', 20, doc.internal.pageSize.height - 10);

      doc.save(`EcoStride_Status_${location.city}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Could not generate PDF: ' + err.message);
    }
  };

  return (
    <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h1 style={{fontSize:'1.8rem'}}>{location.city} Dashboard</h1>
          <p className="text-muted">Last updated: Just now | Source: {data?.source || 'Local Sensor'}</p>
        </div>
        <button onClick={downloadStatusPDF} className="btn-primary" style={{height:'fit-content'}}>
          📥 Download Status PDF
        </button>
      </div>

      <div className="grid grid-cols-12">
        
        {/* Hero */}
        <div className="card col-span-4 aqi-hero" style={{display:'flex', flexDirection:'column', justifyContent:'center'}}>
          <h3 className="text-muted" style={{fontWeight:'bold', letterSpacing:'2px', marginBottom:'16px'}}>REAL-TIME AQI</h3>
          <div className="aqi-number" style={{color: aqi > 150 ? 'var(--aqi-unhealthy)' : 'var(--accent-cyan)'}}>
            {aqi}
          </div>
          <div style={{marginTop:'12px', fontSize:'1.2rem', fontWeight:'600'}}>{healthCat}</div>
        </div>

        {/* 24h Trend Chart */}
        <div className="card col-span-8">
          <h3 style={{marginBottom:'16px'}}>24h Air Quality Trend</h3>
          <div style={{height: '200px'}}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Main Map */}
      <div style={{position:'relative'}}>
         <div style={{position:'absolute', top: 16, left: 16, zIndex: 500}}>
           <button 
             className={heatmapMode ? "btn-primary" : "btn-secondary"} 
             onClick={() => setHeatmapMode(!heatmapMode)}
             style={{padding: '8px 16px', fontSize:'0.8rem'}}
           >
             {heatmapMode ? "Heatmap View" : "Pin View"}
           </button>
         </div>
         <MapWidget lat={location.lat} lon={location.lon} city={location.city} showHeatmap={heatmapMode} />
      </div>

      {/* Pollutant breakdown */}
      <div className="grid grid-cols-12" style={{marginTop:'12px'}}>
        {['pm2_5', 'pm10', 'no2', 'o3'].map(p => (
          <div key={p} className="stat-card col-span-3">
             <div className="stat-label">{p.replace('_','.')}</div>
             <div className="stat-value">{data?.[p] || 0}</div>
             <div style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}>µg/m³</div>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default Dashboard;

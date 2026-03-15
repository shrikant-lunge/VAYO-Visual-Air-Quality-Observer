import React, { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { API_BASE_URL } from '../apiConfig';


const Compare = () => {
  const [city1, setCity1] = useState('Delhi');
  const [city2, setCity2] = useState('Mumbai');
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleCompare = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Fetch current AQI — backend now geocodes city if no coords provided
      const [res1, res2] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/forecast/current?city=${encodeURIComponent(city1)}`),
        axios.get(`${API_BASE_URL}/api/forecast/current?city=${encodeURIComponent(city2)}`)
      ]);

      const d1 = res1.data.data;
      const d2 = res2.data.data;

      // Fetch 72h forecast using the geocoded coords returned by backend
      const [hist1, hist2] = await Promise.all([
        axios.post(`${API_BASE_URL}/api/forecast/predict`, { city: city1, lat: d1.lat, lon: d1.lon }),
        axios.post(`${API_BASE_URL}/api/forecast/predict`, { city: city2, lat: d2.lat, lon: d2.lon })
      ]);

      d1.history = hist1.data.data.predictions.slice(0, 7).map(p => p.aqi);
      d2.history = hist2.data.data.predictions.slice(0, 7).map(p => p.aqi);

      setData1(d1);
      setData2(d2);
    } catch(err) {
      console.error(err);
      alert('Failed to fetch city data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Today'],
    datasets: [
      {
        label: city1,
        data: data1 ? [...data1.history].reverse() : [],
        borderColor: 'rgba(0, 212, 255, 1)',
        backgroundColor: 'transparent',
        tension: 0.4
      },
      {
        label: city2,
        data: data2 ? [...data2.history].reverse() : [],
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'transparent',
        tension: 0.4
      }
    ]
  };

  const aqiColor = (aqi) => {
    if (aqi <= 50) return "var(--aqi-good)";
    if (aqi <= 100) return "var(--aqi-moderate)";
    if (aqi <= 150) return "var(--aqi-unhealthy-sg)";
    if (aqi <= 200) return "var(--aqi-unhealthy)";
    return "var(--aqi-very-unhealthy)";
  };

  // Download comparison PDF via backend
  const downloadComparePDF = async () => {
    if (!data1 || !data2) return;
    try {
      setPdfLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/pdf/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city1, city2, data1, data2 })
      });
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EcoStride_Compare_${city1}_vs_${city2}.pdf`;
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

  return (
    <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'10px'}}>
        <div>
          <h1>Compare Cities</h1>
          <p className="text-muted">Compare real-time air quality metrics between any two cities.</p>
        </div>
        {data1 && data2 && (
          <button
            onClick={downloadComparePDF}
            className="btn-primary"
            style={{height:'fit-content'}}
            disabled={pdfLoading}
          >
            {pdfLoading ? '⏳ Generating...' : '📥 Download PDF Report'}
          </button>
        )}
      </div>

      <div className="card">
        <form onSubmit={handleCompare} style={{display:'flex', gap:'16px', alignItems:'flex-end'}}>
          <div style={{flex:1}}>
            <label className="text-muted">City 1</label>
            <input value={city1} onChange={e => setCity1(e.target.value)} required />
          </div>
          <div style={{flex:1}}>
            <label className="text-muted">City 2</label>
            <input value={city2} onChange={e => setCity2(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{height:'46px', width:'120px'}}>
            {loading ? 'Loading...' : 'Compare'}
          </button>
        </form>
      </div>

      {data1 && data2 && (
        <div className="grid grid-cols-12">
          {/* City 1 Stats */}
          <div className="card col-span-4" style={{borderTop: '4px solid rgba(0, 212, 255, 1)'}}>
            <h2 style={{color:'var(--accent-cyan)'}}>{city1}</h2>
            <div style={{fontSize:'3rem', fontWeight:'bold', color: aqiColor(data1.aqi)}}>{data1.aqi}</div>
            <div style={{marginBottom:'16px'}}>{data1.category}</div>
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}><span>PM2.5</span><span>{data1.pm2_5}</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span>PM10</span><span>{data1.pm10}</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span>NO2</span><span>{data1.no2}</span></div>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="card col-span-4">
            <h3 style={{marginBottom:'16px', textAlign:'center'}}>7-Day Trend</h3>
            <div style={{height: 200}}>
              <Line data={chartData} options={{maintainAspectRatio: false, plugins: { legend: { position: 'bottom' }}}} />
            </div>
          </div>

          {/* City 2 Stats */}
          <div className="card col-span-4" style={{borderTop: '4px solid rgba(139, 92, 246, 1)'}}>
            <h2 style={{color:'var(--accent-purple)'}}>{city2}</h2>
            <div style={{fontSize:'3rem', fontWeight:'bold', color: aqiColor(data2.aqi)}}>{data2.aqi}</div>
            <div style={{marginBottom:'16px'}}>{data2.category}</div>
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}><span>PM2.5</span><span>{data2.pm2_5}</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span>PM10</span><span>{data2.pm10}</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span>NO2</span><span>{data2.no2}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Compare;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from '../hooks/useLocation';
import MapWidget from '../components/MapWidget';

import { Line } from 'react-chartjs-2';
import { API_BASE_URL } from '../apiConfig';


const SafeZones = () => {
  const { location } = useLocation();
  const [pins, setPins] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSafeData = async () => {
      setLoading(true);
      try {
        const [pinsRes, forecastRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/map/pins?lat=${location.lat}&lon=${location.lon}&city=${location.city}`),
          axios.post(`${API_BASE_URL}/api/forecast/predict`, {
            lat: location.lat, lon: location.lon, city: location.city
          })
        ]);

        
        let fetchedPins = pinsRes.data.pins || [];
        fetchedPins.sort((a, b) => a.aqi - b.aqi);
        setPins(fetchedPins);
        
        setForecast(forecastRes.data.data.predictions.slice(0, 24) || []);
      } catch (e) {
        console.error("Safe zones fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    if (!location.loading) fetchSafeData();
  }, [location]);

  if (location.loading || loading) return <div className="card skeleton" style={{height: 400}}>Loading Safe Zones...</div>;

  const bestZones = pins.slice(0, 5);
  const worstZones = [...pins].sort((a, b) => b.aqi - a.aqi).slice(0, 5);

  const chartData = {
    labels: forecast.map(f => f.timestamp.split(' ')[2]), // just time
    datasets: [{
      label: 'Predicted AQI (Next 24h)',
      data: forecast.map(f => f.aqi),
      borderColor: 'rgba(0, 212, 255, 1)',
      backgroundColor: 'rgba(0, 212, 255, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' } }, y: { grid: { color: 'rgba(255,255,255,0.05)' } } }
  };

  return (
    <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
      <div>
        <h1>Safe Zones in {location.city}</h1>
        <p className="text-muted">Find the best places for outdoor activities today.</p>
      </div>

      <div className="grid grid-cols-12">
        <div className="card col-span-12" style={{height: '400px', padding: 0}}>
           <MapWidget 
             lat={location.lat} 
             lon={location.lon} 
             city={location.city} 
             showHeatmap={false}
           />
        </div>

        <div className="card col-span-6">
          <h3 style={{color: 'var(--aqi-good)', marginBottom: '16px'}}>🌿 Best Places to be Today</h3>
          {bestZones.length > 0 ? bestZones.map((z, i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'12px', borderBottom:'1px solid var(--border-subtle)'}}>
              <div><strong>{z.name}</strong><br/><small className="text-muted">{z.category}</small></div>
              <div style={{background: 'var(--bg-glass)', padding:'8px 12px', borderRadius:'8px', fontWeight:'bold'}}>AQI {z.aqi}</div>
            </div>
          )) : <div className="text-muted">No data available.</div>}
        </div>

        <div className="card col-span-6">
          <h3 style={{color: 'var(--aqi-unhealthy)', marginBottom: '16px'}}>⚠️ Avoid These Areas</h3>
          {worstZones.length > 0 ? worstZones.map((z, i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'12px', borderBottom:'1px solid var(--border-subtle)'}}>
              <div><strong>{z.name}</strong><br/><small className="text-muted">{z.category}</small></div>
              <div style={{background: 'rgba(255,0,0,0.1)', color:'#ff6b6b', padding:'8px 12px', borderRadius:'8px', fontWeight:'bold'}}>AQI {z.aqi}</div>
            </div>
          )) : <div className="text-muted">No data available.</div>}
        </div>
        
        <div className="card col-span-12">
          <h3 style={{marginBottom: '16px'}}>Best Time to go Outside (Next 24h)</h3>
          <div style={{height: 250}}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default SafeZones;

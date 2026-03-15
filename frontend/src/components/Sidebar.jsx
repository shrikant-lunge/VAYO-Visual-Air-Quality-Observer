import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocation } from '../hooks/useLocation';

import { MapPin, LayoutDashboard, CloudRain, Route, ShieldAlert, Heart, Search, DivideSquare, Users } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';


const Sidebar = () => {
  const { location, setManualLocation, getGPS } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Alert Widget State
  const [alertForm, setAlertForm] = useState({ contact: '', threshold: 100 });
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Basic autocomplete using nominatim for Indian cities
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${query}, India&format=json&limit=5`);
        setSearchResults(res.data);
      } catch(err) {
        console.error(err);
      }
    } else {
      setSearchResults([]);
    }
  };

  const selectCity = (city) => {
    const lat = parseFloat(city.lat);
    const lon = parseFloat(city.lon);
    let name = city.display_name.split(',')[0];
    setManualLocation(name, 'India', lat, lon);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!alertForm.contact) return;
    setAlertLoading(true);
    setAlertMessage('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/alerts/subscribe`, {

        contact: alertForm.contact,
        threshold: alertForm.threshold,
        city: location.city,
        lat: location.lat,
        lon: location.lon
      });
      setAlertMessage(res.data.message || 'Subscribed!');
      setAlertForm({ contact: '', threshold: 100 });
    } catch {
      setAlertMessage('Error subscribing.');
    } finally {
      setAlertLoading(false);
    }
  };

  return (
    <aside className="sidebar">
      <div className="logo">🌿 EcoStride</div>
      
      <div className="location-badge">
        <MapPin size={16} className={location.loading ? "animate-pulse" : ""} />
        <div>
          <div style={{fontWeight: 'bold'}}>{location.city}</div>
          <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>{location.state || "India"}</div>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginBottom: '16px', position: 'relative' }}>
        <div style={{position: 'relative'}}>
          <Search size={14} style={{position: 'absolute', top: 12, left: 10, color: 'var(--text-secondary)'}}/>
          <input 
            type="text" 
            placeholder="Search City..." 
            value={searchQuery}
            onChange={handleSearch}
            style={{ paddingLeft: '32px', fontSize: '0.85rem', width: '100%' }}
          />
          <button 
            type="button"
            onClick={getGPS}
            title="Reset to My Location"
            style={{
              position: 'absolute', right: 8, top: 4, background: 'none', border: 'none', 
              cursor: 'pointer', color: 'var(--accent-cyan)', fontSize: '1.1rem'
            }}
          >
            📍
          </button>
        </div>
        
        {searchResults.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 16, right: 16, 
            background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)',
            borderRadius: '8px', zIndex: 50, marginTop: '4px', overflow: 'hidden'
          }}>
            {searchResults.map(res => (
              <div 
                key={res.place_id} 
                onClick={() => selectCity(res)}
                style={{ padding: '8px 12px', fontSize: '0.8rem', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)' }}
              >
                {res.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      <nav style={{ flex: 1 }}>
        <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/forecast" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <CloudRain size={18} /> AQI Forecast
        </NavLink>
        <NavLink to="/routing" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Route size={18} /> Safe Routing
        </NavLink>
        <NavLink to="/policy" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <ShieldAlert size={18} /> Policy Analysis
        </NavLink>
        <NavLink to="/safe-zones" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Heart size={18} /> Safe Zones
        </NavLink>
        <NavLink to="/compare" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <DivideSquare size={18} /> Compare Cities
        </NavLink>
        <NavLink to="/community" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Users size={18} /> Community Reports
        </NavLink>
      </nav>
      
      {/* Alert Subscription Widget */}
      <form onSubmit={handleSubscribe} style={{ margin: '16px', padding: '16px', background: 'var(--bg-glass)', borderRadius: '12px', fontSize: '0.8rem' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--accent-cyan)' }}>🔔 Alerts for {location.city}</div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Get notified when AQI exceeds threshold.</p>
        
        <input 
          type="text" 
          placeholder="Email or Phone No." 
          value={alertForm.contact}
          onChange={e => setAlertForm({...alertForm, contact: e.target.value})}
          style={{ marginBottom: '8px', padding: '8px', fontSize: '0.8rem' }}
          required
        />
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems:'center'}}>
          <span style={{color:'var(--text-secondary)'}}>AQI &gt;</span>
          <select 
            value={alertForm.threshold}
            onChange={e => setAlertForm({...alertForm, threshold: parseInt(e.target.value)})}
            style={{ padding: '8px', fontSize: '0.8rem', flex: 1 }}
          >
            <option value="50">50 (Moderate)</option>
            <option value="100">100 (Unhealthy)</option>
            <option value="150">150 (Very Poor)</option>
          </select>
        </div>
        
        <button type="submit" className="btn-secondary" style={{ width: '100%', padding: '8px' }} disabled={alertLoading}>
          {alertLoading ? 'Wait...' : 'Subscribe'}
        </button>
        {alertMessage && <div style={{marginTop:'8px', color:'var(--accent-cyan)', fontSize:'0.75rem', textAlign:'center'}}>{alertMessage}</div>}
      </form>
    </aside>
  );
};

export default Sidebar;

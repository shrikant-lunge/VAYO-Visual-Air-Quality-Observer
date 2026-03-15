import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import Routing from './pages/Routing';
import Policy from './pages/Policy';
import SafeZones from './pages/SafeZones';
import Compare from './pages/Compare';
import Community from './pages/Community';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="forecast" element={<Predict />} />
          <Route path="routing" element={<Routing />} />
          <Route path="policy" element={<Policy />} />
          <Route path="safe-zones" element={<SafeZones />} />
          <Route path="compare" element={<Compare />} />
          <Route path="community" element={<Community />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

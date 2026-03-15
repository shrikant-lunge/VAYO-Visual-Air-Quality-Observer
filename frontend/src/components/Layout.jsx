import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { LocationProvider } from '../context/LocationContext';

const Layout = () => {
  return (
    <LocationProvider>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </LocationProvider>
  );
};

export default Layout;

# 🌿 EcoStride
**A Full-Stack Platform for Real-Time Air Quality Monitoring & Clean Route Navigation**

![React](https://img.shields.io/badge/Frontend-React.js-blue?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=flat-square&logo=vite)
![Flask](https://img.shields.io/badge/Backend-Flask-lightgrey?style=flat-square&logo=flask)
![SQLite](https://img.shields.io/badge/Database-SQLite-blue?style=flat-square&logo=sqlite)

> **EcoStride** is a smart environmental platform designed to track real-time urban air pollution, analyze health impacts, and actively route users through the cleanest possible paths using live AQI mapping. 

Built for hackathons and public safety, the system integrates global geocoding, real-time pollution data feeds, interactive maps, and community crowd-sourced reporting.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🗺️ **Safe Routing Algorithm** | Calculates 5 distinct alternative routes (Cleanest, Safest, Balanced, Fastest, Industrial) dynamically weighted by the exact air pollution (AQI) exposure along every street. |
| 📊 **Real-Time Dashboards** | Live air quality metrics for any city globally, breaking down specific pollutants (PM2.5, PM10, NO2, O3). |
| 🔮 **72h Predictive Forecasting** | Forward-looking AQI predictions allowing users to plan outdoor activities. |
| 🔔 **SMS & Email Alert Service** | Automated subscription service that notifies users when local AQI breaches their personalized safety threshold. |
| 💊 **Health Advisory Engine** | AI-driven insights that translate raw pollution data into actionable health advice (powered by Groq / Llama). |
| 🏛️ **Government Data Integration** | Prioritizes official Government of India (data.gov.in) datasets for maximum accuracy in Indian territories. |

---

## 🛠️ Technology Stack

**Frontend Architecture (React + Vite)**
- **React.js (v18)** with Context API for global state management.
- **Vite** for ultra-fast HMR and building.
- **Leaflet & React-Leaflet** for interactive heatmap visualizations.
- **Chart.js** for data trending and analytics displays.

**Backend Architecture (Python + Flask)**
- **Flask Framework** serving a headless REST API.
- **SQLite3** for lightweight persistence (Community reports & Alert subscriptions).
- **OSRM (Open Source Routing Machine)** for generating complex street-level geometric routes.
- **python-dotenv** for secure environment credential management.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+)
- **Python** (3.8+)

### 1. Clone the Repository
```bash
git clone https://github.com/shrikant-lunge/EcoStride.git
cd EcoStride
```

### 2. Backend Setup
Create and activate a Python virtual environment:
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

**Configure Environment Variables:**
Copy the example template to create your secure `.env` file!
```bash
cp .env.example .env
```
*(Open `.env` and fill in your free API keys for OpenWeather, AQICN, and Groq).*

Initialize the database and start the server:
```bash
python run_setup.py
python app.py
```
*Backend runs on `http://127.0.0.1:5000`*

### 3. Frontend Setup
Open a **new terminal window**, navigate to the frontend folder:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

Navigate to `http://localhost:5173` in your browser to use EcoStride!

---

## 📌 Third-Party API Integrations

EcoStride relies on the following free-tier APIs to aggregate environmental data:

1. **[Govt of India Open Data](https://data.gov.in/)**: Official primary AQI source for Indian cities.
2. **[OpenWeatherMap](https://openweathermap.org/api/air-pollution)**: Global fallback and live pollution coordinates.
3. **[AQICN (WAQI)](https://aqicn.org/api/)**: Sensor-level station data for geographical pins.
4. **[Nominatim (OSM)](https://nominatim.openstreetmap.org/)**: Forward and reverse geocoding with extreme local bias.
5. **[Groq Compute](https://console.groq.com/)**: Ultra-fast LLM inference for the Health Advisory module.

---

## 🤝 Community & Reporting

EcoStride features a built-in community reporting protocol. Users witnessing illegal industrial emissions, severe agricultural burning, or excessive vehicular pollution can drop a GPS pin and file a localized report. The backend `alert_service.py` automatically compiles this data and dispatches an automated email to a configured municipal authority.

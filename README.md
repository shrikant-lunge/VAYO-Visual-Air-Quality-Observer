# 🌿 EcoStride – Real-Time Air Quality Monitoring, Prediction & Clean Route Navigation

![Python](https://img.shields.io/badge/Python-3.8%2B-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-Backend-lightgrey?style=flat-square&logo=flask)
![TensorFlow](https://img.shields.io/badge/TensorFlow-BiLSTM-orange?style=flat-square&logo=tensorflow)
![SQLite](https://img.shields.io/badge/Database-SQLite-blue?style=flat-square&logo=sqlite)
![License](https://img.shields.io/badge/License-Educational-green?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)

> **EcoStride** is a smart air quality management platform designed to monitor, analyze, and predict urban air pollution — helping users make healthier decisions outdoors.

The system integrates real-time environmental data, predictive analytics, and intelligent routing to minimize pollution exposure during activities such as jogging, walking, and cycling.

> ✅ Runs entirely on **free resources and local setup** — no Docker, no paid APIs, no cloud infrastructure required.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📈 **AQI Forecasting** | Predicts short-term air quality trends using simulated BiLSTM models |
| 🗺️ **Pollution-Aware Routing** | Finds safer outdoor routes with lower pollution exposure |
| 🛰️ **Pollution Source Detection** | Simulates detection of pollution sources using satellite-inspired datasets |
| 💊 **Health Advisory System** | Generates health recommendations based on real-time AQI levels |
| ⚙️ **Policy Simulation Engine** | Simulates "what-if" environmental policy scenarios |

---

## 🔍 Feature Details

### 1. AQI Forecasting
Predicts short-term air quality trends using simulated **BiLSTM models** powered by environmental data from **OpenWeatherMap** and **AQICN APIs**.

### 2. Pollution-Aware Routing
Provides safer outdoor navigation by identifying routes with **lower pollution exposure** using **OSRM routing** and **Leaflet.js map visualization**.

### 3. Pollution Source Detection
Simulates detection of pollution sources by processing **satellite plume data** inspired by NASA / Sentinel-5P datasets.

### 4. Health Advisory System
Generates personalized health recommendations based on AQI levels using **local LLM models (Ollama)** or the **Groq API free tier**.

### 5. Policy Simulation Engine
Analyzes the potential impact of environmental policies by simulating scenarios related to traffic control, emissions reduction, and pollution mitigation strategies.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python, Flask |
| **Data Processing** | Pandas, NumPy |
| **Machine Learning** | TensorFlow / Keras (BiLSTM) |
| **Maps & Visualization** | Leaflet.js |
| **Routing** | OSRM |
| **Database** | SQLite |
| **APIs** | OpenWeatherMap, AQICN, Groq (optional) |

---

## 📁 Project Structure

```
EcoStride/
│
├── app.py               # Main application entry point
├── config.py            # API keys and configuration
├── run_setup.py         # Database initialization script
├── requirements.txt     # Python dependencies
│
├── models/              # ML model definitions and weights
├── templates/           # HTML templates (Jinja2)
├── static/              # CSS, JS, and assets
├── database/            # SQLite database files
└── data/                # Sample and simulation datasets
```

---

## 🚀 Quick Start Guide

### Prerequisites

- Python **3.8 or higher**

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/EcoStride.git
cd EcoStride
```

### Step 2 — Create a Virtual Environment

```bash
python -m venv venv
```

Activate it:

**Windows:**
```bash
venv\Scripts\activate
```

**Mac / Linux:**
```bash
source venv/bin/activate
```

### Step 3 — Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4 — Configure API Keys

Open `config.py` and add your API keys:

```python
OPENWEATHER_API_KEY = "your_key_here"   # https://openweathermap.org/api
AQICN_API_TOKEN     = "your_token_here" # https://aqicn.org/api/
GROQ_API_KEY        = "your_key_here"   # Optional – for LLM health advisories
```

> **Note:** If no API keys are provided, the system will automatically fall back to simulated data for demonstration purposes.

### Step 5 — Initialize the Database

```bash
python run_setup.py
```

### Step 6 — Run the Application

```bash
python app.py
```

Open your browser and navigate to:

```
http://127.0.0.1:5000
```

---

## 📌 API Reference

| API | Purpose | Free Tier |
|---|---|---|
| [OpenWeatherMap](https://openweathermap.org/api) | Weather & AQI data | ✅ Yes |
| [AQICN](https://aqicn.org/api/) | Real-time AQI feeds | ✅ Yes |
| [Groq](https://console.groq.com/) | LLM health advisories | ✅ Yes |
| [OSRM](http://project-osrm.org/) | Pollution-aware routing | ✅ Open Source |

---

## 📄 License

This project is released for **educational and research purposes only**.

---

## Acknowledgements

- Inspired by modern urban air quality monitoring systems
- Environmental datasets sourced from open platforms including OpenWeatherMap, AQICN, and NASA / Sentinel-5P inspired simulations
- Routing powered by the open-source [OSRM Project](http://project-osrm.org/)
- This project is based on the Auralis project developed by Team Auralis.
Original repository: https://github.com/antonyjoseph2111/auralis

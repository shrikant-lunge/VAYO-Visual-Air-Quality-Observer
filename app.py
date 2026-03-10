from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import sys
import os

# Ensure the project root is in sys.path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

app = Flask(__name__)
CORS(app)

from models.forecasting import AQIForecaster
from models.routing import RoutePlanner
from models.health_advisory import HealthAdvisor
from models.policy_analysis import PolicySimulator

# Initialize modules
forecaster = AQIForecaster()
router     = RoutePlanner()
advisor    = HealthAdvisor()
simulator  = PolicySimulator()

# --- Page Routes ---
@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/forecast', methods=['GET'])
def forecast_page():
    return render_template('forecast.html')

@app.route('/routing', methods=['GET'])
def routing_page():
    return render_template('routing.html')

@app.route('/sources', methods=['GET'])
def sources_page():
    return render_template('sources.html')

@app.route('/health', methods=['GET'])
def health_page():
    return render_template('health.html')

@app.route('/policy', methods=['GET'])
def policy_page():
    return render_template('policy.html')


# --- Forecast API Endpoints ---
@app.route('/api/forecast/current', methods=['GET'])
def get_current_aqi():
    location = request.args.get('location', 'amravati')
    current = forecaster.get_current(location)
    return jsonify({"status": "success", "data": current})

@app.route('/api/forecast/predict', methods=['POST'])
def predict_aqi():
    data = request.json or {}
    location = data.get('location', 'amravati')
    predictions = forecaster.predict_72h(location)
    return jsonify({"status": "success", "data": predictions})

# --- Routing API Endpoints ---
@app.route('/api/route/calculate', methods=['POST'])
def calculate_route():
    data = request.json or {}
    start = data.get('start_name', 'Rajapeth')
    end   = data.get('end_name',   'Camp')
    mode  = data.get('mode', 'driving')
    routes = router.find_routes(start, end, mode)
    return jsonify({"status": "success", "routes": routes})

# --- Source Detection Endpoints (Now Dynamic) ---
@app.route('/api/source/detect', methods=['GET'])
def detect_sources():
    sources = forecaster.get_source_hotspots()
    return jsonify({"status": "success", "detected_sources": sources})

# --- Colony AQI Pins ---
@app.route('/api/map/pins', methods=['GET'])
def get_map_pins():
    """Returns live AQI data for all Amravati colonies as map pins."""
    pins = forecaster.get_colony_pins()
    return jsonify({"status": "success", "pins": pins})

# --- Health Advisory Endpoints ---
@app.route('/api/health/advisory', methods=['POST'])
def get_advisory():
    data    = request.json or {}
    profile = data.get('profile', {})
    location = profile.get('location', 'amravati')

    current   = forecaster.get_current(location)
    aqi_value = current.get('aqi', 100)

    risk   = advisor.calculate_risk_score(aqi_value, profile)
    advice = advisor.generate_advisory(profile, aqi_value)

    return jsonify({
        "status":          "success",
        "current_aqi":     aqi_value,
        "aqi_category":    current.get("category", ""),
        "pollutants":      {k: current.get(k) for k in ["pm2_5", "pm10", "no2", "o3", "so2", "co"]},
        "risk_assessment": risk,
        "advisory":        advice,
    })

# --- Policy Simulation Endpoints ---
@app.route('/api/policy/scenarios', methods=['GET'])
def get_scenarios():
    return jsonify({"status": "success", "scenarios": simulator.get_available_scenarios()})

@app.route('/api/policy/simulate', methods=['POST'])
def simulate_policy():
    data             = request.json or {}
    selected_policies = data.get('policies', [])
    location         = data.get('location', 'amravati')

    # Live current data as the simulation baseline
    current_state        = forecaster.get_current(location)
    simulation_result    = simulator.simulate_policy(current_state, selected_policies)

    return jsonify({"status": "success", "impact": simulation_result, "baseline_aqi": current_state.get("aqi")})


if __name__ == '__main__':
    from config import PORT, HOST, DEBUG
    print(f"Starting Team-X project on http://{HOST}:{PORT}")
    app.run(debug=DEBUG, host=HOST, port=PORT)

class PolicySimulator:
    def __init__(self):
        # We define base scenarios and their expected impacts on key pollutants.
        # Negative values represent the percentage reduction in the pollutant.
        self.scenarios = {
            "odd_even_vehicles": {
                "name": "Odd-Even Vehicle Scheme",
                "impacts": {"pm25": -0.15, "no2": -0.30, "co": -0.25},
                "difficulty_score": 6,
                "description": "Restricts vehicles based on odd/even license plates."
            },
            "construction_ban": {
                "name": "Complete Construction Ban",
                "impacts": {"pm10": -0.40, "pm25": -0.15},
                "difficulty_score": 8,
                "description": "Halts all major construction activities."
            },
            "industrial_caps": {
                "name": "Industrial Emission Caps",
                "impacts": {"so2": -0.45, "no2": -0.20, "pm25": -0.25},
                "difficulty_score": 9,
                "description": "Enforces strict limits on surrounding heavy industries."
            },
            "public_transport_incentives": {
                "name": "Public Transport Incentives",
                "impacts": {"pm25": -0.05, "no2": -0.10, "co": -0.10},
                "difficulty_score": 4,
                "description": "Subsidizes bus/train fares to reduce private vehicle usage."
            }
        }

    def simulate_policy(self, current_data, selected_policies):
        """
        Runs a counterfactual simulation.
        current_data is a dict containing current pollutant levels {pm25: X, pm10: Y...}
        selected_policies is a list of scenario keys.
        """
        # Ensure base default values if missing
        baseline = {
            "pm25": current_data.get("pm2_5", 55.0),
            "pm10": current_data.get("pm10", 110.0),
            "no2": current_data.get("no2", 45.0),
            "so2": current_data.get("so2", 15.0),
            "co": current_data.get("co", 1.2),
            "o3": current_data.get("o3", 35.0),
            "aqi": current_data.get("aqi", 150) # Very rough baseline AQI
        }
        
        simulated = baseline.copy()
        
        # Accumulate reductions securely preventing drops below 0 -> min 5% ambient bounds
        for p in selected_policies:
            if p in self.scenarios:
                impacts = self.scenarios[p]["impacts"]
                for pollutant, reduction in impacts.items():
                    if pollutant in simulated:
                        # Applying sequential reduction
                        simulated[pollutant] = max(simulated[pollutant] * (1 + reduction), baseline[pollutant] * 0.05)
                        
        # Naively recalculate AQI based on dominant pollutant drops (mainly PM2.5/PM10)
        # Using a very simplified heuristic for simulation rather than full EPA formula
        pm_ratio = (simulated['pm25'] / baseline['pm25']) * 0.7 + (simulated['pm10'] / baseline['pm10']) * 0.3
        simulated['aqi'] = max(int(baseline['aqi'] * pm_ratio), 10)
        
        estimated_health_benefits = {
            "hospitalization_reduction": round((1 - pm_ratio) * 100 * 0.15, 1) # e.g. 15% drop per 100% AQI drop
        }
        
        return {
            "baseline": baseline,
            "simulated": simulated,
            "aqi_reduction": baseline['aqi'] - simulated['aqi'],
            "percent_improved": round((1 - pm_ratio) * 100, 1),
            "health_benefits_percent": estimated_health_benefits['hospitalization_reduction']
        }
        
    def get_available_scenarios(self):
        return self.scenarios

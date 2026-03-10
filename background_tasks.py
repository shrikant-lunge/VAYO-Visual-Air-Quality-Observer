# background_tasks.py
import time
import threading
from models.forecasting import AQIForecaster
from config import DATA_UPDATE_INTERVAL

def background_data_updater():
    """Update AQI data automatically pulling from APIs"""
    try:
        forecaster = AQIForecaster()
    except Exception as e:
        print(f"Background task Init Error: {e}")
        return

    print("🔄 Background data updater started...")
    while True:
        try:
            print("🔄 Fetching latest air quality telemetry...")
            # forecaster.fetch_latest_data()
            # forecaster.update_predictions()
            # print("✅ Telemetry updated.")
            pass # Currently simulated
        except Exception as e:
            print(f"❌ Error updating data in background: {e}")
        
        time.sleep(DATA_UPDATE_INTERVAL * 60)

def start_background_tasks():
    """Start all background daemon threads"""
    updater_thread = threading.Thread(target=background_data_updater, daemon=True)
    updater_thread.start()
    print("🚀 Background tasks active!")

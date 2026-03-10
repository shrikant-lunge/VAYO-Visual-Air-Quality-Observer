import os

# config.py - Using placeholder keys to trigger the free, local fallback modes.
# Since you requested free operation without signing up, we are using mock keys.
# The application has built-in fallbacks that will return simulated data when these keys fail.

OPENWEATHER_API_KEY = "YOUR_API_KEY"
AQICN_API_TOKEN = "YOUR_API_KEY"

# We use "your_free_key_here" so that health_advisory.py explicitly skips the Groq API call
# and immediately uses the local fallback advisory without waiting for an API error.
GROQ_API_KEY = "YOUR_API_KEY" 
USE_LOCAL_LLM = False

# Govt India Open Data Portal (Data.gov.in)
GOV_INDIA_API_KEY = "YOUR_API_KEY"
GOV_INDIA_RESOURCE_ID = "PROVIDE_RESOURCE_ID"

# Database
DATABASE_PATH = os.path.join(os.path.dirname(__file__), "database", "teamx.db")

# Application settings
HOST = "127.0.0.1"
PORT = 5000
DEBUG = True

# Data update intervals (in minutes)
DATA_UPDATE_INTERVAL = 15
FORECAST_RETRAIN_DAYS = 7

# Caching (to save API calls)
CACHE_ENABLED = True
CACHE_DURATION = 900  # 15 minutes in seconds

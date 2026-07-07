import os

# config.py - Using placeholder keys to trigger the free, local fallback modes.
# Since you requested free operation without signing up, we are using mock keys.
# The application has built-in fallbacks that will return simulated data when these keys fail.
# NOTE: this repo is public on GitHub.
# Do NOT commit real keys. Use environment variables or create config.py locally from config_example.py.
# These defaults intentionally blank keys so the app uses built-in fallbacks.

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
AQICN_API_TOKEN = os.getenv("AQICN_API_TOKEN", "")

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
USE_LOCAL_LLM = os.getenv("USE_LOCAL_LLM", "false").lower() == "true"

# ── AirGuard Agent (Claude) ─────────────────────────────
# Get your free key at: https://console.anthropic.com
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# Govt India Open Data Portal (Data.gov.in)
GOV_INDIA_API_KEY = os.getenv("GOV_INDIA_API_KEY", "")
GOV_INDIA_RESOURCE_ID = os.getenv("GOV_INDIA_RESOURCE_ID", "3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69")


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

# ─── Government Data ─────────────────────────
GOV_INDIA_RESOURCE_ID = "3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69" # Default CPCB dataset resource ID

# ─── Email / SMS Alerts (Optional) ───────────
# SMTP_EMAIL            = "maheshugle07@gmail.com"                         # Gmail address for sending alerts
# SMTP_APP_PASSWORD     = "maau neyi axhy nnew"                 # Gmail App Password (not your login password)
# AUTHORITY_EMAIL       = "maheshugle07@gmail.com"                      # Recipient of community reports
# FAST2SMS_API_KEY      = "IKMmSObXd8JxAGo9gps0rWewnji2TYyF45fh7HVLcPUzlREkDqhkxsFIQnLUgiYGMbJr6ez4pjq0vNEc"                     # Fast2SMS key for SMS alerts

# ─── Database ─────────────────────────────────
DATABASE_PATH         = "database/teamx.db"

# ─── Server ──────────────────────────────────
HOST                  = "127.0.0.1"
PORT                  = 5000
DEBUG                 = True

# ─── Caching & Updates ───────────────────────
CACHE_DURATION        = 900                                     # seconds (15 min)
DATA_UPDATE_INTERVAL  = 15                                      # minutes

# Firebase Configuration
# IMPORTANT: Set these environment variables or hardcode them below
# Get your Firebase Database URL from Firebase Console > Realtime Database > Your Project
FIREBASE_DATABASE_URL = os.getenv("FIREBASE_DATABASE_URL", "")


# Firebase Security Rules - If you see 404 errors, update your Firebase Console with these rules:
# Go to: Firebase Console > Your Project > Realtime Database > Rules tab
# Copy and paste this JSON:
"""
{
  "rules": {
    "users": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "communityMessages": {
      ".read": true,
      ".write": "auth != null"
    },
    "communityReports": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "blacklist": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    ".read": false,
    ".write": false
  }
}
"""

# Local fallback storage for when Firebase is unavailable
USE_LOCAL_STORAGE_FALLBACK = os.getenv('USE_LOCAL_STORAGE_FALLBACK', 'true').lower() == 'true'
LOCAL_STORAGE_PATH = os.path.join(os.path.dirname(__file__), 'local_storage')

# ─── Roboflow Image Classification ──────────
# Get a free API key at: https://app.roboflow.com (Universe free tier)
# Model ID format: "project-name/version" e.g. "smoke-detection-9wnjc/1"
ROBOFLOW_API_KEY  = os.getenv('ROBOFLOW_API_KEY', '')
ROBOFLOW_MODEL_ID = os.getenv('ROBOFLOW_MODEL_ID', '')
ROBOFLOW_API_URL  = os.getenv('ROBOFLOW_API_URL', 'https://detect.roboflow.com')

# ─── Firebase Storage (Stub) ────────────────
# Set to True to upload citizen photos to Firebase Storage instead of local disk.
# Requires Firebase Storage bucket configured in your project.
USE_FIREBASE_STORAGE = os.getenv('USE_FIREBASE_STORAGE', 'false').lower() == 'true'

# ─── Municipal Authority Email ──────────────
# Email address of the municipal authority team that receives hotspot alerts.
AUTHORITY_EMAIL = os.getenv('AUTHORITY_EMAIL', '')
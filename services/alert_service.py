import sqlite3
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import datetime
import requests
import os

try:
    from config import SMTP_EMAIL, SMTP_APP_PASSWORD, FAST2SMS_API_KEY, AUTHORITY_EMAIL
except ImportError:
    SMTP_EMAIL = ""
    SMTP_APP_PASSWORD = ""
    FAST2SMS_API_KEY = ""
    AUTHORITY_EMAIL = ""

class AQIAlertService:
    def __init__(self):
        self.db_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'teamx.db')
        self._create_tables()
    
    def _create_tables(self):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute('''
        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY,
            contact TEXT NOT NULL,
            contact_type TEXT NOT NULL,
            city TEXT NOT NULL,
            lat REAL, lon REAL,
            threshold INTEGER DEFAULT 100,
            active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        c.execute('''
        CREATE TABLE IF NOT EXISTS alert_logs (
            id INTEGER PRIMARY KEY,
            subscriber_id INTEGER,
            city TEXT,
            aqi INTEGER,
            sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        c.execute('''
        CREATE TABLE IF NOT EXISTS community_reports (
            id INTEGER PRIMARY KEY,
            report_type TEXT NOT NULL,
            description TEXT,
            city TEXT,
            lat REAL,
            lon REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        conn.commit()
        conn.close()
        
    def subscribe(self, contact, contact_type, city, lat, lon, threshold=100):
        self.unsubscribe(contact)
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute('''
        INSERT INTO subscribers (contact, contact_type, city, lat, lon, threshold)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (contact, contact_type, city, lat, lon, threshold))
        conn.commit()
        conn.close()
        
    def unsubscribe(self, contact):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute('DELETE FROM subscribers WHERE contact = ?', (contact,))
        conn.commit()
        conn.close()
        
    def send_email_alert(self, email_addr, city, aqi, message):
        if not SMTP_EMAIL or not SMTP_APP_PASSWORD:
            print("Email not sent: SMTP credentials missing")
            return
            
        html = f"""
        <html><body style="font-family:Arial;background:#0d1117;color:#fff;padding:20px">
          <div style="max-width:600px;margin:auto;background:#161b22;border-radius:16px;padding:24px">
            <h2 style="color:#ff4444">⚠️ AQI Health Alert — {city}</h2>
            <div style="background:#ff4444;border-radius:12px;padding:16px;text-align:center">
              <div style="font-size:48px;font-weight:bold">{aqi}</div>
              <div>Current AQI Level</div>
            </div>
            <p>Air quality in <b>{city}</b> has reached <b>AQI {aqi}</b>.</p>
            <p><b>Recommendation: Stay indoors. Avoid outdoor activities.</b></p>
            <ul>
              <li>Keep windows and doors closed</li>
              <li>Use air purifiers if available</li>
              <li>Wear N95 mask if going outside is unavoidable</li>
              <li>Avoid exercise outdoors</li>
            </ul>
            <a href="http://localhost:5173" style="background:#00b4d8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">
              View Live AQI Map
            </a>
          </div>
        </body></html>"""
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"⚠️ AQI Health Alert: {city} is at {aqi}"
        msg['From'] = SMTP_EMAIL
        msg['To'] = email_addr
        
        msg.attach(MIMEText(html, 'html'))
        
        try:
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_APP_PASSWORD)
            server.send_message(msg)
            server.quit()
        except Exception as e:
            print(f"Failed to send email to {email_addr}: {e}")

    def send_authority_report(self, report_type, description, city, lat, lon):
        if not SMTP_EMAIL or not SMTP_APP_PASSWORD or not AUTHORITY_EMAIL:
            print("Authority report not sent: Missing credentials or authority email")
            return False

        # Save to DB
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute('''
        INSERT INTO community_reports (report_type, description, city, lat, lon)
        VALUES (?, ?, ?, ?, ?)
        ''', (report_type, description, city, lat, lon))
        conn.commit()
        conn.close()

        # Send Email
        subject = f"🚨 COMMUNITY REPORT: {report_type.upper()} in {city}"
        body = f"""
        <html><body style="font-family:Arial;background:#f8f9fa;padding:20px">
          <div style="max-width:600px;margin:auto;background:#fff;border:1px solid #ddd;border-radius:8px;padding:24px">
            <h2 style="color:#d32f2f">Community Pollution Report</h2>
            <hr>
            <p><strong>Type:</strong> {report_type}</p>
            <p><strong>City:</strong> {city}</p>
            <p><strong>Location:</strong> {lat}, {lon}</p>
            <p><strong>Description:</strong> {description or 'No description provided'}</p>
            <p><strong>Timestamp:</strong> {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <hr>
            <p style="font-size:0.8rem;color:#666">This is an automated report from EcoStride.</p>
          </div>
        </body></html>
        """
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = SMTP_EMAIL
        msg['To'] = AUTHORITY_EMAIL
        msg.attach(MIMEText(body, 'html'))

        try:
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_APP_PASSWORD)
            server.send_message(msg)
            server.quit()
            return True
        except Exception as e:
            print(f"Failed to send authority report: {e}")
            return False
        
    def send_sms_alert(self, phone, city, aqi, message):
        if not FAST2SMS_API_KEY:
            print("SMS not sent: Fast2SMS API key missing")
            return
            
        msg = f"ALERT: AQI in {city} is {aqi}. Stay indoors. Avoid outdoor activities. Visit EcoStride for safe routes. Reply STOP to unsubscribe."
        url = "https://www.fast2sms.com/dev/bulkV2"
        payload = {
            "route": "q",
            "message": msg,
            "language": "english",
            "flash": 0,
            "numbers": phone.replace('+91', '').strip()
        }
        headers = {
            "authorization": FAST2SMS_API_KEY,
            "Content-Type": "application/x-www-form-urlencoded"
        }
        try:
            requests.post(url, data=payload, headers=headers)
        except Exception as e:
            print(f"Failed to send SMS: {e}")
        
    def check_and_send_alerts(self):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute('SELECT id, contact, contact_type, city, lat, lon, threshold FROM subscribers WHERE active=1')
        subscribers = c.fetchall()
        conn.close()
        
        from models.forecasting import AQIForecaster
        forecaster = AQIForecaster()
        
        for sub in subscribers:
            sid, contact, ctype, city, lat, lon, threshold = sub
            try:
                current = forecaster.get_current(location=city, lat=lat, lon=lon)
                aqi = current.get('aqi', 0)
                if aqi > threshold:
                    conn = sqlite3.connect(self.db_path)
                    c = conn.cursor()
                    c.execute('SELECT sent_at FROM alert_logs WHERE subscriber_id=? ORDER BY sent_at DESC LIMIT 1', (sid,))
                    row = c.fetchone()
                    
                    can_send = True
                    if row:
                        last_sent = datetime.datetime.strptime(row[0], '%Y-%m-%d %H:%M:%S')
                        if (datetime.datetime.now() - last_sent).total_seconds() < 4 * 3600:
                            can_send = False
                            
                    if can_send:
                        if ctype == 'email':
                            self.send_email_alert(contact, city, aqi, "")
                        else:
                            self.send_sms_alert(contact, city, aqi, "")
                            
                        c.execute('INSERT INTO alert_logs (subscriber_id, city, aqi) VALUES (?, ?, ?)', (sid, city, aqi))
                        conn.commit()
                    conn.close()
            except Exception as e:
                print(f"Error processing subscriber {sid}: {e}")

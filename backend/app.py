from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import pandas as pd
import sqlite3
# Import the new AI functions
from ai_engine import train_ai_model, analyze_text_sentiment, generate_dynamic_plan, fetch_web_insights, classify_text_context

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

DB_NAME = "mindmesh.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS daily_logs 
                 (id INTEGER PRIMARY KEY, date TEXT, mood REAL, energy REAL, stress REAL, sleep REAL, tasks_completed INTEGER)''')
    c.execute('''CREATE TABLE IF NOT EXISTS decisions 
                 (id INTEGER PRIMARY KEY, date TEXT, title TEXT, cost REAL, value INTEGER, urgency INTEGER, verdict TEXT)''')
    conn.commit()
    conn.close()

# Initialize AI on startup
init_db()
train_ai_model()

@app.route('/api/analyze-journal', methods=['POST'])
def analyze_journal():
    return jsonify(analyze_text_sentiment(request.json.get('text', '')))

@app.route('/api/daily-log', methods=['POST'])
def add_daily_log():
    data = request.json
    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        c.execute("INSERT INTO daily_logs (date, mood, energy, stress, sleep, tasks_completed) VALUES (?, ?, ?, ?, ?, ?)",
                  (timestamp, data['mood'], data['energy'], data['stress'], data['sleep'], 0))
        conn.commit()
        conn.close()
        
        # 1. AI Classifies the text (e.g., "Menstrual Cycle")
        text = data.get('text', '')
        category = classify_text_context(text)
        
        # 2. AI Generates the plan (e.g., writes "Use a heating pad")
        # We ignore numeric mode here as text context is more important for specific issues
        ai_details = generate_dynamic_plan("AI-Optimized", category)
        
        # 3. Fetch Wiki data
        web_insights = fetch_web_insights(category)
            
        return jsonify({
            "message": "Log saved", 
            "suggestions": ai_details, 
            "web_insights": web_insights
        })
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze-decision', methods=['POST'])
def analyze_decision():
    data = request.json
    score = (data['value'] * 2) + (data['urgency'] * 1.5) - (data['cost_impact'] * 2)
    verdict = "Go For It" if score > 5 else "Hold Off"
    return jsonify({"verdict": verdict, "capacity": 75, "score": score})

@app.route('/api/history', methods=['GET'])
def get_history():
    conn = sqlite3.connect(DB_NAME)
    logs = pd.read_sql_query("SELECT * FROM daily_logs", conn).to_dict(orient='records')
    conn.close()
    return jsonify(logs)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import json
import traceback
import numpy as np
import jwt
import functools
from werkzeug.security import generate_password_hash, check_password_hash

from config.settings import get_config
from models.database import db, User, DailyLog, Decision, Pattern, Insight
from services.ml_predictor import MLPredictor
from services.context_classifier import ContextClassifier
from services.ai_engine import AIEngine
from services.knowledge_base import KnowledgeBase
from utils.validators import validate_metrics, validate_decision_data

# Initialize Flask app
app = Flask(__name__)
config = get_config()
app.config.from_object(config)
# Ensure SECRET_KEY is set
if not app.config.get('SECRET_KEY'):
    app.config['SECRET_KEY'] = 'dev-secret-key-change-in-prod'

# Initialize extensions
CORS(app, resources={r"/*": {"origins": "*"}})
db.init_app(app)

# Initialize AI services
ml_predictor = MLPredictor()
context_classifier = ContextClassifier()
ai_engine = AIEngine()
knowledge_base = KnowledgeBase()


# Helper function to convert numpy types to Python types
def convert_to_serializable(obj):
    """Convert numpy types to Python native types for JSON serialization"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, dict):
        return {key: convert_to_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_serializable(item) for item in obj]
    return obj


# Auth Decorator
def token_required(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Authentication token is missing', 'error': 'Unauthorized'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = db.session.get(User, data['user_id'])
            if not current_user:
                return jsonify({'message': 'User not found', 'error': 'Unauthorized'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid', 'error': 'Unauthorized'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated


# Auth Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.json
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Missing required fields'}), 400
            
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
            
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already taken'}), 400
            
        hashed_password = generate_password_hash(data['password'])
        new_user = User(
            username=data['username'],
            email=data['email'],
            password_hash=hashed_password
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Generate token
        token = jwt.encode({
            'user_id': new_user.id,
            'exp': datetime.utcnow() + timedelta(days=7)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Missing email or password'}), 400
            
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not check_password_hash(user.password_hash, data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
            
        # Generate token
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=7)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'token': token,
            'user': user.to_dict()
        })
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({
        'user': current_user.to_dict()
    })


# Initialize database and load models
with app.app_context():
    db.create_all()
    print("✅ Database initialized")
    
    # Try to load existing models, otherwise will train on first use
    ml_predictor.load_models()


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'services': {
            'database': 'connected',
            'ml_models': 'loaded' if ml_predictor.is_trained else 'not_loaded',
            'ai_engine': 'ready'
        }
    })


@app.route('/api/analyze-journal', methods=['POST'])
@token_required
def analyze_journal(current_user):
    """Analyze journal text and extract metrics"""
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Classify context
        classification = context_classifier.classify(text)
        
        # Return sentiment-based metrics
        sentiment = classification['sentiment']
        
        return jsonify({
            'mood': sentiment['mood_score'],
            'energy': 3,
            'stress': 5 - sentiment['mood_score'] if sentiment['mood_score'] < 3 else 2,
            'sleep': 7,
            'classification': classification
        })
        
    except Exception as e:
        print(f"Error in analyze_journal: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/daily-log', methods=['POST'])
@token_required
def create_daily_log(current_user):
    """Create a new daily log entry"""
    try:
        data = request.json
        
        # Validate required fields
        is_valid, error_msg = validate_metrics(data)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # Get journal text and classify context
        journal_text = data.get('text', '')
        classification = None
        
        if journal_text:
            classification = context_classifier.classify(journal_text)
        
        # Predict mode and capacity
        mode_prediction = ml_predictor.predict_mode(
            data['mood'], data['energy'], data['stress'], data['sleep']
        )
        
        capacity = ml_predictor.predict_capacity(
            data['mood'], data['energy'], data['stress'], data['sleep']
        )
        
        # Generate AI plan
        category = classification['category'] if classification else 'General Productivity'
        urgency = classification['urgency'] if classification else 'low'
        sentiment = classification['sentiment'] if classification else None
        
        plan = ai_engine.generate_plan(category, urgency, mode_prediction['mode'], sentiment)
        
        # Create database entry
        log = DailyLog(
            mood=data['mood'],
            energy=data['energy'],
            stress=data['stress'],
            sleep=data['sleep'],
            journal_text=journal_text,
            detected_context=category,
            context_confidence=classification['confidence'] if classification else None,
            plan_schedule=plan['schedule'],
            plan_environment=plan['environment'],
            plan_nutrition=plan['nutrition'],
            user_id=current_user.id
        )
        
        db.session.add(log)
        db.session.commit()
        
        # Fetch knowledge base insights
        insights = knowledge_base.fetch_insights(category)
        resources = knowledge_base.get_related_resources(category)
        
        # Check for safety concerns
        safety_response = None
        if classification and urgency == 'critical':
            safety_response = context_classifier.get_safety_response(category, urgency)
        
        # Train ML model if we have enough data
        logs_count = DailyLog.query.filter_by(user_id=current_user.id).count()
        if logs_count == 50 or logs_count % 100 == 0:
            print(f"🔄 Retraining ML models for user {current_user.id} with {logs_count} data points...")
            historical_logs = DailyLog.query.filter_by(user_id=current_user.id).all()
            import pandas as pd
            training_data = pd.DataFrame([{
                'mood': log.mood,
                'energy': log.energy,
                'stress': log.stress,
                'sleep': log.sleep
            } for log in historical_logs])
            ml_predictor.train_models(training_data)
        
        response = {
            'message': 'Log saved successfully',
            'log_id': log.id,
            'suggestions': {
                'title': f'Protocol: {category}',
                'summary': f'Detected Context: {category}. Operating Mode: {mode_prediction["mode"]}.',
                'mode': mode_prediction['mode'],
                'mode_confidence': float(mode_prediction['confidence']),
                'capacity': float(capacity),
                'schedule': plan['schedule'],
                'environment': plan['environment'],
                'nutrition': plan['nutrition']
            },
            'context': {
                'category': category,
                'confidence': float(classification['confidence']) if classification else None,
                'urgency': urgency,
                'keywords': classification['keywords'] if classification else []
            },
            'web_insights': [{
                'title': insight['title'],
                'description': insight['summary'],
                'solution': insight['sections'][0]['content'] if insight['sections'] else 'See full article for detailed information.',
                'url': insight['url']
            } for insight in insights],
            'resources': resources
        }
        
        if safety_response:
            response['safety_alert'] = safety_response
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in create_daily_log: {e}")
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/decision/analyze', methods=['POST'])
@token_required
def analyze_decision(current_user):
    """Initial decision analysis - asks for more context if needed"""
    try:
        data = request.json
        
        # Validate basic fields
        if not data.get('title'):
            return jsonify({'error': 'Decision title is required'}), 400
        
        # Check if this is initial or follow-up
        conversation_history = data.get('conversation_history', [])
        
        # Get recent logs for capacity calculation (handle empty case)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_logs = DailyLog.query.filter(
            DailyLog.timestamp >= week_ago, 
            DailyLog.user_id == current_user.id
        ).all()
        
        logs_data = [{
            'mood': log.mood,
            'energy': log.energy,
            'stress': log.stress,
            'sleep': log.sleep
        } for log in recent_logs] if recent_logs else []
        
        # Calculate capacity (handle no data case)
        if logs_data:
            capacity_analysis = ml_predictor.calculate_decision_capacity(logs_data)
        else:
            capacity_analysis = {
                'capacity': 50,
                'confidence': 'low',
                'message': 'No historical data. Using default capacity.',
                'context': {
                    'avg_mood': 3,
                    'avg_energy': 3,
                    'avg_stress': 3,
                    'avg_sleep': 7
                }
            }
        
        # Convert to serializable format
        capacity_analysis = convert_to_serializable(capacity_analysis)
        
        # Check if we have enough context
        needs_more_context, questions = ai_engine.assess_decision_context(
            data, conversation_history
        )
        
        if needs_more_context and not data.get('skip_questions'):
            return jsonify({
                'needs_more_context': True,
                'questions': questions,
                'capacity': capacity_analysis,
                'conversation_state': 'gathering_context'
            })
        
        # We have enough context, proceed with analysis
        # Validate decision data
        is_valid, error_msg = validate_decision_data(data)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # Calculate decision score
        score = (data['value'] * 2) + (data['urgency'] * 1.5) - (data['cost_impact'] * 2)
        capacity_factor = capacity_analysis['capacity'] / 100
        adjusted_score = score * capacity_factor
        
        # Determine verdict
        if adjusted_score > 6:
            verdict = "Go For It"
            verdict_detail = "Strong recommendation to proceed with this decision."
        elif adjusted_score > 3:
            verdict = "Proceed with Caution"
            verdict_detail = "This decision has merit but requires careful planning."
        else:
            verdict = "Hold Off"
            verdict_detail = "Consider postponing or reevaluating this decision."
        
        # Calculate confidence
        confidence = min(95, 50 + (abs(adjusted_score) * 10))
        
        # Generate reasoning
        reasoning = ai_engine.generate_decision_reasoning(
            data, adjusted_score, capacity_analysis, conversation_history
        )
        
        # Convert reasoning to serializable format
        reasoning = convert_to_serializable(reasoning)
        
        # Save decision to database
        decision = Decision(
            title=data['title'],
            description=data.get('description', ''),
            category=data.get('category', 'General'),
            cost_impact=data['cost_impact'],
            time_impact=data.get('time_impact', data['cost_impact']),
            urgency=data['urgency'],
            value=data['value'],
            calculated_score=float(adjusted_score),
            capacity_at_decision=float(capacity_analysis['capacity']),
            verdict=verdict,
            confidence=float(confidence),
            avg_mood_7d=float(capacity_analysis['context']['avg_mood']),
            avg_energy_7d=float(capacity_analysis['context']['avg_energy']),
            avg_stress_7d=float(capacity_analysis['context']['avg_stress']),
            user_id=current_user.id
        )
        
        db.session.add(decision)
        db.session.commit()
        
        response = {
            'decision_id': decision.id,
            'verdict': verdict,
            'verdict_detail': verdict_detail,
            'reasoning': reasoning,
            'score': float(adjusted_score),
            'raw_score': float(score),
            'confidence': float(confidence),
            'capacity': float(capacity_analysis['capacity']),
            'capacity_message': capacity_analysis['message'],
            'capacity_confidence': capacity_analysis['confidence'],
            'context': convert_to_serializable(capacity_analysis['context']),
            'recommendation': {
                'proceed': bool(adjusted_score > 3),
                'best_time': 'Now' if capacity_analysis['capacity'] > 70 else 'When capacity improves',
                'considerations': reasoning.get('key_points', [])
            },
            'conversation_state': 'complete'
        }
        
        # Convert entire response to serializable format
        response = convert_to_serializable(response)
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in analyze_decision: {e}")
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': str(e), 'details': traceback.format_exc()}), 500


@app.route('/api/history', methods=['GET'])
@token_required
def get_history(current_user):
    """Get daily log history"""
    try:
        days = request.args.get('days', 30, type=int)
        limit = request.args.get('limit', 100, type=int)
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        logs = DailyLog.query\
            .filter(DailyLog.timestamp >= cutoff_date, DailyLog.user_id == current_user.id)\
            .order_by(DailyLog.timestamp.desc())\
            .limit(limit)\
            .all()
        
        return jsonify([log.to_dict() for log in logs])
        
    except Exception as e:
        print(f"Error in get_history: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/analytics', methods=['GET'])
@token_required
def get_analytics(current_user):
    """Get analytics and insights"""
    try:
        days = request.args.get('days', 30, type=int)
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        logs = DailyLog.query.filter(
            DailyLog.timestamp >= cutoff_date,
            DailyLog.user_id == current_user.id
        ).all()
        
        if not logs:
            return jsonify({
                'status': 'no_data',
                'message': 'No data available for analysis'
            })
        
        # Prepare data for analysis
        logs_data = [{
            'mood': log.mood,
            'energy': log.energy,
            'stress': log.stress,
            'sleep': log.sleep,
            'timestamp': log.timestamp.isoformat() + 'Z'
        } for log in logs]
        
        # Get trend analysis
        trends = ml_predictor.analyze_trends(logs_data)
        
        # Generate AI insights
        insights = ai_engine.generate_insights(
            trends.get('trends', {}),
            trends.get('patterns', []),
            logs_data
        )
        
        # Save insights to database
        for insight_data in insights[:5]:
            existing = Insight.query.filter_by(
                title=insight_data['title'],
                insight_type=insight_data['type'],
                user_id=current_user.id
            ).first()
            
            if not existing:
                insight = Insight(
                    insight_type=insight_data['type'],
                    title=insight_data['title'],
                    message=insight_data['message'],
                    priority=insight_data['priority'],
                    user_id=current_user.id
                )
                db.session.add(insight)
        
        db.session.commit()
        
        response = {
            'status': 'success',
            'period': f'{days} days',
            'data_points': len(logs),
            'averages': trends.get('averages', {}),
            'trends': trends.get('trends', {}),
            'patterns': trends.get('patterns', []),
            'insights': insights
        }
        
        # Convert to serializable format
        response = convert_to_serializable(response)
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in get_analytics: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/analytics/advanced', methods=['GET'])
@token_required
def get_advanced_analytics(current_user):
    """Get comprehensive advanced analytics with health score, correlations, forecasts, and insights"""
    try:
        days = request.args.get('days', 30, type=int)
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        logs = DailyLog.query.filter(
            DailyLog.timestamp >= cutoff_date,
            DailyLog.user_id == current_user.id
        ).all()
        
        if not logs:
            return jsonify({
                'status': 'no_data',
                'message': 'No data available for advanced analysis'
            })
        
        # Prepare data for analysis
        logs_data = [{
            'mood': log.mood,
            'energy': log.energy,
            'stress': log.stress,
            'sleep': log.sleep,
            'timestamp': log.timestamp.isoformat() + 'Z'
        } for log in logs]
        
        # Calculate health score
        health_score = ml_predictor.calculate_health_score(logs_data)
        
        # Detect correlations
        correlations = ml_predictor.detect_correlations(logs_data)
        
        # Forecast next 7 days
        forecast = ml_predictor.forecast_metrics(logs_data, days=7)
        
        # Detect anomalies
        anomalies = ml_predictor.detect_anomalies(logs_data)
        
        # Detect cycles
        cycles = ml_predictor.detect_cycles(logs_data)
        
        # Get basic trend analysis
        trends = ml_predictor.analyze_trends(logs_data)
        
        # Generate AI insights
        ai_insights = ai_engine.generate_analytics_insights(
            trends,
            health_score,
            correlations
        )
        
        # Generate personalized recommendations
        recommendations = ai_engine.generate_recommendations(
            health_score,
            correlations,
            trends.get('patterns', []),
            forecast
        )
        
        # Generate weekly summary
        weekly_summary = ai_engine.generate_weekly_summary(logs_data, trends)
        
        response = {
            'status': 'success',
            'period': f'{days} days',
            'data_points': len(logs),
            'averages': trends.get('averages', {}),
            'trends': trends.get('trends', {}),
            'patterns': trends.get('patterns', []),
            'health_score': health_score,
            'correlations': correlations,
            'forecast': forecast,
            'anomalies': anomalies,
            'cycles': cycles,
            'insights': ai_insights,
            'recommendations': recommendations,
            'weekly_summary': weekly_summary
        }
        
        # Convert to serializable format
        response = convert_to_serializable(response)
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in get_advanced_analytics: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e), 'details': traceback.format_exc()}), 500


@app.route('/api/insights', methods=['GET'])
@token_required
def get_insights(current_user):
    """Get saved insights"""
    try:
        unread_only = request.args.get('unread', 'false').lower() == 'true'
        
        unread_only = request.args.get('unread', 'false').lower() == 'true'
        
        query = Insight.query.filter_by(is_dismissed=False, user_id=current_user.id)
        if unread_only:
            query = query.filter_by(is_read=False)
        
        insights = query.order_by(Insight.generated_at.desc()).limit(20).all()
        
        return jsonify([insight.to_dict() for insight in insights])
        
    except Exception as e:
        print(f"Error in get_insights: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Initialize AI services on startup
    print("🚀 Initializing MindMesh AI Engine...")
    try:
        context_classifier.initialize()
        ai_engine.initialize()
        ml_predictor.train_models()
        print("✅ All systems ready!")
    except Exception as e:
        print(f"⚠️ Warning: Some AI services failed to initialize: {e}")
        print("The application will continue but some features may be limited.")
    
    # Run the app on port 5001
    app.run(debug=True, port=5001, host='0.0.0.0')
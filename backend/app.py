from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import json

from config.settings import get_config
from models.database import db, DailyLog, Decision, Pattern, Insight
from services.ml_predictor import MLPredictor
from services.context_classifier import ContextClassifier
from services.ai_engine import AIEngine
from services.knowledge_base import KnowledgeBase

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(get_config())

# Initialize extensions
CORS(app, resources={r"/*": {"origins": "*"}})
db.init_app(app)

# Initialize AI services
ml_predictor = MLPredictor()
context_classifier = ContextClassifier()
ai_engine = AIEngine()
knowledge_base = KnowledgeBase()

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
        'timestamp': datetime.utcnow().isoformat(),
        'services': {
            'database': 'connected',
            'ml_models': 'loaded' if ml_predictor.is_trained else 'not_loaded',
            'ai_engine': 'ready'
        }
    })


@app.route('/api/analyze-journal', methods=['POST'])
def analyze_journal():
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
            'energy': 3,  # Default, user can adjust
            'stress': 5 - sentiment['mood_score'] if sentiment['mood_score'] < 3 else 2,
            'sleep': 7,  # Default
            'classification': classification
        })
        
    except Exception as e:
        print(f"Error in analyze_journal: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/daily-log', methods=['POST'])
def create_daily_log():
    """Create a new daily log entry"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['mood', 'energy', 'stress', 'sleep']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
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
            plan_nutrition=plan['nutrition']
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
        logs_count = DailyLog.query.count()
        if logs_count == 50 or logs_count % 100 == 0:
            # Retrain with real data
            historical_data = DailyLog.query.all()
            training_data = [{
                'mood': log.mood,
                'energy': log.energy,
                'stress': log.stress,
                'sleep': log.sleep
            } for log in historical_data]
            ml_predictor.train_models(training_data)
        
        response = {
            'message': 'Log saved successfully',
            'log_id': log.id,
            'suggestions': {
                'title': f'Protocol: {category}',
                'summary': f'Detected Context: {category}. Operating Mode: {mode_prediction["mode"]}.',
                'mode': mode_prediction['mode'],
                'mode_confidence': mode_prediction['confidence'],
                'capacity': round(capacity, 1),
                'schedule': plan['schedule'],
                'environment': plan['environment'],
                'nutrition': plan['nutrition']
            },
            'context': {
                'category': category,
                'confidence': classification['confidence'] if classification else None,
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
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/daily-log/<int:log_id>', methods=['PATCH'])
def update_daily_log(log_id):
    """Update a daily log entry (for feedback)"""
    try:
        log = DailyLog.query.get(log_id)
        if not log:
            return jsonify({'error': 'Log not found'}), 404
        
        data = request.json
        
        if 'day_rating' in data:
            log.day_rating = data['day_rating']
        if 'notes' in data:
            log.notes = data['notes']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Log updated successfully',
            'log': log.to_dict()
        })
        
    except Exception as e:
        print(f"Error in update_daily_log: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/analyze-decision', methods=['POST'])
def analyze_decision():
    """Analyze a strategic decision"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['title', 'cost_impact', 'value', 'urgency']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Get recent logs for capacity calculation
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_logs = DailyLog.query.filter(DailyLog.timestamp >= week_ago).all()
        
        # Calculate current capacity
        capacity_analysis = ml_predictor.calculate_decision_capacity([
            {
                'mood': log.mood,
                'energy': log.energy,
                'stress': log.stress,
                'sleep': log.sleep
            } for log in recent_logs
        ])
        
        # Calculate decision score
        # Score = (value * 2) + (urgency * 1.5) - (cost_impact * 2)
        score = (data['value'] * 2) + (data['urgency'] * 1.5) - (data['cost_impact'] * 2)
        
        # Adjust score based on capacity
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
        
        # Save decision to database
        decision = Decision(
            title=data['title'],
            description=data.get('description', ''),
            category=data.get('category', 'General'),
            cost_impact=data['cost_impact'],
            time_impact=data.get('time_impact', data['cost_impact']),
            urgency=data['urgency'],
            value=data['value'],
            calculated_score=adjusted_score,
            capacity_at_decision=capacity_analysis['capacity'],
            verdict=verdict,
            confidence=confidence,
            avg_mood_7d=capacity_analysis['context']['avg_mood'],
            avg_energy_7d=capacity_analysis['context']['avg_energy'],
            avg_stress_7d=capacity_analysis['context']['avg_stress']
        )
        
        db.session.add(decision)
        db.session.commit()
        
        return jsonify({
            'decision_id': decision.id,
            'verdict': verdict,
            'verdict_detail': verdict_detail,
            'score': round(adjusted_score, 2),
            'raw_score': round(score, 2),
            'confidence': round(confidence, 1),
            'capacity': capacity_analysis['capacity'],
            'capacity_message': capacity_analysis['message'],
            'capacity_confidence': capacity_analysis['confidence'],
            'context': capacity_analysis['context'],
            'recommendation': {
                'proceed': adjusted_score > 3,
                'best_time': 'Now' if capacity_analysis['capacity'] > 70 else 'When capacity improves',
                'considerations': [
                    f"Your current capacity is {capacity_analysis['capacity']:.0f}%",
                    f"Decision score: {adjusted_score:.1f}/10",
                    f"Confidence level: {confidence:.0f}%"
                ]
            }
        })
        
    except Exception as e:
        print(f"Error in analyze_decision: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/history', methods=['GET'])
def get_history():
    """Get daily log history"""
    try:
        # Get query parameters
        days = request.args.get('days', 30, type=int)
        limit = request.args.get('limit', 100, type=int)
        
        # Query logs
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        logs = DailyLog.query\
            .filter(DailyLog.timestamp >= cutoff_date)\
            .order_by(DailyLog.timestamp.desc())\
            .limit(limit)\
            .all()
        
        return jsonify([log.to_dict() for log in logs])
        
    except Exception as e:
        print(f"Error in get_history: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get analytics and insights"""
    try:
        # Get recent logs
        days = request.args.get('days', 30, type=int)
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        logs = DailyLog.query.filter(DailyLog.timestamp >= cutoff_date).all()
        
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
            'timestamp': log.timestamp.isoformat()
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
        for insight_data in insights[:5]:  # Save top 5
            existing = Insight.query.filter_by(
                title=insight_data['title'],
                insight_type=insight_data['type']
            ).first()
            
            if not existing:
                insight = Insight(
                    insight_type=insight_data['type'],
                    title=insight_data['title'],
                    message=insight_data['message'],
                    priority=insight_data['priority']
                )
                db.session.add(insight)
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'period': f'{days} days',
            'data_points': len(logs),
            'averages': trends.get('averages', {}),
            'trends': trends.get('trends', {}),
            'patterns': trends.get('patterns', []),
            'insights': insights
        })
        
    except Exception as e:
        print(f"Error in get_analytics: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/decisions/history', methods=['GET'])
def get_decisions_history():
    """Get decision history"""
    try:
        limit = request.args.get('limit', 50, type=int)
        decisions = Decision.query\
            .order_by(Decision.timestamp.desc())\
            .limit(limit)\
            .all()
        
        return jsonify([decision.to_dict() for decision in decisions])
        
    except Exception as e:
        print(f"Error in get_decisions_history: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/insights', methods=['GET'])
def get_insights():
    """Get saved insights"""
    try:
        unread_only = request.args.get('unread', 'false').lower() == 'true'
        
        query = Insight.query.filter_by(is_dismissed=False)
        if unread_only:
            query = query.filter_by(is_read=False)
        
        insights = query.order_by(Insight.generated_at.desc()).limit(20).all()
        
        return jsonify([insight.to_dict() for insight in insights])
        
    except Exception as e:
        print(f"Error in get_insights: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # Initialize AI services on startup
    print("🚀 Initializing MindMesh AI Engine...")
    context_classifier.initialize()
    ai_engine.initialize()
    ml_predictor.train_models()
    print("✅ All systems ready!")
    
    # Run the app
    app.run(debug=True, port=5001, host='0.0.0.0')
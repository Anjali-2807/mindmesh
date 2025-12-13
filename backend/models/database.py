from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class DailyLog(db.Model):
    """Model for daily mood/energy logs"""
    __tablename__ = 'daily_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Metrics
    mood = db.Column(db.Float, nullable=False)
    energy = db.Column(db.Float, nullable=False)
    stress = db.Column(db.Float, nullable=False)
    sleep = db.Column(db.Float, nullable=False)
    tasks_completed = db.Column(db.Integer, default=0)
    
    # Context
    journal_text = db.Column(db.Text, nullable=True)
    detected_context = db.Column(db.String(200), nullable=True)
    context_confidence = db.Column(db.Float, nullable=True)
    
    # Generated Plan
    plan_schedule = db.Column(db.Text, nullable=True)
    plan_environment = db.Column(db.Text, nullable=True)
    plan_nutrition = db.Column(db.Text, nullable=True)
    
    # Feedback
    day_rating = db.Column(db.Integer, nullable=True)  # 1-5 rating
    notes = db.Column(db.Text, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'date': self.timestamp.strftime('%Y-%m-%d'),
            'time': self.timestamp.strftime('%H:%M'),
            'timestamp': self.timestamp.isoformat(),
            'mood': self.mood,
            'energy': self.energy,
            'stress': self.stress,
            'sleep': self.sleep,
            'tasks_completed': self.tasks_completed,
            'journal_text': self.journal_text,
            'detected_context': self.detected_context,
            'context_confidence': self.context_confidence,
            'plan': {
                'schedule': self.plan_schedule,
                'environment': self.plan_environment,
                'nutrition': self.plan_nutrition
            } if self.plan_schedule else None,
            'day_rating': self.day_rating,
            'notes': self.notes
        }

class Decision(db.Model):
    """Model for strategic decisions"""
    __tablename__ = 'decisions'
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Decision Details
    title = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(100), nullable=True)
    
    # Factors (1-5 scale)
    cost_impact = db.Column(db.Float, nullable=False)
    time_impact = db.Column(db.Float, nullable=False)
    urgency = db.Column(db.Float, nullable=False)
    value = db.Column(db.Float, nullable=False)
    
    # Analysis Results
    calculated_score = db.Column(db.Float, nullable=True)
    capacity_at_decision = db.Column(db.Float, nullable=True)
    verdict = db.Column(db.String(50), nullable=True)
    confidence = db.Column(db.Float, nullable=True)
    
    # Context from Tier 1
    avg_mood_7d = db.Column(db.Float, nullable=True)
    avg_energy_7d = db.Column(db.Float, nullable=True)
    avg_stress_7d = db.Column(db.Float, nullable=True)
    
    # Outcome Tracking
    decision_made = db.Column(db.String(50), nullable=True)  # 'accepted', 'rejected', 'postponed'
    outcome_rating = db.Column(db.Integer, nullable=True)  # 1-5
    outcome_notes = db.Column(db.Text, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'date': self.timestamp.strftime('%Y-%m-%d'),
            'timestamp': self.timestamp.isoformat(),
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'factors': {
                'cost_impact': self.cost_impact,
                'time_impact': self.time_impact,
                'urgency': self.urgency,
                'value': self.value
            },
            'analysis': {
                'score': self.calculated_score,
                'capacity': self.capacity_at_decision,
                'verdict': self.verdict,
                'confidence': self.confidence
            },
            'context': {
                'avg_mood_7d': self.avg_mood_7d,
                'avg_energy_7d': self.avg_energy_7d,
                'avg_stress_7d': self.avg_stress_7d
            },
            'outcome': {
                'decision_made': self.decision_made,
                'rating': self.outcome_rating,
                'notes': self.outcome_notes
            } if self.decision_made else None
        }

class Pattern(db.Model):
    """Model for detected behavioral patterns"""
    __tablename__ = 'patterns'
    
    id = db.Column(db.Integer, primary_key=True)
    detected_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    pattern_type = db.Column(db.String(100), nullable=False)  # 'energy_dip', 'stress_spike', etc.
    description = db.Column(db.Text, nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    
    # Pattern Details
    trigger_factors = db.Column(db.Text, nullable=True)  # JSON
    recommended_action = db.Column(db.Text, nullable=True)
    
    # Tracking
    times_observed = db.Column(db.Integer, default=1)
    last_observed = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'detected_at': self.detected_at.isoformat(),
            'pattern_type': self.pattern_type,
            'description': self.description,
            'confidence': self.confidence,
            'trigger_factors': json.loads(self.trigger_factors) if self.trigger_factors else None,
            'recommended_action': self.recommended_action,
            'times_observed': self.times_observed,
            'last_observed': self.last_observed.isoformat(),
            'is_active': self.is_active
        }

class Insight(db.Model):
    """Model for AI-generated insights"""
    __tablename__ = 'insights'
    
    id = db.Column(db.Integer, primary_key=True)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    insight_type = db.Column(db.String(100), nullable=False)  # 'trend', 'anomaly', 'achievement', 'warning'
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(20), nullable=False)  # 'low', 'medium', 'high', 'critical'
    
    # Related Data
    related_metric = db.Column(db.String(50), nullable=True)
    data_points = db.Column(db.Text, nullable=True)  # JSON
    
    # User Interaction
    is_read = db.Column(db.Boolean, default=False)
    is_dismissed = db.Column(db.Boolean, default=False)
    user_feedback = db.Column(db.String(50), nullable=True)  # 'helpful', 'not_helpful'
    
    def to_dict(self):
        return {
            'id': self.id,
            'generated_at': self.generated_at.isoformat(),
            'insight_type': self.insight_type,
            'title': self.title,
            'message': self.message,
            'priority': self.priority,
            'related_metric': self.related_metric,
            'data_points': json.loads(self.data_points) if self.data_points else None,
            'is_read': self.is_read,
            'is_dismissed': self.is_dismissed,
            'user_feedback': self.user_feedback
        }
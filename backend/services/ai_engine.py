from transformers import pipeline
import random

class AIEngine:
    """Advanced AI recommendation engine"""
    
    def __init__(self):
        self.generator = None
        self.recommendation_templates = self._load_templates()
        
    def initialize(self):
        """Initialize the text generation model"""
        print("🎯 Loading AI Generator...")
        self.generator = pipeline(
            "text-generation",
            model="distilgpt2",
            device=-1
        )
        print("✅ AI Generator ready")
    
    def _load_templates(self):
        """Load context-aware recommendation templates"""
        return {
            # EMERGENCY / CRITICAL
            'critical': {
                'schedule': [
                    "IMMEDIATE ACTION REQUIRED: {action}. Do not delay.",
                    "PRIORITY: Ensure safety first. {action}.",
                    "URGENT: {action}. Contact authorities if needed."
                ],
                'environment': [
                    "Move to a safe, public location immediately.",
                    "Ensure you are not alone. Contact a trusted person.",
                    "Document evidence if safe to do so. Preserve all records."
                ],
                'nutrition': [
                    "Safety first. Focus on immediate needs and hydration.",
                    "Seek support. Contact emergency helplines for guidance.",
                    "You are not alone. Reach out to trusted contacts now."
                ]
            },
            
            # HEALTH - PHYSICAL
            'health_physical': {
                'schedule': [
                    "Prioritize rest and recovery. Avoid strenuous activity.",
                    "Monitor symptoms. Seek medical attention if worsening.",
                    "Take breaks every 30 minutes. Listen to your body.",
                    "Use the 2-hour work, 20-minute rest protocol today."
                ],
                'environment': [
                    "Create a comfortable recovery space with proper lighting.",
                    "Maintain room temperature between 68-72°F (20-22°C).",
                    "Reduce screen time and noise. Use soft lighting.",
                    "Keep essentials within reach to minimize movement."
                ],
                'nutrition': [
                    "Stay hydrated: 8-10 glasses of water throughout the day.",
                    "Light, easily digestible meals: soups, fruits, whole grains.",
                    "Avoid caffeine and heavy foods. Focus on nutrients.",
                    "Consider ginger tea for nausea, chamomile for relaxation."
                ]
            },
            
            # MENTAL HEALTH / STRESS
            'mental_health': {
                'schedule': [
                    "Use the 25/5 Pomodoro technique with mindful breaks.",
                    "Schedule three 10-minute meditation sessions today.",
                    "Block 1 hour for a worry-free activity you enjoy.",
                    "End work 2 hours before bed. No screens after 9 PM."
                ],
                'environment': [
                    "Declutter your workspace. A clean space calms the mind.",
                    "Use noise-canceling headphones with ambient sounds.",
                    "Open windows for fresh air. Add plants if possible.",
                    "Create a dedicated relaxation corner away from work."
                ],
                'nutrition': [
                    "Omega-3 rich foods: salmon, walnuts, flaxseeds for mood.",
                    "Complex carbs: oatmeal, brown rice for steady energy.",
                    "Limit caffeine to before 2 PM. Switch to herbal tea.",
                    "Dark chocolate (70%+) in moderation for mood boost."
                ]
            },
            
            # ACADEMIC / WORK
            'academic_work': {
                'schedule': [
                    "Deep work blocks: 90 minutes focused, 15 minutes break.",
                    "Tackle the hardest task first (8-10 AM peak focus).",
                    "Use timeboxing: assign specific hours to each task.",
                    "End each session by planning tomorrow's priorities."
                ],
                'environment': [
                    "Work in a library or quiet café for focused energy.",
                    "Use Forest app or similar to block distractions.",
                    "Keep phone in another room during deep work sessions.",
                    "Adjust desk ergonomics: monitor at eye level, feet flat."
                ],
                'nutrition': [
                    "Brain fuel: blueberries, nuts, dark leafy greens.",
                    "Steady energy: protein-rich breakfast and lunch.",
                    "Hydration reminder every hour. Avoid sugary drinks.",
                    "Pre-study snack: apple with almond butter, green tea."
                ]
            },
            
            # RELATIONSHIPS
            'relationships': {
                'schedule': [
                    "Allow 24 hours before having difficult conversations.",
                    "Schedule a 30-minute walk to process emotions first.",
                    "Journal for 15 minutes before addressing the issue.",
                    "Set boundaries: decide what you will and won't accept."
                ],
                'environment': [
                    "Have conversations in neutral, public spaces if needed.",
                    "Ensure privacy for emotional discussions - no interruptions.",
                    "Use 'I feel' statements instead of 'You always' accusations.",
                    "Create physical space if overwhelmed - it's okay to step back."
                ],
                'nutrition': [
                    "Comfort foods in moderation: warm soup, herbal tea.",
                    "Avoid emotional eating. Journal instead of snacking.",
                    "Social support: share a meal with a trusted friend.",
                    "Self-care treat: favorite healthy meal, dark chocolate."
                ]
            },
            
            # HIGH PERFORMANCE
            'peak_performance': {
                'schedule': [
                    "Maximize flow state: 3-hour deep work blocks, no meetings.",
                    "Front-load critical tasks in first 4 hours of the day.",
                    "60 minutes exercise + 20 minutes meditation at start.",
                    "Time-block everything. Treat peak hours as sacred."
                ],
                'environment': [
                    "Optimize for focus: clean desk, single monitor, no phone.",
                    "Temperature: 68-70°F. Blue light filter after 6 PM.",
                    "Standing desk option. Change posture every 45 minutes.",
                    "Motivational cues: vision board, progress tracker visible."
                ],
                'nutrition': [
                    "Intermittent fasting: late breakfast for mental clarity.",
                    "High-protein meals: lean meats, eggs, Greek yogurt.",
                    "Strategic caffeine: one coffee at 9 AM, green tea at 2 PM.",
                    "Power snacks: mixed nuts, protein bars, fresh fruit."
                ]
            },
            
            # RECOVERY / REST
            'recovery': {
                'schedule': [
                    "Active recovery: 30-minute gentle walk, no intense work.",
                    "Mandatory 8+ hours sleep. In bed by 10 PM tonight.",
                    "Minimum 3 breaks of 15 minutes doing absolutely nothing.",
                    "Cut today's work by 50%. Focus on essential tasks only."
                ],
                'environment': [
                    "Create a rest sanctuary: dim lights, comfortable seating.",
                    "No work emails or notifications after 6 PM today.",
                    "Use aromatherapy: lavender for relaxation, eucalyptus for breathing.",
                    "Temperature: slightly cool for better sleep (65-68°F)."
                ],
                'nutrition': [
                    "Anti-inflammatory foods: turmeric, ginger, leafy greens.",
                    "Hydration focus: coconut water, herbal teas, water with lemon.",
                    "Light dinners: avoid heavy meals 3 hours before bed.",
                    "Magnesium-rich: almonds, spinach, dark chocolate for relaxation."
                ]
            },
            
            # GENERAL / BALANCED
            'general': {
                'schedule': [
                    "Balanced approach: alternate 50-minute work with 10-minute breaks.",
                    "Morning routine: 15 minutes planning, set 3 priorities.",
                    "Afternoon energy dip: 20-minute walk or power nap at 2 PM.",
                    "Evening wind-down: 1 hour no-screen time before bed."
                ],
                'environment': [
                    "Natural light exposure: work near windows if possible.",
                    "Organized chaos: everything has a place, clean at day's end.",
                    "Moderate noise: background music or café sounds if helpful.",
                    "Ergonomic setup: proper chair, monitor height, keyboard position."
                ],
                'nutrition': [
                    "Balanced meals: 40% carbs, 30% protein, 30% healthy fats.",
                    "Meal timing: breakfast within 1 hour of waking, dinner by 7 PM.",
                    "Snack smart: fruits, nuts, yogurt between main meals.",
                    "Hydration: 2-3 liters water, more if exercising."
                ]
            }
        }
    
    def generate_plan(self, context_category, urgency, mode, sentiment):
        """Generate context-aware recommendations"""
        # Determine template category
        template_category = self._map_to_template(context_category, urgency, mode)
        
        # Get templates
        templates = self.recommendation_templates.get(template_category, self.recommendation_templates['general'])
        
        # Generate recommendations
        plan = {
            'mode': mode,
            'schedule': self._select_recommendation(templates['schedule'], context_category),
            'environment': self._select_recommendation(templates['environment'], context_category),
            'nutrition': self._select_recommendation(templates['nutrition'], context_category)
        }
        
        # Add context-specific enhancements
        if urgency == 'critical':
            plan['safety_alert'] = self._get_safety_message(context_category)
        
        return plan
    
    def _map_to_template(self, category, urgency, mode):
        """Map category to appropriate template"""
        if urgency == 'critical':
            return 'critical'
        
        # Health mapping
        health_physical = ['Headache', 'Migraine', 'Back Pain', 'Stomach Ache', 'Flu', 'Fever', 'Fatigue', 'Menstrual Pain']
        if any(h in category for h in health_physical):
            return 'health_physical'
        
        # Mental health mapping
        mental_health = ['Anxiety', 'Depression', 'Panic', 'Stress', 'Burnout', 'Overwhelmed', 'Grief']
        if any(m in category for m in mental_health):
            return 'mental_health'
        
        # Academic/Work mapping
        academic_work = ['Exam', 'Thesis', 'Assignment', 'Deadline', 'Interview', 'Procrastination']
        if any(a in category for a in academic_work):
            return 'academic_work'
        
        # Relationships mapping
        relationships = ['Breakup', 'Relationship', 'Divorce', 'Conflict', 'Friendship', 'Family']
        if any(r in category for r in relationships):
            return 'relationships'
        
        # Mode-based mapping
        if mode == 'Peak Performance':
            return 'peak_performance'
        elif mode == 'Recovery' or mode == 'Rest':
            return 'recovery'
        
        return 'general'
    
    def _select_recommendation(self, options, context):
        """Select appropriate recommendation from options"""
        # Smart selection based on context
        selected = random.choice(options)
        
        # Add context-specific details if generic placeholder
        if '{action}' in selected:
            action = self._get_context_action(context)
            selected = selected.format(action=action)
        
        return selected
    
    def _get_context_action(self, context):
        """Get specific action for context"""
        actions = {
            'Ragging': 'Report to Anti-Ragging Cell immediately',
            'Sexual Harassment': 'Contact authorities and document evidence',
            'Medical Emergency': 'Call emergency services (112)',
            'Panic Attack': 'Practice 4-7-8 breathing technique',
            'Exam Stress': 'Take a 10-minute break and reassess',
        }
        return actions.get(context, 'Address the situation systematically')
    
    def _get_safety_message(self, category):
        """Get safety message for critical situations"""
        return {
            'title': f'Critical: {category}',
            'message': 'Your safety is the priority. Please seek immediate assistance.',
            'action': 'Contact emergency services or a trusted authority figure now.',
            'helpline': self._get_helpline(category)
        }
    
    def _get_helpline(self, category):
        """Get relevant helpline information"""
        helplines = {
            'Ragging': 'UGC Anti-Ragging: 1800-180-5522',
            'Sexual Harassment': 'Women Helpline: 1091',
            'Suicidal Ideation': 'AASRA: 9820466726',
            'Medical Emergency': 'Emergency Services: 112'
        }
        return helplines.get(category, 'Emergency Services: 112')
    
    def generate_insights(self, trends, patterns, recent_logs):
        """Generate AI insights from data"""
        insights = []
        
        # Trend insights
        for metric, trend in trends.items():
            if trend['direction'] == 'declining' and trend['strength'] > 0.5:
                insights.append({
                    'type': 'warning',
                    'title': f'Declining {metric.capitalize()}',
                    'message': f'Your {metric} has been declining. Consider adjusting your routine.',
                    'priority': 'high'
                })
            elif trend['direction'] == 'improving' and trend['strength'] > 0.5:
                insights.append({
                    'type': 'achievement',
                    'title': f'Improving {metric.capitalize()}',
                    'message': f'Great progress! Your {metric} is trending upward.',
                    'priority': 'low'
                })
        
        # Pattern insights
        for pattern in patterns:
            if pattern['severity'] == 'high':
                insights.append({
                    'type': 'alert',
                    'title': pattern['type'].replace('_', ' ').title(),
                    'message': pattern['description'],
                    'priority': 'high'
                })
        
        # Anomaly detection
        if len(recent_logs) >= 7:
            latest_mood = recent_logs[-1]['mood']
            avg_mood = sum(log['mood'] for log in recent_logs[:-1]) / (len(recent_logs) - 1)
            
            if abs(latest_mood - avg_mood) > 2:
                insights.append({
                    'type': 'anomaly',
                    'title': 'Unusual Mood Change',
                    'message': f'Today\'s mood differs significantly from your average. Check in with yourself.',
                    'priority': 'medium'
                })
        
        return sorted(insights, key=lambda x: {'high': 3, 'medium': 2, 'low': 1}[x['priority']], reverse=True)
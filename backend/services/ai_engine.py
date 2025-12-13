from transformers import pipeline
import random

class AIEngine:
    """Advanced AI recommendation engine with context-seeking intelligence"""
    
    def __init__(self):
        self.generator = None
        self.recommendation_templates = self._load_templates()
        
    def initialize(self):
        """Initialize the text generation model"""
        print("🎯 Loading AI Generator...")
        try:
            self.generator = pipeline(
                "text-generation",
                model="distilgpt2",
                device=-1
            )
            print("✅ AI Generator ready")
        except Exception as e:
            print(f"⚠️ AI Generator initialization failed: {e}")
            self.generator = None
    
    def assess_decision_context(self, decision_data, conversation_history):
        """
        Assess if we have enough context to make a decision recommendation.
        Returns (needs_more_context, questions)
        """
        questions = []
        
        # Check if we've already asked questions
        if len(conversation_history) >= 3:
            # User has answered enough questions
            return False, []
        
        # Analyze what information is missing
        title = decision_data.get('title', '').lower()
        description = decision_data.get('description', '').lower()
        combined_text = f"{title} {description}"
        
        # Missing temporal context
        if not any(word in combined_text for word in ['when', 'deadline', 'soon', 'today', 'tomorrow', 'week', 'month', 'year', 'by']):
            questions.append({
                'id': 'timing',
                'question': 'When do you need to make this decision? Is there a deadline?',
                'type': 'text',
                'importance': 'high'
            })
        
        # Missing consequence information
        if len(description) < 20:
            questions.append({
                'id': 'consequences',
                'question': 'What happens if you choose yes? What happens if you choose no?',
                'type': 'text',
                'importance': 'high'
            })
        
        # Missing personal context
        if not any(word in combined_text for word in ['want', 'need', 'feel', 'think', 'concern', 'worry', 'excited', 'afraid']):
            questions.append({
                'id': 'personal_context',
                'question': 'How do you personally feel about this decision? What are your main concerns or hopes?',
                'type': 'text',
                'importance': 'medium'
            })
        
        # Missing alternatives
        if not any(word in combined_text for word in ['instead', 'alternative', 'other option', 'or']):
            questions.append({
                'id': 'alternatives',
                'question': 'Have you considered any alternatives? What other options are available?',
                'type': 'text',
                'importance': 'medium'
            })
        
        # Missing stakeholder information
        if not any(word in combined_text for word in ['family', 'partner', 'team', 'boss', 'friend', 'people', 'affect', 'impact']):
            questions.append({
                'id': 'stakeholders',
                'question': 'Who else will this decision affect? Have you discussed it with them?',
                'type': 'text',
                'importance': 'medium'
            })
        
        # If we have critical missing information, ask
        critical_questions = [q for q in questions if q['importance'] == 'high']
        
        if critical_questions:
            return True, critical_questions[:2]  # Ask max 2 questions at a time
        elif questions and len(conversation_history) == 0:
            # First interaction, ask one clarifying question
            return True, questions[:1]
        
        return False, []
    
    def generate_decision_reasoning(self, decision_data, score, capacity_analysis, conversation_history):
        """
        Generate detailed reasoning for the decision recommendation.
        Uses conversation history to provide personalized insights.
        """
        title = decision_data.get('title', '')
        description = decision_data.get('description', '')
        value = decision_data.get('value', 3)
        cost = decision_data.get('cost_impact', 3)
        urgency = decision_data.get('urgency', 3)
        
        reasoning = {
            'summary': '',
            'key_points': [],
            'considerations': [],
            'risks': [],
            'opportunities': [],
            'timing_advice': ''
        }
        
        # Generate summary
        capacity = capacity_analysis.get('capacity', 50)
        if score > 6:
            reasoning['summary'] = f"Based on your current capacity ({capacity:.0f}%) and the decision parameters, this appears to be a strong opportunity worth pursuing."
        elif score > 3:
            reasoning['summary'] = f"This decision shows promise but requires careful consideration given your current capacity ({capacity:.0f}%)."
        else:
            reasoning['summary'] = f"Given your current state (capacity: {capacity:.0f}%), this may not be the optimal time for this decision."
        
        # Analyze value vs cost
        if value > cost:
            reasoning['opportunities'].append(f"The potential value (rated {value}/5) exceeds the expected cost ({cost}/5), suggesting a favorable outcome.")
        else:
            reasoning['risks'].append(f"The cost (rated {cost}/5) is significant compared to the value ({value}/5). Ensure the investment is justified.")
        
        # Analyze urgency
        if urgency >= 4:
            reasoning['considerations'].append(f"High urgency (rated {urgency}/5) requires quick action, but don't sacrifice quality for speed.")
            reasoning['timing_advice'] = "Act soon, but ensure you have the capacity to handle it properly."
        elif urgency <= 2:
            reasoning['timing_advice'] = "Low urgency gives you time to improve your capacity before committing."
        
        # Capacity-based insights
        if capacity < 50:
            reasoning['risks'].append("Your current capacity is low. This decision may add stress to an already challenging situation.")
            reasoning['considerations'].append("Consider what you can delegate or postpone to free up mental energy.")
        elif capacity > 75:
            reasoning['opportunities'].append("Your high capacity means you're well-positioned to take on new challenges.")
        
        # Analyze conversation history for personalized insights
        for exchange in conversation_history:
            answer = exchange.get('answer', '').lower()
            if 'concern' in answer or 'worry' in answer:
                reasoning['considerations'].append("You've expressed concerns. Trust your instincts and ensure you're comfortable before proceeding.")
            if 'excited' in answer or 'want' in answer:
                reasoning['opportunities'].append("Your enthusiasm is a positive indicator. Passion can drive successful outcomes.")
        
        # Generate key points
        reasoning['key_points'] = [
            f"Decision Score: {score:.1f}/10 (adjusted for your capacity)",
            f"Your Current Capacity: {capacity:.0f}% - {capacity_analysis.get('message', 'Moderate capacity')}",
            f"Value Rating: {value}/5 | Cost Rating: {cost}/5 | Urgency: {urgency}/5"
        ]
        
        # Add timing advice if not already set
        if not reasoning['timing_advice']:
            if capacity > 70:
                reasoning['timing_advice'] = "You're in a good position to make this decision now."
            else:
                reasoning['timing_advice'] = "Consider waiting until your capacity improves, unless urgency demands otherwise."
        
        return reasoning
    
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
        
        return 'general'
    
    def _select_recommendation(self, options, context):
        """Select appropriate recommendation from options"""
        selected = random.choice(options)
        
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
        
        return sorted(insights, key=lambda x: {'high': 3, 'medium': 2, 'low': 1}[x['priority']], reverse=True)
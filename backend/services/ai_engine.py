from transformers import pipeline
import random
import pandas as pd
import numpy as np

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
        
        # Trend insights - LOWERED threshold from 0.5 to 0.3 for more insights
        for metric, trend in trends.items():
            if trend['direction'] == 'declining' and trend['strength'] > 0.3:
                severity = 'high' if trend['strength'] > 0.6 else 'medium'
                insights.append({
                    'type': 'warning' if severity == 'high' else 'trend',
                    'title': f'Declining Trend Detected',
                    'message': f'Your {metric} has been declining. It might be time to reassess your routine.',
                    'priority': severity,
                    'related_metric': metric
                })
            elif trend['direction'] == 'improving' and trend['strength'] > 0.3:
                insights.append({
                    'type': 'achievement',
                    'title': f'Improving {metric.capitalize()}',
                    'message': f'Great progress! Your {metric} is trending upward. Keep up the good work!',
                    'priority': 'medium',
                    'related_metric': metric
                })
            elif trend['direction'] == 'stable':
                insights.append({
                    'type': 'trend',
                    'title': f'Stable {metric.capitalize()}',
                    'message': f'Your {metric} has been consistent. Stability is good!',
                    'priority': 'low',
                    'related_metric': metric
                })
        
        # Pattern insights
        for pattern in patterns:
            if pattern['severity'] in ['high', 'medium']:
                insight_type = 'alert' if pattern['severity'] == 'high' else 'trend'
                insights.append({
                    'type': insight_type,
                    'title': pattern['type'].replace('_', ' ').title(),
                    'message': pattern['description'],
                    'priority': pattern['severity']
                })
        
        # Add general observations if we have recent logs
        if recent_logs and len(recent_logs) >= 3:
            import pandas as pd
            df = pd.DataFrame(recent_logs)
            
            # Sleep insights
            avg_sleep = df['sleep'].mean()
            if avg_sleep < 6.5:
                insights.append({
                    'type': 'warning',
                    'title': 'Pattern Observed: Sleep Deficiency',
                    'message': f'Irregular or insufficient sleep. Your average is {avg_sleep:.1f} hours.',
                    'priority': 'high',
                    'related_metric': 'sleep'
                })
            elif avg_sleep >= 7.5:
                insights.append({
                    'type': 'achievement',
                    'title': 'Excellent Sleep Habits',
                    'message': f'You\\\'re getting great sleep! Average: {avg_sleep:.1f} hours.',
                    'priority': 'medium',
                    'related_metric': 'sleep'
                })
            
            # Stress insights
            avg_stress = df['stress'].mean()
            if avg_stress >= 3.5:
                insights.append({
                    'type': 'alert',
                    'title': 'Elevated Stress Levels',
                    'message': 'Your stress levels are concerning. Consider stress management techniques.',
                    'priority': 'high',
                    'related_metric': 'stress'
                })
            elif avg_stress <= 2.0:
                insights.append({
                    'type': 'achievement',
                    'title': 'Zen Master',
                    'message': 'Your stress management is excellent! Keep it up.',
                    'priority': 'medium',
                    'related_metric': 'stress'
                })
        
        return sorted(insights, key=lambda x: {'high': 3, 'medium': 2, 'low': 1}[x['priority']], reverse=True)
    
    def generate_analytics_insights(self, analytics_data, health_score, correlations):
        """
        Generate natural language insights from analytics data
        
        Args:
            analytics_data: Dict with trends, patterns, etc.
            health_score: Health score dict
            correlations: Correlation analysis dict
            
        Returns:
            list of insight dicts with messages and recommendations
        """
        insights = []
        
        # Health score insight
        if health_score:
            score = health_score.get('score', 50)
            grade = health_score.get('grade', 'C')
            status = health_score.get('status', 'Fair')
            trend = health_score.get('trend', 'stable')
            
            # Main health insight
            if score >= 80:
                insights.append({
                    'type': 'achievement',
                    'title': f'Excellent Health Score: {grade}',
                    'message': f"Your overall wellness is {status.lower()} at {score:.0f}/100. You're doing great!",
                    'priority': 'high',
                    'icon': '🌟',
                    'trend': trend
                })
            elif score >= 60:
                insights.append({
                    'type': 'information',
                    'title': f'Good Health Score: {grade}',
                    'message': f"Your wellness score is {score:.0f}/100 ({status}). There's room for improvement.",
                    'priority': 'medium',
                    'icon': '📊',
                    'trend': trend
                })
            else:
                insights.append({
                    'type': 'warning',
                    'title': f'Health Score Needs Attention: {grade}',
                    'message': f"Your wellness score is {score:.0f}/100. Let's work on improving this together.",
                    'priority': 'high',
                    'icon': '⚠️',
                    'trend': trend
                })
            
            # Trend insight
            if trend == 'improving':
                insights.append({
                    'type': 'achievement',
                    'title': 'Positive Momentum Detected',
                    'message': "Your metrics are trending upward. Keep up the great work!",
                    'priority': 'medium',
                    'icon': '📈',
                    'actionable': True,
                    'action': 'Continue your current routine'
                })
            elif trend == 'declining':
                insights.append({
                    'type': 'alert',
                    'title': 'Declining Trend Detected',
                    'message': "Your wellness metrics are trending downward. It might be time to reassess your routine.",
                    'priority': 'high',
                    'icon': '📉',
                    'actionable': True,
                    'action': 'Review recent changes and stressors'
                })
        
        # Correlation insights
        if correlations and correlations.get('status') == 'success':
            corr_insights = correlations.get('insights', [])
            for ci in corr_insights[:2]:  # Top 2 correlation insights
                insights.append({
                    'type': 'discovery',
                    'title': 'Pattern Discovered',
                    'message': ci['message'],
                    'priority': 'high' if ci.get('actionable') else 'medium',
                    'icon': '🔍',
                    'actionable': ci.get('actionable', False),
                    'action': ci.get('recommendation', '')
                })
        
        # Pattern-based insights from analytics
        patterns = analytics_data.get('patterns', [])
        for pattern in patterns[:3]:  # Top 3 patterns
            severity = pattern.get('severity', 'medium')
            pattern_type = pattern.get('type', 'unknown').replace('_', ' ').title()
            
            if severity == 'high':
                insights.append({
                    'type': 'alert',
                    'title': f'Critical Pattern: {pattern_type}',
                    'message': pattern.get('description', ''),
                    'priority': 'high',
                    'icon': '🚨',
                    'actionable': True
                })
            else:
                insights.append({
                    'type': 'information',
                    'title': f'Pattern Observed: {pattern_type}',
                    'message': pattern.get('description', ''),
                    'priority': 'medium',
                    'icon': '💡'
                })
        
        # Sort by priority
        priority_order = {'high': 3, 'medium': 2, 'low': 1}
        insights.sort(key=lambda x: priority_order.get(x.get('priority', 'low'), 1), reverse=True)
        
        return insights[:8]  # Return top 8 insights
    
    def generate_recommendations(self, health_score, correlations, patterns, forecast):
        """
        Generate personalized, actionable recommendations
        
        Returns:
            list of recommendation dicts with specific actions
        """
        recommendations = []
        
        # Health score-based recommendations
        if health_score:
            score = health_score.get('score', 50)
            breakdown = health_score.get('breakdown', {})
            
            # Find weakest component
            components = {
                'mood': breakdown.get('mood_contribution', 0),
                'energy': breakdown.get('energy_contribution', 0),
                'stress': breakdown.get('stress_contribution', 0),
                'sleep': breakdown.get('sleep_contribution', 0)
            }
            
            weakest = min(components, key=components.get)
            
            if weakest == 'sleep' and components['sleep'] < 8:
                recommendations.append({
                    'category': 'Sleep',
                    'priority': 'high',
                    'title': 'Improve Sleep Quality',
                    'description': 'Sleep is your weakest health factor. Better sleep could significantly boost your overall score.',
                    'actions': [
                        'Aim for 7-9 hours of sleep per night',
                        'Establish a consistent bedtime routine',
                        'Avoid screens 1 hour before bed',
                        'Keep bedroom cool (65-68°F) and dark'
                    ],
                    'potential_impact': '+12 health points',
                    'icon': '😴'
                })
            elif weakest == 'stress' and components['stress'] < 15:
                recommendations.append({
                    'category': 'Stress Management',
                    'priority': 'high',
                    'title': 'Reduce Stress Levels',
                    'description': 'Stress is impacting your overall wellness. Managing it better could improve mood and energy.',
                    'actions': [
                        'Practice 10 minutes of meditation daily',
                        'Take regular breaks during work',
                        'Exercise 20-30 minutes, 3x per week',
                        'Try the 4-7-8 breathing technique'
                    ],
                    'potential_impact': '+15 health points',
                    'icon': '🧘'
                })
            elif weakest == 'energy' and components['energy'] < 25:
                recommendations.append({
                    'category': 'Energy Boost',
                    'priority': 'high',
                    'title': 'Increase Energy Levels',
                    'description': 'Low energy is holding you back. Small changes can make a big difference.',
                    'actions': [
                        'Eat protein-rich breakfast daily',
                        'Stay hydrated (8 glasses of water)',
                        'Take a 15-minute walk in sunlight',
                        'Limit caffeine after 2 PM'
                    ],
                    'potential_impact': '+10 health points',
                    'icon': '⚡'
                })
            elif weakest == 'mood' and components['mood'] < 20:
                recommendations.append({
                    'category': 'Mood Enhancement',
                    'priority': 'high',
                    'title': 'Boost Your Mood',
                    'description': 'Your mood could use some attention. Small positive habits can create big changes.',
                    'actions': [
                        'Practice gratitude journaling (3 things daily)',
                        'Connect with friends or family',
                        'Engage in activities you enjoy',
                        'Spend 20 minutes in nature'  
                    ],
                    'potential_impact': '+13 health points',
                    'icon': '😊'
                })
        
        # Correlation-based recommendations
        if correlations and correlations.get('status') == 'success':
            corr_insights = correlations.get('insights', [])
            for ci in corr_insights:
                if ci.get('actionable') and ci.get('type') == 'sleep_energy_link':
                    recommendations.append({
                        'category': 'Sleep-Energy Connection',
                        'priority': 'medium',
                        'title': 'Leverage Sleep-Energy Link',
                        'description': ci['message'],
                        'actions': [
                            ci.get('recommendation', 'Focus on better sleep'),
                            'Track how different sleep amounts affect your energy',
                            'Identify your optimal sleep duration'
                        ],
                        'potential_impact': 'Significant energy boost',
                        'icon': '🔗'
                    })
                    break  # Only add one correlation recommendation
        
        # Pattern-based recommendations
        if patterns:
            for pattern in patterns:
                if pattern.get('type') == 'elevated_stress' and pattern.get('severity') == 'high':
                    recommendations.append({
                        'category': 'Chronic Stress',
                        'priority': 'high',
                        'title': 'Address Prolonged Stress',
                        'description': "You've been under sustained stress. This needs attention to prevent burnout.",
                        'actions': [
                            'Identify and address major stressors',
                            'Consider talking to a counselor',
                            'Build stress-relief into daily routine',
                            'Practice saying "no" to non-essential commitments'
                        ],
                        'potential_impact': 'Critical for long-term health',
                        'icon': '🛡️'
                    })
                elif pattern.get('type') == 'weekend_effect':
                    recommendations.append({
                        'category': 'Work-Life Balance',
                        'priority': 'medium',
                        'title': 'Improve Weekday Wellness',
                        'description': 'Your metrics improve on weekends. Try bringing that balance to weekdays.',
                        'actions': [
                            'Take short breaks during work hours',
                            'Schedule enjoyable activities on weekdays',
                            'Maintain consistent sleep schedule all week',
                            'Practice work-life boundaries'
                        ],
                        'potential_impact': 'More consistent wellness',
                        'icon': '⚖️'
                    })
        
        # Forecast-based recommendations
        if forecast and forecast.get('status') == 'success':
            predictions = forecast.get('predictions', {})
            
            # Check for predicted declines
            for metric, pred_data in predictions.items():
                if pred_data.get('trend') == 'declining':
                    metric_name = metric.capitalize()
                    recommendations.append({
                        'category': 'Preventive Action',
                        'priority': 'medium',
                        'title': f'Prevent {metric_name} Decline',
                        'description': f'We predict your {metric} may decline soon. Taking action now can prevent this.',
                        'actions': [
                            f'Monitor your {metric} closely over the next week',
                            'Address any emerging stressors early',
                            'Maintain healthy routines consistently'
                        ],
                        'potential_impact': 'Prevent future issues',
                        'icon': '🔮'
                    })
                    break  # Only add one forecast recommendation
        
        return recommendations[:5]  # Return top 5 recommendations
    
    def generate_weekly_summary(self, logs_data, analytics_data):
        """
        Generate comprehensive weekly summary with highlights
        
        Returns:
            dict with summary, highlights, lowlights, achievements
        """
        if len(logs_data) < 3:
            return {
                'status': 'insufficient_data',
                'message': 'Need at least 3 days of data for weekly summary'
            }
        
        df = pd.DataFrame(logs_data)
        
        # Calculate key stats
        avg_mood = df['mood'].mean()
        avg_energy = df['energy'].mean()
        avg_stress = df['stress'].mean()
        avg_sleep = df['sleep'].mean()
        
        # Find best and worst days
        df['overall_score'] = (df['mood'] + df['energy'] + (6 - df['stress'])) / 3
        best_day_idx = df['overall_score'].idxmax()
        worst_day_idx = df['overall_score'].idxmin()
        
        # Highlights (best moments)
        highlights = []
        
        if df['mood'].max() >= 4.5:
            highlights.append(f"Peak mood of {df['mood'].max():.1f}/5 achieved!")
        
        if df['energy'].max() >= 4.5:
            highlights.append(f"Excellent energy levels (max: {df['energy'].max():.1f}/5)")
        
        if df['stress'].min() <= 1.5:
            highlights.append(f"Very low stress days recorded (min: {df['stress'].min():.1f}/5)")
        
        if avg_sleep >= 7.5:
            highlights.append(f"Great sleep average: {avg_sleep:.1f} hours/night")
        
        # Lowlights (areas for improvement)
        lowlights = []
        
        if df['stress'].max() >= 4.5:
            lowlights.append(f"High stress spike detected ({df['stress'].max():.1f}/5)")
        
        if df['mood'].min() <= 1.5:
            lowlights.append(f"Low mood day occurred ({df['mood'].min():.1f}/5)")
        
        if avg_sleep < 6.5:
            lowlights.append(f"Sleep below optimal ({avg_sleep:.1f} hours avg)")
        
        if df['energy'].min() <= 1.5:
            lowlights.append(f"Very low energy day ({df['energy'].min():.1f}/5)")
        
        # Achievements
        achievements = []
        
        # Consistency achievements
        if df['mood'].std() < 0.5:
            achievements.append({
                'title': 'Emotional Stability',
                'description': 'Maintained consistent mood all week',
                'icon': '🎯'
            })
        
        if (df['sleep'] >= 7).sum() >= len(df) * 0.7:
            achievements.append({
                'title': 'Sleep Champion',
                'description': 'Got adequate sleep most days',
                'icon': '😴'
            })
        
        if avg_stress < 2.5:
            achievements.append({
                'title': 'Zen Master',
                'description': 'Kept stress levels low all week',
                'icon': '🧘'
            })
        
        if (df[['mood', 'energy']].mean(axis=1) >= 4).sum() >= 3:
            achievements.append({
                'title': 'High Performer',
                'description': '3+ days of excellent mood & energy',
                'icon': '⚡'
            })
        
        # Overall summary
        if avg_mood >= 4 and avg_energy >= 4:
            summary = "Outstanding week! You maintained high mood and energy. Keep doing what you're doing!"
        elif avg_mood >= 3.5 and avg_energy >= 3.5:
            summary = "Solid week overall. Good balance across all metrics with room to optimize further."
        elif avg_stress >= 4:
            summary = "Stressful week detected. Consider what's driving stress and how to manage it better."
        elif avg_sleep < 6.5:
            summary = "Sleep was insufficient this week. Prioritizing rest could improve all other metrics."
        else:
            summary = "Mixed week with ups and downs. Focus on consistency and sustainable routines."
        
        return {
            'status': 'success',
            'period': f'{len(logs_data)} days',
            'summary': summary,
            'key_stats': {
                'avg_mood': round(avg_mood, 2),
                'avg_energy': round(avg_energy, 2),
                'avg_stress': round(avg_stress, 2),
                'avg_sleep': round(avg_sleep, 2),
                'days_tracked': len(logs_data)
            },
            'highlights': highlights,
            'lowlights': lowlights,
            'achievements': achievements,
            'best_day': {
                'date': df.iloc[best_day_idx].get('timestamp', 'N/A'),
                'score': round(df.iloc[best_day_idx]['overall_score'], 2)
            },
            'worst_day': {
                'date': df.iloc[worst_day_idx].get('timestamp', 'N/A'),
                'score': round(df.iloc[worst_day_idx]['overall_score'], 2)
            }
        }
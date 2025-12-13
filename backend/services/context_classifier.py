from transformers import pipeline
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import re

class ContextClassifier:
    """Intelligent context classification system"""
    
    def __init__(self):
        self.classifier = None
        self.analyzer = SentimentIntensityAnalyzer()
        self.labels = self._get_classification_labels()
        
    def initialize(self):
        """Initialize the classification model"""
        print("📚 Loading Context Classifier...")
        self.classifier = pipeline(
            "zero-shot-classification",
            model="valhalla/distilbart-mnli-12-1",
            device=-1
        )
        print("✅ Context Classifier ready")
    
    def _get_classification_labels(self):
        """Get comprehensive list of classification labels"""
        return [
            # === URGENT SAFETY ===
            "Medical Emergency", "Physical Assault", "Sexual Harassment", "Stalking", 
            "Blackmail", "Robbery", "Domestic Violence", "Child Abuse", "Ragging",
            "Bullying", "Cyberbullying", "Suicidal Ideation", "Self-Harm",
            
            # === HEALTH - URGENT ===
            "Heart Attack", "Stroke", "Severe Allergic Reaction", "Seizure",
            "Heavy Bleeding", "Head Injury", "Broken Bone", "Overdose",
            
            # === HEALTH - COMMON ===
            "Menstrual Pain", "Headache", "Migraine", "Back Pain", "Stomach Ache",
            "Food Poisoning", "Flu", "Fever", "Common Cold", "Insomnia",
            "Fatigue", "Muscle Pain", "Skin Rash", "Toothache",
            
            # === MENTAL HEALTH ===
            "Panic Attack", "High Anxiety", "Social Anxiety", "Depression",
            "Burnout", "Imposter Syndrome", "ADHD", "Stress Overload",
            "Grief", "Loneliness", "Heartbreak", "Existential Crisis",
            
            # === EMOTIONS ===
            "Anger", "Frustration", "Jealousy", "Guilt", "Shame", "Confusion",
            "Overwhelmed", "Excited", "Grateful", "Inspired", "Bored",
            
            # === ACADEMIC ===
            "Exam Stress", "Thesis Writing", "Assignment Deadline", "Group Project",
            "Academic Probation", "Teacher Conflict", "Study Abroad", 
            "College Application", "Graduation Anxiety",
            
            # === WORK & CAREER ===
            "Job Interview", "Resume Writing", "Salary Negotiation", "Getting Fired",
            "Toxic Boss", "Workplace Harassment", "Deadline Crunch", "Procrastination",
            "Career Change", "Promotion", "Work-Life Balance", "Remote Work",
            
            # === BUSINESS & FINANCE ===
            "Starting a Business", "Cash Flow Crisis", "Debt", "Investment Decision",
            "Tax Issues", "Bankruptcy", "Budget Planning", "Credit Problems",
            
            # === RELATIONSHIPS ===
            "Breakup", "Divorce", "Cheating", "Trust Issues", "Toxic Relationship",
            "Gaslighting", "Dating", "Marriage", "In-Law Conflict", "Friendship",
            "Making Friends", "Family Conflict",
            
            # === PARENTING ===
            "Pregnancy", "Postpartum Depression", "Childcare", "Teenager Issues",
            "Toddler Tantrum", "School Problems", "Parenting Stress",
            
            # === LIFESTYLE ===
            "Moving House", "Home Renovation", "Cleaning", "Decluttering",
            "Fitness Goals", "Weight Loss", "Nutrition", "Cooking",
            "Travel Planning", "Hobby", "Time Management", "Sleep Schedule",
            
            # === TECHNOLOGY ===
            "Device Issues", "Cybersecurity", "Social Media Addiction", 
            "Digital Detox", "Gaming", "Technical Problem",
            
            # === GENERAL ===
            "General Productivity", "Personal Growth", "Skill Learning",
            "Creative Block", "Decision Making", "Goal Setting"
        ]
    
    def classify(self, text):
        """Classify text into context categories"""
        if not text or len(text) < 3:
            return {
                'category': 'General Productivity',
                'confidence': 0.5,
                'urgency': 'low',
                'sentiment': self._analyze_sentiment("")
            }
        
        # Initialize classifier if needed
        if self.classifier is None:
            self.initialize()
        
        # Perform classification
        result = self.classifier(text, self.labels)
        
        category = result['labels'][0]
        confidence = result['scores'][0]
        
        # Analyze sentiment
        sentiment = self._analyze_sentiment(text)
        
        # Determine urgency
        urgency = self._determine_urgency(category, text, sentiment)
        
        # Extract keywords
        keywords = self._extract_keywords(text)
        
        return {
            'category': category,
            'confidence': round(confidence, 2),
            'urgency': urgency,
            'sentiment': sentiment,
            'keywords': keywords,
            'alternate_categories': [
                {'category': result['labels'][i], 'confidence': round(result['scores'][i], 2)}
                for i in range(1, min(3, len(result['labels'])))
            ]
        }
    
    def _analyze_sentiment(self, text):
        """Analyze sentiment of text"""
        scores = self.analyzer.polarity_scores(text)
        
        # Convert to mood score (1-5)
        mood = max(1.0, min(5.0, 3.0 + (scores['compound'] * 2.0)))
        
        if scores['compound'] >= 0.5:
            label = 'very_positive'
        elif scores['compound'] >= 0.1:
            label = 'positive'
        elif scores['compound'] <= -0.5:
            label = 'very_negative'
        elif scores['compound'] <= -0.1:
            label = 'negative'
        else:
            label = 'neutral'
        
        return {
            'label': label,
            'mood_score': round(mood, 1),
            'compound': round(scores['compound'], 2),
            'positive': round(scores['pos'], 2),
            'negative': round(scores['neg'], 2),
            'neutral': round(scores['neu'], 2)
        }
    
    def _determine_urgency(self, category, text, sentiment):
        """Determine urgency level of the situation"""
        urgent_categories = [
            "Medical Emergency", "Physical Assault", "Sexual Harassment",
            "Stalking", "Suicidal Ideation", "Self-Harm", "Heart Attack",
            "Stroke", "Seizure", "Heavy Bleeding", "Overdose"
        ]
        
        high_priority_categories = [
            "Panic Attack", "Exam Stress", "Deadline Crunch", "Job Interview",
            "Burnout", "Getting Fired", "Toxic Relationship"
        ]
        
        # Urgent keywords
        urgent_keywords = ['emergency', 'urgent', 'immediately', 'crisis', 'help', 'danger']
        
        if category in urgent_categories:
            return 'critical'
        
        if any(keyword in text.lower() for keyword in urgent_keywords):
            return 'high'
        
        if category in high_priority_categories:
            return 'high'
        
        if sentiment['label'] in ['very_negative'] and sentiment['compound'] < -0.6:
            return 'high'
        
        if sentiment['label'] in ['negative', 'very_negative']:
            return 'medium'
        
        return 'low'
    
    def _extract_keywords(self, text):
        """Extract important keywords from text"""
        # Remove common stop words
        stop_words = {'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'you', 'your',
                     'the', 'a', 'an', 'and', 'or', 'but', 'if', 'of', 'at', 'by',
                     'for', 'with', 'about', 'is', 'was', 'are', 'been', 'being'}
        
        # Extract words
        words = re.findall(r'\b[a-z]{4,}\b', text.lower())
        keywords = [w for w in words if w not in stop_words]
        
        # Get frequency
        word_freq = {}
        for word in keywords:
            word_freq[word] = word_freq.get(word, 0) + 1
        
        # Sort by frequency
        sorted_keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        
        return [word for word, freq in sorted_keywords[:5]]
    
    def get_safety_response(self, category, urgency):
        """Get appropriate safety response for critical situations"""
        if urgency == 'critical':
            return {
                'type': 'critical_safety',
                'message': 'This appears to be a critical situation. Please seek immediate help.',
                'actions': [
                    'Call emergency services (112 in India, 911 in US)',
                    'Contact a trusted person immediately',
                    'Go to a safe, public location if possible',
                    'Document evidence if safe to do so'
                ],
                'resources': self._get_safety_resources(category)
            }
        
        return None
    
    def _get_safety_resources(self, category):
        """Get relevant safety resources"""
        resources = {
            'Ragging': {
                'name': 'UGC Anti-Ragging Helpline',
                'contact': '1800-180-5522',
                'email': 'helpdeskantiragging@gmail.com'
            },
            'Sexual Harassment': {
                'name': 'Women Helpline',
                'contact': '1091',
                'alternate': '112'
            },
            'Suicidal Ideation': {
                'name': 'AASRA Suicide Prevention',
                'contact': '9820466726',
                'email': 'aasrahelpline@yahoo.com'
            },
            'Child Abuse': {
                'name': 'Childline India',
                'contact': '1098',
                'available': '24x7'
            }
        }
        
        return resources.get(category, {
            'name': 'Emergency Services',
            'contact': '112',
            'note': 'General emergency number in India'
        })
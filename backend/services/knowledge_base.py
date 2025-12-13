import wikipedia
import re

class KnowledgeBase:
    """Enhanced knowledge base with intelligent Wikipedia integration"""
    
    def __init__(self):
        self.search_map = self._build_search_map()
        self.cache = {}
        
    def _build_search_map(self):
        """Build comprehensive mapping from categories to Wikipedia articles"""
        return {
            # Safety & Legal
            "Ragging": "Ragging",
            "Hazing": "Hazing",
            "Physical Assault": "Assault",
            "Sexual Harassment": "Sexual harassment",
            "Stalking": "Stalking",
            "Blackmail": "Blackmail",
            "Cyberbullying": "Cyberbullying",
            "Domestic Violence": "Domestic violence",
            
            # Health - Physical
            "Medical Emergency": "First aid",
            "Heart Attack": "Myocardial infarction",
            "Stroke": "Stroke",
            "Seizure": "Epileptic seizure",
            "Menstrual Pain": "Dysmenorrhea",
            "Headache": "Headache",
            "Migraine": "Migraine",
            "Back Pain": "Back pain",
            "Food Poisoning": "Foodborne illness",
            "Flu": "Influenza",
            "Fever": "Fever",
            "Insomnia": "Insomnia",
            "Fatigue": "Fatigue",
            
            # Mental Health
            "Panic Attack": "Panic attack",
            "High Anxiety": "Anxiety disorder",
            "Social Anxiety": "Social anxiety disorder",
            "Depression": "Major depressive disorder",
            "Burnout": "Occupational burnout",
            "Imposter Syndrome": "Impostor syndrome",
            "PTSD": "Post-traumatic stress disorder",
            "OCD": "Obsessive–compulsive disorder",
            "ADHD": "Attention deficit hyperactivity disorder",
            "Grief": "Grief",
            "Loneliness": "Loneliness",
            
            # Academic
            "Exam Stress": "Test anxiety",
            "Thesis Writing": "Thesis",
            "Plagiarism": "Plagiarism",
            "Study Abroad": "Study abroad",
            "Academic Probation": "Academic probation",
            
            # Work & Career
            "Job Interview": "Job interview",
            "Resume Writing": "Résumé",
            "Salary Negotiation": "Negotiation",
            "Getting Fired": "Termination of employment",
            "Workplace Harassment": "Workplace harassment",
            "Procrastination": "Procrastination",
            "Work-Life Balance": "Work–life balance",
            
            # Finance
            "Starting a Business": "Entrepreneurship",
            "Cash Flow Crisis": "Cash flow",
            "Bankruptcy": "Bankruptcy",
            "Debt": "Debt",
            "Investment": "Investment",
            "Tax Issues": "Tax",
            
            # Relationships
            "Breakup": "Breakup",
            "Divorce": "Divorce",
            "Toxic Relationship": "Abusive relationship",
            "Gaslighting": "Gaslighting",
            "Dating": "Dating",
            "Marriage": "Marriage",
            
            # Parenting
            "Pregnancy": "Pregnancy",
            "Postpartum Depression": "Postpartum depression",
            "Parenting": "Parenting",
            
            # Lifestyle
            "Time Management": "Time management",
            "Fitness": "Physical fitness",
            "Nutrition": "Nutrition",
            "Meditation": "Meditation",
            "Yoga": "Yoga",
            "Sleep Schedule": "Sleep",
        }
    
    def fetch_insights(self, category):
        """Fetch relevant insights from Wikipedia"""
        # Check cache
        if category in self.cache:
            return self.cache[category]
        
        # Get search term
        search_term = self.search_map.get(category, category)
        
        insights = []
        try:
            # Search Wikipedia
            search_results = wikipedia.search(search_term, results=1)
            
            if not search_results:
                return self._fallback_response(category)
            
            # Get page
            page = wikipedia.page(search_results[0], auto_suggest=False)
            
            # Extract summary
            summary_sentences = page.summary.split('. ')
            summary = '. '.join(summary_sentences[:2]) + '.'
            
            # Extract relevant sections
            relevant_sections = self._find_relevant_sections(page, category)
            
            # Build insight
            insight = {
                'title': page.title,
                'summary': self._clean_text(summary),
                'sections': relevant_sections,
                'url': page.url,
                'last_updated': 'Recent'
            }
            
            insights.append(insight)
            
            # Cache the result
            self.cache[category] = insights
            
        except wikipedia.exceptions.DisambiguationError as e:
            # Handle disambiguation
            try:
                page = wikipedia.page(e.options[0], auto_suggest=False)
                summary = '. '.join(page.summary.split('. ')[:2]) + '.'
                insights.append({
                    'title': page.title,
                    'summary': self._clean_text(summary),
                    'sections': [],
                    'url': page.url,
                    'last_updated': 'Recent'
                })
            except:
                return self._fallback_response(category)
                
        except Exception as e:
            print(f"Error fetching insights for {category}: {e}")
            return self._fallback_response(category)
        
        return insights
    
    def _find_relevant_sections(self, page, category):
        """Find and extract relevant sections from Wikipedia page"""
        relevant_keywords = [
            'treatment', 'management', 'coping', 'prevention', 'help',
            'support', 'symptoms', 'causes', 'therapy', 'strategies',
            'techniques', 'solutions', 'advice', 'guidelines'
        ]
        
        relevant_sections = []
        
        for section in page.sections:
            section_lower = section.lower()
            
            # Check if section is relevant
            if any(keyword in section_lower for keyword in relevant_keywords):
                try:
                    content = page.section(section)
                    if content and len(content) > 50:
                        # Extract key points
                        cleaned = self._clean_text(content)
                        sentences = cleaned.split('. ')
                        
                        # Take first 2-3 sentences
                        section_summary = '. '.join(sentences[:3]) + '.'
                        
                        relevant_sections.append({
                            'title': section,
                            'content': section_summary[:500]  # Limit length
                        })
                        
                        # Only include top 3 sections
                        if len(relevant_sections) >= 3:
                            break
                except:
                    continue
        
        return relevant_sections
    
    def _clean_text(self, text):
        """Clean Wikipedia text"""
        # Remove citations
        text = re.sub(r'\[\d+\]', '', text)
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove incomplete sentences at the end
        if not text.endswith('.'):
            last_period = text.rfind('.')
            if last_period > 0:
                text = text[:last_period + 1]
        return text.strip()
    
    def _fallback_response(self, category):
        """Provide fallback response when Wikipedia fails"""
        return [{
            'title': f'Information about {category}',
            'summary': f'For detailed information about {category}, please consult reliable online resources or professional help.',
            'sections': [{
                'title': 'Resources',
                'content': 'Consider searching reputable medical, educational, or professional websites for accurate information.'
            }],
            'url': f'https://www.google.com/search?q={category.replace(" ", "+")}',
            'last_updated': 'N/A'
        }]
    
    def get_related_resources(self, category):
        """Get additional resources related to the category"""
        resources = {
            'mental_health': [
                {'name': 'National Mental Health Helpline', 'contact': 'Kiran: 1800-599-0019', 'type': 'phone'},
                {'name': 'NIMHANS Helpline', 'contact': '080-46110007', 'type': 'phone'},
                {'name': 'Vandrevala Foundation', 'contact': '1860-2662-345', 'type': 'phone'}
            ],
            'safety': [
                {'name': 'Police Emergency', 'contact': '100', 'type': 'phone'},
                {'name': 'Women Helpline', 'contact': '1091', 'type': 'phone'},
                {'name': 'National Emergency Number', 'contact': '112', 'type': 'phone'}
            ],
            'health': [
                {'name': 'Medical Emergency', 'contact': '102', 'type': 'phone'},
                {'name': 'Ambulance Service', 'contact': '108', 'type': 'phone'},
                {'name': 'WHO India', 'url': 'https://www.who.int/india', 'type': 'website'}
            ],
            'academic': [
                {'name': 'UGC Student Helpline', 'contact': '1800-180-5522', 'type': 'phone'},
                {'name': 'AICTE Grievance Portal', 'url': 'https://www.aicte-india.org', 'type': 'website'}
            ]
        }
        
        # Determine resource category
        mental_keywords = ['anxiety', 'depression', 'stress', 'panic', 'mental']
        safety_keywords = ['assault', 'harassment', 'violence', 'stalking', 'ragging']
        health_keywords = ['pain', 'medical', 'emergency', 'health', 'sick']
        academic_keywords = ['exam', 'thesis', 'academic', 'study', 'college']
        
        category_lower = category.lower()
        
        if any(k in category_lower for k in mental_keywords):
            return resources['mental_health']
        elif any(k in category_lower for k in safety_keywords):
            return resources['safety']
        elif any(k in category_lower for k in health_keywords):
            return resources['health']
        elif any(k in category_lower for k in academic_keywords):
            return resources['academic']
        
        return []
    
    def search_additional_context(self, keywords):
        """Search for additional context using keywords"""
        if not keywords:
            return []
        
        results = []
        for keyword in keywords[:2]:  # Limit to 2 keywords
            try:
                pages = wikipedia.search(keyword, results=1)
                if pages:
                    page = wikipedia.page(pages[0], auto_suggest=False)
                    results.append({
                        'keyword': keyword,
                        'title': page.title,
                        'snippet': '. '.join(page.summary.split('. ')[:1]) + '.',
                        'url': page.url
                    })
            except:
                continue
        
        return results
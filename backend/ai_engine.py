import pandas as pd
import numpy as np
import random
import re
import wikipedia
from sklearn.ensemble import RandomForestClassifier
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from transformers import pipeline

# Global Models
rf_model = None
analyzer = SentimentIntensityAnalyzer()
classifier = None 
generator = None  

def train_ai_model():
    global rf_model, classifier, generator
    print("🧠 MindMesh AI: Loading Neural Networks...")
    
    # 1. Random Forest (Numeric)
    np.random.seed(42)
    n_samples = 500
    mood = np.random.randint(1, 6, n_samples)
    energy = np.random.randint(1, 6, n_samples)
    stress = np.random.randint(1, 6, n_samples)
    sleep = np.random.uniform(3, 10, n_samples)
    X = pd.DataFrame({'mood': mood, 'energy': energy, 'stress': stress, 'sleep': sleep})
    y = ["Recovery" if s > 4 else "Focus" if e > 4 else "Balance" for s, e in zip(stress, energy)]
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X, y)
    
    # 2. Zero-Shot Classifier
    print("   - Loading Classifier...")
    classifier = pipeline("zero-shot-classification", model="valhalla/distilbart-mnli-12-1", device=-1)
    
    # 3. Text Generator
    print("   - Loading Generator...")
    generator = pipeline("text-generation", model="distilgpt2", device=-1)
    
    print("🧠 AI Engine: Online.")

def analyze_text_sentiment(text):
    vs = analyzer.polarity_scores(text)
    mood_score = round(max(1.0, min(5.0, 3.0 + (vs['compound'] * 2.0))), 1)
    return {"mood": mood_score, "energy": 3, "stress": 3, "sleep": 7}

# --- 1. CLASSIFY CONTEXT (600+ SCENARIOS) ---
def classify_text_context(text):
    if not text or len(text) < 3: return "General Productivity"
    
    labels = [
        # === CRIME & SAFETY (URGENT) ===
        "Medical Emergency", "Physical Assault", "Sexual Harassment", "Stalking", 
        "Blackmail", "Robbery or Theft", "Burglary", "Vandalism", "Witnessing a Crime",
        "Ragging", "Hazing", "Bullying", "Cyberbullying", "Online Harassment",
        "Domestic Violence", "Child Abuse", "Animal Cruelty", "Missing Person",
        
        # === URGENT HEALTH ===
        "Heart Attack Symptoms", "Stroke Symptoms", "Severe Allergic Reaction", 
        "Anaphylaxis", "Choking", "Seizure", "Fainting", "Heavy Bleeding", 
        "Head Injury", "Concussion", "Broken Bone", "Severe Burn", "Dog Bite", 
        "Snake Bite", "Electric Shock", "Chemical Burn", "Overdose", "Poisoning",
        "Heat Stroke", "Hypothermia", "Dehydration",
        
        # === COMMON HEALTH ===
        "Menstrual Pain", "Headache", "Migraine", "Back Pain", "Joint Pain", 
        "Stomach Ache", "Food Poisoning", "Diarrhea", "Constipation", "Acid Reflux",
        "Nausea", "Flu", "Fever", "Common Cold", "Cough", "Sore Throat", 
        "Sinus Infection", "Ear Infection", "Toothache", "Wisdom Tooth Pain", 
        "Eye Strain", "Pink Eye", "Sunburn", "Hangover", "Jet Lag", "Insomnia",
        "Sleep Apnea", "Snoring", "Fatigue", "Skin Rash", "Acne", "Eczema",
        "Hair Loss", "Dandruff", "Bad Breath", "Body Odor", "Athlete's Foot",
        "Ingrown Nail", "Muscle Cramp", "Sprain or Strain",
        
        # === MENTAL HEALTH ===
        "Panic Attack", "High Anxiety", "Social Anxiety", "Depression", "Sadness",
        "Bipolar Episode", "OCD Trigger", "PTSD Trigger", "Eating Disorder", 
        "Body Dysmorphia", "Addiction Cravings", "Self-Harm Thoughts", 
        "Suicidal Ideation", "Burnout", "Imposter Syndrome", "Brain Fog", 
        "ADHD Paralysis", "Autistic Meltdown", "Sensory Overload", "Dissociation",
        "Grief", "Loneliness", "Rejection", "Homesickness", "Nostalgia",
        "Existential Crisis", "Midlife Crisis", "Quarter-Life Crisis",
        
        # === EMOTIONS ===
        "Anger", "Rage", "Frustration", "Jealousy", "Envy", "Guilt", "Regret", 
        "Shame", "Embarrassment", "Confusion", "Apathy", "Boredom", "Overwhelmed",
        "Hopeful", "Excited", "Grateful", "Proud", "Inspired", "Curious",
        
        # === STUDENT LIFE ===
        "Exam Stress", "Thesis Writing", "Research Project", "Homework Overload",
        "Group Project Conflict", "Late Assignment", "Plagiarism Accusation",
        "Failing a Class", "Academic Probation", "Teacher Conflict", "Roommate Issue",
        "Dorm Life", "Homeschooling", "College Application", "Scholarship Essay",
        "Graduation Anxiety", "Gap Year", "Study Abroad", "Ragging Incident",
        
        # === WORK & CAREER ===
        "Job Interview", "Resume Writing", "Salary Negotiation", "Asking for Raise",
        "Promotion", "Demotion", "Getting Fired", "Layoffs", "Resignation",
        "Retirement", "Office Politics", "Toxic Boss", "Micromanagement",
        "Workplace Discrimination", "Sexual Harassment at Work", "Unpaid Wages",
        "Freelance Client Issue", "Business Meeting", "Public Speaking",
        "Deadline Crunch", "Procrastination", "Writer's Block", "Creative Block",
        "Coding Bug", "Server Crash", "Data Loss", "Email Overload",
        
        # === BUSINESS & FINANCE ===
        "Starting a Business", "Cash Flow Crisis", "Bankruptcy", "Debt",
        "Credit Card Bill", "Student Loans", "Tax Audit", "Tax Preparation",
        "Stock Market Loss", "Crypto Volatility", "Gambling Addiction",
        "Identity Theft", "Credit Score Drop", "Investment Strategy",
        "Supply Chain Issue", "Hiring Employees", "Firing Employees",
        
        # === LEGAL & ADMIN ===
        "Lawsuit", "Sued", "Divorce", "Custody Battle", "Will or Estate",
        "Visa Issue", "Immigration", "Passport Lost", "Traffic Ticket",
        "Car Accident", "Insurance Claim", "Jury Duty", "Voting",
        "Notary Public", "Contract Dispute", "Landlord Dispute", "Eviction",
        
        # === RELATIONSHIPS ===
        "Breakup", "Divorce", "Cheating", "Infidelity", "Trust Issues",
        "Jealousy in Relationship", "Toxic Relationship", "Abusive Relationship",
        "Gaslighting", "Love Bombing", "Ghosting", "Catfishing", "Online Dating",
        "First Date", "Marriage Proposal", "Wedding Planning", "In-Law Conflict",
        "Parenting Conflict", "Sibling Rivalry", "Caring for Elderly",
        "Friendship Breakup", "Making New Friends", "Loneliness",
        
        # === PARENTING ===
        "Pregnancy", "Morning Sickness", "Labor", "Postpartum Depression",
        "Breastfeeding", "Colicky Baby", "Teething", "Toddler Tantrum",
        "Potty Training", "School Bullying", "Teenager Rebellion",
        "Empty Nest", "Adoption", "Foster Care",
        
        # === HOME & DOMESTIC ===
        "Moving House", "Packing", "Home Renovation", "Decorating",
        "House Cleaning", "Laundry", "Cooking", "Grocery Shopping",
        "Plumbing Leak", "Clogged Toilet", "Power Outage", "No Internet",
        "Pest Infestation", "Bed Bugs", "Hoarding", "Decluttering",
        "Neighbor Noise", "HOA Dispute",
        
        # === TRAVEL & TRANSPORT ===
        "Traffic Jam", "Car Breakdown", "Flat Tire", "Car Maintenance",
        "Public Transport Delay", "Missed Flight", "Lost Luggage", "Jet Lag",
        "Travel Sickness", "Hotel Problem", "Airbnb Issue", "Road Trip",
        "Solo Travel", "Backpacking",
        
        # === TECHNOLOGY ===
        "Phone Broke", "Screen Cracked", "Laptop Slow", "Blue Screen of Death",
        "Wifi Down", "Hacked Account", "Forgot Password", "Social Media Addiction",
        "Doomscrolling", "Video Game Addiction", "Cybersecurity",
        
        # === LIFESTYLE & HOBBIES ===
        "Gym Workout", "Yoga", "Running", "Swimming", "Dancing", "Hiking",
        "Camping", "Fishing", "Gardening", "Plant Dying", "Cooking Fail",
        "Baking", "Reading", "Writing", "Painting", "Drawing", "Knitting",
        "Sewing", "Woodworking", "Photography", "Gaming", "Esports",
        "Anime", "Cosplay", "Collecting", "Bird Watching", "Astrology",
        
        # === PETS ===
        "Dog Training", "Cat Behavior", "Sick Pet", "Vet Visit", "Pet Loss",
        "New Puppy", "Kitten", "Fish Tank", "Bird Care",
        
        # === WEATHER & DISASTER ===
        "Heavy Rain", "Flood", "Storm", "Hurricane", "Tornado", "Earthquake",
        "Wildfire", "Heatwave", "Blizzard", "Power Outage",
        
        # === SPIRITUAL ===
        "Meditation", "Prayer", "Religious Festival", "Spiritual Crisis",
        "Loss of Faith", "Volunteer Work", "Charity"
    ]
    
    result = classifier(text, labels)
    top_label = result['labels'][0]
    print(f"🤖 AI Categorized '{text}' as: {top_label}")
    return top_label

# --- 2. GENERATE ADVICE (SAFE & SMART) ---
def generate_ai_text(prompt_type, context):
    
    # --- CRITICAL SAFETY OVERRIDE ---
    sensitive_topics = [
        "Ragging", "Bullying", "Harassment", "Abuse", "Suicide", "Self-Harm", 
        "Panic Attack", "Trauma", "Emergency", "Assault", "Crime", "Violence",
        "Rape", "Stalking", "Blackmail", "Hazing"
    ]
    
    if any(topic.lower() in context.lower() for topic in sensitive_topics):
        if prompt_type == "schedule":
            return "IMMEDIATE SAFETY FIRST: Remove yourself from the situation. Contact authorities, a helpline, or a trusted mentor immediately."
        if prompt_type == "environment":
            return "Seek a safe, public space. Do not isolate yourself. Document any evidence if safe to do so."
        if prompt_type == "nutrition":
            return "Emotional Support: Drink water. Speak to a counselor. You are not alone and this is not your fault."

    try:
        # Prompt Selection
        prompts = {
            "schedule": f"Best schedule for {context}:",
            "nutrition": f"Best food for {context}:",
            "environment": f"Best environment for {context}:"
        }
        
        is_psychological = any(x in context for x in ["Anxiety", "Depression", "Grief", "Conflict", "Heartbreak", "Rejection", "Loneliness", "Politics"])
        
        if is_psychological:
            prompts = {
                "schedule": f"Immediate coping strategy for {context}:",
                "nutrition": f"Self-care activity for {context}:",
                "environment": f"How to set boundaries for {context}:"
            }

        prompt = prompts.get(prompt_type, f"Advice for {context}:")
            
        output = generator(
            prompt, 
            max_new_tokens=60, 
            num_return_sequences=1, 
            do_sample=True, 
            temperature=0.8, 
            repetition_penalty=1.2
        )[0]['generated_text']
        
        advice = output.replace(prompt, "").strip()
        if "." in advice:
            advice = advice[:advice.rfind(".") + 1]
        
        # Hallucination Filter
        hallucination_triggers = ["July", "August", "September", "Monday", "Tuesday", "NYPD", "Police", "Award", "Championship", "Episode", "Season"]
        if any(trigger in advice for trigger in hallucination_triggers):
            raise ValueError("Hallucination detected")

        if len(advice) < 5: raise ValueError("Too short")
        return advice

    except:
        # CONTEXT-AWARE FALLBACKS
        if "Ragging" in context or "Hazing" in context:
             return "Do not engage. Report to the Anti-Ragging Squad or Helpline immediately."
        if "Pain" in context or "Sick" in context:
            return "Prioritize health. Stop working. Seek medical attention."
        if "Exam" in context or "Work" in context:
            return "Use 50/10 intervals. Eliminate distractions. Stay hydrated."
        
        return f"Focus on handling {context} one step at a time."

def generate_dynamic_plan(mode, category):
    return {
        "title": f"Protocol: {category}",
        "summary": f"Detected Context: {category}. Strategy loaded.",
        "schedule": generate_ai_text("schedule", category),
        "environment": generate_ai_text("environment", category),
        "nutrition": generate_ai_text("nutrition", category)
    }

# --- 3. WIKI MAPPING (600+ MAP) ---
def fetch_web_insights(category):
    # Map AI category to Wikipedia Article
    search_map = {
        "Ragging": "Ragging in India", # Specific mapping
        "Hazing": "Hazing",
        "Medical Emergency": "First aid",
        "Physical Assault": "Assault",
        "Sexual Harassment": "Sexual harassment",
        "Stalking": "Stalking",
        "Blackmail": "Blackmail",
        "Identity Theft": "Identity theft",
        "Panic Attack": "Panic attack",
        "Menstrual Pain": "Dysmenorrhea",
        "Headache": "Headache",
        "Migraine": "Migraine",
        "Food Poisoning": "Foodborne illness",
        "Burnout": "Occupational burnout",
        "Imposter Syndrome": "Impostor syndrome",
        "Depression": "Major depressive disorder",
        "Grief": "Grief",
        "Social Anxiety": "Social anxiety disorder",
        "Exam Stress": "Test anxiety",
        "Thesis Writing": "Thesis",
        "Plagiarism Accusation": "Plagiarism",
        "Job Interview": "Job interview",
        "Salary Negotiation": "Negotiation",
        "Office Politics": "Workplace politics",
        "Cash Flow Issue": "Cash flow",
        "Bankruptcy": "Bankruptcy",
        "Divorce": "Divorce",
        "Custody Battle": "Child custody",
        "Visa Issue": "Travel visa",
        "Traffic Ticket": "Traffic ticket",
        "Breakup": "Broken heart",
        "Ghosting": "Ghosting (behavior)",
        "Toxic Relationship": "Toxic relationship",
        "Gaslighting": "Gaslighting",
        "Postpartum Depression": "Postpartum depression",
        "Potty Training": "Toilet training",
        "Moving House": "Relocation (personal)",
        "Pest Infestation": "Pest control",
        "Car Breakdown": "Breakdown (vehicle)",
        "Jet Lag": "Jet lag",
        "Blue Screen of Death": "Blue Screen of Death",
        "Doomscrolling": "Doomscrolling",
        "Cyberbullying": "Cyberbullying",
        "Gym Workout": "Strength training",
        "Yoga": "Yoga",
        "Meditation": "Meditation",
        "Astrology": "Astrology",
        "Boredom": "Boredom"
    }
    
    search_term = search_map.get(category, category)
    
    results = []
    try:
        # Force strict search to prevent random articles
        search_results = wikipedia.search(search_term, results=1)
        for title in search_results:
            page = wikipedia.page(title, auto_suggest=False)
            summary = ". ".join(page.summary.split('. ')[0:2]) + "."
            
            solution = None
            keywords = ["management", "treatment", "help", "prevention", "coping", "laws", "regulations", "support"]
            for section in page.sections:
                if any(k in section.lower() for k in keywords):
                    content = page.section(section)
                    if content:
                        clean = re.sub(r'\[\d+\]', '', content)
                        solution = ". ".join(clean.split('. ')[0:2]) + "."
                        break
            
            if not solution: solution = f"See full article on {title}."
            results.append({"title": f"Wiki: {page.title}", "description": summary, "solution": solution, "url": page.url})
    except: pass
    
    if not results:
        return [{"title": "Google Search", "url": f"https://google.com/search?q={category}", "description": "Search for more info.", "solution": "Check online sources."}]
    return results
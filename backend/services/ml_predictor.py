import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
import joblib
import os

class MLPredictor:
    """Machine Learning Predictor for capacity and patterns"""
    
    def __init__(self):
        self.capacity_model = None
        self.mode_classifier = None
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def train_models(self, historical_data=None):
        """Train ML models on historical data or synthetic data"""
        print("🧠 Training ML Models...")
        
        if historical_data is None or len(historical_data) < 50:
            # Generate synthetic training data
            historical_data = self._generate_synthetic_data(1000)
        
        # Prepare features
        X = historical_data[['mood', 'energy', 'stress', 'sleep']]
        
        # Train Capacity Predictor (Regression)
        y_capacity = historical_data['capacity']
        self.capacity_model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=4,
            random_state=42
        )
        X_scaled = self.scaler.fit_transform(X)
        self.capacity_model.fit(X_scaled, y_capacity)
        
        # Train Mode Classifier
        y_mode = historical_data['recommended_mode']
        self.mode_classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.mode_classifier.fit(X_scaled, y_mode)
        
        self.is_trained = True
        print("✅ ML Models trained successfully")
        
    def _generate_synthetic_data(self, n_samples):
        """Generate synthetic training data"""
        np.random.seed(42)
        
        mood = np.random.uniform(1, 5, n_samples)
        energy = np.random.uniform(1, 5, n_samples)
        stress = np.random.uniform(1, 5, n_samples)
        sleep = np.random.uniform(4, 10, n_samples)
        
        # Calculate capacity (0-100)
        capacity = (
            (mood * 0.25) +
            (energy * 0.35) +
            ((6 - stress) * 0.25) +  # Inverse stress
            (np.minimum(sleep, 8) / 8 * 0.15)  # Optimal sleep is 8 hours
        ) * 20  # Scale to 0-100
        
        # Determine recommended mode
        modes = []
        for m, e, s in zip(mood, energy, stress):
            if s >= 4:
                modes.append("Recovery")
            elif e >= 4 and m >= 4:
                modes.append("Peak Performance")
            elif e <= 2:
                modes.append("Rest")
            else:
                modes.append("Balanced Focus")
        
        return pd.DataFrame({
            'mood': mood,
            'energy': energy,
            'stress': stress,
            'sleep': sleep,
            'capacity': capacity,
            'recommended_mode': modes
        })
    
    def predict_capacity(self, mood, energy, stress, sleep):
        """Predict user's current capacity (0-100)"""
        if not self.is_trained:
            self.train_models()
        
        features = np.array([[mood, energy, stress, sleep]])
        features_scaled = self.scaler.transform(features)
        capacity = self.capacity_model.predict(features_scaled)[0]
        
        return max(0, min(100, capacity))
    
    def predict_mode(self, mood, energy, stress, sleep):
        """Predict recommended operational mode"""
        if not self.is_trained:
            self.train_models()
        
        features = np.array([[mood, energy, stress, sleep]])
        features_scaled = self.scaler.transform(features)
        mode = self.mode_classifier.predict(features_scaled)[0]
        probabilities = self.mode_classifier.predict_proba(features_scaled)[0]
        confidence = max(probabilities)
        
        return {
            'mode': mode,
            'confidence': round(confidence, 2),
            'all_modes': dict(zip(self.mode_classifier.classes_, probabilities))
        }
    
    def analyze_trends(self, logs_data):
        """Analyze trends from historical logs"""
        if len(logs_data) < 3:
            return {
                'status': 'insufficient_data',
                'message': 'Need at least 3 days of data for trend analysis'
            }
        
        df = pd.DataFrame(logs_data)
        
        trends = {
            'mood': self._calculate_trend(df['mood']),
            'energy': self._calculate_trend(df['energy']),
            'stress': self._calculate_trend(df['stress']),
            'sleep': self._calculate_trend(df['sleep'])
        }
        
        # Detect patterns
        patterns = self._detect_patterns(df)
        
        # Calculate averages
        averages = {
            'mood': round(df['mood'].mean(), 1),
            'energy': round(df['energy'].mean(), 1),
            'stress': round(df['stress'].mean(), 1),
            'sleep': round(df['sleep'].mean(), 1)
        }
        
        return {
            'status': 'success',
            'trends': trends,
            'patterns': patterns,
            'averages': averages,
            'data_points': len(df)
        }
    
    def _calculate_trend(self, series):
        """Calculate trend direction and strength"""
        if len(series) < 2:
            return {'direction': 'stable', 'strength': 0}
        
        # Simple linear regression
        x = np.arange(len(series))
        coeffs = np.polyfit(x, series, 1)
        slope = coeffs[0]
        
        # Classify trend
        if abs(slope) < 0.1:
            direction = 'stable'
        elif slope > 0:
            direction = 'improving'
        else:
            direction = 'declining'
        
        strength = min(abs(slope), 1.0)
        
        return {
            'direction': direction,
            'strength': round(strength, 2),
            'slope': round(slope, 3)
        }
    
    def _detect_patterns(self, df):
        """Detect behavioral patterns"""
        patterns = []
        
        # Pattern 1: Consistent low energy
        if (df['energy'] <= 2).sum() >= len(df) * 0.4:
            patterns.append({
                'type': 'chronic_low_energy',
                'severity': 'high',
                'description': 'Consistently low energy levels detected'
            })
        
        # Pattern 2: High stress periods
        if (df['stress'] >= 4).sum() >= len(df) * 0.5:
            patterns.append({
                'type': 'elevated_stress',
                'severity': 'high',
                'description': 'Prolonged periods of high stress'
            })
        
        # Pattern 3: Poor sleep
        if (df['sleep'] < 6).sum() >= len(df) * 0.3:
            patterns.append({
                'type': 'sleep_deficiency',
                'severity': 'medium',
                'description': 'Irregular or insufficient sleep'
            })
        
        # Pattern 4: Weekend effect
        if 'timestamp' in df.columns:
            df['day_of_week'] = pd.to_datetime(df['timestamp']).dt.dayofweek
            weekday_mood = df[df['day_of_week'] < 5]['mood'].mean()
            weekend_mood = df[df['day_of_week'] >= 5]['mood'].mean()
            
            if weekend_mood - weekday_mood > 0.5:
                patterns.append({
                    'type': 'weekend_effect',
                    'severity': 'low',
                    'description': 'Significant mood improvement on weekends'
                })
        
        return patterns
    
    def calculate_decision_capacity(self, recent_logs):
        """Calculate capacity for making strategic decisions"""
        if len(recent_logs) < 3:
            return {
                'capacity': 50,
                'confidence': 'low',
                'message': 'Limited historical data. Using default capacity.'
            }
        
        df = pd.DataFrame(recent_logs)
        
        # Weight recent data more heavily
        weights = np.linspace(0.5, 1.0, len(df))
        
        avg_mood = np.average(df['mood'], weights=weights)
        avg_energy = np.average(df['energy'], weights=weights)
        avg_stress = np.average(df['stress'], weights=weights)
        avg_sleep = np.average(df['sleep'], weights=weights)
        
        # Calculate capacity
        capacity = self.predict_capacity(avg_mood, avg_energy, avg_stress, avg_sleep)
        
        # Determine confidence
        variability = df[['mood', 'energy', 'stress']].std().mean()
        if variability < 0.5:
            confidence = 'high'
        elif variability < 1.0:
            confidence = 'medium'
        else:
            confidence = 'low'
        
        # Generate message
        if capacity >= 75:
            message = 'Your capacity is excellent. Good time for major decisions.'
        elif capacity >= 50:
            message = 'Your capacity is moderate. Consider the timing carefully.'
        else:
            message = 'Your capacity is low. Consider postponing major decisions.'
        
        return {
            'capacity': round(capacity, 1),
            'confidence': confidence,
            'message': message,
            'context': {
                'avg_mood': round(avg_mood, 1),
                'avg_energy': round(avg_energy, 1),
                'avg_stress': round(avg_stress, 1),
                'avg_sleep': round(avg_sleep, 1)
            }
        }
    
    def save_models(self, directory='models'):
        """Save trained models to disk"""
        if not os.path.exists(directory):
            os.makedirs(directory)
        
        if self.is_trained:
            joblib.dump(self.capacity_model, f'{directory}/capacity_model.pkl')
            joblib.dump(self.mode_classifier, f'{directory}/mode_classifier.pkl')
            joblib.dump(self.scaler, f'{directory}/scaler.pkl')
            print(f"✅ Models saved to {directory}/")
    
    def load_models(self, directory='models'):
        """Load trained models from disk"""
        try:
            self.capacity_model = joblib.load(f'{directory}/capacity_model.pkl')
            self.mode_classifier = joblib.load(f'{directory}/mode_classifier.pkl')
            self.scaler = joblib.load(f'{directory}/scaler.pkl')
            self.is_trained = True
            print(f"✅ Models loaded from {directory}/")
            return True
        except FileNotFoundError:
            print(f"❌ Models not found in {directory}/. Will train on first use.")
            return False
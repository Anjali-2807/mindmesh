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
    
    def calculate_health_score(self, logs_data):
        """
        Calculate comprehensive health score (0-100) based on multiple factors
        
        Args:
            logs_data: List of log dictionaries with mood, energy, stress, sleep
            
        Returns:
            dict with score, grade, breakdown, and trend
        """
        if len(logs_data) < 3:
            return {
                'score': 50,
                'grade': 'C',
                'confidence': 'low',
                'message': 'Insufficient data for accurate health scoring'
            }
        
        df = pd.DataFrame(logs_data)
        
        # Recent weighted averages (last 7 days weighted more)
        weights = np.linspace(0.5, 1.0, min(len(df), 30))[-len(df):]
        
        avg_mood = np.average(df['mood'], weights=weights)
        avg_energy = np.average(df['energy'], weights=weights)
        avg_stress = np.average(df['stress'], weights=weights)
        avg_sleep = np.average(df['sleep'], weights=weights)
        
        # Component scores (0-100 scale)
        mood_score = (avg_mood / 5.0) * 100
        energy_score = (avg_energy / 5.0) * 100
        stress_score = ((6 - avg_stress) / 5.0) * 100  # Inverted
        
        # Sleep score with optimal range (7-9 hours)
        if 7 <= avg_sleep <= 9:
            sleep_score = 100
        elif avg_sleep < 7:
            sleep_score = max(0, (avg_sleep / 7.0) * 100)
        else:
            sleep_score = max(0, 100 - ((avg_sleep - 9) * 10))
        
        # Consistency bonus (reward stable metrics)
        consistency_factor = 1.0
        if len(df) >= 7:
            variability = df[['mood', 'energy', 'stress']].std().mean()
            if variability < 0.5:
                consistency_factor = 1.1  # 10% bonus for consistency
            elif variability > 1.5:
                consistency_factor = 0.9  # 10% penalty for high variability
        
        # Weighted health score
        health_score = (
            mood_score * 0.30 +
            energy_score * 0.35 +
            stress_score * 0.25 +
            sleep_score * 0.10
        ) * consistency_factor
        
        health_score = max(0, min(100, health_score))
        
        # Grade assignment
        if health_score >= 90:
            grade = 'A+'
            status = 'Excellent'
        elif health_score >= 80:
            grade = 'A'
            status = 'Very Good'
        elif health_score >= 70:
            grade = 'B'
            status = 'Good'
        elif health_score >= 60:
            grade = 'C'
            status = 'Fair'
        elif health_score >= 50:
            grade = 'D'
            status = 'Needs Attention'
        else:
            grade = 'F'
            status = 'Critical'
        
        # Calculate trend (comparing recent vs older data)
        trend = 'stable'
        if len(df) >= 14:
            recent_avg = df.tail(7)['mood'].mean()
            older_avg = df.head(7)['mood'].mean()
            diff = recent_avg - older_avg
            if diff > 0.3:
                trend = 'improving'
            elif diff < -0.3:
                trend = 'declining'
        
        return {
            'score': round(health_score, 1),
            'grade': grade,
            'status': status,
            'trend': trend,
            'breakdown': {
                'mood_contribution': round(mood_score * 0.30, 1),
                'energy_contribution': round(energy_score * 0.35, 1),
                'stress_contribution': round(stress_score * 0.25, 1),
                'sleep_contribution': round(sleep_score * 0.10, 1),
                'consistency_bonus': round((consistency_factor - 1.0) * 100, 1)
            },
            'confidence': 'high' if len(df) >= 14 else 'medium' if len(df) >= 7 else 'low'
        }
    
    def detect_correlations(self, logs_data):
        """
        Detect statistical correlations between different metrics
        
        Returns:
            dict with correlation coefficients and insights
        """
        if len(logs_data) < 7:
            return {
                'status': 'insufficient_data',
                'message': 'Need at least 7 days of data for correlation analysis'
            }
        
        df = pd.DataFrame(logs_data)
        
        # Calculate correlation matrix
        metrics = ['mood', 'energy', 'stress', 'sleep']
        corr_matrix = df[metrics].corr()
        
        # Extract meaningful correlations
        correlations = []
        insights = []
        
        # Mood-Energy correlation
        mood_energy_corr = corr_matrix.loc['mood', 'energy']
        correlations.append({
            'metrics': ['mood', 'energy'],
            'coefficient': round(mood_energy_corr, 3),
            'strength': self._classify_correlation_strength(mood_energy_corr),
            'direction': 'positive' if mood_energy_corr > 0 else 'negative'
        })
        
        if abs(mood_energy_corr) > 0.5:
            insights.append({
                'type': 'strong_correlation',
                'message': f"Your mood and energy are {'strongly' if abs(mood_energy_corr) > 0.7 else 'moderately'} correlated. When one improves, the other tends to follow.",
                'actionable': True,
                'recommendation': 'Focus on boosting either metric to positively impact both.'
            })
        
        # Sleep-Energy correlation
        sleep_energy_corr = corr_matrix.loc['sleep', 'energy']
        correlations.append({
            'metrics': ['sleep', 'energy'],
            'coefficient': round(sleep_energy_corr, 3),
            'strength': self._classify_correlation_strength(sleep_energy_corr),
            'direction': 'positive' if sleep_energy_corr > 0 else 'negative'
        })
        
        if sleep_energy_corr > 0.4:
            avg_sleep = df['sleep'].mean()
            if avg_sleep < 7:
                insights.append({
                    'type': 'sleep_energy_link',
                    'message': f"Your sleep significantly affects energy ({int(abs(sleep_energy_corr)*100)}% correlation). You're averaging {avg_sleep:.1f} hours.",
                    'actionable': True,
                    'recommendation': 'Aim for 7-9 hours of sleep to boost energy levels.'
                })
        
        # Stress-Mood correlation
        stress_mood_corr = corr_matrix.loc['stress', 'mood']
        correlations.append({
            'metrics': ['stress', 'mood'],
            'coefficient': round(stress_mood_corr, 3),
            'strength': self._classify_correlation_strength(abs(stress_mood_corr)),
            'direction': 'positive' if stress_mood_corr > 0 else 'negative'
        })
        
        if stress_mood_corr < -0.4:
            insights.append({
                'type': 'stress_mood_impact',
                'message': f"High stress significantly dampens your mood ({int(abs(stress_mood_corr)*100)}% correlation).",
                'actionable': True,
                'recommendation': 'Stress management techniques could improve overall wellbeing.'
            })
        
        # Stress-Sleep correlation
        stress_sleep_corr = corr_matrix.loc['stress', 'sleep']
        correlations.append({
            'metrics': ['stress', 'sleep'],
            'coefficient': round(stress_sleep_corr, 3),
            'strength': self._classify_correlation_strength(abs(stress_sleep_corr)),
            'direction': 'positive' if stress_sleep_corr > 0 else 'negative'
        })
        
        return {
            'status': 'success',
            'correlations': correlations,
            'matrix': corr_matrix.to_dict(),
            'insights': insights,
            'strongest_correlation': max(correlations, key=lambda x: abs(x['coefficient']))
        }
    
    def _classify_correlation_strength(self, coefficient):
        """Classify correlation strength"""
        abs_coef = abs(coefficient)
        if abs_coef >= 0.7:
            return 'strong'
        elif abs_coef >= 0.4:
            return 'moderate'
        elif abs_coef >= 0.2:
            return 'weak'
        else:
            return 'negligible'
    
    def forecast_metrics(self, logs_data, days=7):
        """
        Forecast metrics for next N days using simple time-series analysis
        
        Args:
            logs_data: Historical log data
            days: Number of days to forecast
            
        Returns:
            dict with forecasted values and confidence intervals
        """
        if len(logs_data) < 7:
            return {
                'status': 'insufficient_data',
                'message': 'Need at least 7 days of data for forecasting'
            }
        
        df = pd.DataFrame(logs_data)
        
        forecast = {
            'status': 'success',
            'days_forecasted': days,
            'predictions': {}
        }
        
        for metric in ['mood', 'energy', 'stress', 'sleep']:
            values = df[metric].values
            
            # Simple linear trend + recent average
            x = np.arange(len(values))
            coeffs = np.polyfit(x, values, 1)
            trend_slope = coeffs[0]
            
            # Recent average (last 7 days)
            recent_avg = values[-7:].mean()
            
            # Forecast using weighted combination
            predictions = []
            for i in range(1, days + 1):
                # Trend-based prediction
                trend_pred = coeffs[0] * (len(values) + i) + coeffs[1]
                
                # Weighted prediction (70% recent avg, 30% trend)
                pred = recent_avg * 0.7 + trend_pred * 0.3
                
                # Bound predictions to realistic ranges
                if metric in ['mood', 'energy', 'stress']:
                    pred = max(1, min(5, pred))
                elif metric == 'sleep':
                    pred = max(0, min(12, pred))
                
                predictions.append(round(pred, 2))
            
            # Calculate confidence (higher for stable metrics)
            variability = np.std(values[-7:])
            if variability < 0.5:
                confidence = 'high'
            elif variability < 1.0:
                confidence = 'medium'
            else:
                confidence = 'low'
            
            forecast['predictions'][metric] = {
                'values': predictions,
                'trend': 'improving' if trend_slope > 0.05 else 'declining' if trend_slope < -0.05 else 'stable',
                'confidence': confidence,
                'current_avg': round(recent_avg, 2)
            }
        
        return forecast
    
    def detect_anomalies(self, logs_data):
        """
        Detect unusual spikes or drops in metrics using statistical methods
        
        Returns:
            list of detected anomalies with context
        """
        if len(logs_data) < 7:
            return []
        
        df = pd.DataFrame(logs_data)
        anomalies = []
        
        for metric in ['mood', 'energy', 'stress', 'sleep']:
            values = df[metric].values
            mean = np.mean(values)
            std = np.std(values)
            
            # Detect points beyond 2 standard deviations
            for i, value in enumerate(values):
                z_score = abs((value - mean) / std) if std > 0 else 0
                
                if z_score > 2:
                    # This is an anomaly
                    anomaly_type = 'spike' if value > mean else 'drop'
                    severity = 'high' if z_score > 3 else 'medium'
                    
                    # Get date if available
                    date = df.iloc[i].get('timestamp', f'Entry {i+1}')
                    
                    anomalies.append({
                        'metric': metric,
                        'type': anomaly_type,
                        'value': round(value, 2),
                        'expected_range': f"{round(mean - std, 2)} - {round(mean + std, 2)}",
                        'severity': severity,
                        'date': date,
                        'z_score': round(z_score, 2),
                        'message': f"Unusual {anomaly_type} in {metric}: {value:.1f} (normal range: {mean-std:.1f}-{mean+std:.1f})"
                    })
        
        
        # Sort by severity (high first)  
        anomalies.sort(key=lambda x: x['severity'] == 'high', reverse=True)
        
        return anomalies[:5]  # Return top 5 anomalies
    
    def detect_cycles(self, logs_data):
        """
        Detect weekly or monthly cycles in metrics
        
        Returns:
            dict with detected cycles and patterns
        """
        if len(logs_data) < 14:
            return {
                'status': 'insufficient_data',
                'message': 'Need at least 14 days of data for cycle detection'
            }
        
        df = pd.DataFrame(logs_data)
        
        # Add day of week if timestamp available
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df['day_of_week'] = df['timestamp'].dt.dayofweek
            df['week_of_month'] = (df['timestamp'].dt.day - 1) // 7 + 1
        else:
            # Assume consecutive days
            df['day_of_week'] = range(len(df)) % 7
        
        cycles = []
        
        # Weekly cycle detection
        if len(df) >= 14:
            weekday_data = df[df['day_of_week'] < 5]
            weekend_data = df[df['day_of_week'] >= 5]
            
            if len(weekday_data) > 0 and len(weekend_data) > 0:
                for metric in ['mood', 'energy', 'stress']:
                    weekday_avg = weekday_data[metric].mean()
                    weekend_avg = weekend_data[metric].mean()
                    diff = weekend_avg - weekday_avg
                    
                    if abs(diff) > 0.5:
                        cycles.append({
                            'type': 'weekly',
                            'metric': metric,
                            'pattern': 'weekend_effect',
                            'weekday_avg': round(weekday_avg, 2),
                            'weekend_avg': round(weekend_avg, 2),
                            'difference': round(diff, 2),
                            'message': f"{metric.capitalize()} is {'higher' if diff > 0 else 'lower'} on weekends by {abs(diff):.1f} points"
                        })
        
        # Monthly cycle detection (if enough data)
        if len(df) >= 28 and 'week_of_month' in df.columns:
            for metric in ['mood', 'stress']:
                weekly_avgs = df.groupby('week_of_month')[metric].mean()
                
                if len(weekly_avgs) >= 3:
                    # Check for consistent pattern
                    if weekly_avgs.std() > 0.3:
                        cycles.append({
                            'type': 'monthly',
                            'metric': metric,
                            'pattern': 'monthly_variation',
                            'weekly_averages': weekly_avgs.to_dict(),
                            'message': f"{metric.capitalize()} shows variation across weeks of the month"
                        })
        
        return {
            'status': 'success',
            'cycles': cycles,
            'has_weekly_pattern': any(c['type'] == 'weekly' for c in cycles),
            'has_monthly_pattern': any(c['type'] == 'monthly' for c in cycles)
        }
from datetime import datetime, timedelta
from typing import List, Dict

def format_date(dt: datetime, format_type: str = 'full') -> str:
    """Format datetime object to readable string"""
    if format_type == 'full':
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    elif format_type == 'date':
        return dt.strftime('%Y-%m-%d')
    elif format_type == 'time':
        return dt.strftime('%H:%M')
    elif format_type == 'friendly':
        return dt.strftime('%B %d, %Y')
    return str(dt)

def calculate_streak(logs: List[Dict]) -> int:
    """Calculate current logging streak in days"""
    if not logs:
        return 0
    
    logs_sorted = sorted(logs, key=lambda x: x['timestamp'], reverse=True)
    streak = 0
    current_date = datetime.now().date()
    
    for log in logs_sorted:
        log_date = datetime.fromisoformat(log['timestamp']).date()
        expected_date = current_date - timedelta(days=streak)
        
        if log_date == expected_date:
            streak += 1
        else:
            break
    
    return streak

def get_time_of_day(hour: int = None) -> str:
    """Get time of day category"""
    if hour is None:
        hour = datetime.now().hour
    
    if 5 <= hour < 12:
        return 'morning'
    elif 12 <= hour < 17:
        return 'afternoon'
    elif 17 <= hour < 21:
        return 'evening'
    else:
        return 'night'

def calculate_percentile(value: float, values: List[float]) -> float:
    """Calculate percentile of value in list"""
    if not values:
        return 50.0
    
    sorted_values = sorted(values)
    position = sum(1 for v in sorted_values if v < value)
    return (position / len(sorted_values)) * 100

def moving_average(values: List[float], window: int = 7) -> List[float]:
    """Calculate moving average"""
    if len(values) < window:
        return values
    
    result = []
    for i in range(len(values)):
        if i < window - 1:
            result.append(sum(values[:i+1]) / (i+1))
        else:
            result.append(sum(values[i-window+1:i+1]) / window)
    
    return result

def detect_anomalies(values: List[float], threshold: float = 2.0) -> List[int]:
    """Detect anomalies using z-score method"""
    if len(values) < 3:
        return []
    
    mean = sum(values) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    std_dev = variance ** 0.5
    
    if std_dev == 0:
        return []
    
    anomalies = []
    for i, value in enumerate(values):
        z_score = abs((value - mean) / std_dev)
        if z_score > threshold:
            anomalies.append(i)
    
    return anomalies

def generate_recommendation_context(mood: float, energy: float, stress: float, sleep: float) -> Dict:
    """Generate context for recommendations"""
    context = {
        'overall_state': 'balanced',
        'primary_concern': None,
        'energy_level': 'moderate',
        'stress_level': 'moderate',
        'recovery_needed': False
    }
    
    # Determine overall state
    avg_wellness = (mood + energy + (6 - stress)) / 3
    if avg_wellness >= 4:
        context['overall_state'] = 'thriving'
    elif avg_wellness >= 3:
        context['overall_state'] = 'balanced'
    elif avg_wellness >= 2:
        context['overall_state'] = 'struggling'
    else:
        context['overall_state'] = 'critical'
    
    # Identify primary concern
    if stress >= 4:
        context['primary_concern'] = 'stress'
    elif energy <= 2:
        context['primary_concern'] = 'energy'
    elif mood <= 2:
        context['primary_concern'] = 'mood'
    elif sleep < 6:
        context['primary_concern'] = 'sleep'
    
    # Energy level
    if energy >= 4:
        context['energy_level'] = 'high'
    elif energy >= 3:
        context['energy_level'] = 'moderate'
    else:
        context['energy_level'] = 'low'
    
    # Stress level
    if stress >= 4:
        context['stress_level'] = 'high'
    elif stress >= 3:
        context['stress_level'] = 'moderate'
    else:
        context['stress_level'] = 'low'
    
    # Recovery needed
    if stress >= 4 or energy <= 2 or sleep < 6:
        context['recovery_needed'] = True
    
    return context
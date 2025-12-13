from typing import Dict, Tuple, Any

def validate_metrics(data: Dict[str, Any]) -> Tuple[bool, str]:
    """Validate daily log metrics"""
    required_fields = ['mood', 'energy', 'stress', 'sleep']
    
    # Check required fields
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    
    # Validate mood (1-5)
    if not isinstance(data['mood'], (int, float)):
        return False, "Mood must be a number"
    if not 1 <= data['mood'] <= 5:
        return False, "Mood must be between 1 and 5"
    
    # Validate energy (1-5)
    if not isinstance(data['energy'], (int, float)):
        return False, "Energy must be a number"
    if not 1 <= data['energy'] <= 5:
        return False, "Energy must be between 1 and 5"
    
    # Validate stress (1-5)
    if not isinstance(data['stress'], (int, float)):
        return False, "Stress must be a number"
    if not 1 <= data['stress'] <= 5:
        return False, "Stress must be between 1 and 5"
    
    # Validate sleep (0-24)
    if not isinstance(data['sleep'], (int, float)):
        return False, "Sleep must be a number"
    if not 0 <= data['sleep'] <= 24:
        return False, "Sleep must be between 0 and 24 hours"
    
    return True, "Valid"

def validate_decision_data(data: Dict[str, Any]) -> Tuple[bool, str]:
    """Validate decision analysis data"""
    required_fields = ['title', 'cost_impact', 'value', 'urgency']
    
    # Check required fields
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    
    # Validate title
    if not isinstance(data['title'], str):
        return False, "Title must be a string"
    if len(data['title'].strip()) == 0:
        return False, "Title cannot be empty"
    if len(data['title']) > 500:
        return False, "Title must be less than 500 characters"
    
    # Validate cost_impact (1-5)
    if not isinstance(data['cost_impact'], (int, float)):
        return False, "Cost impact must be a number"
    if not 1 <= data['cost_impact'] <= 5:
        return False, "Cost impact must be between 1 and 5"
    
    # Validate value (1-5)
    if not isinstance(data['value'], (int, float)):
        return False, "Value must be a number"
    if not 1 <= data['value'] <= 5:
        return False, "Value must be between 1 and 5"
    
    # Validate urgency (1-5)
    if not isinstance(data['urgency'], (int, float)):
        return False, "Urgency must be a number"
    if not 1 <= data['urgency'] <= 5:
        return False, "Urgency must be between 1 and 5"
    
    # Validate optional description
    if 'description' in data and data['description']:
        if not isinstance(data['description'], str):
            return False, "Description must be a string"
        if len(data['description']) > 5000:
            return False, "Description must be less than 5000 characters"
    
    return True, "Valid"

def sanitize_text_input(text: str, max_length: int = 10000) -> str:
    """Sanitize text input"""
    if not text:
        return ""
    
    # Remove excessive whitespace
    text = ' '.join(text.split())
    
    # Truncate to max length
    if len(text) > max_length:
        text = text[:max_length]
    
    return text.strip()

def validate_date_range(start_date: str, end_date: str) -> Tuple[bool, str]:
    """Validate date range"""
    from datetime import datetime
    
    try:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
        
        if start > end:
            return False, "Start date must be before end date"
        
        if (end - start).days > 365:
            return False, "Date range cannot exceed 365 days"
        
        return True, "Valid"
    except ValueError:
        return False, "Invalid date format"

def validate_rating(rating: Any) -> Tuple[bool, str]:
    """Validate rating (1-5)"""
    if not isinstance(rating, (int, float)):
        return False, "Rating must be a number"
    
    if not 1 <= rating <= 5:
        return False, "Rating must be between 1 and 5"
    
    return True, "Valid"
export function formatDate(dateString, format = 'full') {
  const date = new Date(dateString);
  
  if (format === 'short') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  if (format === 'time') {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  
  if (format === 'relative') {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  }
  
  // Full format
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatNumber(num, decimals = 1) {
  if (typeof num !== 'number') return num;
  return num.toFixed(decimals);
}

export function formatPercentage(num, decimals = 0) {
  if (typeof num !== 'number') return num;
  return `${num.toFixed(decimals)}%`;
}

export function formatMetric(value, metric) {
  const labels = {
    mood: ['😔', '😕', '😐', '🙂', '😊'],
    energy: ['🔋', '🪫', '⚡', '💫', '🌟'],
    stress: ['😌', '😊', '😐', '😰', '😱']
  };
  
  const index = Math.min(Math.max(Math.round(value) - 1, 0), 4);
  return labels[metric]?.[index] || value;
}

export function getMetricColor(value, metric, inverted = false) {
  const normalized = inverted ? 6 - value : value;
  
  if (normalized >= 4) return 'text-green-600';
  if (normalized >= 3) return 'text-yellow-600';
  return 'text-red-600';
}

export function getMetricBgColor(value, metric, inverted = false) {
  const normalized = inverted ? 6 - value : value;
  
  if (normalized >= 4) return 'bg-green-50 border-green-200';
  if (normalized >= 3) return 'bg-yellow-50 border-yellow-200';
  return 'bg-red-50 border-red-200';
}

export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function calculateStreak(logs) {
  if (!logs || logs.length === 0) return 0;
  
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedLogs.length; i++) {
    const logDate = new Date(sortedLogs[i].timestamp);
    logDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - streak);
    
    if (logDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}
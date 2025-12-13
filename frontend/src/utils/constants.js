export const METRIC_LABELS = {
  mood: {
    1: 'Very Negative',
    2: 'Negative',
    3: 'Neutral',
    4: 'Positive',
    5: 'Very Positive'
  },
  energy: {
    1: 'Exhausted',
    2: 'Low',
    3: 'Moderate',
    4: 'High',
    5: 'Peak'
  },
  stress: {
    1: 'Very Calm',
    2: 'Relaxed',
    3: 'Moderate',
    4: 'High',
    5: 'Critical'
  }
};

export const URGENCY_LEVELS = {
  low: { label: 'Low', color: 'green' },
  medium: { label: 'Medium', color: 'yellow' },
  high: { label: 'High', color: 'orange' },
  critical: { label: 'Critical', color: 'red' }
};

export const VERDICT_MESSAGES = {
  'Go For It': {
    emoji: '✅',
    color: 'green',
    message: 'Strong recommendation to proceed'
  },
  'Proceed with Caution': {
    emoji: '⚠️',
    color: 'yellow',
    message: 'Proceed carefully with planning'
  },
  'Hold Off': {
    emoji: '❌',
    color: 'red',
    message: 'Consider postponing this decision'
  }
};

export const INSIGHT_TYPES = {
  trend: { icon: 'TrendingUp', color: 'blue' },
  warning: { icon: 'AlertTriangle', color: 'amber' },
  achievement: { icon: 'Award', color: 'green' },
  alert: { icon: 'AlertTriangle', color: 'red' },
  anomaly: { icon: 'Lightbulb', color: 'purple' }
};

export const TIME_RANGES = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
  { label: '1 Year', value: 365 }
];
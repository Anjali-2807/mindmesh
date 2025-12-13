import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export function useAnalytics(days = 30) {
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [logsResponse, analyticsResponse] = await Promise.all([
        apiService.getHistory(days),
        apiService.getAnalytics(days)
      ]);
      setLogs(logsResponse.data);
      setAnalytics(analyticsResponse.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchData();
  };

  return { logs, analytics, loading, error, refresh };
}

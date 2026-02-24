import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp } from 'lucide-react';

interface Sensor {
  id: string;
  name: string;
}

interface Reading {
  id: string;
  sensor_id: string;
  pol_percentage: number;
  timestamp: string;
}

interface LiveReadingsProps {
  sensors: Sensor[];
}

export default function LiveReadings({ sensors }: LiveReadingsProps) {
  const [readings, setReadings] = useState<Reading[]>([]);

  useEffect(() => {
    fetchRecentReadings();

    const subscription = supabase
      .channel('live_readings')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
        (payload) => {
          const newReading = payload.new as Reading;
          setReadings(prev => [newReading, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchRecentReadings = async () => {
    try {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('id, sensor_id, pol_percentage, timestamp')
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) throw error;
      if (data) setReadings(data);
    } catch (error) {
      console.error('Error fetching readings:', error);
    }
  };

  const getSensorName = (sensorId: string) => {
    return sensors.find(s => s.id === sensorId)?.name || 'Unknown';
  };

  const getPolColor = (pol: number) => {
    if (pol >= 13.5 && pol <= 14.5) return 'text-emerald-400';
    if (pol >= 12 && pol <= 16) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold">Live Readings Stream</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-sm text-slate-400">Live</span>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="max-h-96 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          {readings.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>Waiting for live data...</p>
            </div>
          ) : (
            readings.map((reading) => (
              <div
                key={reading.id}
                className="bg-slate-900 rounded-lg p-3 flex items-center justify-between hover:bg-slate-700 transition"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{getSensorName(reading.sensor_id)}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(reading.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className={`text-xl font-bold ${getPolColor(reading.pol_percentage)}`}>
                  {reading.pol_percentage.toFixed(2)}%
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

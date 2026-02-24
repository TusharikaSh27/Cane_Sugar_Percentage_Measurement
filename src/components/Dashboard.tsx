import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, AlertTriangle, TrendingUp, Settings } from 'lucide-react';
import SensorCard from './SensorCard';
import LiveReadings from './LiveReadings';
import AlertPanel from './AlertPanel';
import Analytics from './Analytics';
import SystemConfig from './SystemConfig';

interface Sensor {
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
  calibration_date: string;
  accuracy_rating: number;
}

interface SensorReading {
  id: string;
  sensor_id: string;
  pol_percentage: number;
  brix: number | null;
  moisture_content: number | null;
  temperature: number | null;
  flow_rate: number | null;
  quality_score: number;
  timestamp: string;
}

interface Alert {
  id: string;
  sensor_id: string;
  alert_type: string;
  severity: string;
  message: string;
  acknowledged: boolean;
  created_at: string;
}

export default function Dashboard() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [latestReadings, setLatestReadings] = useState<Map<string, SensorReading>>(new Map());
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeView, setActiveView] = useState<'overview' | 'analytics' | 'config'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSensors();
    fetchAlerts();

    const readingsSubscription = supabase
      .channel('sensor_readings_changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
        (payload) => {
          const newReading = payload.new as SensorReading;
          setLatestReadings(prev => new Map(prev).set(newReading.sensor_id, newReading));
        }
      )
      .subscribe();

    const alertsSubscription = supabase
      .channel('alerts_changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'system_alerts' },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      simulateSensorReadings();
    }, 3000);

    return () => {
      readingsSubscription.unsubscribe();
      alertsSubscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const fetchSensors = async () => {
    try {
      const { data, error } = await supabase
        .from('sensors')
        .select('*')
        .order('created_at');

      if (error) throw error;
      if (data) {
        setSensors(data);
        fetchLatestReadings(data.map(s => s.id));
      }
    } catch (error) {
      console.error('Error fetching sensors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestReadings = async (sensorIds: string[]) => {
    try {
      const readings = new Map<string, SensorReading>();

      for (const sensorId of sensorIds) {
        const { data, error } = await supabase
          .from('sensor_readings')
          .select('*')
          .eq('sensor_id', sensorId)
          .order('timestamp', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          readings.set(sensorId, data);
        }
      }

      setLatestReadings(readings);
    } catch (error) {
      console.error('Error fetching latest readings:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .eq('acknowledged', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      if (data) setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const simulateSensorReadings = async () => {
    for (const sensor of sensors) {
      if (sensor.status !== 'active') continue;

      const basePolPercentage = 12 + Math.random() * 4;
      const reading = {
        sensor_id: sensor.id,
        pol_percentage: Number((basePolPercentage).toFixed(2)),
        brix: Number((basePolPercentage * 1.2 + Math.random() * 2).toFixed(2)),
        moisture_content: Number((70 + Math.random() * 5).toFixed(2)),
        temperature: Number((28 + Math.random() * 4).toFixed(1)),
        flow_rate: Number((45 + Math.random() * 10).toFixed(1)),
        quality_score: Number((95 + Math.random() * 5).toFixed(0)),
      };

      await supabase.from('sensor_readings').insert(reading);

      if (Math.abs(reading.pol_percentage - 14) > 2.5) {
        await supabase.from('system_alerts').insert({
          sensor_id: sensor.id,
          alert_type: 'pol_deviation',
          severity: 'warning',
          message: `Pol percentage ${reading.pol_percentage}% outside normal range for ${sensor.name}`,
        });
      }
    }
  };

  const activeSensors = sensors.filter(s => s.status === 'active').length;
  const avgPol = Array.from(latestReadings.values())
    .reduce((sum, r) => sum + r.pol_percentage, 0) / (latestReadings.size || 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading system...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-400" />
            <div>
              <h1 className="text-2xl font-bold">Sugar Mill Monitoring System</h1>
              <p className="text-sm text-slate-400">Real-time Pol Measurement & Analytics</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeView === 'overview'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeView === 'analytics'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveView('config')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeView === 'config'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Config
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Active Sensors</span>
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold">{activeSensors}/{sensors.length}</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Average Pol %</span>
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold">{avgPol.toFixed(2)}%</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Active Alerts</span>
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-bold">{alerts.length}</div>
          </div>
        </div>

        {activeView === 'overview' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {sensors.map(sensor => (
                <SensorCard
                  key={sensor.id}
                  sensor={sensor}
                  latestReading={latestReadings.get(sensor.id)}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LiveReadings sensors={sensors} />
              </div>
              <div>
                <AlertPanel alerts={alerts} onRefresh={fetchAlerts} />
              </div>
            </div>
          </>
        )}

        {activeView === 'analytics' && (
          <Analytics sensors={sensors} />
        )}

        {activeView === 'config' && (
          <SystemConfig />
        )}
      </main>
    </div>
  );
}

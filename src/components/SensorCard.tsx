import { Activity, CheckCircle, AlertCircle, Wrench } from 'lucide-react';

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
  pol_percentage: number;
  brix: number | null;
  moisture_content: number | null;
  temperature: number | null;
  flow_rate: number | null;
  quality_score: number;
  timestamp: string;
}

interface SensorCardProps {
  sensor: Sensor;
  latestReading?: SensorReading;
}

export default function SensorCard({ sensor, latestReading }: SensorCardProps) {
  const getStatusIcon = () => {
    switch (sensor.status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'maintenance':
        return <Wrench className="w-5 h-5 text-amber-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusColor = () => {
    switch (sensor.status) {
      case 'active':
        return 'border-emerald-500';
      case 'maintenance':
        return 'border-amber-500';
      default:
        return 'border-red-500';
    }
  };

  const getPolAccuracy = () => {
    if (!latestReading) return 'N/A';
    const deviation = Math.abs(latestReading.pol_percentage - 14);
    return deviation <= sensor.accuracy_rating ? 'Within Spec' : 'Out of Spec';
  };

  return (
    <div className={`bg-slate-800 rounded-lg p-5 border-l-4 ${getStatusColor()} hover:shadow-lg transition`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-slate-400" />
            <h3 className="font-bold text-lg">{sensor.name}</h3>
          </div>
          <p className="text-sm text-slate-400">{sensor.type}</p>
          <p className="text-xs text-slate-500 mt-1">{sensor.location}</p>
        </div>
        {getStatusIcon()}
      </div>

      {latestReading ? (
        <div className="space-y-3">
          <div className="bg-slate-900 rounded-lg p-3">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs text-slate-400">Pol %</span>
              <span className="text-2xl font-bold text-emerald-400">
                {latestReading.pol_percentage.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Accuracy</span>
              <span className={`text-xs font-medium ${
                getPolAccuracy() === 'Within Spec' ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                ±{sensor.accuracy_rating}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            {latestReading.brix !== null && (
              <div>
                <span className="text-slate-400 block text-xs">Brix</span>
                <span className="font-semibold">{latestReading.brix.toFixed(2)}°</span>
              </div>
            )}
            {latestReading.moisture_content !== null && (
              <div>
                <span className="text-slate-400 block text-xs">Moisture</span>
                <span className="font-semibold">{latestReading.moisture_content.toFixed(1)}%</span>
              </div>
            )}
            {latestReading.temperature !== null && (
              <div>
                <span className="text-slate-400 block text-xs">Temp</span>
                <span className="font-semibold">{latestReading.temperature.toFixed(1)}°C</span>
              </div>
            )}
            {latestReading.flow_rate !== null && (
              <div>
                <span className="text-slate-400 block text-xs">Flow Rate</span>
                <span className="font-semibold">{latestReading.flow_rate.toFixed(0)} t/h</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-700">
            <span className="text-xs text-slate-500">
              {new Date(latestReading.timestamp).toLocaleTimeString()}
            </span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                latestReading.quality_score >= 95 ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className="text-xs text-slate-400">Q: {latestReading.quality_score}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-slate-500">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Waiting for data...</p>
        </div>
      )}
    </div>
  );
}

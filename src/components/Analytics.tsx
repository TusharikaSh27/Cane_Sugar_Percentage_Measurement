import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, Download, Calendar } from 'lucide-react';

interface Sensor {
  id: string;
  name: string;
}

interface CalibrationRecord {
  id: string;
  sensor_id: string;
  lab_pol_value: number;
  sensor_pol_value: number;
  deviation: number;
  calibrated_by: string;
  timestamp: string;
}

interface AnalyticsProps {
  sensors: Sensor[];
}

export default function Analytics({ sensors }: AnalyticsProps) {
  const [calibrationRecords, setCalibrationRecords] = useState<CalibrationRecord[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    fetchCalibrationData();
  }, [selectedSensor, timeRange]);

  const fetchCalibrationData = async () => {
    try {
      let query = supabase
        .from('calibration_records')
        .select('*')
        .order('timestamp', { ascending: false });

      if (selectedSensor !== 'all') {
        query = query.eq('sensor_id', selectedSensor);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      if (data) setCalibrationRecords(data);
    } catch (error) {
      console.error('Error fetching calibration data:', error);
    }
  };

  const avgDeviation = calibrationRecords.length > 0
    ? calibrationRecords.reduce((sum, r) => sum + Math.abs(r.deviation), 0) / calibrationRecords.length
    : 0;

  const maxDeviation = calibrationRecords.length > 0
    ? Math.max(...calibrationRecords.map(r => Math.abs(r.deviation)))
    : 0;

  const getSensorName = (sensorId: string) => {
    return sensors.find(s => s.id === sensorId)?.name || 'Unknown';
  };

  const exportData = () => {
    const csv = [
      ['Timestamp', 'Sensor', 'Lab Value', 'Sensor Value', 'Deviation', 'Calibrated By'],
      ...calibrationRecords.map(r => [
        new Date(r.timestamp).toISOString(),
        getSensorName(r.sensor_id),
        r.lab_pol_value,
        r.sensor_pol_value,
        r.deviation,
        r.calibrated_by
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calibration-data-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold">Calibration Analytics</h2>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedSensor}
              onChange={(e) => setSelectedSensor(e.target.value)}
              className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
            >
              <option value="all">All Sensors</option>
              {sensors.map(sensor => (
                <option key={sensor.id} value={sensor.id}>{sensor.name}</option>
              ))}
            </select>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d')}
              className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            <button
              onClick={exportData}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Total Calibrations</div>
            <div className="text-2xl font-bold">{calibrationRecords.length}</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Average Deviation</div>
            <div className="text-2xl font-bold text-emerald-400">±{avgDeviation.toFixed(3)}</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Max Deviation</div>
            <div className={`text-2xl font-bold ${maxDeviation > 0.2 ? 'text-amber-400' : 'text-emerald-400'}`}>
              ±{maxDeviation.toFixed(3)}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Timestamp
                </th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Sensor</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Lab Value</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Sensor Value</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Deviation</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Calibrated By</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {calibrationRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No calibration data available
                  </td>
                </tr>
              ) : (
                calibrationRecords.map((record) => (
                  <tr key={record.id} className="border-b border-slate-800 hover:bg-slate-700 transition">
                    <td className="py-3 px-4">{new Date(record.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-4">{getSensorName(record.sensor_id)}</td>
                    <td className="py-3 px-4">{record.lab_pol_value.toFixed(2)}%</td>
                    <td className="py-3 px-4">{record.sensor_pol_value.toFixed(2)}%</td>
                    <td className={`py-3 px-4 font-semibold ${
                      Math.abs(record.deviation) <= 0.2 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {record.deviation > 0 ? '+' : ''}{record.deviation.toFixed(3)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{record.calibrated_by}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

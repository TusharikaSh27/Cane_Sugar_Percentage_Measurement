import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Settings, Save, Plus, Trash2 } from 'lucide-react';

interface Sensor {
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
  calibration_date: string;
  accuracy_rating: number;
}

export default function SystemConfig() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [editingSensor, setEditingSensor] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Sensor>>({});

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    try {
      const { data, error } = await supabase
        .from('sensors')
        .select('*')
        .order('created_at');

      if (error) throw error;
      if (data) setSensors(data);
    } catch (error) {
      console.error('Error fetching sensors:', error);
    }
  };

  const handleEdit = (sensor: Sensor) => {
    setEditingSensor(sensor.id);
    setFormData(sensor);
  };

  const handleSave = async () => {
    if (!editingSensor) return;

    try {
      const { error } = await supabase
        .from('sensors')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingSensor);

      if (error) throw error;

      setEditingSensor(null);
      setFormData({});
      fetchSensors();
    } catch (error) {
      console.error('Error updating sensor:', error);
    }
  };

  const handleDelete = async (sensorId: string) => {
    if (!confirm('Are you sure you want to delete this sensor?')) return;

    try {
      const { error } = await supabase
        .from('sensors')
        .delete()
        .eq('id', sensorId);

      if (error) throw error;
      fetchSensors();
    } catch (error) {
      console.error('Error deleting sensor:', error);
    }
  };

  const addCalibrationRecord = async (sensorId: string) => {
    const labValue = prompt('Enter laboratory Pol value:');
    const sensorValue = prompt('Enter sensor reading:');
    const calibratedBy = prompt('Calibrated by:');

    if (!labValue || !sensorValue || !calibratedBy) return;

    try {
      const { error } = await supabase
        .from('calibration_records')
        .insert({
          sensor_id: sensorId,
          lab_pol_value: parseFloat(labValue),
          sensor_pol_value: parseFloat(sensorValue),
          calibrated_by: calibratedBy,
        });

      if (error) throw error;

      await supabase
        .from('sensors')
        .update({ calibration_date: new Date().toISOString() })
        .eq('id', sensorId);

      alert('Calibration record added successfully');
      fetchSensors();
    } catch (error) {
      console.error('Error adding calibration:', error);
      alert('Error adding calibration record');
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold">Sensor Configuration</h2>
        </div>
      </div>

      <div className="space-y-4">
        {sensors.map((sensor) => (
          <div key={sensor.id} className="bg-slate-900 rounded-lg p-4">
            {editingSensor === sensor.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Type</label>
                    <input
                      type="text"
                      value={formData.type || ''}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Status</label>
                    <select
                      value={formData.status || ''}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Accuracy Rating</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.accuracy_rating || ''}
                      onChange={(e) => setFormData({ ...formData, accuracy_rating: parseFloat(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingSensor(null);
                      setFormData({});
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{sensor.name}</h3>
                    <p className="text-sm text-slate-400">{sensor.type}</p>
                    <p className="text-xs text-slate-500 mt-1">{sensor.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(sensor)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(sensor.id)}
                      className="bg-red-900 hover:bg-red-800 text-white px-3 py-1 rounded text-sm transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <span className="text-slate-400 block text-xs">Status</span>
                    <span className={`font-medium ${
                      sensor.status === 'active' ? 'text-emerald-400' :
                      sensor.status === 'maintenance' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {sensor.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Accuracy</span>
                    <span className="font-medium">±{sensor.accuracy_rating}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Last Calibration</span>
                    <span className="font-medium">
                      {new Date(sensor.calibration_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => addCalibrationRecord(sensor.id)}
                  className="bg-blue-900 hover:bg-blue-800 text-white px-3 py-2 rounded text-sm transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Calibration Record
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Alert {
  id: string;
  sensor_id: string;
  alert_type: string;
  severity: string;
  message: string;
  acknowledged: boolean;
  created_at: string;
}

interface AlertPanelProps {
  alerts: Alert[];
  onRefresh: () => void;
}

export default function AlertPanel({ alerts, onRefresh }: AlertPanelProps) {
  const acknowledgeAlert = async (alertId: string) => {
    try {
      await supabase
        .from('system_alerts')
        .update({
          acknowledged: true,
          acknowledged_by: 'System User',
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      onRefresh();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-900 border-red-500';
      case 'warning':
        return 'bg-amber-900 border-amber-500';
      default:
        return 'bg-blue-900 border-blue-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold">Active Alerts</h2>
        </div>
        <span className="bg-amber-900 text-amber-300 text-xs font-bold px-2 py-1 rounded">
          {alerts.length}
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-emerald-400 opacity-50" />
            <p className="text-slate-400">All systems normal</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg p-4 border-l-4 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(alert.severity)}
                  <span className="font-semibold text-sm uppercase">{alert.severity}</span>
                </div>
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="text-slate-400 hover:text-white transition"
                  title="Acknowledge"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm mb-2">{alert.message}</p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{alert.alert_type}</span>
                <span>{new Date(alert.created_at).toLocaleTimeString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/queryClient";
import { MapPin, Fuel, AlertTriangle, CheckCircle, Clock, X } from "lucide-react";
import { useState } from "react";

interface GeofenceAlert {
  id: string;
  vehicleId: string;
  vehicleName: string;
  type: 'entry' | 'exit' | 'late_return';
  geofenceName: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  description: string;
  urgency: 'low' | 'medium' | 'high';
}

interface FuelAlert {
  id: string;
  vehicleId: string;
  vehicleName: string;
  departureLevel: number;
  currentLevel: number;
  difference: number;
  timestamp: string;
  status: 'low' | 'empty' | 'not_full_return';
  urgency: 'low' | 'medium' | 'high';
  description: string;
}

export default function BounceAlertsBar() {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const { data: geofenceData } = useQuery<{ success: boolean; data: GeofenceAlert[] }>({
    queryKey: ["/api/bounce/alerts/geofence"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/bounce/alerts/geofence"), { credentials: "include" });
      if (!res.ok) return { success: true, data: [] }; // Don't break if Bounce not configured
      return res.json();
    },
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });

  const { data: fuelData } = useQuery<{ success: boolean; data: FuelAlert[] }>({
    queryKey: ["/api/bounce/alerts/fuel"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/bounce/alerts/fuel"), { credentials: "include" });
      if (!res.ok) return { success: true, data: [] }; // Don't break if Bounce not configured
      return res.json();
    },
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });

  const geofenceAlerts = (geofenceData?.data || []).filter(alert => !dismissed.includes(alert.id));
  const fuelAlerts = (fuelData?.data || []).filter(alert => !dismissed.includes(alert.id));
  
  const allAlerts = [...geofenceAlerts, ...fuelAlerts];
  const highPriorityAlerts = allAlerts.filter(alert => alert.urgency === 'high');
  const mediumPriorityAlerts = allAlerts.filter(alert => alert.urgency === 'medium');

  const dismissAlert = (alertId: string) => {
    setDismissed(prev => [...prev, alertId]);
  };

  const getAlertIcon = (alert: GeofenceAlert | FuelAlert) => {
    if ('type' in alert) {
      // Geofence alert
      if (alert.urgency === 'high') return <AlertTriangle className="w-4 h-4 text-red-400" />;
      return <MapPin className="w-4 h-4 text-amber-400" />;
    } else {
      // Fuel alert
      if (alert.urgency === 'high') return <AlertTriangle className="w-4 h-4 text-red-400" />;
      return <Fuel className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getAlertColor = (urgency: string) => {
    if (urgency === 'high') return '#ef4444'; // red-500
    if (urgency === 'medium') return '#f59e0b'; // amber-500
    return '#eab308'; // yellow-500
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (allAlerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {/* High Priority Alerts */}
      {highPriorityAlerts.map(alert => (
        <div 
          key={alert.id}
          className="flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
        >
          {getAlertIcon(alert)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-red-400">{alert.vehicleName}</p>
              <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded font-medium">
                URGENT
              </span>
            </div>
            <p className="text-sm text-white">{alert.description}</p>
            <p className="text-xs text-gray-400">{formatTimestamp(alert.timestamp)}</p>
          </div>
          <button
            onClick={() => dismissAlert(alert.id)}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* Medium Priority Alerts */}
      {mediumPriorityAlerts.slice(0, 3).map(alert => (
        <div 
          key={alert.id}
          className="flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}
        >
          {getAlertIcon(alert)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-amber-400">{alert.vehicleName}</p>
              {'type' in alert && (
                <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded font-medium">
                  {alert.type.replace('_', ' ').toUpperCase()}
                </span>
              )}
              {'status' in alert && (
                <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded font-medium">
                  {alert.status.replace('_', ' ').toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-sm text-white">{alert.description}</p>
            <p className="text-xs text-gray-400">{formatTimestamp(alert.timestamp)}</p>
          </div>
          <button
            onClick={() => dismissAlert(alert.id)}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* Show more indicator */}
      {mediumPriorityAlerts.length > 3 && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            +{mediumPriorityAlerts.length - 3} more vehicle alerts
          </p>
        </div>
      )}
    </div>
  );
}
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/queryClient";
import { Wrench, AlertTriangle, CheckCircle, Droplets } from "lucide-react";

interface OilChangeAlert {
  vehicleId: number;
  make: string;
  model: string;
  year: number;
  plate: string;
  lastOilChange: string | null;
  currentMileage: number | null;
  milesSinceOilChange: number | null;
  daysSinceOilChange: number | null;
  status: 'current' | 'due' | 'overdue';
  urgency: 'low' | 'medium' | 'high';
}

export default function MaintenanceBox() {
  const { data, isLoading, error } = useQuery<{ success: boolean; data: OilChangeAlert[] }>({
    queryKey: ["/api/maintenance/oil-change-alerts"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/maintenance/oil-change-alerts"), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load oil change alerts");
      return res.json();
    },
    refetchInterval: 15 * 60 * 1000, // Refresh every 15 minutes
  });

  const alerts = data?.data || [];
  
  // Filter to show only alerts that need attention
  const needsOilChange = alerts.filter(alert => alert.status !== 'current');
  const overdueAlerts = needsOilChange.filter(alert => alert.status === 'overdue');
  const dueAlerts = needsOilChange.filter(alert => alert.status === 'due');

  const getStatusIcon = (status: string, urgency: string) => {
    if (status === 'overdue') return <AlertTriangle className="w-4 h-4 text-red-400" />;
    if (status === 'due' && urgency === 'high') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    if (status === 'due') return <Droplets className="w-4 h-4 text-yellow-400" />;
    return <CheckCircle className="w-4 h-4 text-green-400" />;
  };

  const getStatusColor = (status: string, urgency: string) => {
    if (status === 'overdue') return '#ef4444'; // red-500
    if (status === 'due' && urgency === 'high') return '#f59e0b'; // amber-500
    if (status === 'due') return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  const formatMaintenanceInfo = (alert: OilChangeAlert) => {
    if (alert.milesSinceOilChange !== null) {
      const remaining = 5000 - alert.milesSinceOilChange;
      if (remaining <= 0) {
        return `${Math.abs(remaining).toLocaleString()}mi overdue`;
      }
      return `${remaining.toLocaleString()}mi remaining`;
    }
    
    if (alert.daysSinceOilChange !== null) {
      const remaining = 180 - alert.daysSinceOilChange; // 6 months
      if (remaining <= 0) {
        return `${Math.abs(remaining)}d overdue`;
      }
      return `${remaining}d remaining`;
    }
    
    return 'No data';
  };

  const getTotalAlertsCount = () => overdueAlerts.length + dueAlerts.length;

  return (
    <div className="rounded-xl p-4" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
      <div className="flex items-center gap-2 mb-4">
        <Wrench className="w-5 h-5" style={{ color: '#DAA520' }} />
        <h3 className="font-semibold text-white">Oil Changes</h3>
        {getTotalAlertsCount() > 0 && (
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
            overdueAlerts.length > 0 
              ? 'bg-red-500/20 text-red-400' 
              : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {getTotalAlertsCount()}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-700 rounded" />
                <div>
                  <div className="h-3 w-24 bg-gray-700 rounded mb-1" />
                  <div className="h-2 w-16 bg-gray-700 rounded" />
                </div>
              </div>
              <div className="h-3 w-20 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-6 text-gray-400">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Unable to load maintenance data</p>
        </div>
      ) : getTotalAlertsCount() === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
          <p className="text-sm font-medium text-white mb-1">All Current</p>
          <p className="text-xs text-gray-400">No oil changes needed</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Overdue Alerts */}
          {overdueAlerts.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-red-400 mb-2 uppercase tracking-wide">
                Overdue ({overdueAlerts.length})
              </h4>
              <div className="space-y-2">
                {overdueAlerts.slice(0, 3).map(alert => (
                  <div key={alert.vehicleId} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {getStatusIcon(alert.status, alert.urgency)}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {alert.year} {alert.make} {alert.model}
                        </p>
                        <p className="text-xs text-gray-400">{alert.plate}</p>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-xs font-medium text-red-400">
                        {formatMaintenanceInfo(alert)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Due Alerts */}
          {dueAlerts.length > 0 && (
            <div className={overdueAlerts.length > 0 ? 'pt-3 border-t border-gray-800' : ''}>
              <h4 className="text-xs font-medium text-yellow-400 mb-2 uppercase tracking-wide">
                Due Soon ({dueAlerts.length})
              </h4>
              <div className="space-y-2">
                {dueAlerts.slice(0, 3).map(alert => (
                  <div key={alert.vehicleId} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {getStatusIcon(alert.status, alert.urgency)}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {alert.year} {alert.make} {alert.model}
                        </p>
                        <p className="text-xs text-gray-400">{alert.plate}</p>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-xs font-medium text-yellow-400">
                        {formatMaintenanceInfo(alert)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show more indicator */}
          {getTotalAlertsCount() > 6 && (
            <div className="text-center pt-2 border-t border-gray-800">
              <p className="text-xs text-gray-500">
                +{getTotalAlertsCount() - 6} more vehicles need attention
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/queryClient";
import { FileText, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface RegistrationAlert {
  vehicleId: number;
  make: string;
  model: string;
  year: number;
  plate: string;
  registrationExpiry: string | null;
  daysUntilExpiry: number;
  status: 'current' | 'expiring' | 'expired';
  urgency: 'low' | 'medium' | 'high';
}

export default function RegistrationColumn() {
  const { data, isLoading, error } = useQuery<{ success: boolean; data: RegistrationAlert[] }>({
    queryKey: ["/api/maintenance/registration-alerts"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/maintenance/registration-alerts"), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load registration alerts");
      return res.json();
    },
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });

  const alerts = data?.data || [];
  
  // Filter to show only alerts that need attention
  const needsAttention = alerts.filter(alert => alert.status !== 'current');
  const upcomingRenewals = alerts.filter(alert => 
    alert.status === 'expiring' && alert.daysUntilExpiry <= 90
  );

  const getStatusIcon = (status: string, urgency: string) => {
    if (status === 'expired') return <AlertCircle className="w-4 h-4 text-red-400" />;
    if (status === 'expiring' && urgency === 'high') return <AlertCircle className="w-4 h-4 text-amber-400" />;
    if (status === 'expiring') return <Clock className="w-4 h-4 text-yellow-400" />;
    return <CheckCircle className="w-4 h-4 text-green-400" />;
  };

  const getStatusColor = (status: string, urgency: string) => {
    if (status === 'expired') return '#ef4444'; // red-500
    if (status === 'expiring' && urgency === 'high') return '#f59e0b'; // amber-500
    if (status === 'expiring') return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  const formatExpiryText = (alert: RegistrationAlert) => {
    if (alert.status === 'expired') {
      return `Expired ${Math.abs(alert.daysUntilExpiry)} days ago`;
    }
    if (alert.status === 'expiring') {
      if (alert.daysUntilExpiry <= 0) return 'Expires today';
      if (alert.daysUntilExpiry === 1) return 'Expires tomorrow';
      return `Expires in ${alert.daysUntilExpiry} days`;
    }
    return 'Current';
  };

  return (
    <div className="space-y-4">
      {/* Urgent Alerts */}
      {needsAttention.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-red-400" />
            <h4 className="font-semibold text-white text-sm">Registration Alerts</h4>
            <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full font-medium">
              {needsAttention.length}
            </span>
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse flex items-center justify-between py-2">
                  <div>
                    <div className="h-3 w-24 bg-gray-700 rounded mb-1" />
                    <div className="h-2 w-16 bg-gray-700 rounded" />
                  </div>
                  <div className="h-3 w-20 bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {needsAttention.slice(0, 5).map(alert => (
                <div key={alert.vehicleId} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getStatusIcon(alert.status, alert.urgency)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">
                        {alert.year} {alert.make} {alert.model}
                      </p>
                      <p className="text-xs text-gray-400">{alert.plate}</p>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <p 
                      className="text-xs font-medium"
                      style={{ color: getStatusColor(alert.status, alert.urgency) }}
                    >
                      {formatExpiryText(alert)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming Renewals */}
      {upcomingRenewals.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4" style={{ color: '#DAA520' }} />
            <h4 className="font-semibold text-white text-sm">Upcoming Renewals</h4>
            <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full font-medium">
              {upcomingRenewals.length}
            </span>
          </div>
          
          <div className="space-y-2">
            {upcomingRenewals.slice(0, 3).map(alert => (
              <div key={alert.vehicleId} className="flex items-center justify-between py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">
                    {alert.year} {alert.make} {alert.model}
                  </p>
                  <p className="text-xs text-gray-400">{alert.plate}</p>
                </div>
                <div className="text-right ml-2">
                  <p className="text-xs text-yellow-400 font-medium">
                    {alert.daysUntilExpiry}d
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Clear */}
      {needsAttention.length === 0 && upcomingRenewals.length === 0 && !isLoading && !error && (
        <div className="rounded-xl p-4 text-center" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
          <p className="text-sm font-medium text-white mb-1">All Current</p>
          <p className="text-xs text-gray-400">No registration issues</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl p-4 text-center" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
          <p className="text-sm text-gray-400">Unable to load registration data</p>
        </div>
      )}
    </div>
  );
}
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/queryClient";
import { Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface ScheduleItem {
  id: string;
  vehicleId: number;
  type: 'registration' | 'oil_change' | 'inspection' | 'maintenance';
  title: string;
  description: string;
  dueDate: string;
  status: 'upcoming' | 'due' | 'overdue' | 'completed';
  urgency: 'low' | 'medium' | 'high';
  vehicle: {
    make: string;
    model: string;
    year: number;
    plate: string;
  };
}

export default function ScheduleCard() {
  const { data, isLoading, error } = useQuery<{ success: boolean; data: ScheduleItem[] }>({
    queryKey: ["/api/maintenance/schedule"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/maintenance/schedule?days=30"), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load schedule");
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const schedule = data?.data || [];

  const getStatusColor = (status: string, urgency: string) => {
    if (status === 'overdue') return '#ef4444'; // red-500
    if (status === 'due' && urgency === 'high') return '#f59e0b'; // amber-500
    if (status === 'due') return '#eab308'; // yellow-500
    if (status === 'completed') return '#22c55e'; // green-500
    return '#6b7280'; // gray-500
  };

  const getStatusIcon = (status: string, urgency: string) => {
    if (status === 'overdue') return <AlertTriangle className="w-4 h-4 text-red-400" />;
    if (status === 'completed') return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (urgency === 'high') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return date.toLocaleDateString();
  };

  return (
    <div className="rounded-xl p-5" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5" style={{ color: '#DAA520' }} />
        <h3 className="text-lg font-semibold text-white">Vehicle Schedule</h3>
        <span className="text-sm text-gray-400">• Next 30 days</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-700 rounded" />
                  <div>
                    <div className="h-4 w-32 bg-gray-700 rounded mb-2" />
                    <div className="h-3 w-48 bg-gray-700 rounded" />
                  </div>
                </div>
                <div className="h-4 w-24 bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 text-gray-400">
          <p>Unable to load schedule</p>
        </div>
      ) : schedule.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-lg font-medium mb-1">All Clear!</p>
          <p className="text-sm">No scheduled maintenance in the next 30 days</p>
        </div>
      ) : (
        <div className="space-y-0">
          {schedule.slice(0, 8).map((item, index) => (
            <div 
              key={item.id} 
              className={`flex items-center justify-between py-3 ${
                index < schedule.length - 1 ? 'border-b border-gray-800' : ''
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(item.status, item.urgency)}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <span 
                      className="px-2 py-0.5 text-xs rounded-full font-medium"
                      style={{
                        backgroundColor: `${getStatusColor(item.status, item.urgency)}20`,
                        color: getStatusColor(item.status, item.urgency),
                      }}
                    >
                      {item.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {item.vehicle.year} {item.vehicle.make} {item.vehicle.model} 
                    {item.vehicle.plate && ` • ${item.vehicle.plate}`}
                  </p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
              <div className="text-right ml-3">
                <p 
                  className="text-sm font-medium"
                  style={{ color: getStatusColor(item.status, item.urgency) }}
                >
                  {formatDate(item.dueDate)}
                </p>
              </div>
            </div>
          ))}
          
          {schedule.length > 8 && (
            <div className="text-center pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-500">
                +{schedule.length - 8} more items in schedule
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
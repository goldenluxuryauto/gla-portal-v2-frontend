import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/admin-layout";
import { buildApiUrl } from "@/lib/queryClient";
import { Activity } from "lucide-react";

interface FeedItem {
  type: string;
  icon: string;
  title: string;
  description: string;
  amount?: number;
  date: string;
  timestamp: number;
  vehicle: string;
  resId: string;
}

export default function OwnerActivityFeed() {
  const { data, isLoading } = useQuery<{ success: boolean; data: { activities: FeedItem[]; total: number } }>({
    queryKey: ["/api/client/activity-feed"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/client/activity-feed?limit=100"), { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const activities = data?.data?.activities || [];
  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

  // Group by date
  const grouped = activities.reduce((acc, item) => {
    const d = new Date(item.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    if (!acc[d]) acc[d] = [];
    acc[d].push(item);
    return acc;
  }, {} as Record<string, FeedItem[]>);

  const typeColors: Record<string, string> = {
    booking_confirmed: '#DAA520',
    pickup: '#22c55e',
    return: '#a855f7',
    earnings: '#22c55e',
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6" style={{ color: '#DAA520' }} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#DAA520' }}>Activity Feed</h1>
            <p className="text-sm text-gray-400 mt-1">Live booking activity for your vehicles</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: '#1a1a1a' }} />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <p className="text-gray-500">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 sticky top-0 bg-background py-1">{date}</h3>
                <div className="space-y-1">
                  {items.map((item, i) => (
                    <div
                      key={`${item.resId}-${item.type}-${i}`}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-800/30 transition"
                      style={{ background: '#1a1a1a', border: '1px solid #222' }}
                    >
                      {/* Timeline dot */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: (typeColors[item.type] || '#666') + '20' }}>
                          {item.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.title}</p>
                        <p className="text-xs text-gray-400 truncate">{item.description}</p>
                      </div>
                      {item.amount && item.amount > 0 && (
                        <div className="flex-shrink-0 text-right">
                          <span className="text-sm font-bold" style={{ color: '#22c55e' }}>+{fmt(item.amount)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

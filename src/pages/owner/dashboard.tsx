import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/admin-layout";
import { buildApiUrl } from "@/lib/queryClient";
import { Car, DollarSign, TrendingUp, Calendar, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface VehicleData {
  id: number;
  make: string;
  model: string;
  year: number;
  plate: string;
  status: string;
  photo: string;
  turoRating: number;
  turoTrips: number;
  turoDailyRate: number;
  color: string;
}

interface DashboardData {
  vehicles: VehicleData[];
  currentMonth: {
    month: string;
    year: number;
    splitPercent: { owner: number; gla: number };
    vehicles: { vehicleName: string; hostPayout: number; ownerShare: number; tripCount: number }[];
    totals: { hostPayout: number; ownerShare: number; glaShare: number; tripCount: number; grossRevenue: number };
  } | null;
  ytd: { hostPayout: number; ownerShare: number; glaShare: number; tripCount: number; grossRevenue: number };
  upcomingBookings: { resId: string; vehicle: string; guest: string; startDate: string; endDate: string; days: number; earned: number; status: string }[];
  recentActivity: { resId: string; vehicle: string; guest: string; startDate: string; endDate: string; days: number; earned: number; status: string }[];
}

export default function OwnerDashboard() {
  const { data, isLoading, error } = useQuery<{ success: boolean; data: DashboardData }>({
    queryKey: ["/api/client/dashboard"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/client/dashboard"), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load dashboard");
      return res.json();
    },
  });

  const dashboard = data?.data;
  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#DAA520' }}>My Fleet</h1>
            <p className="text-sm text-gray-400 mt-1">Your vehicle portfolio at a glance</p>
          </div>
          <div className="text-right text-sm text-gray-400">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-xl p-5 animate-pulse" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
                <div className="h-4 w-20 bg-gray-700 rounded mb-3" />
                <div className="h-8 w-24 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl p-8 text-center" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <p className="text-gray-400">Unable to load dashboard data. Please try again later.</p>
          </div>
        ) : dashboard ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Car className="w-5 h-5" />}
                label="Active Vehicles"
                value={String(dashboard.vehicles.length)}
                color="#DAA520"
              />
              <StatCard
                icon={<DollarSign className="w-5 h-5" />}
                label="This Month Earnings"
                value={fmt(dashboard.currentMonth?.totals?.ownerShare || 0)}
                sub={`${dashboard.currentMonth?.splitPercent?.owner || 70}% of ${fmt(dashboard.currentMonth?.totals?.hostPayout || 0)}`}
                color="#22c55e"
              />
              <StatCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Year-to-Date"
                value={fmt(dashboard.ytd.ownerShare)}
                sub={`${dashboard.ytd.tripCount} trips`}
                color="#DAA520"
              />
              <StatCard
                icon={<Calendar className="w-5 h-5" />}
                label="Upcoming Bookings"
                value={String(dashboard.upcomingBookings.length)}
                color="#a855f7"
              />
            </div>

            {/* Vehicles Grid */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">My Vehicles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {dashboard.vehicles.map((v) => {
                  const monthData = dashboard.currentMonth?.vehicles?.find(
                    (mv) => mv.vehicleName.toLowerCase().includes(v.model.toLowerCase()) || mv.vehicleName.toLowerCase().includes(v.make.toLowerCase())
                  );
                  return (
                    <div
                      key={v.id}
                      className="rounded-xl overflow-hidden transition-all hover:scale-[1.02]"
                      style={{ background: '#1a1a1a', border: '1px solid #333' }}
                    >
                      {v.photo ? (
                        <div className="h-40 overflow-hidden">
                          <img src={v.photo} alt={`${v.year} ${v.make} ${v.model}`} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-40 flex items-center justify-center" style={{ background: '#111' }}>
                          <Car className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white">{v.year} {v.make} {v.model}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            v.status === 'active' || v.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                            v.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {v.status || 'Active'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>{v.plate}</span>
                          {v.turoRating ? <span>⭐ {v.turoRating}</span> : null}
                        </div>
                        {monthData && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">This month</span>
                              <span className="font-medium" style={{ color: '#22c55e' }}>
                                {fmt(monthData.ownerShare)} <span className="text-gray-500 text-xs">({monthData.tripCount} trips)</span>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Bookings & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Upcoming Bookings */}
              <div className="rounded-xl p-5" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4" style={{ color: '#DAA520' }} />
                  <h3 className="font-semibold text-white">Upcoming Bookings</h3>
                </div>
                {dashboard.upcomingBookings.length === 0 ? (
                  <p className="text-gray-500 text-sm">No upcoming bookings</p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.upcomingBookings.slice(0, 5).map((b) => (
                      <div key={b.resId} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-white">{b.vehicle}</p>
                          <p className="text-xs text-gray-400">{b.guest} • {b.days}d</p>
                          <p className="text-xs text-gray-500">
                            {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium" style={{ color: '#22c55e' }}>{fmt(b.earned)}</span>
                          <ArrowUpRight className="w-3 h-3 inline ml-1" style={{ color: '#22c55e' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="rounded-xl p-5" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4" style={{ color: '#DAA520' }} />
                  <h3 className="font-semibold text-white">Recent Activity</h3>
                </div>
                {dashboard.recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.recentActivity.slice(0, 5).map((a) => (
                      <div key={a.resId} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-white">{a.vehicle}</p>
                          <p className="text-xs text-gray-400">{a.guest} • {a.days}d</p>
                          <p className="text-xs text-gray-500">
                            Ended {new Date(a.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium" style={{ color: '#22c55e' }}>{fmt(a.earned)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Split Breakdown */}
            {dashboard.currentMonth && (
              <div className="rounded-xl p-5" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
                <h3 className="font-semibold text-white mb-4">
                  {dashboard.currentMonth.month} {dashboard.currentMonth.year} — Revenue Split
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="rounded-lg p-4 text-center" style={{ background: '#111' }}>
                    <p className="text-xs text-gray-400 mb-1">Total Earned</p>
                    <p className="text-xl font-bold text-white">{fmt(dashboard.currentMonth.totals.hostPayout)}</p>
                  </div>
                  <div className="rounded-lg p-4 text-center" style={{ background: '#111' }}>
                    <p className="text-xs text-gray-400 mb-1">Your Share ({dashboard.currentMonth.splitPercent.owner}%)</p>
                    <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{fmt(dashboard.currentMonth.totals.ownerShare)}</p>
                  </div>
                  <div className="rounded-lg p-4 text-center" style={{ background: '#111' }}>
                    <p className="text-xs text-gray-400 mb-1">GLA Fee ({dashboard.currentMonth.splitPercent.gla}%)</p>
                    <p className="text-xl font-bold text-gray-400">{fmt(dashboard.currentMonth.totals.glaShare)}</p>
                  </div>
                </div>
                {/* Split bar */}
                <div className="w-full h-3 rounded-full overflow-hidden flex" style={{ background: '#333' }}>
                  <div
                    className="h-full rounded-l-full"
                    style={{ width: `${dashboard.currentMonth.splitPercent.owner}%`, background: '#22c55e' }}
                  />
                  <div
                    className="h-full rounded-r-full"
                    style={{ width: `${dashboard.currentMonth.splitPercent.gla}%`, background: '#DAA520' }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span style={{ color: '#22c55e' }}>Owner {dashboard.currentMonth.splitPercent.owner}%</span>
                  <span style={{ color: '#DAA520' }}>GLA {dashboard.currentMonth.splitPercent.gla}%</span>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="rounded-xl p-5" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
      <div className="flex items-center gap-2 mb-3">
        <div style={{ color }}>{icon}</div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

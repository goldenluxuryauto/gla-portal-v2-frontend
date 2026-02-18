import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area
} from "recharts";

const API = "/api/admin/intelligence";
const GLA_GOLD = "#DAA520";
const GLA_DARK = "#1a1a2e";
const COLORS = ["#DAA520", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#e67e22", "#95a5a6"];

function fetchJSON(ep: string) {
  return fetch(`${API}/${ep}`, { credentials: "include" }).then(r => r.json());
}

function Stat({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
      <CardContent className="p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${color || "text-[#DAA520]"}`}>{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

const ttStyle = { backgroundColor: "#1a1a2e", border: "1px solid #DAA520", borderRadius: 8, color: "#fff", fontSize: 12 };

// ============================================
// TAB 1: OVERVIEW
// ============================================
function OverviewTab() {
  const { data, isLoading } = useQuery({ queryKey: ["intel-overview"], queryFn: () => fetchJSON("overview") });
  if (isLoading) return <p className="text-gray-400 p-8 animate-pulse">Loading intelligence data...</p>;
  const d = data?.data;
  if (!d) return <p className="text-red-400 p-8">Failed to load data</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Earned" value={`$${d.totalEarned.toLocaleString()}`} sub={`${d.totalTrips} trips`} />
        <Stat label="Avg Daily Rate" value={`$${d.avgDailyRate}`} sub={`${d.avgTripLength} day avg trip`} />
        <Stat label="Fleet Size" value={d.totalVehicles} sub={`${d.listedVehicles} listed`} />
        <Stat label="Unique Guests" value={d.uniqueGuests} sub={`${d.repeatGuestRate}% repeat rate`} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="✈️ Airport Trips" value={d.airportTrips} sub={`${d.airportPctRevenue}% of revenue`} color="text-green-400" />
        <Stat label="📅 Long-Duration (30+)" value={d.longDurationTrips} sub={`$${d.longDurationEarned.toLocaleString()} earned`} color="text-orange-400" />
        <Stat label="🔒 Non-Refundable" value={`${d.nonRefundablePct}%`} sub={`${d.nonRefundableTrips} trips`} />
        <Stat label="Turo Fees Paid" value={`$${d.totalTuroFees.toLocaleString()}`} sub={`Delivery: $${d.totalDeliveryFees.toLocaleString()}`} color="text-red-400" />
      </div>
      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">📊 Andre's 3-Pillar Strategy Alignment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/5">
            <p className="text-white font-semibold">✈️ Airport Business (+39% growth)</p>
            <p className="text-sm text-gray-300">GLA: {d.airportTrips} airport trips ({d.airportPctRevenue}% revenue). SLC airport-adjacent = gold. Turo only 3% airport share.</p>
          </div>
          <div className="p-3 rounded-lg border border-orange-500/30 bg-orange-500/5">
            <p className="text-white font-semibold">📅 Long-Duration (+94% growth)</p>
            <p className="text-sm text-gray-300">GLA: {d.longDurationTrips} trips of 30+ days ($${d.longDurationEarned.toLocaleString()}). Zero trip fees for guests. Push this harder.</p>
          </div>
          <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5">
            <p className="text-white font-semibold">⚡ Last-Minute = Highest Price</p>
            <p className="text-sm text-gray-300">Per Andre: last-minute bookings are riskiest. Keep prices HIGH. Non-refundable only.</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">Trip Status</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(d.statusBreakdown as Record<string, number>).map(([status, count]) => (
              <Badge key={status} variant="outline" className="border-[#DAA520]/30 text-gray-300 px-3 py-1">{status}: {count}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// TAB 2: VEHICLE PERFORMANCE
// ============================================
function VehiclePerformanceTab() {
  const { data, isLoading } = useQuery({ queryKey: ["intel-rankings"], queryFn: () => fetchJSON("vehicle-rankings") });
  const [view, setView] = useState<"all" | "top" | "bottom" | "zero">("all");
  if (isLoading) return <p className="text-gray-400 p-8 animate-pulse">Loading rankings...</p>;
  const d = data?.data;
  if (!d) return null;

  const list = view === "top" ? d.top10 : view === "bottom" ? d.bottom10 : view === "zero" ? [] : d.rankings;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="🏆 Elite (75+)" value={d.eliteCount} color="text-[#DAA520]" />
        <Stat label="⭐ Strong (50-74)" value={d.strongCount} color="text-green-400" />
        <Stat label="📊 Average (25-49)" value={d.averageCount} color="text-orange-400" />
        <Stat label="⚠️ Under (<25)" value={d.underperformingCount} color="text-red-400" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["all", "top", "bottom", "zero"] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${view === v ? "bg-[#DAA520] text-black" : "bg-[#1a1a2e] text-gray-300 border border-[#DAA520]/20 hover:border-[#DAA520]/50"}`}>
            {v === "all" ? `All (${d.rankings.length})` : v === "top" ? "Top 10 🏆" : v === "bottom" ? "Bottom 10 ⚠️" : `Zero Earners (${d.zeroEarners.length})`}
          </button>
        ))}
      </div>

      {view === "zero" ? (
        <Card className="bg-[#1a1a2e] border-red-500/30">
          <CardHeader><CardTitle className="text-red-400">🔴 Zero-Earning Vehicles ({d.zeroEarners.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {d.zeroEarners.map((v: any, i: number) => (
              <div key={i} className="p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">{v.vehicle}</p>
                    <p className="text-xs text-gray-400">{v.category} · ${v.dailyRate}/day · ⭐ {v.rating} · {v.tripCount} lifetime trips</p>
                  </div>
                </div>
                <p className="text-xs text-orange-400 mt-1">→ {v.recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
          <CardHeader><CardTitle className="text-[#DAA520]">{view === "top" ? "🏆 Top 10 Earners" : view === "bottom" ? "⚠️ Bottom 10 Underperformers" : "Fleet Rankings"}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[700px] overflow-y-auto">
              {list.map((v: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#0f0f23] border border-[#DAA520]/10 hover:border-[#DAA520]/30 transition">
                  <span className="text-lg font-bold text-gray-500 w-8">#{view === "bottom" ? d.rankings.length - d.bottom10.length + i + 1 : (view === "all" ? i + 1 : i + 1)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{v.vehicle}</p>
                    <p className="text-xs text-gray-400">
                      {v.category} · {v.tripCount} trips · ${v.totalEarned.toLocaleString()} · ${v.avgDailyRate}/day · {v.utilization}% util · {v.tripsPerMonth}/mo
                    </p>
                  </div>
                  <div className="w-24 hidden md:block">
                    <Progress value={v.performanceScore} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1 text-right">{v.performanceScore}/100</p>
                  </div>
                  <span className="text-sm whitespace-nowrap">{v.tier}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================
// TAB 3: PRICING INTELLIGENCE
// ============================================
function PricingTab() {
  const { data, isLoading } = useQuery({ queryKey: ["intel-pricing"], queryFn: () => fetchJSON("pricing-insights") });
  const { data: seasonData } = useQuery({ queryKey: ["intel-seasonal"], queryFn: () => fetchJSON("seasonal-patterns") });
  if (isLoading) return <p className="text-gray-400 p-8 animate-pulse">Loading pricing insights...</p>;
  const d = data?.data;
  if (!d) return null;
  const sd = seasonData?.data;

  return (
    <div className="space-y-6">
      <Stat label="Total Insights" value={d.totalInsights} sub="Actionable pricing recommendations" />

      {/* Category Pricing Comparison */}
      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">Category Pricing Comparison</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={d.categoryBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" stroke="#666" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="category" stroke="#666" tick={{ fontSize: 11 }} width={120} />
              <Tooltip contentStyle={ttStyle} />
              <Legend />
              <Bar dataKey="avgRate" name="Avg Rate" fill={GLA_GOLD} radius={[0, 4, 4, 0]} />
              <Bar dataKey="minRate" name="Min" fill="#2ecc71" radius={[0, 4, 4, 0]} />
              <Bar dataKey="maxRate" name="Max" fill="#e74c3c" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Seasonal Patterns */}
      {sd && (
        <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
          <CardHeader><CardTitle className="text-[#DAA520]">🎿 Seasonal Pricing Patterns (SLC)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sd.seasons}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="season" stroke="#666" tick={{ fontSize: 10 }} />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={ttStyle} />
                <Legend />
                <Bar dataKey="avgRate" name="Avg Rate $/day" fill={GLA_GOLD} radius={[4, 4, 0, 0]} />
                <Bar dataKey="trips" name="Trips" fill="#2ecc71" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Pricing Insights */}
      {d.insights.length > 0 && (
        <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
          <CardHeader><CardTitle className="text-[#DAA520]">Pricing Insights</CardTitle></CardHeader>
          <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
            {d.insights.map((ins: any, i: number) => {
              const colors: Record<string, string> = {
                protect_asset: "border-green-500/50 bg-green-500/5",
                price_increase: "border-[#DAA520]/50 bg-[#DAA520]/5",
                price_decrease: "border-red-500/50 bg-red-500/5",
                pricing_consistency: "border-orange-500/50 bg-orange-500/5",
              };
              const labels: Record<string, string> = {
                protect_asset: "🛡️ Protect", price_increase: "📈 Raise", price_decrease: "📉 Lower", pricing_consistency: "⚖️ Stabilize",
              };
              return (
                <div key={i} className={`p-4 rounded-lg border ${colors[ins.type] || ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{labels[ins.type] || ins.type}</Badge>
                    <span className="font-semibold text-white">{ins.vehicle}</span>
                    <span className="text-gray-500 text-sm ml-auto">${ins.currentAvgRate}/day</span>
                  </div>
                  <p className="text-sm text-gray-300">{ins.insight}</p>
                  <p className="text-xs text-[#DAA520] mt-1">→ {ins.suggestedAction}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {d.zeroBookingVehicles.length > 0 && (
        <Card className="bg-[#1a1a2e] border-red-500/30">
          <CardHeader><CardTitle className="text-red-400">Zero-Booking Vehicles ({d.zeroBookingVehicles.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
            {d.zeroBookingVehicles.map((v: any, i: number) => (
              <div key={i} className="p-3 rounded-lg border border-gray-600/30 bg-gray-500/5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-white">{v.vehicle} <span className="text-gray-500 text-sm">${v.dailyRate}/day</span></p>
                  <p className="text-xs text-gray-400">{v.category}</p>
                </div>
                <p className="text-xs text-orange-400 max-w-[300px] text-right">{v.suggestedAction}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================
// TAB 4: REVENUE
// ============================================
function RevenueTab() {
  const { data, isLoading } = useQuery({ queryKey: ["intel-revenue"], queryFn: () => fetchJSON("revenue") });
  if (isLoading) return <p className="text-gray-400 p-8 animate-pulse">Loading revenue data...</p>;
  const d = data?.data;
  if (!d) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">Monthly Revenue</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={d.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#666" tick={{ fontSize: 11 }} />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={ttStyle} />
              <Legend />
              <Area type="monotone" dataKey="earned" name="Earned" fill={GLA_GOLD} fillOpacity={0.3} stroke={GLA_GOLD} />
              <Area type="monotone" dataKey="fees" name="Turo Fees" fill="#e74c3c" fillOpacity={0.2} stroke="#e74c3c" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
          <CardHeader><CardTitle className="text-[#DAA520]">Revenue by Make</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={d.byMake.slice(0, 8)} dataKey="earned" nameKey="make" cx="50%" cy="50%" outerRadius={100}
                  label={({ make, percent }: any) => `${make} ${(percent * 100).toFixed(0)}%`}>
                  {d.byMake.slice(0, 8).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={ttStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
          <CardHeader><CardTitle className="text-[#DAA520]">Daily Rate Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(d.rateDistribution).map(([range, count]) => ({ range, count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="range" stroke="#666" tick={{ fontSize: 11 }} />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={ttStyle} />
                <Bar dataKey="count" fill={GLA_GOLD} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Long vs Short Duration Comparison */}
      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">📅 Duration Revenue Comparison</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/5 text-center">
              <p className="text-xs text-gray-400">Short (&lt;7 days)</p>
              <p className="text-xl font-bold text-green-400">${d.durationComparison.short.earned.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{d.durationComparison.short.trips} trips · ${d.durationComparison.short.avgDaily}/day avg</p>
            </div>
            <div className="p-3 rounded-lg border border-[#DAA520]/30 bg-[#DAA520]/5 text-center">
              <p className="text-xs text-gray-400">Long (7+ days)</p>
              <p className="text-xl font-bold text-[#DAA520]">${d.durationComparison.long.earned.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{d.durationComparison.long.trips} trips · ${d.durationComparison.long.avgDaily}/day avg</p>
            </div>
            <div className="p-3 rounded-lg border border-orange-500/30 bg-orange-500/5 text-center">
              <p className="text-xs text-gray-400">Extra-Long (30+ days)</p>
              <p className="text-xl font-bold text-orange-400">${d.durationComparison.extraLong.earned.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{d.durationComparison.extraLong.trips} trips · ${d.durationComparison.extraLong.avgDaily}/day avg</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d.tripLengthRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="range" stroke="#666" tick={{ fontSize: 11 }} />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={ttStyle} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill={GLA_GOLD} radius={[4, 4, 0, 0]} />
              <Bar dataKey="trips" name="Trips" fill="#2ecc71" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// TAB 5: BOOKING ANALYTICS
// ============================================
function BookingTab() {
  const { data, isLoading } = useQuery({ queryKey: ["intel-booking"], queryFn: () => fetchJSON("booking-analytics") });
  if (isLoading) return <p className="text-gray-400 p-8 animate-pulse">Loading booking analytics...</p>;
  const d = data?.data;
  if (!d) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Avg Lead Time" value={`${d.leadTime.average} days`} sub={`Median: ${d.leadTime.median} days`} />
        <Stat label="Cancellation Rate" value={`${d.cancellations.rate}%`} sub={`${d.cancellations.total} cancelled`} color={d.cancellations.rate > 10 ? "text-red-400" : "text-green-400"} />
        <Stat label="✈️ Airport Trips" value={d.airportComparison.airport.trips} sub={`$${d.airportComparison.airport.earned.toLocaleString()} earned`} color="text-green-400" />
        <Stat label="🏠 Non-Airport" value={d.airportComparison.nonAirport.trips} sub={`$${d.airportComparison.nonAirport.earned.toLocaleString()} earned`} />
      </div>

      {/* Lead Time Distribution */}
      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">📅 Lead Time Distribution (How Far in Advance Guests Book)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={Object.entries(d.leadTime.distribution).map(([range, count]) => ({ range, count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="range" stroke="#666" tick={{ fontSize: 11 }} />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={ttStyle} />
              <Bar dataKey="count" fill={GLA_GOLD} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Day of Week */}
      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">📆 Day-of-Week Booking Patterns</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={d.dayOfWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={ttStyle} />
              <Legend />
              <Bar dataKey="trips" name="Trips" fill={GLA_GOLD} radius={[4, 4, 0, 0]} />
              <Bar dataKey="earned" name="Revenue" fill="#2ecc71" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Airport vs Non-Airport */}
      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">✈️ Airport vs Non-Airport Comparison</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5">
              <p className="text-lg font-bold text-green-400">✈️ Airport Trips</p>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-300">Trips: <span className="text-white font-bold">{d.airportComparison.airport.trips}</span></p>
                <p className="text-sm text-gray-300">Revenue: <span className="text-white font-bold">${d.airportComparison.airport.earned.toLocaleString()}</span></p>
                <p className="text-sm text-gray-300">Avg Daily: <span className="text-white font-bold">${d.airportComparison.airport.avgDaily}</span></p>
                <p className="text-sm text-gray-300">Avg Length: <span className="text-white font-bold">{d.airportComparison.airport.avgTripLength} days</span></p>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-gray-500/30 bg-gray-500/5">
              <p className="text-lg font-bold text-gray-300">🏠 Non-Airport</p>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-300">Trips: <span className="text-white font-bold">{d.airportComparison.nonAirport.trips}</span></p>
                <p className="text-sm text-gray-300">Revenue: <span className="text-white font-bold">${d.airportComparison.nonAirport.earned.toLocaleString()}</span></p>
                <p className="text-sm text-gray-300">Avg Daily: <span className="text-white font-bold">${d.airportComparison.nonAirport.avgDaily}</span></p>
                <p className="text-sm text-gray-300">Avg Length: <span className="text-white font-bold">{d.airportComparison.nonAirport.avgTripLength} days</span></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Velocity */}
      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">📈 Monthly Booking Velocity</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={d.bookingVelocity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#666" tick={{ fontSize: 11 }} />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={ttStyle} />
              <Line type="monotone" dataKey="bookings" stroke={GLA_GOLD} strokeWidth={2} dot={{ fill: GLA_GOLD }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// TAB 6: FLEET COMPOSITION
// ============================================
function FleetCompositionTab() {
  const { data, isLoading } = useQuery({ queryKey: ["intel-fleet"], queryFn: () => fetchJSON("fleet-composition") });
  if (isLoading) return <p className="text-gray-400 p-8 animate-pulse">Loading fleet analysis...</p>;
  const d = data?.data;
  if (!d) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Total Vehicles" value={d.totalVehicles} sub={`${d.totalCategories} categories`} />
        <Stat label="Best ROI Category" value={d.roiRanking[0]?.category || "N/A"} sub={`$${d.roiRanking[0]?.revenuePerVehicle.toLocaleString()}/vehicle`} color="text-green-400" />
      </div>

      {/* Category Revenue */}
      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">Revenue by Vehicle Category</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={d.categories} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" stroke="#666" />
              <YAxis type="category" dataKey="category" stroke="#666" tick={{ fontSize: 11 }} width={120} />
              <Tooltip contentStyle={ttStyle} />
              <Legend />
              <Bar dataKey="totalEarned" name="Total Revenue" fill={GLA_GOLD} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ROI Comparison */}
      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">💰 ROI: Revenue Per Vehicle</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={d.roiRanking} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" stroke="#666" />
              <YAxis type="category" dataKey="category" stroke="#666" tick={{ fontSize: 11 }} width={120} />
              <Tooltip contentStyle={ttStyle} />
              <Legend />
              <Bar dataKey="revenuePerVehicle" name="$/Vehicle" fill="#2ecc71" radius={[0, 4, 4, 0]} />
              <Bar dataKey="tripsPerVehicle" name="Trips/Vehicle" fill={GLA_GOLD} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Details Table */}
      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">Category Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#DAA520]/20 text-gray-400 text-xs">
                  <th className="text-left p-2">Category</th>
                  <th className="text-right p-2">Vehicles</th>
                  <th className="text-right p-2">Trips</th>
                  <th className="text-right p-2">Revenue</th>
                  <th className="text-right p-2">Avg Rate</th>
                  <th className="text-right p-2">Avg Length</th>
                  <th className="text-right p-2">$/Vehicle</th>
                  <th className="text-right p-2">Rating</th>
                </tr>
              </thead>
              <tbody>
                {d.categories.map((c: any, i: number) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-[#0f0f23]">
                    <td className="p-2 text-white font-medium">{c.category}</td>
                    <td className="p-2 text-right text-gray-300">{c.vehicleCount}</td>
                    <td className="p-2 text-right text-gray-300">{c.tripCount}</td>
                    <td className="p-2 text-right text-[#DAA520] font-bold">${c.totalEarned.toLocaleString()}</td>
                    <td className="p-2 text-right text-gray-300">${c.avgDailyRate}</td>
                    <td className="p-2 text-right text-gray-300">{c.avgTripLength}d</td>
                    <td className="p-2 text-right text-green-400">${c.revenuePerVehicle.toLocaleString()}</td>
                    <td className="p-2 text-right text-gray-300">⭐ {c.avgRating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">📋 Fleet Recommendations</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {d.recommendations.map((r: string, i: number) => (
            <div key={i} className="p-3 rounded-lg bg-[#0f0f23] border border-[#DAA520]/10 text-sm text-gray-300">{r}</div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// TAB 7: REVENUE OPTIMIZATION
// ============================================
function OptimizationTab() {
  const { data, isLoading } = useQuery({ queryKey: ["intel-pricing-rec"], queryFn: () => fetchJSON("pricing-recommendations") });
  if (isLoading) return <p className="text-gray-400 p-8 animate-pulse">Loading optimization engine...</p>;
  const d = data?.data;
  if (!d) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="🔴 Underpriced" value={d.underpriced} color="text-red-400" />
        <Stat label="🟠 Overpriced" value={d.overpriced} color="text-orange-400" />
        <Stat label="✅ Well-Priced" value={d.wellPriced} color="text-green-400" />
        <Stat label="💰 Monthly Gap" value={`$${d.totalMonthlyGap.toLocaleString()}`} sub="Potential missed revenue/month" color="text-[#DAA520]" />
      </div>

      {/* Strategy Alignment */}
      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">🎯 Andre's 3-Pillar Strategy Alignment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {Object.values(d.strategyAlignment).map((p: any, i: number) => (
            <div key={i} className="p-3 rounded-lg bg-[#0f0f23] border border-[#DAA520]/10">
              <p className="font-semibold text-white">{p.label}: {p.status}</p>
              <p className="text-sm text-gray-400">{p.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pricing Recommendations Table */}
      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">Vehicle Pricing Recommendations</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#DAA520]/20 text-gray-400 text-xs">
                  <th className="text-left p-2">Vehicle</th>
                  <th className="text-right p-2">Current</th>
                  <th className="text-right p-2">Optimal</th>
                  <th className="text-right p-2">Gap</th>
                  <th className="text-right p-2">30+ Day</th>
                  <th className="text-right p-2">Last Min</th>
                  <th className="text-left p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {d.recommendations.slice(0, 30).map((r: any, i: number) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-[#0f0f23]">
                    <td className="p-2 text-white">
                      <p className="font-medium truncate max-w-[200px]">{r.vehicle}</p>
                      <p className="text-xs text-gray-500">{r.category} · {r.tripCount} trips · ⭐{r.rating}</p>
                    </td>
                    <td className="p-2 text-right text-gray-300">${r.currentRate}</td>
                    <td className="p-2 text-right text-[#DAA520] font-bold">${r.optimalRate}</td>
                    <td className={`p-2 text-right font-bold ${r.gap > 0 ? "text-red-400" : r.gap < -5 ? "text-orange-400" : "text-green-400"}`}>
                      {r.gap > 0 ? "+" : ""}{r.gap}
                    </td>
                    <td className="p-2 text-right text-gray-300">${r.longDurationRate}</td>
                    <td className="p-2 text-right text-gray-300">${r.lastMinuteRate}</td>
                    <td className="p-2 text-left text-xs">{r.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// TAB 8: WORLD CUP 2026
// ============================================
function WorldCupTab() {
  const { data, isLoading } = useQuery({ queryKey: ["intel-wc"], queryFn: () => fetchJSON("world-cup") });
  if (isLoading) return <p className="text-gray-400 p-8 animate-pulse">Loading World Cup data...</p>;
  const d = data?.data;
  if (!d) return null;

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border-2 border-[#DAA520] bg-[#DAA520]/10">
        <h2 className="text-2xl font-bold text-[#DAA520]">🏟️ FIFA World Cup 2026 — SLC Prep</h2>
        <p className="text-gray-300 mt-1">June 11 - July 19, 2026 · Salt Lake City is a host venue</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Fleet Size" value={d.fleetReadiness.totalVehicles} sub={`${d.fleetReadiness.listedVehicles} listed`} />
        <Stat label="Normal Summer Rev" value={`$${d.revenueForecast.normalSummerRevenue.toLocaleString()}`} sub="Without World Cup" />
        <Stat label="🏟️ World Cup Rev" value={`$${d.revenueForecast.worldCupRevenue.toLocaleString()}`} sub="Estimated with WC" color="text-green-400" />
        <Stat label="💰 Incremental" value={`+$${d.revenueForecast.incrementalOpportunity.toLocaleString()}`} sub="Extra opportunity" color="text-[#DAA520]" />
      </div>

      {/* Fleet Readiness */}
      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">🚗 Fleet Readiness by Category</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={Object.entries(d.fleetReadiness.byCategory).map(([cat, count]) => ({ category: cat, vehicles: count }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" stroke="#666" />
              <YAxis type="category" dataKey="category" stroke="#666" tick={{ fontSize: 11 }} width={120} />
              <Tooltip contentStyle={ttStyle} />
              <Bar dataKey="vehicles" fill={GLA_GOLD} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pricing Strategy */}
      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">💰 Pricing Strategy by Period</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(d.pricingStrategy).map(([key, p]: [string, any]) => (
            <div key={key} className="p-4 rounded-lg bg-[#0f0f23] border border-[#DAA520]/10">
              <div className="flex justify-between items-center mb-1">
                <p className="font-semibold text-white">{p.period}</p>
                <Badge className="bg-[#DAA520] text-black">{p.multiplier}</Badge>
              </div>
              <p className="text-sm text-gray-300">{p.strategy}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SLC Match Schedule */}
      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">⚽ SLC Match Schedule (Estimated)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {d.dates.slcGroupStageGames.map((g: any, i: number) => (
            <div key={i} className="p-3 rounded-lg bg-[#0f0f23] border border-[#DAA520]/10 flex justify-between items-center">
              <div>
                <p className="font-semibold text-white">{g.match}</p>
                <p className="text-xs text-gray-400">{g.venue}</p>
              </div>
              <Badge variant="outline" className="border-[#DAA520]/40 text-[#DAA520]">{g.date}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">📅 Preparation Timeline</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {d.timeline.map((t: any, i: number) => {
              const isPast = new Date(t.date) < new Date();
              const isNow = new Date(t.date) <= new Date(Date.now() + 30 * 86400000) && !isPast;
              return (
                <div key={i} className={`p-3 rounded-lg border flex items-center gap-3 ${isNow ? "border-[#DAA520] bg-[#DAA520]/10" : isPast ? "border-gray-700 bg-gray-800/30" : "border-[#DAA520]/10 bg-[#0f0f23]"}`}>
                  <div className={`w-3 h-3 rounded-full ${isPast ? "bg-gray-600" : isNow ? "bg-[#DAA520] animate-pulse" : "bg-[#DAA520]/30"}`} />
                  <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">{t.date}</Badge>
                  <p className={`text-sm ${isPast ? "text-gray-500" : "text-gray-300"}`}>{t.action}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">📋 Action Items</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {d.recommendations.map((r: string, i: number) => (
            <div key={i} className="p-3 rounded-lg bg-[#0f0f23] border border-[#DAA520]/10 text-sm text-gray-300">{r}</div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// GUESTS TAB
// ============================================
function GuestsTab() {
  const { data, isLoading } = useQuery({ queryKey: ["intel-guests"], queryFn: () => fetchJSON("guests") });
  if (isLoading) return <p className="text-gray-400 p-8 animate-pulse">Loading guest data...</p>;
  const d = data?.data;
  if (!d) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Guests" value={d.totalGuests} />
        <Stat label="Repeat Guests" value={d.repeatGuests} sub={`${d.repeatRate}% repeat rate`} color="text-green-400" />
        <Stat label="New Guests" value={d.newGuests} />
        <Stat label="Avg Trips/Guest" value={d.avgTripsPerGuest} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
          <CardHeader><CardTitle className="text-[#DAA520]">Guest Rating Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={Object.entries(d.ratingDistribution).map(([range, count]) => ({ range, count }))} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={90}
                  label={({ range, percent }: any) => `${range} ${(percent * 100).toFixed(0)}%`}>
                  {Object.keys(d.ratingDistribution).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={ttStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
          <CardHeader><CardTitle className="text-[#DAA520]">Protection Plan Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={Object.entries(d.protectionPlanBreakdown).map(([plan, count]) => ({ plan, count }))} dataKey="count" nameKey="plan" cx="50%" cy="50%" outerRadius={90}
                  label={({ plan, percent }: any) => `${plan} ${(percent * 100).toFixed(0)}%`}>
                  {Object.keys(d.protectionPlanBreakdown).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={ttStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1a1a2e] border-[#DAA520]/20">
        <CardHeader><CardTitle className="text-[#DAA520]">Top Guests by Revenue</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {d.topGuests.map((g: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-[#0f0f23] border border-[#DAA520]/10">
                <span className="text-lg font-bold text-[#DAA520] w-8">#{i + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold text-white">{g.name}</p>
                  <p className="text-xs text-gray-400">{g.trips} trips · {g.vehicleCount} vehicles · ⭐ {g.rating}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#DAA520] font-bold">${g.totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">${g.avgPerTrip}/trip</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================
export default function IntelligencePage() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="p-6 space-y-6 min-h-screen bg-[#0f0f23]">
      <div>
        <h1 className="text-3xl font-bold text-[#DAA520]">🧠 Turo Intelligence</h1>
        <p className="text-gray-400 mt-1">Data-driven fleet analytics, pricing optimization & revenue intelligence</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[#1a1a2e] border border-[#DAA520]/20 flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="fleet">Fleet Mix</TabsTrigger>
          <TabsTrigger value="optimization">Optimize</TabsTrigger>
          <TabsTrigger value="guests">Guests</TabsTrigger>
          <TabsTrigger value="worldcup">🏟️ World Cup</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="vehicles"><VehiclePerformanceTab /></TabsContent>
        <TabsContent value="pricing"><PricingTab /></TabsContent>
        <TabsContent value="revenue"><RevenueTab /></TabsContent>
        <TabsContent value="bookings"><BookingTab /></TabsContent>
        <TabsContent value="fleet"><FleetCompositionTab /></TabsContent>
        <TabsContent value="optimization"><OptimizationTab /></TabsContent>
        <TabsContent value="guests"><GuestsTab /></TabsContent>
        <TabsContent value="worldcup"><WorldCupTab /></TabsContent>
      </Tabs>
    </div>
  );
}

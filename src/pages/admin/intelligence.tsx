import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";

const API = "/api/admin/intelligence";

const GLA_GOLD = "#C9A84C";
const GLA_DARK = "#1a1a2e";
const CHART_COLORS = ["#C9A84C", "#e74c3c", "#2ecc71", "#9b59b6", "#f39c12", "#1abc9c"];

function fetchJSON(endpoint: string) {
  return fetch(`${API}/${endpoint}`, { credentials: "include" }).then(r => r.json());
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card className="bg-[#1a1a2e] border-[#C9A84C]/20">
      <CardContent className="p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-[#C9A84C] mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function OverviewTab() {
  const { data, isLoading } = useQuery({ queryKey: ["intel-overview"], queryFn: () => fetchJSON("overview") });
  if (isLoading) return <div className="text-gray-400 p-8">Loading intelligence data...</div>;
  const d = data?.data;
  if (!d) return <div className="text-red-400 p-8">Failed to load data</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Earned" value={`$${d.totalEarned.toLocaleString()}`} sub={`${d.totalTrips} trips`} />
        <StatCard label="Avg Daily Rate" value={`$${d.avgDailyRate}`} sub={`${d.avgTripLength} day avg trip`} />
        <StatCard label="Fleet Size" value={d.totalVehicles} sub={`${d.listedVehicles} listed`} />
        <StatCard label="Unique Guests" value={d.uniqueGuests} sub={`${d.repeatGuestRate}% repeat rate`} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Turo Fees Paid" value={`$${d.totalTuroFees.toLocaleString()}`} />
        <StatCard label="Delivery Fees" value={`$${d.totalDeliveryFees.toLocaleString()}`} />
        <StatCard label="Trips w/ Extras" value={d.tripsWithExtras} />
        <StatCard label="Repeat Guests" value={d.repeatGuests} />
      </div>
      <Card className="bg-[#1a1a2e] border-[#C9A84C]/20">
        <CardHeader><CardTitle className="text-[#C9A84C]">Trip Status</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(d.statusBreakdown as Record<string, number>).map(([status, count]) => (
              <Badge key={status} variant="outline" className="border-[#C9A84C]/30 text-gray-300 px-3 py-1">
                {status}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VehicleRankingsTab() {
  const { data, isLoading } = useQuery({ queryKey: ["intel-rankings"], queryFn: () => fetchJSON("vehicle-rankings") });
  if (isLoading) return <div className="text-gray-400 p-8">Loading rankings...</div>;
  const d = data?.data;
  if (!d) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Vehicles with Trips" value={d.totalVehiclesWithTrips} />
        <StatCard label="Elite Performers" value={d.eliteCount} sub="Score ≥ 75" />
        <StatCard label="Underperforming" value={d.underperformingCount} sub="Score < 25" />
      </div>
      <Card className="bg-[#1a1a2e] border-[#C9A84C]/20">
        <CardHeader><CardTitle className="text-[#C9A84C]">Fleet Rankings</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {d.rankings.map((v: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-[#0f0f23] border border-[#C9A84C]/10">
                <span className="text-lg font-bold text-gray-500 w-8">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{v.vehicle}</p>
                  <p className="text-xs text-gray-400">
                    {v.tripCount} trips · ${v.totalEarned.toLocaleString()} earned · ${v.avgDailyRate}/day
                  </p>
                </div>
                <div className="w-32">
                  <Progress value={v.performanceScore} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1 text-right">{v.performanceScore}/100</p>
                </div>
                <span className="text-sm whitespace-nowrap">{v.tier}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RevenueTab() {
  const { data, isLoading } = useQuery({ queryKey: ["intel-revenue"], queryFn: () => fetchJSON("revenue") });
  if (isLoading) return <div className="text-gray-400 p-8">Loading revenue data...</div>;
  const d = data?.data;
  if (!d) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1a2e] border-[#C9A84C]/20">
        <CardHeader><CardTitle className="text-[#C9A84C]">Monthly Revenue</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={d.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#666" tick={{ fontSize: 12 }} />
              <YAxis stroke="#666" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: GLA_DARK, border: `1px solid ${GLA_GOLD}` }} />
              <Legend />
              <Bar dataKey="earned" name="Earned" fill={GLA_GOLD} radius={[4, 4, 0, 0]} />
              <Bar dataKey="fees" name="Turo Fees" fill="#e74c3c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-[#1a1a2e] border-[#C9A84C]/20">
          <CardHeader><CardTitle className="text-[#C9A84C]">Revenue by Make</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={d.byMake.slice(0, 8)} dataKey="earned" nameKey="make" cx="50%" cy="50%" outerRadius={100} label={({ make, percent }: any) => `${make} ${(percent * 100).toFixed(0)}%`}>
                  {d.byMake.slice(0, 8).map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: GLA_DARK, border: `1px solid ${GLA_GOLD}` }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-[#C9A84C]/20">
          <CardHeader><CardTitle className="text-[#C9A84C]">Daily Rate Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(d.rateDistribution).map(([range, count]) => ({ range, count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="range" stroke="#666" tick={{ fontSize: 11 }} />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: GLA_DARK, border: `1px solid ${GLA_GOLD}` }} />
                <Bar dataKey="count" fill={GLA_GOLD} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1a1a2e] border-[#C9A84C]/20">
        <CardHeader><CardTitle className="text-[#C9A84C]">Trip Length Distribution</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={Object.entries(d.tripLengthDistribution).map(([range, count]) => ({ range, count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="range" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: GLA_DARK, border: `1px solid ${GLA_GOLD}` }} />
              <Bar dataKey="count" fill="#2ecc71" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function GuestsTab() {
  const { data, isLoading } = useQuery({ queryKey: ["intel-guests"], queryFn: () => fetchJSON("guests") });
  if (isLoading) return <div className="text-gray-400 p-8">Loading guest data...</div>;
  const d = data?.data;
  if (!d) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Guests" value={d.totalGuests} />
        <StatCard label="Avg Trips/Guest" value={d.avgTripsPerGuest} />
        <StatCard label="Top 25 Listed" value={d.topGuests.length} />
      </div>

      <Card className="bg-[#1a1a2e] border-[#C9A84C]/20">
        <CardHeader><CardTitle className="text-[#C9A84C]">Top Guests by Revenue</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {d.topGuests.map((g: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-[#0f0f23] border border-[#C9A84C]/10">
                <span className="text-lg font-bold text-[#C9A84C] w-8">#{i + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold text-white">{g.name}</p>
                  <p className="text-xs text-gray-400">{g.trips} trips · {g.vehicleCount} vehicles · ⭐ {g.rating}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#C9A84C] font-bold">${g.totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">${g.avgPerTrip}/trip</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a2e] border-[#C9A84C]/20">
        <CardHeader><CardTitle className="text-[#C9A84C]">Protection Plan Breakdown</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={Object.entries(d.protectionPlanBreakdown).map(([plan, count]) => ({ plan, count }))} dataKey="count" nameKey="plan" cx="50%" cy="50%" outerRadius={90} label={({ plan, percent }: any) => `${plan} ${(percent * 100).toFixed(0)}%`}>
                {Object.keys(d.protectionPlanBreakdown).map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: GLA_DARK, border: `1px solid ${GLA_GOLD}` }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function PricingTab() {
  const { data, isLoading } = useQuery({ queryKey: ["intel-pricing"], queryFn: () => fetchJSON("pricing-insights") });
  if (isLoading) return <div className="text-gray-400 p-8">Loading pricing insights...</div>;
  const d = data?.data;
  if (!d) return null;

  const typeColors: Record<string, string> = {
    protect_asset: "border-green-500/50 bg-green-500/5",
    price_increase: "border-yellow-500/50 bg-yellow-500/5",
    price_decrease: "border-red-500/50 bg-red-500/5",
    pricing_consistency: "border-purple-500/50 bg-purple-500/5",
    zero_bookings: "border-gray-500/50 bg-gray-500/5",
  };

  const typeLabels: Record<string, string> = {
    protect_asset: "🛡️ Protect",
    price_increase: "📈 Raise Price",
    price_decrease: "📉 Lower Price",
    pricing_consistency: "⚖️ Stabilize",
    zero_bookings: "🔍 Needs Attention",
  };

  return (
    <div className="space-y-6">
      <StatCard label="Total Insights" value={d.totalInsights} sub="Actionable recommendations" />

      {d.insights.length > 0 && (
        <Card className="bg-[#1a1a2e] border-[#C9A84C]/20">
          <CardHeader><CardTitle className="text-[#C9A84C]">Pricing Insights</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {d.insights.map((ins: any, i: number) => (
              <div key={i} className={`p-4 rounded-lg border ${typeColors[ins.type] || ""}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{typeLabels[ins.type] || ins.type}</Badge>
                  <span className="font-semibold text-white">{ins.vehicle}</span>
                  <span className="text-gray-500 text-sm ml-auto">${ins.currentAvgRate}/day avg</span>
                </div>
                <p className="text-sm text-gray-300">{ins.insight}</p>
                <p className="text-xs text-[#C9A84C] mt-1">→ {ins.suggestedAction}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {d.zeroBookingVehicles.length > 0 && (
        <Card className="bg-[#1a1a2e] border-[#C9A84C]/20">
          <CardHeader><CardTitle className="text-[#C9A84C]">Zero-Booking Vehicles ({d.zeroBookingVehicles.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {d.zeroBookingVehicles.map((v: any, i: number) => (
              <div key={i} className="p-3 rounded-lg border border-gray-600/30 bg-gray-500/5">
                <p className="font-semibold text-white">{v.vehicle} <span className="text-gray-500 text-sm">${v.dailyRate}/day</span></p>
                <p className="text-xs text-gray-400 mt-1">→ {v.suggestedAction}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function IntelligencePage() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="p-6 space-y-6 min-h-screen bg-[#0f0f23]">
      <div>
        <h1 className="text-3xl font-bold text-[#C9A84C]">🧠 Turo Intelligence</h1>
        <p className="text-gray-400 mt-1">Data-driven fleet analytics & pricing optimization</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[#1a1a2e] border border-[#C9A84C]/20">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rankings">Vehicle Rankings</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="guests">Guests</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="rankings"><VehicleRankingsTab /></TabsContent>
        <TabsContent value="revenue"><RevenueTab /></TabsContent>
        <TabsContent value="guests"><GuestsTab /></TabsContent>
        <TabsContent value="pricing"><PricingTab /></TabsContent>
      </Tabs>
    </div>
  );
}

import React, { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  FileText,
  Download,
  Car,
  Users,
  RefreshCw,
} from "lucide-react";

// ============================================================
// Types
// ============================================================

interface MonthlyPL {
  month: number;
  monthName: string;
  grossRevenue: number;
  turoFees: number;
  hostPayout: number;
  glaShare: number;
  ownerShare: number;
  tripCount: number;
  deliveryIncome: number;
}

interface QuarterlyPL {
  quarter: number;
  label: string;
  grossRevenue: number;
  turoFees: number;
  hostPayout: number;
  glaShare: number;
  ownerShare: number;
  tripCount: number;
}

interface VehiclePL {
  vehicleName: string;
  carId: number | null;
  ownerName: string | null;
  grossRevenue: number;
  turoFees: number;
  hostPayout: number;
  glaShare: number;
  ownerShare: number;
  tripCount: number;
  avgPerTrip: number;
}

interface PLSummary {
  year: number;
  monthly: MonthlyPL[];
  yearTotal: {
    grossRevenue: number;
    turoFees: number;
    hostPayout: number;
    glaShare: number;
    ownerShare: number;
    tripCount: number;
    deliveryIncome: number;
  };
  quarterly: QuarterlyPL[];
  vehicleBreakdown: VehiclePL[];
  topEarners: VehiclePL[];
  underperformers: VehiclePL[];
}

interface SplitResult {
  clientId: number;
  clientName: string;
  month: string;
  year: number;
  monthNum: number;
  splitPercent: { owner: number; gla: number };
  vehicles: {
    vehicleName: string;
    hostPayout: number;
    ownerShare: number;
    glaShare: number;
    tripCount: number;
  }[];
  totals: {
    hostPayout: number;
    ownerShare: number;
    glaShare: number;
    tripCount: number;
    grossRevenue: number;
    turoFees: number;
  };
}

interface ClientOption {
  id: number;
  firstName: string;
  lastName: string;
  vehicleCount: number;
}

// ============================================================
// Helpers
// ============================================================

function fmt(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtK(n: number): string {
  if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "K";
  return fmt(n);
}

// Simple bar chart component (no external lib needed)
function MiniBar({ data, maxVal, color }: { data: number[]; maxVal: number; color: string }) {
  return (
    <div className="flex items-end gap-[3px] h-[80px]">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm min-w-[6px] transition-all"
          style={{
            height: `${maxVal > 0 ? (v / maxVal) * 100 : 0}%`,
            backgroundColor: v > 0 ? color : "#333",
            minHeight: v > 0 ? "3px" : "1px",
          }}
          title={`${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i]}: ${fmt(v)}`}
        />
      ))}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function FinancialsPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [activeTab, setActiveTab] = useState<"overview" | "vehicles" | "splits" | "statements">("overview");
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [statementDialog, setStatementDialog] = useState(false);

  // Fetch P&L data
  const { data: plData, isLoading: plLoading, refetch: refetchPL } = useQuery<{ success: boolean; data: PLSummary }>({
    queryKey: ["/api/admin/financial/pl", selectedYear],
    queryFn: async () => {
      const res = await fetch(buildApiUrl(`/api/admin/financial/pl?year=${selectedYear}`), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch P&L");
      return res.json();
    },
  });

  // Fetch splits
  const { data: splitsData, isLoading: splitsLoading } = useQuery<{ success: boolean; data: SplitResult[] }>({
    queryKey: ["/api/admin/financial/splits", selectedYear, selectedMonth],
    queryFn: async () => {
      const res = await fetch(
        buildApiUrl(`/api/admin/financial/splits?year=${selectedYear}&month=${selectedMonth}`),
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch splits");
      return res.json();
    },
    enabled: activeTab === "splits",
  });

  // Fetch clients
  const { data: clientsData } = useQuery<{ success: boolean; data: ClientOption[] }>({
    queryKey: ["/api/admin/financial/clients"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/admin/financial/clients"), { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: activeTab === "statements",
  });

  const pl = plData?.data;
  const splits = splitsData?.data || [];
  const clients = clientsData?.data || [];

  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const monthOptions = [
    { value: "1", label: "January" }, { value: "2", label: "February" },
    { value: "3", label: "March" }, { value: "4", label: "April" },
    { value: "5", label: "May" }, { value: "6", label: "June" },
    { value: "7", label: "July" }, { value: "8", label: "August" },
    { value: "9", label: "September" }, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" },
  ];

  // Revenue bar chart data
  const monthlyRevenue = pl?.monthly.map(m => m.hostPayout) || Array(12).fill(0);
  const maxRevenue = Math.max(...monthlyRevenue, 1);

  // Sync button handler
  const [syncing, setSyncing] = useState(false);
  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(buildApiUrl("/api/admin/financial/sync-earnings"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ year: parseInt(selectedYear) }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Synced ${data.synced} records${data.errors?.length ? ` (${data.errors.length} errors)` : ""}`);
        refetchPL();
      } else {
        alert(`❌ Sync failed: ${data.error}`);
      }
    } catch (err) {
      alert("❌ Sync failed");
    }
    setSyncing(false);
  };

  // Open statement
  const openStatement = () => {
    if (!selectedClient || !selectedMonth) return;
    const url = buildApiUrl(
      `/api/admin/financial/statement?clientId=${selectedClient}&year=${selectedYear}&month=${selectedMonth}&format=html`
    );
    window.open(url, "_blank");
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-[#DAA520]" />
              Financial Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">P&L overview, splits, and owner statements</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px] bg-[#1a1a2e] border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-gray-700">
                {yearOptions.map(y => (
                  <SelectItem key={y} value={String(y)} className="text-white">{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="border-[#DAA520] text-[#DAA520] hover:bg-[#DAA520]/10"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync Turo Data"}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { key: "overview", label: "Overview", icon: PieChart },
            { key: "vehicles", label: "Vehicle Breakdown", icon: Car },
            { key: "splits", label: "Owner Splits", icon: Users },
            { key: "statements", label: "Statements", icon: FileText },
          ].map(tab => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.key as any)}
              className={activeTab === tab.key
                ? "bg-[#DAA520] text-black hover:bg-[#B8860B]"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
              }
            >
              <tab.icon className="h-4 w-4 mr-1" />
              {tab.label}
            </Button>
          ))}
        </div>

        {plLoading && (
          <div className="text-gray-400 text-center py-20">Loading financial data...</div>
        )}

        {/* ============================================================ */}
        {/* OVERVIEW TAB */}
        {/* ============================================================ */}
        {activeTab === "overview" && pl && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-[#1a1a2e] border-gray-800">
                <CardContent className="p-4">
                  <p className="text-gray-400 text-xs uppercase">Gross Revenue</p>
                  <p className="text-2xl font-bold text-white">{fmtK(pl.yearTotal.grossRevenue)}</p>
                  <p className="text-gray-500 text-xs mt-1">{pl.yearTotal.tripCount} trips</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a2e] border-gray-800">
                <CardContent className="p-4">
                  <p className="text-gray-400 text-xs uppercase">Host Payouts</p>
                  <p className="text-2xl font-bold text-green-400">{fmtK(pl.yearTotal.hostPayout)}</p>
                  <p className="text-gray-500 text-xs mt-1">After Turo fees</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a2e] border-gray-800">
                <CardContent className="p-4">
                  <p className="text-gray-400 text-xs uppercase">GLA Share (30%)</p>
                  <p className="text-2xl font-bold text-[#DAA520]">{fmtK(pl.yearTotal.glaShare)}</p>
                  <p className="text-gray-500 text-xs mt-1">Management revenue</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a2e] border-gray-800">
                <CardContent className="p-4">
                  <p className="text-gray-400 text-xs uppercase">Turo Fees</p>
                  <p className="text-2xl font-bold text-red-400">({fmtK(pl.yearTotal.turoFees)})</p>
                  <p className="text-gray-500 text-xs mt-1">Platform fees</p>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Revenue Chart */}
            <Card className="bg-[#1a1a2e] border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Monthly Revenue — {selectedYear}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <MiniBar data={monthlyRevenue} maxVal={maxRevenue} color="#DAA520" />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    {["J","F","M","A","M","J","J","A","S","O","N","D"].map((m, i) => (
                      <span key={i} className="flex-1 text-center">{m}</span>
                    ))}
                  </div>
                </div>

                {/* Monthly table */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 text-xs uppercase border-b border-gray-800">
                        <th className="text-left py-2 px-2">Month</th>
                        <th className="text-right py-2 px-2">Trips</th>
                        <th className="text-right py-2 px-2">Gross</th>
                        <th className="text-right py-2 px-2">Turo Fees</th>
                        <th className="text-right py-2 px-2">Host Payout</th>
                        <th className="text-right py-2 px-2">GLA (30%)</th>
                        <th className="text-right py-2 px-2">Owner (70%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pl.monthly.filter(m => m.tripCount > 0).map(m => (
                        <tr key={m.month} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="py-2 px-2 text-white font-medium">{m.monthName}</td>
                          <td className="py-2 px-2 text-right text-gray-300">{m.tripCount}</td>
                          <td className="py-2 px-2 text-right text-white">{fmt(m.grossRevenue)}</td>
                          <td className="py-2 px-2 text-right text-red-400">({fmt(m.turoFees)})</td>
                          <td className="py-2 px-2 text-right text-green-400">{fmt(m.hostPayout)}</td>
                          <td className="py-2 px-2 text-right text-[#DAA520]">{fmt(m.glaShare)}</td>
                          <td className="py-2 px-2 text-right text-gray-300">{fmt(m.ownerShare)}</td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-gray-800/50">
                        <td className="py-2 px-2 text-white">TOTAL</td>
                        <td className="py-2 px-2 text-right text-white">{pl.yearTotal.tripCount}</td>
                        <td className="py-2 px-2 text-right text-white">{fmt(pl.yearTotal.grossRevenue)}</td>
                        <td className="py-2 px-2 text-right text-red-400">({fmt(pl.yearTotal.turoFees)})</td>
                        <td className="py-2 px-2 text-right text-green-400">{fmt(pl.yearTotal.hostPayout)}</td>
                        <td className="py-2 px-2 text-right text-[#DAA520]">{fmt(pl.yearTotal.glaShare)}</td>
                        <td className="py-2 px-2 text-right text-gray-300">{fmt(pl.yearTotal.ownerShare)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Quarterly */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {pl.quarterly.map(q => (
                <Card key={q.quarter} className="bg-[#1a1a2e] border-gray-800">
                  <CardContent className="p-4">
                    <p className="text-gray-400 text-xs uppercase">{q.label} {selectedYear}</p>
                    <p className="text-xl font-bold text-white">{fmtK(q.hostPayout)}</p>
                    <div className="flex justify-between mt-2 text-xs">
                      <span className="text-[#DAA520]">GLA: {fmtK(q.glaShare)}</span>
                      <span className="text-gray-400">{q.tripCount} trips</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* ============================================================ */}
        {/* VEHICLES TAB */}
        {/* ============================================================ */}
        {activeTab === "vehicles" && pl && (
          <>
            {/* Top Earners */}
            <Card className="bg-[#1a1a2e] border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Top Earners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 text-xs uppercase border-b border-gray-800">
                        <th className="text-left py-2 px-2">#</th>
                        <th className="text-left py-2 px-2">Vehicle</th>
                        <th className="text-left py-2 px-2">Owner</th>
                        <th className="text-right py-2 px-2">Trips</th>
                        <th className="text-right py-2 px-2">Gross</th>
                        <th className="text-right py-2 px-2">Payout</th>
                        <th className="text-right py-2 px-2">Avg/Trip</th>
                        <th className="text-right py-2 px-2">GLA Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pl.topEarners.map((v, i) => (
                        <tr key={v.vehicleName} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="py-2 px-2 text-[#DAA520] font-bold">{i + 1}</td>
                          <td className="py-2 px-2 text-white font-medium">{v.vehicleName}</td>
                          <td className="py-2 px-2 text-gray-400">{v.ownerName || "—"}</td>
                          <td className="py-2 px-2 text-right text-gray-300">{v.tripCount}</td>
                          <td className="py-2 px-2 text-right text-white">{fmt(v.grossRevenue)}</td>
                          <td className="py-2 px-2 text-right text-green-400">{fmt(v.hostPayout)}</td>
                          <td className="py-2 px-2 text-right text-gray-300">{fmt(v.avgPerTrip)}</td>
                          <td className="py-2 px-2 text-right text-[#DAA520]">{fmt(v.glaShare)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* All Vehicles */}
            <Card className="bg-[#1a1a2e] border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">All Vehicles ({pl.vehicleBreakdown.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[#1a1a2e]">
                      <tr className="text-gray-400 text-xs uppercase border-b border-gray-800">
                        <th className="text-left py-2 px-2">Vehicle</th>
                        <th className="text-right py-2 px-2">Trips</th>
                        <th className="text-right py-2 px-2">Gross</th>
                        <th className="text-right py-2 px-2">Fees</th>
                        <th className="text-right py-2 px-2">Payout</th>
                        <th className="text-right py-2 px-2">Avg/Trip</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pl.vehicleBreakdown.map(v => (
                        <tr key={v.vehicleName} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="py-2 px-2 text-white">{v.vehicleName}</td>
                          <td className="py-2 px-2 text-right text-gray-300">{v.tripCount}</td>
                          <td className="py-2 px-2 text-right text-white">{fmt(v.grossRevenue)}</td>
                          <td className="py-2 px-2 text-right text-red-400">({fmt(v.turoFees)})</td>
                          <td className="py-2 px-2 text-right text-green-400">{fmt(v.hostPayout)}</td>
                          <td className="py-2 px-2 text-right text-gray-300">{fmt(v.avgPerTrip)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Underperformers */}
            <Card className="bg-[#1a1a2e] border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-400" />
                  Lowest Avg Revenue Per Trip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 text-xs uppercase border-b border-gray-800">
                        <th className="text-left py-2 px-2">Vehicle</th>
                        <th className="text-right py-2 px-2">Trips</th>
                        <th className="text-right py-2 px-2">Payout</th>
                        <th className="text-right py-2 px-2">Avg/Trip</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pl.underperformers.map(v => (
                        <tr key={v.vehicleName} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="py-2 px-2 text-white">{v.vehicleName}</td>
                          <td className="py-2 px-2 text-right text-gray-300">{v.tripCount}</td>
                          <td className="py-2 px-2 text-right text-green-400">{fmt(v.hostPayout)}</td>
                          <td className="py-2 px-2 text-right text-orange-400 font-bold">{fmt(v.avgPerTrip)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ============================================================ */}
        {/* SPLITS TAB */}
        {/* ============================================================ */}
        {activeTab === "splits" && (
          <>
            <div className="flex items-center gap-3">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[160px] bg-[#1a1a2e] border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-gray-700">
                  {monthOptions.map(m => (
                    <SelectItem key={m.value} value={m.value} className="text-white">{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {splitsLoading && <p className="text-gray-400">Loading splits...</p>}

            {splits.length === 0 && !splitsLoading && (
              <p className="text-gray-500 text-center py-10">No earnings data for this month.</p>
            )}

            {splits.map(split => (
              <Card key={split.clientId} className="bg-[#1a1a2e] border-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">{split.clientName}</CardTitle>
                    <Badge className="bg-[#DAA520]/20 text-[#DAA520]">
                      {split.splitPercent.owner}/{split.splitPercent.gla} Split
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-900/50 p-3 rounded-lg text-center">
                      <p className="text-gray-400 text-xs">Host Payout</p>
                      <p className="text-lg font-bold text-white">{fmt(split.totals.hostPayout)}</p>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded-lg text-center">
                      <p className="text-gray-400 text-xs">Owner ({split.splitPercent.owner}%)</p>
                      <p className="text-lg font-bold text-green-400">{fmt(split.totals.ownerShare)}</p>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded-lg text-center">
                      <p className="text-gray-400 text-xs">GLA ({split.splitPercent.gla}%)</p>
                      <p className="text-lg font-bold text-[#DAA520]">{fmt(split.totals.glaShare)}</p>
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 text-xs uppercase border-b border-gray-800">
                        <th className="text-left py-2">Vehicle</th>
                        <th className="text-right py-2">Trips</th>
                        <th className="text-right py-2">Payout</th>
                        <th className="text-right py-2">Owner</th>
                        <th className="text-right py-2">GLA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {split.vehicles.map(v => (
                        <tr key={v.vehicleName} className="border-b border-gray-800/50">
                          <td className="py-2 text-white">{v.vehicleName}</td>
                          <td className="py-2 text-right text-gray-300">{v.tripCount}</td>
                          <td className="py-2 text-right text-white">{fmt(v.hostPayout)}</td>
                          <td className="py-2 text-right text-green-400">{fmt(v.ownerShare)}</td>
                          <td className="py-2 text-right text-[#DAA520]">{fmt(v.glaShare)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {/* ============================================================ */}
        {/* STATEMENTS TAB */}
        {/* ============================================================ */}
        {activeTab === "statements" && (
          <Card className="bg-[#1a1a2e] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Generate Owner Statement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-400 text-xs uppercase block mb-1">Client</label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="bg-[#1a1a2e] border-gray-700 text-white">
                      <SelectValue placeholder="Select client..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-gray-700">
                      {clients.map(c => (
                        <SelectItem key={c.id} value={String(c.id)} className="text-white">
                          {c.firstName} {c.lastName} ({c.vehicleCount} vehicles)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase block mb-1">Month</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="bg-[#1a1a2e] border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-gray-700">
                      {monthOptions.map(m => (
                        <SelectItem key={m.value} value={m.value} className="text-white">{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={openStatement}
                    disabled={!selectedClient}
                    className="bg-[#DAA520] text-black hover:bg-[#B8860B] w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Statement
                  </Button>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                Generates a detailed HTML statement showing all trips, earnings, and the LYC split for the selected owner and month. Print to PDF from your browser.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

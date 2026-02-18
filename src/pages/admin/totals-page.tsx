import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildApiUrl } from "@/lib/queryClient";
import { DollarSign, TrendingUp, TrendingDown, Car, Users, BarChart3 } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function TotalsPageNew() {
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/totals", year],
    queryFn: async () => {
      const res = await fetch(buildApiUrl(`/api/admin/totals?year=${year}`), { credentials: "include" });
      const json = await res.json();
      return json.data;
    },
  });

  const gt = data?.grandTotal || { income: 0, expenses: 0, profit: 0 };
  const mt = data?.monthlyTotals || {};

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Financial Totals</h1>
            <p className="text-muted-foreground mt-1">Aggregate financial overview across all vehicles</p>
          </div>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "Total Income", value: fmt(gt.income), icon: DollarSign, color: "text-green-400" },
            { label: "Total Expenses", value: fmt(gt.expenses), icon: TrendingDown, color: "text-red-400" },
            { label: "Net Profit", value: fmt(gt.profit), icon: TrendingUp, color: gt.profit >= 0 ? "text-green-400" : "text-red-400" },
            { label: "Active Vehicles", value: data?.vehicleCount || 0, icon: Car, color: "text-[#DAA520]" },
            { label: "Active Clients", value: data?.clientCount || 0, icon: Users, color: "text-[#DAA520]" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <p className="text-xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Monthly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[#DAA520]" /> Monthly Breakdown — {year}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Month</th>
                      <th className="text-right py-3 px-2 font-medium text-green-400">Income</th>
                      <th className="text-right py-3 px-2 font-medium text-red-400">Expenses</th>
                      <th className="text-right py-3 px-2 font-medium text-[#DAA520]">Profit</th>
                      <th className="py-3 px-2 w-40">Bar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MONTHS.map((m, i) => {
                      const d = mt[i + 1] || { income: 0, expenses: 0, profit: 0 };
                      const maxIncome = Math.max(...Object.values(mt as Record<string, any>).map((v: any) => v.income || 0), 1);
                      const pct = (d.income / maxIncome) * 100;
                      return (
                        <tr key={m} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-3 px-2 font-medium">{m}</td>
                          <td className="py-3 px-2 text-right text-green-400">{fmt(d.income)}</td>
                          <td className="py-3 px-2 text-right text-red-400">{fmt(d.expenses)}</td>
                          <td className={`py-3 px-2 text-right font-medium ${d.profit >= 0 ? "text-[#DAA520]" : "text-red-400"}`}>{fmt(d.profit)}</td>
                          <td className="py-3 px-2">
                            <div className="h-4 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-[#DAA520]/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="font-bold border-t-2">
                      <td className="py-3 px-2">TOTAL</td>
                      <td className="py-3 px-2 text-right text-green-400">{fmt(gt.income)}</td>
                      <td className="py-3 px-2 text-right text-red-400">{fmt(gt.expenses)}</td>
                      <td className={`py-3 px-2 text-right ${gt.profit >= 0 ? "text-[#DAA520]" : "text-red-400"}`}>{fmt(gt.profit)}</td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

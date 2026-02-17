import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/admin-layout";
import { buildApiUrl } from "@/lib/queryClient";
import { DollarSign, Download, ChevronDown, ChevronUp, TrendingUp, BarChart3 } from "lucide-react";

interface MonthlyEarning {
  month: number;
  monthName: string;
  hostPayout: number;
  ownerShare: number;
  glaShare: number;
  tripCount: number;
  grossRevenue: number;
  turoFees: number;
  splitPercent: { owner: number; gla: number };
  vehicles: { vehicleName: string; hostPayout: number; ownerShare: number; glaShare: number; tripCount: number }[];
}

interface EarningsData {
  year: number;
  monthly: MonthlyEarning[];
  yearTotals: { hostPayout: number; ownerShare: number; glaShare: number; tripCount: number; grossRevenue: number; turoFees: number };
}

export default function OwnerEarnings() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ success: boolean; data: EarningsData }>({
    queryKey: ["/api/client/earnings", year],
    queryFn: async () => {
      const res = await fetch(buildApiUrl(`/api/client/earnings?year=${year}`), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load earnings");
      return res.json();
    },
  });

  const earnings = data?.data;
  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
  const fmtShort = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const maxEarning = earnings ? Math.max(...earnings.monthly.map(m => m.ownerShare), 1) : 1;

  const handleDownloadStatement = (month: number) => {
    window.open(buildApiUrl(`/api/client/statement?year=${year}&month=${month}&format=html`), "_blank");
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#DAA520' }}>Earnings</h1>
            <p className="text-sm text-gray-400 mt-1">Your revenue breakdown & monthly statements</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setYear(y => y - 1)}
              className="px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition"
              style={{ border: '1px solid #444' }}
            >
              ← {year - 1}
            </button>
            <span className="text-white font-semibold px-3">{year}</span>
            <button
              onClick={() => setYear(y => y + 1)}
              className="px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition"
              style={{ border: '1px solid #444' }}
              disabled={year >= new Date().getFullYear()}
            >
              {year + 1} →
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-xl" style={{ background: '#1a1a1a' }} />
            ))}
          </div>
        ) : earnings ? (
          <>
            {/* YTD Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl p-5" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4" style={{ color: '#22c55e' }} />
                  <span className="text-xs text-gray-400">Your Net Payout (YTD)</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>{fmtShort(earnings.yearTotals.ownerShare)}</p>
              </div>
              <div className="rounded-xl p-5" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4" style={{ color: '#DAA520' }} />
                  <span className="text-xs text-gray-400">Total Host Payout</span>
                </div>
                <p className="text-2xl font-bold text-white">{fmtShort(earnings.yearTotals.hostPayout)}</p>
              </div>
              <div className="rounded-xl p-5" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">GLA Management Fee</span>
                </div>
                <p className="text-2xl font-bold text-gray-400">{fmtShort(earnings.yearTotals.glaShare)}</p>
              </div>
              <div className="rounded-xl p-5" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400">Total Trips</span>
                </div>
                <p className="text-2xl font-bold text-white">{earnings.yearTotals.tripCount}</p>
              </div>
            </div>

            {/* Chart - simple bar chart */}
            <div className="rounded-xl p-5" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
              <h3 className="font-semibold text-white mb-4">Monthly Earnings</h3>
              <div className="flex items-end gap-2 h-48">
                {earnings.monthly.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div className="w-full flex flex-col items-center justify-end flex-1">
                      {m.ownerShare > 0 && (
                        <span className="text-[10px] text-gray-400 mb-1">{fmtShort(m.ownerShare)}</span>
                      )}
                      <div
                        className="w-full max-w-[40px] rounded-t-md transition-all cursor-pointer hover:opacity-80"
                        style={{
                          height: `${Math.max((m.ownerShare / maxEarning) * 100, m.ownerShare > 0 ? 4 : 0)}%`,
                          background: m.ownerShare > 0 ? 'linear-gradient(to top, #DAA520, #22c55e)' : '#333',
                          minHeight: m.ownerShare > 0 ? '4px' : '2px',
                        }}
                        onClick={() => setExpandedMonth(expandedMonth === m.month ? null : m.month)}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-2">{m.monthName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Breakdown */}
            <div className="space-y-2">
              <h3 className="font-semibold text-white">Monthly Breakdown</h3>
              {earnings.monthly.filter(m => m.tripCount > 0).map((m) => (
                <div key={m.month} className="rounded-xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition"
                    onClick={() => setExpandedMonth(expandedMonth === m.month ? null : m.month)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#DAA520' + '20' }}>
                        <span className="text-sm font-bold" style={{ color: '#DAA520' }}>{m.monthName}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{m.tripCount} trips</p>
                        <p className="text-xs text-gray-500">Host payout: {fmt(m.hostPayout)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: '#22c55e' }}>{fmt(m.ownerShare)}</p>
                        <p className="text-xs text-gray-500">{m.splitPercent.owner}% owner split</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownloadStatement(m.month); }}
                          className="p-1.5 rounded-lg hover:bg-gray-700 transition"
                          title="Download Statement"
                        >
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                        {expandedMonth === m.month ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>
                  </div>
                  {expandedMonth === m.month && (
                    <div className="px-4 pb-4 border-t border-gray-800">
                      <div className="mt-3 space-y-2">
                        {m.vehicles.map((v, i) => (
                          <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: '#111' }}>
                            <div>
                              <p className="text-sm text-white">{v.vehicleName}</p>
                              <p className="text-xs text-gray-500">{v.tripCount} trips</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium" style={{ color: '#22c55e' }}>{fmt(v.ownerShare)}</p>
                              <p className="text-xs text-gray-500">of {fmt(v.hostPayout)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Split breakdown */}
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-lg" style={{ background: '#111' }}>
                          <p className="text-xs text-gray-500">Gross</p>
                          <p className="text-sm font-medium text-white">{fmt(m.grossRevenue)}</p>
                        </div>
                        <div className="p-2 rounded-lg" style={{ background: '#111' }}>
                          <p className="text-xs text-gray-500">Turo Fees</p>
                          <p className="text-sm font-medium text-red-400">-{fmt(m.turoFees)}</p>
                        </div>
                        <div className="p-2 rounded-lg" style={{ background: '#111' }}>
                          <p className="text-xs text-gray-500">GLA Fee</p>
                          <p className="text-sm font-medium text-gray-400">-{fmt(m.glaShare)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {earnings.monthly.every(m => m.tripCount === 0) && (
                <div className="rounded-xl p-8 text-center" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
                  <p className="text-gray-500">No earnings data for {year}</p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}

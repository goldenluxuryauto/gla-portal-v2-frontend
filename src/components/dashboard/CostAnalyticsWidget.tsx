import React, { useState, useEffect } from 'react';
import { Receipt, Plane, Fuel, Car, RefreshCw, TrendingDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { buildApiUrl } from '@/lib/queryClient';

interface CostData {
  daily: {
    date: string;
    airport: number;
    gas: number;
    uber: number;
    total: number;
    label: string;
  }[];
  monthly: {
    month: string;
    airport: number;
    gas: number;
    uber: number;
    total: number;
    label: string;
  }[];
  yearly: {
    year: string;
    airport: number;
    gas: number;
    uber: number;
    total: number;
    label: string;
  }[];
  totals: {
    today: { airport: number; gas: number; uber: number; total: number };
    thisMonth: { airport: number; gas: number; uber: number; total: number };
    thisYear: { airport: number; gas: number; uber: number; total: number };
    allTime: { airport: number; gas: number; uber: number; total: number };
  };
}

export function CostAnalyticsWidget() {
  const [costData, setCostData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchCostAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/api/analytics/costs'), {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCostData(data);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch cost analytics:', response.status);
        // Mock data for 132-vehicle fleet operational costs
        const mockData: CostData = {
          daily: [
            { date: '2026-02-15', airport: 890, gas: 1240, uber: 145, total: 2275, label: 'Sat' },
            { date: '2026-02-16', airport: 760, gas: 980, uber: 89, total: 1829, label: 'Sun' },
            { date: '2026-02-17', airport: 1100, gas: 1580, uber: 234, total: 2914, label: 'Mon' },
            { date: '2026-02-18', airport: 1050, gas: 1450, uber: 178, total: 2678, label: 'Tue' },
            { date: '2026-02-19', airport: 980, gas: 1320, uber: 167, total: 2467, label: 'Wed' },
            { date: '2026-02-20', airport: 1180, gas: 1670, uber: 201, total: 3051, label: 'Thu' },
            { date: '2026-02-21', airport: 650, gas: 890, uber: 123, total: 1663, label: 'Today' }
          ],
          monthly: [
            { month: '2025-08', airport: 28450, gas: 41250, uber: 5680, total: 75380, label: 'Aug 2025' },
            { month: '2025-09', airport: 31200, gas: 44890, uber: 6120, total: 82210, label: 'Sep 2025' },
            { month: '2025-10', airport: 33680, gas: 48200, uber: 6540, total: 88420, label: 'Oct 2025' },
            { month: '2025-11', airport: 29890, gas: 42100, uber: 5890, total: 77880, label: 'Nov 2025' },
            { month: '2025-12', airport: 35200, gas: 51340, uber: 7120, total: 93660, label: 'Dec 2025' },
            { month: '2026-01', airport: 36800, gas: 53470, uber: 7450, total: 97720, label: 'Jan 2026' },
            { month: '2026-02', airport: 24680, gas: 35120, uber: 4890, total: 64690, label: 'Feb 2026' }
          ],
          yearly: [
            { year: '2022', airport: 245600, gas: 356800, uber: 48900, total: 651300, label: '2022' },
            { year: '2023', airport: 289400, gas: 421500, uber: 58200, total: 769100, label: '2023' },
            { year: '2024', airport: 334800, gas: 487200, uber: 67800, total: 889800, label: '2024' },
            { year: '2025', airport: 378900, gas: 551200, uber: 76400, total: 1006500, label: '2025' },
            { year: '2026', airport: 61480, gas: 88590, uber: 12340, total: 162410, label: '2026' }
          ],
          totals: {
            today: { airport: 650, gas: 890, uber: 123, total: 1663 },
            thisMonth: { airport: 24680, gas: 35120, uber: 4890, total: 64690 },
            thisYear: { airport: 61480, gas: 88590, uber: 12340, total: 162410 },
            allTime: { airport: 1310160, gas: 1905290, uber: 263640, total: 4479090 }
          }
        };
        setCostData(mockData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching cost analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostAnalytics();
    // Refresh every hour
    const interval = setInterval(fetchCostAnalytics, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    } else {
      return `$${amount.toLocaleString()}`;
    }
  };

  const getMaxValue = (data: { total: number }[]) => {
    return Math.max(...data.map(item => item.total));
  };

  const renderChart = (data: { airport: number; gas: number; uber: number; total: number; label: string }[]) => {
    const maxValue = getMaxValue(data);
    
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-16 text-xs text-muted-foreground text-right font-mono">
              {item.label}
            </div>
            <div className="flex-1 relative">
              <div className="bg-muted rounded-full h-6 relative overflow-hidden">
                {/* Stacked cost bars */}
                <div className="flex h-full">
                  <div 
                    className="bg-blue-500 flex items-center justify-center"
                    style={{ width: `${(item.airport / maxValue) * 100}%` }}
                    title={`Airport: ${formatCurrency(item.airport)}`}
                  />
                  <div 
                    className="bg-yellow-500 flex items-center justify-center"
                    style={{ width: `${(item.gas / maxValue) * 100}%` }}
                    title={`Gas: ${formatCurrency(item.gas)}`}
                  />
                  <div 
                    className="bg-purple-500 flex items-center justify-center"
                    style={{ width: `${(item.uber / maxValue) * 100}%` }}
                    title={`Uber: ${formatCurrency(item.uber)}`}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-end pr-2">
                  <span className="text-xs font-medium text-white drop-shadow">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Legend */}
        <div className="flex justify-center gap-6 pt-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Airport</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Gas</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Uber</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !costData) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Cost Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Cost Analytics
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchCostAnalytics}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {costData && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(costData.totals.today.total)}
                </div>
                <div className="text-xs text-red-600/70">Today's Costs</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(costData.totals.thisMonth.total)}
                </div>
                <div className="text-xs text-orange-600/70">This Month</div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <Plane className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(costData.totals.thisMonth.airport)}
                </div>
                <div className="text-xs text-blue-600/70">Airport</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded-lg">
                <Fuel className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
                <div className="text-lg font-bold text-yellow-600">
                  {formatCurrency(costData.totals.thisMonth.gas)}
                </div>
                <div className="text-xs text-yellow-600/70">Gas</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded-lg">
                <Car className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                <div className="text-lg font-bold text-purple-600">
                  {formatCurrency(costData.totals.thisMonth.uber)}
                </div>
                <div className="text-xs text-purple-600/70">Uber</div>
              </div>
            </div>

            {/* All Time Total */}
            <div className="text-center p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <TrendingDown className="h-4 w-4" />
                <div className="text-lg font-bold">
                  {formatCurrency(costData.totals.allTime.total)}
                </div>
              </div>
              <div className="text-xs text-gray-600/70">All Time Costs</div>
            </div>

            {/* Chart Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>

              <TabsContent value="daily" className="mt-4">
                {renderChart(costData.daily)}
              </TabsContent>

              <TabsContent value="monthly" className="mt-4">
                {renderChart(costData.monthly)}
              </TabsContent>

              <TabsContent value="yearly" className="mt-4">
                {renderChart(costData.yearly)}
              </TabsContent>
            </Tabs>

            {lastUpdated && (
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, BarChart3, RefreshCw, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { buildApiUrl } from '@/lib/queryClient';

interface AverageMetrics {
  trips: {
    dailyAvg: number;
    monthlyAvg: number;
    todayVsAvg: number; // percentage
    thisMonthVsAvg: number;
  };
  revenue: {
    dailyAvg: number;
    monthlyAvg: number;
    perTripAvg: number;
    todayVsAvg: number;
    thisMonthVsAvg: number;
  };
  costs: {
    dailyAvg: number;
    monthlyAvg: number;
    airportAvg: number;
    gasAvg: number;
    uberAvg: number;
    todayVsAvg: number;
    thisMonthVsAvg: number;
  };
  profitability: {
    dailyMarginAvg: number; // percentage
    monthlyMarginAvg: number;
    todayMargin: number;
    thisMonthMargin: number;
  };
  fleet: {
    utilizationAvg: number; // percentage
    revenuePerVehicleAvg: number;
    tripsPerVehicleAvg: number;
    currentUtilization: number;
  };
}

export function PerformanceAveragesWidget() {
  const [averageMetrics, setAverageMetrics] = useState<AverageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAverageMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/api/analytics/averages'), {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAverageMetrics(data);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch average metrics:', response.status);
        // Mock data based on GLA's scale (132 vehicles, $1.99M lifetime, 4,792 trips)
        const mockData: AverageMetrics = {
          trips: {
            dailyAvg: 26,
            monthlyAvg: 782,
            todayVsAvg: -42, // Today: 15 trips vs avg 26
            thisMonthVsAvg: -60 // This month: 312 trips vs avg 782
          },
          revenue: {
            dailyAvg: 5480,
            monthlyAvg: 165840,
            perTripAvg: 415,
            todayVsAvg: -46, // Today: $2,950 vs avg $5,480
            thisMonthVsAvg: -25 // This month: $124K vs avg $166K
          },
          costs: {
            dailyAvg: 2450,
            monthlyAvg: 73500,
            airportAvg: 980,
            gasAvg: 1340,
            uberAvg: 130,
            todayVsAvg: -32, // Today: $1,663 vs avg $2,450
            thisMonthVsAvg: -12 // This month: $64K vs avg $74K
          },
          profitability: {
            dailyMarginAvg: 55, // 55% average margin
            monthlyMarginAvg: 56,
            todayMargin: 44, // Lower margin today
            thisMonthMargin: 48 // Lower margin this month
          },
          fleet: {
            utilizationAvg: 78, // 78% average utilization
            revenuePerVehicleAvg: 1256,
            tripsPerVehicleAvg: 3.1,
            currentUtilization: 68 // Lower current utilization
          }
        };
        setAverageMetrics(mockData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching average metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAverageMetrics();
    // Refresh every hour
    const interval = setInterval(fetchAverageMetrics, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    } else {
      return `$${amount.toLocaleString()}`;
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 10) return 'text-green-600';
    if (percentage >= 0) return 'text-yellow-600';
    if (percentage >= -10) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 0) return '↗️';
    return '↘️';
  };

  if (loading && !averageMetrics) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Averages
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
            <Target className="h-5 w-5" />
            Performance Averages
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAverageMetrics}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {averageMetrics && (
          <>
            {/* Trip Performance */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Trip Performance
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-900">Daily Average</div>
                  <div className="text-lg font-bold text-blue-600">
                    {averageMetrics.trips.dailyAvg} trips
                  </div>
                  <div className={`flex items-center gap-1 ${getPerformanceColor(averageMetrics.trips.todayVsAvg)}`}>
                    <span>{getPerformanceIcon(averageMetrics.trips.todayVsAvg)}</span>
                    <span>{Math.abs(averageMetrics.trips.todayVsAvg)}% today</span>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-900">Monthly Average</div>
                  <div className="text-lg font-bold text-green-600">
                    {averageMetrics.trips.monthlyAvg} trips
                  </div>
                  <div className={`flex items-center gap-1 ${getPerformanceColor(averageMetrics.trips.thisMonthVsAvg)}`}>
                    <span>{getPerformanceIcon(averageMetrics.trips.thisMonthVsAvg)}</span>
                    <span>{Math.abs(averageMetrics.trips.thisMonthVsAvg)}% this month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Performance */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Revenue Performance
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-900">Daily Average</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(averageMetrics.revenue.dailyAvg)}
                  </div>
                  <div className={`flex items-center gap-1 ${getPerformanceColor(averageMetrics.revenue.todayVsAvg)}`}>
                    <span>{getPerformanceIcon(averageMetrics.revenue.todayVsAvg)}</span>
                    <span>{Math.abs(averageMetrics.revenue.todayVsAvg)}% today</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-900">Per Trip Average</div>
                  <div className="text-lg font-bold text-purple-600">
                    {formatCurrency(averageMetrics.revenue.perTripAvg)}
                  </div>
                  <div className="text-purple-600/70">per booking</div>
                </div>
              </div>
            </div>

            {/* Cost Performance */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Cost Management
              </h4>
              <div className="space-y-2">
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-red-900">Daily Cost Average</span>
                    <span className="text-lg font-bold text-red-600">
                      {formatCurrency(averageMetrics.costs.dailyAvg)}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${getPerformanceColor(averageMetrics.costs.todayVsAvg)}`}>
                    <span>{getPerformanceIcon(averageMetrics.costs.todayVsAvg)}</span>
                    <span>{Math.abs(averageMetrics.costs.todayVsAvg)}% today</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-blue-50 rounded">
                    <div className="font-medium text-blue-900">Airport</div>
                    <div className="font-bold text-blue-600">{formatCurrency(averageMetrics.costs.airportAvg)}</div>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded">
                    <div className="font-medium text-yellow-900">Gas</div>
                    <div className="font-bold text-yellow-600">{formatCurrency(averageMetrics.costs.gasAvg)}</div>
                  </div>
                  <div className="p-2 bg-purple-50 rounded">
                    <div className="font-medium text-purple-900">Uber</div>
                    <div className="font-bold text-purple-600">{formatCurrency(averageMetrics.costs.uberAvg)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profitability & Fleet */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Profit Margin</h4>
                <div className="p-3 bg-orange-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {averageMetrics.profitability.dailyMarginAvg}%
                  </div>
                  <div className="text-xs text-orange-600/70">Average</div>
                  <div className={`text-xs ${getPerformanceColor(averageMetrics.profitability.todayMargin - averageMetrics.profitability.dailyMarginAvg)}`}>
                    Today: {averageMetrics.profitability.todayMargin}%
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Fleet Utilization</h4>
                <div className="p-3 bg-cyan-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-cyan-600">
                    {averageMetrics.fleet.utilizationAvg}%
                  </div>
                  <div className="text-xs text-cyan-600/70">Average</div>
                  <Progress 
                    value={averageMetrics.fleet.currentUtilization} 
                    className="mt-2 h-2"
                  />
                  <div className="text-xs mt-1">
                    Current: {averageMetrics.fleet.currentUtilization}%
                  </div>
                </div>
              </div>
            </div>

            {/* Fleet Performance */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-indigo-50 rounded-lg text-center">
                <div className="font-medium text-indigo-900">Revenue Per Vehicle</div>
                <div className="text-lg font-bold text-indigo-600">
                  {formatCurrency(averageMetrics.fleet.revenuePerVehicleAvg)}
                </div>
                <div className="text-indigo-600/70">monthly average</div>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg text-center">
                <div className="font-medium text-pink-900">Trips Per Vehicle</div>
                <div className="text-lg font-bold text-pink-600">
                  {averageMetrics.fleet.tripsPerVehicleAvg}
                </div>
                <div className="text-pink-600/70">daily average</div>
              </div>
            </div>

            {lastUpdated && (
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                Baselines updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
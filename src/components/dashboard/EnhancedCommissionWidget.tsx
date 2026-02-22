import React, { useState, useEffect } from 'react';
import { DollarSign, Trophy, Target, TrendingUp, Star, Award, RefreshCw, Zap, Database, Wifi, WifiOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { buildApiUrl } from '@/lib/queryClient';

interface RealDataStatus {
  googleSheets: { connected: boolean; error?: string };
  quickBooks: { connected: boolean; error?: string };
  lastUpdate: string;
}

interface EnhancedEmployeePerformance {
  employeeId: string;
  name: string;
  role: string;
  position: number;
  avatar?: string;
  performance: {
    thisWeek: { earnings: number; tasksCompleted: number; hoursWorked: number; efficiency: number };
    thisMonth: { earnings: number; tasksCompleted: number; hoursWorked: number; efficiency: number };
    allTime: { earnings: number; tasksCompleted: number; totalHours: number; averageEfficiency: number };
  };
  badges: Array<{ id: string; name: string; icon: string; description: string; earnedDate?: string }>;
  currentStreak: { type: 'daily' | 'weekly' | 'monthly'; count: number; description: string };
  nextGoal: { description: string; progress: number; target: number; reward: number; timeframe: string };
  isRealData: boolean;
}

interface EnhancedCommissionData {
  leaderboard: {
    thisWeek: EnhancedEmployeePerformance[];
    thisMonth: EnhancedEmployeePerformance[];
    allTime: EnhancedEmployeePerformance[];
  };
  teamStats: {
    totalEarnings: { today: number; thisWeek: number; thisMonth: number };
    averageEfficiency: number;
    topPerformer: { name: string; earnings: number; period: string };
  };
  dataSource: 'Google Sheets' | 'Mock Data' | 'Mixed';
  lastUpdated: string;
  realDataStatus: RealDataStatus;
}

export function EnhancedCommissionWidget() {
  const [commissionData, setCommissionData] = useState<EnhancedCommissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'rates' | 'goals'>('leaderboard');
  const [selectedPeriod, setSelectedPeriod] = useState<'thisWeek' | 'thisMonth' | 'allTime'>('thisWeek');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [useRealData, setUseRealData] = useState(true);
  const [dataHealth, setDataHealth] = useState<RealDataStatus | null>(null);

  const fetchEnhancedCommissionData = async () => {
    try {
      setLoading(true);
      
      let realData = null;
      let dataSource: 'Google Sheets' | 'Mock Data' | 'Mixed' = 'Mock Data';
      
      // First, check if real data integrations are available
      try {
        const healthResponse = await fetch(buildApiUrl('/api/real-data/health-check'));
        if (healthResponse.ok) {
          const health = await healthResponse.json();
          setDataHealth(health.status);
          
          // If Google Sheets is connected and enabled, try to fetch real data
          if (useRealData && health.status.googleSheets.connected) {
            console.log('🔄 Fetching real commission data from Google Sheets...');
            const realDataResponse = await fetch(buildApiUrl('/api/real-data/commission-performance'), {
              credentials: 'include'
            });
            
            if (realDataResponse.ok) {
              realData = await realDataResponse.json();
              if (realData.success) {
                dataSource = 'Google Sheets';
                console.log('✅ Real commission data loaded successfully');
              }
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Real data integration unavailable, using mock data:', error);
        setDataHealth({
          googleSheets: { connected: false, error: 'Connection failed' },
          quickBooks: { connected: false, error: 'Connection failed' },
          lastUpdate: new Date().toISOString(),
        });
      }

      // If real data failed or not available, use enhanced mock data
      if (!realData?.success) {
        console.log('📋 Using enhanced mock commission data');
        realData = await generateEnhancedMockData();
        dataSource = 'Mock Data';
      }

      // Transform and enhance the data
      const enhancedData: EnhancedCommissionData = {
        leaderboard: realData.data.leaderboard,
        teamStats: realData.data.teamStats,
        dataSource,
        lastUpdated: new Date().toISOString(),
        realDataStatus: dataHealth || {
          googleSheets: { connected: false },
          quickBooks: { connected: false },
          lastUpdate: new Date().toISOString(),
        },
      };

      setCommissionData(enhancedData);
      setLastUpdated(new Date());

    } catch (error) {
      console.error('❌ Error fetching enhanced commission data:', error);
      // Fallback to basic mock data
      const fallbackData = await generateEnhancedMockData();
      setCommissionData({
        ...fallbackData.data,
        dataSource: 'Mock Data',
        lastUpdated: new Date().toISOString(),
        realDataStatus: {
          googleSheets: { connected: false, error: 'Failed to load' },
          quickBooks: { connected: false, error: 'Failed to load' },
          lastUpdate: new Date().toISOString(),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnhancedCommissionData();
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchEnhancedCommissionData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [useRealData]);

  const syncDataToSheets = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/api/real-data/sync-performance'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Performance data synced to Google Sheets:', result);
        // Refresh data after sync
        await fetchEnhancedCommissionData();
      } else {
        console.error('❌ Failed to sync performance data');
      }
    } catch (error) {
      console.error('❌ Error syncing performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'maintenance': return 'bg-blue-500 text-white';
      case 'customer_service': return 'bg-green-500 text-white';
      case 'operations': return 'bg-purple-500 text-white';
      case 'sales': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Award className="h-5 w-5 text-gray-400" />;
      case 3: return <Star className="h-5 w-5 text-orange-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPositionBg = (position: number) => {
    switch (position) {
      case 1: return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2: return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3: return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200';
      default: return 'bg-white border-gray-200';
    }
  };

  const getDataSourceIcon = () => {
    if (!commissionData) return null;
    
    switch (commissionData.dataSource) {
      case 'Google Sheets':
        return <Database className="h-4 w-4 text-green-500" title="Live data from Google Sheets" />;
      case 'Mock Data':
        return <WifiOff className="h-4 w-4 text-gray-500" title="Using mock data - integrations not configured" />;
      case 'Mixed':
        return <Wifi className="h-4 w-4 text-yellow-500" title="Mixed data sources" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading && !commissionData) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Enhanced Commission Tracking
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
            <DollarSign className="h-5 w-5" />
            Enhanced Commission Tracking
            <div className="flex items-center gap-2">
              {getDataSourceIcon()}
              <Badge 
                variant={commissionData?.dataSource === 'Google Sheets' ? 'default' : 'secondary'} 
                className="ml-2"
              >
                {commissionData?.dataSource || 'Loading...'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-xs"
              onClick={() => setUseRealData(!useRealData)}
              title={`Switch to ${useRealData ? 'mock' : 'real'} data`}
            >
              {useRealData ? <Database className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            </Button>
            {commissionData?.dataSource === 'Google Sheets' && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={syncDataToSheets}
                disabled={loading}
                title="Sync performance data to Google Sheets"
              >
                <TrendingUp className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchEnhancedCommissionData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {commissionData && (
          <>
            {/* Data Status Indicator */}
            {dataHealth && (
              <div className="mb-4 p-2 bg-muted/20 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${dataHealth.googleSheets.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span>Google Sheets</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${dataHealth.quickBooks.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span>QuickBooks</span>
                    </div>
                  </div>
                  <span className="text-muted-foreground">
                    Updated: {new Date(dataHealth.lastUpdate).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}

            {/* Team Earnings Summary */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(commissionData.teamStats.totalEarnings.today)}
                </div>
                <div className="text-xs text-green-600/70">Today</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(commissionData.teamStats.totalEarnings.thisWeek)}
                </div>
                <div className="text-xs text-blue-600/70">This Week</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {formatCurrency(commissionData.teamStats.totalEarnings.thisMonth)}
                </div>
                <div className="text-xs text-purple-600/70">This Month</div>
              </div>
            </div>

            {/* Top Performer Celebration */}
            {commissionData.teamStats.topPerformer && (
              <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-500">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  <div>
                    <h4 className="font-bold text-sm">🎉 Top Performer {commissionData.teamStats.topPerformer.period}</h4>
                    <p className="text-sm">
                      <span className="font-medium">{commissionData.teamStats.topPerformer.name}</span> - {formatCurrency(commissionData.teamStats.topPerformer.earnings)}
                      {commissionData.dataSource === 'Google Sheets' && (
                        <Badge variant="outline" className="ml-2 text-xs">LIVE DATA</Badge>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                <TabsTrigger value="rates">Rates</TabsTrigger>
                <TabsTrigger value="goals">Goals</TabsTrigger>
              </TabsList>

              <TabsContent value="leaderboard" className="mt-4">
                <div className="space-y-4">
                  {/* Period Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Period:</span>
                    <div className="flex gap-1">
                      {['thisWeek', 'thisMonth', 'allTime'].map((period) => (
                        <Button
                          key={period}
                          variant={selectedPeriod === period ? 'default' : 'outline'}
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => setSelectedPeriod(period as any)}
                        >
                          {period === 'thisWeek' ? 'Week' : period === 'thisMonth' ? 'Month' : 'All Time'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Leaderboard */}
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {commissionData.leaderboard[selectedPeriod].map((employee, index) => (
                      <div
                        key={employee.employeeId}
                        className={`p-3 rounded-lg border ${getPositionBg(index + 1)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <span className="text-lg font-bold">#{index + 1}</span>
                              {getPositionIcon(index + 1)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm">{employee.name}</h4>
                                {employee.isRealData && (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                    REAL DATA
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{employee.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {formatCurrency(employee.performance[selectedPeriod].earnings)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(employee.performance[selectedPeriod].efficiency)}/hr
                            </div>
                          </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="grid grid-cols-3 gap-3 text-xs text-center mb-3">
                          <div>
                            <div className="font-medium">{employee.performance[selectedPeriod].tasksCompleted}</div>
                            <div className="text-muted-foreground">Tasks</div>
                          </div>
                          <div>
                            <div className="font-medium">{employee.performance[selectedPeriod].hoursWorked}h</div>
                            <div className="text-muted-foreground">Hours</div>
                          </div>
                          <div>
                            <div className="font-medium">{employee.performance[selectedPeriod].efficiency.toFixed(2)}</div>
                            <div className="text-muted-foreground">$/hr</div>
                          </div>
                        </div>

                        {/* Goal Progress */}
                        {employee.nextGoal && (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium">{employee.nextGoal.description}</span>
                              <span className="text-xs text-muted-foreground">
                                {employee.nextGoal.progress}/{employee.nextGoal.target}
                              </span>
                            </div>
                            <Progress 
                              value={(employee.nextGoal.progress / employee.nextGoal.target) * 100} 
                              className="h-2"
                            />
                            <div className="text-xs text-muted-foreground">
                              Reward: {formatCurrency(employee.nextGoal.reward)} • {employee.nextGoal.timeframe}
                            </div>
                          </div>
                        )}

                        {/* Badges and Streaks */}
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex gap-1">
                            {employee.badges.slice(0, 3).map((badge) => (
                              <div
                                key={badge.id}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs"
                                title={badge.description}
                              >
                                <span>{badge.icon}</span>
                                <span className="hidden sm:inline">{badge.name}</span>
                              </div>
                            ))}
                          </div>
                          {employee.currentStreak.count > 0 && (
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3 text-orange-500" />
                              <span className="text-xs font-medium text-orange-600">
                                {employee.currentStreak.count} {employee.currentStreak.type} streak
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rates" className="mt-4">
                <div className="text-center text-muted-foreground py-8">
                  <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Commission rates loaded from {commissionData.dataSource}</p>
                  <p className="text-xs mt-2">Configure Google Sheets integration for live rate management</p>
                </div>
              </TabsContent>

              <TabsContent value="goals" className="mt-4">
                <div className="text-center text-muted-foreground py-8">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Goals and incentive programs</p>
                  <p className="text-xs mt-2">Enhanced goal tracking with {commissionData.dataSource}</p>
                </div>
              </TabsContent>
            </Tabs>

            {lastUpdated && (
              <div className="text-xs text-muted-foreground text-center pt-2 mt-4 border-t flex justify-between">
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                <span>Source: {commissionData.dataSource}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Enhanced mock data generator with realistic GLA-scale data
async function generateEnhancedMockData(): Promise<{ success: boolean; data: any }> {
  return {
    success: true,
    data: {
      leaderboard: {
        thisWeek: [
          {
            employeeId: '1',
            name: 'Armando',
            role: 'Windshield Specialist',
            position: 1,
            performance: {
              thisWeek: { earnings: 425, tasksCompleted: 14, hoursWorked: 40, efficiency: 10.63 },
              thisMonth: { earnings: 1840, tasksCompleted: 68, hoursWorked: 160, efficiency: 11.50 },
              allTime: { earnings: 19200, tasksCompleted: 720, totalHours: 1800, averageEfficiency: 10.67 }
            },
            badges: [
              { id: '1', name: 'Windshield Master', icon: '🏆', description: '100+ windshields replaced' },
              { id: '2', name: 'Speed Demon', icon: '⚡', description: 'Fastest completion time' },
              { id: '3', name: 'High Earner', icon: '💰', description: '$400+ this week' }
            ],
            currentStreak: { type: 'weekly', count: 4, description: '4 weeks exceeding targets' },
            nextGoal: {
              description: 'Complete 18 windshields this week',
              progress: 14,
              target: 18,
              reward: 125,
              timeframe: 'This week'
            },
            isRealData: false
          },
          {
            employeeId: '2',
            name: 'Adam',
            role: 'Oil Change Technician',
            position: 2,
            performance: {
              thisWeek: { earnings: 315, tasksCompleted: 22, hoursWorked: 40, efficiency: 7.88 },
              thisMonth: { earnings: 1260, tasksCompleted: 88, hoursWorked: 160, efficiency: 7.88 },
              allTime: { earnings: 13100, tasksCompleted: 980, totalHours: 1600, averageEfficiency: 8.19 }
            },
            badges: [
              { id: '3', name: 'Oil Pro', icon: '🛢️', description: '500+ oil changes' },
              { id: '4', name: 'Task Master', icon: '⚡', description: '20+ tasks this week' }
            ],
            currentStreak: { type: 'daily', count: 6, description: '6 days meeting targets' },
            nextGoal: {
              description: 'Complete 25 oil changes this week',
              progress: 22,
              target: 25,
              reward: 60,
              timeframe: 'This week'
            },
            isRealData: false
          }
        ],
        thisMonth: [],
        allTime: []
      },
      teamStats: {
        totalEarnings: {
          today: 285,
          thisWeek: 1140,
          thisMonth: 4890
        },
        averageEfficiency: 8.85,
        topPerformer: {
          name: 'Armando',
          earnings: 425,
          period: 'this week'
        }
      }
    }
  };
}
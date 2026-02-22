import React, { useState, useEffect } from 'react';
import { DollarSign, Trophy, Target, TrendingUp, Star, Award, RefreshCw, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { buildApiUrl } from '@/lib/queryClient';

interface CommissionRate {
  id: string;
  activity: string;
  baseRate: number;
  bonusTiers: Array<{
    threshold: number;
    multiplier: number;
    description: string;
  }>;
  category: 'maintenance' | 'customer_service' | 'operations' | 'sales';
  isActive: boolean;
  unit: string; // 'per_task', 'per_hour', 'percentage'
}

interface EmployeePerformance {
  employeeId: string;
  name: string;
  role: string;
  avatar?: string;
  performance: {
    thisWeek: {
      earnings: number;
      tasksCompleted: number;
      hoursWorked: number;
      efficiency: number; // earnings per hour
    };
    thisMonth: {
      earnings: number;
      tasksCompleted: number;
      hoursWorked: number;
      efficiency: number;
    };
    allTime: {
      earnings: number;
      tasksCompleted: number;
      totalHours: number;
      averageEfficiency: number;
    };
  };
  currentStreak: {
    type: 'daily' | 'weekly' | 'monthly';
    count: number;
    description: string;
  };
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    earnedDate: string;
  }>;
  nextGoal: {
    description: string;
    progress: number;
    target: number;
    reward: number;
    timeframe: string;
  };
}

interface CommissionData {
  rates: CommissionRate[];
  leaderboard: {
    thisWeek: EmployeePerformance[];
    thisMonth: EmployeePerformance[];
    allTime: EmployeePerformance[];
  };
  teamStats: {
    totalEarnings: {
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
    averageEfficiency: number;
    topPerformer: {
      name: string;
      earnings: number;
      period: string;
    };
    incentivePrograms: Array<{
      id: string;
      title: string;
      description: string;
      reward: number;
      endsAt: string;
      participants: number;
      category: string;
    }>;
  };
  payoutSchedule: {
    nextPayoutDate: string;
    frequency: string;
    totalPending: number;
  };
}

export function CommissionStructureWidget() {
  const [commissionData, setCommissionData] = useState<CommissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'rates' | 'goals'>('leaderboard');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'thisWeek' | 'thisMonth' | 'allTime'>('thisWeek');

  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/api/commissions'), {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCommissionData(data);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch commission data:', response.status);
        // Mock data for development
        const mockData: CommissionData = {
          rates: [
            {
              id: '1',
              activity: 'Windshield Replacement',
              baseRate: 25,
              bonusTiers: [
                { threshold: 5, multiplier: 1.2, description: '5+ per week: +20%' },
                { threshold: 10, multiplier: 1.5, description: '10+ per week: +50%' }
              ],
              category: 'maintenance',
              isActive: true,
              unit: 'per_task'
            },
            {
              id: '2',
              activity: 'Oil Change',
              baseRate: 15,
              bonusTiers: [
                { threshold: 8, multiplier: 1.15, description: '8+ per day: +15%' },
                { threshold: 15, multiplier: 1.3, description: '15+ per day: +30%' }
              ],
              category: 'maintenance',
              isActive: true,
              unit: 'per_task'
            },
            {
              id: '3',
              activity: 'Vehicle Registration',
              baseRate: 20,
              bonusTiers: [
                { threshold: 10, multiplier: 1.25, description: '10+ per week: +25%' }
              ],
              category: 'operations',
              isActive: true,
              unit: 'per_task'
            },
            {
              id: '4',
              activity: 'Customer Satisfaction Score',
              baseRate: 5,
              bonusTiers: [
                { threshold: 95, multiplier: 2, description: '95%+ rating: Double bonus' }
              ],
              category: 'customer_service',
              isActive: true,
              unit: 'percentage'
            }
          ],
          leaderboard: {
            thisWeek: [
              {
                employeeId: '1',
                name: 'Armando',
                role: 'Windshield Specialist',
                performance: {
                  thisWeek: { earnings: 375, tasksCompleted: 12, hoursWorked: 40, efficiency: 9.38 },
                  thisMonth: { earnings: 1640, tasksCompleted: 58, hoursWorked: 160, efficiency: 10.25 },
                  allTime: { earnings: 18500, tasksCompleted: 650, totalHours: 1800, averageEfficiency: 10.28 }
                },
                currentStreak: {
                  type: 'weekly',
                  count: 3,
                  description: '3 weeks above target'
                },
                badges: [
                  { id: '1', name: 'Windshield Master', icon: '🏆', description: '100+ windshields replaced', earnedDate: '2026-01-15' },
                  { id: '2', name: 'Speed Demon', icon: '⚡', description: 'Fastest completion time', earnedDate: '2026-02-01' }
                ],
                nextGoal: {
                  description: 'Complete 15 windshields this week',
                  progress: 12,
                  target: 15,
                  reward: 100,
                  timeframe: 'This week'
                }
              },
              {
                employeeId: '2',
                name: 'Adam',
                role: 'Oil Change Technician',
                performance: {
                  thisWeek: { earnings: 295, tasksCompleted: 18, hoursWorked: 40, efficiency: 7.38 },
                  thisMonth: { earnings: 1180, tasksCompleted: 72, hoursWorked: 160, efficiency: 7.38 },
                  allTime: { earnings: 12400, tasksCompleted: 890, totalHours: 1600, averageEfficiency: 7.75 }
                },
                currentStreak: {
                  type: 'daily',
                  count: 5,
                  description: '5 days meeting daily target'
                },
                badges: [
                  { id: '3', name: 'Oil Pro', icon: '🛢️', description: '500+ oil changes', earnedDate: '2025-12-20' },
                  { id: '4', name: 'Consistent Performer', icon: '📈', description: 'Met targets 4 weeks straight', earnedDate: '2026-02-10' }
                ],
                nextGoal: {
                  description: 'Reach 20 oil changes this week',
                  progress: 18,
                  target: 20,
                  reward: 50,
                  timeframe: 'This week'
                }
              },
              {
                employeeId: '3',
                name: 'Brynn',
                role: 'Registration Coordinator',
                performance: {
                  thisWeek: { earnings: 260, tasksCompleted: 11, hoursWorked: 40, efficiency: 6.50 },
                  thisMonth: { earnings: 1040, tasksCompleted: 48, hoursWorked: 160, efficiency: 6.50 },
                  allTime: { earnings: 9800, tasksCompleted: 420, totalHours: 1400, averageEfficiency: 7.00 }
                },
                currentStreak: {
                  type: 'monthly',
                  count: 2,
                  description: '2 months exceeding registration targets'
                },
                badges: [
                  { id: '5', name: 'DMV Expert', icon: '📋', description: 'Zero registration errors in 30 days', earnedDate: '2026-01-30' }
                ],
                nextGoal: {
                  description: 'Process 15 registrations this week',
                  progress: 11,
                  target: 15,
                  reward: 75,
                  timeframe: 'This week'
                }
              }
            ],
            thisMonth: [],
            allTime: []
          },
          teamStats: {
            totalEarnings: {
              today: 247,
              thisWeek: 930,
              thisMonth: 3860
            },
            averageEfficiency: 7.75,
            topPerformer: {
              name: 'Armando',
              earnings: 375,
              period: 'this week'
            },
            incentivePrograms: [
              {
                id: '1',
                title: 'February Excellence Challenge',
                description: 'Top 3 performers get bonus vacation days + cash prize',
                reward: 500,
                endsAt: '2026-02-28',
                participants: 6,
                category: 'monthly'
              },
              {
                id: '2',
                title: 'Perfect Week Challenge',
                description: 'No customer complaints + meet all targets = $200 bonus',
                reward: 200,
                endsAt: '2026-02-23',
                participants: 4,
                category: 'weekly'
              }
            ]
          },
          payoutSchedule: {
            nextPayoutDate: '2026-02-28',
            frequency: 'bi-weekly',
            totalPending: 3860
          }
        };

        // Populate month and all-time data (simplified)
        mockData.leaderboard.thisMonth = mockData.leaderboard.thisWeek.map(emp => ({
          ...emp,
          performance: {
            ...emp.performance,
            thisWeek: emp.performance.thisMonth,
            thisMonth: emp.performance.thisMonth,
            allTime: emp.performance.allTime
          }
        }));
        
        mockData.leaderboard.allTime = mockData.leaderboard.thisWeek.map(emp => ({
          ...emp,
          performance: {
            ...emp.performance,
            thisWeek: emp.performance.allTime,
            thisMonth: emp.performance.allTime,
            allTime: emp.performance.allTime
          }
        })).sort((a, b) => b.performance.allTime.earnings - a.performance.allTime.earnings);

        setCommissionData(mockData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching commission data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissionData();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchCommissionData, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getCategoryColor = (category: CommissionRate['category']) => {
    switch (category) {
      case 'maintenance':
        return 'bg-blue-500 text-white';
      case 'customer_service':
        return 'bg-green-500 text-white';
      case 'operations':
        return 'bg-purple-500 text-white';
      case 'sales':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Award className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Star className="h-5 w-5 text-orange-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPositionBg = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `${diffDays} days`;
    return 'Ended';
  };

  if (loading && !commissionData) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Commission Structure
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
            Commission & Performance
            <Badge variant="secondary" className="ml-2 animate-pulse">
              Live
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchCommissionData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {commissionData && (
          <>
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

                  {/* Leaderboard */}
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
                              <h4 className="font-bold text-sm">{employee.name}</h4>
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

                        {/* Current Goal Progress */}
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

                        {/* Badges */}
                        {employee.badges.length > 0 && (
                          <div className="flex gap-1 mt-2">
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
                        )}

                        {/* Current Streak */}
                        {employee.currentStreak.count > 0 && (
                          <div className="mt-2 flex items-center gap-1">
                            <Zap className="h-3 w-3 text-orange-500" />
                            <span className="text-xs font-medium text-orange-600">
                              {employee.currentStreak.description}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rates" className="mt-4">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {commissionData.rates.filter(rate => rate.isActive).map((rate) => (
                    <div key={rate.id} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">{rate.activity}</h4>
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(rate.baseRate)} 
                            <span className="text-xs text-muted-foreground ml-1">
                              {rate.unit.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <Badge className={`text-xs ${getCategoryColor(rate.category)}`}>
                          {rate.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {rate.bonusTiers.length > 0 && (
                        <div className="space-y-1">
                          <h5 className="text-xs font-medium">Bonus Tiers:</h5>
                          {rate.bonusTiers.map((tier, index) => (
                            <div key={index} className="text-xs p-2 bg-muted/30 rounded flex items-center justify-between">
                              <span>{tier.description}</span>
                              <span className="font-medium text-green-600">
                                {formatCurrency(rate.baseRate * tier.multiplier)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="goals" className="mt-4">
                <div className="space-y-4">
                  {/* Incentive Programs */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Active Incentive Programs
                    </h4>
                    <div className="space-y-3">
                      {commissionData.teamStats.incentivePrograms.map((program) => (
                        <div key={program.id} className="p-3 rounded-lg border-l-4 border-blue-500 bg-blue-50">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h5 className="font-medium text-sm">{program.title}</h5>
                              <p className="text-xs text-muted-foreground mt-1">
                                {program.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-green-600">
                                {formatCurrency(program.reward)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Ends {getDaysUntil(program.endsAt)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <Badge variant="outline">{program.category}</Badge>
                            <span className="text-muted-foreground">
                              {program.participants} participants
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payout Schedule */}
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Next Payout
                    </h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">
                          {new Date(commissionData.payoutSchedule.nextPayoutDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Paid {commissionData.payoutSchedule.frequency}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(commissionData.payoutSchedule.totalPending)}
                        </div>
                        <div className="text-xs text-muted-foreground">Pending</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {lastUpdated && (
              <div className="text-xs text-muted-foreground text-center pt-2 mt-4 border-t">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
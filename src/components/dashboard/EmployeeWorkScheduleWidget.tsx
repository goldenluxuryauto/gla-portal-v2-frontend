import React, { useState, useEffect } from 'react';
import { Users, Clock, Calendar, Coffee, Home, AlertTriangle, RefreshCw, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { buildApiUrl } from '@/lib/queryClient';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone?: string;
  avatar?: string;
  primarySkills: string[];
}

interface WorkSchedule {
  employeeId: string;
  employee: Employee;
  date: string;
  shift: 'morning' | 'afternoon' | 'evening' | 'full_day' | 'off';
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'working' | 'break' | 'lunch' | 'completed' | 'absent';
  location: 'office' | 'airport' | 'remote' | 'field';
  assignedTasks: string[];
  breakTime?: {
    start: string;
    end: string;
    type: 'break' | 'lunch';
  };
}

interface TimeOffRequest {
  id: string;
  employeeId: string;
  employee: Employee;
  startDate: string;
  endDate: string;
  type: 'vacation' | 'sick' | 'personal' | 'bereavement';
  status: 'approved' | 'pending' | 'denied';
  reason?: string;
  daysRequested: number;
}

interface WorkScheduleData {
  todaySchedule: WorkSchedule[];
  weekSchedule: WorkSchedule[];
  timeOffRequests: TimeOffRequest[];
  coverage: {
    currentShift: {
      total: number;
      working: number;
      onBreak: number;
      absent: number;
    };
    criticalRoles: Array<{
      role: string;
      required: number;
      scheduled: number;
      working: number;
      status: 'good' | 'warning' | 'critical';
    }>;
  };
  alerts: Array<{
    id: string;
    type: 'understaffed' | 'overtime' | 'no_coverage' | 'conflict';
    message: string;
    severity: 'low' | 'medium' | 'high';
    affectedDates: string[];
  }>;
}

export function EmployeeWorkScheduleWidget() {
  const [scheduleData, setScheduleData] = useState<WorkScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'timeoff'>('today');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWorkSchedule = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/api/schedule/work'), {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setScheduleData(data);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch work schedule:', response.status);
        // Mock data for development
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        const employees: Employee[] = [
          {
            id: '1',
            name: 'Armando',
            role: 'Windshield Specialist',
            department: 'Maintenance',
            email: 'armando@goldenluxuryauto.com',
            primarySkills: ['windshield_repair', 'glass_replacement', 'detailing']
          },
          {
            id: '2',
            name: 'Adam',
            role: 'Oil Change Technician',
            department: 'Maintenance',
            email: 'adam@goldenluxuryauto.com',
            primarySkills: ['oil_change', 'fluid_check', 'filter_replacement']
          },
          {
            id: '3',
            name: 'Brynn',
            role: 'Registration Coordinator',
            department: 'Operations',
            email: 'brynn@goldenluxuryauto.com',
            primarySkills: ['dmv_registration', 'documentation', 'customer_service']
          },
          {
            id: '4',
            name: 'Kath L.',
            role: 'Fleet Coordinator',
            department: 'Operations',
            email: 'kath@goldenluxuryauto.com',
            primarySkills: ['fleet_management', 'scheduling', 'logistics']
          },
          {
            id: '5',
            name: 'Cathy M.',
            role: 'Virtual Assistant',
            department: 'Administration',
            email: 'cathy@goldenluxuryauto.com',
            primarySkills: ['data_entry', 'customer_support', 'portal_management']
          },
          {
            id: '6',
            name: 'Olavo',
            role: 'Fleet Manager',
            department: 'Operations',
            email: 'olavo@goldenluxuryauto.com',
            primarySkills: ['fleet_oversight', 'vehicle_acquisition', 'maintenance_planning']
          }
        ];

        const mockData: WorkScheduleData = {
          todaySchedule: [
            {
              employeeId: '1',
              employee: employees[0],
              date: today,
              shift: 'full_day',
              startTime: '08:00',
              endTime: '17:00',
              status: 'working',
              location: 'airport',
              assignedTasks: ['3 windshields', '2 detail jobs'],
              breakTime: {
                start: '12:00',
                end: '13:00',
                type: 'lunch'
              }
            },
            {
              employeeId: '2',
              employee: employees[1],
              date: today,
              shift: 'morning',
              startTime: '07:00',
              endTime: '15:00',
              status: 'working',
              location: 'airport',
              assignedTasks: ['5 oil changes', 'fluid checks'],
              breakTime: {
                start: '11:00',
                end: '11:15',
                type: 'break'
              }
            },
            {
              employeeId: '3',
              employee: employees[2],
              date: today,
              shift: 'full_day',
              startTime: '09:00',
              endTime: '17:00',
              status: 'break',
              location: 'office',
              assignedTasks: ['14 February renewals', 'DMV appointments'],
              breakTime: {
                start: '14:30',
                end: '14:45',
                type: 'break'
              }
            },
            {
              employeeId: '4',
              employee: employees[3],
              date: today,
              shift: 'full_day',
              startTime: '08:30',
              endTime: '17:30',
              status: 'working',
              location: 'office',
              assignedTasks: ['Fleet coordination', 'Rental scheduling']
            },
            {
              employeeId: '5',
              employee: employees[4],
              date: today,
              shift: 'full_day',
              startTime: '20:00', // Philippines time
              endTime: '04:00',
              status: 'working',
              location: 'remote',
              assignedTasks: ['Portal data entry', 'Customer support']
            },
            {
              employeeId: '6',
              employee: employees[5],
              date: today,
              shift: 'afternoon',
              startTime: '13:00',
              endTime: '18:00',
              status: 'scheduled',
              location: 'field',
              assignedTasks: ['Vehicle inspections', 'Maintenance review']
            }
          ],
          weekSchedule: [
            {
              employeeId: '1',
              employee: employees[0],
              date: tomorrowStr,
              shift: 'morning',
              startTime: '08:00',
              endTime: '16:00',
              status: 'scheduled',
              location: 'airport',
              assignedTasks: ['2 windshields', 'quality check']
            },
            {
              employeeId: '2',
              employee: employees[1],
              date: tomorrowStr,
              shift: 'off',
              startTime: '',
              endTime: '',
              status: 'scheduled',
              location: 'office',
              assignedTasks: []
            }
          ],
          timeOffRequests: [
            {
              id: '1',
              employeeId: '2',
              employee: employees[1],
              startDate: tomorrowStr,
              endDate: tomorrowStr,
              type: 'personal',
              status: 'approved',
              reason: 'Doctor appointment',
              daysRequested: 1
            },
            {
              id: '2',
              employeeId: '3',
              employee: employees[2],
              startDate: '2026-03-01',
              endDate: '2026-03-05',
              type: 'vacation',
              status: 'pending',
              reason: 'Spring break vacation',
              daysRequested: 5
            }
          ],
          coverage: {
            currentShift: {
              total: 6,
              working: 4,
              onBreak: 1,
              absent: 0
            },
            criticalRoles: [
              {
                role: 'Windshield Specialist',
                required: 1,
                scheduled: 1,
                working: 1,
                status: 'good'
              },
              {
                role: 'Oil Change Technician',
                required: 2,
                scheduled: 1,
                working: 1,
                status: 'warning'
              },
              {
                role: 'Registration Coordinator',
                required: 1,
                scheduled: 1,
                working: 0, // on break
                status: 'warning'
              }
            ]
          },
          alerts: [
            {
              id: '1',
              type: 'understaffed',
              message: 'Only 1 oil change tech scheduled tomorrow - need coverage',
              severity: 'medium',
              affectedDates: [tomorrowStr]
            }
          ]
        };
        setScheduleData(mockData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching work schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkSchedule();
    // Refresh every 5 minutes
    const interval = setInterval(fetchWorkSchedule, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: WorkSchedule['status']) => {
    switch (status) {
      case 'working':
        return 'bg-green-500 text-white';
      case 'break':
      case 'lunch':
        return 'bg-yellow-500 text-black';
      case 'scheduled':
        return 'bg-blue-500 text-white';
      case 'completed':
        return 'bg-gray-500 text-white';
      case 'absent':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getShiftIcon = (shift: WorkSchedule['shift'], status: string) => {
    if (status === 'working') return <User className="h-4 w-4 text-green-500 animate-pulse" />;
    if (status === 'break' || status === 'lunch') return <Coffee className="h-4 w-4 text-yellow-500" />;
    if (shift === 'off') return <Home className="h-4 w-4 text-gray-500" />;
    return <Clock className="h-4 w-4 text-blue-500" />;
  };

  const getLocationIcon = (location: WorkSchedule['location']) => {
    switch (location) {
      case 'office':
        return '🏢';
      case 'airport':
        return '✈️';
      case 'remote':
        return '🏠';
      case 'field':
        return '🚗';
      default:
        return '📍';
    }
  };

  const getCoverageStatus = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-orange-500 bg-orange-50';
      case 'low':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getTimeOffColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-black';
      case 'denied':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading && !scheduleData) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Work Schedule
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
            <Users className="h-5 w-5" />
            Employee Work Schedule
            {scheduleData && scheduleData.alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {scheduleData.alerts.length} alerts
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchWorkSchedule}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {scheduleData && (
          <>
            {/* Current Shift Summary */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-sm font-bold text-blue-600">
                  {scheduleData.coverage.currentShift.total}
                </div>
                <div className="text-xs text-blue-600/70">Scheduled</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-sm font-bold text-green-600">
                  {scheduleData.coverage.currentShift.working}
                </div>
                <div className="text-xs text-green-600/70">Working</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded-lg">
                <div className="text-sm font-bold text-yellow-600">
                  {scheduleData.coverage.currentShift.onBreak}
                </div>
                <div className="text-xs text-yellow-600/70">On Break</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded-lg">
                <div className="text-sm font-bold text-red-600">
                  {scheduleData.coverage.currentShift.absent}
                </div>
                <div className="text-xs text-red-600/70">Absent</div>
              </div>
            </div>

            {/* Alerts */}
            {scheduleData.alerts.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Schedule Alerts
                </h4>
                <div className="space-y-2">
                  {scheduleData.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-2 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
                    >
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        Dates: {alert.affectedDates.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="timeoff">Time Off</TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="mt-4">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {scheduleData.todaySchedule.map((schedule) => (
                    <div
                      key={`${schedule.employeeId}-${schedule.date}`}
                      className="p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getShiftIcon(schedule.shift, schedule.status)}
                          <div>
                            <h4 className="font-medium text-sm">{schedule.employee.name}</h4>
                            <p className="text-xs text-muted-foreground">{schedule.employee.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{getLocationIcon(schedule.location)}</span>
                          <Badge className={`text-xs ${getStatusColor(schedule.status)}`}>
                            {schedule.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      {schedule.shift !== 'off' && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <div className="flex items-center gap-3">
                            <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                            <span>📍 {schedule.location}</span>
                          </div>
                        </div>
                      )}

                      {schedule.assignedTasks.length > 0 && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Today's tasks: </span>
                          <span className="font-medium">{schedule.assignedTasks.join(', ')}</span>
                        </div>
                      )}

                      {schedule.breakTime && (
                        <div className="text-xs text-muted-foreground mt-2">
                          {schedule.breakTime.type === 'lunch' ? '🍽️' : '☕'} 
                          {' '}{schedule.breakTime.type}: {formatTime(schedule.breakTime.start)} - {formatTime(schedule.breakTime.end)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="week" className="mt-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Coverage Analysis</h4>
                  <div className="space-y-3">
                    {scheduleData.coverage.criticalRoles.map((role, index) => (
                      <div key={index} className="p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sm">{role.role}</h5>
                          <Badge className={`text-xs ${getCoverageStatus(role.status)}`}>
                            {role.status}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Coverage</span>
                            <span>{role.working}/{role.required} working</span>
                          </div>
                          <Progress 
                            value={(role.working / role.required) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="timeoff" className="mt-4">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {scheduleData.timeOffRequests.length > 0 ? (
                    scheduleData.timeOffRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-sm">{request.employee.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {request.type} • {request.daysRequested} days
                            </p>
                          </div>
                          <Badge className={`text-xs ${getTimeOffColor(request.status)}`}>
                            {request.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                        </div>
                        {request.reason && (
                          <p className="text-xs text-muted-foreground italic">
                            "{request.reason}"
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No time off requests</p>
                    </div>
                  )}
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
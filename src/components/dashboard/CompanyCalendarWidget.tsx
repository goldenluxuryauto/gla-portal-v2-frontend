import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, MapPin, RefreshCw, AlertCircle, Video, Coffee } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { buildApiUrl } from '@/lib/queryClient';

interface CompanyEvent {
  id: string;
  title: string;
  type: 'meeting' | 'training' | 'holiday' | 'all_hands' | 'team_building' | 'maintenance';
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string;
  description?: string;
  attendees: string[];
  isRecurring: boolean;
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  meetingLink?: string;
  organizer: string;
}

interface CompanyCalendarData {
  todayEvents: CompanyEvent[];
  upcomingEvents: CompanyEvent[];
  thisWeekEvents: CompanyEvent[];
  holidays: CompanyEvent[];
  summary: {
    eventsToday: number;
    eventsThisWeek: number;
    nextHoliday: CompanyEvent | null;
    activeEvents: number;
  };
}

export function CompanyCalendarWidget() {
  const [calendarData, setCalendarData] = useState<CompanyCalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'holidays'>('today');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchCompanyCalendar = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/api/calendar/company'), {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCalendarData(data);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch company calendar:', response.status);
        // Mock data for development
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const mockData: CompanyCalendarData = {
          todayEvents: [
            {
              id: '1',
              title: 'Daily Standup - Operations Team',
              type: 'meeting',
              startDate: `${today.toISOString().split('T')[0]}T09:00:00Z`,
              endDate: `${today.toISOString().split('T')[0]}T09:15:00Z`,
              allDay: false,
              location: 'Car Wash Area',
              description: 'Daily check-in: priorities, blockers, vehicle status updates',
              attendees: ['Armando', 'Adam', 'Brynn', 'Kath'],
              isRecurring: true,
              priority: 'high',
              status: 'scheduled',
              organizer: 'Jay'
            },
            {
              id: '2',
              title: 'Fleet Maintenance Review',
              type: 'meeting',
              startDate: `${today.toISOString().split('T')[0]}T14:00:00Z`,
              endDate: `${today.toISOString().split('T')[0]}T15:00:00Z`,
              allDay: false,
              location: 'Office Conference Room',
              description: 'Weekly review of maintenance schedules, upcoming services, budget allocation',
              attendees: ['Jay', 'Olavo', 'Armando', 'Adam'],
              isRecurring: true,
              priority: 'high',
              status: 'scheduled',
              meetingLink: 'https://meet.google.com/fleet-maintenance',
              organizer: 'Jay'
            }
          ],
          upcomingEvents: [
            {
              id: '3',
              title: 'Team Lunch & Recognition',
              type: 'team_building',
              startDate: `${tomorrow.toISOString().split('T')[0]}T12:00:00Z`,
              endDate: `${tomorrow.toISOString().split('T')[0]}T13:30:00Z`,
              allDay: false,
              location: 'Red Rock Brewing - Downtown SLC',
              description: 'Celebrating January\'s record performance! Top performers announced.',
              attendees: ['All Staff'],
              isRecurring: false,
              priority: 'medium',
              status: 'scheduled',
              organizer: 'Jay'
            },
            {
              id: '4',
              title: 'Turo Host Training Session',
              type: 'training',
              startDate: `${nextWeek.toISOString().split('T')[0]}T10:00:00Z`,
              endDate: `${nextWeek.toISOString().split('T')[0]}T11:30:00Z`,
              allDay: false,
              location: 'Office Training Room',
              description: 'New Turo features, policy updates, customer service best practices',
              attendees: ['All Staff', 'New Hires'],
              isRecurring: false,
              priority: 'high',
              status: 'scheduled',
              organizer: 'Cathy'
            }
          ],
          thisWeekEvents: [
            {
              id: '5',
              title: 'Weekly All-Hands Meeting',
              type: 'all_hands',
              startDate: '2026-02-24T16:00:00Z',
              endDate: '2026-02-24T17:00:00Z',
              allDay: false,
              location: 'Main Office + Zoom',
              description: 'Company updates, Q1 results preview, team announcements',
              attendees: ['All Staff', 'Remote Team'],
              isRecurring: true,
              priority: 'high',
              status: 'scheduled',
              meetingLink: 'https://zoom.us/j/gla-allhands',
              organizer: 'Jay'
            },
            {
              id: '6',
              title: 'Q1 Performance Reviews Begin',
              type: 'meeting',
              startDate: '2026-02-26T08:00:00Z',
              endDate: '2026-02-26T17:00:00Z',
              allDay: true,
              location: 'Individual Meetings',
              description: 'Quarterly performance reviews and goal setting for Q2',
              attendees: ['Management Team'],
              isRecurring: false,
              priority: 'high',
              status: 'scheduled',
              organizer: 'Jay'
            }
          ],
          holidays: [
            {
              id: '7',
              title: 'Presidents Day',
              type: 'holiday',
              startDate: '2026-02-16T00:00:00Z',
              endDate: '2026-02-16T23:59:59Z',
              allDay: true,
              description: 'Federal holiday - Office closed, essential services only',
              attendees: [],
              isRecurring: true,
              priority: 'low',
              status: 'completed',
              organizer: 'System'
            },
            {
              id: '8',
              title: 'Memorial Day Weekend',
              type: 'holiday',
              startDate: '2026-05-23T00:00:00Z',
              endDate: '2026-05-25T23:59:59Z',
              allDay: true,
              description: 'Long weekend - High demand period for rentals',
              attendees: [],
              isRecurring: true,
              priority: 'medium',
              status: 'scheduled',
              organizer: 'System'
            }
          ],
          summary: {
            eventsToday: 2,
            eventsThisWeek: 6,
            nextHoliday: {
              id: '8',
              title: 'Memorial Day Weekend',
              type: 'holiday',
              startDate: '2026-05-23T00:00:00Z',
              endDate: '2026-05-25T23:59:59Z',
              allDay: true,
              description: 'Long weekend - High demand period for rentals',
              attendees: [],
              isRecurring: true,
              priority: 'medium',
              status: 'scheduled',
              organizer: 'System'
            },
            activeEvents: 1
          }
        };
        setCalendarData(mockData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching company calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyCalendar();
    // Refresh every 15 minutes
    const interval = setInterval(fetchCompanyCalendar, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getEventIcon = (type: CompanyEvent['type']) => {
    switch (type) {
      case 'meeting':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'training':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'holiday':
        return <Calendar className="h-4 w-4 text-red-500" />;
      case 'all_hands':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'team_building':
        return <Coffee className="h-4 w-4 text-orange-500" />;
      case 'maintenance':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: CompanyEvent['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-orange-500 bg-orange-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getStatusColor = (status: CompanyEvent['status']) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-500 text-white animate-pulse';
      case 'scheduled':
        return 'bg-green-500 text-white';
      case 'completed':
        return 'bg-gray-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const formatTime = (dateString: string, allDay: boolean) => {
    if (allDay) return 'All Day';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `In ${diffDays} days`;
    return 'Past';
  };

  const isHappeningNow = (event: CompanyEvent) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    return now >= start && now <= end;
  };

  if (loading && !calendarData) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Company Calendar
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
            <Calendar className="h-5 w-5" />
            Company Calendar
            {calendarData && calendarData.summary.activeEvents > 0 && (
              <Badge variant="secondary" className="ml-2 animate-pulse">
                {calendarData.summary.activeEvents} live
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchCompanyCalendar}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {calendarData && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {calendarData.summary.eventsToday}
                </div>
                <div className="text-xs text-blue-600/70">Today</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {calendarData.summary.eventsThisWeek}
                </div>
                <div className="text-xs text-green-600/70">This Week</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded-lg">
                <div className="text-xs font-medium text-purple-600">
                  {calendarData.summary.nextHoliday 
                    ? getDaysUntil(calendarData.summary.nextHoliday.startDate)
                    : 'No holidays'
                  }
                </div>
                <div className="text-xs text-purple-600/70">Next Holiday</div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="holidays">Holidays</TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="mt-4">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {calendarData.todayEvents.length > 0 ? (
                    calendarData.todayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg border-l-4 ${getPriorityColor(event.priority)} ${
                          isHappeningNow(event) ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1">
                            {getEventIcon(event.type)}
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-sm truncate">
                                {event.title}
                                {isHappeningNow(event) && (
                                  <Badge variant="secondary" className="ml-2 text-xs animate-pulse">
                                    LIVE
                                  </Badge>
                                )}
                              </h4>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {formatTime(event.startDate, event.allDay)} - {formatTime(event.endDate, event.allDay)}
                                  </span>
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate">{event.location}</span>
                                  </div>
                                )}
                              </div>
                              {event.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                              {event.meetingLink && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-xs mt-2"
                                  onClick={() => window.open(event.meetingLink, '_blank')}
                                >
                                  <Video className="h-3 w-3 mr-1" />
                                  Join Meeting
                                </Button>
                              )}
                            </div>
                          </div>
                          <Badge className={`text-xs ${getStatusColor(event.status)}`}>
                            {event.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No events scheduled for today</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="week" className="mt-4">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {calendarData.thisWeekEvents.length > 0 ? (
                    calendarData.thisWeekEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg border-l-4 ${getPriorityColor(event.priority)}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1">
                            {getEventIcon(event.type)}
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-sm truncate">{event.title}</h4>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span>{formatDate(event.startDate)}</span>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTime(event.startDate, event.allDay)}</span>
                                </div>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{event.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge className={`text-xs ${getStatusColor(event.status)}`}>
                            {event.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No events this week</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="holidays" className="mt-4">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {calendarData.holidays.length > 0 ? (
                    calendarData.holidays.map((holiday) => (
                      <div
                        key={holiday.id}
                        className="p-3 rounded-lg border-l-4 border-red-500 bg-red-50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1">
                            {getEventIcon(holiday.type)}
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-sm">{holiday.title}</h4>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDate(holiday.startDate)} {!holiday.allDay && `- ${formatDate(holiday.endDate)}`}
                              </div>
                              {holiday.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {holiday.description}
                                </p>
                              )}
                              <div className="text-xs font-medium mt-2 text-red-600">
                                {getDaysUntil(holiday.startDate)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No holidays scheduled</p>
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
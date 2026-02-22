import React, { useState, useEffect } from 'react';
import { Presentation, Users, Calendar, Clock, ExternalLink, FileText, Video, RefreshCw, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { buildApiUrl } from '@/lib/queryClient';

interface WeeklyMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number; // minutes
  location: string;
  slackChannel: string;
  slackChannelId: string;
  presentationUrl?: string;
  agendaUrl?: string;
  recordingUrl?: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  attendees: {
    confirmed: string[];
    pending: string[];
    declined: string[];
  };
  materials: {
    slides: {
      status: 'ready' | 'in_progress' | 'pending';
      lastUpdated?: string;
      url?: string;
    };
    agenda: {
      status: 'ready' | 'in_progress' | 'pending';
      lastUpdated?: string;
      url?: string;
    };
    recording: {
      status: 'available' | 'processing' | 'not_available';
      url?: string;
    };
  };
  actionItems: Array<{
    id: string;
    description: string;
    assignee: string;
    dueDate?: string;
    completed: boolean;
  }>;
  topics: string[];
  organizer: string;
}

interface WeeklyMeetingData {
  nextMeeting: WeeklyMeeting | null;
  recentMeetings: WeeklyMeeting[];
  meetingHistory: WeeklyMeeting[];
  slackIntegration: {
    connected: boolean;
    channelName: string;
    channelId: string;
    lastMessageTime?: string;
    unreadCount: number;
  };
  attendance: {
    averageAttendance: number;
    consistentAttendees: string[];
    frequentAbsentees: string[];
  };
}

export function WeeklyMeetingsWidget() {
  const [meetingData, setMeetingData] = useState<WeeklyMeetingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'next' | 'history' | 'actions'>('next');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMeetingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/api/meetings/weekly'), {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMeetingData(data);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch meeting data:', response.status);
        // Mock data for development
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const mockData: WeeklyMeetingData = {
          nextMeeting: {
            id: '1',
            title: 'Weekly Team Meeting - February 24th',
            date: '2026-02-24',
            time: '16:00',
            duration: 60,
            location: 'Main Office + Zoom',
            slackChannel: '#weekly-meetings',
            slackChannelId: 'C0AG3MK62Q0',
            presentationUrl: 'https://docs.google.com/presentation/d/gla-weekly-feb24',
            agendaUrl: 'https://docs.google.com/document/d/agenda-feb24',
            status: 'upcoming',
            attendees: {
              confirmed: ['Jay', 'Armando', 'Adam', 'Kath'],
              pending: ['Brynn', 'Olavo'],
              declined: []
            },
            materials: {
              slides: {
                status: 'ready',
                lastUpdated: '2026-02-22T10:30:00Z',
                url: 'https://docs.google.com/presentation/d/gla-weekly-feb24'
              },
              agenda: {
                status: 'ready',
                lastUpdated: '2026-02-21T14:00:00Z',
                url: 'https://docs.google.com/document/d/agenda-feb24'
              },
              recording: {
                status: 'not_available'
              }
            },
            actionItems: [
              {
                id: '1',
                description: 'Update commission structure documentation',
                assignee: 'Jay',
                dueDate: '2026-02-25',
                completed: false
              },
              {
                id: '2',
                description: 'Schedule Q1 performance reviews',
                assignee: 'Kath',
                dueDate: '2026-02-28',
                completed: false
              }
            ],
            topics: [
              'January Performance Review',
              'Q1 Goals & Targets',
              'New Commission Structure',
              'Fleet Expansion Update',
              'Team Recognition'
            ],
            organizer: 'Jay'
          },
          recentMeetings: [
            {
              id: '2',
              title: 'Weekly Team Meeting - February 17th',
              date: '2026-02-17',
              time: '16:00',
              duration: 55,
              location: 'Main Office + Zoom',
              slackChannel: '#weekly-meetings',
              slackChannelId: 'C0AG3MK62Q0',
              presentationUrl: 'https://docs.google.com/presentation/d/gla-weekly-feb17',
              recordingUrl: 'https://drive.google.com/file/d/recording-feb17',
              status: 'completed',
              attendees: {
                confirmed: ['Jay', 'Armando', 'Adam', 'Brynn', 'Kath'],
                pending: [],
                declined: ['Olavo']
              },
              materials: {
                slides: {
                  status: 'ready',
                  lastUpdated: '2026-02-16T15:30:00Z',
                  url: 'https://docs.google.com/presentation/d/gla-weekly-feb17'
                },
                agenda: {
                  status: 'ready',
                  lastUpdated: '2026-02-16T12:00:00Z'
                },
                recording: {
                  status: 'available',
                  url: 'https://drive.google.com/file/d/recording-feb17'
                }
              },
              actionItems: [
                {
                  id: '3',
                  description: 'Set up dashboard big screens',
                  assignee: 'Jensen',
                  completed: true
                },
                {
                  id: '4',
                  description: 'Review windshield supplier contracts',
                  assignee: 'Armando',
                  dueDate: '2026-02-20',
                  completed: true
                }
              ],
              topics: [
                'Dashboard Deployment Success',
                'February Vehicle Registrations',
                'Maintenance Schedule Optimization',
                'Customer Satisfaction Scores'
              ],
              organizer: 'Jay'
            }
          ],
          meetingHistory: [],
          slackIntegration: {
            connected: true,
            channelName: '#weekly-meetings',
            channelId: 'C0AG3MK62Q0',
            lastMessageTime: '2026-02-21T14:30:00Z',
            unreadCount: 3
          },
          attendance: {
            averageAttendance: 87,
            consistentAttendees: ['Jay', 'Armando', 'Adam', 'Kath'],
            frequentAbsentees: ['Olavo']
          }
        };
        setMeetingData(mockData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching meeting data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingData();
    // Refresh every 10 minutes
    const interval = setInterval(fetchMeetingData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: WeeklyMeeting['status']) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-500 text-white animate-pulse';
      case 'upcoming':
        return 'bg-green-500 text-white';
      case 'completed':
        return 'bg-gray-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getMaterialStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
      case 'available':
        return 'bg-green-500 text-white';
      case 'in_progress':
      case 'processing':
        return 'bg-yellow-500 text-black';
      case 'pending':
      case 'not_available':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const formatTimeUntil = (dateString: string, timeString: string) => {
    const meetingDate = new Date(`${dateString}T${timeString}:00`);
    const now = new Date();
    const diffMs = meetingDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMs < 0) return 'Past';
    if (diffDays > 0) return `In ${diffDays} days`;
    if (diffHours > 0) return `In ${diffHours} hours`;
    return 'Soon';
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getAttendanceRate = (meeting: WeeklyMeeting) => {
    const total = meeting.attendees.confirmed.length + meeting.attendees.pending.length + meeting.attendees.declined.length;
    if (total === 0) return 0;
    return Math.round((meeting.attendees.confirmed.length / total) * 100);
  };

  if (loading && !meetingData) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Presentation className="h-5 w-5" />
            Weekly Meetings
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
            <Presentation className="h-5 w-5" />
            Weekly Meetings
            {meetingData && meetingData.slackIntegration.unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {meetingData.slackIntegration.unreadCount} unread
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchMeetingData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {meetingData && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {meetingData.attendance.averageAttendance}%
                </div>
                <div className="text-xs text-blue-600/70">Avg Attendance</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {meetingData.nextMeeting ? formatTimeUntil(meetingData.nextMeeting.date, meetingData.nextMeeting.time) : 'None'}
                </div>
                <div className="text-xs text-green-600/70">Next Meeting</div>
              </div>
            </div>

            {/* Slack Integration Status */}
            {meetingData.slackIntegration.connected && (
              <div className="mb-4 p-3 bg-slack-green/10 rounded-lg border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Slack Connected</span>
                    <Badge variant="outline" className="text-xs">
                      {meetingData.slackIntegration.channelName}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => window.open(`https://app.slack.com/client/T0AFADK67FE/${meetingData.slackIntegration.channelId}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open Slack
                  </Button>
                </div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="next">Next Meeting</TabsTrigger>
                <TabsTrigger value="history">Recent</TabsTrigger>
                <TabsTrigger value="actions">Action Items</TabsTrigger>
              </TabsList>

              <TabsContent value="next" className="mt-4">
                {meetingData.nextMeeting ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border-l-4 border-green-500 bg-green-50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm mb-1">
                            {meetingData.nextMeeting.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(meetingData.nextMeeting.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(meetingData.nextMeeting.time)}</span>
                            </div>
                            <span>📍 {meetingData.nextMeeting.location}</span>
                          </div>
                          
                          {/* Attendance Status */}
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium">Attendance</span>
                              <span className="text-xs text-muted-foreground">
                                {getAttendanceRate(meetingData.nextMeeting)}%
                              </span>
                            </div>
                            <Progress value={getAttendanceRate(meetingData.nextMeeting)} className="h-2" />
                            <div className="flex items-center gap-4 mt-2 text-xs">
                              <span className="text-green-600">
                                ✓ {meetingData.nextMeeting.attendees.confirmed.length} confirmed
                              </span>
                              {meetingData.nextMeeting.attendees.pending.length > 0 && (
                                <span className="text-yellow-600">
                                  ⏳ {meetingData.nextMeeting.attendees.pending.length} pending
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Materials Status */}
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="text-center p-2 rounded border">
                              <div className="flex items-center justify-center mb-1">
                                <FileText className="h-3 w-3" />
                              </div>
                              <div className={`text-xs px-1 py-0.5 rounded ${getMaterialStatusColor(meetingData.nextMeeting.materials.slides.status)}`}>
                                {meetingData.nextMeeting.materials.slides.status}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">Slides</div>
                            </div>
                            <div className="text-center p-2 rounded border">
                              <div className="flex items-center justify-center mb-1">
                                <FileText className="h-3 w-3" />
                              </div>
                              <div className={`text-xs px-1 py-0.5 rounded ${getMaterialStatusColor(meetingData.nextMeeting.materials.agenda.status)}`}>
                                {meetingData.nextMeeting.materials.agenda.status}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">Agenda</div>
                            </div>
                            <div className="text-center p-2 rounded border">
                              <div className="flex items-center justify-center mb-1">
                                <Video className="h-3 w-3" />
                              </div>
                              <div className={`text-xs px-1 py-0.5 rounded ${getMaterialStatusColor(meetingData.nextMeeting.materials.recording.status)}`}>
                                {meetingData.nextMeeting.materials.recording.status}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">Recording</div>
                            </div>
                          </div>

                          {/* Quick Access Links */}
                          <div className="flex gap-2">
                            {meetingData.nextMeeting.presentationUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => window.open(meetingData.nextMeeting!.presentationUrl, '_blank')}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                Slides
                              </Button>
                            )}
                            {meetingData.nextMeeting.agendaUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => window.open(meetingData.nextMeeting!.agendaUrl, '_blank')}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                Agenda
                              </Button>
                            )}
                          </div>
                        </div>
                        <Badge className={`text-xs ${getStatusColor(meetingData.nextMeeting.status)}`}>
                          {meetingData.nextMeeting.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    {/* Topics Preview */}
                    {meetingData.nextMeeting.topics.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Meeting Topics</h4>
                        <div className="space-y-1">
                          {meetingData.nextMeeting.topics.map((topic, index) => (
                            <div key={index} className="text-xs p-2 bg-muted/30 rounded">
                              {index + 1}. {topic}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No upcoming meetings scheduled</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {meetingData.recentMeetings.length > 0 ? (
                    meetingData.recentMeetings.map((meeting) => (
                      <div key={meeting.id} className="p-3 rounded-lg border">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm mb-1">{meeting.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                              <span>{new Date(meeting.date).toLocaleDateString()}</span>
                              <span>{meeting.duration}min</span>
                              <span>{getAttendanceRate(meeting)}% attendance</span>
                            </div>
                            
                            <div className="flex gap-2">
                              {meeting.materials.slides.url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => window.open(meeting.materials.slides.url, '_blank')}
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  Slides
                                </Button>
                              )}
                              {meeting.recordingUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => window.open(meeting.recordingUrl, '_blank')}
                                >
                                  <Video className="h-3 w-3 mr-1" />
                                  Recording
                                </Button>
                              )}
                            </div>
                          </div>
                          <Badge className={`text-xs ${getStatusColor(meeting.status)}`}>
                            {meeting.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Presentation className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No recent meetings</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="actions" className="mt-4">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {meetingData.nextMeeting?.actionItems.length || meetingData.recentMeetings.some(m => m.actionItems.length) ? (
                    <>
                      {meetingData.nextMeeting?.actionItems.map((item) => (
                        <div key={item.id} className="p-3 rounded-lg border-l-4 border-orange-500 bg-orange-50">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h5 className="font-medium text-sm">{item.description}</h5>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                <span>Assigned: {item.assignee}</span>
                                {item.dueDate && (
                                  <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  pending
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {meetingData.recentMeetings.map((meeting) =>
                        meeting.actionItems.map((item) => (
                          <div key={`${meeting.id}-${item.id}`} className="p-3 rounded-lg border">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h5 className="font-medium text-sm">{item.description}</h5>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                  <span>From: {meeting.title}</span>
                                  <span>Assigned: {item.assignee}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.completed ? (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="h-3 w-3" />
                                    <span className="text-xs">Done</span>
                                  </div>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    pending
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No action items</p>
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
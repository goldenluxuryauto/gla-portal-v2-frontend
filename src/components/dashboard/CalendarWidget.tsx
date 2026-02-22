import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { buildApiUrl } from '@/lib/queryClient';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
  attendees?: string[];
  calendarName: string;
}

export function CalendarWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/api/calendar/upcoming'), {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch calendar events:', response.status);
        // Mock data for development
        setEvents([
          {
            id: '1',
            title: 'Team Meeting',
            start: '2026-02-21T14:00:00',
            end: '2026-02-21T15:00:00',
            location: 'Office',
            calendarName: 'Business'
          },
          {
            id: '2', 
            title: 'Vehicle Inspection - Fleet Review',
            start: '2026-02-22T10:00:00',
            end: '2026-02-22T12:00:00',
            location: 'Airport Location',
            calendarName: 'Operations'
          },
          {
            id: '3',
            title: 'Client Meeting - Partnership Discussion',
            start: '2026-02-23T16:00:00',
            end: '2026-02-23T17:00:00',
            location: 'Downtown SLC',
            calendarName: 'Business'
          }
        ]);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
    // Refresh every 15 minutes
    const interval = setInterval(fetchCalendarEvents, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dateStr = '';
    if (date.toDateString() === today.toDateString()) {
      dateStr = 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return `${dateStr} at ${timeStr}`;
  };

  const getEventTypeColor = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('meeting')) return 'bg-blue-100 text-blue-800';
    if (lowerTitle.includes('inspection') || lowerTitle.includes('maintenance')) return 'bg-orange-100 text-orange-800';
    if (lowerTitle.includes('client') || lowerTitle.includes('partnership')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading && events.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar
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
            Google Calendar
          </div>
          <Button
            variant="ghost" 
            size="sm"
            onClick={fetchCalendarEvents}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {events.slice(0, 8).map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className="flex-shrink-0 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(event.start)}
                      </p>
                      {event.location && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground truncate">
                            {event.location}
                          </p>
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.title)}`}>
                      {event.calendarName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {lastUpdated && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
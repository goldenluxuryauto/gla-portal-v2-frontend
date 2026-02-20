import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'pickup' | 'return' | 'maintenance' | 'inspection';
  revenue?: number;
  vehicleId?: string;
}

export function ScheduleWidget() {
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch upcoming events from API
    const fetchEvents = async () => {
      try {
        // This would connect to your backend API
        const mockEvents: UpcomingEvent[] = [
          {
            id: '1',
            title: 'Tesla Model S - Pickup',
            date: '2026-02-21',
            time: '10:00 AM',
            location: 'SLC Airport',
            type: 'pickup',
            revenue: 450,
            vehicleId: 'tesla-001'
          },
          {
            id: '2', 
            title: 'BMW X5 - Return',
            date: '2026-02-21',
            time: '2:00 PM',
            location: 'Downtown SLC',
            type: 'return',
            vehicleId: 'bmw-x5-003'
          },
          {
            id: '3',
            title: 'Audi Q7 - Oil Change',
            date: '2026-02-22',
            time: '9:00 AM',
            location: 'GLA Service Center',
            type: 'maintenance',
            vehicleId: 'audi-q7-002'
          }
        ];
        
        setUpcomingEvents(mockEvents);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getTypeColor = (type: UpcomingEvent['type']) => {
    switch (type) {
      case 'pickup': return 'text-green-600 bg-green-50';
      case 'return': return 'text-blue-600 bg-blue-50';
      case 'maintenance': return 'text-yellow-600 bg-yellow-50';
      case 'inspection': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <Card className="h-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gla-gold" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gla-gold" />
          Today's Schedule
          <span className="ml-auto text-sm text-gray-500">
            {upcomingEvents.length} events
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {upcomingEvents.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No events scheduled</p>
            </div>
          ) : (
            upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(event.type)}`}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                    {event.revenue && (
                      <div className="flex items-center gap-1 text-green-600">
                        <DollarSign className="h-4 w-4" />
                        ${event.revenue}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState, useEffect } from 'react';
import { Megaphone, X, ChevronLeft, ChevronRight, AlertTriangle, Info, CheckCircle, Crown, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { buildApiUrl } from '@/lib/queryClient';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent' | 'ceo_message';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  endDate?: string;
  targetAudience: 'all' | 'staff' | 'management' | 'specific';
  targetRoles?: string[];
  isActive: boolean;
  isPinned: boolean;
  dismissible: boolean;
  actionButton?: {
    text: string;
    url: string;
    type: 'primary' | 'secondary';
  };
  author: string;
  createdAt: string;
  readBy: string[];
  clickCount: number;
}

interface AnnouncementData {
  announcements: Announcement[];
  activeCount: number;
  urgentCount: number;
  userDismissed: string[]; // IDs of dismissed announcements
}

export function HeaderAnnouncementWidget() {
  const [announcementData, setAnnouncementData] = useState<AnnouncementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const currentUser = 'staff_member'; // In real implementation, get from auth

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/api/announcements'), {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnnouncementData(data);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch announcements:', response.status);
        // Mock data for development
        const mockData: AnnouncementData = {
          announcements: [
            {
              id: '1',
              title: '🎉 RECORD BREAKING MONTH!',
              message: 'Team, we just smashed our previous record with $182K in January! This success belongs to every single one of you. Your dedication and hard work is paying off big time. Keep it up!',
              type: 'ceo_message',
              priority: 'high',
              startDate: '2026-02-01T08:00:00Z',
              endDate: '2026-02-28T23:59:59Z',
              targetAudience: 'all',
              isActive: true,
              isPinned: true,
              dismissible: false,
              author: 'Jay',
              createdAt: '2026-02-01T08:00:00Z',
              readBy: ['user1', 'user2'],
              clickCount: 24
            },
            {
              id: '2',
              title: '💰 NEW COMMISSION STRUCTURE - EFFECTIVE MARCH 1ST',
              message: 'Exciting news! Updated commission rates mean higher earning potential for everyone. Windshield specialists can now earn up to $37.50 per job (50% bonus at 10+ per week). Details in the Commission tab.',
              type: 'info',
              priority: 'high',
              startDate: '2026-02-20T10:00:00Z',
              endDate: '2026-03-15T23:59:59Z',
              targetAudience: 'all',
              isActive: true,
              isPinned: true,
              dismissible: true,
              actionButton: {
                text: 'View Commission Rates',
                url: '#',
                type: 'primary'
              },
              author: 'Jay',
              createdAt: '2026-02-20T10:00:00Z',
              readBy: ['user1'],
              clickCount: 18
            },
            {
              id: '3',
              title: '🚨 FEBRUARY VEHICLE REGISTRATIONS DUE',
              message: '14 vehicles need registration renewal this month. Brynn is handling the bulk, but we need everyone to stay alert for expiration notices. No vehicles go out with expired registration!',
              type: 'warning',
              priority: 'medium',
              startDate: '2026-02-15T09:00:00Z',
              endDate: '2026-02-29T23:59:59Z',
              targetAudience: 'staff',
              targetRoles: ['operations', 'maintenance'],
              isActive: true,
              isPinned: false,
              dismissible: true,
              author: 'Kath L.',
              createdAt: '2026-02-15T09:00:00Z',
              readBy: ['user1', 'user2', 'user3'],
              clickCount: 12
            },
            {
              id: '4',
              title: '🏆 TEAM LUNCH TOMORROW - 12PM AT RED ROCK BREWING',
              message: 'Celebrating our January success! All staff invited. Top performers will be recognized. Great food, good company, and some exciting announcements about Q1 goals.',
              type: 'success',
              priority: 'medium',
              startDate: '2026-02-21T08:00:00Z',
              endDate: '2026-02-22T14:00:00Z',
              targetAudience: 'all',
              isActive: true,
              isPinned: false,
              dismissible: true,
              actionButton: {
                text: 'RSVP Required',
                url: '#',
                type: 'secondary'
              },
              author: 'Jay',
              createdAt: '2026-02-21T08:00:00Z',
              readBy: [],
              clickCount: 8
            }
          ],
          activeCount: 4,
          urgentCount: 1,
          userDismissed: []
        };
        setAnnouncementData(mockData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // Refresh every 2 minutes
    const interval = setInterval(fetchAnnouncements, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isRotating || !announcementData || announcementData.announcements.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => 
        (prev + 1) % announcementData.announcements.length
      );
    }, 8000); // Rotate every 8 seconds

    return () => clearInterval(interval);
  }, [isRotating, announcementData]);

  const dismissAnnouncement = async (announcementId: string) => {
    try {
      await fetch(buildApiUrl(`/api/announcements/${announcementId}/dismiss`), {
        method: 'POST',
        credentials: 'include'
      });
      
      if (announcementData) {
        const updatedData = { ...announcementData };
        updatedData.userDismissed = [...updatedData.userDismissed, announcementId];
        setAnnouncementData(updatedData);
        
        // If we dismissed the current announcement, move to next
        if (currentIndex < announcementData.announcements.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCurrentIndex(0);
        }
      }
    } catch (error) {
      console.error('Error dismissing announcement:', error);
    }
  };

  const markAsRead = async (announcementId: string) => {
    try {
      await fetch(buildApiUrl(`/api/announcements/${announcementId}/read`), {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  const getTypeIcon = (type: Announcement['type']) => {
    switch (type) {
      case 'ceo_message':
        return <Crown className="h-5 w-5 text-yellow-600" />;
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeColor = (type: Announcement['type'], priority: Announcement['priority']) => {
    if (priority === 'critical') {
      return 'border-red-500 bg-red-50 text-red-900';
    }
    
    switch (type) {
      case 'ceo_message':
        return 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-900';
      case 'urgent':
        return 'border-red-500 bg-red-50 text-red-900';
      case 'warning':
        return 'border-orange-500 bg-orange-50 text-orange-900';
      case 'success':
        return 'border-green-500 bg-green-50 text-green-900';
      case 'info':
      default:
        return 'border-blue-500 bg-blue-50 text-blue-900';
    }
  };

  const getPriorityBadge = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive" className="animate-pulse">CRITICAL</Badge>;
      case 'high':
        return <Badge variant="destructive">HIGH</Badge>;
      case 'medium':
        return <Badge variant="secondary">MEDIUM</Badge>;
      case 'low':
        return <Badge variant="outline">LOW</Badge>;
      default:
        return null;
    }
  };

  const isUnread = (announcement: Announcement) => {
    return !announcement.readBy.includes(currentUser);
  };

  const isDismissed = (announcementId: string) => {
    return announcementData?.userDismissed.includes(announcementId) || false;
  };

  // Filter out dismissed announcements
  const activeAnnouncements = announcementData?.announcements.filter(
    a => a.isActive && !isDismissed(a.id)
  ) || [];

  if (loading || !announcementData || activeAnnouncements.length === 0) {
    return null; // No banner if no announcements
  }

  const currentAnnouncement = activeAnnouncements[currentIndex % activeAnnouncements.length];

  return (
    <Card className={`mb-6 border-l-4 ${getTypeColor(currentAnnouncement.type, currentAnnouncement.priority)} ${
      currentAnnouncement.priority === 'critical' ? 'shadow-lg animate-pulse' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 pt-1">
            {getTypeIcon(currentAnnouncement.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-sm truncate">
                {currentAnnouncement.title}
              </h3>
              {getPriorityBadge(currentAnnouncement.priority)}
              {isUnread(currentAnnouncement) && (
                <Badge variant="secondary" className="text-xs">NEW</Badge>
              )}
              {currentAnnouncement.isPinned && (
                <Badge variant="outline" className="text-xs">PINNED</Badge>
              )}
            </div>
            
            <p className="text-sm leading-relaxed mb-3">
              {currentAnnouncement.message}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Author and timestamp */}
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">{currentAnnouncement.author}</span>
                  {' • '}
                  <span>{new Date(currentAnnouncement.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Action button */}
                {currentAnnouncement.actionButton && (
                  <Button
                    variant={currentAnnouncement.actionButton.type === 'primary' ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      if (currentAnnouncement.actionButton?.url.startsWith('#')) {
                        // Handle internal navigation
                        console.log('Navigate to:', currentAnnouncement.actionButton.url);
                      } else {
                        window.open(currentAnnouncement.actionButton?.url, '_blank');
                      }
                      markAsRead(currentAnnouncement.id);
                    }}
                  >
                    {currentAnnouncement.actionButton.text}
                  </Button>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Navigation for multiple announcements */}
                {activeAnnouncements.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        setIsRotating(false);
                        setCurrentIndex(Math.max(0, currentIndex - 1));
                      }}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    
                    <div className="text-xs text-muted-foreground min-w-[3rem] text-center">
                      {currentIndex + 1} / {activeAnnouncements.length}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        setIsRotating(false);
                        setCurrentIndex((currentIndex + 1) % activeAnnouncements.length);
                      }}
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setIsRotating(!isRotating)}
                      title={isRotating ? 'Pause rotation' : 'Resume rotation'}
                    >
                      {isRotating ? (
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                      ) : (
                        <div className="h-2 w-2 bg-gray-400 rounded-full" />
                      )}
                    </Button>
                  </>
                )}

                {/* Dismiss button */}
                {currentAnnouncement.dismissible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => dismissAnnouncement(currentAnnouncement.id)}
                    title="Dismiss announcement"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rotation indicator dots */}
        {activeAnnouncements.length > 1 && (
          <div className="flex items-center justify-center gap-1 mt-3 pt-3 border-t">
            {activeAnnouncements.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-blue-500 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => {
                  setIsRotating(false);
                  setCurrentIndex(index);
                }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
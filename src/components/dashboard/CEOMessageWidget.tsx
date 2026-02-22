import React, { useState, useEffect } from 'react';
import { Crown, Video, MessageSquare, Eye, RefreshCw, Calendar, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { buildApiUrl } from '@/lib/queryClient';

interface CEOMessage {
  id: string;
  type: 'video' | 'text' | 'announcement';
  title: string;
  content?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  priority: 'normal' | 'important' | 'urgent';
  createdAt: string;
  expiresAt?: string;
  readBy: string[];
  targetAudience: 'all' | 'staff' | 'management';
  tags: string[];
  isPinned: boolean;
}

interface CEOMessageData {
  currentMessage: CEOMessage | null;
  recentMessages: CEOMessage[];
  unreadCount: number;
  videoPlaylist?: {
    channelUrl: string;
    latestVideos: Array<{
      id: string;
      title: string;
      url: string;
      thumbnailUrl: string;
      publishedAt: string;
      duration: string;
    }>;
  };
}

export function CEOMessageWidget() {
  const [messageData, setMessageData] = useState<CEOMessageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'current' | 'videos' | 'archive'>('current');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const currentUser = 'staff_member'; // In real implementation, get from auth

  const fetchCEOMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/api/messages/ceo'), {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessageData(data);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch CEO messages:', response.status);
        // Mock data for development
        const mockData: CEOMessageData = {
          currentMessage: {
            id: '1',
            type: 'video',
            title: 'Weekly Update: Q1 Performance & Goals',
            content: 'Team, great work this week! We\'re exceeding our targets and I wanted to share some exciting updates about our growth trajectory and upcoming opportunities.',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            thumbnailUrl: '/api/placeholder/320/180',
            priority: 'important',
            createdAt: '2026-02-21T08:00:00Z',
            expiresAt: '2026-02-28T23:59:59Z',
            readBy: ['user1', 'user2'],
            targetAudience: 'all',
            tags: ['weekly-update', 'performance', 'goals'],
            isPinned: true
          },
          recentMessages: [
            {
              id: '2',
              type: 'announcement',
              title: 'New Commission Structure - Effective March 1st',
              content: 'I\'m excited to announce updated commission rates that will increase earning potential for all team members. Details attached.',
              priority: 'important',
              createdAt: '2026-02-20T10:30:00Z',
              readBy: ['user1'],
              targetAudience: 'all',
              tags: ['commission', 'compensation'],
              isPinned: false
            },
            {
              id: '3',
              type: 'text',
              title: 'Celebrating Our Success',
              content: 'Team, we just hit our highest monthly revenue ever! $182K in January. This success belongs to all of you. Thank you for your dedication.',
              priority: 'normal',
              createdAt: '2026-02-01T16:00:00Z',
              readBy: ['user1', 'user2', 'user3'],
              targetAudience: 'all',
              tags: ['celebration', 'revenue', 'milestone'],
              isPinned: false
            }
          ],
          unreadCount: 2,
          videoPlaylist: {
            channelUrl: 'https://youtube.com/@GoldenLuxuryAuto',
            latestVideos: [
              {
                id: 'vid1',
                title: 'GLA Monthly Newsletter - February 2026',
                url: 'https://www.youtube.com/watch?v=example1',
                thumbnailUrl: '/api/placeholder/160/90',
                publishedAt: '2026-02-15T12:00:00Z',
                duration: '8:45'
              },
              {
                id: 'vid2', 
                title: 'Fleet Expansion Update - New Vehicles',
                url: 'https://www.youtube.com/watch?v=example2',
                thumbnailUrl: '/api/placeholder/160/90',
                publishedAt: '2026-02-08T14:30:00Z',
                duration: '12:15'
              },
              {
                id: 'vid3',
                title: 'Team Recognition - January Winners',
                url: 'https://www.youtube.com/watch?v=example3',
                thumbnailUrl: '/api/placeholder/160/90',
                publishedAt: '2026-02-01T10:00:00Z',
                duration: '6:30'
              }
            ]
          }
        };
        setMessageData(mockData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching CEO messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCEOMessages();
    // Refresh every 10 minutes
    const interval = setInterval(fetchCEOMessages, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (messageId: string) => {
    try {
      await fetch(buildApiUrl(`/api/messages/ceo/${messageId}/read`), {
        method: 'POST',
        credentials: 'include'
      });
      // Update local state
      if (messageData) {
        const updatedData = { ...messageData };
        updatedData.recentMessages = updatedData.recentMessages.map(msg => 
          msg.id === messageId 
            ? { ...msg, readBy: [...msg.readBy, currentUser] }
            : msg
        );
        if (updatedData.currentMessage?.id === messageId) {
          updatedData.currentMessage = {
            ...updatedData.currentMessage,
            readBy: [...updatedData.currentMessage.readBy, currentUser]
          };
        }
        setMessageData(updatedData);
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const getPriorityColor = (priority: CEOMessage['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white animate-pulse';
      case 'important':
        return 'bg-orange-500 text-white';
      case 'normal':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getMessageIcon = (type: CEOMessage['type']) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'announcement':
        return <MessageSquare className="h-4 w-4" />;
      case 'text':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const isUnread = (message: CEOMessage) => {
    return !message.readBy.includes(currentUser);
  };

  if (loading && !messageData) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Message from CEO
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
            <Crown className="h-5 w-5 text-yellow-600" />
            Message from CEO
            {messageData && messageData.unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {messageData.unreadCount} new
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchCEOMessages}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {messageData && (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="archive">Archive</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="mt-4">
              {messageData.currentMessage ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border-l-4 ${
                    messageData.currentMessage.isPinned 
                      ? 'border-yellow-500 bg-yellow-50' 
                      : 'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {getMessageIcon(messageData.currentMessage.type)}
                        <h3 className="font-medium text-sm">
                          {messageData.currentMessage.title}
                        </h3>
                        {messageData.currentMessage.isPinned && (
                          <Badge variant="secondary" className="text-xs">
                            Pinned
                          </Badge>
                        )}
                      </div>
                      <Badge className={`text-xs ${getPriorityColor(messageData.currentMessage.priority)}`}>
                        {messageData.currentMessage.priority}
                      </Badge>
                    </div>

                    {messageData.currentMessage.type === 'video' && messageData.currentMessage.videoUrl && (
                      <div className="mb-3">
                        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={messageData.currentMessage.thumbnailUrl} 
                            alt="Video thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-black/60 hover:bg-black/80 text-white"
                              onClick={() => window.open(messageData.currentMessage?.videoUrl, '_blank')}
                            >
                              <Video className="h-4 w-4 mr-1" />
                              Play Video
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground mb-3">
                      {messageData.currentMessage.content}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(messageData.currentMessage.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isUnread(messageData.currentMessage) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => markAsRead(messageData.currentMessage!.id)}
                          >
                            Mark as Read
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1 text-green-600">
                            <Eye className="h-3 w-3" />
                            <span>Read</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Crown className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No current messages from CEO</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="videos" className="mt-4">
              {messageData.videoPlaylist?.latestVideos ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Latest Videos</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => window.open(messageData.videoPlaylist?.channelUrl, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      YouTube Channel
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {messageData.videoPlaylist.latestVideos.map((video) => (
                      <div
                        key={video.id}
                        className="flex gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer"
                        onClick={() => window.open(video.url, '_blank')}
                      >
                        <div className="flex-shrink-0 relative">
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            className="w-16 h-9 object-cover rounded"
                          />
                          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                            {video.duration}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs truncate">{video.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(video.publishedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No videos available</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="archive" className="mt-4">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {messageData.recentMessages.length > 0 ? (
                  messageData.recentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg border ${
                        isUnread(message) 
                          ? 'border-blue-200 bg-blue-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getMessageIcon(message.type)}
                            <h4 className="font-medium text-sm truncate">
                              {message.title}
                            </h4>
                            {isUnread(message) && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {message.content}
                          </p>
                          <div className="text-xs text-muted-foreground mt-2">
                            {formatDate(message.createdAt)}
                          </div>
                        </div>
                        <Badge className={`text-xs ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No archived messages</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {lastUpdated && (
          <div className="text-xs text-muted-foreground text-center pt-2 mt-4 border-t">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
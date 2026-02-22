import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, AlertTriangle, User, Calendar, RefreshCw, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { buildApiUrl } from '@/lib/queryClient';

interface Task {
  id: string;
  vehicleId: string;
  vehicleName: string;
  type: 'oil_change' | 'registration' | 'windshield' | 'check_engine' | 'autobody';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  createdAt: string;
  dueDate?: string;
  nextRentalDate?: string;
  timeNeeded: number; // hours
  conflict: boolean;
  conflictMessage?: string;
}

interface StaffMember {
  id: string;
  name: string;
  specialties: string[];
  activeTasks: number;
}

export function TaskManagerWidget() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'urgent' | 'my_tasks'>('all');
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    vehicleId: '',
    type: 'oil_change' as Task['type'],
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    assignedTo: '',
    timeNeeded: 2
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/api/tasks'), {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
        setStaffMembers(data.staffMembers || []);
      } else {
        // Mock data for demonstration
        const mockStaff: StaffMember[] = [
          { id: '1', name: 'Armando', specialties: ['windshield', 'autobody'], activeTasks: 3 },
          { id: '2', name: 'Adam', specialties: ['oil_change', 'check_engine'], activeTasks: 2 },
          { id: '3', name: 'Brynn', specialties: ['registration', 'oil_change'], activeTasks: 1 },
        ];

        const mockTasks: Task[] = [
          {
            id: '1',
            vehicleId: 'CHV001',
            vehicleName: 'Chevrolet Tahoe 2023 (A439DN)',
            type: 'windshield',
            title: 'Replace Cracked Windshield',
            description: 'Large crack on passenger side, safety issue',
            priority: 'urgent',
            assignedTo: 'Armando',
            status: 'pending',
            createdAt: '2026-02-21T10:00:00Z',
            dueDate: '2026-02-22T17:00:00Z',
            nextRentalDate: '2026-02-23T09:00:00Z',
            timeNeeded: 4,
            conflict: true,
            conflictMessage: 'Not enough time before next rental (14 hours needed, 16 hours available)'
          },
          {
            id: '2',
            vehicleId: 'TOY002',
            vehicleName: 'Toyota Camry 2024 (B528KL)',
            type: 'oil_change',
            title: 'Scheduled Oil Change',
            description: '5,000 mile service due',
            priority: 'medium',
            assignedTo: 'Adam',
            status: 'in_progress',
            createdAt: '2026-02-20T08:00:00Z',
            nextRentalDate: '2026-02-28T14:00:00Z',
            timeNeeded: 2,
            conflict: false
          },
          {
            id: '3',
            vehicleId: 'HON003',
            vehicleName: 'Honda Pilot 2023 (C891MN)',
            type: 'registration',
            title: 'Vehicle Registration Renewal',
            description: 'Registration expires March 1st',
            priority: 'high',
            assignedTo: 'Brynn',
            status: 'pending',
            createdAt: '2026-02-19T12:00:00Z',
            dueDate: '2026-03-01T23:59:59Z',
            nextRentalDate: '2026-02-25T10:00:00Z',
            timeNeeded: 1,
            conflict: false
          },
          {
            id: '4',
            vehicleId: 'NIS004',
            vehicleName: 'Nissan Altima 2022 (D123PQ)',
            type: 'check_engine',
            title: 'Check Engine Light Diagnosis',
            description: 'Engine light came on, needs diagnostic scan',
            priority: 'high',
            status: 'pending',
            createdAt: '2026-02-21T14:00:00Z',
            nextRentalDate: '2026-02-24T11:00:00Z',
            timeNeeded: 3,
            conflict: false
          },
          {
            id: '5',
            vehicleId: 'FRD005',
            vehicleName: 'Ford Explorer 2024 (E456RS)',
            type: 'autobody',
            title: 'Minor Dent Repair',
            description: 'Small dent on rear bumper from parking incident',
            priority: 'low',
            assignedTo: 'Armando',
            status: 'completed',
            createdAt: '2026-02-18T09:00:00Z',
            timeNeeded: 6,
            conflict: false
          }
        ];

        setTasks(mockTasks);
        setStaffMembers(mockStaff);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const markTaskComplete = async (taskId: string) => {
    try {
      const response = await fetch(buildApiUrl(`/api/tasks/${taskId}/complete`), {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, status: 'completed' } : task
        ));
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const getTaskTypeIcon = (type: Task['type']) => {
    switch (type) {
      case 'oil_change': return '🛢️';
      case 'registration': return '📋';
      case 'windshield': return '🪟';
      case 'check_engine': return '🔧';
      case 'autobody': return '🚗';
      default: return '📝';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filterTasks = (tasks: Task[]) => {
    switch (activeTab) {
      case 'urgent':
        return tasks.filter(task => task.priority === 'urgent' || task.conflict);
      case 'my_tasks':
        // In real implementation, filter by current user
        return tasks.filter(task => task.assignedTo === 'Armando'); 
      default:
        return tasks;
    }
  };

  const formatTimeRemaining = (date: string) => {
    const now = new Date();
    const target = new Date(date);
    const diff = target.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 0) return 'Overdue';
    if (hours < 24) return `${hours}h remaining`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h remaining`;
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Task Manager
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

  const filteredTasks = filterTasks(tasks.filter(task => task.status !== 'completed'));
  const urgentTasks = tasks.filter(task => task.priority === 'urgent' || task.conflict).length;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Task Manager
            {urgentTasks > 0 && (
              <Badge variant="destructive" className="ml-2">
                {urgentTasks} urgent
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchTasks}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="vehicle">Vehicle</Label>
                    <Input
                      id="vehicle"
                      placeholder="Vehicle ID or Name"
                      value={newTask.vehicleId}
                      onChange={(e) => setNewTask({...newTask, vehicleId: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Task Type</Label>
                    <Select
                      value={newTask.type}
                      onValueChange={(value) => setNewTask({...newTask, type: value as Task['type']})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oil_change">Oil Change</SelectItem>
                        <SelectItem value="registration">Registration</SelectItem>
                        <SelectItem value="windshield">Windshield</SelectItem>
                        <SelectItem value="check_engine">Check Engine</SelectItem>
                        <SelectItem value="autobody">Auto Body</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowNewTaskDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      // Create task logic here
                      setShowNewTaskDialog(false);
                    }}>
                      Create Task
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All ({tasks.filter(t => t.status !== 'completed').length})</TabsTrigger>
            <TabsTrigger value="urgent">Urgent ({urgentTasks})</TabsTrigger>
            <TabsTrigger value="my_tasks">My Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredTasks.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No tasks found</p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      task.conflict ? 'border-l-red-500 bg-red-50' : 'border-l-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getTaskTypeIcon(task.type)}</span>
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          {task.vehicleName}
                        </p>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          {task.description}
                        </p>
                        
                        {task.conflict && task.conflictMessage && (
                          <div className="flex items-start gap-2 mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
                            <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{task.conflictMessage}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          {task.assignedTo && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{task.assignedTo}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{task.timeNeeded}h needed</span>
                          </div>
                          
                          {task.nextRentalDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatTimeRemaining(task.nextRentalDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        
                        {task.status !== 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markTaskComplete(task.id)}
                            className="text-xs h-6"
                          >
                            Mark Done
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildApiUrl } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Users, Clock, ClipboardList, DollarSign, Timer, CheckCircle } from "lucide-react";

const EMPLOYEES = [
  { id: 1, name: "Cathy Mangulabnan", number: "83836", email: "cathy.mangulabnan12@gmail.com", phone: "639178790128", status: "Active" },
  { id: 2, name: "Jane Smith", number: "22432", email: "danielitalo01@outlook.com", phone: "555-0101", status: "Active" },
];

function formatDuration(start: string, end: string | null) {
  if (!end) return "Active";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const hrs = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  return `${hrs}h ${mins}m`;
}

export default function HRPortalPage() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: timeEntries } = useQuery({
    queryKey: ["/api/admin/time-entries"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/admin/time-entries"), { credentials: "include" });
      const json = await res.json();
      return json.data || [];
    },
  });

  const { data: tasks } = useQuery({
    queryKey: ["/api/admin/tasks"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/admin/tasks"), { credentials: "include" });
      const json = await res.json();
      return json.data || [];
    },
  });

  const { data: payroll } = useQuery({
    queryKey: ["/api/admin/payroll"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/admin/payroll"), { credentials: "include" });
      const json = await res.json();
      return json.data || [];
    },
  });

  const clockIn = useMutation({
    mutationFn: async (employeeId: number) => {
      const res = await fetch(buildApiUrl("/api/admin/time-entries"), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, clockIn: new Date().toISOString() }),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/time-entries"] }); toast({ title: "Clocked in!" }); },
  });

  const clockOut = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(buildApiUrl(`/api/admin/time-entries/${id}`), {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clockOut: new Date().toISOString() }),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/time-entries"] }); toast({ title: "Clocked out" }); },
  });

  const getActiveEntry = (empId: number) => (timeEntries || []).find((t: any) => String(t.employeeId) === String(empId) && !t.clockOut);
  const getEmployeeTasks = (name: string) => (tasks || []).filter((t: any) => t.assignedTo === name && t.status !== "done");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Employee Portal</h1>
          <p className="text-muted-foreground mt-1">Manage schedules, time tracking, and task assignments</p>
        </div>

        {/* Employee Cards with Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          {EMPLOYEES.map(emp => {
            const active = getActiveEntry(emp.id);
            const empTasks = getEmployeeTasks(emp.name.split(" ")[0] === "Cathy" ? "Cathy M." : emp.name);
            return (
              <Card key={emp.id} className="hover:border-[#DAA520]/30 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{emp.name}</h3>
                      <p className="text-sm text-muted-foreground">#{emp.number} • {emp.email}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">{emp.status}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold">{empTasks.length}</p>
                      <p className="text-[10px] text-muted-foreground">Active Tasks</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold">{(timeEntries || []).filter((t: any) => String(t.employeeId) === String(emp.id)).length}</p>
                      <p className="text-[10px] text-muted-foreground">Time Entries</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold">{active ? "🟢" : "⚪"}</p>
                      <p className="text-[10px] text-muted-foreground">{active ? "On Clock" : "Off"}</p>
                    </div>
                  </div>
                  {active ? (
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={() => clockOut.mutate(active.id)}>
                      <Timer className="w-4 h-4 mr-2" /> Clock Out
                    </Button>
                  ) : (
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => clockIn.mutate(emp.id)}>
                      <Clock className="w-4 h-4 mr-2" /> Clock In
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="schedule">
          <TabsList>
            <TabsTrigger value="schedule">Work Schedule</TabsTrigger>
            <TabsTrigger value="tasks">Task Assignments</TabsTrigger>
            <TabsTrigger value="time">Time Log</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Employee</th>
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                          <th key={d} className="text-center py-3 px-2 w-24">{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {EMPLOYEES.map(emp => (
                        <tr key={emp.id} className="border-b border-border/50">
                          <td className="py-3 px-2 font-medium">{emp.name}</td>
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                            <td key={d} className="text-center py-3 px-2">
                              {["Sat", "Sun"].includes(d) ? (
                                <span className="text-muted-foreground text-xs">OFF</span>
                              ) : (
                                <span className="text-xs bg-[#DAA520]/10 text-[#DAA520] px-2 py-1 rounded">9-5</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-3">* Default schedule shown. Edit individual schedules from the Work Schedule page.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(tasks || []).filter((t: any) => t.assignedTo).length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No assigned tasks</TableCell></TableRow>
                    ) : (
                      (tasks || []).filter((t: any) => t.assignedTo).map((t: any) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.title}</TableCell>
                          <TableCell>{t.assignedTo}</TableCell>
                          <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                          <TableCell className={t.priority === "urgent" ? "text-red-400" : t.priority === "high" ? "text-orange-400" : "text-muted-foreground"}>{t.priority}</TableCell>
                          <TableCell>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</TableCell>
                          <TableCell><Badge variant="outline" className={t.status === "done" ? "bg-green-500/20 text-green-400" : t.status === "in_progress" ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"}>{t.status.replace("_", " ")}</Badge></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="time">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(timeEntries || []).length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No time entries</TableCell></TableRow>
                    ) : (
                      (timeEntries || []).map((t: any) => {
                        const emp = EMPLOYEES.find(e => String(e.id) === String(t.employeeId));
                        return (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium">{emp?.name || `#${t.employeeId}`}</TableCell>
                            <TableCell>{new Date(t.clockIn).toLocaleString()}</TableCell>
                            <TableCell>{t.clockOut ? new Date(t.clockOut).toLocaleString() : <Badge className="bg-green-500/20 text-green-400 border-0">Active</Badge>}</TableCell>
                            <TableCell className="text-[#DAA520] font-medium">{formatDuration(t.clockIn, t.clockOut)}</TableCell>
                            <TableCell className="text-muted-foreground">{t.notes || "—"}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

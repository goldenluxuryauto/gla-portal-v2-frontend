import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { buildApiUrl } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, GripVertical, Trash2, Calendar, User, Flag } from "lucide-react";

const TEAM = ["Armando", "Adam", "Brynn", "Kath L.", "Cathy M.", "Olavo"];
const CATEGORIES = [
  { value: "fleet", label: "Fleet", color: "bg-green-500/20 text-green-400" },
  { value: "cleaning", label: "Cleaning", color: "bg-purple-500/20 text-purple-400" },
  { value: "maintenance", label: "Maintenance", color: "bg-orange-500/20 text-orange-400" },
  { value: "admin", label: "Admin", color: "bg-gray-500/20 text-gray-400" },
  { value: "delivery", label: "Delivery", color: "bg-[#DAA520]/20 text-[#DAA520]" },
];
const PRIORITIES: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "text-gray-400" },
  medium: { label: "Med", color: "text-[#DAA520]" },
  high: { label: "High", color: "text-orange-400" },
  urgent: { label: "Urgent", color: "text-red-400" },
};
const COLUMNS = [
  { id: "todo", label: "To Do", color: "border-t-gray-500" },
  { id: "in_progress", label: "In Progress", color: "border-t-[#DAA520]" },
  { id: "done", label: "Done", color: "border-t-green-500" },
];

export default function TasksPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/admin/tasks", categoryFilter, assigneeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (assigneeFilter !== "all") params.set("assignedTo", assigneeFilter);
      const res = await fetch(buildApiUrl(`/api/admin/tasks?${params}`), { credentials: "include" });
      const json = await res.json();
      return json.data || [];
    },
  });

  const createTask = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(buildApiUrl("/api/admin/tasks"), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/tasks"] }); setShowDialog(false); toast({ title: "Task created" }); },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [k: string]: any }) => {
      const res = await fetch(buildApiUrl(`/api/admin/tasks/${id}`), {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/tasks"] }),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(buildApiUrl(`/api/admin/tasks/${id}`), { method: "DELETE", credentials: "include" });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/tasks"] }); toast({ title: "Task deleted" }); },
  });

  const getColumnTasks = (status: string) => (tasks || []).filter((t: any) => t.status === status);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Task Board</h1>
            <p className="text-muted-foreground mt-1">Team task management — replaces Slack screenshot channels</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="bg-[#DAA520] hover:bg-[#C49619] text-black font-medium">
            <Plus className="w-4 h-4 mr-2" /> New Task
          </Button>
        </div>

        <div className="flex gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Assignee" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Everyone</SelectItem>
              {TEAM.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-3 gap-4 min-h-[600px]">
          {COLUMNS.map(col => (
            <div key={col.id} className={`border-t-4 ${col.color} rounded-lg`}>
              <div className="flex items-center justify-between p-3">
                <h3 className="font-semibold text-sm">{col.label}</h3>
                <Badge variant="secondary">{getColumnTasks(col.id).length}</Badge>
              </div>
              <div className="space-y-2 px-2 pb-2">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
                ) : getColumnTasks(col.id).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-xs border border-dashed rounded-lg">No tasks</div>
                ) : (
                  getColumnTasks(col.id).map((t: any) => {
                    const cat = CATEGORIES.find(c => c.value === t.category);
                    const pri = PRIORITIES[t.priority] || PRIORITIES.medium;
                    return (
                      <Card key={t.id} className="hover:border-[#DAA520]/30 transition-colors cursor-pointer group">
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <p className="font-medium text-sm leading-tight">{t.title}</p>
                            <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-400" onClick={() => deleteTask.mutate(t.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          {t.description && <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>}
                          <div className="flex items-center gap-2 flex-wrap">
                            {cat && <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cat.color}`}>{cat.label}</Badge>}
                            <span className={`text-[10px] font-medium ${pri.color}`}>
                              <Flag className="w-2.5 h-2.5 inline mr-0.5" />{pri.label}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            {t.assignedTo && <span className="flex items-center gap-1"><User className="w-2.5 h-2.5" />{t.assignedTo}</span>}
                            {t.dueDate && <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />{new Date(t.dueDate).toLocaleDateString()}</span>}
                          </div>
                          {/* Move buttons */}
                          <div className="flex gap-1 pt-1">
                            {col.id !== "todo" && (
                              <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2"
                                onClick={() => updateTask.mutate({ id: t.id, status: col.id === "done" ? "in_progress" : "todo" })}>
                                ← {col.id === "done" ? "In Progress" : "To Do"}
                              </Button>
                            )}
                            {col.id !== "done" && (
                              <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2"
                                onClick={() => updateTask.mutate({ id: t.id, status: col.id === "todo" ? "in_progress" : "done" })}>
                                {col.id === "todo" ? "In Progress" : "Done"} →
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <TaskDialog open={showDialog} onClose={() => setShowDialog(false)} onSubmit={(d: any) => createTask.mutate(d)} />
    </AdminLayout>
  );
}

function TaskDialog({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (d: any) => void }) {
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", category: "admin", assignedTo: "", dueDate: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="What needs to be done?" />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={form.description} onChange={e => set("description", e.target.value)} placeholder="Optional details" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => set("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="urgent">🔴 Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Assign To</Label>
              <Select value={form.assignedTo} onValueChange={v => set("assignedTo", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {TEAM.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="datetime-local" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
            </div>
          </div>
          <Button className="w-full bg-[#DAA520] hover:bg-[#C49619] text-black font-medium" disabled={!form.title}
            onClick={() => onSubmit({
              title: form.title, description: form.description || undefined,
              priority: form.priority, category: form.category,
              assignedTo: form.assignedTo || undefined,
              dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
            })}>
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

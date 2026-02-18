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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildApiUrl } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Wrench, DollarSign, Calendar, AlertTriangle, CheckCircle, Clock, Trash2 } from "lucide-react";

const MAINT_TYPES = [
  { value: "oil_change", label: "Oil Change", icon: "🛢️" },
  { value: "brakes", label: "Brakes", icon: "🛑" },
  { value: "tires", label: "Tires", icon: "🛞" },
  { value: "body_work", label: "Body Work", icon: "🔧" },
  { value: "windshield", label: "Windshield", icon: "🪟" },
  { value: "alignment", label: "Alignment", icon: "⚙️" },
  { value: "battery", label: "Battery", icon: "🔋" },
  { value: "mechanic", label: "Mechanic", icon: "🔩" },
  { value: "other", label: "Other", icon: "📋" },
];

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
};

const VENDORS = ["Burt Brothers", "Chesty's", "Paintworks", "Raul's Windows", "Dealership", "Other"];

export default function MaintenanceModulePage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [carFilter, setCarFilter] = useState("all");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["/api/admin/maintenance-logs", typeFilter, statusFilter, carFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (carFilter !== "all") params.set("carId", carFilter);
      const res = await fetch(buildApiUrl(`/api/admin/maintenance-logs?${params}`), { credentials: "include" });
      const json = await res.json();
      return json.data || [];
    },
  });

  const { data: cars } = useQuery({
    queryKey: ["/api/cars"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/cars"), { credentials: "include" });
      const json = await res.json();
      return json.data || json.cars || json || [];
    },
  });

  const createLog = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(buildApiUrl("/api/admin/maintenance-logs"), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/maintenance-logs"] }); setShowDialog(false); toast({ title: "Maintenance scheduled" }); },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(buildApiUrl(`/api/admin/maintenance-logs/${id}`), {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/maintenance-logs"] }),
  });

  const deleteLog = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(buildApiUrl(`/api/admin/maintenance-logs/${id}`), {
        method: "DELETE", credentials: "include",
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/maintenance-logs"] }); toast({ title: "Deleted" }); },
  });

  const scheduled = (logs || []).filter((l: any) => l.status === "scheduled").length;
  const inProgress = (logs || []).filter((l: any) => l.status === "in_progress").length;
  const completed = (logs || []).filter((l: any) => l.status === "completed").length;
  const totalCost = (logs || []).reduce((s: number, l: any) => s + Number(l.cost || 0), 0);

  const getCarName = (carId: string) => {
    const car = (Array.isArray(cars) ? cars : []).find((c: any) => String(c.id) === String(carId));
    return car ? `${car.makeModel} ${car.year || ""}` : `Car #${carId}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Maintenance</h1>
            <p className="text-muted-foreground mt-1">Track vehicle maintenance, costs, and schedules</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="bg-[#DAA520] hover:bg-[#C49619] text-black font-medium">
            <Plus className="w-4 h-4 mr-2" /> Log Maintenance
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Scheduled", count: scheduled, icon: Calendar, color: "text-orange-400" },
            { label: "In Progress", count: inProgress, icon: Clock, color: "text-yellow-400" },
            { label: "Completed", count: completed, icon: CheckCircle, color: "text-green-400" },
            { label: "Total Cost", count: `$${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-[#DAA520]" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`w-8 h-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold">{s.count}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {MAINT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={carFilter} onValueChange={setCarFilter}>
            <SelectTrigger className="w-60"><SelectValue placeholder="Vehicle" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vehicles</SelectItem>
              {(Array.isArray(cars) ? cars : []).map((c: any) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.makeModel} {c.year} — {c.licensePlate}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : (logs || []).length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    No maintenance records found
                  </TableCell></TableRow>
                ) : (
                  (logs || []).map((l: any) => {
                    const typeInfo = MAINT_TYPES.find(t => t.value === l.type);
                    return (
                      <TableRow key={l.id}>
                        <TableCell>
                          <span className="flex items-center gap-2">
                            <span>{typeInfo?.icon || "📋"}</span>
                            <span>{typeInfo?.label || l.type}</span>
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{getCarName(l.carId)}</TableCell>
                        <TableCell>{l.vendor || "—"}</TableCell>
                        <TableCell className="text-[#DAA520] font-medium">${Number(l.cost || 0).toFixed(2)}</TableCell>
                        <TableCell>{new Date(l.scheduledAt).toLocaleDateString()}</TableCell>
                        <TableCell><Badge variant="outline" className={STATUS_COLORS[l.status]}>{l.status.replace("_", " ")}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {l.status === "scheduled" && (
                              <Button size="sm" variant="ghost" onClick={() => updateStatus.mutate({ id: l.id, status: "in_progress" })}>Start</Button>
                            )}
                            {l.status === "in_progress" && (
                              <Button size="sm" variant="ghost" className="text-green-400" onClick={() => updateStatus.mutate({ id: l.id, status: "completed" })}>Complete</Button>
                            )}
                            <Button size="sm" variant="ghost" className="text-red-400" onClick={() => deleteLog.mutate(l.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <MaintenanceDialog open={showDialog} onClose={() => setShowDialog(false)} onSubmit={(d: any) => createLog.mutate(d)} cars={cars || []} />
    </AdminLayout>
  );
}

function MaintenanceDialog({ open, onClose, onSubmit, cars }: { open: boolean; onClose: () => void; onSubmit: (d: any) => void; cars: any[] }) {
  const [form, setForm] = useState({ carId: "", type: "oil_change", vendor: "", cost: "", scheduledAt: "", mileageAtService: "", description: "", notes: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Log Maintenance</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Vehicle</Label>
            <Select value={form.carId} onValueChange={v => set("carId", v)}>
              <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
              <SelectContent>
                {(Array.isArray(cars) ? cars : []).map((c: any) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.makeModel} {c.year} — {c.licensePlate}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => set("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MAINT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Vendor</Label>
              <Select value={form.vendor} onValueChange={v => set("vendor", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {VENDORS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Cost ($)</Label>
              <Input type="number" step="0.01" value={form.cost} onChange={e => set("cost", e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <Label>Mileage</Label>
              <Input type="number" value={form.mileageAtService} onChange={e => set("mileageAtService", e.target.value)} placeholder="Current miles" />
            </div>
          </div>
          <div>
            <Label>Scheduled Date</Label>
            <Input type="datetime-local" value={form.scheduledAt} onChange={e => set("scheduledAt", e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={form.description} onChange={e => set("description", e.target.value)} placeholder="What work is being done?" />
          </div>
          <Button className="w-full bg-[#DAA520] hover:bg-[#C49619] text-black font-medium" disabled={!form.carId || !form.scheduledAt}
            onClick={() => onSubmit({
              carId: parseInt(form.carId), type: form.type, vendor: form.vendor || undefined,
              cost: parseFloat(form.cost) || 0, scheduledAt: new Date(form.scheduledAt).toISOString(),
              mileageAtService: form.mileageAtService ? parseInt(form.mileageAtService) : undefined,
              description: form.description || undefined, notes: form.notes || undefined,
            })}>
            Schedule Maintenance
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

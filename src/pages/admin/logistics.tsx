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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildApiUrl } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Truck, MapPin, Clock, User, Car, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

const TEAM = ["Armando", "Adam", "Brynn", "Kath L.", "Cathy M.", "Olavo"];
const LOCATIONS = ["SLC Airport", "Diamond Parking (50 S Redwood Rd)", "Client Location", "Detail Shop", "Other"];
const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  en_route: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function LogisticsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [showCleaningDialog, setShowCleaningDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [driverFilter, setDriverFilter] = useState("all");

  const { data: deliveries, isLoading: loadingDeliveries } = useQuery({
    queryKey: ["/api/admin/deliveries", selectedDate, statusFilter, driverFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ date: selectedDate });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (driverFilter !== "all") params.set("driver", driverFilter);
      const res = await fetch(buildApiUrl(`/api/admin/deliveries?${params}`), { credentials: "include" });
      const json = await res.json();
      return json.data || [];
    },
  });

  const { data: cleanings, isLoading: loadingCleanings } = useQuery({
    queryKey: ["/api/admin/cleanings"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/admin/cleanings"), { credentials: "include" });
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

  const createDelivery = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(buildApiUrl("/api/admin/deliveries"), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/deliveries"] }); setShowDeliveryDialog(false); toast({ title: "Delivery scheduled" }); },
  });

  const updateDeliveryStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(buildApiUrl(`/api/admin/deliveries/${id}`), {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/deliveries"] }),
  });

  const createCleaning = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(buildApiUrl("/api/admin/cleanings"), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/cleanings"] }); setShowCleaningDialog(false); toast({ title: "Cleaning scheduled" }); },
  });

  const updateCleaningStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(buildApiUrl(`/api/admin/cleanings/${id}`), {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/cleanings"] }),
  });

  const navigateDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(formatDate(d));
  };

  const pickups = (deliveries || []).filter((d: any) => d.type === "pickup");
  const returns = (deliveries || []).filter((d: any) => d.type === "return");
  const transfers = (deliveries || []).filter((d: any) => d.type === "transfer");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Delivery & Logistics</h1>
            <p className="text-muted-foreground mt-1">Manage pickups, returns, and vehicle cleanings</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCleaningDialog(true)} variant="outline" className="border-[#DAA520]/40 text-[#DAA520] hover:bg-[#DAA520]/10">
              <Sparkles className="w-4 h-4 mr-2" /> Schedule Cleaning
            </Button>
            <Button onClick={() => setShowDeliveryDialog(true)} className="bg-[#DAA520] hover:bg-[#C49619] text-black font-medium">
              <Plus className="w-4 h-4 mr-2" /> New Delivery
            </Button>
          </div>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigateDate(-1)}><ChevronLeft className="w-4 h-4" /></Button>
          <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-44" />
          <Button variant="ghost" size="icon" onClick={() => navigateDate(1)}><ChevronRight className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(formatDate(new Date()))}>Today</Button>
          <div className="flex-1" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="en_route">En Route</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={driverFilter} onValueChange={setDriverFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Driver" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Drivers</SelectItem>
              {TEAM.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Pickups", count: pickups.length, icon: Truck, color: "text-green-400" },
            { label: "Returns", count: returns.length, icon: Car, color: "text-orange-400" },
            { label: "Transfers", count: transfers.length, icon: MapPin, color: "text-[#DAA520]" },
            { label: "Cleanings", count: (cleanings || []).filter((c: any) => c.status !== "completed").length, icon: Sparkles, color: "text-purple-400" },
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

        <Tabs defaultValue="deliveries">
          <TabsList>
            <TabsTrigger value="deliveries">Deliveries ({(deliveries || []).length})</TabsTrigger>
            <TabsTrigger value="cleanings">Cleanings ({(cleanings || []).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="deliveries" className="space-y-3 mt-4">
            {loadingDeliveries ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : (deliveries || []).length === 0 ? (
              <Card><CardContent className="p-12 text-center text-muted-foreground">
                <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No deliveries scheduled for this date</p>
                <Button className="mt-4 bg-[#DAA520] hover:bg-[#C49619] text-black" onClick={() => setShowDeliveryDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Schedule One
                </Button>
              </CardContent></Card>
            ) : (
              (deliveries || []).map((d: any) => (
                <Card key={d.id} className="hover:border-[#DAA520]/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-12 rounded-full ${d.type === "pickup" ? "bg-green-500" : d.type === "return" ? "bg-orange-500" : "bg-[#DAA520]"}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{d.type}</span>
                            <Badge variant="outline" className={STATUS_COLORS[d.status]}>{d.status.replace("_", " ")}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(d.scheduledAt)}</span>
                            <span className="flex items-center gap-1"><User className="w-3 h-3" />{d.driverName}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{d.location}</span>
                            {d.guestName && <span className="flex items-center gap-1"><User className="w-3 h-3" />{d.guestName}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {d.status === "scheduled" && (
                          <Button size="sm" variant="outline" onClick={() => updateDeliveryStatus.mutate({ id: d.id, status: "en_route" })}>
                            Start
                          </Button>
                        )}
                        {d.status === "en_route" && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateDeliveryStatus.mutate({ id: d.id, status: "completed" })}>
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="cleanings" className="space-y-3 mt-4">
            {loadingCleanings ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : (cleanings || []).length === 0 ? (
              <Card><CardContent className="p-12 text-center text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No cleanings scheduled</p>
              </CardContent></Card>
            ) : (
              (cleanings || []).map((c: any) => (
                <Card key={c.id} className="hover:border-[#DAA520]/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{c.type} Clean</span>
                          <Badge variant="outline" className={STATUS_COLORS[c.status]}>{c.status.replace("_", " ")}</Badge>
                          {c.cost > 0 && <span className="text-sm text-[#DAA520]">${Number(c.cost).toFixed(2)}</span>}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Car #{c.carId} • {formatTime(c.scheduledAt)}{c.assignedTo && ` • ${c.assignedTo}`}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {c.status === "scheduled" && (
                          <Button size="sm" variant="outline" onClick={() => updateCleaningStatus.mutate({ id: c.id, status: "in_progress" })}>Start</Button>
                        )}
                        {c.status === "in_progress" && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateCleaningStatus.mutate({ id: c.id, status: "completed" })}>Done</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* New Delivery Dialog */}
      <DeliveryDialog open={showDeliveryDialog} onClose={() => setShowDeliveryDialog(false)} onSubmit={(data: any) => createDelivery.mutate(data)} cars={cars || []} />
      {/* New Cleaning Dialog */}
      <CleaningDialog open={showCleaningDialog} onClose={() => setShowCleaningDialog(false)} onSubmit={(data: any) => createCleaning.mutate(data)} cars={cars || []} />
    </AdminLayout>
  );
}

function DeliveryDialog({ open, onClose, onSubmit, cars }: { open: boolean; onClose: () => void; onSubmit: (d: any) => void; cars: any[] }) {
  const [form, setForm] = useState({ carId: "", type: "pickup", driverName: "", location: LOCATIONS[0], scheduledAt: "", guestName: "", notes: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Schedule Delivery</DialogTitle></DialogHeader>
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
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Driver</Label>
              <Select value={form.driverName} onValueChange={v => set("driverName", v)}>
                <SelectTrigger><SelectValue placeholder="Assign driver" /></SelectTrigger>
                <SelectContent>
                  {TEAM.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Location</Label>
            <Select value={form.location} onValueChange={v => set("location", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Scheduled Time</Label>
            <Input type="datetime-local" value={form.scheduledAt} onChange={e => set("scheduledAt", e.target.value)} />
          </div>
          <div>
            <Label>Guest Name</Label>
            <Input value={form.guestName} onChange={e => set("guestName", e.target.value)} placeholder="Optional" />
          </div>
          <div>
            <Label>Notes</Label>
            <Input value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Optional" />
          </div>
          <Button className="w-full bg-[#DAA520] hover:bg-[#C49619] text-black font-medium" disabled={!form.carId || !form.driverName || !form.scheduledAt}
            onClick={() => onSubmit({ ...form, carId: parseInt(form.carId), scheduledAt: new Date(form.scheduledAt).toISOString() })}>
            Schedule Delivery
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CleaningDialog({ open, onClose, onSubmit, cars }: { open: boolean; onClose: () => void; onSubmit: (d: any) => void; cars: any[] }) {
  const [form, setForm] = useState({ carId: "", type: "standard", scheduledAt: "", assignedTo: "", cost: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Schedule Cleaning</DialogTitle></DialogHeader>
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
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="deep">Deep Clean</SelectItem>
                  <SelectItem value="detail">Full Detail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assigned To</Label>
              <Select value={form.assignedTo} onValueChange={v => set("assignedTo", v)}>
                <SelectTrigger><SelectValue placeholder="Assign" /></SelectTrigger>
                <SelectContent>
                  {TEAM.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Scheduled Time</Label>
            <Input type="datetime-local" value={form.scheduledAt} onChange={e => set("scheduledAt", e.target.value)} />
          </div>
          <div>
            <Label>Cost ($)</Label>
            <Input type="number" step="0.01" value={form.cost} onChange={e => set("cost", e.target.value)} placeholder="0.00" />
          </div>
          <Button className="w-full bg-[#DAA520] hover:bg-[#C49619] text-black font-medium" disabled={!form.carId || !form.scheduledAt}
            onClick={() => onSubmit({ ...form, carId: parseInt(form.carId), scheduledAt: new Date(form.scheduledAt).toISOString(), cost: parseFloat(form.cost) || 0 })}>
            Schedule Cleaning
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

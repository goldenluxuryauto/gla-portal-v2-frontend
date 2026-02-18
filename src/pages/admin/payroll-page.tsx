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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildApiUrl } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, DollarSign, Clock, Users, CheckCircle, Timer } from "lucide-react";

const EMPLOYEES = [
  { id: 1, name: "Cathy Mangulabnan", number: "83836" },
  { id: 2, name: "Jane Smith", number: "22432" },
];

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDuration(start: string, end: string | null) {
  if (!end) return "Active";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const hrs = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  return `${hrs}h ${mins}m`;
}

export default function PayrollPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const now = new Date();
  const [period, setPeriod] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const [showPayrollDialog, setShowPayrollDialog] = useState(false);
  const [showTimeDialog, setShowTimeDialog] = useState(false);

  const { data: payroll, isLoading: loadingPayroll } = useQuery({
    queryKey: ["/api/admin/payroll", period],
    queryFn: async () => {
      const res = await fetch(buildApiUrl(`/api/admin/payroll?period=${period}`), { credentials: "include" });
      const json = await res.json();
      return json.data || [];
    },
  });

  const { data: timeEntries, isLoading: loadingTime } = useQuery({
    queryKey: ["/api/admin/time-entries"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/admin/time-entries"), { credentials: "include" });
      const json = await res.json();
      return json.data || [];
    },
  });

  const createPayroll = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(buildApiUrl("/api/admin/payroll"), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/payroll"] }); setShowPayrollDialog(false); toast({ title: "Payroll entry created" }); },
  });

  const updatePayroll = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [k: string]: any }) => {
      const res = await fetch(buildApiUrl(`/api/admin/payroll/${id}`), {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/payroll"] }),
  });

  const createTimeEntry = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(buildApiUrl("/api/admin/time-entries"), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/time-entries"] }); setShowTimeDialog(false); toast({ title: "Time entry logged" }); },
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

  const totalGross = (payroll || []).reduce((s: number, p: any) => s + Number(p.grossPay || 0), 0);
  const totalNet = (payroll || []).reduce((s: number, p: any) => s + Number(p.netPay || 0), 0);

  const STATUS_COLORS: Record<string, string> = {
    draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    approved: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    paid: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Payroll</h1>
            <p className="text-muted-foreground mt-1">Employee payroll and time tracking</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowTimeDialog(true)} variant="outline" className="border-[#DAA520]/40 text-[#DAA520] hover:bg-[#DAA520]/10">
              <Timer className="w-4 h-4 mr-2" /> Log Time
            </Button>
            <Button onClick={() => setShowPayrollDialog(true)} className="bg-[#DAA520] hover:bg-[#C49619] text-black font-medium">
              <Plus className="w-4 h-4 mr-2" /> New Payroll Entry
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Period", value: period, icon: Clock, color: "text-[#DAA520]" },
            { label: "Employees", value: EMPLOYEES.length, icon: Users, color: "text-[#DAA520]" },
            { label: "Total Gross", value: fmt(totalGross), icon: DollarSign, color: "text-orange-400" },
            { label: "Total Net", value: fmt(totalNet), icon: DollarSign, color: "text-green-400" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`w-8 h-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-3 items-center">
          <Label>Pay Period:</Label>
          <Input type="month" value={period} onChange={e => setPeriod(e.target.value)} className="w-44" />
        </div>

        <Tabs defaultValue="payroll">
          <TabsList>
            <TabsTrigger value="payroll">Payroll ({(payroll || []).length})</TabsTrigger>
            <TabsTrigger value="time">Time Entries ({(timeEntries || []).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="payroll">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Gross Pay</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingPayroll ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : (payroll || []).length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        No payroll entries for this period
                      </TableCell></TableRow>
                    ) : (
                      (payroll || []).map((p: any) => {
                        const emp = EMPLOYEES.find(e => String(e.id) === String(p.employeeId));
                        return (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">{emp?.name || `Employee #${p.employeeId}`}</TableCell>
                            <TableCell>{Number(p.hoursWorked).toFixed(1)}</TableCell>
                            <TableCell>{fmt(Number(p.hourlyRate))}</TableCell>
                            <TableCell className="text-orange-400">{fmt(Number(p.grossPay))}</TableCell>
                            <TableCell className="text-red-400">{fmt(Number(p.deductions))}</TableCell>
                            <TableCell className="text-green-400 font-medium">{fmt(Number(p.netPay))}</TableCell>
                            <TableCell><Badge variant="outline" className={STATUS_COLORS[p.status]}>{p.status}</Badge></TableCell>
                            <TableCell className="text-right">
                              {p.status === "draft" && (
                                <Button size="sm" variant="ghost" onClick={() => updatePayroll.mutate({ id: p.id, status: "approved" })}>Approve</Button>
                              )}
                              {p.status === "approved" && (
                                <Button size="sm" variant="ghost" className="text-green-400" onClick={() => updatePayroll.mutate({ id: p.id, status: "paid" })}>Mark Paid</Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingTime ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : (timeEntries || []).length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No time entries</TableCell></TableRow>
                    ) : (
                      (timeEntries || []).map((t: any) => {
                        const emp = EMPLOYEES.find(e => String(e.id) === String(t.employeeId));
                        return (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium">{emp?.name || `#${t.employeeId}`}</TableCell>
                            <TableCell>{new Date(t.clockIn).toLocaleString()}</TableCell>
                            <TableCell>{t.clockOut ? new Date(t.clockOut).toLocaleString() : <Badge className="bg-green-500/20 text-green-400">Active</Badge>}</TableCell>
                            <TableCell className="text-[#DAA520]">{formatDuration(t.clockIn, t.clockOut)}</TableCell>
                            <TableCell className="text-muted-foreground">{t.notes || "—"}</TableCell>
                            <TableCell className="text-right">
                              {!t.clockOut && (
                                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => clockOut.mutate(t.id)}>Clock Out</Button>
                              )}
                            </TableCell>
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

      {/* Payroll Dialog */}
      <Dialog open={showPayrollDialog} onOpenChange={setShowPayrollDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Payroll Entry</DialogTitle></DialogHeader>
          <PayrollForm period={period} onSubmit={(d: any) => createPayroll.mutate(d)} />
        </DialogContent>
      </Dialog>

      {/* Time Entry Dialog */}
      <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Log Time</DialogTitle></DialogHeader>
          <TimeForm onSubmit={(d: any) => createTimeEntry.mutate(d)} />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function PayrollForm({ period, onSubmit }: { period: string; onSubmit: (d: any) => void }) {
  const [form, setForm] = useState({ employeeId: "", hoursWorked: "", hourlyRate: "", deductions: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const hours = parseFloat(form.hoursWorked) || 0;
  const rate = parseFloat(form.hourlyRate) || 0;
  const gross = hours * rate;
  const ded = parseFloat(form.deductions) || 0;
  const net = gross - ded;

  return (
    <div className="space-y-4">
      <div>
        <Label>Employee</Label>
        <Select value={form.employeeId} onValueChange={v => set("employeeId", v)}>
          <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
          <SelectContent>
            {EMPLOYEES.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.name} (#{e.number})</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Hours Worked</Label><Input type="number" step="0.5" value={form.hoursWorked} onChange={e => set("hoursWorked", e.target.value)} /></div>
        <div><Label>Hourly Rate ($)</Label><Input type="number" step="0.01" value={form.hourlyRate} onChange={e => set("hourlyRate", e.target.value)} /></div>
      </div>
      <div><Label>Deductions ($)</Label><Input type="number" step="0.01" value={form.deductions} onChange={e => set("deductions", e.target.value)} /></div>
      <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
        <div className="flex justify-between"><span>Gross Pay:</span><span className="text-orange-400 font-medium">{fmt(gross)}</span></div>
        <div className="flex justify-between"><span>Deductions:</span><span className="text-red-400">{fmt(ded)}</span></div>
        <div className="flex justify-between font-bold"><span>Net Pay:</span><span className="text-green-400">{fmt(net)}</span></div>
      </div>
      <Button className="w-full bg-[#DAA520] hover:bg-[#C49619] text-black font-medium" disabled={!form.employeeId || !form.hoursWorked}
        onClick={() => onSubmit({ employeeId: parseInt(form.employeeId), period, hoursWorked: hours, hourlyRate: rate, grossPay: gross, deductions: ded, netPay: net })}>
        Create Entry
      </Button>
    </div>
  );
}

function TimeForm({ onSubmit }: { onSubmit: (d: any) => void }) {
  const [form, setForm] = useState({ employeeId: "", clockIn: "", clockOut: "", notes: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div>
        <Label>Employee</Label>
        <Select value={form.employeeId} onValueChange={v => set("employeeId", v)}>
          <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
          <SelectContent>
            {EMPLOYEES.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div><Label>Clock In</Label><Input type="datetime-local" value={form.clockIn} onChange={e => set("clockIn", e.target.value)} /></div>
      <div><Label>Clock Out (optional)</Label><Input type="datetime-local" value={form.clockOut} onChange={e => set("clockOut", e.target.value)} /></div>
      <div><Label>Notes</Label><Input value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Optional" /></div>
      <Button className="w-full bg-[#DAA520] hover:bg-[#C49619] text-black font-medium" disabled={!form.employeeId || !form.clockIn}
        onClick={() => onSubmit({
          employeeId: parseInt(form.employeeId),
          clockIn: new Date(form.clockIn).toISOString(),
          clockOut: form.clockOut ? new Date(form.clockOut).toISOString() : undefined,
          notes: form.notes || undefined,
        })}>
        Log Time
      </Button>
    </div>
  );
}

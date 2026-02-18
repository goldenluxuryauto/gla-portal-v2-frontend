import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildApiUrl } from "@/lib/queryClient";
import { Car, Search, ExternalLink, Calendar, DollarSign, Clock } from "lucide-react";

export default function CarRentalPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: cars, isLoading } = useQuery({
    queryKey: ["/api/cars"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/cars"), { credentials: "include" });
      const json = await res.json();
      return json.data || json.cars || json || [];
    },
  });

  const { data: deliveries } = useQuery({
    queryKey: ["/api/admin/deliveries"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/admin/deliveries"), { credentials: "include" });
      const json = await res.json();
      return json.data || [];
    },
  });

  const carList = Array.isArray(cars) ? cars : [];
  const filtered = carList.filter((c: any) => {
    const matchSearch = !search || `${c.makeModel} ${c.licensePlate} ${c.vin}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const activeCount = carList.filter((c: any) => c.status === "ACTIVE").length;
  const upcomingDeliveries = (deliveries || []).filter((d: any) => d.status === "scheduled").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Car Rental Management</h1>
            <p className="text-muted-foreground mt-1">Overview of all vehicles and rental status</p>
          </div>
          <Button variant="outline" className="border-[#DAA520]/40 text-[#DAA520]" asChild>
            <a href="https://rent.goldenluxuryauto.com/start-block" target="_blank" rel="noopener">
              <ExternalLink className="w-4 h-4 mr-2" /> Book on Turo
            </a>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Vehicles", value: carList.length, icon: Car, color: "text-[#DAA520]" },
            { label: "Active", value: activeCount, icon: Car, color: "text-green-400" },
            { label: "Upcoming Deliveries", value: upcomingDeliveries, icon: Calendar, color: "text-orange-400" },
            { label: "Detail Shop", value: "Book", icon: Clock, color: "text-purple-400", link: "https://goldenluxuryauto.com/detail-shop/" },
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

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vehicle Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Plate</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mileage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No vehicles found</TableCell></TableRow>
                ) : (
                  filtered.map((c: any, i: number) => (
                    <TableRow key={c.id} className="hover:bg-muted/30">
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{c.makeModel}</TableCell>
                      <TableCell><Badge variant="outline">{c.licensePlate || "—"}</Badge></TableCell>
                      <TableCell>{c.year || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{c.owner ? `${c.owner.firstName} ${c.owner.lastName}` : "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={c.status === "ACTIVE" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{c.mileage?.toLocaleString() || "0"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

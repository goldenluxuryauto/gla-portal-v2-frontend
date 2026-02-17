import React, { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Car,
  Search,
  Star,
  MapPin,
  ExternalLink,
  TrendingUp,
  Users,
  Wrench,
  XCircle,
  BarChart3,
  X,
} from "lucide-react";

interface Vehicle {
  id: number;
  vin: string | null;
  make: string;
  model: string;
  year: number;
  plate: string | null;
  status: string;
  photo: string | null;
  turoLink: string | null;
  adminTuroLink: string | null;
  turoId: string | null;
  turoRating: number | null;
  turoTrips: number | null;
  turoDailyRate: number | null;
  turoLifetimeEarnings: number | null;
  turoPhotoUrl: string | null;
  turoLocation: string | null;
  turoStatus: string | null;
  color: string | null;
  fuelType: string | null;
  mileage: number;
  isActive: number;
  clientId: number | null;
  ownerFirstName: string | null;
  ownerLastName: string | null;
  createdAt: string;
}

interface FleetStats {
  totalVehicles: number;
  currentlyRented: number;
  available: number;
  maintenance: number;
  unlisted: number;
  utilization: number;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  in_use: { bg: "bg-green-100", text: "text-green-800", label: "Rented" },
  available: { bg: "bg-gray-100", text: "text-gray-800", label: "Available" },
  maintenance: { bg: "bg-orange-100", text: "text-orange-800", label: "Maintenance" },
  off_fleet: { bg: "bg-red-100", text: "text-red-800", label: "Unlisted" },
  pending: { bg: "bg-red-100", text: "text-red-800", label: "Pending" },
  listed: { bg: "bg-gray-100", text: "text-gray-800", label: "Listed" },
};

function getStatusBadge(status: string) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.available;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function VehicleCard({ vehicle, onClick }: { vehicle: Vehicle; onClick: () => void }) {
  const owner = vehicle.ownerFirstName
    ? `${vehicle.ownerFirstName} ${vehicle.ownerLastName || ""}`.trim()
    : "Unassigned";
  const name = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const photoUrl = vehicle.turoPhotoUrl || vehicle.photo;
  const rating = vehicle.turoRating;
  const trips = vehicle.turoTrips;
  const dailyRate = vehicle.turoDailyRate;

  return (
    <Card
      className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Photo */}
      <div className="h-36 bg-gray-100 relative overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-12 h-12 text-gray-300" />
          </div>
        )}
        <div className="absolute top-2 right-2">{getStatusBadge(vehicle.status)}</div>
      </div>
      <CardContent className="p-3">
        <h3 className="font-semibold text-sm truncate">{name}</h3>
        <p className="text-xs text-muted-foreground truncate">{owner}</p>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          {rating != null && (
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              {rating.toFixed(2)}
            </span>
          )}
          {trips != null && <span>{trips} trips</span>}
          {dailyRate != null && <span className="font-medium text-foreground">${Math.round(dailyRate)}/day</span>}
        </div>
        {vehicle.plate && (
          <p className="text-xs text-muted-foreground mt-1">Plate: {vehicle.plate}</p>
        )}
      </CardContent>
    </Card>
  );
}

function VehicleDetailDialog({
  vehicle,
  open,
  onClose,
}: {
  vehicle: Vehicle | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!vehicle) return null;
  const name = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const owner = vehicle.ownerFirstName
    ? `${vehicle.ownerFirstName} ${vehicle.ownerLastName || ""}`.trim()
    : "Unassigned";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{name}</span>
            {getStatusBadge(vehicle.status)}
          </DialogTitle>
        </DialogHeader>

        {/* Photo */}
        {(vehicle.turoPhotoUrl || vehicle.photo) && (
          <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={vehicle.turoPhotoUrl || vehicle.photo || ""}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="space-y-4">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Owner</p>
              <p className="font-medium">{owner}</p>
            </div>
            <div>
              <p className="text-muted-foreground">VIN</p>
              <p className="font-medium font-mono text-xs">{vehicle.vin || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Plate</p>
              <p className="font-medium">{vehicle.plate || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Color</p>
              <p className="font-medium">{vehicle.color || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fuel Type</p>
              <p className="font-medium">{vehicle.fuelType || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Mileage</p>
              <p className="font-medium">{vehicle.mileage?.toLocaleString() || "0"} mi</p>
            </div>
          </div>

          {/* Turo Stats */}
          {vehicle.turoId && (
            <div className="border-t pt-3">
              <h4 className="font-semibold mb-2 flex items-center gap-1">
                <BarChart3 className="w-4 h-4" /> Turo Performance
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Rating</p>
                  <p className="font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    {vehicle.turoRating?.toFixed(2) || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Trips</p>
                  <p className="font-medium">{vehicle.turoTrips?.toLocaleString() || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Daily Rate</p>
                  <p className="font-medium">
                    {vehicle.turoDailyRate ? `$${Math.round(vehicle.turoDailyRate)}` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Lifetime Earnings</p>
                  <p className="font-medium">
                    {vehicle.turoLifetimeEarnings
                      ? `$${vehicle.turoLifetimeEarnings.toLocaleString()}`
                      : "N/A"}
                  </p>
                </div>
                {vehicle.turoLocation && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {vehicle.turoLocation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Turo Link */}
          {(vehicle.turoLink || vehicle.turoId) && (
            <div className="border-t pt-3 flex gap-2">
              <a
                href={vehicle.turoLink || `https://turo.com/us/en/your-car/${vehicle.turoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-black text-white rounded text-sm hover:bg-gray-800 transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> View on Turo
              </a>
              {vehicle.adminTuroLink && (
                <a
                  href={vehicle.adminTuroLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Edit Pricing
                </a>
              )}
            </div>
          )}

          {/* Maintenance Log Placeholder */}
          <div className="border-t pt-3">
            <h4 className="font-semibold mb-2 flex items-center gap-1">
              <Wrench className="w-4 h-4" /> Maintenance Log
            </h4>
            <p className="text-sm text-muted-foreground italic">
              No maintenance records yet. Coming in Phase 8.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function FleetDashboardPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [makeFilter, setMakeFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const { data: vehiclesData, isLoading: vehiclesLoading } = useQuery<{
    success: boolean;
    vehicles: Vehicle[];
    total: number;
  }>({
    queryKey: ["/api/admin/fleet/vehicles"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/admin/fleet/vehicles"), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      return res.json();
    },
  });

  const { data: statsData } = useQuery<{ success: boolean; stats: FleetStats }>({
    queryKey: ["/api/admin/fleet/stats"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/admin/fleet/stats"), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const vehicles = vehiclesData?.vehicles || [];
  const stats = statsData?.stats;

  // Get unique makes and owners for filters
  const makes = useMemo(() => {
    const set = new Set(vehicles.map((v) => v.make).filter(Boolean));
    return Array.from(set).sort();
  }, [vehicles]);

  const owners = useMemo(() => {
    const set = new Set(
      vehicles
        .map((v) => (v.ownerFirstName ? `${v.ownerFirstName} ${v.ownerLastName || ""}`.trim() : null))
        .filter(Boolean) as string[]
    );
    return Array.from(set).sort();
  }, [vehicles]);

  // Filter vehicles
  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const name = `${v.year} ${v.make} ${v.model}`.toLowerCase();
      const owner = `${v.ownerFirstName || ""} ${v.ownerLastName || ""}`.toLowerCase();
      const q = search.toLowerCase();

      if (q && !name.includes(q) && !owner.includes(q) && !(v.plate || "").toLowerCase().includes(q) && !(v.vin || "").toLowerCase().includes(q)) {
        return false;
      }
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (makeFilter !== "all" && v.make !== makeFilter) return false;
      if (ownerFilter !== "all") {
        const vOwner = v.ownerFirstName ? `${v.ownerFirstName} ${v.ownerLastName || ""}`.trim() : "";
        if (vOwner !== ownerFilter) return false;
      }
      return true;
    });
  }, [vehicles, search, statusFilter, makeFilter, ownerFilter]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Fleet Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              All vehicles across the fleet — {vehicles.length} total
            </p>
          </div>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard icon={Car} label="Total Vehicles" value={stats.totalVehicles} color="bg-gray-700" />
            <StatCard icon={TrendingUp} label="Currently Rented" value={stats.currentlyRented} color="bg-green-600" />
            <StatCard icon={Car} label="Available" value={stats.available} color="bg-gray-500" />
            <StatCard icon={Wrench} label="Maintenance" value={stats.maintenance} color="bg-orange-500" />
            <StatCard icon={BarChart3} label="Utilization" value={`${stats.utilization}%`} color="bg-black" />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search vehicles, owners, plates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in_use">Rented</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="off_fleet">Unlisted</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={makeFilter} onValueChange={setMakeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Make" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Makes</SelectItem>
              {makes.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {owners.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(search || statusFilter !== "all" || makeFilter !== "all" || ownerFilter !== "all") && (
            <button
              className="text-xs text-red-600 hover:underline flex items-center gap-1"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setMakeFilter("all");
                setOwnerFilter("all");
              }}
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} of {vehicles.length} vehicles
        </p>

        {/* Vehicle Grid */}
        {vehiclesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-36 bg-gray-200" />
                <CardContent className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-muted-foreground">No vehicles found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((v) => (
              <VehicleCard key={v.id} vehicle={v} onClick={() => setSelectedVehicle(v)} />
            ))}
          </div>
        )}

        {/* Vehicle Detail Dialog */}
        <VehicleDetailDialog
          vehicle={selectedVehicle}
          open={!!selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      </div>
    </AdminLayout>
  );
}

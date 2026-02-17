import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventInput } from "@fullcalendar/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface TripEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: "OUT" | "IN";
  location: string;
  vehicle: string;
  guest: string;
  guestFullName: string;
  guestPhone: string;
  tripTotal: string;
  youEarned: string;
  turoFees: string;
  extras: string[];
  days: number;
  dailyRate: string;
  milesDriven: string;
  milesIncluded: string;
  protectionPlan: string;
  tripStatus: string;
  deliveryFee: string;
  deliveryLocation: string;
}

const EXTRAS_ICONS: Record<string, string> = {
  "ski rack": "🎿",
  "car seat": "🪑",
  "child seat": "🪑",
  "cooler": "🧊",
  "bike rack": "🚲",
  "prepaid refuel": "⛽",
  "ev recharge": "🔌",
  "snow chains": "⛓️",
  "roof rack": "📦",
};

function formatExtras(extras: string[]): string {
  if (!extras || extras.length === 0) return "";
  return extras
    .map((e) => {
      const lower = e.toLowerCase();
      for (const [key, icon] of Object.entries(EXTRAS_ICONS)) {
        if (lower.includes(key)) return icon;
      }
      return e;
    })
    .join(" ");
}

export default function CalendarPage() {
  const [trips, setTrips] = useState<TripEvent[]>([]);
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<TripEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Try API first, fall back to static JSON
    fetch("/api/admin/calendar/trips", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject("API unavailable")))
      .then((data: TripEvent[]) => setTrips(data))
      .catch(() => {
        // Fallback to static JSON during development
        fetch("/data/calendar-trips.json")
          .then((r) => r.json())
          .then((data: TripEvent[]) => setTrips(data))
          .catch(console.error);
      });
    fetch("/api/admin/calendar/vehicles", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject("API unavailable")))
      .then((data: string[]) => setVehicles(data))
      .catch(() => {
        fetch("/data/calendar-vehicles.json")
          .then((r) => r.json())
          .then((data: string[]) => setVehicles(data))
          .catch(console.error);
      });
  }, []);

  const locations = useMemo(
    () => [...new Set(trips.map((t) => t.location).filter(Boolean))].sort(),
    [trips]
  );

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      if (vehicleFilter !== "all" && t.vehicle !== vehicleFilter) return false;
      if (locationFilter !== "all" && t.location !== locationFilter) return false;
      if (statusFilter !== "all" && t.tripStatus !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const searchable = `${t.guest} ${t.guestFullName} ${t.vehicle} ${t.location} ${t.id}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [trips, vehicleFilter, locationFilter, statusFilter, searchQuery]);

  const calendarEvents: EventInput[] = useMemo(
    () =>
      filteredTrips.map((t) => ({
        id: `${t.id}-${t.type}`,
        title: `${t.guest}${formatExtras(t.extras) ? " " + formatExtras(t.extras) : ""}`,
        start: t.start,
        end: t.end,
        backgroundColor: t.type === "OUT" ? "#16a34a" : "#dc2626",
        borderColor: t.type === "OUT" ? "#15803d" : "#b91c1c",
        textColor: "#ffffff",
        extendedProps: { trip: t },
      })),
    [filteredTrips]
  );

  const handleEventClick = useCallback((info: EventClickArg) => {
    const trip = info.event.extendedProps.trip as TripEvent;
    setSelectedTrip(trip);
    setDialogOpen(true);
  }, []);

  const stats = useMemo(() => {
    const outs = filteredTrips.filter((t) => t.type === "OUT").length;
    const ins = filteredTrips.filter((t) => t.type === "IN").length;
    const totalEarned = filteredTrips.reduce(
      (sum, t) => sum + (parseFloat(t.youEarned) || 0),
      0
    );
    return { outs, ins, totalEarned };
  }, [filteredTrips]);

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trip Calendar</h1>
            <p className="text-sm text-gray-500">
              {filteredTrips.length} events • {stats.outs} pickups • {stats.ins} returns
              {stats.totalEarned > 0 && (
                <span className="ml-2 font-medium text-green-700">
                  ${stats.totalEarned.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} earned
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-600" /> OUT/Pickup
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-600" /> IN/Return
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Search guest, vehicle, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="All Vehicles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vehicles</SelectItem>
              {vehicles.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg border shadow-sm p-2 md:p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,listWeek",
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            height="auto"
            eventDisplay="block"
            dayMaxEvents={4}
            moreLinkContent={(args) => `+${args.num} more`}
            eventTimeFormat={{ hour: "numeric", minute: "2-digit", meridiem: "short" }}
            nowIndicator={true}
          />
        </div>

        {/* Trip Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            {selectedTrip && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Badge
                      className={
                        selectedTrip.type === "OUT"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      }
                    >
                      {selectedTrip.type === "OUT" ? "🚗 Pickup" : "🔙 Return"}
                    </Badge>
                    <span className="text-base font-medium">
                      {selectedTrip.vehicle || "Vehicle"}
                    </span>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Guest Info */}
                  <Card>
                    <CardContent className="pt-4 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Guest</span>
                        <span className="font-medium">
                          {selectedTrip.guestFullName || selectedTrip.guest}
                        </span>
                      </div>
                      {selectedTrip.guestPhone && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Phone</span>
                          <a
                            href={`tel:${selectedTrip.guestPhone}`}
                            className="text-green-700 hover:underline"
                          >
                            {selectedTrip.guestPhone}
                          </a>
                        </div>
                      )}
                      {selectedTrip.location && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Location</span>
                          <span>{selectedTrip.location}</span>
                        </div>
                      )}
                      {selectedTrip.tripStatus && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status</span>
                          <Badge variant="outline" className="capitalize">
                            {selectedTrip.tripStatus}
                          </Badge>
                        </div>
                      )}
                      {selectedTrip.extras && selectedTrip.extras.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Extras</span>
                          <span>{selectedTrip.extras.join(", ")}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Financial Info */}
                  {selectedTrip.tripTotal && (
                    <Card>
                      <CardContent className="pt-4 space-y-1 text-sm">
                        <div className="flex justify-between font-medium">
                          <span className="text-gray-500">Trip Total</span>
                          <span>${selectedTrip.tripTotal}</span>
                        </div>
                        {selectedTrip.youEarned && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">You Earned</span>
                            <span className="text-green-700 font-semibold">
                              ${selectedTrip.youEarned}
                            </span>
                          </div>
                        )}
                        {selectedTrip.turoFees && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Turo Fees</span>
                            <span className="text-red-600">-${selectedTrip.turoFees}</span>
                          </div>
                        )}
                        {selectedTrip.days > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Duration</span>
                            <span>
                              {selectedTrip.days} day{selectedTrip.days !== 1 ? "s" : ""} @
                              ${selectedTrip.dailyRate}/day
                            </span>
                          </div>
                        )}
                        {selectedTrip.deliveryFee && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Delivery Fee</span>
                            <span>${selectedTrip.deliveryFee}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Trip Details */}
                  <Card>
                    <CardContent className="pt-4 space-y-1 text-sm">
                      {selectedTrip.milesIncluded && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Miles Included</span>
                          <span>{selectedTrip.milesIncluded}</span>
                        </div>
                      )}
                      {selectedTrip.milesDriven && selectedTrip.milesDriven !== "pending" && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Miles Driven</span>
                          <span>{selectedTrip.milesDriven}</span>
                        </div>
                      )}
                      {selectedTrip.protectionPlan && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Protection</span>
                          <span>{selectedTrip.protectionPlan}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reservation</span>
                        <span className="font-mono text-xs">#{selectedTrip.id}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

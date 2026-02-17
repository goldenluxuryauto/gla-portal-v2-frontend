import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/admin-layout";
import { buildApiUrl } from "@/lib/queryClient";
import { Wrench, Plus, X, AlertCircle, CheckCircle, Clock, Eye } from "lucide-react";

interface MaintenanceRequest {
  id: number;
  carId: number;
  issueType: string;
  description: string;
  photoUrl: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  carMake: string;
  carModel: string;
  carYear: number;
}

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
}

const issueTypes = [
  { value: "mechanical", label: "Mechanical" },
  { value: "body_damage", label: "Body Damage" },
  { value: "interior", label: "Interior" },
  { value: "electrical", label: "Electrical" },
  { value: "tire", label: "Tire" },
  { value: "cleaning", label: "Cleaning" },
  { value: "other", label: "Other" },
];

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  submitted: { color: '#DAA520', icon: <Clock className="w-3.5 h-3.5" />, label: 'Submitted' },
  reviewed: { color: '#a855f7', icon: <Eye className="w-3.5 h-3.5" />, label: 'Reviewed' },
  in_progress: { color: '#3b82f6', icon: <Wrench className="w-3.5 h-3.5" />, label: 'In Progress' },
  resolved: { color: '#22c55e', icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Resolved' },
};

export default function OwnerMaintenance() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ carId: 0, issueType: "mechanical", description: "", photoUrl: "" });
  const queryClient = useQueryClient();

  const { data: requestsData, isLoading } = useQuery<{ success: boolean; data: MaintenanceRequest[] }>({
    queryKey: ["/api/client/maintenance-requests"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/client/maintenance-requests"), { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: dashboardData } = useQuery<{ success: boolean; data: { vehicles: Vehicle[] } }>({
    queryKey: ["/api/client/dashboard"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/client/dashboard"), { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(buildApiUrl("/api/client/maintenance-requests"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: data.carId,
          issueType: data.issueType,
          description: data.description,
          photoUrl: data.photoUrl || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client/maintenance-requests"] });
      setShowForm(false);
      setFormData({ carId: 0, issueType: "mechanical", description: "", photoUrl: "" });
    },
  });

  const requests = requestsData?.data || [];
  const vehicles = dashboardData?.data?.vehicles || [];

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="w-6 h-6" style={{ color: '#DAA520' }} />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#DAA520' }}>Maintenance Requests</h1>
              <p className="text-sm text-gray-400 mt-1">Report issues with your vehicles</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-black transition hover:opacity-90"
            style={{ background: '#DAA520' }}
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "New Request"}
          </button>
        </div>

        {/* New Request Form */}
        {showForm && (
          <div className="rounded-xl p-5 space-y-4" style={{ background: '#1a1a1a', border: '1px solid #DAA520' + '40' }}>
            <h3 className="font-semibold text-white">Submit Maintenance Request</h3>
            
            <div>
              <label className="text-xs text-gray-400 block mb-1">Vehicle *</label>
              <select
                value={formData.carId}
                onChange={(e) => setFormData({ ...formData, carId: parseInt(e.target.value) })}
                className="w-full p-2.5 rounded-lg text-sm text-white"
                style={{ background: '#111', border: '1px solid #444' }}
              >
                <option value={0}>Select a vehicle...</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.year} {v.make} {v.model}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Issue Type *</label>
              <select
                value={formData.issueType}
                onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                className="w-full p-2.5 rounded-lg text-sm text-white"
                style={{ background: '#111', border: '1px solid #444' }}
              >
                {issueTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 rounded-lg text-sm text-white resize-none"
                style={{ background: '#111', border: '1px solid #444' }}
                rows={4}
                placeholder="Describe the issue in detail..."
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Photo URL (optional)</label>
              <input
                type="url"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                className="w-full p-2.5 rounded-lg text-sm text-white"
                style={{ background: '#111', border: '1px solid #444' }}
                placeholder="https://..."
              />
            </div>

            {submitMutation.isError && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {(submitMutation.error as Error).message}
              </div>
            )}

            <button
              onClick={() => {
                if (!formData.carId || !formData.description.trim()) return;
                submitMutation.mutate(formData);
              }}
              disabled={!formData.carId || !formData.description.trim() || submitMutation.isPending}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-black transition disabled:opacity-50"
              style={{ background: '#DAA520' }}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        )}

        {/* Requests List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: '#1a1a1a' }} />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <Wrench className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No maintenance requests</p>
            <p className="text-gray-500 text-sm mt-1">Click "New Request" to report a vehicle issue.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {requests.map((req) => {
              const status = statusConfig[req.status] || statusConfig.submitted;
              return (
                <div key={req.id} className="rounded-xl p-4" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-white">
                          {req.carYear} {req.carMake} {req.carModel}
                        </h4>
                        <span
                          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: status.color + '20', color: status.color }}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-gray-400 capitalize mb-1">
                        {req.issueType.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-300">{req.description}</p>
                      {req.adminNotes && (
                        <div className="mt-2 p-2 rounded-lg text-xs" style={{ background: '#111' }}>
                          <span className="text-gray-500">Admin: </span>
                          <span className="text-gray-300">{req.adminNotes}</span>
                        </div>
                      )}
                      {req.photoUrl && (
                        <a href={req.photoUrl} target="_blank" rel="noopener noreferrer" className="text-xs mt-1 inline-block" style={{ color: '#DAA520' }}>
                          View Photo →
                        </a>
                      )}
                    </div>
                    <span className="text-xs text-gray-600 flex-shrink-0 ml-4">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Status Timeline */}
                  <div className="mt-3 flex items-center gap-1">
                    {Object.entries(statusConfig).map(([key, cfg], i) => {
                      const statuses = Object.keys(statusConfig);
                      const currentIdx = statuses.indexOf(req.status);
                      const thisIdx = statuses.indexOf(key);
                      const isActive = thisIdx <= currentIdx;
                      return (
                        <div key={key} className="flex items-center gap-1 flex-1">
                          <div
                            className="h-1 w-full rounded-full"
                            style={{ background: isActive ? cfg.color : '#333' }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

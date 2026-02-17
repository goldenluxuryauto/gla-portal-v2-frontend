import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { buildApiUrl } from "@/lib/queryClient";
import { CheckCircle, ChevronRight, ChevronLeft, User, Car, FileText, ThumbsUp } from "lucide-react";

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: WizardStep[] = [
  { id: 1, title: "Your Information", description: "Personal & contact details", icon: <User className="w-5 h-5" /> },
  { id: 2, title: "Vehicle Details", description: "Vehicle & insurance info", icon: <Car className="w-5 h-5" /> },
  { id: 3, title: "Agreement", description: "Review & sign the LYC agreement", icon: <FileText className="w-5 h-5" /> },
  { id: 4, title: "Confirmation", description: "You're all set!", icon: <ThumbsUp className="w-5 h-5" /> },
];

const STORAGE_KEY = "gla-onboarding-progress";

function loadProgress(): { step: number; data: Record<string, any> } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { step: 1, data: {} };
}

function saveProgress(step: number, data: Record<string, any>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data }));
}

export default function OnboardingWizard() {
  const saved = loadProgress();
  const [currentStep, setCurrentStep] = useState(saved.step);
  const [formData, setFormData] = useState<Record<string, any>>(saved.data);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    saveProgress(currentStep, formData);
  }, [currentStep, formData]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.firstName && formData.lastName && formData.email && formData.phone;
    }
    if (currentStep === 2) {
      return formData.vehicleMake && formData.vehicleModel && formData.vehicleYear;
    }
    if (currentStep === 3) {
      return formData.agreementAccepted;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch(buildApiUrl("/api/client/cars/add"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Submission failed");
      }
      setCurrentStep(4);
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full p-3 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2";
  const inputStyle = { background: '#111', border: '1px solid #444', focusRingColor: '#DAA520' };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto pb-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      currentStep > step.id ? 'text-black' : currentStep === step.id ? 'text-black' : 'text-gray-500'
                    }`}
                    style={{
                      background: currentStep > step.id ? '#22c55e' : currentStep === step.id ? '#DAA520' : '#333',
                    }}
                  >
                    {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 text-center hidden sm:block">{step.title}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2" style={{ background: currentStep > step.id ? '#22c55e' : '#333' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="rounded-xl p-6 md:p-8" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <h2 className="text-xl font-bold text-white mb-1">{steps[currentStep - 1].title}</h2>
          <p className="text-sm text-gray-400 mb-6">{steps[currentStep - 1].description}</p>

          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">First Name *</label>
                  <input type="text" value={formData.firstName || ""} onChange={(e) => updateField("firstName", e.target.value)}
                    className={inputClass} style={inputStyle} placeholder="First name" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Last Name *</label>
                  <input type="text" value={formData.lastName || ""} onChange={(e) => updateField("lastName", e.target.value)}
                    className={inputClass} style={inputStyle} placeholder="Last name" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Email *</label>
                <input type="email" value={formData.email || ""} onChange={(e) => updateField("email", e.target.value)}
                  className={inputClass} style={inputStyle} placeholder="email@example.com" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Phone *</label>
                <input type="tel" value={formData.phone || ""} onChange={(e) => updateField("phone", e.target.value)}
                  className={inputClass} style={inputStyle} placeholder="(555) 123-4567" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Street Address</label>
                <input type="text" value={formData.address || ""} onChange={(e) => updateField("address", e.target.value)}
                  className={inputClass} style={inputStyle} placeholder="123 Main St" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">City</label>
                  <input type="text" value={formData.city || ""} onChange={(e) => updateField("city", e.target.value)}
                    className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">State</label>
                  <input type="text" value={formData.state || ""} onChange={(e) => updateField("state", e.target.value)}
                    className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">ZIP</label>
                  <input type="text" value={formData.zip || ""} onChange={(e) => updateField("zip", e.target.value)}
                    className={inputClass} style={inputStyle} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Vehicle Info */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Year *</label>
                  <input type="number" value={formData.vehicleYear || ""} onChange={(e) => updateField("vehicleYear", e.target.value)}
                    className={inputClass} style={inputStyle} placeholder="2024" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Make *</label>
                  <input type="text" value={formData.vehicleMake || ""} onChange={(e) => updateField("vehicleMake", e.target.value)}
                    className={inputClass} style={inputStyle} placeholder="BMW" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Model *</label>
                  <input type="text" value={formData.vehicleModel || ""} onChange={(e) => updateField("vehicleModel", e.target.value)}
                    className={inputClass} style={inputStyle} placeholder="X5" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">VIN</label>
                  <input type="text" value={formData.vin || ""} onChange={(e) => updateField("vin", e.target.value)}
                    className={inputClass} style={inputStyle} placeholder="Vehicle Identification Number" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">License Plate</label>
                  <input type="text" value={formData.plate || ""} onChange={(e) => updateField("plate", e.target.value)}
                    className={inputClass} style={inputStyle} placeholder="ABC1234" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Exterior Color</label>
                  <input type="text" value={formData.color || ""} onChange={(e) => updateField("color", e.target.value)}
                    className={inputClass} style={inputStyle} placeholder="Black" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Fuel Type</label>
                  <select value={formData.fuelType || ""} onChange={(e) => updateField("fuelType", e.target.value)}
                    className={inputClass} style={inputStyle}>
                    <option value="">Select...</option>
                    <option value="Regular Unleaded">Regular Unleaded</option>
                    <option value="Premium">Premium</option>
                    <option value="Premium 91">Premium 91</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Insurance Provider</label>
                <input type="text" value={formData.insuranceProvider || ""} onChange={(e) => updateField("insuranceProvider", e.target.value)}
                  className={inputClass} style={inputStyle} placeholder="State Farm, Geico, etc." />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Insurance Policy Number</label>
                <input type="text" value={formData.insurancePolicyNumber || ""} onChange={(e) => updateField("insurancePolicyNumber", e.target.value)}
                  className={inputClass} style={inputStyle} />
              </div>
            </div>
          )}

          {/* Step 3: Agreement */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg p-4 text-sm text-gray-300 max-h-64 overflow-y-auto" style={{ background: '#111', border: '1px solid #333' }}>
                <h3 className="font-bold text-white mb-2">LYC Vehicle Management Agreement</h3>
                <p className="mb-2">By signing this agreement, you authorize Golden Luxury Auto (GLA) to manage your vehicle(s) under the LYC (Leave Your Car) program.</p>
                <p className="mb-2"><strong>Revenue Split:</strong> 70% Owner / 30% GLA</p>
                <p className="mb-2"><strong>Services Included:</strong></p>
                <ul className="list-disc list-inside mb-2 space-y-1">
                  <li>Turo listing management & optimization</li>
                  <li>Guest screening & communication</li>
                  <li>Vehicle pickup & delivery logistics</li>
                  <li>Vehicle cleaning & maintenance coordination</li>
                  <li>Insurance claim support</li>
                  <li>Monthly earnings statements</li>
                </ul>
                <p className="mb-2"><strong>Vehicle Owner Responsibilities:</strong></p>
                <ul className="list-disc list-inside mb-2 space-y-1">
                  <li>Maintain valid insurance and registration</li>
                  <li>Approve major repairs (&gt; $500)</li>
                  <li>Provide spare key to GLA</li>
                </ul>
                <p className="text-gray-400 text-xs mt-4">This is a summary. The full agreement will be sent to your email for review and e-signature.</p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreementAccepted || false}
                  onChange={(e) => updateField("agreementAccepted", e.target.checked)}
                  className="mt-1 w-4 h-4 rounded"
                  style={{ accentColor: '#DAA520' }}
                />
                <span className="text-sm text-gray-300">
                  I have read and agree to the LYC Vehicle Management Agreement terms. I understand the 70/30 revenue split and GLA's management services.
                </span>
              </label>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#22c55e' + '20' }}>
                <CheckCircle className="w-8 h-8" style={{ color: '#22c55e' }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Welcome to GLA!</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Your onboarding is complete. Our team will review your submission and get your vehicle listed on Turo.
                You'll receive an email with your portal login credentials shortly.
              </p>
              <div className="mt-6 p-4 rounded-lg text-left" style={{ background: '#111', border: '1px solid #333' }}>
                <h4 className="text-sm font-semibold text-white mb-2">What's Next?</h4>
                <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                  <li>GLA reviews your vehicle details</li>
                  <li>Vehicle pickup scheduled</li>
                  <li>Professional photos & Turo listing created</li>
                  <li>Start earning!</li>
                </ol>
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm mt-4">{error}</p>
          )}

          {/* Navigation */}
          {currentStep < 4 && (
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-800">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              {currentStep === 3 ? (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="flex items-center gap-1 px-6 py-2.5 rounded-lg text-sm font-medium text-black transition disabled:opacity-50 hover:opacity-90"
                  style={{ background: '#DAA520' }}
                >
                  {isSubmitting ? "Submitting..." : "Submit & Complete"}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-1 px-6 py-2.5 rounded-lg text-sm font-medium text-black transition disabled:opacity-50 hover:opacity-90"
                  style={{ background: '#DAA520' }}
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

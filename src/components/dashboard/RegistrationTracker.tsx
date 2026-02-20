import React, { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface RegistrationAlert {
  id: string;
  vehicleId: string;
  vehicleName: string;
  plateNumber: string;
  registrationExpiry: string;
  daysUntilExpiry: number;
  urgency: 'critical' | 'warning' | 'normal' | 'expired';
  status: 'active' | 'renewal_pending' | 'expired';
}

export function RegistrationTracker() {
  const [registrations, setRegistrations] = useState<RegistrationAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        // Mock data - replace with actual API call
        const mockRegistrations: RegistrationAlert[] = [
          {
            id: '1',
            vehicleId: 'tesla-001',
            vehicleName: '2024 Tesla Model S',
            plateNumber: 'GLA001',
            registrationExpiry: '2026-02-25',
            daysUntilExpiry: 5,
            urgency: 'critical',
            status: 'renewal_pending'
          },
          {
            id: '2',
            vehicleId: 'bmw-x5-003',
            vehicleName: '2023 BMW X5',
            plateNumber: 'GLA003',
            registrationExpiry: '2026-03-15',
            daysUntilExpiry: 23,
            urgency: 'warning',
            status: 'active'
          },
          {
            id: '3',
            vehicleId: 'audi-q7-002',
            vehicleName: '2023 Audi Q7',
            plateNumber: 'GLA002',
            registrationExpiry: '2026-02-18',
            daysUntilExpiry: -2,
            urgency: 'expired',
            status: 'expired'
          },
          {
            id: '4',
            vehicleId: 'mercedes-s550',
            vehicleName: '2024 Mercedes S550',
            plateNumber: 'GLA004',
            registrationExpiry: '2026-05-10',
            daysUntilExpiry: 79,
            urgency: 'normal',
            status: 'active'
          }
        ];

        // Sort by urgency: expired -> critical -> warning -> normal
        const sortedRegistrations = mockRegistrations.sort((a, b) => {
          const urgencyOrder = { expired: 0, critical: 1, warning: 2, normal: 3 };
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        });

        setRegistrations(sortedRegistrations);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch registration data:', error);
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  const getUrgencyStyle = (urgency: RegistrationAlert['urgency']) => {
    switch (urgency) {
      case 'expired':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'critical':
        return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'normal':
        return 'border-green-200 bg-green-50 text-green-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getUrgencyIcon = (urgency: RegistrationAlert['urgency']) => {
    switch (urgency) {
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'normal':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  const formatDaysText = (days: number) => {
    if (days < 0) return `Expired ${Math.abs(days)} days ago`;
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    return `${days} days remaining`;
  };

  if (loading) {
    return (
      <Card className="h-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gla-gold" />
            Registration Renewals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-14 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const criticalCount = registrations.filter(r => r.urgency === 'expired' || r.urgency === 'critical').length;

  return (
    <Card className="h-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gla-gold" />
          Registration Renewals
          {criticalCount > 0 && (
            <span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              {criticalCount} urgent
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {registrations.map((registration) => (
            <div
              key={registration.id}
              className={`p-3 rounded-lg border transition-colors hover:shadow-sm ${getUrgencyStyle(registration.urgency)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getUrgencyIcon(registration.urgency)}
                    <span className="font-medium text-sm">
                      {registration.vehicleName}
                    </span>
                    <span className="text-xs text-gray-600">
                      ({registration.plateNumber})
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">
                      {formatDaysText(registration.daysUntilExpiry)}
                    </span>
                    <span className="text-gray-600 ml-2">
                      Expires: {new Date(registration.registrationExpiry).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <button className="text-xs text-gla-gold hover:text-gla-gold-dark font-medium">
                    Renew
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
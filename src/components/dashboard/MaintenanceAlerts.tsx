import React, { useState, useEffect } from 'react';
import { Wrench, AlertCircle, Droplets, Gauge } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface MaintenanceAlert {
  id: string;
  vehicleId: string;
  vehicleName: string;
  plateNumber: string;
  alertType: 'oil_change' | 'tire_rotation' | 'brake_inspection' | 'general_service';
  currentMileage: number;
  nextServiceMileage: number;
  mileageUntilService: number;
  lastServiceDate: string;
  urgency: 'overdue' | 'critical' | 'warning' | 'normal';
  estimatedDays: number;
}

export function MaintenanceAlerts() {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenanceAlerts = async () => {
      try {
        // Mock data - replace with actual API call
        const mockAlerts: MaintenanceAlert[] = [
          {
            id: '1',
            vehicleId: 'tesla-001',
            vehicleName: '2024 Tesla Model S',
            plateNumber: 'GLA001',
            alertType: 'oil_change',
            currentMileage: 15500,
            nextServiceMileage: 15000,
            mileageUntilService: -500,
            lastServiceDate: '2025-12-15',
            urgency: 'overdue',
            estimatedDays: -10
          },
          {
            id: '2',
            vehicleId: 'bmw-x5-003',
            vehicleName: '2023 BMW X5',
            plateNumber: 'GLA003',
            alertType: 'oil_change',
            currentMileage: 22800,
            nextServiceMileage: 23000,
            mileageUntilService: 200,
            lastServiceDate: '2026-01-20',
            urgency: 'critical',
            estimatedDays: 5
          },
          {
            id: '3',
            vehicleId: 'audi-q7-002',
            vehicleName: '2023 Audi Q7',
            plateNumber: 'GLA002',
            alertType: 'tire_rotation',
            currentMileage: 18900,
            nextServiceMileage: 20000,
            mileageUntilService: 1100,
            lastServiceDate: '2025-11-10',
            urgency: 'warning',
            estimatedDays: 25
          },
          {
            id: '4',
            vehicleId: 'mercedes-s550',
            vehicleName: '2024 Mercedes S550',
            plateNumber: 'GLA004',
            alertType: 'brake_inspection',
            currentMileage: 12300,
            nextServiceMileage: 15000,
            mileageUntilService: 2700,
            lastServiceDate: '2025-10-05',
            urgency: 'normal',
            estimatedDays: 60
          }
        ];

        // Sort by urgency
        const sortedAlerts = mockAlerts.sort((a, b) => {
          const urgencyOrder = { overdue: 0, critical: 1, warning: 2, normal: 3 };
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        });

        setAlerts(sortedAlerts);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch maintenance alerts:', error);
        setLoading(false);
      }
    };

    fetchMaintenanceAlerts();
  }, []);

  const getAlertTypeIcon = (type: MaintenanceAlert['alertType']) => {
    switch (type) {
      case 'oil_change':
        return <Droplets className="h-4 w-4" />;
      case 'tire_rotation':
        return <span className="text-xs font-bold">T</span>;
      case 'brake_inspection':
        return <span className="text-xs font-bold">B</span>;
      case 'general_service':
        return <Wrench className="h-4 w-4" />;
      default:
        return <Wrench className="h-4 w-4" />;
    }
  };

  const getAlertTypeLabel = (type: MaintenanceAlert['alertType']) => {
    switch (type) {
      case 'oil_change':
        return 'Oil Change';
      case 'tire_rotation':
        return 'Tire Rotation';
      case 'brake_inspection':
        return 'Brake Check';
      case 'general_service':
        return 'Service';
      default:
        return 'Maintenance';
    }
  };

  const getUrgencyStyle = (urgency: MaintenanceAlert['urgency']) => {
    switch (urgency) {
      case 'overdue':
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

  const formatMileageText = (mileageUntil: number) => {
    if (mileageUntil <= 0) return `${Math.abs(mileageUntil)} mi overdue`;
    if (mileageUntil < 500) return `${mileageUntil} mi remaining`;
    return `${(mileageUntil / 1000).toFixed(1)}k mi remaining`;
  };

  if (loading) {
    return (
      <Card className="h-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-gla-gold" />
            Maintenance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const urgentCount = alerts.filter(a => a.urgency === 'overdue' || a.urgency === 'critical').length;

  return (
    <Card className="h-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-gla-gold" />
          Maintenance Alerts
          {urgentCount > 0 && (
            <span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              {urgentCount} urgent
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border transition-colors hover:shadow-sm ${getUrgencyStyle(alert.urgency)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm">
                      {getAlertTypeIcon(alert.alertType)}
                    </div>
                    <span className="font-medium text-sm">
                      {alert.vehicleName}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-white bg-opacity-50">
                      {getAlertTypeLabel(alert.alertType)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Gauge className="h-3 w-3" />
                      {alert.currentMileage.toLocaleString()} mi
                    </div>
                    <div className="font-medium">
                      {formatMileageText(alert.mileageUntilService)}
                    </div>
                    {alert.urgency === 'overdue' && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        Overdue
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <button className="text-xs text-gla-gold hover:text-gla-gold-dark font-medium">
                    Schedule
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
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Users, DollarSign, TrendingUp, Mail, Phone, Clock, MessageCircle, CheckCircle } from "lucide-react";
import QuickLinks from "@/components/admin/QuickLinks";
import { OnboardingTutorial, useTutorial } from "@/components/onboarding/OnboardingTutorial";
import { ScheduleWidget } from "@/components/dashboard/ScheduleWidget";
import { RegistrationTracker } from "@/components/dashboard/RegistrationTracker";
import { MaintenanceAlerts } from "@/components/dashboard/MaintenanceAlerts";
import { CalendarWidget } from "@/components/dashboard/CalendarWidget";
import { TripAnalyticsWidget } from "@/components/dashboard/TripAnalyticsWidget";
import { RevenueAnalyticsWidget } from "@/components/dashboard/RevenueAnalyticsWidget";
import { CostAnalyticsWidget } from "@/components/dashboard/CostAnalyticsWidget";
import { TaskManagerWidget } from "@/components/dashboard/TaskManagerWidget";
import { PerformanceAveragesWidget } from "@/components/dashboard/PerformanceAveragesWidget";
import { BouncieStatusWidget } from "@/components/dashboard/BouncieStatusWidget";
import { CEOMessageWidget } from "@/components/dashboard/CEOMessageWidget";
import { CompanyCalendarWidget } from "@/components/dashboard/CompanyCalendarWidget";
import { EmployeeWorkScheduleWidget } from "@/components/dashboard/EmployeeWorkScheduleWidget";
import { WeeklyMeetingsWidget } from "@/components/dashboard/WeeklyMeetingsWidget";
import { CommissionStructureWidget } from "@/components/dashboard/CommissionStructureWidget";
import { HeaderAnnouncementWidget } from "@/components/dashboard/HeaderAnnouncementWidget";
import { buildApiUrl } from "@/lib/queryClient";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { openTutorial, isOpen: tutorialIsOpen } = useTutorial();
  const queryClient = useQueryClient();
  const hasAttemptedOpen = useRef(false); // Track if we've already tried to open the tutorial

  // TEMPORARY: Mock user data to bypass authentication
  const userData = {
    user: {
      id: 1,
      firstName: 'Jay',
      lastName: 'Admin',
      email: 'admin@goldenluxuryauto.com',
      isAdmin: true,
      isClient: false,
      isEmployee: false,
      roleName: 'Admin',
      tourCompleted: true
    }
  };

  // Mutation to mark tour as shown (when tutorial is first displayed)
  const markTourShownMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(buildApiUrl("/api/auth/mark-tour-shown"), {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        // Don't throw error - just log it to prevent logout
        console.error("Failed to mark tour as shown:", response.status, response.statusText);
        return { success: false };
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Only invalidate if mutation was successful
      if (data?.success) {
        // Add a small delay before invalidating to ensure session is stable
        // This prevents logout issues right after login
        setTimeout(() => {
          // Invalidate user query to refresh user data with updated tourCompleted
          queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        }, 500);
      }
    },
    onError: (error) => {
      // Log error but don't throw - prevent logout
      console.error("Error marking tour as shown:", error);
    },
  });

  const user = userData?.user;
  const isAdmin = user?.isAdmin || false;
  const isClient = user?.isClient || false;
  const isEmployee = user?.isEmployee || false;
  const tourCompleted = user?.tourCompleted === true;

  // Redirect employees to staff dashboard so they see the staff sidebar
  useEffect(() => {
    if (userData && user?.isEmployee && !user?.isAdmin) {
      setLocation("/staff/dashboard");
    }
  }, [userData, user?.isEmployee, user?.isAdmin, setLocation]);

  // Redirect clients to owner dashboard so they see their fleet
  useEffect(() => {
    if (userData && user?.isClient && !user?.isAdmin) {
      setLocation("/owner/dashboard");
    }
  }, [userData, user?.isClient, user?.isAdmin, setLocation]);

  // Auto-open tutorial for new users (admin, client, employee) who haven't completed the tour
  // Only on dashboard page, only once per user
  useEffect(() => {
    // Don't open if tour is already completed (tourCompleted === 1)
    if (tourCompleted) {
      return;
    }

    // Don't open if tutorial is already open
    if (tutorialIsOpen) {
      return;
    }

    // Only open if conditions are met and we haven't already attempted
    // This should only happen on dashboard page for users with tourCompleted === 0
    // First check the database value, then display the modal
    // Check for all roles: admin, client, or employee
    if ((isAdmin || isClient || isEmployee) && !tourCompleted && user?.id && !hasAttemptedOpen.current) {
      hasAttemptedOpen.current = true; // Mark that we've attempted to open
      
      // Small delay to ensure page is fully loaded, then open tutorial
      const timer = setTimeout(() => {
        openTutorial();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAdmin, isClient, isEmployee, tourCompleted, user?.id, tutorialIsOpen, openTutorial]);

  // When tutorial is closed, mark it as shown in database
  // Add a small delay to ensure session is fully established before making the mutation
  useEffect(() => {
    // If tutorial was open and is now closed, and tourCompleted is still 0, update it
    if (!tutorialIsOpen && hasAttemptedOpen.current && !tourCompleted && user?.id) {
      // Add a small delay to ensure session is fully established
      // This prevents logout issues right after login
      const timer = setTimeout(() => {
        markTourShownMutation.mutate();
      }, 1000); // Wait 1 second after tutorial closes before updating
      
      return () => clearTimeout(timer);
    }
  }, [tutorialIsOpen, tourCompleted, user?.id, markTourShownMutation]);

  // TEMPORARY: Mock stats data to bypass API calls
  const stats = {
    activeVehicles: 87,
    totalClients: 24,
    monthlyRevenue: 162000,
    totalEarnings: 280677,
    totalTrips: 529,
    growthRate: 28,
    recentActivity: 15
  };
  const isLoading = false;

  const { data: clientStats, isLoading: isClientStatsLoading } = useQuery<{
    success?: boolean;
    data?: { activeVehicles: number; returnedVehicles: number; totalVehicles: number };
  }>({
    queryKey: ["/api/client/cars/stats"],
    queryFn: async () => {
      const response = await fetch(buildApiUrl("/api/client/cars/stats"), {
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to fetch client car stats" }));
        throw new Error(errorData.error || "Failed to fetch client car stats");
      }
      return response.json();
    },
    enabled: !!user && isClient,
    retry: false,
  });

  const quickStartSteps = [
    "Navigate to Forms tab",
    "Share QR code with potential clients",
    "Get instant notifications via Slack and email",
    "Review and approve in the portal",
  ];

  const features = [
    "Automated client onboarding",
    "Digital document collection",
    "ACH payment setup",
    "Insurance verification",
  ];

  const supportInfo = {
    email: "support@goldenluxuryauto.com",
    phone: "(555) 123-4567",
    hours: "Mon-Fri: 9AM - 6PM EST",
    chat: "Live chat available",
  };

  // Role-specific welcome messages
  const getWelcomeMessage = () => {
    if (isAdmin) {
      return {
        title: "Welcome to the Admin Portal",
        description: "Premium vehicle management portal for tracking clients, vehicles, and revenue.",
      };
    } else if (isClient) {
      return {
        title: "Welcome to Your Dashboard",
        description: "Manage your vehicles, view your account information, and access your resources.",
      };
    } else if (isEmployee) {
      return {
        title: "Welcome to the Employee Portal",
        description: "Access your assigned tasks and resources.",
      };
    }
    return {
      title: "Welcome to the Portal",
      description: "Premium vehicle management portal.",
    };
  };

  const welcome = getWelcomeMessage();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="Golden Luxury Auto" 
            className="h-[90px] md:h-[120px] w-auto mx-auto object-contain mb-6 drop-shadow-[0_0_12px_rgba(234,235,128,0.4)]"
          />
          <h1 className="text-2xl font-semibold text-primary mb-2">
            {welcome.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            {welcome.description}
          </p>
          {user && (
            <p className="text-gray-600 text-xs mt-2">
              Logged in as {user.firstName} {user.lastName} ({user.roleName})
            </p>
          )}
        </div>

        {/* Role-based stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Show all stats for admins */}
          {isAdmin && (
            <>
              <Card className="bg-card border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Car className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Active Vehicles</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground" data-testid="stat-vehicles">
                    {isLoading ? "..." : stats?.activeVehicles || 0}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Total Clients</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground" data-testid="stat-clients">
                    {isLoading ? "..." : stats?.totalClients || 0}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground" data-testid="stat-revenue">
                    ${isLoading ? "..." : ((stats?.monthlyRevenue || 0) / 1000).toFixed(1)}K
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Growth Rate</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground" data-testid="stat-growth">
                    +{isLoading ? "..." : stats?.growthRate || 0}%
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {/* Show limited stats for clients */}
          {isClient && (
            <>
              <Card className="bg-card border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Car className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">My Vehicles</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground" data-testid="stat-vehicles">
                    {isClientStatsLoading ? "..." : clientStats?.data?.totalVehicles || 0}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">My Earnings</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground" data-testid="stat-revenue">
                    ${isLoading ? "..." : ((stats?.monthlyRevenue || 0) / 1000).toFixed(1)}K
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {/* Show limited stats for employees */}
          {isEmployee && !isAdmin && !isClient && (
            <>
              <Card className="bg-card border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Car className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Assigned Vehicles</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground" data-testid="stat-vehicles">
                    {isLoading ? "..." : stats?.activeVehicles || 0}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Show Quick Start only for admins */}
          {isAdmin && (
            <Card className="bg-card border-primary/20">
              <CardContent className="p-5">
                <h3 className="text-base font-semibold text-foreground mb-4">Quick Start</h3>
                <ol className="space-y-3">
                  {quickStartSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="text-primary font-medium">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Show Quick Start for clients with different steps */}
          {isClient && (
            <Card className="bg-card border-primary/20">
              <CardContent className="p-5">
                <h3 className="text-base font-semibold text-foreground mb-4">Quick Start</h3>
                <ol className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-primary font-medium">1.</span>
                    <span>View your vehicles in the Cars section</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-primary font-medium">2.</span>
                    <span>Check your earnings and totals</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-primary font-medium">3.</span>
                    <span>Access forms and resources</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-primary font-medium">4.</span>
                    <span>Update your profile information</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card border-primary/20">
            <CardContent className="p-5">
              <h3 className="text-base font-semibold text-foreground mb-4">Features</h3>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-primary/20">
            <CardContent className="p-5">
              <h3 className="text-base font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>{supportInfo.email}</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{supportInfo.phone}</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{supportInfo.hours}</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span>{supportInfo.chat}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Header Announcements - Always visible when active */}
        <HeaderAnnouncementWidget />

        {/* Comprehensive Business Intelligence Dashboard - Only for Admins */}
        {isAdmin && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <span className="text-3xl">⚙️</span>
              GLA Command Center
              <Badge variant="secondary" className="ml-2">
                16 Widgets Active
              </Badge>
            </h2>
            
            {/* Row 1: CEO Communication & Company Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <CEOMessageWidget />
              <CompanyCalendarWidget />
              <WeeklyMeetingsWidget />
            </div>

            {/* Row 2: Performance & Commission Tracking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <CommissionStructureWidget />
              <PerformanceAveragesWidget />
              <EmployeeWorkScheduleWidget />
            </div>

            {/* Row 3: Fleet & Operations Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              <BouncieStatusWidget />
              <TaskManagerWidget />
              <ScheduleWidget />
              <RegistrationTracker />
            </div>

            {/* Row 4: Business Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TripAnalyticsWidget />
              <RevenueAnalyticsWidget />
              <CostAnalyticsWidget />
            </div>

            {/* Row 5: Operational Intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <CalendarWidget />
              <MaintenanceAlerts />
              <div className="p-6 rounded-lg border-2 border-dashed border-gold-300 bg-gradient-to-br from-gold-50 to-yellow-50 flex flex-col items-center justify-center text-center min-h-[300px]">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-gold-700 mb-2">
                  Ready for Big Screens!
                </h3>
                <p className="text-gold-600 mb-4">
                  This dashboard is optimized for office displays and car wash area screens.
                </p>
                <div className="space-y-2 text-sm text-gold-600">
                  <div>✅ Auto-refresh every 30 seconds</div>
                  <div>✅ Large fonts for visibility</div>
                  <div>✅ Touch-screen friendly</div>
                  <div>✅ Staff task completion buttons</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Quick Links</h2>
          <QuickLinks />
        </div>

        {/* Tutorial - shows automatically for new users (admin, client, employee) who haven't completed the tour */}
        {(isAdmin || isClient || isEmployee) && <OnboardingTutorial />}
      </div>
    </AdminLayout>
  );
}

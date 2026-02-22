import React, { useState, useEffect } from 'react';
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Database, 
  DollarSign, 
  ExternalLink, 
  Copy,
  RefreshCw,
  AlertCircle,
  FileText,
  Settings
} from 'lucide-react';
import { buildApiUrl } from '@/lib/queryClient';

interface IntegrationStatus {
  googleSheets: {
    enabled: boolean;
    connected: boolean;
    error?: string;
    spreadsheetId?: string;
  };
  quickBooks: {
    enabled: boolean;
    connected: boolean;
    error?: string;
    companyId?: string;
  };
}

interface SetupStep {
  id: string;
  title: string;
  completed: boolean;
  description: string;
  action?: () => void;
}

export default function IntegrationSetup() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'google' | 'quickbooks'>('overview');
  
  // Google Sheets setup state
  const [googleSheetId, setGoogleSheetId] = useState('');
  const [serviceAccountKey, setServiceAccountKey] = useState('');
  
  // QuickBooks setup state  
  const [qbClientId, setQbClientId] = useState('');
  const [qbClientSecret, setQbClientSecret] = useState('');
  const [qbCompanyId, setQbCompanyId] = useState('');
  const [qbAccessToken, setQbAccessToken] = useState('');
  const [qbRefreshToken, setQbRefreshToken] = useState('');

  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: 'google-service-account',
      title: 'Create Google Service Account',
      completed: false,
      description: 'Set up service account for Google Sheets API access',
    },
    {
      id: 'google-sheets-config',
      title: 'Configure Google Sheets',
      completed: false,
      description: 'Connect your commission tracking spreadsheet',
    },
    {
      id: 'quickbooks-oauth',
      title: 'Set Up QuickBooks OAuth',
      completed: false,
      description: 'Create QuickBooks app and get API credentials',
    },
    {
      id: 'quickbooks-connect',
      title: 'Connect QuickBooks Company',
      completed: false,
      description: 'Authorize access to your QuickBooks company data',
    },
    {
      id: 'test-integration',
      title: 'Test Integration',
      completed: false,
      description: 'Verify all connections are working properly',
    }
  ]);

  useEffect(() => {
    checkIntegrationStatus();
  }, []);

  const checkIntegrationStatus = async () => {
    try {
      setLoading(true);
      
      // Check current configuration
      const configResponse = await fetch(buildApiUrl('/api/real-data/config'), {
        credentials: 'include'
      });
      
      if (configResponse.ok) {
        const config = await configResponse.json();
        
        // Check health
        const healthResponse = await fetch(buildApiUrl('/api/real-data/health-check'));
        const health = healthResponse.ok ? await healthResponse.json() : null;
        
        const integrationStatus: IntegrationStatus = {
          googleSheets: {
            enabled: config.integrations?.googleSheets?.enabled || false,
            connected: health?.status?.googleSheets?.connected || false,
            error: health?.status?.googleSheets?.error,
            spreadsheetId: config.integrations?.googleSheets?.spreadsheetId,
          },
          quickBooks: {
            enabled: config.integrations?.quickBooks?.enabled || false,
            connected: health?.status?.quickBooks?.connected || false,
            error: health?.status?.quickBooks?.error,
            companyId: config.integrations?.quickBooks?.companyId,
          }
        };
        
        setStatus(integrationStatus);
        updateSetupSteps(integrationStatus);
      }
    } catch (error) {
      console.error('Error checking integration status:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetupSteps = (status: IntegrationStatus) => {
    setSetupSteps(steps => steps.map(step => {
      switch (step.id) {
        case 'google-service-account':
          return { ...step, completed: status.googleSheets.enabled };
        case 'google-sheets-config':
          return { ...step, completed: status.googleSheets.connected };
        case 'quickbooks-oauth':
          return { ...step, completed: status.quickBooks.enabled };
        case 'quickbooks-connect':
          return { ...step, completed: status.quickBooks.connected };
        case 'test-integration':
          return { ...step, completed: status.googleSheets.connected && status.quickBooks.connected };
        default:
          return step;
      }
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openGoogleCloudConsole = () => {
    window.open('https://console.cloud.google.com/', '_blank');
  };

  const openQuickBooksDevConsole = () => {
    window.open('https://developer.intuit.com/', '_blank');
  };

  const testGoogleSheetsConnection = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/api/real-data/test/google-sheets'), {
        credentials: 'include'
      });
      const result = await response.json();
      
      if (result.success) {
        alert('Google Sheets test successful! ✅');
      } else {
        alert(`Google Sheets test failed: ${result.message}`);
      }
    } catch (error) {
      alert('Google Sheets test failed - check console for details');
    } finally {
      setLoading(false);
    }
  };

  const testQuickBooksConnection = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/api/real-data/test/quickbooks'), {
        credentials: 'include'
      });
      const result = await response.json();
      
      if (result.success) {
        alert('QuickBooks test successful! ✅');
      } else {
        alert(`QuickBooks test failed: ${result.message}`);
      }
    } catch (error) {
      alert('QuickBooks test failed - check console for details');
    } finally {
      setLoading(false);
    }
  };

  const completedSteps = setupSteps.filter(s => s.completed).length;
  const progressPercentage = (completedSteps / setupSteps.length) * 100;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Real Data Integration Setup</h1>
            <p className="text-muted-foreground">
              Connect your dashboard to Google Sheets and QuickBooks for live business data
            </p>
          </div>
          <Button onClick={checkIntegrationStatus} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Setup Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {completedSteps} of {setupSteps.length} steps completed
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {status && (
                  <>
                    <div className="flex items-center gap-3 p-3 rounded-lg border">
                      <Database className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Google Sheets</div>
                        <div className="flex items-center gap-2">
                          {status.googleSheets.connected ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-600">Connected</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-600">Not Connected</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg border">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">QuickBooks</div>
                        <div className="flex items-center gap-2">
                          {status.quickBooks.connected ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-600">Connected</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-600">Not Connected</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {setupSteps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4 p-4 rounded-lg border">
                  <div className="flex-shrink-0 mt-1">
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                        <span className="text-xs font-medium">{index + 1}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {step.completed ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Complete
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Setup */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="google">Google Sheets</TabsTrigger>
            <TabsTrigger value="quickbooks">QuickBooks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>What This Integration Does</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Google Sheets Integration</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Pulls real commission data from your master spreadsheet</li>
                    <li>• Calculates live staff performance metrics</li>
                    <li>• Updates leaderboards with actual earnings</li>
                    <li>• Syncs commission rate changes automatically</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">QuickBooks Integration</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Fetches real expense data (gas, Uber, airport, parking)</li>
                    <li>• Tracks actual costs by category and date</li>
                    <li>• Provides trend analysis of spending patterns</li>
                    <li>• Enables true P&L visibility with live data</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Important</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Your dashboard will automatically fall back to mock data if integrations are unavailable.
                    This ensures your system never breaks, even during setup or maintenance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="google">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Google Sheets Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step-by-step instructions */}
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Step 1: Create Service Account</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Set up a Google Cloud service account to access your spreadsheet data
                    </p>
                    <Button onClick={openGoogleCloudConsole} variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Google Cloud Console
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Step 2: Share Your Spreadsheet</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Share your commission spreadsheet with the service account email
                    </p>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="google-sheet-id">Google Sheet ID</Label>
                        <div className="flex gap-2">
                          <Input
                            id="google-sheet-id"
                            value={googleSheetId}
                            onChange={(e) => setGoogleSheetId(e.target.value)}
                            placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                          />
                          <Button 
                            onClick={() => copyToClipboard(googleSheetId)} 
                            variant="outline" 
                            size="sm"
                            disabled={!googleSheetId}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Find this in your Google Sheet URL after /spreadsheets/d/
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={testGoogleSheetsConnection} disabled={loading}>
                      <Database className="h-4 w-4 mr-2" />
                      Test Connection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quickbooks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  QuickBooks Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Step 1: Create QuickBooks App</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Create a developer app to connect to your QuickBooks company
                    </p>
                    <Button onClick={openQuickBooksDevConsole} variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open QuickBooks Developer Console
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Step 2: Configure OAuth Credentials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="qb-client-id">Client ID</Label>
                        <Input
                          id="qb-client-id"
                          type="password"
                          value={qbClientId}
                          onChange={(e) => setQbClientId(e.target.value)}
                          placeholder="Q0abc..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="qb-client-secret">Client Secret</Label>
                        <Input
                          id="qb-client-secret"
                          type="password"
                          value={qbClientSecret}
                          onChange={(e) => setQbClientSecret(e.target.value)}
                          placeholder="1234567890abc..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="qb-company-id">Company ID</Label>
                        <Input
                          id="qb-company-id"
                          value={qbCompanyId}
                          onChange={(e) => setQbCompanyId(e.target.value)}
                          placeholder="9130347321534251234"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={testQuickBooksConnection} disabled={loading}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Test Connection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
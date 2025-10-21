import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ApiTestResult {
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  responseTime?: number;
}

export default function ApiConnectivityTest() {
  const [results, setResults] = useState<ApiTestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const testEndpoints = [
    { name: 'Health Dashboard Stats', endpoint: '/dashboard/stats' },
    { name: 'User Profile', endpoint: '/auth/me' },
    { name: 'Vitals Data', endpoint: '/vitals' },
    { name: 'Medications', endpoint: '/medications' },
  ];

  const testApiConnectivity = async () => {
    setTesting(true);
    setResults([]);

    for (const test of testEndpoints) {
      const startTime = Date.now();
      
      try {
        const response = await fetch(`https://noncondescendingly-phonometric-ken.ngrok-free.dev/api${test.endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
          },
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          setResults(prev => [...prev, {
            endpoint: test.name,
            status: 'success',
            message: `✅ Connected successfully (${response.status})`,
            responseTime,
          }]);
        } else {
          setResults(prev => [...prev, {
            endpoint: test.name,
            status: 'error',
            message: `❌ HTTP ${response.status}: ${response.statusText}`,
            responseTime,
          }]);
        }
      } catch (error: any) {
        const responseTime = Date.now() - startTime;
        setResults(prev => [...prev, {
          endpoint: test.name,
          status: 'error',
          message: `❌ Network Error: ${error.message}`,
          responseTime,
        }]);
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>API Connectivity Test</span>
          {testing && <Loader2 className="w-4 h-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-4">
          <Button 
            onClick={testApiConnectivity} 
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {testing ? 'Testing...' : 'Test API Connection'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setResults([]);
              setTesting(false);
            }}
            disabled={testing}
          >
            Clear Results
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Test Results:</h3>
            {results.map((result, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="font-medium">{result.endpoint}</div>
                  <div className="text-sm text-gray-600">{result.message}</div>
                  {result.responseTime && (
                    <div className="text-xs text-gray-500">
                      Response time: {result.responseTime}ms
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Alert>
          <AlertDescription>
            <strong>Network Error Troubleshooting:</strong>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
              <li>Check if the ngrok URL is still active</li>
              <li>Verify your internet connection</li>
              <li>Try refreshing the page</li>
              <li>Check browser console for detailed error messages</li>
              <li>Ensure CORS headers are properly configured on the server</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

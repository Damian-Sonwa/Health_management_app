import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Database } from 'lucide-react';

interface ConnectionTest {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  responseTime?: number;
  data?: any;
}

export default function MongoDBConnectionTest() {
  const [tests, setTests] = useState<ConnectionTest[]>([]);
  const [testing, setTesting] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const testMongoDBConnection = async () => {
    setTesting(true);
    setTests([]);
    setOverallStatus('pending');

    try {
      // Test MongoDB connection via backend API
      const startTime = Date.now();
      const response = await fetch('http://localhost:5001/api/mongodb/test');
      const responseTime = Date.now() - startTime;
      
      const connectionResult = await response.json();
      const connectionTest: ConnectionTest = {
        name: 'MongoDB Connection',
        status: connectionResult.success ? 'success' : 'error',
        message: connectionResult.success ? '✅ Connected successfully' : `❌ ${connectionResult.message}`,
        responseTime: responseTime,
        data: connectionResult
      };

      setTests([connectionTest]);

      if (connectionResult.success) {
        // Test public stats endpoint
        const statsStartTime = Date.now();
        const statsResponse = await fetch('http://localhost:5001/api/public/stats');
        const statsResponseTime = Date.now() - statsStartTime;
        const statsResult = await statsResponse.json();
        
        const statsTest: ConnectionTest = {
          name: 'Data Access',
          status: statsResult.success ? 'success' : 'error',
          message: statsResult.success ? '✅ Data successfully retrieved' : `❌ ${statsResult.message}`,
          responseTime: statsResponseTime,
          data: statsResult.data
        };

        setTests([connectionTest, statsTest]);
        setOverallStatus('success');
      } else {
        setOverallStatus('error');
      }
    } catch (error: any) {
      console.error('MongoDB connection test failed:', error);
      const errorTest: ConnectionTest = {
        name: 'Connection Test',
        status: 'error',
        message: error.message || 'Failed to connect to backend API'
      };
      setTests([errorTest]);
      setOverallStatus('error');
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          MongoDB Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Test the connection to MongoDB Atlas and verify data access.
          </p>
          <Button 
            onClick={testMongoDBConnection} 
            disabled={testing}
            className="flex items-center gap-2"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>

        {tests.length > 0 && (
          <div className="space-y-3">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <p className="font-medium">{test.name}</p>
                    <p className={`text-sm ${getStatusColor(test.status)}`}>
                      {test.message}
                    </p>
                    {test.responseTime && (
                      <p className="text-xs text-gray-500">
                        Response time: {test.responseTime}ms
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {overallStatus !== 'pending' && (
          <Alert>
            <AlertDescription>
              {overallStatus === 'success' ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  MongoDB connection is working properly!
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  MongoDB connection failed. Please check the backend server.
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

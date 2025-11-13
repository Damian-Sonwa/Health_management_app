import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Heart, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? "http://localhost:5001/api"
  : "https://health-management-app-joj5.onrender.com/api";

async function makeAPICall(endpoint: string, method = "GET", data: any = null) {
  const headers: any = {
    "Content-Type": "application/json",
  };

  const config: RequestInit = { method, headers };
  if (data) config.body = JSON.stringify(data);

  try {
    console.log(`Making API call to: ${API_BASE_URL}${endpoint}`);
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    console.log(`Response status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API Error Response:", errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const result = await res.json();
    console.log("API Response:", result);
    return result;
  } catch (err: any) {
    console.error("API Error:", err?.message || err);
    throw err;
  }
}

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: 'alice@example.com',
    password: 'password123',
  });

  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log("Starting login process...");
      console.log("Login data:", { email: loginData.email });

      const response = await makeAPICall("/auth/login", "POST", {
        email: loginData.email,
        password: loginData.password,
      });

      console.log("Login response received:", response);

      if (response && response.success && response.token) {
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        setSuccess("Login successful! Redirecting to dashboard...");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setError(response?.message || "Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      console.error("Login error details:", err?.message || err);
      setError(`Login failed: ${err.message || "Network error. Please check your connection."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔵 Sign up button clicked!");
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!signupData.name.trim()) {
      setError("Name is required");
      setIsLoading(false);
      return;
    }

    if (!signupData.email.trim()) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (signupData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      console.log("🚀 Starting signup process...");
      console.log("📝 Signup data:", {
        name: signupData.name,
        email: signupData.email,
        phone: signupData.phone,
      });

      const response = await makeAPICall("/auth/register", "POST", {
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        phone: signupData.phone,
      });

      console.log("✅ Signup response received:", response);

      if (response && response.success) {
        if (response.token) {
          localStorage.setItem("authToken", response.token);
          localStorage.setItem("user", JSON.stringify(response.user));

          setSuccess("Account created successfully! Redirecting to dashboard...");
          setTimeout(() => navigate("/dashboard"), 1500);
        } else {
          setSuccess("Account created successfully! Please login with your credentials.");
        }
      } else {
        setError(response?.message || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      console.error("❌ Signup error details:", err?.message || err);
      setError(`Signup failed: ${err.message || "Network error. Please check your connection."}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/nuviacare-logo.png" alt="NuviaCare" className="h-16 w-auto object-contain" />
          </div>
          <p className="text-gray-600">Secure access to your health records</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mt-4 border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}

              {/* Login */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
                  <p className="text-xs text-blue-700">Email: alice@example.com</p>
                  <p className="text-xs text-blue-700">Password: password123</p>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        console.log("🔵 'Sign Up' link clicked - switching to signup tab");
                        setActiveTab('signup');
                      }}
                      className="text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer transition-colors"
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              </TabsContent>

              {/* Signup */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone (Optional)</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password (min 6 characters)"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <Input
                      id="signup-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold" 
                    disabled={isLoading}
                    onClick={(e) => {
                      console.log("🖱️ Button click event triggered");
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Sign Up'
                    )}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        console.log("🔵 'Sign In' link clicked - switching to login tab");
                        setActiveTab('login');
                      }}
                      className="text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer transition-colors"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

  <div className="text-center mt-4">
          <p className="text-xs text-gray-500">API: {API_BASE_URL}</p>
        </div>

      <div className="text-center mt-6">
          <p className="text-sm text-gray-500">Secure healthcare management platform</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

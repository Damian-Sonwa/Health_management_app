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
    role: 'patient',
    // Pharmacy-specific fields
    pharmacyName: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    licenseId: '',
    licenseImage: '',
    logo: ''
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

        // Redirect based on user role
        const userRole = response.user?.role;
        let redirectPath = "/dashboard";
        
        if (userRole === 'pharmacy') {
          // Check if pharmacy has completed profile setup
          // If pharmacy record exists with proper name, go to dashboard, otherwise profile setup
          redirectPath = "/pharmacy-dashboard";
        } else if (userRole === 'doctor') {
          redirectPath = "/doctor-dashboard";
        } else if (userRole === 'admin') {
          redirectPath = "/admin-dashboard";
        }
        
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => navigate(redirectPath, { replace: true }), 1500);
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

      const requestData: any = {
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        phone: signupData.phone,
        role: signupData.role
      };

      // Add pharmacy-specific fields if role is pharmacy (optional during signup)
      if (signupData.role === 'pharmacy') {
        // Pharmacy name is optional during signup - will be completed in profile setup
        if (signupData.pharmacyName && signupData.pharmacyName.trim()) {
          requestData.pharmacyName = signupData.pharmacyName;
        }
        if (signupData.address && (signupData.address.street || signupData.address.city)) {
          requestData.address = signupData.address;
        }
        if (signupData.licenseId && signupData.licenseId.trim()) {
          requestData.licenseId = signupData.licenseId;
        }
        if (signupData.licenseImage && signupData.licenseImage.trim()) {
          requestData.licenseImage = signupData.licenseImage;
        }
        if (signupData.logo && signupData.logo.trim()) {
          requestData.logo = signupData.logo;
        }
      }

      const response = await makeAPICall("/auth/register", "POST", requestData);

      console.log("✅ Signup response received:", response);

      if (response && response.success) {
        if (response.token) {
          localStorage.setItem("authToken", response.token);
          localStorage.setItem("user", JSON.stringify(response.user));

          const successMessage = response.message || (signupData.role === 'pharmacy' 
            ? "Pharmacy registration submitted. Your account is pending admin approval."
            : "Account created successfully! Redirecting to dashboard...");
          
          setSuccess(successMessage);
          
          if (signupData.role === 'pharmacy') {
            // For pharmacy, redirect to onboarding page
            setSuccess("Pharmacy account created! Redirecting to onboarding...");
            setTimeout(() => {
              navigate("/pharmacy/onboarding", { replace: true });
            }, 1500);
          } else if (signupData.role === 'doctor') {
            // For doctor, redirect to onboarding page
            setSuccess("Doctor account created! Redirecting to onboarding...");
            setTimeout(() => {
              navigate("/doctor/onboarding", { replace: true });
            }, 1500);
          } else {
            setSuccess("Account created successfully! Redirecting to dashboard...");
            setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
          }
        } else {
          setSuccess(response.message || "Account created successfully! Please login with your credentials.");
        }
      } else {
        // Check if error is due to duplicate user
        const errorMessage = response?.message || "Registration failed. Please try again.";
        if (errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('user already')) {
          setError("An account with this email already exists. Please login instead.");
          // Auto-redirect to login after 2 seconds
          setTimeout(() => {
            setActiveTab('login');
            setError('');
            setLoginData({ ...loginData, email: signupData.email });
          }, 2000);
        } else {
          setError(errorMessage);
        }
      }
    } catch (err: any) {
      console.error("❌ Signup error details:", err?.message || err);
      const errorMessage = err.message || "Network error. Please check your connection.";
      
      // Check if error is due to duplicate user
      if (errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('user already')) {
        setError("An account with this email already exists. Please login instead.");
        // Auto-redirect to login after 2 seconds
        setTimeout(() => {
          setActiveTab('login');
          setError('');
          setLoginData({ ...loginData, email: signupData.email });
        }, 2000);
      } else {
        setError(`Signup failed: ${errorMessage}`);
      }
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
                    <Label htmlFor="signup-phone">Phone</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Role</Label>
                    <select
                      id="signup-role"
                      value={signupData.role}
                      onChange={(e) => setSignupData({ ...signupData, role: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isLoading}
                    >
                      <option value="patient">Patient</option>
                      <option value="pharmacy">Pharmacy</option>
                      <option value="doctor">Doctor</option>
                    </select>
                  </div>

                  {/* Pharmacy-specific fields - Optional during signup */}
                  {signupData.role === 'pharmacy' && (
                    <>
                      <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                        <p className="text-sm text-blue-800 font-medium mb-1">Pharmacy Registration</p>
                        <p className="text-xs text-blue-700">You can complete your pharmacy details in the next step. Basic information is optional here.</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pharmacy-name">Pharmacy Name (Optional)</Label>
                        <Input
                          id="pharmacy-name"
                          type="text"
                          placeholder="Enter pharmacy name (optional)"
                          value={signupData.pharmacyName}
                          onChange={(e) => setSignupData({ ...signupData, pharmacyName: e.target.value })}
                          disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500">You'll complete this in the profile setup</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Address (Optional)</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Street (optional)"
                            value={signupData.address.street}
                            onChange={(e) => setSignupData({
                              ...signupData,
                              address: { ...signupData.address, street: e.target.value }
                            })}
                            disabled={isLoading}
                          />
                          <Input
                            placeholder="City (optional)"
                            value={signupData.address.city}
                            onChange={(e) => setSignupData({
                              ...signupData,
                              address: { ...signupData.address, city: e.target.value }
                            })}
                            disabled={isLoading}
                          />
                          <Input
                            placeholder="State"
                            value={signupData.address.state}
                            onChange={(e) => setSignupData({
                              ...signupData,
                              address: { ...signupData.address, state: e.target.value }
                            })}
                            required
                            disabled={isLoading}
                          />
                          <Input
                            placeholder="ZIP Code"
                            value={signupData.address.zipCode}
                            onChange={(e) => setSignupData({
                              ...signupData,
                              address: { ...signupData.address, zipCode: e.target.value }
                            })}
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="license-id">License ID (Optional)</Label>
                        <Input
                          id="license-id"
                          type="text"
                          placeholder="Enter license ID"
                          value={signupData.licenseId}
                          onChange={(e) => setSignupData({ ...signupData, licenseId: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>
                    </>
                  )}

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

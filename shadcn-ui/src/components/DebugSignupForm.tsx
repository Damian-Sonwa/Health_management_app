import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Mail, Lock, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { useNavigate } from "react-router-dom";

export default function DebugSignupForm() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      agreeToTerms
    });
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }
    
    if (!validateEmail(email)) {
      alert("Please enter a valid email address");
      return;
    }
    
    if (!validatePassword(password)) {
      alert("Password must be at least 6 characters long");
      return;
    }
    
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    if (!agreeToTerms) {
      alert("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    setIsLoading(true);
    try {
      console.log('Calling register function...');
      await register({
        name: `${firstName} ${lastName}`,
        email,
        password
      });
      console.log('Registration successful, navigating to dashboard');
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(`Sign up failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = firstName && lastName && validateEmail(email) && validatePassword(password) && password === confirmPassword && agreeToTerms;
  const isButtonDisabled = isLoading || loading || !isFormValid;

  console.log('Form validation state:', {
    firstName: !!firstName,
    lastName: !!lastName,
    email: !!email,
    emailValid: validateEmail(email),
    password: !!password,
    passwordValid: validatePassword(password),
    passwordsMatch: password === confirmPassword,
    agreeToTerms,
    isFormValid,
    isButtonDisabled
  });

  return (
    <form onSubmit={handleSignUp} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
              First Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="firstName"
                placeholder="First name"
                className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
              Last Name
            </Label>
            <Input
              id="lastName"
              placeholder="Last name"
              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {email && validateEmail(email) && (
              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              className="pl-10 pr-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <div className="text-xs text-gray-500">
              {validatePassword(password) ? (
                <span className="text-green-600 flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Password is strong
                </span>
              ) : (
                <span className="text-red-600">Password must be at least 6 characters</span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              className="pl-10 pr-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmPassword && (
            <div className="text-xs text-gray-500">
              {password === confirmPassword ? (
                <span className="text-green-600 flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Passwords match
                </span>
              ) : (
                <span className="text-red-600">Passwords do not match</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          checked={agreeToTerms}
          onCheckedChange={setAgreeToTerms}
          className="mt-1"
        />
        <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
          I agree to the Terms of Service and Privacy Policy
        </Label>
      </div>
      
      <Button
        type="submit"
        className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium transition-all duration-200"
        disabled={isButtonDisabled}
      >
        {isLoading || loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 font-medium"
            onClick={() => {
              const signinTab = document.querySelector('[value="signin"]') as HTMLElement;
              signinTab?.click();
            }}
          >
            Sign in here
          </button>
        </p>
      </div>
    </form>
  );
}

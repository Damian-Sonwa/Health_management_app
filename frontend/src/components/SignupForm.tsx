import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Mail, Lock, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SignupForm() {
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
      await register({
        name: `${firstName} ${lastName}`,
        email,
        password
      });
      
      // Show success message and navigate to onboarding
      // User is automatically logged in after successful registration
      alert(`Account created successfully! Welcome, ${firstName}!`);
      navigate("/onboarding");
    } catch (error: any) {
      alert(`Sign up failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-6 animate-fade-in">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 transform transition-all duration-300 hover:-translate-y-1">
            <Label htmlFor="firstName" className="text-sm font-medium text-white drop-shadow">
              First Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-teal-300 transition-colors" />
              <Input
                id="firstName"
                placeholder="First name"
                className="pl-10 h-11 bg-white/20 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm focus:border-teal-400 focus:ring-teal-400 transition-all duration-300"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2 transform transition-all duration-300 hover:-translate-y-1">
            <Label htmlFor="lastName" className="text-sm font-medium text-white drop-shadow">
              Last Name
            </Label>
            <Input
              id="lastName"
              placeholder="Last name"
              className="h-11 bg-white/20 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm focus:border-teal-400 focus:ring-teal-400 transition-all duration-300"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2 transform transition-all duration-300 hover:-translate-y-1">
          <Label htmlFor="email" className="text-sm font-medium text-white drop-shadow">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-teal-300 transition-colors" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="pl-10 h-11 bg-white/20 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm focus:border-teal-400 focus:ring-teal-400 transition-all duration-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {email && validateEmail(email) && (
              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500 animate-pulse-slow" />
            )}
          </div>
        </div>

        <div className="space-y-2 transform transition-all duration-300 hover:-translate-y-1">
          <Label htmlFor="password" className="text-sm font-medium text-white drop-shadow">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-teal-300 transition-colors" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              className="pl-10 pr-10 h-11 bg-white/20 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm focus:border-teal-400 focus:ring-teal-400 transition-all duration-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-teal-300 transition-all duration-300 hover:scale-110"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <div className="text-xs">
              {validatePassword(password) ? (
                <span className="text-green-300 flex items-center drop-shadow">
                  <Check className="h-3 w-3 mr-1" />
                  Password is strong
                </span>
              ) : (
                <span className="text-red-300 drop-shadow">Password must be at least 6 characters</span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2 transform transition-all duration-300 hover:-translate-y-1">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-white drop-shadow">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-teal-300 transition-colors" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              className="pl-10 pr-10 h-11 bg-white/20 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm focus:border-teal-400 focus:ring-teal-400 transition-all duration-300"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-teal-300 transition-all duration-300 hover:scale-110"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmPassword && (
            <div className="text-xs">
              {password === confirmPassword ? (
                <span className="text-green-300 flex items-center drop-shadow">
                  <Check className="h-3 w-3 mr-1" />
                  Passwords match
                </span>
              ) : (
                <span className="text-red-300 drop-shadow">Passwords do not match</span>
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
          className="mt-1 border-white/40 data-[state=checked]:bg-teal-400"
        />
        <Label htmlFor="terms" className="text-sm text-white/90 cursor-pointer leading-relaxed drop-shadow">
          I agree to the{" "}
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="text-teal-300 hover:text-teal-200 font-medium underline transition-all duration-300"
              >
                Terms of Service
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Terms of Service</DialogTitle>
                <DialogDescription>
                  Please read our terms of service carefully before using our platform.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm text-gray-700">
                <h3 className="font-semibold">1. Acceptance of Terms</h3>
                <p>By accessing and using HealthCare Pro, you accept and agree to be bound by the terms and provision of this agreement.</p>
                
                <h3 className="font-semibold">2. Use License</h3>
                <p>Permission is granted to temporarily download one copy of HealthCare Pro for personal, non-commercial transitory viewing only.</p>
                
                <h3 className="font-semibold">3. Privacy Policy</h3>
                <p>Your privacy is important to us. We collect and use your information in accordance with our Privacy Policy.</p>
                
                <h3 className="font-semibold">4. Medical Disclaimer</h3>
                <p>HealthCare Pro is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider.</p>
                
                <h3 className="font-semibold">5. Limitation of Liability</h3>
                <p>In no event shall HealthCare Pro be liable for any damages arising out of the use or inability to use the platform.</p>
              </div>
            </DialogContent>
          </Dialog>{" "}
          and{" "}
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="text-teal-300 hover:text-teal-200 font-medium underline transition-all duration-300"
              >
                Privacy Policy
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Privacy Policy</DialogTitle>
                <DialogDescription>
                  Your privacy is important to us. This policy explains how we collect, use, and protect your information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm text-gray-700">
                <h3 className="font-semibold">1. Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.</p>
                
                <h3 className="font-semibold">2. How We Use Your Information</h3>
                <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
                
                <h3 className="font-semibold">3. Information Sharing</h3>
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
                
                <h3 className="font-semibold">4. Data Security</h3>
                <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                
                <h3 className="font-semibold">5. Health Information</h3>
                <p>Your health information is encrypted and stored securely. We comply with applicable health privacy laws and regulations.</p>
                
                <h3 className="font-semibold">6. Your Rights</h3>
                <p>You have the right to access, update, or delete your personal information. You can also opt out of certain communications from us.</p>
              </div>
            </DialogContent>
          </Dialog>
        </Label>
      </div>
      
      <Button
        type="submit"
        className="w-full h-11 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-teal-500/30"
        disabled={isLoading || loading || !firstName || !lastName || !validateEmail(email) || !validatePassword(password) || password !== confirmPassword || !agreeToTerms}
      >
        {isLoading || loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait for a successful account creation
          </>
        ) : (
          'Create Account'
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-white/90 drop-shadow">
          Already have an account?{' '}
          <button
            type="button"
            className="text-teal-300 hover:text-teal-200 font-medium transition-all duration-300 hover:underline"
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

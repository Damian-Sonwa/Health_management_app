import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberEmail');
      }
      navigate("/dashboard");
    } catch (error: any) {
      alert(`Login failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      alert("Please enter your email address");
      return;
    }
    
    setIsForgotPasswordLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Password reset instructions have been sent to ${forgotPasswordEmail}`);
      setIsForgotPasswordOpen(false);
      setForgotPasswordEmail('');
    } catch (error) {
      alert("Failed to send password reset email. Please try again.");
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              required
              defaultValue={localStorage.getItem('rememberEmail') || ''}
            />
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
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="pl-10 pr-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={setRememberMe}
          />
          <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
            Remember me
          </Label>
        </div>
        <button
          type="button"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          onClick={() => setIsForgotPasswordOpen(true)}
        >
          Forgot password?
        </button>
      </div>
      
      <Button 
        type="submit" 
        className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium transition-all duration-200"
        disabled={isLoading || loading}
      >
        {isLoading || loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 font-medium"
            onClick={() => {
              const signupTab = document.querySelector('[value="signup"]') as HTMLElement;
              signupTab?.click();
            }}
          >
            Sign up here
          </button>
        </p>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Reset Password</DialogTitle>
            <DialogDescription className="text-center">
              Enter your email address and we'll send you instructions to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsForgotPasswordOpen(false)}
                disabled={isForgotPasswordLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                onClick={handleForgotPassword}
                disabled={isForgotPasswordLoading}
              >
                {isForgotPasswordLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}
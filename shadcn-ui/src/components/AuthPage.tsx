import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, Users, Activity } from "lucide-react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HealthCare Pro
              </h1>
            </div>
            <p className="text-xl text-gray-600 leading-relaxed">
              Your comprehensive health management platform. Track vitals, manage medications, 
              schedule appointments, and take control of your wellness journey.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Vital Tracking</h3>
              <p className="text-sm text-gray-600">Monitor your health metrics in real-time</p>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Secure & Private</h3>
              <p className="text-sm text-gray-600">Your health data is protected and encrypted</p>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Expert Care</h3>
              <p className="text-sm text-gray-600">Connect with healthcare professionals</p>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Heart className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Wellness Guide</h3>
              <p className="text-sm text-gray-600">Personalized health recommendations</p>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-2 text-center pb-8">
              <div className="mx-auto p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-fit">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Welcome to HealthCare Pro
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to your account or create a new one to get started
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-6 pb-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
                  <TabsTrigger 
                    value="signin" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <LoginForm />
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <SignupForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

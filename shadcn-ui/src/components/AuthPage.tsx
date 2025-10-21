import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, Users, Activity } from "lucide-react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Split Medical Device Background Images */}
      <div className="absolute inset-0 grid grid-cols-2 gap-0">
        {/* Blood Pressure Monitor - Left */}
        <div 
          className="bg-cover bg-center"
          style={{ backgroundImage: "url('/images/bp-machine.jpg')" }}
        />
        {/* Glucose Monitor - Right */}
        <div 
          className="bg-cover bg-center"
          style={{ backgroundImage: "url('/images/glucose-machine.jpg')" }}
        />
      </div>
      
      {/* Frosted Glass Overlay for Glassmorphism */}
      <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-br from-teal-900/75 via-cyan-900/70 to-blue-900/75" />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 via-transparent to-cyan-500/20 animate-pulse-slow" />
      
      <div className="relative w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center z-10">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:block space-y-8 animate-fade-in-left">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 group">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-full transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                <Heart className="h-8 w-8 text-white drop-shadow-lg" />
              </div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg animate-gradient bg-gradient-to-r from-teal-200 via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                HealthCare Pro
              </h1>
            </div>
            <p className="text-xl text-white/90 leading-relaxed drop-shadow-md">
              Your comprehensive health management platform. Track vitals, manage medications, 
              schedule appointments, and take control of your wellness journey.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3 group transform transition-all duration-300 hover:-translate-y-2">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-lg transform transition-all duration-300 group-hover:bg-white/30">
                <Activity className="h-6 w-6 text-teal-200" />
              </div>
              <h3 className="font-semibold text-white drop-shadow-md">Vital Tracking</h3>
              <p className="text-sm text-white/80">Monitor your health metrics in real-time</p>
            </div>
            
            <div className="space-y-3 group transform transition-all duration-300 hover:-translate-y-2 animation-delay-100">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-lg transform transition-all duration-300 group-hover:bg-white/30">
                <Shield className="h-6 w-6 text-cyan-200" />
              </div>
              <h3 className="font-semibold text-white drop-shadow-md">Secure & Private</h3>
              <p className="text-sm text-white/80">Your health data is protected and encrypted</p>
            </div>
            
            <div className="space-y-3 group transform transition-all duration-300 hover:-translate-y-2 animation-delay-200">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-lg transform transition-all duration-300 group-hover:bg-white/30">
                <Users className="h-6 w-6 text-blue-200" />
              </div>
              <h3 className="font-semibold text-white drop-shadow-md">Expert Care</h3>
              <p className="text-sm text-white/80">Connect with healthcare professionals</p>
            </div>
            
            <div className="space-y-3 group transform transition-all duration-300 hover:-translate-y-2 animation-delay-300">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-lg transform transition-all duration-300 group-hover:bg-white/30">
                <Heart className="h-6 w-6 text-teal-300" />
              </div>
              <h3 className="font-semibold text-white drop-shadow-md">Wellness Guide</h3>
              <p className="text-sm text-white/80">Personalized health recommendations</p>
            </div>
          </div>
        </div>

        {/* Right Side - Glassmorphism Auth Form */}
        <div className="w-full max-w-md mx-auto animate-fade-in-right">
          {/* Glassmorphism Card */}
          <div className="relative">
            {/* Glass effect background */}
            <div className="absolute inset-0 backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl" />
            
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl" />
            
            <Card className="relative shadow-none border-0 bg-transparent">
              <CardHeader className="space-y-2 text-center pb-8">
                <div className="mx-auto p-3 bg-gradient-to-r from-teal-400/80 to-cyan-400/80 rounded-full w-fit transform transition-all duration-300 hover:scale-110 hover:rotate-12 shadow-lg shadow-teal-500/50 backdrop-blur-sm border border-white/30">
                  <Heart className="h-8 w-8 text-white drop-shadow-lg animate-pulse-slow" />
                </div>
                <CardTitle className="text-2xl font-bold text-white drop-shadow-lg">
                  Welcome to HealthCare Pro
                </CardTitle>
                <CardDescription className="text-teal-100/90 drop-shadow">
                  Sign in to your account or create a new one to get started
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-6 pb-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10 backdrop-blur-md border border-white/20">
                    <TabsTrigger 
                      value="signin" 
                      className="data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 font-medium transition-all duration-300 text-white/70 hover:text-white"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup"
                      className="data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/30 font-medium transition-all duration-300 text-white/70 hover:text-white"
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
    </div>
  );
}

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Activity, Heart } from "lucide-react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Split Medical Device Background Images with Darker Overlay */}
      <div className="absolute inset-0 grid grid-cols-2 gap-0">
        {/* Blood Pressure Monitor - Left */}
        <div className="relative">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/bp-machine.jpg')" }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        {/* Glucose Monitor - Right */}
        <div className="relative">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/glucose-machine.jpg')" }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      </div>
      
      {/* Frosted Glass Overlay for Glassmorphism */}
      <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-br from-teal-900/80 via-cyan-900/75 to-blue-900/80" />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 via-transparent to-cyan-500/20 animate-gentle-pulse" />
      
      <div className="relative w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center z-10">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:block space-y-8 animate-fade-in-left">
          <div className="space-y-6">
            <div className="flex flex-col items-center group">
              {/* Brand Name with Professional Font */}
              <h1 className="text-6xl font-black text-white drop-shadow-2xl tracking-tight transform transition-all duration-300 group-hover:scale-105" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                NuviaCare
              </h1>
              {/* Animated Heartbeat */}
              <div className="mt-4 animate-float-slow">
                <img src="/animated-heart.svg" alt="Heartbeat" className="h-28 w-28 object-contain drop-shadow-2xl transform transition-all duration-300" />
              </div>
              {/* Tagline */}
              <p className="mt-4 text-lg font-semibold text-teal-100 drop-shadow-lg tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
                Your Health, Our Priority
              </p>
            </div>
              <p className="text-xl text-white leading-relaxed drop-shadow-2xl font-medium text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
                Your dedicated Blood Pressure & Blood Glucose Monitoring Platform. Track your vitals in real-time, 
                manage medications, schedule appointments, and take control of your health with precision monitoring.
              </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3 group transform transition-all duration-300 hover:-translate-y-2">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-lg transform transition-all duration-300 group-hover:bg-white/30">
                  <Heart className="h-6 w-6 text-red-200" />
                </div>
                <h3 className="font-bold text-white drop-shadow-2xl">Blood Pressure</h3>
                <p className="text-sm text-white drop-shadow-lg">Track BP with trends and alerts</p>
              </div>
              
              <div className="space-y-3 group transform transition-all duration-300 hover:-translate-y-2 animation-delay-100">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-lg transform transition-all duration-300 group-hover:bg-white/30">
                  <Activity className="h-6 w-6 text-green-200" />
                </div>
                <h3 className="font-bold text-white drop-shadow-2xl">Blood Glucose</h3>
                <p className="text-sm text-white drop-shadow-lg">Monitor glucose levels accurately</p>
              </div>
              
              <div className="space-y-3 group transform transition-all duration-300 hover:-translate-y-2 animation-delay-200">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-lg transform transition-all duration-300 group-hover:bg-white/30">
                  <Shield className="h-6 w-6 text-cyan-200" />
                </div>
                <h3 className="font-bold text-white drop-shadow-2xl">Secure & Private</h3>
                <p className="text-sm text-white drop-shadow-lg">Your health data is protected</p>
              </div>
              
              <div className="space-y-3 group transform transition-all duration-300 hover:-translate-y-2 animation-delay-300">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-lg transform transition-all duration-300 group-hover:bg-white/30">
                  <Users className="h-6 w-6 text-blue-200" />
                </div>
                <h3 className="font-bold text-white drop-shadow-2xl">Expert Care</h3>
                <p className="text-sm text-white drop-shadow-lg">Connect with healthcare professionals</p>
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
                <div className="mx-auto mb-4 flex flex-col items-center gap-3 lg:hidden animate-slide-in-scale">
                  <h1 className="text-5xl sm:text-6xl font-black text-white drop-shadow-2xl tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    NuviaCare
                  </h1>
                  <div className="animate-float-slow">
                    <img src="/animated-heart.svg" alt="Heartbeat" className="h-20 w-20 object-contain drop-shadow-2xl" />
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-teal-100 drop-shadow-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Your Health, Our Priority
                  </p>
                </div>
                <CardDescription className="text-white drop-shadow-lg text-base sm:text-lg font-medium px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
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

                  <TabsContent value="signin" className="space-y-4 animate-fade-in-up">
                    <LoginForm />
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4 animate-fade-in-up">
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

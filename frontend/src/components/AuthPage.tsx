import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Activity, Heart } from "lucide-react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");

  return (
    <div className="min-h-screen relative flex flex-col p-4 overflow-hidden">
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
      
      <div className="relative w-full max-w-6xl mx-auto flex flex-col gap-8 z-10 py-8">
        {/* Landing Page Section - Slides in from top */}
        <div className="w-full space-y-8 animate-slide-in-top">
          {/* Branding Section */}
          <div className="flex flex-col items-center group space-y-6">
            {/* Brand Name with Professional Font */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white drop-shadow-2xl tracking-tight transform transition-all duration-300 group-hover:scale-105" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              NuviaCare
            </h1>
            {/* Animated Heartbeat */}
            <div className="animate-float-slow">
              <img src="/animated-heart.svg" alt="Heartbeat" className="h-24 w-24 sm:h-28 sm:w-28 object-contain drop-shadow-2xl transform transition-all duration-300" />
            </div>
            {/* Tagline */}
            <p className="text-lg sm:text-xl font-semibold text-teal-100 drop-shadow-lg tracking-wide text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
              Your Health, Our Priority
            </p>
            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl text-white leading-relaxed drop-shadow-2xl font-medium text-center max-w-3xl px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
              Your dedicated Blood Pressure & Blood Glucose Monitoring Platform. Track your vitals in real-time, 
              manage medications, schedule appointments, and take control of your health with precision monitoring.
            </p>
          </div>

          {/* Features Grid - Slides in with staggered delays */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto px-4">
            <div className="space-y-3 group transform transition-all duration-300 hover:-translate-y-2 animate-slide-in-top animation-delay-100">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-lg transform transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-red-200 mx-auto" />
              </div>
              <h3 className="font-bold text-white drop-shadow-2xl text-sm sm:text-base text-center">Blood Pressure</h3>
              <p className="text-xs sm:text-sm text-white drop-shadow-lg text-center">Track BP with trends and alerts</p>
            </div>
            
            <div className="space-y-3 group transform transition-all duration-300 hover:-translate-y-2 animate-slide-in-top animation-delay-200">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-lg transform transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-green-200 mx-auto" />
              </div>
              <h3 className="font-bold text-white drop-shadow-2xl text-sm sm:text-base text-center">Blood Glucose</h3>
              <p className="text-xs sm:text-sm text-white drop-shadow-lg text-center">Monitor glucose levels accurately</p>
            </div>
            
            <div className="space-y-3 group transform transition-all duration-300 hover:-translate-y-2 animate-slide-in-top animation-delay-300">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-lg transform transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-200 mx-auto" />
              </div>
              <h3 className="font-bold text-white drop-shadow-2xl text-sm sm:text-base text-center">Secure & Private</h3>
              <p className="text-xs sm:text-sm text-white drop-shadow-lg text-center">Your health data is protected</p>
            </div>
            
            <div className="space-y-3 group transform transition-all duration-300 hover:-translate-y-2 animate-slide-in-top animation-delay-400">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-lg transform transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-200 mx-auto" />
              </div>
              <h3 className="font-bold text-white drop-shadow-2xl text-sm sm:text-base text-center">Expert Care</h3>
              <p className="text-xs sm:text-sm text-white drop-shadow-lg text-center">Connect with healthcare professionals</p>
            </div>
          </div>
        </div>

        {/* Auth Form Section - Slides in from bottom */}
        <div className="w-full max-w-md mx-auto animate-slide-in-bottom">
          {/* Glassmorphism Card */}
          <div className="relative">
            {/* Glass effect background */}
            <div className="absolute inset-0 backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl" />
            
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl" />
            
            <Card className="relative shadow-none border-0 bg-transparent">
              <CardHeader className="space-y-2 text-center pb-8">
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

        {/* Footer - Slides in from bottom with delay */}
        <footer className="w-full text-center py-6 animate-slide-in-bottom animation-delay-200">
          <p className="text-white/80 text-sm sm:text-base drop-shadow-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
            © {new Date().getFullYear()} NuviaCare. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

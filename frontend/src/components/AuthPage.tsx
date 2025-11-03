import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Activity,
  Pill,
  Calendar,
  FileText,
  BarChart3,
  TrendingUp,
  Award,
  Video,
  Phone,
  MessageCircle,
  Users,
  ClipboardList,
  Smartphone,
  Brain,
  BookOpen,
  PlayCircle,
  Globe,
  Moon,
  Download,
  WifiOff,
  Zap,
  Shield,
  Stethoscope,
  ArrowDown,
} from "lucide-react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

// All app features as button-style items
const allFeatures = [
  { icon: Heart, title: "Blood Pressure", color: "text-red-300" },
  { icon: Activity, title: "Blood Glucose", color: "text-green-300" },
  { icon: Activity, title: "Vital Signs", color: "text-blue-300" },
  { icon: Pill, title: "Medications", color: "text-purple-300" },
  { icon: Calendar, title: "Appointments", color: "text-orange-300" },
  { icon: FileText, title: "Health Records", color: "text-pink-300" },
  { icon: BarChart3, title: "Weekly Summary", color: "text-cyan-300" },
  { icon: TrendingUp, title: "Interactive Charts", color: "text-teal-300" },
  { icon: Brain, title: "Health Insights", color: "text-indigo-300" },
  { icon: TrendingUp, title: "Trend Analysis", color: "text-blue-400" },
  { icon: Award, title: "Achievement Badges", color: "text-yellow-300" },
  { icon: TrendingUp, title: "Progress Tracking", color: "text-amber-300" },
  { icon: Stethoscope, title: "Doctor Directory", color: "text-red-200" },
  { icon: Video, title: "Video Consultations", color: "text-purple-200" },
  { icon: Phone, title: "Phone Consultations", color: "text-blue-200" },
  { icon: MessageCircle, title: "Real-Time Chat", color: "text-green-200" },
  { icon: Users, title: "Caregivers", color: "text-teal-200" },
  { icon: ClipboardList, title: "Care Plans", color: "text-cyan-200" },
  { icon: Pill, title: "Medication Requests", color: "text-violet-300" },
  { icon: Smartphone, title: "Device Integration", color: "text-sky-300" },
  { icon: Brain, title: "AI Health Coach", color: "text-emerald-300" },
  { icon: BookOpen, title: "Wellness Guide", color: "text-lime-300" },
  { icon: BookOpen, title: "Educational Resources", color: "text-green-400" },
  { icon: PlayCircle, title: "Exercise Videos", color: "text-rose-300" },
  { icon: Zap, title: "Live Updates", color: "text-yellow-400" },
  { icon: Smartphone, title: "Multi-Device Sync", color: "text-blue-300" },
  { icon: WifiOff, title: "Offline Mode", color: "text-gray-300" },
  { icon: Globe, title: "Multilingual", color: "text-indigo-200" },
  { icon: Moon, title: "Dark Mode", color: "text-slate-300" },
  { icon: Download, title: "PWA", color: "text-teal-400" },
  { icon: Shield, title: "Secure & Private", color: "text-cyan-400" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");
  const authFormRef = useRef<HTMLDivElement>(null);

  const scrollToAuth = () => {
    authFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

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
      
      <div className="relative w-full max-w-7xl mx-auto flex flex-col gap-8 z-10 py-8">
        {/* Landing Page Section - Slides in from top */}
        <motion.div
          className="w-full space-y-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Branding Section */}
          <div className="flex flex-col items-center group space-y-6">
            {/* Brand Name with Professional Font */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white drop-shadow-2xl tracking-tight transform transition-all duration-300 group-hover:scale-105" style={{ fontFamily: "'Poppins', sans-serif" }}>
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
            
            {/* Get Started Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button
                onClick={scrollToAuth}
                className="mt-4 px-8 py-6 text-base sm:text-lg font-semibold bg-gradient-to-r from-teal-400/90 to-cyan-400/90 hover:from-teal-500 hover:to-cyan-500 text-white shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/50 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/20"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Get Started
                <ArrowDown className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Features Grid - Compact Button Style */}
        <motion.div
          className="w-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          {/* Section Header */}
          <motion.div
            className="text-center mb-6 sm:mb-8"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-2xl"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Comprehensive Features
            </h2>
            <p
              className="text-sm sm:text-base text-white/90 max-w-2xl mx-auto drop-shadow-lg px-4"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Everything you need to manage your health, all in one place
            </p>
          </motion.div>

          {/* Features Grid - Responsive Button Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 px-4">
            {allFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="group"
                >
                  <div
                    className="relative backdrop-blur-md bg-white/10 rounded-xl border border-white/20 p-4 sm:p-5 transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:shadow-lg hover:shadow-teal-500/20 cursor-default transform hover:-translate-y-1"
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`p-2.5 sm:p-3 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all duration-300 ${feature.color}`}>
                        <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <h3
                        className="text-xs sm:text-sm font-semibold text-white drop-shadow-md leading-tight"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {feature.title}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Auth Form Section - At Bottom Before Footer */}
        <motion.div
          ref={authFormRef}
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
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
        </motion.div>

        {/* Footer - Slides in from bottom with delay */}
        <motion.footer
          className="w-full text-center py-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <p className="text-white/80 text-sm sm:text-base drop-shadow-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
            © {new Date().getFullYear()} NuviaCare. All rights reserved.
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

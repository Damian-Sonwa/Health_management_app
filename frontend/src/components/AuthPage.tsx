import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Activity,
  Calendar,
  FileText,
  Award,
  Video,
  BookOpen,
  ArrowDown,
  Brain,
  Pill,
  Smartphone,
  Moon,
  Sun,
  Users,
  BarChart3,
} from "lucide-react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import AnimatedLogo from "./AnimatedLogo";

// Key app features with descriptions
const keyFeatures = [
  {
    icon: Heart,
    title: "Blood Pressure",
    description: "Helps keep track of your daily blood pressure readings",
    color: "text-red-300",
  },
  {
    icon: Activity,
    title: "Blood Glucose",
    description: "Monitor and manage your glucose levels effectively",
    color: "text-green-300",
  },
  {
    icon: Video,
    title: "Telehealth",
    description: "Connect with healthcare professionals remotely",
    color: "text-purple-300",
  },
  {
    icon: BookOpen,
    title: "Wellness Guide",
    description: "Access curated health content and wellness tips",
    color: "text-teal-300",
  },
  {
    icon: FileText,
    title: "Health Records",
    description: "Upload and securely store your medical documents",
    color: "text-pink-300",
  },
  {
    icon: Calendar,
    title: "Appointments",
    description: "Schedule and manage your healthcare appointments",
    color: "text-orange-300",
  },
  {
    icon: Award,
    title: "Gamification",
    description: "Earn badges and track your health progress",
    color: "text-yellow-300",
  },
  {
    icon: Brain,
    title: "AI Health Coach",
    description: "Get personalized health advice powered by AI",
    color: "text-indigo-300",
  },
  {
    icon: Pill,
    title: "Medication Management",
    description: "Track medications with reminders and dosage schedules",
    color: "text-violet-300",
  },
  {
    icon: Smartphone,
    title: "Device Integration",
    description: "Connect your health monitoring devices seamlessly",
    color: "text-sky-300",
  },
  {
    icon: Users,
    title: "Caregivers",
    description: "Manage family members and emergency contacts",
    color: "text-blue-300",
  },
  {
    icon: BarChart3,
    title: "Health Analytics",
    description: "View detailed insights and trends from your health data",
    color: "text-emerald-300",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

// Background slideshow images
const slideshowImages = [
  {
    src: '/images/BloodPressureMonitor.jpg',
    fallback: '/images/bp-machine.jpg',
    alt: 'Blood pressure monitor'
  },
  {
    src: '/images/glucose-machine.jpg',
    fallback: '/images/glucose-machine.jpg',
    alt: 'Glucometer'
  },
  {
    src: '/images/doctor.jpg',
    fallback: '/images/doctor.jpg',
    alt: 'Telehealth consultation'
  },
  {
    src: '/images/medical-device-header.jpg',
    fallback: '/images/Family.jpg',
    alt: 'Health and fitness'
  }
];

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const authFormRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Preload images
  useEffect(() => {
    slideshowImages.forEach((image) => {
      const img = new Image();
      img.src = image.src;
      // Preload fallback too
      const fallbackImg = new Image();
      fallbackImg.src = image.fallback;
    });
  }, []);

  // Auto-rotate slideshow every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setIsDarkMode(savedDarkMode === 'true');
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  const scrollToAuth = () => {
    authFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="min-h-screen relative flex flex-col p-4 overflow-hidden">
      {/* Dark Mode Toggle - Fixed at top right - Maximum visibility with highest z-index */}
      <motion.div
        className="fixed top-4 right-4 z-[9999]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          onClick={toggleDarkMode}
          variant="ghost"
          size="lg"
          className="backdrop-blur-xl bg-white/40 dark:bg-gray-900/40 hover:bg-white/60 dark:hover:bg-gray-900/60 border-2 border-white/60 dark:border-gray-700/60 text-gray-900 dark:text-white shadow-2xl transition-all duration-300 hover:scale-110 px-4 py-6 font-bold"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <>
              <Sun className="h-6 w-6 mr-2" />
              <span className="font-semibold">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-6 w-6 mr-2" />
              <span className="font-semibold">Dark Mode</span>
            </>
          )}
        </Button>
      </motion.div>
      {/* Full-Screen Rotating Background Slideshow */}
      <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
        {/* Background gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50" />
        
        {/* Slideshow Images - Reduced Size for Better Comprehension */}
        {slideshowImages.map((image, index) => (
          <motion.div
            key={index}
            className="absolute flex items-center justify-center"
            style={{
              width: '70%',
              height: '70%',
              maxWidth: '900px',
              maxHeight: '600px',
            }}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{
              opacity: currentSlide === index ? 1 : 0,
              scale: currentSlide === index ? 1 : 1.05,
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
            }}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-contain rounded-2xl shadow-2xl"
              style={{
                filter: 'blur(2px)',
              }}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (img.src !== `${window.location.origin}${image.fallback}`) {
                  img.src = image.fallback;
                } else {
                  img.style.display = 'none';
                }
              }}
            />
          </motion.div>
        ))}
        
        {/* Semi-transparent dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/35 dark:bg-black/45" />
        
        {/* Subtle backdrop blur for depth */}
        <div className="absolute inset-0 backdrop-blur-[1px]" />
      </div>
      
      {/* Additional gradient overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30 dark:from-black/30 dark:via-transparent dark:to-black/40 z-[1]" />
      
      <div className="relative w-full max-w-7xl mx-auto flex flex-col gap-8 z-[100] py-8">
        {/* Landing Page Section - Slides in from top */}
        <motion.div
          className="w-full space-y-8 relative"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Branding Section - Centered */}
          <div className="flex flex-col items-center justify-center min-h-[60vh] group space-y-6 relative z-10">
            {/* Brand Name with Professional Font - Poppins Bold or Montserrat ExtraBold */}
            <motion.h1 
              className="text-[32px] md:text-[48px] font-extrabold text-white drop-shadow-2xl tracking-tight"
              style={{ 
                fontFamily: "'Montserrat', 'Poppins', sans-serif",
                fontWeight: 800,
                textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 0, 0, 0.3)',
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Nuviacare Life
            </motion.h1>
            
            {/* Animated Logo */}
            <motion.div 
              className="animate-float-slow"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <AnimatedLogo size={100} className="drop-shadow-2xl transform transition-all duration-300" />
            </motion.div>
            
            {/* Tagline - Open Sans Light or Lato Regular */}
            <motion.p 
              className="text-[16px] md:text-[20px] text-white drop-shadow-lg tracking-wide text-center max-w-2xl px-4"
              style={{ 
                fontFamily: "'Open Sans', 'Lato', sans-serif",
                fontWeight: 300,
                textShadow: '1px 1px 6px rgba(0, 0, 0, 0.4), 0 0 15px rgba(0, 0, 0, 0.2)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Empowering You to Live Healthier
            </motion.p>
            {/* Description */}
            <p className="text-lg sm:text-xl md:text-2xl text-white leading-relaxed drop-shadow-2xl font-medium text-center max-w-3xl px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
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
                className="mt-4 px-8 py-6 text-lg sm:text-xl font-semibold bg-gradient-to-r from-teal-400/90 to-cyan-400/90 hover:from-teal-500 hover:to-cyan-500 text-white shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/50 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/20"
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
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-2xl"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Key Features
                </h2>
                <p
                  className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto drop-shadow-lg px-4"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Everything you need to manage your health, all in one place
                </p>
          </motion.div>

          {/* Features Grid - Key Features with Descriptions - All 12 Features Visible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-4 max-w-6xl mx-auto">
            {keyFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={`${feature.title}-${index}`}
                  variants={itemVariants}
                  className="group"
                >
                  <div
                    className="relative backdrop-blur-md bg-white/15 dark:bg-gray-900/15 rounded-xl border-2 border-white/30 dark:border-gray-700/30 p-5 sm:p-6 transition-all duration-300 hover:bg-white/20 dark:hover:bg-gray-800/20 hover:border-white/40 dark:hover:border-gray-600/40 hover:shadow-lg hover:shadow-teal-500/20 cursor-default transform hover:-translate-y-1"
                  >
                    <div className="flex flex-col items-start text-left space-y-3">
                      <div className={`p-3 rounded-lg bg-white/20 dark:bg-gray-800/20 group-hover:bg-white/30 dark:group-hover:bg-gray-700/30 transition-all duration-300 ${feature.color}`}>
                        <IconComponent className="h-6 w-6 sm:h-7 sm:w-7" />
                      </div>
                      <div className="space-y-1">
                            <h3
                              className="text-lg sm:text-xl font-bold text-white dark:text-gray-100 drop-shadow-md"
                              style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                              {feature.title}
                            </h3>
                            <p
                              className="text-sm sm:text-base text-white/90 dark:text-gray-300 leading-relaxed drop-shadow"
                              style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                              {feature.description}
                            </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Animated Separator Line */}
        <motion.div
          className="w-full max-w-4xl mx-auto px-4 py-8"
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="relative flex items-center justify-center">
            {/* Left decorative dot */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-teal-400 animate-pulse" style={{ boxShadow: '0 0 10px rgba(20, 184, 166, 0.6)' }} />
            </div>
            
            {/* Animated gradient line */}
            <div className="flex-1 h-0.5 sm:h-1 relative overflow-hidden mx-4 sm:mx-8">
              {/* Base gradient line */}
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(20, 184, 166, 0.3) 20%, rgba(239, 68, 68, 0.6) 50%, rgba(20, 184, 166, 0.3) 80%, transparent 100%)',
                }}
              />
              
              {/* Animated flowing gradient */}
              <div 
                className="absolute inset-0 animate-gradient-flow"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(20, 184, 166, 0.5) 25%, rgba(239, 68, 68, 0.8) 50%, rgba(20, 184, 166, 0.5) 75%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  width: '100%',
                  height: '100%',
                }}
              />
            </div>
            
            {/* Center heart icon */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="p-1.5 sm:p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" style={{ filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.6))' }} />
              </div>
            </div>
            
            {/* Right decorative dot */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-400 animate-pulse" style={{ boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)' }} />
            </div>
          </div>
        </motion.div>

        {/* Auth Form Section - At Bottom Before Footer */}
        <motion.div
          ref={authFormRef}
          className="w-full max-w-md mx-auto relative z-[200]"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Glassmorphism Card */}
          <div className="relative">
            {/* Enhanced glass effect background for better readability over organ */}
            <div className="absolute inset-0 backdrop-blur-2xl bg-white/15 sm:bg-white/12 rounded-3xl border border-white/30 shadow-2xl" />
            
            {/* Gradient overlay for depth and contrast */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent rounded-3xl" />
            
            {/* Additional overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-teal-900/20 to-transparent rounded-3xl" />
            
            <Card className="relative shadow-none border-0 bg-transparent">
              <CardHeader className="space-y-2 text-center pb-8">
                <CardDescription className="text-white drop-shadow-lg text-lg sm:text-xl font-medium px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
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
                        <LoginForm onSwitchToSignup={() => setActiveTab("signup")} />
                      </TabsContent>

                      <TabsContent value="signup" className="space-y-4 animate-fade-in-up">
                        <SignupForm onSwitchToSignin={() => setActiveTab("signin")} />
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
              <p className="text-white/80 text-base sm:text-lg drop-shadow-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
                © {new Date().getFullYear()} NuviaCare. All rights reserved.
              </p>
            </motion.footer>
      </div>
    </div>
  );
}

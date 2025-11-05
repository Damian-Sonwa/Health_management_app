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

// Slideshow images - using StockCake images
const slideshowImages = [
  {
    src: "/images/BloodPressureMonitor.jpg",
    alt: "Blood Pressure Monitor",
    fallback: "/images/bp-machine.jpg",
  },
  {
    src: "/images/glucose-machine.jpg",
    alt: "Glucometer",
    fallback: "/images/glucose-machine.jpg",
  },
  {
    src: "/images/doctor.jpg",
    alt: "Telehealth Consultation",
    fallback: "/images/doctor.jpg",
  },
  {
    src: "/images/Family.jpg",
    alt: "Wellness Activity",
    fallback: "/images/Family.jpg",
  },
];

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const authFormRef = useRef<HTMLDivElement>(null);

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
    <div className="h-screen flex flex-col overflow-hidden transition-all duration-500 ease-in-out">
      {/* Dark Mode Toggle - Fixed at top right */}
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

      {/* HEADER SECTION - 30% of viewport height */}
      <header className="relative flex-[3] min-h-[300px] w-full overflow-hidden flex-shrink-0">
        {/* Slideshow Background Images */}
        <div className="absolute inset-0">
          {slideshowImages.map((image, index) => (
            <img
              key={index}
              src={image.src}
              alt={image.alt}
              className={`absolute inset-0 w-full h-full object-cover ${
                index === 0 ? 'animate-slideshow-fade-1' :
                index === 1 ? 'animate-slideshow-fade-2' :
                index === 2 ? 'animate-slideshow-fade-3' :
                'animate-slideshow-fade-4'
              }`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (image.fallback && target.src !== image.fallback) {
                  target.src = image.fallback;
                } else {
                  target.style.display = 'none';
                }
              }}
            />
          ))}
        </div>

        {/* Overlay - Light/Dark Mode */}
        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 transition-all duration-500 ease-in-out" />

        {/* Header Content - Centered */}
        <div className="relative h-full flex flex-col items-center justify-center z-10 px-4">
          <motion.div
            className="flex flex-col items-center space-y-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* App Name */}
            <h1 className="font-poppins font-bold text-5xl md:text-6xl text-gray-800 dark:text-gray-100 transition-colors duration-500">
              NuviaCare
            </h1>
            {/* Animated Logo */}
            <div className="animate-float-slow">
              <AnimatedLogo size={80} className="transition-all duration-500" />
            </div>
            {/* Tagline */}
            <p className="font-lato text-lg md:text-xl font-light text-gray-800 dark:text-gray-100 transition-colors duration-500 text-center">
              Your Health, Our Priority
            </p>
          </motion.div>
        </div>
      </header>

      {/* MIDDLE SECTION - 50% of viewport height (main content area) */}
      <main className="relative flex-[5] min-h-0 w-full bg-gradient-to-b from-[#e0f7fa] to-[#f1f8e9] dark:from-[#0d1b2a] dark:to-[#1b263b] transition-all duration-500 ease-in-out overflow-y-auto">
        {/* Floating Organ Illustration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.img
            src="/anatomical-heart.svg"
            alt="Heart Illustration"
            className="absolute top-1/4 right-1/4 w-64 h-64 md:w-80 md:h-80 opacity-30 dark:opacity-20 animate-float-organ transition-opacity duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <motion.img
            src="/anatomical-pancreas.svg"
            alt="Pancreas Illustration"
            className="absolute bottom-1/4 left-1/4 w-48 h-48 md:w-64 md:h-64 opacity-30 dark:opacity-20 animate-float-organ transition-opacity duration-500"
            style={{ animationDelay: '2s' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* Middle Section Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-8">
          {/* Key Features Section - Unchanged */}
          <motion.div
            className="w-full mb-8"
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-3 font-poppins transition-colors duration-500">
                Key Features
              </h2>
              <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto px-4 font-lato transition-colors duration-500">
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
                            className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 font-poppins transition-colors duration-500"
                          >
                            {feature.title}
                          </h3>
                          <p
                            className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-lato transition-colors duration-500"
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

          {/* Auth Form Section */}
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
              {/* Enhanced glass effect background */}
              <div className="absolute inset-0 backdrop-blur-2xl bg-white/15 dark:bg-gray-900/15 rounded-3xl border border-white/30 dark:border-gray-700/30 shadow-2xl transition-all duration-500" />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent rounded-3xl transition-all duration-500" />
              
              {/* Additional overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900/20 to-transparent rounded-3xl transition-all duration-500" />
              
              <Card className="relative shadow-none border-0 bg-transparent">
                <CardHeader className="space-y-2 text-center pb-8">
                  <CardDescription className="text-gray-800 dark:text-gray-100 text-lg sm:text-xl font-medium px-4 font-lato transition-colors duration-500">
                    Sign in to your account or create a new one to get started
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="px-6 pb-8">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10 dark:bg-gray-900/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 transition-all duration-500">
                      <TabsTrigger 
                        value="signin" 
                        className="data-[state=active]:bg-white/20 dark:data-[state=active]:bg-gray-800/20 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 font-medium transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-poppins"
                      >
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger 
                        value="signup"
                        className="data-[state=active]:bg-white/20 dark:data-[state=active]:bg-gray-800/20 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/30 font-medium transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-poppins"
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
        </div>
      </main>

      {/* BOTTOM SECTION - 20% of viewport height (footer) */}
      <footer className="relative flex-[2] min-h-[150px] w-full bg-gradient-to-b from-[#f1f8e9] to-[#e8f5e9] dark:from-[#1b263b] dark:to-[#0f1419] border-t border-gray-200 dark:border-gray-800 transition-all duration-500 ease-in-out flex-shrink-0">
        <div className="relative h-full flex items-center justify-center px-4">
          <motion.div
            className="w-full text-center py-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <p className="text-gray-800 dark:text-gray-100 text-base sm:text-lg font-lato transition-colors duration-500">
              © {new Date().getFullYear()} NuviaCare. All rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}

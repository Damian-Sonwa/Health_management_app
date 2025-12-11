import React, { useState, useRef, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
} from "lucide-react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import AnimatedLogo from "./AnimatedLogo";

// Available images from the project folder
// Hero carousel images (excluding those used in feature cards)
// Only include images that exist in frontend/public/images/
// Feature cards use: BloodPressureMonitor.jpg, isens-usa-ohcYbJE0bMA-unsplash.jpg (glucose), wrist-watch.png (device integration),
// StockCake-telehealth_Images_and_Photos_1762334079, StockCake-medications_Images_and_Photos_1762333991, 
// StockCake-personal_health_tracking_and_medication_management_Images_and_Photos_1762335788,
// StockCake-home_exercise_for_health_management_Images_and_Photos_1762335939,
// Family.jpg, medical-device-header.jpg
const heroImages = [
  {
    src: "/images/doctor.jpg",
    alt: "Doctor Consultation",
    fallback: "/images/bp-machine.jpg"
  },
  {
    src: "/images/bp-machine.jpg",
    alt: "Blood Pressure Machine",
    fallback: "/images/doctor.jpg"
  },
  {
    src: "/images/PatientAvatar.jpg",
    alt: "Patient Care",
    fallback: "/images/doctor.jpg"
  },
  {
    src: "/images/profilepicture.jpg",
    alt: "Healthcare Professional",
    fallback: "/images/doctor.jpg"
  },
  {
    src: "/images/StockCake-blood_pressure_monitoring_Collections_1765361165.jpg",
    alt: "Blood Pressure Monitoring",
    fallback: "/images/bp-machine.jpg"
  },
  {
    src: "/images/StockCake-blood_pressure_monitoring_Collections_1765361197.jpg",
    alt: "Blood Pressure Monitoring",
    fallback: "/images/bp-machine.jpg"
  }
];

// Key app features with images and detailed descriptions
const keyFeatures = [
  {
    title: "Blood Pressure Tracking",
    image: "/images/BloodPressureMonitor.jpg",
    fallback: "/images/bp-machine.jpg",
    description: "Monitor and track your daily blood pressure readings with detailed analytics. Get instant insights into your cardiovascular health with automated tracking, trend analysis, and personalized recommendations to help you maintain optimal blood pressure levels.",
  },
  {
    title: "Glucose Monitoring",
    image: "/images/isens-usa-ohcYbJE0bMA-unsplash.jpg",
    fallback: "/images/BloodPressureMonitor.jpg",
    description: "Keep track of your blood glucose levels and maintain optimal health. Record your readings throughout the day, view historical trends, and receive alerts when your levels need attention. Perfect for managing diabetes and pre-diabetes conditions.",
  },
  {
    title: "Telehealth Consultations",
    image: "/images/StockCake-telehealth_Images_and_Photos_1762334079.jpg",
    fallback: "/images/doctor.jpg",
    description: "Connect with healthcare professionals remotely via secure video calls. Schedule virtual appointments, consult with doctors from the comfort of your home, and receive expert medical advice without leaving your residence. Available 24/7 for your convenience.",
  },
  {
    title: "Medication Management",
    image: "/images/StockCake-medications_Images_and_Photos_1762333991.jpg",
    fallback: "/images/doctor.jpg",
    description: "Track medications with smart reminders and dosage schedules. Never miss a dose with automated alerts, track medication history, manage multiple prescriptions, and receive refill reminders. Stay organized and ensure medication adherence for better health outcomes.",
  },
  {
    title: "Health Records Management",
    image: "/images/StockCake-personal_health_tracking_and_medication_management_Images_and_Photos_1762335788.jpg",
    fallback: "/images/medical-device-header.jpg",
    description: "Securely store and access your medical documents and records in one centralized location. Upload lab results, prescriptions, medical reports, and insurance documents. Share records with healthcare providers instantly and maintain a complete health history.",
  },
  {
    title: "Device Integration",
    image: "/images/wristwatch-person.png",
    fallback: "/images/medical-device-header.jpg",
    description: "Connect your health monitoring devices for automatic data synchronization. Seamlessly integrate with blood pressure monitors, glucose meters, fitness trackers, and smart scales. Your health data is automatically recorded and analyzed without manual entry.",
  },
  {
    title: "Home Exercise & Wellness",
    image: "/images/StockCake-home_exercise_for_health_management_Images_and_Photos_1762335939.jpg",
    fallback: "/images/Family.jpg",
    description: "Access personalized exercise routines and wellness programs designed for your health needs. Track your physical activity, set fitness goals, and follow guided workout sessions. Improve your overall wellness with evidence-based exercise recommendations.",
  },
  {
    title: "Caregiver Support",
    image: "/images/Family.jpg",
    fallback: "/images/doctor.jpg",
    description: "Manage family members' health and share health data with trusted caregivers. Monitor elderly parents' vitals, track children's health records, and coordinate care with family members. Enable emergency contacts to access critical health information when needed.",
  },
  {
    title: "Health Analytics & Insights",
    image: "/images/medical-device-header.jpg",
    fallback: "/images/BloodPressureMonitor.jpg",
    description: "View detailed insights and trends from your health data with comprehensive analytics. Understand patterns in your health metrics, identify areas for improvement, and track progress toward your health goals. Get personalized recommendations based on your data.",
  },
];

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const authFormRef = useRef<HTMLDivElement>(null);

  // Auto-flip images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        setIsFlipping(false);
      }, 500); // Half of flip animation duration
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const scrollToAuth = () => {
    authFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 font-sans">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/40 to-gray-800/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left: Heading, Subtext, Buttons */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-0.5 sm:mb-1">
                <AnimatedLogo size={48} className="sm:w-[56px] sm:h-[56px] transition-all duration-500" />
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white font-sans leading-tight">
                  NuviaCare
                </h1>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight font-sans mb-2 sm:mb-3">
                Your Health, Our Priority
              </h2>

              <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-xl mx-auto lg:mx-0 font-sans mb-4 sm:mb-6">
                Comprehensive health management platform for tracking vitals, managing medications, scheduling consultations, and staying in control of your wellness journey.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Button
                  onClick={scrollToAuth}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-sans"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  onClick={scrollToFeatures}
                  variant="outline"
                  className="border-2 border-white text-white bg-white/10 backdrop-blur-sm hover:bg-white hover:text-gray-900 px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-300 font-sans"
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Right: Flipping Image Carousel */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px] md:h-[500px]">
                {/* Image container with 3D flip effect */}
                <div 
                  className="relative w-full h-full"
                  style={{
                    perspective: '1000px',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {heroImages.map((image, index) => {
                    const isActive = index === currentImageIndex;
                    const isNext = index === (currentImageIndex + 1) % heroImages.length;
                    const rotation = isFlipping && isActive ? 180 : 0;
                    const opacity = isActive ? 1 : isNext && isFlipping ? 0.5 : 0;
                    
                    return (
                      <div
              key={index}
                        className="absolute inset-0 transition-all duration-1000 ease-in-out"
              style={{
                          transform: `rotateY(${rotation}deg)`,
                          opacity: opacity,
                          backfaceVisibility: 'hidden',
                          zIndex: isActive ? 10 : isNext && isFlipping ? 5 : 1
                        }}
                      >
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover rounded-2xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                            target.src = image.fallback;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent rounded-2xl" />
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Image indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {heroImages.slice(0, 5).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsFlipping(true);
                      setTimeout(() => {
                        setCurrentImageIndex(index);
                        setIsFlipping(false);
                      }, 500);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentImageIndex === index 
                        ? 'w-8 bg-white' 
                        : 'w-2 bg-white/50 hover:bg-white/70'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-400/30 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-400/30 rounded-full blur-2xl" />
            </div>
          </div>
          </div>
      </header>

      {/* Features Section */}
      <section id="features-section" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-sans">
                  Key Features
                </h2>
            <p className="text-lg text-white/90 leading-relaxed max-w-2xl mx-auto font-sans">
                  Everything you need to manage your health, all in one place
                </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFeatures.map((feature) => {
              return (
                <div
                  key={feature.title}
                  className="group"
                >
                  <Card className="h-full bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-default">
                    <CardContent className="p-0">
                      <div className="flex flex-col">
                        {/* Feature Image */}
                        <div className="relative w-full h-48 overflow-hidden bg-gray-100/70">
                          <img
                            src={feature.image}
                            alt={feature.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = feature.fallback;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 to-transparent" />
                      </div>
                        
                        {/* Content */}
                        <div className="p-6 space-y-3">
                          <h3 className="text-xl font-bold text-gray-900 font-sans">
                              {feature.title}
                            </h3>
                          <p className="text-sm text-gray-700 leading-relaxed font-sans">
                              {feature.description}
                            </p>
                      </div>
                    </div>
                    </CardContent>
                  </Card>
                  </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-sans">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-lg text-white/90 leading-relaxed max-w-2xl mx-auto mb-8 font-sans">
              Join thousands of users who are already managing their health better with NuviaCare. Start your wellness journey today.
            </p>
            <Button
              onClick={scrollToAuth}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-10 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-sans"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Artistic Divider */}
      <div className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Gradient wavy divider */}
          <div className="relative">
            <svg
              className="w-full h-16"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0,60 Q300,20 600,60 T1200,60 L1200,120 L0,120 Z"
                fill="url(#dividerGradient)"
                opacity="0.3"
              />
              <path
                d="M0,60 Q300,100 600,60 T1200,60"
                stroke="url(#dividerGradient)"
                strokeWidth="3"
                fill="none"
                className="drop-shadow-lg"
              />
              <defs>
                <linearGradient id="dividerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#9333EA" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>
            {/* Decorative dots */}
            <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full opacity-60 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse [animation-delay:300ms]" />
            <div className="absolute top-1/2 left-3/4 transform -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full opacity-60 animate-pulse [animation-delay:700ms]" />
            </div>
              </div>
            </div>
            
      {/* Auth Form Section - Before Footer */}
      <main className="py-20 px-4 sm:px-6 lg:px-8" ref={authFormRef}>
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="w-full sm:w-96 md:w-[500px] lg:w-[550px]">
            <Card className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <CardHeader className="space-y-2 text-center pb-6 pt-8 px-6 sm:px-8">
                <CardTitle className="text-3xl font-bold text-gray-900 font-sans">
                  Welcome to NuviaCare
                </CardTitle>
                <CardDescription className="text-base text-gray-600 font-sans">
                  Sign in to your account or create a new one to get started
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-6 sm:px-8 pb-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 rounded-lg p-1">
                    <TabsTrigger 
                      value="signin" 
                    className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md font-medium transition-all duration-300 text-gray-700 hover:text-gray-900 rounded-md"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup"
                    className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md font-medium transition-all duration-300 text-gray-700 hover:text-gray-900 rounded-md"
                    >
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                <TabsContent value="signin" className="space-y-4">
                        <LoginForm onSwitchToSignup={() => setActiveTab("signup")} />
                      </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                        <SignupForm onSwitchToSignin={() => setActiveTab("signin")} />
                      </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8 border-t border-white/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <AnimatedLogo size={40} />
              <h3 className="text-2xl font-bold text-white font-sans">NuviaCare</h3>
            </div>
            <p className="text-base text-white font-sans">
                © {new Date().getFullYear()} NuviaCare. All rights reserved.
              </p>
            <p className="text-sm text-white/90 mt-2 font-sans">
              Your comprehensive health management platform
            </p>
          </div>
      </div>
      </footer>
    </div>
  );
}

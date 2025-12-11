import React from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeatureCategory {
  title: string;
  icon: React.ReactNode;
  features: FeatureItem[];
  color: string;
}

const featureCategories: FeatureCategory[] = [
  {
    title: "Core Health Tracking",
    icon: <Heart className="h-6 w-6" />,
    color: "from-red-500/20 to-pink-500/20",
    features: [
      {
        icon: <Heart className="h-5 w-5" />,
        title: "Blood Pressure Monitoring",
        description: "Track systolic and diastolic readings with trend analysis",
      },
      {
        icon: <Activity className="h-5 w-5" />,
        title: "Blood Glucose Tracking",
        description: "Monitor glucose levels with target comparisons",
      },
      {
        icon: <Activity className="h-5 w-5" />,
        title: "Vital Signs",
        description: "Record heart rate, temperature, oxygen levels, weight, and BMI",
      },
      {
        icon: <Pill className="h-5 w-5" />,
        title: "Medication Management",
        description: "Track active and inactive medications with reminders",
      },
      {
        icon: <Calendar className="h-5 w-5" />,
        title: "Appointment Scheduling",
        description: "Book and manage healthcare appointments",
      },
      {
        icon: <FileText className="h-5 w-5" />,
        title: "Health Records",
        description: "Upload and store medical documents securely",
      },
    ],
  },
  {
    title: "Advanced Analytics",
    icon: <BarChart3 className="h-6 w-6" />,
    color: "from-blue-500/20 to-cyan-500/20",
    features: [
      {
        icon: <BarChart3 className="h-5 w-5" />,
        title: "Weekly Summary",
        description: "Automatic 7-day health progress reports",
      },
      {
        icon: <TrendingUp className="h-5 w-5" />,
        title: "Interactive Charts",
        description: "Line charts, bar charts, and pie charts for data visualization",
      },
      {
        icon: <Brain className="h-5 w-5" />,
        title: "Health Insights",
        description: "AI-powered personalized health recommendations",
      },
      {
        icon: <TrendingUp className="h-5 w-5" />,
        title: "Trend Analysis",
        description: "Identify patterns in your health data over time",
      },
    ],
  },
  {
    title: "Gamification & Motivation",
    icon: <Award className="h-6 w-6" />,
    color: "from-yellow-500/20 to-orange-500/20",
    features: [
      {
        icon: <Award className="h-5 w-5" />,
        title: "Achievement Badges",
        description: "Earn badges for consistency and healthy readings",
      },
      {
        icon: <TrendingUp className="h-5 w-5" />,
        title: "Progress Tracking",
        description: "Visual progress indicators and milestones",
      },
    ],
  },
  {
    title: "Telehealth Integration",
    icon: <Video className="h-6 w-6" />,
    color: "from-purple-500/20 to-indigo-500/20",
    features: [
      {
        icon: <Stethoscope className="h-5 w-5" />,
        title: "Doctor Directory",
        description: "Browse doctors by specialty and availability",
      },
      {
        icon: <Video className="h-5 w-5" />,
        title: "Video Consultations",
        description: "Zoom-integrated video calls with healthcare providers",
      },
      {
        icon: <Phone className="h-5 w-5" />,
        title: "Phone Consultations",
        description: "Direct phone call functionality",
      },
      {
        icon: <MessageCircle className="h-5 w-5" />,
        title: "Real-Time Chat",
        description: "Instant messaging with healthcare providers",
      },
    ],
  },
  {
    title: "Care Management",
    icon: <Users className="h-6 w-6" />,
    color: "from-teal-500/20 to-cyan-500/20",
    features: [
      {
        icon: <Users className="h-5 w-5" />,
        title: "Caregivers",
        description: "Add and manage family members and caregivers",
      },
      {
        icon: <ClipboardList className="h-5 w-5" />,
        title: "Care Plans",
        description: "Create and track personalized care plans",
      },
      {
        icon: <Pill className="h-5 w-5" />,
        title: "Medication Requests",
        description: "Request prescriptions from providers",
      },
      {
        icon: <Smartphone className="h-5 w-5" />,
        title: "Device Integration",
        description: "Connect health monitoring devices",
      },
    ],
  },
  {
    title: "AI & Wellness",
    icon: <Brain className="h-6 w-6" />,
    color: "from-green-500/20 to-emerald-500/20",
    features: [
      {
        icon: <Brain className="h-5 w-5" />,
        title: "AI Health Coach",
        description: "Get personalized health advice",
      },
      {
        icon: <BookOpen className="h-5 w-5" />,
        title: "Wellness Guide",
        description: "Access curated health content",
      },
      {
        icon: <BookOpen className="h-5 w-5" />,
        title: "Educational Resources",
        description: "Learn about cardiovascular health, diabetes, nutrition",
      },
      {
        icon: <PlayCircle className="h-5 w-5" />,
        title: "Exercise Videos",
        description: "Guided workout and yoga sessions",
      },
    ],
  },
  {
    title: "Real-Time Features",
    icon: <Zap className="h-6 w-6" />,
    color: "from-cyan-500/20 to-blue-500/20",
    features: [
      {
        icon: <Zap className="h-5 w-5" />,
        title: "Live Updates",
        description: "Socket.IO powered real-time data synchronization",
      },
      {
        icon: <Smartphone className="h-5 w-5" />,
        title: "Multi-Device Sync",
        description: "Changes reflect instantly across all logged-in devices",
      },
      {
        icon: <WifiOff className="h-5 w-5" />,
        title: "Offline Mode",
        description: "Access cached data without internet",
      },
    ],
  },
  {
    title: "Accessibility & More",
    icon: <Globe className="h-6 w-6" />,
    color: "from-indigo-500/20 to-purple-500/20",
    features: [
      {
        icon: <Globe className="h-5 w-5" />,
        title: "Multilingual Support",
        description: "English, Spanish, French, German",
      },
      {
        icon: <Moon className="h-5 w-5" />,
        title: "Dark Mode",
        description: "Full dark theme support",
      },
      {
        icon: <Download className="h-5 w-5" />,
        title: "PWA",
        description: "Install as a native app on any device",
      },
      {
        icon: <Shield className="h-5 w-5" />,
        title: "Secure & Private",
        description: "Your health data is encrypted and protected",
      },
    ],
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

const categoryVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function FeaturesSection() {
  return (
    <motion.div
      className="w-full max-w-7xl mx-auto px-4 py-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      {/* Section Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Comprehensive Health Management
        </h2>
        <p
          className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto drop-shadow-lg"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Everything you need to take control of your health, all in one place
        </p>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {featureCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.title}
            className="group relative"
            variants={categoryVariants}
          >
            <div className="relative h-full backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/20">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color} border border-white/20`}>
                  <div className="text-white">
                    {category.icon}
                  </div>
                </div>
                <h3
                  className="text-xl font-bold text-white drop-shadow-lg"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {category.title}
                </h3>
              </div>

              {/* Features List */}
              <ul className="space-y-3">
                {category.features.map((feature, featureIndex) => (
                  <motion.li
                    key={feature.title}
                    className="flex items-start gap-3 group/item"
                    variants={itemVariants}
                    custom={featureIndex}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mt-0.5 p-1.5 rounded-md bg-white/10 text-teal-300 group-hover/item:bg-white/20 transition-colors flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h4
                        className="text-sm sm:text-base font-semibold text-white mb-1 drop-shadow"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {feature.title}
                      </h4>
                      <p
                        className="text-xs sm:text-sm text-white/80 leading-relaxed drop-shadow"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}


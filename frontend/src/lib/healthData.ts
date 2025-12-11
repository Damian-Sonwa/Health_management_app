export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  bloodType: string;
  avatar: string;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  allergies: string[];
  medications: string[];
  conditions: string[];
}

export interface VitalReading {
  id: string;
  type: 'blood_pressure' | 'heart_rate' | 'glucose' | 'temperature' | 'weight';
  value: string;
  timestamp: Date;
  status: 'normal' | 'borderline' | 'alert';
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  taken: boolean[];
  color: string;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  connected: boolean;
  lastSync: Date;
  batteryLevel?: number;
}

export interface WellnessActivity {
  id: string;
  category: 'exercise' | 'yoga' | 'nutrition' | 'breathing' | 'sleep';
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  image: string;
  hasVideo?: boolean;
  videoUrl?: string;
  videoDescription?: string;
  hasAudio?: boolean;
  audioUrl?: string;
  hasMealPlan?: boolean;
  mealPlan?: MealPlan;
}

export interface MealPlan {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks: string[];
  tips: string[];
}

// Mock data
export const mockPatient: PatientProfile = {
  id: '1',
  name: 'Sarah Johnson',
  age: 34,
  bloodType: 'A+',
  avatar: '/images/PatientAvatar.jpg',
  healthStatus: 'good',
  allergies: ['Penicillin', 'Shellfish'],
  medications: ['Lisinopril 10mg', 'Metformin 500mg'],
  conditions: ['Hypertension', 'Type 2 Diabetes']
};

export const mockVitals: VitalReading[] = [
  { id: '1', type: 'blood_pressure', value: '120/80', timestamp: new Date(), status: 'normal' },
  { id: '2', type: 'heart_rate', value: '72', timestamp: new Date(), status: 'normal' },
  { id: '3', type: 'glucose', value: '95', timestamp: new Date(), status: 'normal' },
  { id: '4', type: 'weight', value: '65.5', timestamp: new Date(), status: 'normal' }
];

export const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    times: ['08:00'],
    taken: [true],
    color: 'bg-blue-500'
  },
  {
    id: '2',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    times: ['08:00', '20:00'],
    taken: [true, false],
    color: 'bg-green-500'
  }
];

export const mockDevices: Device[] = [
  {
    id: '1',
    name: 'Apple Watch',
    type: 'Fitness Tracker',
    connected: true,
    lastSync: new Date(),
    batteryLevel: 85
  },
  {
    id: '2',
    name: 'Blood Pressure Monitor',
    type: 'Medical Device',
    connected: true,
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '3',
    name: 'Glucose Meter',
    type: 'Medical Device',
    connected: false,
    lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000)
  }
];

export const mockWellnessActivities: WellnessActivity[] = [
  {
    id: '1',
    category: 'exercise',
    title: 'Morning Walk',
    description: '30-minute brisk walk',
    duration: '30 min',
    completed: true,
    image: '/images/StockCake-home_exercise_for_health_management_Images_and_Photos_1762335939.jpg',
    hasVideo: true,
    videoUrl: 'https://example.com/morning-walk-video',
    videoDescription: 'Join our fitness instructor for a guided 30-minute morning walk routine. Perfect for beginners and those looking to start their day with gentle exercise. This session includes warm-up, walking techniques, and cool-down stretches.'
  },
  {
    id: '2',
    category: 'yoga',
    title: 'Gentle Yoga',
    description: 'Relaxing yoga session',
    duration: '20 min',
    completed: false,
    image: '/images/StockCake-home_exercise_for_health_management_Images_and_Photos_1762335939.jpg',
    hasVideo: true,
    videoUrl: 'https://example.com/gentle-yoga-video',
    videoDescription: 'Experience a calming 20-minute gentle yoga flow designed to reduce stress and improve flexibility. This session includes basic poses, breathing exercises, and meditation techniques suitable for all levels.'
  },
  {
    id: '3',
    category: 'nutrition',
    title: 'Healthy Breakfast Plan',
    description: 'Complete daily meal planning guide',
    duration: '15 min',
    completed: true,
    image: '/images/StockCake-health_management_Collections_1765360976.jpg',
    hasMealPlan: true,
    mealPlan: {
      breakfast: [
        'Greek yogurt with berries and granola',
        'Oatmeal with banana and nuts',
        'Avocado toast with poached egg',
        'Smoothie bowl with spinach and fruits'
      ],
      lunch: [
        'Quinoa salad with vegetables',
        'Grilled chicken with steamed broccoli',
        'Lentil soup with whole grain bread',
        'Mediterranean wrap with hummus'
      ],
      dinner: [
        'Baked salmon with sweet potato',
        'Vegetable stir-fry with brown rice',
        'Lean beef with roasted vegetables',
        'Chickpea curry with quinoa'
      ],
      snacks: [
        'Mixed nuts and seeds',
        'Apple slices with almond butter',
        'Carrot sticks with hummus',
        'Greek yogurt with honey'
      ],
      tips: [
        'Drink 8 glasses of water daily',
        'Include protein in every meal',
        'Choose whole grains over refined',
        'Eat colorful fruits and vegetables',
        'Limit processed foods and sugar'
      ]
    }
  },
  {
    id: '4',
    category: 'exercise',
    title: 'Cardio Workout',
    description: 'High-energy cardio session',
    duration: '25 min',
    completed: false,
    image: '/images/StockCake-home_exercise_for_health_management_Images_and_Photos_1762335939.jpg',
    hasVideo: true,
    videoUrl: 'https://example.com/cardio-workout-video',
    videoDescription: 'Get your heart pumping with this energizing 25-minute cardio workout. Includes jumping jacks, burpees, and high-knee exercises designed to boost your cardiovascular health and burn calories.'
  },
  {
    id: '5',
    category: 'yoga',
    title: 'Power Yoga',
    description: 'Dynamic yoga flow',
    duration: '35 min',
    completed: false,
    image: '/images/StockCake-home_exercise_for_health_management_Images_and_Photos_1762335939.jpg',
    hasVideo: true,
    videoUrl: 'https://example.com/power-yoga-video',
    videoDescription: 'Challenge yourself with this dynamic 35-minute power yoga session. Features flowing sequences, strength-building poses, and balance challenges to enhance your physical and mental well-being.'
  },
  {
    id: '6',
    category: 'breathing',
    title: 'Deep Breathing with Calm Music',
    description: '4-7-8 breathing technique with relaxing sounds',
    duration: '10 min',
    completed: false,
    image: '/images/StockCake-health_management_Collections_1765361049.jpg',
    hasAudio: true,
    audioUrl: 'https://example.com/calm-breathing-music.mp3',
    videoDescription: 'Practice the 4-7-8 breathing technique while listening to calming nature sounds and soft instrumental music. This guided session helps reduce stress and promote relaxation.'
  },
  {
    id: '7',
    category: 'breathing',
    title: 'Mindful Breathing',
    description: 'Guided meditation with soothing music',
    duration: '15 min',
    completed: false,
    image: '/images/StockCake-health_management_Collections_1765361049.jpg',
    hasAudio: true,
    audioUrl: 'https://example.com/mindful-breathing-music.mp3',
    videoDescription: 'Join this mindful breathing session accompanied by peaceful ambient music. Perfect for stress relief and mental clarity.'
  }
];

export const getHealthStatusColor = (status: string) => {
  switch (status) {
    case 'excellent': return 'text-green-600 border-green-200';
    case 'good': return 'text-blue-600 border-blue-200';
    case 'fair': return 'text-yellow-600 border-yellow-200';
    case 'poor': return 'text-red-600 border-red-200';
    default: return 'text-gray-600 border-gray-200';
  }
};

export const getVitalStatusColor = (status: string) => {
  switch (status) {
    case 'normal': return 'text-green-600 bg-green-50 border-green-200';
    case 'borderline': return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'alert': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};
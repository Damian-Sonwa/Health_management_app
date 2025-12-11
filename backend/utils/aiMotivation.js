// AI Motivation and Response Generator
// This creates context-aware motivational messages based on user's health data

const motivationalMessages = {
  greeting: [
    "Hello! I'm here to support your health journey. How can I help you today?",
    "Welcome back! Ready to continue your amazing health progress?",
    "Hi there! Let's make today another step towards better health!",
    "Great to see you! Your commitment to health monitoring is inspiring!"
  ],
  
  bloodPressure: {
    good: [
      "Excellent work! Your blood pressure readings are in a healthy range. Keep up the great habits! 🎉",
      "Fantastic! Your consistent monitoring is paying off. Your blood pressure is looking great!",
      "You're doing wonderfully! These readings show your dedication to health management."
    ],
    improving: [
      "I notice your blood pressure is improving! Your efforts are making a real difference. Keep it up! 📈",
      "Progress! Your readings are trending in the right direction. You're on the right path!",
      "Great improvement! Your consistent monitoring and healthy choices are working."
    ],
    needsAttention: [
      "I see your blood pressure needs some attention. Remember to take your medication, reduce sodium, and manage stress. You've got this! 💪",
      "Let's focus on bringing these numbers down. Small daily actions like deep breathing and light exercise can help.",
      "Your readings suggest we should stay vigilant. Consider checking in with your doctor and maintaining your medication schedule."
    ]
  },
  
  bloodGlucose: {
    good: [
      "Your blood glucose levels are excellent! Your diet and medication management are spot-on! 🌟",
      "Superb control! These glucose readings show your dedication. Keep making those healthy choices!",
      "Perfect range! Your consistent monitoring is helping you maintain great glucose control."
    ],
    improving: [
      "Your glucose levels are improving! Your dietary changes are making a difference. 📊",
      "Progress is clear! Keep up with your current routine - it's working!",
      "Great trend! Your blood sugar management is getting better day by day."
    ],
    needsAttention: [
      "Let's work on stabilizing these glucose levels. Remember to balance carbs, stay hydrated, and take medications on time. 💙",
      "These readings suggest we need to refocus. Have you been tracking your meals and taking medications consistently?",
      "Your glucose needs attention. Consider timing your meals, monitoring carb intake, and staying active."
    ]
  },
  
  streak: {
    1: "Day 1 of your streak! Every journey begins with a single step. 🌱",
    3: "3 days in a row! You're building a healthy habit. Keep going! 🔥",
    7: "One week streak! You're proving your commitment. Proud of you! 🎯",
    14: "Two weeks strong! Your consistency is remarkable! 💪",
    30: "30-day streak! You're a health champion! This is life-changing! 🏆",
    60: "60 days! You've built an incredible routine. Your dedication is inspiring! 🌟",
    90: "90-day milestone! You're a true health warrior! Keep shining! ✨",
    180: "6 months streak! Phenomenal! You've transformed your health habits! 🎊",
    365: "ONE YEAR STREAK! Absolutely amazing! You're a health hero! 👑"
  },
  
  motivation: [
    "Remember: Every reading you take is an act of self-care. You're worth it! 💖",
    "Small daily improvements lead to stunning long-term results. Keep going!",
    "Your health journey is unique. Progress, not perfection, is what matters.",
    "Each day you monitor your health, you're adding quality years to your life.",
    "You're not just tracking numbers - you're taking control of your wellbeing!",
    "Consistency beats perfection. You're doing great by showing up today!",
    "Your future self will thank you for the care you're taking today.",
    "Every measurement is data that empowers you. Knowledge is power!"
  ],
  
  achievements: {
    firstReading: "🎉 First reading recorded! You've taken the first step to better health!",
    weekComplete: "🌟 Week completed! You're building momentum!",
    monthComplete: "🏆 Month milestone! Your dedication is paying off!",
    perfectWeek: "💯 Perfect week! All daily goals achieved. You're unstoppable!",
    levelUp: "⭐ Level up! Your consistent efforts have earned you a new level!",
    streakRecord: "🔥 New streak record! You've never been this consistent. Amazing!"
  },
  
  tips: {
    bloodPressure: [
      "💡 Tip: Taking deep breaths for 5 minutes before measuring can give more accurate readings.",
      "💡 Tip: Reduce salt intake by choosing fresh foods over processed ones.",
      "💡 Tip: Regular walking for 30 minutes can significantly improve blood pressure.",
      "💡 Tip: Measure at the same time daily for consistent tracking."
    ],
    bloodGlucose: [
      "💡 Tip: Pairing carbs with protein helps stabilize blood sugar levels.",
      "💡 Tip: Test at consistent times to identify patterns in your glucose levels.",
      "💡 Tip: Stay hydrated! Water helps regulate blood sugar.",
      "💡 Tip: A 10-minute walk after meals can lower post-meal glucose spikes."
    ]
  },
  
  encouragement: [
    "You're doing better than you think! Every small action counts.",
    "Tough day? That's okay. Tomorrow is a fresh start!",
    "Your commitment to health is admirable. Keep believing in yourself!",
    "Progress isn't always linear, but you're moving forward!",
    "You've come so far! Look back at where you started.",
    "Challenges are opportunities to prove your strength. You've got this!",
    "Remember why you started. Your health goals are worth it!",
    "You're stronger than your obstacles. Keep pushing forward!"
  ]
};

// Generate AI response based on context
function generateAIResponse(userMessage, userStats = {}) {
  const message = userMessage.toLowerCase();
  
  // Greeting
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return getRandomMessage(motivationalMessages.greeting);
  }
  
  // Blood pressure inquiry
  if (message.includes('blood pressure') || message.includes('bp')) {
    if (userStats.recentBP) {
      const status = analyzeBPStatus(userStats.recentBP);
      return motivationalMessages.bloodPressure[status][Math.floor(Math.random() * motivationalMessages.bloodPressure[status].length)];
    }
    return getRandomMessage(motivationalMessages.tips.bloodPressure);
  }
  
  // Blood glucose inquiry
  if (message.includes('glucose') || message.includes('sugar') || message.includes('diabetes')) {
    if (userStats.recentGlucose) {
      const status = analyzeGlucoseStatus(userStats.recentGlucose);
      return motivationalMessages.bloodGlucose[status][Math.floor(Math.random() * motivationalMessages.bloodGlucose[status].length)];
    }
    return getRandomMessage(motivationalMessages.tips.bloodGlucose);
  }
  
  // Motivation request
  if (message.includes('motivat') || message.includes('inspire') || message.includes('encourage')) {
    return getRandomMessage(motivationalMessages.motivation);
  }
  
  // Feeling down
  if (message.includes('tired') || message.includes('hard') || message.includes('difficult') || message.includes('struggling')) {
    return getRandomMessage(motivationalMessages.encouragement);
  }
  
  // Streak inquiry
  if (message.includes('streak') && userStats.currentStreak) {
    const streakMessage = motivationalMessages.streak[userStats.currentStreak] || 
      `${userStats.currentStreak} days strong! Keep up the amazing consistency! 🔥`;
    return streakMessage;
  }
  
  // Tips request
  if (message.includes('tip') || message.includes('advice') || message.includes('help')) {
    const category = message.includes('pressure') ? 'bloodPressure' : 
                    message.includes('glucose') || message.includes('sugar') ? 'bloodGlucose' : 
                    Math.random() > 0.5 ? 'bloodPressure' : 'bloodGlucose';
    return getRandomMessage(motivationalMessages.tips[category]);
  }
  
  // Progress inquiry
  if (message.includes('progress') || message.includes('doing')) {
    if (userStats.totalPoints) {
      return `You're doing amazing! You've earned ${userStats.totalPoints} points and are at level ${userStats.level || 1}. Your dedication shows! 🌟`;
    }
    return "You're making progress every day! Keep up the great work!";
  }
  
  // Default motivational response
  return getRandomMessage([
    ...motivationalMessages.motivation,
    ...motivationalMessages.encouragement
  ]);
}

function getRandomMessage(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}

function analyzeBPStatus(reading) {
  // Assuming reading has systolic/diastolic or single value
  const systolic = reading.systolic || reading.value;
  if (systolic < 120) return 'good';
  if (systolic < 140) return 'improving';
  return 'needsAttention';
}

function analyzeGlucoseStatus(reading) {
  const value = reading.value;
  if (value >= 70 && value <= 140) return 'good';
  if (value > 140 && value <= 180) return 'improving';
  return 'needsAttention';
}

function generateAchievementMessage(achievement) {
  const { type, category, name } = achievement;
  
  if (motivationalMessages.achievements[type]) {
    return motivationalMessages.achievements[type];
  }
  
  return `🎉 Achievement Unlocked: ${name}! You're making incredible progress!`;
}

module.exports = {
  generateAIResponse,
  generateAchievementMessage,
  motivationalMessages
};


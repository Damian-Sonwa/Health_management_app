# 🏥 NuviaCare - Comprehensive Health Management System

![NuviaCare Logo](frontend/public/nuviacare-logo.png)

**NuviaCare** is a modern, full-stack Progressive Web Application (PWA) designed to empower individuals to take control of their health through comprehensive tracking, real-time monitoring, and intelligent insights. Built specifically for blood pressure and blood glucose management, NuviaCare provides a seamless experience across all devices.

## 🌐 Live Demo

**🔗 [https://nuviacare-life.netlify.app](https://nuviacare-life.netlify.app)**

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Real-Time Features](#-real-time-features)
- [Multilingual Support](#-multilingual-support)
- [PWA Features](#-pwa-features)
- [Analytics & Gamification](#-analytics--gamification)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🩺 Core Health Tracking
- **Blood Pressure Monitoring**: Track systolic and diastolic readings with trend analysis
- **Blood Glucose Tracking**: Monitor glucose levels with target comparisons
- **Vital Signs**: Record heart rate, temperature, oxygen levels, weight, and BMI
- **Medication Management**: Track active and inactive medications with reminders
- **Appointment Scheduling**: Book and manage healthcare appointments
- **Health Records**: Upload and store medical documents securely

### 📊 Advanced Analytics
- **Weekly Summary**: Automatic 7-day health progress reports
- **Interactive Charts**: Line charts, bar charts, and pie charts for data visualization
- **Health Insights**: AI-powered personalized health recommendations
- **Trend Analysis**: Identify patterns in your health data over time

### 🏆 Gamification & Motivation
- **Achievement Badges**:
  - 🔥 7-Day Streak: Track every day for a week
  - ⚔️ 5-Day Warrior: Track 5+ days this week
  - ❤️ BP Champion: Maintain healthy blood pressure
  - 💧 Sugar Master: Maintain healthy glucose levels
  - 🏅 Super Tracker: 14+ readings in a week
- **Progress Tracking**: Visual progress indicators
- **Leaderboard**: Compare your consistency with others (optional)

### 👨‍⚕️ Telehealth Integration
- **Doctor Directory**: Browse doctors by specialty and availability
- **Video Consultations**: Zoom-integrated video calls
- **Phone Consultations**: Direct phone call functionality
- **Real-Time Chat**: Instant messaging with healthcare providers
- **Doctor Management**: Add, edit, and manage doctor profiles

### 🔄 Real-Time Features
- **Live Updates**: Socket.IO powered real-time data synchronization
- **Multi-Device Sync**: Changes reflect instantly across all logged-in devices
- **Online/Offline Indicator**: Connection status monitoring
- **Push Notifications**: Health reminders and alerts

### 🌍 Accessibility
- **Multilingual Support**: English, Spanish, French, German
- **Dark Mode**: Full dark theme support
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **PWA**: Install as a native app on any device
- **Offline Mode**: Access cached data without internet

### 👥 Care Management
- **Caregivers**: Add and manage family members and caregivers
- **Care Plans**: Create and track personalized care plans
- **Medication Requests**: Request prescriptions from providers
- **Device Integration**: Connect health monitoring devices via Bluetooth

### 🤖 AI & Wellness
- **AI Health Coach**: Get personalized health advice
- **Wellness Guide**: Access curated health content
- **Educational Resources**: Learn about cardiovascular health, diabetes, nutrition
- **Exercise Videos**: Guided workout and yoga sessions

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Charts**: Recharts
- **Real-Time**: Socket.IO Client
- **Internationalization**: i18next
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Notifications**: Sonner (Toast)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Cloud)
- **ODM**: Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Real-Time**: Socket.IO
- **File Upload**: Multer
- **Security**: Helmet, CORS
- **Validation**: express-validator

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Environment Variables**: dotenv
- **Date Handling**: date-fns
- **Service Worker**: Workbox (PWA)

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB Atlas Account**: Free tier available
- **Git**: Latest version

### Installation

1. **Clone the Repository**

```bash
(https://github.com/Damian-Sonwa/Health_management_app.git)
cd nuviacare
```

2. **Install Backend Dependencies**

```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuration

### Backend Configuration

1. **Create Environment File**

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# IMPORTANT: Replace with your actual MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority

# JWT Configuration
# IMPORTANT: Generate a secure random string for production
# You can use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

> ⚠️ **Security Warning**: Never commit your `.env` file to version control! The values above are examples only. Replace all placeholder values with your actual credentials.

2. **MongoDB Atlas Setup**

- Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
- Create a new cluster
- Create a database named `healthify_tracker`
- Add your IP address to the IP Whitelist (or allow access from anywhere for development)
- Create a database user with read/write permissions
- Get your connection string and add it to `.env`

3. **Security Best Practices**

⚠️ **Important**: Never commit your `.env` file to version control!

**Before pushing to GitHub, ensure your `.gitignore` includes:**

```gitignore
# Environment Variables
.env
.env.local
.env.production
*.env

# Dependencies
node_modules/

# Build outputs
dist/
build/

# Uploads (may contain sensitive user data)
uploads/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

**Verify no sensitive data is tracked:**
```bash
# Check for accidentally staged .env files
git status

# If .env appears, remove it from tracking
git rm --cached .env
git rm --cached backend/.env
git rm --cached frontend/.env
```

### Frontend Configuration

The frontend uses environment variables for API configuration. Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🏃 Running the Application

### Development Mode

**Option 1: Run Both Servers Separately**

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Option 2: Using PowerShell (Windows)**

```powershell
# Start Backend (in background)
Start-Process powershell -ArgumentList "cd backend; npm start"

# Start Frontend (in background)
Start-Process powershell -ArgumentList "cd frontend; npm run dev"
```

**Option 3: Using Bash (Linux/Mac)**

```bash
# Start Backend in background
cd backend && npm start &

# Start Frontend in background
cd frontend && npm run dev &
```

### Access the Application

Once both servers are running:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

### Production Build

**Build Frontend:**
```bash
cd frontend
npm run build
```

The optimized build will be in `frontend/dist/`

**Deploy Backend:**
```bash
cd backend
NODE_ENV=production npm start
```

---

## 📁 Project Structure

```
nuviacare/
├── backend/                 # Express.js backend
│   ├── config/             # Configuration files
│   │   └── db.js          # MongoDB connection
│   ├── middleware/         # Custom middleware
│   │   └── auth.js        # JWT authentication
│   ├── models/            # Mongoose models
│   │   ├── User.js
│   │   ├── Vital.js
│   │   ├── Medication.js
│   │   ├── Appointment.js
│   │   ├── Device.js
│   │   ├── Doctor.js
│   │   └── Chat.js
│   ├── routes/            # API routes (if separated)
│   ├── utils/             # Utility functions
│   ├── server.js          # Main server file
│   ├── package.json
│   └── .env               # Environment variables (not in repo)
│
├── frontend/              # React + TypeScript frontend
│   ├── public/           # Static assets
│   │   ├── images/       # App images
│   │   ├── favicon.svg
│   │   ├── manifest.json # PWA manifest
│   │   └── sw.js         # Service worker
│   ├── src/
│   │   ├── api/          # API integration
│   │   ├── components/   # React components
│   │   │   ├── ui/       # shadcn/ui components
│   │   │   ├── AuthPage.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── DataVisualization.tsx
│   │   │   └── ...
│   │   ├── hooks/        # Custom React hooks
│   │   │   ├── useVitals.ts
│   │   │   ├── useMedications.ts
│   │   │   ├── useAppointments.ts
│   │   │   ├── useDoctors.ts
│   │   │   ├── useBluetooth.ts  # Bluetooth device integration
│   │   │   └── ...
│   │   ├── utils/        # Utility functions
│   │   │   ├── bluetoothService.ts  # Web Bluetooth API service
│   │   │   └── ...
│   │   ├── i18n/         # Internationalization
│   │   │   ├── config.ts
│   │   │   └── locales/
│   │   │       ├── en.json
│   │   │       ├── es.json
│   │   │       ├── fr.json
│   │   │       └── de.json
│   │   ├── lib/          # Utility libraries
│   │   ├── pages/        # Page components
│   │   ├── utils/        # Utility functions
│   │   ├── App.tsx       # Main app component
│   │   ├── main.tsx      # Entry point
│   │   └── index.css     # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
└── README.md             # This file
```

---

## 🔌 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "YourSecurePassword123!",
  "name": "Jane Smith"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "YourSecurePassword123!"
}
```

> **Note**: These are example values for testing. Replace with your actual credentials.

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Vitals Endpoints

All vitals endpoints require authentication via Bearer token.

#### Get All Vitals (User-Specific)
```http
GET /api/vitals
Authorization: Bearer <token>
```

#### Create Vital
```http
POST /api/vitals
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "Blood Pressure",
  "value": "120/80",
  "unit": "mmHg",
  "notes": "Morning reading"
}
```

**Supported Vital Types:**
- `Blood Pressure` (format: "120/80")
- `Blood Sugar` (format: "95")
- `Heart Rate`
- `Temperature`
- `Oxygen Level`
- `Weight`
- `Height`
- `BMI`
- `Other`

#### Update Vital
```http
PUT /api/vitals/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "value": "118/78",
  "notes": "Updated reading"
}
```

#### Delete Vital
```http
DELETE /api/vitals/:id
Authorization: Bearer <token>
```

### Medications Endpoints

#### Get All Medications
```http
GET /api/medications
Authorization: Bearer <token>
```

#### Create Medication
```http
POST /api/medications
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Lisinopril",
  "dosage": "10mg",
  "frequency": "Once daily",
  "startDate": "2025-01-01",
  "isActive": true,
  "notes": "Take in the morning"
}
```

### Appointments Endpoints

#### Get All Appointments
```http
GET /api/appointments
Authorization: Bearer <token>
```

#### Create Appointment
```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctorName": "Dr. Smith",
  "date": "2025-11-01",
  "time": "10:00 AM",
  "reason": "Annual checkup",
  "location": "Main Clinic",
  "status": "scheduled"
}
```

**Appointment Statuses:**
- `scheduled`
- `confirmed`
- `in_progress`
- `completed`
- `cancelled`
- `no_show`

### Doctors Endpoints (Telehealth)

#### Get All Doctors
```http
GET /api/doctors
Authorization: Bearer <token>
```

#### Create Doctor
```http
POST /api/doctors
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Dr. Jane Smith",
  "specialty": "Cardiology",
  "hospital": "City Hospital",
  "contact": "+1234567890",
  "email": "dr.smith@hospital.com",
  "availableDays": ["Monday", "Wednesday", "Friday"],
  "availableTimes": ["09:00-12:00", "14:00-17:00"],
  "zoomLink": "https://zoom.us/j/123456789",
  "phoneNumber": "+1234567890",
  "chatAvailable": true,
  "isActive": true
}
```

### Health Records Endpoints

#### Upload Health Record
```http
POST /api/health-records
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Lab Results",
  "category": "Lab Report",
  "file": <binary>,
  "notes": "Annual blood work"
}
```

### Device Integration Endpoints

#### Get All Devices
```http
GET /api/devices
Authorization: Bearer <token>
```

#### Create Device
```http
POST /api/devices
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Omron BP Monitor",
  "type": "Blood Pressure Monitor",
  "manufacturer": "Omron",
  "model": "HEM-7120",
  "serialNumber": "ABC123XYZ",
  "status": "connected",
  "batteryLevel": 85
}
```

#### Sync Device Readings (Bluetooth)
```http
POST /api/devices/:id/sync
Authorization: Bearer <token>
Content-Type: application/json

{
  "readingType": "blood_pressure",
  "readings": [
    {
      "systolic": 120,
      "diastolic": 80,
      "pulse": 72,
      "timestamp": "2025-11-05T10:30:00Z"
    }
  ]
}
```

**Reading Types:**
- `blood_pressure`: Requires `systolic`, `diastolic`, optional `pulse`
- `glucose`: Requires `value`, `unit` ("mg/dL" or "mmol/L")

#### Update Device
```http
PUT /api/devices/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "connected",
  "batteryLevel": 90,
  "lastSync": "2025-11-05T10:30:00Z"
}
```

#### Delete Device
```http
DELETE /api/devices/:id
Authorization: Bearer <token>
```

---

## 🔴 Real-Time Features

NuviaCare uses **Socket.IO** for real-time, bidirectional communication between the client and server.

### How It Works

1. **Client Connection**: When you log in, the frontend establishes a Socket.IO connection
2. **Authentication**: The socket connection is authenticated with your JWT token
3. **Data Updates**: When any data changes (vitals, medications, appointments, etc.), all connected clients are notified
4. **Automatic Refresh**: The UI automatically updates without page reload

### Socket Events

**Server → Client:**
- `data-updated`: Triggered when any health data is modified
- `doctor-updated`: Triggered when doctor information changes
- `notification`: Real-time notifications and reminders

**Client → Server:**
- `authenticate`: Send JWT token for authentication
- `join-chat-room`: Join a chat room with a doctor
- `send-chat-message`: Send a message in real-time
- `typing-start/stop`: Typing indicators

### Example Usage

```typescript
// Frontend automatically connects via hooks
useEffect(() => {
  const socket = io('http://localhost:5000', {
    auth: { token: localStorage.getItem('token') }
  });

  socket.on('data-updated', (data) => {
    // Refetch relevant data
    queryClient.invalidateQueries(['vitals']);
  });

  return () => socket.disconnect();
}, []);
```

---

## 🌍 Multilingual Support

NuviaCare supports multiple languages out of the box using **i18next**.

### Supported Languages

- 🇺🇸 English (en)
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)

### Change Language

Users can change the language from the **Settings** page. The language preference is saved to `localStorage` and persists across sessions.

### Add a New Language

1. Create a new translation file in `frontend/src/i18n/locales/`:

```json
// frontend/src/i18n/locales/it.json
{
  "common": {
    "save": "Salva",
    "cancel": "Annulla",
    ...
  },
  ...
}
```

2. Update `frontend/src/i18n/config.ts`:

```typescript
export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' }, // New
];
```

---

## 📱 PWA Features

NuviaCare is a **Progressive Web App**, meaning it can be installed on any device and works offline.

### Installation

**Desktop (Chrome/Edge):**
1. Visit the app in your browser
2. Click the install icon in the address bar
3. Click "Install"

**Mobile (Android/iOS):**
1. Visit the app in your browser
2. Tap the share button
3. Select "Add to Home Screen"

### Offline Capabilities

- Cached assets for faster loading
- Offline page access
- Service worker for background sync
- Push notifications (when enabled)

### Service Worker

The service worker caches:
- All static assets (HTML, CSS, JS)
- Images and fonts
- API responses (with network-first strategy)

---

## 📊 Analytics & Gamification

### Weekly Summary

The **Analytics** page (`/analytics`) automatically calculates your weekly health summary:

- Total readings taken
- Days tracked (out of 7)
- Average blood pressure
- Average blood glucose

### Achievement Badges

Earn badges by maintaining consistency and healthy readings:

| Badge | Requirement | Icon |
|-------|-------------|------|
| 7-Day Streak | Track every day for 7 days | 🔥 |
| 5-Day Warrior | Track 5+ days this week | ⚔️ |
| BP Champion | Maintain healthy BP all week (avg < 130/85) | ❤️ |
| Sugar Master | Maintain healthy glucose all week (avg < 110) | 💧 |
| Super Tracker | Record 14+ readings in a week | 🏅 |

### Data Visualization

Interactive charts show your health trends:

- **Line Chart**: Blood pressure trends (last 7 readings)
- **Bar Chart**: Blood glucose trends (last 7 readings)
- **Pie Chart**: Active vs inactive medications
- **Summary Cards**: Latest readings with dates

All charts update in real-time as you add new data!

---

## 🔒 Security

### Authentication

- JWT-based authentication
- Tokens expire after 7 days
- Refresh tokens (optional, can be implemented)
- Password hashing with bcrypt (10 salt rounds)

### Data Protection

- All API endpoints require authentication
- User data is isolated (can only access your own data)
- CORS protection
- Helmet.js for HTTP headers security
- MongoDB injection protection via Mongoose

### Best Practices

✅ **Do:**
- Use strong passwords (min 6 characters)
- Log out when using shared devices
- Keep your MongoDB URI secret
- Use HTTPS in production
- Regularly update dependencies

❌ **Don't:**
- Share your JWT token
- Commit `.env` files to Git
- Use the same password across services
- Store sensitive data in localStorage without encryption

---

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error

**Error:** `MongoServerSelectionError: getaddrinfo ENOTFOUND`

**Solution:**
- Check your internet connection
- Verify MongoDB URI in `.env`
- Add your IP to MongoDB Atlas whitelist
- Check MongoDB Atlas cluster status

#### 2. Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

#### 3. Authentication Failed

**Error:** `Token verification failed`

**Solution:**
- Clear browser cache and localStorage
- Log out and log in again
- Check that JWT_SECRET matches between backend and token generation

#### 4. CORS Error

**Error:** `Access to fetch blocked by CORS policy`

**Solution:**
- Verify `FRONTEND_URL` in backend `.env`
- Check CORS configuration in `server.js`
- Ensure frontend is running on the correct port

---

## 📱 Bluetooth Device Integration

NuviaCare supports **Web Bluetooth API** for direct connection to compatible health monitoring devices.

### Supported Devices

- **Blood Pressure Monitors**: Bluetooth-enabled BP monitors that support Health Device Profile (HDP)
- **Glucose Meters**: Bluetooth-enabled glucose meters with BLE support

### Browser Compatibility

⚠️ **Important**: Web Bluetooth API is only available in:
- ✅ Chrome (desktop & Android)
- ✅ Edge (Chromium-based)
- ✅ Opera
- ❌ Firefox (not supported)
- ❌ Safari (not supported)

### How to Connect a Device

1. **Navigate to Devices Page**: Go to `/devices` in the app
2. **Click Connect Button**: 
   - Click "Connect BP Monitor" for blood pressure devices
   - Click "Connect Glucose Meter" for glucose devices
3. **Select Device**: Your browser will show available Bluetooth devices
4. **Pair Device**: Select your device and allow pairing
5. **Auto-Sync**: Device is automatically registered and ready to sync readings

### Syncing Readings

1. **Manual Sync**: Click the "Sync" button on a connected device card
2. **Automatic Sync**: Readings are fetched from the device and stored in the database
3. **View Readings**: Synced readings appear in the Vitals Tracking section

### Technical Details

**Bluetooth Service UUIDs:**
- Blood Pressure Service: `00001810-0000-1000-8000-00805f9b34fb`
- Glucose Service: `00001808-0000-1000-8000-00805f9b34fb`

**Data Flow:**
```
Device → Bluetooth Service → React Hook → Backend API → Database
```

**Error Handling:**
- Automatic reconnection attempts (max 3 with exponential backoff)
- Clear error messages for pairing failures
- Timeout handling for data reads
- Graceful disconnection handling

**Data Storage:**
- Readings are stored in both `VitalReading` (structured) and `Vital` (legacy) models
- Device metadata is linked to readings for traceability
- All readings are marked as `recordedBy: 'device'` and `isVerified: true`

### Troubleshooting Bluetooth

**Device Not Found:**
- Ensure device is powered on and in pairing mode
- Check that Bluetooth is enabled on your device
- Try moving the device closer to your computer/phone

**Connection Failed:**
- Verify browser compatibility (Chrome/Edge/Opera)
- Check browser permissions for Bluetooth access
- Ensure device supports BLE (Bluetooth Low Energy)

**Readings Not Syncing:**
- Verify device is still connected (check connection status)
- Try disconnecting and reconnecting the device
- Check browser console for error messages

---

## 📈 Future Enhancements

### Planned Features

- [x] **Bluetooth Device Integration**: Blood pressure and glucose monitors ✅
- [ ] **Integration with Wearables**: Fitbit, Apple Watch, Garmin
- [ ] **PDF Report Generation**: Export health data as PDF
- [ ] **Email Notifications**: Medication reminders via email
- [ ] **Family Sharing**: Share health data with family members
- [ ] **Voice Commands**: Alexa/Google Assistant integration
- [ ] **Machine Learning**: Predictive health analytics
- [ ] **Stripe Integration**: Premium subscription payments
- [ ] **Video Consultations**: Built-in video calling (not just Zoom links)
- [ ] **Prescription Management**: E-prescriptions and refill requests
- [ ] **Insurance Integration**: Submit claims electronically

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit Your Changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the Branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

---

## 📞 Support

Need help? Have questions?

- **GitHub Issues**: [Create an issue](https://github.com/yourusername/nuviacare/issues)
- **Email**: your-email@example.com (Replace with your contact email)
- **Documentation**: Check the README and inline code comments

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 NuviaCare

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful UI components
- **Radix UI** for accessible component primitives
- **Recharts** for powerful data visualization
- **MongoDB Atlas** for reliable cloud database hosting
- **Socket.IO** for real-time communication
- **Vite** for lightning-fast development experience
- **React Query** for seamless data synchronization
- **Tailwind CSS** for utility-first styling
- **The Open Source Community** for continuous inspiration

---

## 🌟 Star History

If you find NuviaCare helpful, please consider giving it a ⭐ on GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/nuviacare&type=Date)](https://star-history.com/#yourusername/nuviacare&Date)

---

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Analytics
![Analytics](docs/screenshots/analytics.png)

### Telehealth
![Telehealth](docs/screenshots/telehealth.png)

### Mobile View
![Mobile](docs/screenshots/mobile.png)

---

## 🔗 Quick Links

- [GitHub Repository](https://github.com/yourusername/nuviacare)
- [Issues & Bug Reports](https://github.com/yourusername/nuviacare/issues)
- [Pull Requests](https://github.com/yourusername/nuviacare/pulls)

---

<div align="center">

**Made with ❤️ for Better Health Management**

⭐ Star this repo if you find it helpful!




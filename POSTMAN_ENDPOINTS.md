# Healthcare API - POSTMAN Testing Guide

## 🚀 Base URL
```
http://localhost:5001/api
```

---

## 🔐 Authentication Endpoints

### 1. Register New User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "5551234567"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "5551234567",
    "role": "patient"
  },
  "message": "User registered successfully"
}
```

**Error Response (400 - User Exists):**
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

---

### 2. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "madudamian25@gmail.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Damian Madu",
    "email": "madudamian25@gmail.com",
    "phone": null,
    "role": "patient"
  }
}
```

---

### 3. Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Damian Madu",
    "email": "madudamian25@gmail.com",
    "role": "patient",
    "createdAt": "2025-10-21T..."
  }
}
```

---

## 👥 User Endpoints

### 4. Get All Users
**GET** `/users`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "users": [
    {
      "id": "...",
      "name": "Damian Madu",
      "email": "madudamian25@gmail.com",
      "role": "patient",
      "createdAt": "2025-10-21T..."
    }
  ],
  "count": 3
}
```

---

### 5. Get User Profile
**GET** `/users/profile`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "Damian Madu",
    "email": "madudamian25@gmail.com",
    "phone": "5551234567",
    "profile": {...}
  }
}
```

---

### 6. Update User Profile
**PUT** `/users/profile`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "5559876543",
  "profile": {
    "bio": "Healthcare professional",
    "avatar": "https://..."
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {...},
  "message": "Profile updated successfully"
}
```

---

## 💉 Vitals Endpoints

### 7. Get All Vitals
**GET** `/vitals`

**Headers:**
```
Authorization: Bearer <your_token>
```

### 8. Create Vital
**POST** `/vitals`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Request Body:**
```json
{
  "type": "Blood Pressure",
  "value": "120/80",
  "unit": "mmHg",
  "notes": "Morning reading"
}
```

### 9. Update Vital
**PUT** `/vitals/:id`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Request Body:**
```json
{
  "type": "Blood Pressure",
  "value": "118/78",
  "unit": "mmHg",
  "notes": "Updated reading"
}
```

### 10. Delete Vital
**DELETE** `/vitals/:id`

**Headers:**
```
Authorization: Bearer <your_token>
```

---

## 💊 Medications Endpoints

### 11. Get All Medications
**GET** `/medications`

**Headers:**
```
Authorization: Bearer <your_token>
```

### 12. Create Medication
**POST** `/medications`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Request Body:**
```json
{
  "name": "Aspirin",
  "dosage": "100mg",
  "frequency": "Once daily",
  "startDate": "2025-10-21",
  "notes": "Take with food"
}
```

### 13. Update Medication
**PUT** `/medications/:id`

### 14. Delete Medication
**DELETE** `/medications/:id`

---

## 📅 Appointments Endpoints

### 15. Get All Appointments
**GET** `/appointments`

**Headers:**
```
Authorization: Bearer <your_token>
```

### 16. Create Appointment
**POST** `/appointments`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Request Body:**
```json
{
  "title": "Annual Checkup",
  "doctorName": "Dr. Smith",
  "date": "2025-11-01",
  "time": "10:00",
  "type": "Checkup",
  "status": "scheduled",
  "notes": "Bring previous test results"
}
```

### 17. Update Appointment
**PUT** `/appointments/:id`

### 18. Delete Appointment
**DELETE** `/appointments/:id`

---

## 📱 Devices Endpoints

### 19. Get All Devices
**GET** `/devices`

**Headers:**
```
Authorization: Bearer <your_token>
```

### 20. Connect Device
**POST** `/devices`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Request Body:**
```json
{
  "name": "Fitbit Charge 5",
  "type": "fitness_tracker",
  "model": "Charge 5",
  "manufacturer": "Fitbit",
  "status": "connected"
}
```

### 21. Update Device
**PUT** `/devices/:id`

### 22. Delete Device
**DELETE** `/devices/:id`

---

## 📊 Dashboard Endpoints

### 23. Get Dashboard Stats
**GET** `/dashboard/stats`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "vitalsCount": 15,
    "medicationsCount": 5,
    "recentVitals": [...]
  }
}
```

---

## ⚠️ Common Errors

### 400 Bad Request
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Route not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server error"
}
```

---

## 🔑 How to Use in POSTMAN

1. **Register a new user** using `/auth/register`
2. **Copy the token** from the response
3. **For all protected endpoints:**
   - Go to Headers tab
   - Add: `Authorization: Bearer YOUR_TOKEN_HERE`
4. **Test any endpoint** you need!

---

## ✅ Fixed Issues

1. ✅ **Registration**: Now working with proper validation
2. ✅ **GET /api/users**: Added new endpoint (requires auth)
3. ✅ **Better error messages**: More descriptive errors
4. ✅ **Proper logging**: Backend logs all requests

---

*Last Updated: 2025-10-21*


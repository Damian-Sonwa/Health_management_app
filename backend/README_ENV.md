# Environment Variables Setup

## Security Notice
⚠️ **NEVER commit `.env` files to version control!** The `.env` file contains sensitive credentials and is already excluded via `.gitignore`.

## Setup Instructions

1. **Copy the example file:**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Edit `backend/.env` with your actual values:**
   - Replace `your_mongodb_connection_string_here` with your MongoDB URI
   - Replace `your_jwt_secret_key_here` with a secure random string
   - Update the test user credentials if needed

## Test User Credentials

The following environment variables are used by `backend/scripts/updateUserRoles.js` to create/update test users with specific roles:

- `PHARMACY_EMAIL` - Email for pharmacy role user
- `PHARMACY_PASSWORD` - Password for pharmacy role user
- `PHARMACY_NAME` - Display name for pharmacy user

- `ADMIN_EMAIL` - Email for admin role user
- `ADMIN_PASSWORD` - Password for admin role user
- `ADMIN_NAME` - Display name for admin user

- `DOCTOR_EMAIL` - Email for doctor role user
- `DOCTOR_PASSWORD` - Password for doctor role user
- `DOCTOR_NAME` - Display name for doctor user

## Default Values

If environment variables are not set, the script will use these defaults:
- Pharmacy: `pharmacy@healthapp.com` / `Pharmacy123!`
- Admin: `admin@healthapp.com` / `Admin123!`
- Doctor: `doctor@healthapp.com` / `Doctor123!`

## Running the User Role Update Script

```bash
cd backend
node scripts/updateUserRoles.js
```

The script will:
1. Connect to MongoDB using `MONGODB_URI`
2. Create or update users with the credentials from `.env`
3. Set appropriate roles (pharmacy, admin, doctor)

## Security Best Practices

1. ✅ Use strong, unique passwords for each role
2. ✅ Change default passwords in production
3. ✅ Never share `.env` files
4. ✅ Use different credentials for development and production
5. ✅ Rotate passwords regularly


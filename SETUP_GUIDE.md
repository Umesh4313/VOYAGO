# VOYAGO - Quick Setup Guide

Follow these steps to get VOYAGO up and running on your Windows machine.

## ✅ Step 1: Verify Prerequisites

### Check Node.js Installation
```powershell
node --version
# Should show v18.x.x or higher
```

### Check Java Installation
```powershell
java -version
# Should show Java 17 or higher
```

### Check Maven Installation
```powershell
mvn --version
# Should show Maven 3.8.x or higher
```

### Check MongoDB Installation
```powershell
mongod --version
# Should show MongoDB 6.x or higher
```

If any of these are missing, install them from:
- **Node.js**: https://nodejs.org/
- **Java 17**: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
- **Maven**: https://maven.apache.org/download.cgi
- **MongoDB**: https://www.mongodb.com/try/download/community

## ✅ Step 2: Start MongoDB

Open PowerShell as Administrator and run:

```powershell
# Option 1: Start MongoDB as a Windows service
net start MongoDB

# Option 2: Start MongoDB manually (if not installed as service)
mongod --dbpath="C:\data\db"
```

Verify MongoDB is running:
```powershell
# Try connecting using MongoDB shell
mongosh
# or
mongo
```

## ✅ Step 3: Install Dependencies

Open PowerShell in the project root (`c:\Users\MANISH\Desktop\sem5 pro`):

```powershell
# Install frontend dependencies
npm install
```

Backend dependencies will be downloaded automatically when you first run the backend.

## ✅ Step 4: Configure Environment

The `.env` file has already been created with the correct settings:
```
VITE_API_URL=http://localhost:8080/api
```

No changes needed unless you want to use different ports.

## ✅ Step 5: Start the Application

### Option A: Start Everything at Once (Easiest)

```powershell
.\start-dev.ps1
```

This will open two windows:
1. Backend server (Spring Boot)
2. Frontend server (React + Vite)

### Option B: Start Separately

**Terminal 1 - Start Backend:**
```powershell
.\start-backend.ps1
```
Wait for the message: `Started VoyagoApplication in X.XXX seconds`

**Terminal 2 - Start Frontend:**
```powershell
.\start-frontend.ps1
```
Wait for the message: `Local: http://localhost:3000/`

## ✅ Step 6: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## ✅ Step 7: Login with Default Admin Account

Use these credentials to login:
- **Email**: `admin@voyago.com`
- **Password**: `admin123`

Or create a new customer account by clicking "Sign Up".

## 🎉 You're All Set!

Your VOYAGO application is now running with:
- ✅ Frontend on `http://localhost:3000`
- ✅ Backend API on `http://localhost:8080/api`
- ✅ MongoDB on `mongodb://localhost:27017/voyago`

## 🔍 Verify Everything is Working

1. **Test Backend**: Open http://localhost:8080/api/destinations
   - Should return JSON with destinations list

2. **Test Frontend**: Open http://localhost:3000
   - Should see the VOYAGO homepage

3. **Test Login**: Login with admin credentials
   - Should redirect to dashboard after successful login

## 🛑 Stopping the Application

To stop the servers:
1. Go to each PowerShell window
2. Press `Ctrl + C`
3. Confirm with `Y` when asked

## ❓ Troubleshooting

### MongoDB Not Starting
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Fix**: Start MongoDB with `net start MongoDB` or `mongod`

### Port Already in Use
```
Error: Port 8080 is already in use
```
**Fix**: 
```powershell
# Find process using port 8080
netstat -ano | findstr :8080
# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Backend Build Failed
```
Error: Cannot resolve dependencies
```
**Fix**:
```powershell
cd backend
mvn clean install -U
```

### Frontend Build Failed
```
Error: Cannot find module
```
**Fix**:
```powershell
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

### CORS Error in Browser
```
Access to XMLHttpRequest blocked by CORS policy
```
**Fix**: Ensure backend is running and check `application.properties` has your frontend URL

## 📚 Next Steps

1. Read the [main README.md](README.md) for detailed documentation
2. Read [backend/README.md](backend/README.md) for API documentation
3. Explore the codebase structure
4. Try creating a test booking

## 💡 Development Tips

### Hot Reload
- Frontend: Changes auto-reload in browser
- Backend: Requires restart (stop with Ctrl+C and run again)

### View Logs
- Frontend: Check browser console (F12)
- Backend: Check PowerShell window running backend

### Database Inspection
```powershell
# Connect to MongoDB
mongosh

# Switch to voyago database
use voyago

# View collections
show collections

# Query users
db.users.find().pretty()

# Query bookings
db.bookings.find().pretty()
```

## 🚀 Ready to Develop!

Start making changes:
- **Frontend**: Edit files in `src/` folder
- **Backend**: Edit files in `backend/src/main/java/com/voyago/`
- Changes will be reflected after saving (frontend) or restarting (backend)

Happy coding! 🎉

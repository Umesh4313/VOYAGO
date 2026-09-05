# IMPORTANT SETUP NOTES

## ✅ Current Status

### Frontend: ✓ RUNNING
- **Status**: Successfully running
- **URL**: http://localhost:3000
- **Port**: 3000
- **Framework**: React + Vite + TypeScript

### Backend: ❌ NEEDS MONGODB
- **Status**: Compilation successful but needs MongoDB to run
- **Port**: 8080 (when running)
- **Framework**: Spring Boot + MongoDB

### MongoDB: ❌ NOT INSTALLED
- **Status**: Not detected on system
- MongoDB is required for the backend to work

---

## 🔧 What You Need to Do

### 1. Install MongoDB (REQUIRED)

**Download MongoDB Community Server:**
- Go to: https://www.mongodb.com/try/download/community
- Select: Windows x64, MSI installer
- Install with default settings
- During installation, select "Install MongoDB as a Service"

**After Installation:**
```powershell
# Start MongoDB service
net start MongoDB

# Verify it's running
mongosh
# OR
mongo
```

### 2. Start the Backend

Once MongoDB is installed and running:

```powershell
# Option 1: Use the script
.\start-backend.ps1

# Option 2: Manual
cd backend
mvn spring-boot:run
```

Wait for the message:
```
Started VoyagoApplication in X.XXX seconds
```

### 3. Access the Application

**Frontend** (Already Running):
- http://localhost:3000

**Backend** (After you start it):
- http://localhost:8080/api

---

## 🎯 Quick Start (After Installing MongoDB)

```powershell
# Terminal 1 - Start MongoDB (if not running as service)
mongod

# Terminal 2 - Start Backend
cd "c:\Users\MANISH\Desktop\sem5 pro\backend"
mvn spring-boot:run

# Terminal 3 - Frontend is already running!
# Just go to http://localhost:3000
```

---

## 🔐 Default Login Credentials

Once everything is running:

- **Email**: `admin@voyago.com`
- **Password**: `admin123`

---

## 🐛 Alternative: Run Without Installing MongoDB Globally

If you don't want to install MongoDB as a system service, you can:

### Option A: Use MongoDB Docker (if you have Docker)
```powershell
docker run -d -p 27017:27017 --name voyago-mongo mongo:latest
```

### Option B: Portable MongoDB
1. Download MongoDB ZIP (not installer)
2. Extract to a folder like `C:\mongodb`
3. Create data directory: `C:\mongodb\data`
4. Run:
```powershell
C:\mongodb\bin\mongod.exe --dbpath=C:\mongodb\data
```

---

## ✅ Verification Steps

Once all three components are running:

1. **Check MongoDB**:
   ```powershell
   mongosh
   # Should connect successfully
   ```

2. **Check Backend**:
   ```powershell
   curl http://localhost:8080/api/destinations
   # Should return JSON data
   ```

3. **Check Frontend**:
   - Open browser to http://localhost:3000
   - Should see VOY AGO homepage
   - Try registering or logging in

---

## 📚 Additional Resources

- **MongoDB Installation**: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
- **MongoDB Compass** (GUI tool): https://www.mongodb.com/products/compass
- **Troubleshooting**: See SETUP_GUIDE.md

---

## 🎉 Summary

**Current State:**
- ✅ Frontend is running and ready
- ✅ Backend code is complete
- ❌ MongoDB needs to be installed

**Next Step:**
1. Install MongoDB
2. Start MongoDB service
3. Run `.\start-backend.ps1`
4. Access http://localhost:3000

That's it! You're almost there! 🚀
